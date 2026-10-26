"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Exclmationerror from "../../svgIcons/Exclmationerror";
import { useAuth } from "@/app/context/AuthContext";

export default function Login() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const emailValid =
    email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const passwordValid = password.length >= 6;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      email: true,
      password: true,
    });

    if (!emailValid || !passwordValid) return;

    setLoading(true);
    setApiError("");

    try {
      await login(email, password);
    } catch (err: any) {
      setApiError(
        err?.response?.data?.error || err?.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative flex min-h-screen justify-center overflow-hidden bg-[#F7F9FB]">
      {loading && (
        <div className="fixed inset-0 z-[999999999] flex items-center justify-center bg-black/40">
          <span className="loader"></span>
        </div>
      )}

      {/* TOP DECOR */}
      <img
        src="/LoginDecordown.png"
        alt=""
        className="absolute left-0 top-0 z-[1] h-auto w-full pointer-events-none"
      />

      {/* LOGIN CARD */}
      <div className="relative z-10 w-full max-w-[520px] px-6 pt-[90px]">
        <div className="mb-12 text-center">
          <h1 className="text-[36px] font-[500] leading-[100%] text-black">
            Welcome Back!
          </h1>
          <p className="mt-[24px] mb-[48px] text-[18px] font-[400] leading-[100%] text-[#5F5F5F]">
            Please login to access your account
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* EMAIL */}
          <div>
            <label
              className={`mb-2 block text-[16px] font-[500] ${
                touched.email && !emailValid ? "text-red-500" : "text-[#5F5F5F]"
              }`}
            >
              Email ID
            </label>

            <div className="relative max-w-[476px]">
              <input
                type="email"
                value={email}
                name="email"
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, email: true }))
                }
                className={`w-full h-[58px] rounded-[12px] border px-4 outline-none transition ${
                  touched.email && !emailValid
                    ? "border-red-500 bg-red-50"
                    : "border-black bg-white"
                }`}
              />

              {touched.email && !emailValid && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Exclmationerror />
                </span>
              )}
            </div>
          </div>

          {/* PASSWORD */}
          <div className="max-w-[476px]">
            <label
              className={`mb-2 block text-[16px] font-[500] ${
                touched.password && !passwordValid
                  ? "text-red-500"
                  : "text-[#5F5F5F]"
              }`}
            >
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder="Enter password"
                name="password"
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() =>
                  setTouched((prev) => ({
                    ...prev,
                    password: true,
                  }))
                }
                className={`h-[58px] w-full rounded-[12px] border px-4 pr-[56px] outline-none transition ${
                  touched.password && !passwordValid
                    ? "border-red-500 bg-red-50"
                    : "border-black bg-white"
                }`}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-[#5F5F5F] transition hover:text-[#5F5F5F]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff size={18} strokeWidth={2} />
                ) : (
                  <Eye size={18} strokeWidth={2} />
                )}
              </button>
            </div>

            <div className="mt-2 text-right">
              <a href="/Resetpassword" className="text-sm text-[#2563EB]">
                Forgot password?
              </a>
            </div>
          </div>

          {apiError && <p className="text-sm text-red-500">{apiError}</p>}

          {/* LOGIN BUTTON */}
          <div
            className={`h-16 w-full max-w-[476px] rounded-xl shadow-[2px_2px_4px_0px_rgba(0,0,0,0.24)] ${
              emailValid && passwordValid
                ? "bg-[#0D4CBA]"
                : "bg-[#0D4CBA]/60"
            }`}
          >
            <button
              type="submit"
              disabled={!emailValid || !passwordValid || loading}
              className={`h-full w-full rounded-[12px] text-lg text-white ${
                !emailValid || !passwordValid || loading
                  ? "cursor-not-allowed"
                  : "cursor-pointer"
              }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>
      </div>

      {/* BOTTOM DECOR */}
      <img
        src="/LoginDecorUp.png"
        alt=""
        className="pointer-events-none absolute bottom-[-40%] z-[1] h-auto max-w-[1100px] max-[768px]:bottom-[-158px]"
      />
    </section>
  );
}