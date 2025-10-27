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
        Warehouse: "warehouses",
        AssetCategory: "assetCategories",
        User: "users",
        Event: "events",
        EventLocation: "eventLocations",
        // Add more mappings as needed
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
          const data = await authFetch(endpoint);

          // Ensure data is an array before mapping
          const options = Array.isArray(data)
            ? data.map((item) => ({
                value: item.id,
                label: item.name || item.title || item.email || item.id,
              }))
            : [];
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

  // CANCEL: restore original initialData and notify parent to exit Edit mode
  const handleCancel = () => {
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
      // if (uiConfig[field.name]?.widget === "photo") {
      return (
        <div key={field.name} className="mb-4">
          <Label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            {label}
          </Label>
          <PhotoUpload
            assetId={initialData?.id}
            // currentPhotoUrl={formData.photoUrl}
            // initialFilename={formData.photoUrl || null}
            initialFilename={formData[field.name] || null}
            onUploaded={({ asset }) => {
              // when edited, server returns updated asset with filename
              // if (asset?.photoUrl) {
              //   setFormData((p) => ({ ...p, photoUrl: asset.photoUrl }));
              // }
              // Use returned asset or reply payload to update the same field
              const next = asset?.[field.name] ?? asset?.photoUrl;
              if (next) setFormData((p) => ({ ...p, [field.name]: next }));
            }}
            onPendingFile={(file) => {
              setPendingPhotoFile(file);
            }}
            // onDeleted={() => setFormData((p) => ({ ...p, photoUrl: null }))}
            onDeleted={() => setFormData((p) => ({ ...p, [field.name]: null }))}

            // onPhotoUploaded={(data) => {
            //   console.log("Photo uploaded:", data);
            //   // Reload data or update form state if needed
            //   if (data.asset) {
            //     setFormData((prev) => ({
            //       ...prev,
            //       photoUrl: data.asset.photoUrl,
            //     }));
            //   }
            // }}
            // onPhotoDeleted={() => {
            //   setFormData((prev) => ({ ...prev, photoUrl: null }));
            // }}
          />
        </div>
      );
    }

    // Handle relation fields (dropdowns)
    if (field.kind === "object" && !field.isList) {
      const options = relationOptions[field.name] || [];

      // Generic foreign key field name mapping
      const foreignKeyFieldName = field.name.endsWith("Id")
        ? field.name
        : `${field.name}Id`;

      return (
        <>
          <Label
            key={field.name}
            htmlFor={field.name}
            className="block text-sm leading-6 font-medium text-gray-900 dark:text-white"
          >
            {label} {required && <span className="ml-1 text-red-600">*</span>}
          </Label>
          <select
            id={field.name}
            required={required}
            value={formData[foreignKeyFieldName] || ""}
            onChange={(e) => handleChange(foreignKeyFieldName, e.target.value)}
            onBlur={() => handleBlur(field)}
            className={`mt-2 block w-full rounded-md border-0 px-3 py-2 shadow-sm ring-1 ring-inset focus:ring-2 focus:outline-hidden focus:ring-inset sm:text-sm dark:bg-gray-800 dark:text-white ${
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
        </>
      );
    }

    // Enum select
    if (inputType === "select" && field.enumValues?.length) {
      return (
        <>
          <Label
            key={field.name}
            htmlFor={field.name}
            className="block text-sm leading-6 font-medium text-gray-900 dark:text-white"
          >
            {label} {required && <span className="text-red-600">*</span>}
          </Label>
          <select
            id={field.name}
            required={required}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            onBlur={() => handleBlur(field)}
            className={`mt-2 block w-full rounded-md border-0 px-3 py-2 shadow-sm ring-1 ring-inset focus:ring-2 focus:outline-hidden focus:ring-inset sm:text-sm dark:bg-gray-800 dark:text-white ${
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
        </>
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
            // className="block min-w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 hover:outline-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-blue-500"
            className={`mt-2 block w-full rounded-md border-0 px-3 py-2 shadow-sm ring-1 ring-inset focus:ring-2 focus:outline-hidden focus:ring-inset sm:text-sm dark:bg-gray-800 dark:text-white ${
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
      // <TextField {{required ? isRequired : ""}}>
      // <TextField>
      //   <Label
      //     key={field.name}
      //     htmlFor={label}
      //     className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100"
      //   >
      //     {label} {required && <span className={"text-red-600"}>*</span>}
      //     <Input
      //       id={label}
      //       type={inputType}
      //       required={required}
      //       value={value}
      //       onChange={(e) =>
      //         handleChange(
      //           field.name,
      //           inputType === "number"
      //             ? Number(e.target.value) || ""
      //             : e.target.value,
      //         )
      //       }
      //       className="block min-w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 hover:border-gray-400 hover:outline-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6 dark:border-neutral-700/50 dark:bg-neutral-800/50 dark:text-white dark:outline-neutral-700/50 dark:placeholder:text-gray-500 dark:hover:outline-gray-600 dark:focus:outline-blue-500"
      //     />
      //   </Label>
      // </TextField>
      <ValidatedFormField
        key={field.name}
        id={field.name}
        label={label}
        type={inputType}
        required={required}
        value={value}
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
      {/* FIXED: Moved error display to proper JSX location */}
      {formError && (
        <div className="mb-4 border border-red-300 bg-red-200 p-3 text-red-600">
          {formError}
        </div>
      )}

      <Form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4 rounded-lg border border-gray-300 bg-white px-6 py-4 not-dark:shadow sm:grid-cols-2 dark:border-neutral-700/50 dark:bg-neutral-800/50"
      >
        {formFields.map(renderField)}
        <div className="mt-4 inline-flex">
          <Button
            type="submit"
            disabled={loading}
            isDisabled={loading}
            className={`-ms-px inline-flex items-center gap-x-2 border border-blue-600 px-4 py-3 text-sm font-medium text-gray-800 shadow-2xs first:ms-0 first:rounded-s-lg last:rounded-e-lg hover:cursor-pointer focus:z-10 focus:bg-blue-800 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 ${
              loading
                ? "cursor-not-allowed bg-gray-300 text-gray-500"
                : "bg-blue-600 text-white hover:bg-blue-500"
            }`}
          >
            {loading ? "Saving..." : initialData.id ? "Update" : "Create"}
          </Button>
          {initialData.id && (
            <Button
              type="button"
              // onClick={() => setFormData({})}
              onClick={handleCancel}
              className="-ms-px inline-flex items-center gap-x-2 border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-2xs first:ms-0 first:rounded-s-md last:rounded-e-md hover:cursor-pointer hover:bg-gray-50 focus:z-10 focus:border-gray-300 focus:bg-gray-200 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
            >
              Cancel
            </Button>
          )}
        </div>
      </Form>
    </>
  );
}
