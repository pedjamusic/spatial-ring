import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { setToken } from "../lib/auth";

import {
  Form,
  TextField,
  Label,
  Input,
  Text,
  Button,
} from "react-aria-components";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/admin";

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok)
        throw new Error(
          (await res.json().catch(() => ({})))?.error || "Login failed",
        );
      const data = await res.json();
      setToken(data.token);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    }
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
        <Form onSubmit={onSubmit} aria-label="Login form">
          <div className="grid gap-y-4">
            <TextField className="relative">
              <Label for="email" className="mb-2 block text-sm dark:text-white">
                Email address
              </Label>
              <Input
                type="email"
                id="email"
                name="email"
                className="block w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 sm:py-3 sm:text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                required
                aria-describedby="email-error"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Text
                slot="description"
                className="text-xs text-gray-500 dark:text-neutral-400"
              >
                E-Mail address is username at the same time.
              </Text>
            </TextField>
            <TextField
              type="password"
              className="flex flex-wrap items-center justify-between gap-2"
            >
              <Label className="block text-sm dark:text-white">Password</Label>
              <span className="mb-2 block text-sm text-gray-500 dark:text-neutral-500">
                Optional
              </span>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                className="block w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 sm:py-3 sm:text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
              />
              <Text
                slot="description"
                className="text-xs text-gray-500 dark:text-neutral-400"
              >
                Password must be at least 8 characters long.
              </Text>
            </TextField>
          </div>
          {error && <div className="mt-2 text-xs text-red-600">{error}</div>}
          <Button
            variant="primary"
            type="submit"
            className="inline-flex w-full items-center justify-center gap-x-2 rounded-full border border-transparent bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:bg-blue-700 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50"
          >
            Sign in
          </Button>
        </Form>
      </div>
    </div>
  );
}
