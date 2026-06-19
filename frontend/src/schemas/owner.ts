import { z } from "zod";

export const ownerSchema = z.object({
  businessType: z.string().default("Individual"),
  businessName: z.string().optional(),
  taxCode: z.string().optional(),
  businessAddress: z.string().optional(),
  repFullName: z.string().min(1, "Vui lòng nhập họ và tên"),
  repPosition: z.string().optional(),
  repPhone: z.string().min(1, "Vui lòng nhập số điện thoại"),
  repEmail: z
    .string()
    .min(1, "Vui lòng nhập email")
    .email("Email không hợp lệ"),
  repIdType: z.string().default("CCCD"),
  repIdNumber: z.string().min(1, "Vui lòng nhập số CCCD/CMND"),
  repIdIssuedDate: z.string().optional(),
  repIdIssuedPlace: z.string().optional(),
});

export type OwnerFormData = z.infer<typeof ownerSchema>;
