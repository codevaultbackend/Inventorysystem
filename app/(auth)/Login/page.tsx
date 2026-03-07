"use client";

import { useState } from "react";
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

  /* ================= VALIDATION ================= */

  const emailValid =
    email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const passwordValid = password.length >= 6;

  /* ================= HANDLE LOGIN ================= */

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailValid || !passwordValid) return;

    setLoading(true);
    setApiError("");

    try {
      await login(email, password);
    
    } catch (err: any) {
      setApiError(
        err?.response?.data?.error ||
          err?.message ||
          "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen bg-[#F7F9FB] flex justify-center overflow-hidden">
      {/* TOP DECOR */}
      <img
        src="/LoginDecordown.png"
        alt=""
        className="absolute top-[-2%] left-0 w-full h-auto z-[1]"
      />

      {/* LOGIN CARD */}
      <div className="relative z-10 w-full max-w-[520px] px-6 pt-[90px]">
        <div className="text-center mb-12">
          <h1 className="text-[36px] font-[500] text-black leading-[100%]">
            Welcome Back!
          </h1>
          <p className="text-[#5F5F5F] text-[18px] font-[400] mt-[24px] mb-[48px] leading-[100%]">
            Please login to access your account
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* EMAIL */}
          <div>
            <label
              className={`block mb-2 text-[16px] font-[500] ${
                touched.email && !emailValid
                  ? "text-red-500"
                  : "text-[#5F5F5F]"
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
                  setTouched((p) => ({ ...p, email: true }))
                }
                className={`w-full h-[58px] px-4 rounded-[12px] outline-none border transition
                  ${
                    touched.email && !emailValid
                      ? "border-red-500 bg-red-50"
                      : "border-black"
                  }`}
              />

              {touched.email && !emailValid && (
                <span className="absolute right-4 top-[-40%] -translate-y-1/2">
                  <Exclmationerror />
                </span>
              )}
            </div>
          </div>

          {/* PASSWORD */}
          <div className="max-w-[476px]">
            <label
              className={`block mb-2 text-[16px] font-[500] ${
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
                  setTouched((p) => ({
                    ...p,
                    password: true,
                  }))
                }
                className={`w-full h-[58px] px-4 pr-12 rounded-[12px] outline-none border transition
                  ${
                    touched.password && !passwordValid
                      ? "border-red-500 bg-red-50"
                      : "border-black"
                  }`}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-black/60"
              >
                {showPassword ? (
                  <i className="fa-solid fa-eye-slash"></i>
                ) : (
                  <i className="fa-regular fa-eye"></i>
                )}
              </button>
            </div>

            <div className="text-right mt-2">
              <a
                href="/Resetpassword"
                className="text-[#2563EB] text-sm"
              >
                Forgot password?
              </a>
            </div>
          </div>

          {apiError && (
            <p className="text-red-500 text-sm">
              {apiError}
            </p>
          )}

          {/* LOGIN BUTTON */}
          <div
            className={`max-w-[476px] w-full h-16 rounded-xl shadow-[2px_2px_4px_0px_rgba(0,0,0,0.24)]
              ${
                emailValid || passwordValid
                  ? "bg-[#B9B9B9]"
                  : "bg-blue-800 hover:bg-blue-700"
              }`}
          >
            <button
              type="submit"
              disabled={
                !emailValid ||
                !passwordValid ||
                loading
              }
              className={`w-full h-full rounded-[12px] text-lg text-white ${
                !emailValid || !passwordValid
                  ? "cursor-not-allowed"
                  : "cursor-pointer"
              }`}
            >
              {loading
                ? "Logging in..."
                : "Log In"}
            </button>
          </div>

          <p className="text-center text-black">
            Don’t have an account?{" "}
            <a href="#" className="text-[#2563EB]">
              Sign up
            </a>
          </p>
        </form>
      </div>

      {/* BOTTOM DECOR */}
      <img
        src="/LoginDecorUp.png"
        alt=""
        className="absolute bottom-[-40%] max-w-[1100px] h-auto z-[1]"
      />
    </section>
  );
}