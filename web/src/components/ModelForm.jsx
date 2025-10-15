import { useState, useEffect } from "react";
import {
  getInputType,
  getFieldLabel,
  isFieldHidden,
  isFieldRequired,
} from "../lib/fieldMapping";
import { authFetch } from "../lib/api";
import {
  Button,
  Form,
  TextField,
  Label,
  Input,
  TextArea,
} from "react-aria-components";

export default function ModelForm({
  meta,
  initialData = {},
  onSubmit,
  uiConfig = {},
}) {
  const [formData, setFormData] = useState(initialData);
  const [relationOptions, setRelationOptions] = useState({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

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
            `🙈 Hiding reverse relation: ${field.name} (${field.type}[])`
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
    setFormData(initialData);
  }, [initialData]);

  // Effect 3: Load data for relation dropdowns when meta changes
  useEffect(() => {
    const fetchRelationOptions = async () => {
      if (!meta?.fields) return;

      const relationFields = meta.fields.filter(
        (field) => field.kind === "object" && !field.isList && field.relation
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
            `⚠️ No endpoint mapping for relation: ${field.name} -> ${field.relation.to}`
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
          console.error(`Failed to load options for ${field.name}:`, error);
          setFormError(`Failed to load ${field.relation.to}: ${error.message}`);
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
    (field) => !isFieldHidden(field, uiConfig)
  );

  const handleChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log("🚀 About to submit form ", formData);

    try {
      await onSubmit(formData);
    } catch (error) {
      setFormError(error.message || "Failed to submit form");
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field) => {
    const inputType = uiConfig[field.name]?.widget || getInputType(field);
    const label = getFieldLabel(field, uiConfig);
    const required = isFieldRequired(field);
    const value = formData[field.name] ?? "";

    // Handle relation fields
    if (field.kind === "object" && !field.isList) {
      const options = relationOptions[field.name] || [];

      // Generic foreign key field name mapping
      const foreignKeyFieldName = field.name.endsWith("Id")
        ? field.name
        : `${field.name}Id`;

      return (
        <label key={field.name}>
          <div>
            {label} {required && <span className="text-red-600">*</span>}
          </div>
          <select
            required={required}
            value={formData[foreignKeyFieldName] || ""}
            onChange={(e) => handleChange(foreignKeyFieldName, e.target.value)}
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc" }}
          >
            <option value="">Select...</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      );
    }

    // Enum select
    if (inputType === "select" && field.enumValues?.length) {
      return (
        <label key={field.name}>
          <div>
            {label} {required && <span className="text-red-600">*</span>}
          </div>
          <select
            required={required}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc" }}
          >
            <option value="">Choose...</option>
            {field.enumValues.map((val) => (
              <option key={val} value={val}>
                {val}
              </option>
            ))}
          </select>
        </label>
      );
    }

    // Checkbox for booleans
    if (inputType === "checkbox") {
      return (
        <label
          key={field.name}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => handleChange(field.name, e.target.checked)}
          />
          <span>{label}</span>
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
          <div>
            {label} {required && <span style={{ color: "red" }}>*</span>}
          </div>
          <textarea
            required={required}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className="block min-w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 hover:outline-gray-400 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-blue-500"
          />
        </Label>
      );
    }

    // Default input
    return (
      // <TextField {{required ? isRequired : ""}}>
      <TextField>
        <Label
          key={field.name}
          htmlFor={label}
          className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100"
        >
          {label} {required && <span className={"text-red-600"}>*</span>}
        </Label>
        <Input
          id={label}
          type={inputType}
          required={required}
          value={value}
          onChange={(e) =>
            handleChange(
              field.name,
              inputType === "number"
                ? Number(e.target.value) || ""
                : e.target.value
            )
          }
          className="block min-w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 hover:outline-gray-400 dark:hover:outline-gray-600 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6 dark:text-white dark:outline-white/5 dark:placeholder:text-gray-500 dark:focus:outline-blue-500
          border border-gray-200 duration-300 dark:border-neutral-700/25 dark:bg-neutral-800/50"
        />
      </TextField>
    );
  };

  return (
    <>
      {/* FIXED: Moved error display to proper JSX location */}
      {formError && (
        <div className="p-3 bg-red-200 text-red-600 border border-red-300 mb-4">
          {formError}
        </div>
      )}

      <Form
        onSubmit={handleSubmit}
        className="bg-white px-6 py-4 rounded-lg border border-gray-300 not-dark:shadow dark:border-neutral-700/50 dark:bg-neutral-800/50"
      >
        {formFields.map(renderField)}
        <div className="inline-flex mt-4">
          <Button
            type="submit"
            disabled={loading}
            className={`py-3 px-4 inline-flex items-center gap-x-2 -ms-px first:rounded-s-lg first:ms-0 last:rounded-e-lg text-sm font-medium focus:z-10 border border-blue-600 text-gray-800 shadow-2xs focus:outline-hidden focus:bg-blue-800 disabled:opacity-50 disabled:pointer-events-none hover:cursor-pointer
            ${
              loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-800 hover:border-blue-800"
            }`}
          >
            {loading ? "Saving..." : initialData.id ? "Update" : "Create"}
          </Button>
          {initialData.id && (
            <Button
              type="button"
              onClick={() => setFormData({})}
              className="py-3 px-4 inline-flex items-center gap-x-2 -ms-px first:rounded-s-md first:ms-0 last:rounded-e-md text-sm font-medium focus:z-10 border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 focus:outline-hidden focus:bg-gray-200 focus:border-gray-300 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
            >
              Cancel
            </Button>
          )}
        </div>
      </Form>
    </>
  );
}
