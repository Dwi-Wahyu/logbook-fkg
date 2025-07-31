// lib/server-action-utils.ts
import { z, ZodError, ZodType } from "zod";

// Perbarui tipe ServerActionResponse untuk selalu menyertakan `message`
type ServerActionResponse<T = any> = {
  success: boolean;
  data?: T;
  message?: string; // Pastikan pesan selalu ada di root level untuk frontend
  error?: any; // Untuk error internal/raw, opsional
  errorCode?: string;
  field?: string;
  validationErrors?: {
    path: string;
    message: string;
  }[];
};

export async function validateServerActionPayload<T extends ZodType>(
  payload: unknown,
  schema: T
): Promise<{ data?: z.infer<T>; error?: ServerActionResponse }> {
  try {
    const data = schema.parse(payload);
    return { data };
  } catch (error) {
    if (error instanceof ZodError) {
      // Untuk ZodError, buat pesan gabungan
      const messages = error.errors.map(
        (e) => `${e.path.join(".")}: ${e.message}`
      );
      return {
        error: {
          success: false,
          message: `Validasi gagal: ${messages.join("; ")}`, // Pesan gabungan untuk frontend
          validationErrors: error.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        },
      };
    }
    // Untuk error non-Zod, berikan pesan umum
    return {
      error: {
        success: false,
        message: "Payload tidak valid atau terjadi kesalahan internal.",
        error: error, // Menyertakan error asli untuk logging internal
      },
    };
  }
}

// Pastikan handlePrismaUniqueViolation juga mengembalikan `message`
export function handlePrismaUniqueViolation(error: any): ServerActionResponse {
  if (error.code === "P2002") {
    const { target, value } = error.meta;
    const fieldName = target instanceof Array ? target[0] : target; // Ambil nama field
    const displayMessage = `Data duplikat untuk '${value}' pada field '${fieldName}'.`;
    return {
      success: false,
      errorCode: "P2002",
      field: fieldName,
      message: displayMessage, // Sertakan pesan yang user-friendly
      error: error, // Sertakan error asli untuk logging internal
    };
  }

  return {
    success: false,
    message: "Terjadi kesalahan database yang tidak diketahui.", // Pesan default
    error: error,
  };
}

// executeServerActionPayload (tetap sama jika Anda menggunakannya)
export async function executeServerActionPayload<T>(
  action: () => Promise<T>
): Promise<ServerActionResponse<T>> {
  try {
    const data = await action();
    return {
      success: true,
      data,
      message: "Operasi berhasil.", // Default message for success
    };
  } catch (error) {
    return handlePrismaUniqueViolation(error); // Mengembalikan ServerActionResponse dengan message
  }
}
