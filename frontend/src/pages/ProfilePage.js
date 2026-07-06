import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { KButton, KDivider, KInputText, KPassword } from "kdesigns/KDesign";
import { useMutationPost } from "kdesigns/KHooks";
import "kdesigns/kDesignStyle";
import FormField from "../components/FormField";
import ValidatedField, { fieldClassName } from "../components/ValidatedField";
import { selectRole, selectUser, setUser } from "../store/authSlice";
import { changePasswordSchema, profileSchema } from "../validation/schemas";
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

  const [profileSubmitError, setProfileSubmitError] = useState("");
  const [passwordSubmitError, setPasswordSubmitError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", email: "", phone: "" },
    mode: "onTouched",
  });

  const passwordForm = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user, profileForm]);

  const onProfileSubmit = async (values) => {
    setProfileSubmitError("");
    setProfileSuccess("");
    try {
      const result = await updateProfile(
        values,
        "FABNET_UPDATE_PROFILE",
        "/auth/profile",
      );
      const updatedUser = unwrapApiData(result);
      if (updatedUser) {
        dispatch(setUser(updatedUser));
        setProfileSuccess("Profile updated successfully.");
      }
    } catch {
      setProfileSubmitError("Unable to update profile.");
    }
  };

  const onPasswordSubmit = async ({ currentPassword, newPassword }) => {
    setPasswordSubmitError("");
    setPasswordSuccess("");
    try {
      await changePassword(
        { currentPassword, newPassword },
        "FABNET_CHANGE_PASSWORD",
        "/auth/password",
      );
      passwordForm.reset();
      setPasswordSuccess("Password changed successfully.");
    } catch {
      setPasswordSubmitError("Unable to change password.");
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
              <form
                onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                noValidate
                className="p-fluid"
              >
                <ValidatedField
                  name="name"
                  control={profileForm.control}
                  label="Full name"
                  htmlFor="name"
                  render={(field, fieldState) => (
                    <KInputText
                      id="name"
                      {...field}
                      className={fieldClassName(fieldState)}
                    />
                  )}
                />
                <ValidatedField
                  name="email"
                  control={profileForm.control}
                  label="Email address"
                  htmlFor="profileEmail"
                  render={(field, fieldState) => (
                    <KInputText
                      id="profileEmail"
                      type="email"
                      {...field}
                      className={fieldClassName(fieldState)}
                    />
                  )}
                />
                <ValidatedField
                  name="phone"
                  control={profileForm.control}
                  label="Phone number"
                  htmlFor="phone"
                  render={(field, fieldState) => (
                    <KInputText
                      id="phone"
                      {...field}
                      className={fieldClassName(fieldState)}
                    />
                  )}
                />
                {role === "SUPPLIER" ? (
                  <FormField label="Company" htmlFor="company">
                    <KInputText
                      id="company"
                      value={user?.supplierProfile?.companyName || ""}
                      disabled
                      readOnly
                    />
                  </FormField>
                ) : null}
                {profileSubmitError ? (
                  <small className="p-error block mb-2">{profileSubmitError}</small>
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
              <form
                onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                noValidate
                className="p-fluid"
              >
                <ValidatedField
                  name="currentPassword"
                  control={passwordForm.control}
                  label="Current password"
                  htmlFor="currentPassword"
                  render={(field, fieldState) => (
                    <KPassword
                      id="currentPassword"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      inputRef={field.ref}
                      feedback={false}
                      toggleMask
                      className={fieldClassName(fieldState)}
                    />
                  )}
                />
                <KDivider />
                <ValidatedField
                  name="newPassword"
                  control={passwordForm.control}
                  label="New password"
                  htmlFor="newPassword"
                  render={(field, fieldState) => (
                    <KPassword
                      id="newPassword"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      inputRef={field.ref}
                      toggleMask
                      className={fieldClassName(fieldState)}
                    />
                  )}
                />
                <ValidatedField
                  name="confirmPassword"
                  control={passwordForm.control}
                  label="Confirm new password"
                  htmlFor="confirmPassword"
                  render={(field, fieldState) => (
                    <KPassword
                      id="confirmPassword"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      inputRef={field.ref}
                      feedback={false}
                      toggleMask
                      className={fieldClassName(fieldState)}
                    />
                  )}
                />
                {passwordSubmitError ? (
                  <small className="p-error block mb-2">{passwordSubmitError}</small>
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
