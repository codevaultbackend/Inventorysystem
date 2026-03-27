"use client";

import { useMemo, useState } from "react";
import Exclmationerror from "../../svgIcons/Exclmationerror";
import { useRouter } from "next/navigation";

type Step = "REQUEST_OTP" | "VERIFY_OTP";

export default function ResetPassword() {
  const [step, setStep] = useState<Step>("REQUEST_OTP");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [touchedEmail, setTouchedEmail] = useState(false);
  const [touchedOtp, setTouchedOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [serverMessage, setServerMessage] = useState("");
  const router = useRouter();

  const emailValid = useMemo(
    () => email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    [email]
  );

  const otpValid = useMemo(() => /^\d{6}$/.test(otp), [otp]);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://ims-swp9.onrender.com";

  const showEmailError = touchedEmail && !emailValid;
  const showOtpError = touchedOtp && !otpValid;
  const getOtpDisabled = loading || !emailValid;
  const continueDisabled = loading || !emailValid || !otpValid;

  const getResponseData = async (res: Response) => {
    try {
      return await res.json();
    } catch {
      return null;
    }
  };

  const getErrorMessage = async (res: Response) => {
    const data = await getResponseData(res);
    return (
      data?.message ||
      data?.error ||
      "Something went wrong. Please try again."
    );
  };

  const handleRequestOtp = async () => {
    setTouchedEmail(true);
    setServerError("");
    setServerMessage("");

    if (!emailValid) return;

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/sql/request-password-reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      });

      const data = await getResponseData(res);

      if (!res.ok || !data?.success) {
        throw new Error(
          data?.message || data?.error || "Failed to send OTP. Please try again."
        );
      }

      setServerMessage(
        data?.message || "OTP sent successfully. Please contact approver for OTP."
      );
      setStep("VERIFY_OTP");
    } catch (error: any) {
      setServerError(
        error?.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setTouchedEmail(true);
    setTouchedOtp(true);
    setServerError("");
    setServerMessage("");

    if (!emailValid || !otpValid) return;

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/sql/verify-password-reset-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error(await getErrorMessage(res));
      }

      sessionStorage.setItem("reset_email", email.trim().toLowerCase());
      sessionStorage.setItem("reset_otp", otp.trim());

      router.push("/CreateNewPassword");
    } catch (error: any) {
      setServerError(error?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

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
        pt-[96px] sm:pt-[120px] lg:pt-[150px]"
      >
        <div className="w-full max-w-[520px]">
          <h1
            className="text-center font-[700] text-black
            text-[28px] sm:text-[36px] lg:text-[44px]
            leading-[1.05]"
          >
            Reset Password
          </h1>

          <p
            className="mt-2 text-center text-[#6B7280]
            text-[14px] sm:text-[16px]"
          >
            Enter your account email to receive OTP
          </p>

          <div className="mt-8 sm:mt-10 space-y-6">
            <div>
              <label
                className={`block text-[14px] sm:text-[16px] font-[600]
                  ${showEmailError ? "text-[#E52727]" : "text-[#4B5563]"}`}
              >
                Email address
              </label>

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouchedEmail(true)}
                placeholder="Enter your email"
                type="email"
                className={`mt-2 w-full
                  h-[52px] sm:h-[56px]
                  rounded-[12px] bg-white px-4
                  text-[15px] sm:text-[16px]
                  outline-none border
                  shadow-[0px_2px_0px_rgba(0,0,0,0.06)]
                  ${showEmailError ? "border-[#E52727]" : "border-[#111827]"}`}
              />

              {showEmailError && (
                <div
                  className="mt-2 flex items-center gap-2
                  text-[13px] sm:text-[14px] text-[#E52727]"
                >
                  <Exclmationerror className="h-[16px] w-[16px] sm:h-[18px] sm:w-[18px]" />
                  <span>Email you entered is incorrect</span>
                </div>
              )}
            </div>

            {step === "VERIFY_OTP" && (
              <div>
                <label
                  className={`block text-[14px] sm:text-[16px] font-[600] ${
                    showOtpError ? "text-[#E52727]" : "text-[#4B5563]"
                  }`}
                >
                  Enter 6 digits code
                </label>

                <input
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  onBlur={() => setTouchedOtp(true)}
                  placeholder="Enter OTP"
                  inputMode="numeric"
                  maxLength={6}
                  className={`mt-2 w-full
                    h-[52px] sm:h-[56px]
                    rounded-[12px] bg-white px-4
                    text-[15px] sm:text-[16px]
                    outline-none border
                    shadow-[0px_2px_0px_rgba(0,0,0,0.06)]
                    ${showOtpError ? "border-[#E52727]" : "border-[#111827]"}`}
                />

                {showOtpError && (
                  <div
                    className="mt-2 flex items-center gap-2
                    text-[13px] sm:text-[14px] text-[#E52727]"
                  >
                    <Exclmationerror className="h-[16px] w-[16px] sm:h-[18px] sm:w-[18px]" />
                    <span>Please enter valid 6 digit OTP</span>
                  </div>
                )}
              </div>
            )}

            {serverMessage && !serverError && (
              <div className="rounded-[12px] border border-[#B9D7FF] bg-[#EEF6FF] px-4 py-3 text-[13px] sm:text-[14px] font-[500] text-[#1148B8]">
                {serverMessage}
              </div>
            )}

            {serverError && (
              <div
                className="mt-2 flex items-center gap-2
                text-[13px] sm:text-[14px] text-[#E52727]"
              >
                <Exclmationerror className="h-[16px] w-[16px] sm:h-[18px] sm:w-[18px]" />
                <span>{serverError}</span>
              </div>
            )}

            <button
              type="button"
              onClick={
                step === "REQUEST_OTP" ? handleRequestOtp : handleVerifyOtp
              }
              disabled={
                step === "REQUEST_OTP" ? getOtpDisabled : continueDisabled
              }
              className={`w-full
                h-[56px] sm:h-[64px]
                rounded-[12px]
                text-[16px] sm:text-[18px]
                font-[600]
                transition
                ${
                  (step === "REQUEST_OTP"
                    ? getOtpDisabled
                    : continueDisabled)
                    ? "bg-[#BDBDBD] cursor-not-allowed shadow-none"
                    : "bg-[#1148B8] hover:bg-[#0D3EA1] shadow-[0px_8px_16px_rgba(17,72,184,0.20)]"
                }
                text-white`}
            >
              {loading
                ? "Please wait..."
                : step === "REQUEST_OTP"
                ? "Get OTP"
                : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}