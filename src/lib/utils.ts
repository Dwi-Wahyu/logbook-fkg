import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Mengkonversi string fieldName menjadi format camelCase yang cocok untuk template key.
 * Contoh: "Nama Pasien" -> "namaPasien"
 * "No. RM"      -> "noRm"
 * "Jam Mulai"   -> "jamMulai"
 * @param fieldName Nama field dari ProgramStudiField
 * @returns String dalam format camelCase
 */
export function generateCamelCaseKey(fieldName: string): string {
  if (!fieldName) return "";
  return fieldName
    .normalize("NFD") // Normalisasi karakter Unicode
    .replace(/[\u0300-\u036f]/g, "") // Hapus diakritik
    .toLowerCase() // Ubah menjadi huruf kecil semua
    .replace(/[^a-zA-Z0-9\s]/g, "") // Hapus karakter non-alfanumerik kecuali spasi
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, ""); // Hapus semua spasi
}
