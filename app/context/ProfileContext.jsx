"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getProfileApi,
  setProfileApi,
  updateProfileApi,
} from "../services/profileService";

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setProfileLoading(true);
      setProfileError("");

      const res = await getProfileApi();
      setProfile(res?.data || null);

      return res?.data || null;
    } catch (error) {
      setProfileError(error.message || "Failed to fetch profile");
      setProfile(null);
      return null;
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const setInitialProfile = useCallback(async ({ name, email, phone, address, imageFile }) => {
    try {
      setProfileSaving(true);
      setProfileError("");

      const formData = new FormData();
      formData.append("name", name || "");
      formData.append("email", email || "");
      formData.append("phone", phone || "");
      formData.append("address", address || "");

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await setProfileApi(formData);
      setProfile(res?.data || null);

      return res?.data || null;
    } catch (error) {
      setProfileError(error.message || "Failed to set profile");
      throw error;
    } finally {
      setProfileSaving(false);
    }
  }, []);

  const updateProfileImageOnly = useCallback(async (imageFile) => {
    try {
      setImageUploading(true);
      setProfileError("");

      const formData = new FormData();
      formData.append("image", imageFile);

      const res = await updateProfileApi(formData);
      setProfile(res?.data || null);

      return res?.data || null;
    } catch (error) {
      setProfileError(error.message || "Failed to update profile image");
      throw error;
    } finally {
      setImageUploading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const value = useMemo(() => {
    return {
      profile,
      setProfile,
      profileLoading,
      profileError,
      profileSaving,
      imageUploading,
      fetchProfile,
      setInitialProfile,
      updateProfileImageOnly,
    };
  }, [
    profile,
    profileLoading,
    profileError,
    profileSaving,
    imageUploading,
    fetchProfile,
    setInitialProfile,
    updateProfileImageOnly,
  ]);

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error("useProfile must be used within ProfileProvider");
  }

  return context;
}