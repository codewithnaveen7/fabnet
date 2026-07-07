import { z } from "zod";

const SERVICE_TYPES = [
  "DESIGN",
  "MANUFACTURING",
  "INSPECTION",
  "LOGISTICS",
  "PACKAGING",
  "CERTIFICATION",
];

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const addSupplierSchema = z.object({
  name: z.string().trim().min(1, "Full name is required").max(255),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
  phone: z.string().trim().optional().or(z.literal("")),
  companyName: z.string().trim().min(1, "Company name is required").max(255),
  contactPerson: z.string().trim().min(1, "Contact person is required").max(255),
  address: z.string().trim().optional().or(z.literal("")),
  services: z.array(z.enum(SERVICE_TYPES)).default([]),
});

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Full name is required").max(255),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  phone: z.string().trim().optional().or(z.literal("")),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(128, "Password is too long"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const bulkSupplierRowSchema = z.object({
  row: z.number().optional(),
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().min(1, "Email is required").email("Invalid email"),
  password: z
    .string()
    .trim()
    .optional()
    .transform((val) => val || "Supplier@123")
    .pipe(z.string().min(8, "Password must be at least 8 characters")),
  phone: z.string().trim().optional().or(z.literal("")),
  companyName: z.string().trim().min(1, "Company name is required"),
  contactPerson: z.string().trim().min(1, "Contact person is required"),
  address: z.string().trim().optional().or(z.literal("")),
  services: z.array(z.enum(SERVICE_TYPES)).default([]),
});

export function validateBulkSupplierRows(rows) {
  return rows.map((row) => {
    const result = bulkSupplierRowSchema.safeParse(row);
    if (result.success) {
      return { row: row.row, valid: true, data: result.data, errors: [] };
    }
    return {
      row: row.row,
      valid: false,
      data: row,
      errors: result.error.issues.map((issue) => issue.message),
    };
  });
}
