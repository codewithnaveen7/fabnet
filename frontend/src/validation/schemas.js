import { z } from "zod";

const uuidSchema = z.string().uuid("Invalid service selection");

const certificationSchema = z.object({
  type: z.enum(["AS9100", "ISO9001"]),
  certified: z.boolean().default(false),
  expiryDate: z.union([z.string(), z.date(), z.null()]).optional(),
});

const supplierFieldsBase = {
  name: z.string().trim().min(1, "Full name is required").max(255),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  phone: z.string().trim().optional().or(z.literal("")),
  companyName: z.string().trim().min(1, "Company name is required").max(255),
  contactPerson: z.string().trim().min(1, "Contact person is required").max(255),
  address: z.string().trim().optional().or(z.literal("")),
  tradeLicenseNumber: z.string().trim().max(255).optional().or(z.literal("")),
  countryOfRegistration: z.string().trim().max(120).optional().or(z.literal("")),
  websiteUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => !val || /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(val),
      { message: "Enter a valid website URL" }
    ),
  comments: z.string().trim().max(2000, "Comments are too long").optional().or(z.literal("")),
  services: z.array(uuidSchema).default([]),
  itarRegistered: z.boolean().default(false),
  certifications: z.array(certificationSchema).default([
    { type: "AS9100", certified: false, expiryDate: null },
    { type: "ISO9001", certified: false, expiryDate: null },
  ]),
};

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const addSupplierSchema = z.object({
  ...supplierFieldsBase,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
});

export const editSupplierSchema = z.object({
  ...supplierFieldsBase,
  password: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || val.length >= 8, {
      message: "Password must be at least 8 characters",
    }),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
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

export const serviceSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  description: z.string().trim().optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const addRfqSchema = z.object({
  title: z.string().trim().min(1, "RFQ title is required").max(255),
  clientProjectName: z.string().trim().min(1, "Client / project name is required").max(255),
  quoteDueDate: z.union([z.date(), z.string()]).refine((v) => Boolean(v), {
    message: "Quote due date is required",
  }),
  requiredDeliveryDate: z.union([z.date(), z.string()]).refine((v) => Boolean(v), {
    message: "Required delivery date is required",
  }),
  partName: z.string().trim().min(1, "Part / assembly name is required").max(255),
  partNumber: z.string().trim().min(1, "Part number / drawing number is required").max(255),
  revisionLevel: z.string().trim().max(50).optional().or(z.literal("")),
  quantity: z.coerce.number({ invalid_type_error: "Quantity is required" }).positive("Quantity must be greater than 0"),
  unitOfMeasure: z.string().trim().min(1, "Unit of measure is required"),
  processServiceIds: z.array(z.string().uuid()).default([]),
  materialSpecification: z.string().trim().max(2000).optional().or(z.literal("")),
  specialProcesses: z.array(z.string()).default([]),
  toleranceNotes: z.string().trim().max(5000).optional().or(z.literal("")),
  requiredCertifications: z.array(z.string()).default([]),
  itarExportControl: z.boolean({ required_error: "ITAR / export control is required" }),
  countryOfOriginRestriction: z.string().trim().optional().or(z.literal("")),
  incoterms: z.string().trim().min(1, "Incoterms is required"),
  targetBudgetaryPrice: z
    .union([z.coerce.number().nonnegative(), z.literal(""), z.null()])
    .optional(),
  paymentTerms: z.string().trim().optional().or(z.literal("")),
  currency: z.string().trim().min(1, "Currency is required"),
  quotesRequired: z
    .union([z.coerce.number().int().positive(), z.literal(""), z.null()])
    .optional(),
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
  services: z.array(z.string()).default([]),
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
