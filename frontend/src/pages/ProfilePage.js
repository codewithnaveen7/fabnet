import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { KButton, KDivider, KInputText, KPassword } from "kdesigns/KDesign";
import { useMutationPost } from "kdesigns/KHooks";
import "kdesigns/kDesignStyle";
import FormField from "../components/FormField";
import { selectRole, selectUser, setUser } from "../store/authSlice";
import { unwrapApiData } from "../utils/apiResponse";
import "../styles/dashboard.css";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const role = useSelector(selectRole);

  const { postData: updateProfile, loading: savingProfile } = useMutationPost({
    mutationKey: ["fabnet-profile"],
  });
  const { postData: changePassword, loading: savingPassword } = useMutationPost({
    mutationKey: ["fabnet-password"],
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setPhone(user?.phone || "");
    setCompanyName(user?.supplierProfile?.companyName || "");
  }, [user]);

  const handleProfileSave = async (event) => {
    event.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    try {
      const result = await updateProfile(
        { name, email, phone },
        "FABNET_UPDATE_PROFILE",
        "/auth/profile",
      );
      const updatedUser = unwrapApiData(result);
      if (updatedUser) {
        dispatch(setUser(updatedUser));
        setProfileSuccess("Profile updated successfully.");
      }
    } catch {
      setProfileError("Unable to update profile.");
    }
  };

  const handlePasswordSave = async (event) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    try {
      await changePassword(
        { currentPassword, newPassword },
        "FABNET_CHANGE_PASSWORD",
        "/auth/password",
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess("Password changed successfully.");
    } catch {
      setPasswordError("Unable to change password.");
    }
  };

  return (
    <div>
      <h1 className="fn-page-title">Profile Settings</h1>
      <p className="fn-page-subtitle">
        Manage your personal information and account security.
      </p>

      <div className="grid">
        <div className="col-12 lg:col-6">
          <div className="fn-panel">
            <div className="fn-panel-header">
              <h3>Personal information</h3>
            </div>
            <div className="fn-panel-body">
              <form onSubmit={handleProfileSave} className="p-fluid">
                <FormField label="Full name" htmlFor="name">
                  <KInputText
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </FormField>
                <FormField label="Email address" htmlFor="profileEmail">
                  <KInputText
                    id="profileEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </FormField>
                <FormField label="Phone number" htmlFor="phone">
                  <KInputText
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </FormField>
                {role === "SUPPLIER" ? (
                  <FormField label="Company" htmlFor="company">
                    <KInputText
                      id="company"
                      value={companyName}
                      disabled
                      readOnly
                    />
                  </FormField>
                ) : null}
                {profileError ? (
                  <small className="p-error block mb-2">{profileError}</small>
                ) : null}
                {profileSuccess ? (
                  <small className="text-green-600 block mb-2">{profileSuccess}</small>
                ) : null}
                <KButton type="submit" label="Save changes" loading={savingProfile} />
              </form>
            </div>
          </div>
        </div>

        <div className="col-12 lg:col-6">
          <div className="fn-panel">
            <div className="fn-panel-header">
              <h3>Security</h3>
            </div>
            <div className="fn-panel-body">
              <form onSubmit={handlePasswordSave} className="p-fluid">
                <FormField label="Current password" htmlFor="currentPassword">
                  <KPassword
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    feedback={false}
                    toggleMask
                    required
                  />
                </FormField>
                <KDivider />
                <FormField label="New password" htmlFor="newPassword">
                  <KPassword
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    toggleMask
                    required
                  />
                </FormField>
                <FormField label="Confirm new password" htmlFor="confirmPassword">
                  <KPassword
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    feedback={false}
                    toggleMask
                    required
                  />
                </FormField>
                {passwordError ? (
                  <small className="p-error block mb-2">{passwordError}</small>
                ) : null}
                {passwordSuccess ? (
                  <small className="text-green-600 block mb-2">{passwordSuccess}</small>
                ) : null}
                <KButton
                  type="submit"
                  label="Update password"
                  severity="secondary"
                  loading={savingPassword}
                />
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
