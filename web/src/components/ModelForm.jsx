// Generic model form component
import { useState, useEffect } from "react";
import {
  getInputType,
  getFieldLabel,
  isFieldHidden,
  isFieldRequired,
} from "../lib/fieldMapping.js";

export default function ModelForm({
  meta,
  initialData = {},
  onSubmit,
  uiConfig = {},
}) {
  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  // Filter fields for form display
  const formFields = meta.fields.filter(
    (field) => !isFieldHidden(field, uiConfig)
  );

  const handleChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
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

    // Relations (you can enhance this later)
    if (inputType === "relation") {
      const options = uiConfig[field.name]?.options || [];
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
