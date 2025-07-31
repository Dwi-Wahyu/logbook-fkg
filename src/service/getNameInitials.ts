export function getNameInitials(nama: string): string {
  const kata = nama.trim().split(/\s+/);
  const inisial = kata.slice(0, 2).map((k) => k[0]?.toUpperCase() || "");
  return inisial.join("");
}
