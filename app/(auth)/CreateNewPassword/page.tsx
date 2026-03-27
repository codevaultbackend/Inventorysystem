"use client";

import { useEffect, useMemo, useState } from "react";
import Exclmationerror from "../.././svgIcons/Exclmationerror";
import { useRouter } from "next/navigation";

export default function CreateNewPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touchedPassword, setTouchedPassword] = useState(false);
  const [touchedConfirm, setTouchedConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://ims-swp9.onrender.com";

  const passwordValid = useMemo(() => password.trim().length >= 6, [password]);

  const confirmValid = useMemo(
    () => password === confirm && confirm.length > 0,
    [password, confirm]
  );

  const canSubmit = passwordValid && confirmValid && !loading;

  useEffect(() => {
    setHydrated(true);

    const email = sessionStorage.getItem("reset_email");
    const otp = sessionStorage.getItem("reset_otp");

    if (!email || !otp) {
      router.replace("/ResetPassword");
    }
  }, [router]);

  const getErrorMessage = async (res: Response) => {
    try {
      const data = await res.json();
      return (
        data?.message ||
        data?.error ||
        "Something went wrong. Please try again."
      );
    } catch {
      return "Something went wrong. Please try again.";
    }
  };

  async function handleReset() {
    setTouchedPassword(true);
    setTouchedConfirm(true);
    setServerError("");

    if (!canSubmit) return;

    try {
      setLoading(true);

      const email = sessionStorage.getItem("reset_email");
      const otp = sessionStorage.getItem("reset_otp");

      if (!email || !otp) {
        setServerError("Reset session expired. Please try again.");
        router.replace("/ResetPassword");
        return;
      }

      const res = await fetch(`${API_BASE}/sql/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
          newPassword: password.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error(await getErrorMessage(res));
      }

      sessionStorage.removeItem("reset_email");
      sessionStorage.removeItem("reset_otp");

      router.push("/Login");
    } catch (error: any) {
      setServerError(
        error?.message || "Failed to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!hydrated) return null;

  return (
    <section className="relative min-h-screen bg-[#F7F9FB] overflow-hidden">
      <img
        src="/LoginDecordown.png"
        alt=""
        className="pointer-events-none absolute top-[-2%] left-0 w-full h-auto"
      />

      <img
        src="/LoginDecorUp.png"
        alt=""
        className="pointer-events-none absolute
          bottom-[-55%] sm:bottom-[-40%]
          left-1/2 -translate-x-1/2
          max-w-[1100px] w-full h-auto"
      />

      <div
        className="relative z-10 flex min-h-screen justify-center px-4
        pt-[96px] sm:pt-[120px] lg:pt-[100px]"
      >
        <div className="w-full max-w-[520px]">
          <h1
            className="text-center text-[28px] sm:text-[36px] lg:text-[44px]
            font-[700] text-black leading-[1.05]"
          >
            Create new password
          </h1>

          <p
            className="mt-2 text-center text-[#6B7280]
            text-[14px] sm:text-[16px]"
          >
            Enter your new password below to
            <br />
            complete the reset process
          </p>

          <div className="mt-10 space-y-6">
            <div>
              <label className="block text-[14px] sm:text-[16px] font-[600] text-[#4B5563]">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouchedPassword(true)}
                className={`mt-2 w-full h-[52px] sm:h-[56px]
                  rounded-[12px] bg-white px-4 outline-none border
                  shadow-[0px_2px_0px_rgba(0,0,0,0.06)]
                  ${
                    touchedPassword && !passwordValid
                      ? "border-[#E52727]"
                      : "border-[#111827]"
                  }`}
              />

              {touchedPassword && !passwordValid ? (
                <div className="mt-2 flex items-center gap-2 text-[13px] text-[#E52727]">
                  <Exclmationerror className="h-[16px] w-[16px]" />
                  <span>Password must contain at least 6 characters</span>
                </div>
              ) : (
                <p className="mt-2 text-[13px] text-[#6B7280]">
                  Password contain atleast 6 characters
                </p>
              )}
            </div>

            <div>
              <label
                className={`block text-[14px] sm:text-[16px] font-[600]
                  ${
                    touchedConfirm && !confirmValid
                      ? "text-[#E52727]"
                      : "text-[#4B5563]"
                  }`}
              >
                Confirm Password
              </label>

              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onBlur={() => setTouchedConfirm(true)}
                className={`mt-2 w-full h-[52px] sm:h-[56px]
                  rounded-[12px] bg-white px-4 outline-none border
                  shadow-[0px_2px_0px_rgba(0,0,0,0.06)]
                  ${
                    touchedConfirm && !confirmValid
                      ? "border-[#E52727]"
                      : "border-[#111827]"
                  }`}
              />

              {touchedConfirm && !confirmValid && (
                <div
                  className="mt-2 flex items-center gap-2
                  text-[13px] text-[#E52727]"
                >
                  <Exclmationerror className="h-[16px] w-[16px]" />
                  <span>Password must be identical</span>
                </div>
              )}
            </div>

            {serverError && (
              <div
                className="mt-2 flex items-center gap-2
                text-[13px] text-[#E52727]"
              >
                <Exclmationerror className="h-[16px] w-[16px]" />
                <span>{serverError}</span>
              </div>
            )}

            <button
              onClick={handleReset}
              disabled={!canSubmit}
              className={`w-full h-[56px] sm:h-[64px]
                rounded-[12px] text-[16px] sm:text-[18px]
                font-[600] transition
                ${
                  canSubmit
                    ? "bg-[#1148B8] hover:bg-[#0D3EA1] shadow-[0px_8px_16px_rgba(17,72,184,0.20)]"
                    : "bg-[#BDBDBD] cursor-not-allowed shadow-none"
                }
                text-white`}
            >
              {loading ? "Please wait..." : "Reset Password"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}