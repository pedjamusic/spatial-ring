import { useState, useEffect } from "react";
import {
  getInputType,
  getFieldLabel,
  isFieldHidden,
  isFieldRequired,
} from "../lib/fieldMapping";
import { authFetch } from "../lib/api";

export default function ModelForm({
  meta,
  initialData = {},
  onSubmit,
  uiConfig = {},
}) {
  const [formData, setFormData] = useState(initialData);
  const [relationOptions, setRelationOptions] = useState({});
  const [loading, setLoading] = useState(false);

  // --- TOP-LEVEL HOOKS ---

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
        Location: "locations",
        AssetCategory: "assetCategories",
        User: "users",
        Event: "events",
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
          const response = await fetch(`/api/${endpoint}`);
          // const data = await response.json();

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
          // Set error state to display it in the UI
          setError(`Failed to load ${field.relation.to}: ${error.message}`);
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

    console.log("🚀 About to submit form data:", formData);

    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field) => {
    const inputType = uiConfig[field.name]?.widget || getInputType(field);
    const label = getFieldLabel(field, uiConfig);
    const required = isFieldRequired(field);
    const value = formData[field.name] ?? "";

    // --- Correct way to handle relation fields ---
    if (field.kind === "object" && !field.isList) {
      const options = relationOptions[field.name] || [];

      // Map field names for foreign keys
      // let actualFieldName = field.name;
      // if (field.name === "category") actualFieldName = "categoryId";
      // if (field.name === "restingLocation")
      //   actualFieldName = "restingLocationId";
      // Generic foreign key field name mapping
      // If field name is "category", use "categoryId" for the form data
      // If field name is "restingLocation", use "restingLocationId", etc.
      const foreignKeyFieldName = field.name.endsWith("Id")
        ? field.name
        : `${field.name}Id`;

      return (
        <label key={field.name}>
          <div>
            {label} {required && <span style={{ color: "red" }}>*</span>}
          </div>
          <select
            required={required}
            value={value || ""}
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
            {label} {required && <span style={{ color: "red" }}>*</span>}
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

    // Checkbox, Textarea, and other inputs remain the same...

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

    // Textarea for large text
    if (inputType === "textarea") {
      return (
        <label key={field.name}>
          <div>
            {label} {required && <span style={{ color: "red" }}>*</span>}
          </div>
          <textarea
            required={required}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              minHeight: "80px",
            }}
          />
        </label>
      );
    }

    // Default input
    return (
      <label key={field.name}>
        <div>
          {label} {required && <span style={{ color: "red" }}>*</span>}
        </div>
        <input
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
          style={{ width: "100%", padding: "8px", border: "1px solid #ccc" }}
        />
      </label>
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "grid", gap: "16px", maxWidth: "600px" }}
    >
      {formFields.map(renderField)}
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 20px",
            backgroundColor: loading ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Saving..." : initialData.id ? "Update" : "Create"}
        </button>
        {initialData.id && (
          <button
            type="button"
            onClick={() => setFormData({})}
            style={{
              padding: "10px 20px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
