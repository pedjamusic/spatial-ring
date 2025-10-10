import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { setToken } from "../lib/auth";
import { toast } from "../lib/toast";
import { useFieldValidation } from "../lib/useFieldValidation";
import { Form, TextField, Button } from "react-aria-components";
import ValidatedField from "../components/ValidatedField";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // const [emailTouched, setEmailTouched] = useState(false);
  // const [passwordTouched, setPasswordTouched] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/admin";

  // Validation states for each field
  // const [emailValidation, setEmailValidation] = useState({
  //   state: "none", // 'none' | 'valid' | 'invalid'
  //   message: "",
  // });
  // const [passwordValidation, setPasswordValidation] = useState({
  //   state: "none",
  //   message: "",
  // });

  // Email validation function
  const validateEmail = (value) => {
    if (!value) {
      return { state: "invalid", message: "Email is required" };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return {
        state: "invalid",
        message: "Please enter a valid email address",
      };
    }
    return { state: "valid", message: "Looks good!" };
  };

  // Password validation function
  const validatePassword = (value) => {
    if (!value) {
      return { state: "invalid", message: "Password is required" };
    }
    if (value.length < 4) {
      return {
        state: "invalid",
        message: "Password must be at least 4 characters",
      };
    }
    return { state: "valid", message: "Looks good!" };
  };

  // Validation hooks
  const emailField = useFieldValidation(validateEmail);
  const passwordField = useFieldValidation(validatePassword);

  // Change handlers
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (emailField.touched) {
      emailField.validate(value);
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (passwordField.touched) {
      passwordField.validate(value);
    }
  };

  // Blur handlers (when user leaves the field)
  const onEmailBlur = () => {
    if (!emailField.touched) {
      emailField.setTouched(true);
      emailField.validate(email);
    }
  };

  const onPasswordBlur = () => {
    if (!passwordField.touched) {
      passwordField.setTouched(true);
      passwordField.validate(password);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate both fields before submission
    const emailVal = validateEmail(email);
    const passwordVal = validatePassword(password);
    emailField.setTouched(true);
    passwordField.setTouched(true);

    // Don't submit if validation fails
    if (emailVal.state === "invalid" || passwordVal.state === "invalid") {
      return;
    }

    try {
      const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data?.error || "Login failed";
        toast.error(msg);
        throw new Error(msg);
      }

      const data = await res.json();
      setToken(data.token);
      toast.success("Successfully logged in!");
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Unexpected error");
    }
  };

  // Dynamic border color classes based on validation state
  // const getInputClasses = (validationState) => {
  //   const baseClasses =
  //     "block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white focus:outline-hidden";

  //   if (validationState === "invalid") {
  //     return `${baseClasses} ring-red-500 focus:ring-red-500 dark:ring-red-500`;
  //   }
  //   if (validationState === "valid") {
  //     return `${baseClasses} ring-green-500 focus:ring-green-500 dark:ring-green-500`;
  //   }
  //   return `${baseClasses} ring-gray-300 focus:ring-indigo-600 dark:ring-gray-700`;
  // };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          src="src/assets/Logo transparent.png"
          alt="Spatial Ring logo"
          className="mx-auto h-32 w-auto dark:hidden"
        />
        <img
          src="src/assets/Logo full.png"
          alt="Spatial Ring logo"
          className="mx-auto h-32 w-auto not-dark:hidden"
        />
        <h2 className="mt-10 text-center text-2xl leading-9 font-bold tracking-tight text-gray-900 dark:text-white">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <Form onSubmit={onSubmit} className="space-y-6">
          <TextField isRequired>
            <ValidatedField
              id="email"
              label="Email address"
              type="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={onEmailBlur}
              validation={emailField.validation}
              showSuccess={emailField.showSuccess}
              autoComplete="email"
            />
          </TextField>

          <TextField isRequired>
            <ValidatedField
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              onBlur={onPasswordBlur}
              validation={passwordField.validation}
              showSuccess={passwordField.showSuccess}
              autoComplete="current-password"
            />
          </TextField>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <div>
            <Button
              type="submit"
              className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm leading-6 font-semibold text-white shadow-lg hover:bg-blue-800  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 focus:outline-hidden"
            >
              Sign in
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
