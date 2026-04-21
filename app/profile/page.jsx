"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pencil, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../Component/DashboardLayout";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.REACT_APP_API_URL ||
  "";

function getToken() {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1] ||
    ""
  );
}

async function apiRequest(url, options = {}) {
  const token = getToken();

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Something went wrong");
  }

  return data;
}

async function getProfileApi() {
  return apiRequest("/profile/get-profile", {
    method: "GET",
  });
}

async function setProfileApi(payload) {
  const token = getToken();

  const res = await fetch(`${API_BASE}/profile/set-profile`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: payload,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Failed to set profile");
  }

  return data;
}

async function updateProfileApi(payload) {
  const token = getToken();

  const res = await fetch(`${API_BASE}/profile/update-profile`, {
    method: "PUT",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: payload,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Failed to update profile");
  }

  return data;
}

function formatLastPasswordChange(dateString) {
  if (!dateString) return "Not changed yet";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function logoutAndRedirectToResetPassword(setUser) {
  try {
    if (typeof setUser === "function") {
      setUser(null);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("normalized_role");
    localStorage.removeItem("organization_level");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("normalized_role");
    sessionStorage.removeItem("organization_level");

    document.cookie = "token=; Max-Age=0; path=/";
    document.cookie = "accessToken=; Max-Age=0; path=/";
    document.cookie = "authToken=; Max-Age=0; path=/";
  } finally {
    window.location.replace("/Resetpassword");
  }
}

export default function Profile() {
  const { user, setUser } = useAuth();

  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  const isProfileSet = !!profile?.is_profile_set;

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        setErrorMessage("");

        const res = await getProfileApi();
        const profileData = res?.data || null;

        if (!isMounted) return;

        setProfile(profileData);
        setForm({
          name: profileData?.name || user?.name || "",
          email: profileData?.email || user?.email || "",
          phone: profileData?.phone || "",
          address: profileData?.address || "",
        });
        setPreviewImage(profileData?.profile_image || "");
      } catch (error) {
        if (!isMounted) return;

        setErrorMessage(error.message || "Failed to fetch profile");
        setForm({
          name: user?.name || "",
          email: user?.email || "",
          phone: "",
          address: "",
        });
        setPreviewImage("");
      } finally {
        if (isMounted) {
          setProfileLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const displayedImage = useMemo(() => {
    return previewImage || "https://i.pravatar.cc/300?img=12";
  }, [previewImage]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage("");
    setSuccessMessage("");

    const objectUrl = URL.createObjectURL(file);
    setSelectedImage(file);
    setPreviewImage(objectUrl);

    if (!isProfileSet) {
      return;
    }

    try {
      setImageUploading(true);

      const formData = new FormData();
      formData.append("image", file);

      const res = await updateProfileApi(formData);
      const updatedProfile = res?.data || null;

      setProfile(updatedProfile);
      setPreviewImage(updatedProfile?.profile_image || objectUrl);
      setSuccessMessage("Profile picture updated successfully");
    } catch (error) {
      setErrorMessage(error.message || "Failed to update profile picture");
    } finally {
      setImageUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setProfileSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const formData = new FormData();
      formData.append("name", form.name || "");
      formData.append("email", form.email || "");
      formData.append("phone", form.phone || "");
      formData.append("address", form.address || "");

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      const res = await setProfileApi(formData);
      const savedProfile = res?.data || null;

      setProfile(savedProfile);
      setForm({
        name: savedProfile?.name || "",
        email: savedProfile?.email || "",
        phone: savedProfile?.phone || "",
        address: savedProfile?.address || "",
      });
      setPreviewImage(savedProfile?.profile_image || previewImage);
      setSelectedImage(null);
      setSuccessMessage("Profile set successfully");
    } catch (error) {
      setErrorMessage(error.message || "Failed to save profile");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePasswordClick = () => {
    logoutAndRedirectToResetPassword(setUser);
  };

  return (
    <DashboardLayout>
      <div className="w-full min-h-screen bg-[#F6F8FA] px-4 sm:px-3 py-6">
        <div className="max-w-[1200px] mx-auto">
          {/* TITLE */}
          <h2 className="text-[20px] font-[500] text-black mb-8">
            My Profile
          </h2>

          {/* PROFILE IMAGE */}
          <div className="relative w-[124px] h-[124px] mx-auto sm:mx-0 mb-12">
            <img
              src={displayedImage}
              alt="profile"
              className="w-full h-full rounded-full object-cover"
            />

            <button
              type="button"
              onClick={handlePickImage}
              className="
                absolute bottom-2 right-2
                w-[40px] h-[40px]
                rounded-full
                bg-white
                shadow-md
                flex items-center justify-center
                border border-[#E5E7EB]
              "
            >
              <Pencil className="w-5 h-5 text-black" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* FORM */}
          <div className="space-y-7">
            {/* NAME */}
            <div>
              <label className="text-[16px] font-medium text-black block mb-3">
                Full Name
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                readOnly={isProfileSet}
                className="
                  w-full
                  h-[48px]
                  rounded-[18px]
                  px-5
                  bg-white
                  border border-[#E5E7EB]
                  shadow-[0_4px_12px_rgba(0,0,0,0.08)]
                  text-[16px]
                  outline-none
                "
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-[16px] font-medium text-black block mb-3">
                Email ID
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                readOnly={isProfileSet}
                className="
                  w-full
                  h-[48px]
                  rounded-[18px]
                  px-5
                  bg-white
                  border border-[#E5E7EB]
                  shadow-[0_4px_12px_rgba(0,0,0,0.08)]
                  text-[16px]
                  outline-none
                "
              />
            </div>

            {/* PHONE */}
            <div>
              <label className="text-[16px] font-medium text-black block mb-3">
                Phone Number
              </label>

              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                readOnly={isProfileSet}
                className="
                  w-full
                  h-[48px]
                  rounded-[18px]
                  px-5
                  bg-white
                  border border-[#E5E7EB]
                  shadow-[0_4px_12px_rgba(0,0,0,0.08)]
                  text-[16px]
                  outline-none
                "
              />
            </div>

            {/* ADDRESS */}
            <div>
              <label className="text-[16px] font-medium text-black block mb-3">
                Address
              </label>

              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                readOnly={isProfileSet}
                className="
                  w-full
                  h-[48px]
                  rounded-[18px]
                  px-5
                  bg-white
                  border border-[#E5E7EB]
                  shadow-[0_4px_12px_rgba(0,0,0,0.08)]
                  text-[16px]
                  outline-none
                "
              />
            </div>

            {/* PASSWORD CARD */}
            <button
              type="button"
              onClick={handleChangePasswordClick}
              className="
                w-full
                h-[82px]
                rounded-[18px]
                bg-white
                border border-[#E5E7EB]
                shadow-[0_4px_12px_rgba(0,0,0,0.08)]
                px-5
                flex items-center justify-between
                text-left
              "
            >
              <div className="flex items-center gap-4">
                <div className="text-[16px] font-[500]">**|</div>

                <div>
                  <p className="text-[16px] font-medium text-black">
                    Change Password
                  </p>

                  <span className="text-[12px] text-gray-400">
                    Last Change {formatLastPasswordChange(profile?.last_password_change)}
                  </span>
                </div>
              </div>

              <ArrowRight className="w-7 h-7 text-black" />
            </button>
          </div>

          {/* STATUS */}
          {profileLoading ? (
            <p className="mt-4 text-sm text-gray-500">Loading profile...</p>
          ) : null}

          {errorMessage ? (
            <p className="mt-4 text-sm text-red-500">{errorMessage}</p>
          ) : null}

          {successMessage ? (
            <p className="mt-4 text-sm text-green-600">{successMessage}</p>
          ) : null}

          {imageUploading ? (
            <p className="mt-4 text-sm text-gray-500">Uploading image...</p>
          ) : null}

          {/* SAVE BUTTON */}
          {!isProfileSet ? (
            <div className="mt-10">
              <button
                type="button"
                onClick={handleSave}
                disabled={profileSaving}
                className="
                  bg-[#0D4CBA]
                  text-white
                  h-[48px]
                  w-full sm:w-[230px]
                  rounded-[16px]
                  text-[16px]
                  font-medium
                  shadow-[0_6px_14px_rgba(13,76,186,0.35)]
                  hover:bg-[#0b42a0]
                  transition
                  disabled:opacity-70
                  disabled:cursor-not-allowed
                "
              >
                {profileSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  );
}