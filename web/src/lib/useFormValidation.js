import { useState, useCallback } from "react";
import { isFieldRequired as checkFieldRequired } from "./fieldMapping";

/**
 * Reusable form validation hook for CRUD operations
 * Manages validation state for all fields and provides helpers
 */
export function useFormValidation(meta, uiConfig = {}) {
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  // Check if a field is required based on metadata
  const isFieldRequired = useCallback(
    (field) => {
      // Check uiConfig first
      if (uiConfig[field.name]?.required !== undefined) {
        return uiConfig[field.name].required;
      }
      // A field is required only if it's marked as required AND doesn't have a default value
    return checkFieldRequired(field);
    },
    [uiConfig]
  );

  // Validate a single field
  const validateField = useCallback(
    (field, value) => {
      const required = isFieldRequired(field);

      // Check for required fields
      if (required) {
        if (value === null || value === undefined || value === "") {
          return `${field.name} is required`;
        }
      }

      // Type-specific validations
      if (field.type === "String" && value && field.maxLength) {
        if (value.length > field.maxLength) {
          return `Maximum length is ${field.maxLength} characters`;
        }
      }

      if (field.type === "Int" || field.type === "Float") {
        if (value !== "" && isNaN(value)) {
          return "Must be a valid number";
        }
      }

      // Email validation for fields named 'email'
      if (field.name.toLowerCase().includes("email") && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return "Please enter a valid email address";
        }
      }

      return null; // No error
    },
    [isFieldRequired]
  );

  // Validate all visible fields
  const validateForm = useCallback(
    (formData, fields) => {
      const errors = {};
      let hasErrors = false;

      fields.forEach((field) => {
        const error = validateField(field, formData[field.name]);
        if (error) {
          errors[field.name] = error;
          hasErrors = true;
        }
      });

      setFieldErrors(errors);
      return { isValid: !hasErrors, errors };
    },
    [validateField]
  );

  // Mark a field as touched
  const touchField = useCallback((fieldName) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
  }, []);

  // Mark all fields as touched (for form submission)
  const touchAllFields = useCallback((fields) => {
    const touched = {};
    fields.forEach((field) => {
      touched[field.name] = true;
    });
    setTouchedFields(touched);
  }, []);

  // Clear all validation state
  const resetValidation = useCallback(() => {
    setFieldErrors({});
    setTouchedFields({});
  }, []);

  // Update field error dynamically (on change)
  const updateFieldError = useCallback((fieldName, error) => {
    setFieldErrors((prev) => {
      if (error === null) {
        const { [fieldName]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [fieldName]: error };
    });
  }, []);

  return {
    fieldErrors,
    touchedFields,
    validateField,
    validateForm,
    touchField,
    touchAllFields,
    resetValidation,
    updateFieldError,
    isFieldRequired,
  };
}
