import { useState, useRef, useEffect } from "react";

export function useFieldValidation(validationFn, successDuration = 3000) { // change successDuration for input field hint after error has been corrected
  const [validation, setValidation] = useState({
    state: "none",
    message: "",
  });
  const [touched, setTouched] = useState(false);
  const [hadError, setHadError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const successTimer = useRef();

  useEffect(() => {
    if (validation.state === "invalid") {
      setHadError(true);
      setShowSuccess(false);
      if (successTimer.current) clearTimeout(successTimer.current);
    } else if (validation.state === "valid" && hadError) {
      setShowSuccess(true);
      if (successTimer.current) clearTimeout(successTimer.current);
      successTimer.current = setTimeout(() => {
        setShowSuccess(false);
      }, successDuration);
    }
    return () => {
      if (successTimer.current) clearTimeout(successTimer.current);
    };
  }, [validation.state, hadError, successDuration]);

  const validate = (value) => {
    const result = validationFn(value);
    setValidation(result);
    return result;
  };

  return { validation, showSuccess, touched, setTouched, validate };
}
