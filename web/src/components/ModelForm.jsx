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

import {
  Button,
  Form,
  TextField,
  Label,
  Input,
  Select,
  TextArea,
} from "react-aria-components";

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
  const [formError, setFormError] = useState("");
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
    const fetchRelationOptions = async () => {
      if (!meta?.fields) return;

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
          const res = await authFetch(endpoint);
          const data = Array.isArray(res) ? res : res.data || [];

          // Ensure data is an array before mapping
          const options = data.map((item) => ({
                value: item.id,
                label: item.name || item.title || item.email || item.id,
              }));
          return { field: field.name, options };
        } catch (error) {
          console.error(`⚠️ Failed to load options for ${field.name}:`, error);
          setFormError(
            `⚠️ Failed to load ${field.relation.to}: ${error.message}`,
          );
          return { field: field.name, options: [] };
        }
      });

      const allOptions = await Promise.all(optionsPromises);
      const optionsMap = allOptions.reduce((acc, { field, options }) => {
        acc[field] = options;
        return acc;
      }, {});

      setRelationOptions(optionsMap);
    };

    fetchRelationOptions();
  }, [meta]);

  // --- RENDER LOGIC ---

  const formFields = meta.fields.filter(
    (field) => !isFieldHidden(field, uiConfig),
  );

  // EDIT: submit handler (Create/Update is decided by presence of initialData.id)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormError("");

    // Mark all fields as touched
    touchAllFields(formFields);

    // Validate form
    const { isValid, errors } = validateForm(formData, formFields);

    if (!isValid) {
      setLoading(false);
      setFormError("Please correct the errors below");
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
      setFormError(error?.message || "⚠️ Failed to submit form");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (fieldName, value, field) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));

    // Validate on change if field was touched
    if (touchedFields[fieldName]) {
      const error = validateField(field, value);
      updateFieldError(fieldName, error);
    }
  };
  const handleBlur = (field) => {
    touchField(field.name);
    const error = validateField(field, formData[field.name]);
    updateFieldError(field.name, error);
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

    setFormError("");
    setFormData(initialData ?? {}); // critical: reset to passed defaults, not {}
    onCancel?.(); // let container route back / close dialog
  };

  const renderField = (field) => {
    const inputType = uiConfig[field.name]?.widget || getInputType(field);
    const label = getFieldLabel(field, uiConfig);
    const required = isFieldRequired(field);
    const value = formData[field.name] ?? "";
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

    // DIVINE REALIZATION - appearance: none resets <select> to look same-ish across browsers + use tailwindcss-forms (D'oh!)
    // Handle relation fields (dropdowns)
    if (field.kind === "object" && !field.isList) {
      const options = relationOptions[field.name] || [];

      // Generic foreign key field name mapping
      const foreignKeyFieldName = field.name.endsWith("Id")
        ? field.name
        : `${field.name}Id`;

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
            value={formData[foreignKeyFieldName] || ""}
            onChange={(e) => handleChange(foreignKeyFieldName, e.target.value)}
            onBlur={() => handleBlur(field)}
            className={`not-dark:shadow-sm block min-w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 hover:border-gray-400 hover:outline-gray-400 focus:border-blue-600 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6 sm:leading-6 dark:border-neutral-700/50 dark:bg-neutral-800/50 dark:text-white dark:outline-neutral-700/50 dark:placeholder:text-gray-500 dark:hover:border-neutral-600 dark:hover:outline-neutral-600 ${
              touched && error
                ? "ring-red-500 focus:ring-red-500"
                : "ring-gray-300 focus:ring-blue-600 dark:ring-gray-700"
            }`}
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
            onChange={(e) => handleChange(field.name, e.target.value)}
            onBlur={() => handleBlur(field)}
            className={`not-dark:shadow-sm block min-w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 hover:border-gray-400 hover:outline-gray-400 focus:border-blue-600 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6 dark:border-white/10 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:outline-blue-500 ${
              touched && error
                ? "ring-red-500 focus:ring-red-500"
                : "ring-gray-300 focus:ring-blue-600 dark:ring-gray-700"
            }`}
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
        <label
          key={field.name}
          className="mb-4 flex items-center gap-2"
          htmlFor={field.name}
        >
          <input
            id={field.name}
            type="checkbox"
            name={field.name}
            checked={Boolean(value)}
            onChange={(e) => handleChange(field.name, e.target.checked)}
          />
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {label}
          </span>
        </label>
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
            onChange={(e) => handleChange(field.name, e.target.value)}
            onBlur={() => handleBlur(field)}
            rows={4}
            className={`not-dark:shadow-sm block min-w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 hover:border-gray-400 hover:outline-gray-400 focus:border-blue-600 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6 dark:border-white/10 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:outline-blue-500 ${
              touched && error
                ? "ring-red-500 focus:ring-red-500"
                : "ring-gray-300 focus:ring-blue-600 dark:ring-gray-700"
            }`}
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
            field.name,
            inputType === "number"
              ? Number(e.target.value) || ""
              : e.target.value,
            field,
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
      {/* Form error notification, TODO: move to toast */}
      {formError && (
        <div className="mb-4 border border-red-300 bg-red-200 p-3 text-red-600">
          {formError}
        </div>
      )}

      <Form
        onSubmit={handleSubmit}
        className="not-dark:shadow grid grid-cols-1 gap-4 rounded-lg border border-gray-300 bg-white px-6 py-4 sm:grid-cols-2 dark:border-neutral-700/50 dark:bg-neutral-800/50"
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
                : "bg-blue-600 text-white hover:bg-blue-500"
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
