import { z } from "zod";

export const checkoutSchema = z.object({
  customer_name: z
    .string()
    .min(3, "Nama minimal 3 karakter")
    .max(100, "Nama maksimal 100 karakter"),

  customer_phone: z
    .string()
    .min(1, "Nomor HP wajib diisi")
    .regex(
      /^(\+62|62|0)8[1-9][0-9]{6,10}$/,
      "Format nomor HP tidak valid (contoh: 081234567890 atau +6281234567890)"
    ),

  customer_email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),

  customer_address: z
    .string()
    .min(10, "Alamat minimal 10 karakter")
    .max(500, "Alamat maksimal 500 karakter"),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;