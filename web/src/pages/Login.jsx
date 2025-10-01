import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { setToken } from "../lib/auth";
import { toast } from "../lib/toast";

import {
  Form,
  TextField,
  Label,
  Input,
  Text,
  Button,
} from "react-aria-components";
import { ValidationPopover } from "../components/ui/ValidationPopover";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Validation states for each field
  const [emailValidation, setEmailValidation] = useState({
    state: "none", // 'none' | 'valid' | 'invalid'
    message: "",
  });
  const [passwordValidation, setPasswordValidation] = useState({
    state: "none",
    message: "",
  });

  // Popover open states
  // const [emailPopoverOpen, setEmailPopoverOpen] = useState(false);
  // const [passwordPopoverOpen, setPasswordPopoverOpen] = useState(false);

  // Refs for popover anchoring
  // const emailInputRef = useRef(null);
  // const passwordInputRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/admin";

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
      return { state: "invalid", message: "Please, enter password" };
    }
    if (value.length < 4) {
      return {
        state: "invalid",
        message: "Password must be at least 4 characters",
      };
    }
    return { state: "valid", message: "Looks good!" };
  };

  // Change handlers
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (emailTouched) {
      const validation = validateEmail(value);
      setEmailValidation(validation);
      // setEmailPopoverOpen(validation.state === "invalid");
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (passwordTouched) {
      const validation = validatePassword(value);
      setPasswordValidation(validation);
      // setPasswordPopoverOpen(validation.state === "invalid");
    }
  };

  // Blur handlers (when user leaves the field)
  const onEmailBlur = () => {
    if (!emailTouched) {
      setEmailTouched(true);
      const validation = validateEmail(email);
      setEmailValidation(validation);
      // setEmailPopoverOpen(validation.state === "invalid");
    }
  };

  const onPasswordBlur = () => {
    if (!passwordTouched) {
      setPasswordTouched(true);
      const validation = validatePassword(password);
      setPasswordValidation(validation);
      // setPasswordPopoverOpen(validation.state === "invalid");
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate both fields before submission
    const emailVal = validateEmail(email);
    const passwordVal = validatePassword(password);

    setEmailValidation(emailVal);
    setPasswordValidation(passwordVal);
    setEmailTouched(true);
    setPasswordTouched(true);

    // setEmailPopoverOpen(emailVal.state === "invalid");
    // setPasswordPopoverOpen(passwordVal.state === "invalid");

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
  const getInputClasses = (validationState) => {
    const baseClasses =
      "block w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 sm:py-3 sm:text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600";

    if (validationState === "invalid") {
      return `${baseClasses} border-red-500 focus:ring-red-500 dark:ring-red-500`;
    }
    if (validationState === "valid") {
      return `${baseClasses} border-green-500 focus:ring-green-500 dark:ring-green-500`;
    }
    return `${baseClasses} ring-gray-300 focus:ring-indigo-600 dark:ring-gray-700`;
  };

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
        <Form onSubmit={onSubmit} aria-label="Login form" className="space-y-6">
          <div className="grid gap-y-4">
            {/* Email / username */}
            <TextField isRequired>
              <Label
                htmlFor="email"
                className="mb-2 block text-sm dark:text-white"
              >
                Email address
              </Label>
              <div className="mt-2">
                <Input
                  type="email"
                  autoComplete="email"
                  id="email"
                  name="email"
                  onBlur={onEmailBlur}
                  // className="block w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 sm:py-3 sm:text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                  className={getInputClasses(emailValidation.state)}
                  required
                  aria-describedby="email-error"
                  value={email}
                  // onChange={(e) => setEmail(e.target.value)}
                  onChange={handleEmailChange}
                  // className={getInputClasses(emailValidation.state)}
                />
                <Text
                  slot="description"
                  className="mt-2 block text-xs text-gray-500 dark:text-neutral-400"
                >
                  E-Mail address is <i>username</i> at the same time.
                </Text>
                {emailValidation.state === "invalid" && (
                  <Text
                    slot="errorMessage"
                    className="mt-2 text-sm text-red-600 dark:text-red-400"
                  >
                    {emailValidation.message}
                  </Text>
                )}
                {emailValidation.state === "valid" && (
                  <Text
                    slot="description"
                    className="mt-2 text-sm text-green-600 dark:text-green-400"
                  >
                    {emailValidation.message}
                  </Text>
                )}
              </div>
            </TextField>
            {/* Password */}
            <TextField
              isRequired
              type="password"
              className="flex flex-wrap items-center justify-between gap-2"
            >
              <Label className="block text-sm dark:text-white">Password</Label>
              <span className="mb-2 block text-sm text-gray-500 dark:text-neutral-500">
                Optional
              </span>

              <Input
                value={password}
                // onChange={(e) => setPassword(e.target.value)}
                onChange={handlePasswordChange}
                type="password"
                autoComplete="current-password"
                required
                onBlur={onPasswordBlur}
                className={getInputClasses(passwordValidation.state)}
              />
              {passwordValidation.state === "invalid" && (
                <Text
                  slot="errorMessage"
                  className="text-xs text-red-600 dark:text-red-400"
                >
                  {passwordValidation.message}
                </Text>
              )}
              {passwordValidation.state === "valid" && (
                <Text
                  slot="description"
                  className="mt-2 text-sm text-green-600 dark:text-green-400"
                >
                  {passwordValidation.message}
                </Text>
              )}
            </TextField>
          </div>
          {error && (
            <Text
              slot="errorMessage"
              className="text-sm text-red-600 dark:text-red-400"
            >
              {error}
            </Text>
          )}
          <Button
            type="submit"
            variant="primary"
            className="inline-flex w-full items-center justify-center gap-x-2 rounded-full border border-transparent bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:bg-blue-700 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50"
          >
            Sign in
          </Button>
        </Form>
      </div>
    </div>
  );
}
