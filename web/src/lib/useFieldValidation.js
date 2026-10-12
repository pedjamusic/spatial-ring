import { useState, useEffect } from "react";

const DEFAULT_SUCCESS_DURATION_MS = 3000;

export function useFieldValidation(validationFn, successDuration = DEFAULT_SUCCESS_DURATION_MS) { // change successDuration for input field hint after error has been corrected
  const [validation, setValidation] = useState({
    state: "none",
    message: "",
  });
  const [touched, setTouched] = useState(false);
  const [hadError, setHadError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!showSuccess) return;
    const successTimer = setTimeout(() => {
      setShowSuccess(false);
    }, successDuration);
    return () => clearTimeout(successTimer);
  }, [showSuccess, successDuration]);

  const validate = (value) => {
    const result = validationFn(value);
    if (result.state === "invalid") {
      setHadError(true);
      setShowSuccess(false);
    } else if (result.state === "valid" && validation.state !== "valid" && hadError) {
      setShowSuccess(true);
    }
    setValidation(result);
    return result;
  };

  return { validation, showSuccess, touched, setTouched, validate };
}
