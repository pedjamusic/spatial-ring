import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { setToken } from "../lib/auth";
import { Form, TextField, Label, Input, Button } from "react-aria-components";
import { toast } from "../lib/toast";
import { ValidationPopover } from "../components/ui/ValidationPopover";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [emailValidation, setEmailValidation] = useState({
    state: "none",
    message: "",
  });
  const [passwordValidation, setPasswordValidation] = useState({
    state: "none",
    message: "",
  });

  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Popover open states
  const [emailPopoverOpen, setEmailPopoverOpen] = useState(false);
  const [passwordPopoverOpen, setPasswordPopoverOpen] = useState(false);

  // Refs for popover anchoring
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/admin";

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

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (emailTouched) {
      const validation = validateEmail(value);
      setEmailValidation(validation);
      setEmailPopoverOpen(validation.state === "invalid");
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (passwordTouched) {
      const validation = validatePassword(value);
      setPasswordValidation(validation);
      setPasswordPopoverOpen(validation.state === "invalid");
    }
  };

  const onEmailBlur = () => {
    if (!emailTouched) {
      setEmailTouched(true);
      const validation = validateEmail(email);
      setEmailValidation(validation);
      setEmailPopoverOpen(validation.state === "invalid");
    }
  };

  const onPasswordBlur = () => {
    if (!passwordTouched) {
      setPasswordTouched(true);
      const validation = validatePassword(password);
      setPasswordValidation(validation);
      setPasswordPopoverOpen(validation.state === "invalid");
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const emailVal = validateEmail(email);
    const passwordVal = validatePassword(password);

    setEmailValidation(emailVal);
    setPasswordValidation(passwordVal);
    setEmailTouched(true);
    setPasswordTouched(true);

    setEmailPopoverOpen(emailVal.state === "invalid");
    setPasswordPopoverOpen(passwordVal.state === "invalid");

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

  const getInputClasses = (validationState) => {
    const baseClasses =
      "block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white";

    if (validationState === "invalid") {
      return `${baseClasses} ring-red-500 focus:ring-red-500 dark:ring-red-500`;
    }
    if (validationState === "valid") {
      return `${baseClasses} ring-green-500 focus:ring-green-500 dark:ring-green-500`;
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
        <Form onSubmit={onSubmit} className="space-y-6">
          <TextField isRequired>
            <Label className="block text-sm leading-6 font-medium text-gray-900 dark:text-white">
              Email address
            </Label>
            <div className="relative mt-2">
              <Input
                ref={emailInputRef}
                type="email"
                autoComplete="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={onEmailBlur}
                onFocus={() =>
                  emailValidation.state === "invalid" &&
                  setEmailPopoverOpen(true)
                }
                className={getInputClasses(emailValidation.state)}
              />
              <ValidationPopover
                isOpen={emailPopoverOpen}
                onOpenChange={setEmailPopoverOpen}
                message={emailValidation.message}
                variant={
                  emailValidation.state === "invalid" ? "error" : "success"
                }
                triggerRef={emailInputRef}
              />
            </div>
          </TextField>

          <TextField isRequired>
            <Label className="block text-sm leading-6 font-medium text-gray-900 dark:text-white">
              Password
            </Label>
            <div className="relative mt-2">
              <Input
                ref={passwordInputRef}
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={handlePasswordChange}
                onBlur={onPasswordBlur}
                onFocus={() =>
                  passwordValidation.state === "invalid" &&
                  setPasswordPopoverOpen(true)
                }
                className={getInputClasses(passwordValidation.state)}
              />
              <ValidationPopover
                isOpen={passwordPopoverOpen}
                onOpenChange={setPasswordPopoverOpen}
                message={passwordValidation.message}
                variant={
                  passwordValidation.state === "invalid" ? "error" : "success"
                }
                triggerRef={passwordInputRef}
              />
            </div>
          </TextField>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <div>
            <Button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm leading-6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Sign in
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
