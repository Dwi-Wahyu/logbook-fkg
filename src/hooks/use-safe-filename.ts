// hooks/use-safe-filename.ts
import { randomUUID } from "crypto";
import { extname } from "path";
import { useCallback } from "react";

export function useSafeFilename() {
  /**
   * Generate nama file yang unik dan aman
   * @param originalName Nama file asli (contoh: "avatar.jpg")
   * @returns Nama file unik (contoh: "3b9db6f0-1dd8-11ee-be56-0242ac120002.jpg")
   */
  const generateSafeFilename = useCallback((originalName: string): string => {
    const ext = extname(originalName); // Ambil ekstensi file
    return randomUUID() + ext; // Gabungkan UUID dengan ekstensi
  }, []);

  return { generateSafeFilename };
}

export const generateSafeFilename = (originalName: string): string => {
  const ext = extname(originalName); // Ambil ekstensi file
  return randomUUID() + ext; // Gabungkan UUID dengan ekstensi
};
