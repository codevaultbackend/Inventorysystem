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
    const router = useRouter();


    const emailValid = useMemo(
        () => email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
        [email]
    );

    const otpValid = useMemo(() => /^\d{6}$/.test(otp), [otp]);

    const showEmailError = touchedEmail && !emailValid;
    const getOtpDisabled = loading || !emailValid;
    const continueDisabled = loading || !emailValid || !otpValid;

    return (
        <section className="relative min-h-screen bg-[#F7F9FB] overflow-hidden">
            {/* TOP DECOR */}
            <img
                src="/LoginDecordown.png"
                alt=""
                className="pointer-events-none absolute top-[-2%] left-0 w-full h-auto"
            />

            {/* BOTTOM DECOR */}
            <img
                src="/LoginDecorUp.png"
                alt=""
                className="pointer-events-none absolute
          bottom-[-55%] sm:bottom-[-40%]
          left-1/2 -translate-x-1/2
          max-w-[1100px] w-full h-auto"
            />

            {/* CENTER CONTENT */}
            <div className="relative z-10 flex min-h-screen justify-center px-4
        pt-[96px] sm:pt-[120px] lg:pt-[150px]">

                <div className="w-full max-w-[520px]">
                    {/* TITLE */}
                    <h1 className="text-center font-[700] text-black
            text-[28px] sm:text-[36px] lg:text-[44px]
            leading-[1.05]">
                        Reset Password
                    </h1>

                    <p className="mt-2 text-center text-[#6B7280]
            text-[14px] sm:text-[16px]">
                        Enter your account email to receive OTP
                    </p>

                    {/* FORM */}
                    <div className="mt-8 sm:mt-10 space-y-6">
                        {/* EMAIL */}
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
                                <div className="mt-2 flex items-center gap-2
                  text-[13px] sm:text-[14px] text-[#E52727]">
                                    <Exclmationerror className="h-[16px] w-[16px] sm:h-[18px] sm:w-[18px]" />
                                    <span>Email you entered is incorrect</span>
                                </div>
                            )}
                        </div>

                        {/* OTP */}
                        {step === "VERIFY_OTP" && (
                            <div>
                                <label className="block text-[14px] sm:text-[16px] font-[600] text-[#4B5563]">
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
                                    className="mt-2 w-full
                    h-[52px] sm:h-[56px]
                    rounded-[12px] bg-white px-4
                    text-[15px] sm:text-[16px]
                    outline-none border border-[#111827]
                    shadow-[0px_2px_0px_rgba(0,0,0,0.06)]"
                                />
                            </div>
                        )}

                        {/* BUTTON */}

                        <button
                            type="button"
                            onClick={async () => {
                                if (step === "REQUEST_OTP") {
                                    setTouchedEmail(true);
                                    if (!emailValid) return;

                                    // 🔌 CALL SEND OTP API HERE
                                    // await fetch("/api/send-otp", { ... })

                                    setStep("VERIFY_OTP");
                                } else {
                                    setTouchedOtp(true);
                                    if (!otpValid) return;

                                    // 🔌 VERIFY OTP API HERE
                                    // const res = await fetch("/api/verify-otp", { ... })

                                    // ✅ Example token (replace with backend response)
                                    const token = "verified-reset-token";

                                    // ✅ NAVIGATE (protected route)
                                    router.push(`/CreateNewPassword`);
                                }
                            }}
                            disabled={step === "REQUEST_OTP" ? getOtpDisabled : continueDisabled}
                            className={`w-full
    h-[56px] sm:h-[64px]
    rounded-[12px]
    text-[16px] sm:text-[18px]
    font-[600]
    transition
    ${(step === "REQUEST_OTP" ? getOtpDisabled : continueDisabled)
                                    ? "bg-[#BDBDBD] cursor-not-allowed shadow-none"
                                    : "bg-[#1148B8] hover:bg-[#0D3EA1] shadow-[0px_8px_16px_rgba(17,72,184,0.20)]"
                                }
    text-white`}
                        >
                            {step === "REQUEST_OTP" ? "Get OTP" : "Continue"}
                        </button>

                    </div>
                </div>
            </div>
        </section>
    );
}
