import { useState, useEffect } from "react";
import {
  getInputType,
  getFieldLabel,
  isFieldHidden,
  // isFieldRequired,
} from "../lib/fieldMapping";
import { authFetch } from "../lib/api";
import { useFormValidation } from "../lib/useFormValidation";
import ValidatedFormField from "./ValidatedFormField";
import PhotoUpload from "./PhotoUpload";
import DateRangePicker from "./DateRangePicker";
import { toast } from "../lib/toast";

import {
  Button,
  Checkbox,
  Form,
  Label,
  TextArea,
} from "react-aria-components";
import { inputClasses } from "../lib/formStyles";
import { getFieldValueKey } from "../lib/formFieldKeys";
import { normalizeInputValue } from "../lib/formFieldValues";

export default function ModelForm({
  meta,
  initialData = {},
  onSubmit,
  onCancel,
  uiConfig = {},
}) {
  const [formData, setFormData] = useState(initialData);
  const [relationOptions, setRelationOptions] = useState({});
  const [loading, setLoading] = useState(false);
  const [pendingPhotoFile, setPendingPhotoFile] = useState(null);

  // Initialize validation hook
  const {
    fieldErrors,
    touchedFields,
    validateField,
    validateForm,
    touchField,
    touchAllFields,
    resetValidation,
    updateFieldError,
    isFieldRequired,
  } = useFormValidation(meta, uiConfig);

  // Effect 1: Log metadata analysis when meta changes
  useEffect(() => {
    if (!meta?.fields) return;

    console.log(`📋 Form metadata loaded for: ${meta.name}`);
    const hiddenFields = [],
      visibleFields = [],
      relationFields = [];

    meta.fields.forEach((field) => {
      if (isFieldHidden(field, uiConfig)) {
        hiddenFields.push(field.name);
        if (field.kind === "object" && field.isList) {
          console.log(
            `🙈 Hiding reverse relation: ${field.name} (${field.type}[])`,
          );
        }
      } else {
        visibleFields.push(field.name);
        if (field.kind === "object" && !field.isList) {
          relationFields.push(`${field.name} -> ${field.relation?.to}`);
        }
      }
    });

    console.log(`✅ Visible fields:`, visibleFields);
    console.log(`❌ Hidden fields:`, hiddenFields);
    if (relationFields.length > 0) {
      console.log(`🔗 Relations to load:`, relationFields);
    }
  }, [meta, uiConfig]);

  // Effect 2: Reset form when initial data changes
  useEffect(() => {
    // setFormData(initialData);
    setFormData(initialData ?? {});
    resetValidation();
  }, [initialData, resetValidation]);

  // Effect 3: Load data for relation dropdowns when meta changes
  useEffect(() => {
    if (!meta?.fields) return;

    const controller = new AbortController();
    const { signal } = controller;

    const fetchRelationOptions = async () => {
      const relationFields = meta.fields.filter(
        (field) => field.kind === "object" && !field.isList && field.relation,
      );

      const endpointMap = {
        Asset: "assets",
        Warehouse: "warehouses",
        AssetCategory: "assetCategories",
        User: "users",
        Event: "events",
        EventLocation: "eventLocations",
      };

      const optionsPromises = relationFields.map(async (field) => {
        const endpoint = endpointMap[field.relation.to];
        if (!endpoint) {
          console.warn(
            `⚠️ No endpoint mapping for relation: ${field.name} -> ${field.relation.to}`,
          );
          return { field: field.name, options: [] };
        }

        try {
          const res = await authFetch(endpoint, { signal });
          const data = Array.isArray(res) ? res : res.data || [];

          // Ensure data is an array before mapping
          const options = data.map((item) => ({
                value: item.id,
                label: item.name || item.title || item.email || item.id,
              }));
          return { field: field.name, options };
        } catch (error) {
          if (error.name === "AbortError") return { field: field.name, options: [] };
          console.error(`⚠️ Failed to load options for ${field.name}:`, error);
          toast.error(`Failed to load ${field.relation.to}: ${error.message}`);
          return { field: field.name, options: [] };
        }
      });

      const allOptions = await Promise.all(optionsPromises);
      if (signal.aborted) return;
      const optionsMap = allOptions.reduce((acc, { field, options }) => {
        acc[field] = options;
        return acc;
      }, {});

      setRelationOptions(optionsMap);
    };

    fetchRelationOptions();

    return () => controller.abort();
  }, [meta]);

  // --- RENDER LOGIC ---

  const formFields = meta.fields.filter(
    (field) =>
      !isFieldHidden(field, uiConfig) && !uiConfig[field.name]?.pairedWith,
  );

  // EDIT: submit handler (Create/Update is decided by presence of initialData.id)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Mark all fields as touched
    touchAllFields(formFields);

    // Validate form
    const { isValid, errors } = validateForm(formData, formFields);

    if (!isValid) {
      setLoading(false);
      toast.warning("Please correct the errors below");
      console.log("❌ Form validation failed:", errors);

      // Focus first invalid field
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        document.getElementById(firstErrorField)?.focus();
      }

      return;
    }

    console.log("🚀 About to submit form ", formData);

    try {
      await onSubmit(formData, { pendingPhotoFile });
      setPendingPhotoFile(null);
      resetValidation();
    } catch (error) {
      toast.error(error?.message || "Failed to submit form");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    const valueKey = getFieldValueKey(field);
    const stateKey = field.name;

    setFormData((prev) => ({ ...prev, [valueKey]: value }));

    // Validate on change if field was touched
    if (touchedFields[stateKey]) {
      const error = validateField(field, value);
      updateFieldError(stateKey, error);
    }
  };

  const handleBlur = (field) => {
    const valueKey = getFieldValueKey(field);
    const stateKey = field.name;

    touchField(stateKey);
    const error = validateField(field, formData[valueKey]);
    updateFieldError(stateKey, error);
  };

  // CANCEL: check for unsaved changes, then restore original initialData and notify parent
  const handleCancel = () => {
    // Dirty check: compare current formData against initialData
    const isDirty = Object.keys(formData).some((key) => {
      const current = formData[key] ?? "";
      const original = initialData[key] ?? "";
      return current !== original;
    });

    if (isDirty) {
      if (!confirm("You have unsaved changes. Discard them?")) return;
    }

    setFormData(initialData ?? {}); // critical: reset to passed defaults, not {}
    onCancel?.(); // let container route back / close dialog
  };

  const renderField = (field) => {
    const inputType = uiConfig[field.name]?.widget || getInputType(field);
    const label = getFieldLabel(field, uiConfig);
    const required = isFieldRequired(field);
    const valueKey = getFieldValueKey(field);
    const value = formData[valueKey] ?? "";
    const error = fieldErrors[field.name];
    const touched = touchedFields[field.name];

    // Special handling for photo upload field / widget for Asset.photoUrl
    if (uiConfig[field.name]?.widget === "photo" || field.name === "photoUrl") {
      return (
        <div key={field.name}>
          <Label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            {label}
          </Label>
          <PhotoUpload
            assetId={initialData?.id}
            initialFilename={formData[field.name] || null}
            onUploaded={({ asset }) => {
              const next = asset?.[field.name] ?? asset?.photoUrl;
              if (next) setFormData((p) => ({ ...p, [field.name]: next }));
            }}
            onPendingFile={(file) => {
              setPendingPhotoFile(file);
            }}
            onDeleted={() => setFormData((p) => ({ ...p, [field.name]: null }))}
          />
        </div>
      );
    }

    // Date range picker widget (e.g. Event startsAt + endsAt)
    if (uiConfig[field.name]?.widget === "dateRangePicker") {
      const rangeEndField = uiConfig[field.name].rangeEnd;
      const rangeEndMetaField = meta.fields.find((f) => f.name === rangeEndField);
      const fieldLabel = `${getFieldLabel(field, uiConfig)} / ${getFieldLabel({ name: rangeEndField }, uiConfig)}`;
      return (
        <DateRangePicker
          key={field.name}
          id={field.name}
          label={fieldLabel}
          startValue={formData[field.name] || ""}
          endValue={formData[rangeEndField] || ""}
          onChangeStart={(v) => handleChange(field, v)}
          onChangeEnd={(v) =>
            rangeEndMetaField
              ? handleChange(rangeEndMetaField, v)
              : setFormData((prev) => ({ ...prev, [rangeEndField]: v }))
          }
          onBlur={() => handleBlur(field)}
          required={required}
          error={error}
          touched={touched}
        />
      );
    }

    // Handle relation fields (dropdowns)
    if (field.kind === "object" && !field.isList) {
      const options = relationOptions[field.name] || [];

      return (
        <Label
          key={field.name}
          htmlFor={field.name}
          className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
        >
          {label} {required && <span className="ml-1 text-red-600">*</span>}
          <select
            id={field.name}
            required={required}
            value={value}
            onChange={(e) => handleChange(field, e.target.value)}
            onBlur={() => handleBlur(field)}
            className={inputClasses(touched && error)}
          >
            <option value="">Select...</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {touched && error && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </Label>
      );
    }

    // Enum select (non-relational aka predefined in database)
    if (inputType === "select" && field.enumValues?.length) {
      return (
        <Label
          key={field.name}
          htmlFor={field.name}
          className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100"
        >
          {label} {required && <span className="text-red-600">*</span>}
          <select
            id={field.name}
            required={required}
            value={value}
            onChange={(e) => handleChange(field, e.target.value)}
            onBlur={() => handleBlur(field)}
            className={inputClasses(touched && error)}
          >
            <option value="">Choose...</option>
            {field.enumValues.map((val) => (
              <option key={val} value={val}>
                {val}
              </option>
            ))}
          </select>
          {touched && error && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </Label>
      );
    }

    // Checkbox for booleans
    if (inputType === "checkbox") {
      return (
        <Checkbox
          key={field.name}
          isSelected={Boolean(value)}
          onChange={(checked) => handleChange(field, checked)}
          className="group mb-4 flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          <div className="flex size-4 items-center justify-center rounded border border-gray-300 bg-white group-data-[selected]:border-blue-600 group-data-[selected]:bg-blue-600 group-data-[focus-visible]:outline-2 group-data-[focus-visible]:-outline-offset-2 group-data-[focus-visible]:outline-blue-600 dark:border-neutral-700/50 dark:bg-neutral-800/50 dark:group-data-[selected]:border-blue-600 dark:group-data-[selected]:bg-blue-600">
            <svg
              className="hidden size-3 text-white group-data-[selected]:block"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 8l3 3 5-7"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          {label}
        </Checkbox>
      );
    }

    // Textarea for large text (e.g. Notes)
    if (inputType === "textarea") {
      return (
        <Label
          key={field.name}
          htmlFor={label}
          className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100"
        >
          {label} {required && <span style={{ color: "red" }}>*</span>}
          <TextArea
            id={field.name}
            required={required}
            value={value}
            onChange={(e) => handleChange(field, e.target.value)}
            onBlur={() => handleBlur(field)}
            rows={4}
            className={inputClasses(touched && error)}
          />
          {touched && error && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </Label>
      );
    }

    // Default input
    return (
      <ValidatedFormField
        key={field.name}
        id={field.name}
        label={label}
        type={inputType}
        required={required}
        value={inputType === "datetime-local" && value ? String(value).slice(0, 16) : value}
        onChange={(e) =>
          handleChange(
            field,
            normalizeInputValue(inputType, e.target.value),
          )
        }
        onBlur={() => handleBlur(field)}
        error={error}
        touched={touched}
      />
    );
  };

  return (
    <>
      <Form
        onSubmit={handleSubmit}
        className="not-dark:shadow grid grid-cols-1 gap-4 rounded-xl border border-gray-300 bg-white px-6 py-4 sm:grid-cols-2 dark:border-neutral-700/50 dark:bg-neutral-800/50"
      >
        {formFields.map(renderField)}
        <div className="col-span-full mt-4 inline-flex">
          <Button
            type="submit"
            disabled={loading}
            isDisabled={loading}
            className={`shadow-2xs focus:outline-hidden -ms-px inline-flex items-center gap-x-2 border border-blue-600 px-4 py-3 text-sm font-medium text-gray-800 first:ms-0 first:rounded-s-lg last:rounded-e-lg hover:cursor-pointer focus:z-10 focus:bg-blue-800 disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-gray-500 disabled:bg-gray-600 disabled:text-gray-300 disabled:opacity-50 ${
              loading
                ? "cursor-not-allowed bg-gray-300 text-gray-500"
                : "bg-blue-600 text-white shadow-glow shadow-blue-600/50 hover:bg-blue-500"
            }`}
          >
            {loading ? "Saving..." : initialData.id ? "Update" : "Create"}
          </Button>
          {onCancel && (
            <Button
              type="button"
              onClick={handleCancel}
              className="shadow-2xs focus:outline-hidden -ms-px inline-flex items-center gap-x-2 border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-600 first:ms-0 first:rounded-s-lg last:rounded-e-lg hover:cursor-pointer hover:bg-gray-50 hover:text-gray-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              Cancel
            </Button>
          )}
        </div>
      </Form>
    </>
  );
}
