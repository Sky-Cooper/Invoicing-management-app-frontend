import { z } from 'zod';

export const registerSchema = z.object({
  // --- 1. Personal Info ---
  first_name: z.string().min(2, "First name is too short"),
  last_name: z.string().min(2, "Last name is too short"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be 8+ chars"),
  phone_number: z.string().min(10, "Phone number required"),
  preferred_language: z.enum(["fr", "en", "ar"]).default("fr"),

  // --- 2. Company Info ---
  company_name: z.string().min(2, "Company name required"),
  company_address: z.string().min(5, "Address required"),
  company_phone: z.string().min(10, "Company phone required"),
  company_email: z.string().email("Invalid company email"),
  
  // --- 3. Legal & Banking ---
  ice: z.string().min(1, "ICE is required"),
  rc: z.string().min(1, "RC is required"),
  patent: z.string().min(1, "Patent is required"),
  website: z.string().url("Must include http:// or https://").optional().or(z.literal("")),
  bank_name: z.string().min(2, "Bank name required"),
  bank_account_number: z.string().min(5, "Account number required"),
  bank_rib: z.string().min(24, "RIB must be 24 digits").optional().or(z.literal("")),
});

export type RegisterFormData = z.infer<typeof registerSchema>;