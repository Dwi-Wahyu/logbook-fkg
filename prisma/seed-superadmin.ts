import { PrismaClient } from "@/generated/prisma";
import { hashSync } from "bcryptjs";
import { config } from "dotenv";

config();

const prisma = new PrismaClient();

export async function seedSuperadmin() {
  console.log("Memulai proses seeding untuk akun SUPERADMIN...");

  // Membersihkan akun superadmin lama
  await prisma.pengguna.deleteMany({
    where: {
      peran: "SUPERADMIN",
    },
  });
  console.log("Data akun SUPERADMIN lama berhasil dibersihkan (jika ada).");

  // Cari setidaknya 1 Program Studi untuk relasi superadmin
  const findFirstProgramStudi = await prisma.programStudi.findFirst();

  if (!findFirstProgramStudi) {
    console.error(
      "Gagal seeding SUPERADMIN: Tidak ada Program Studi yang ditemukan. Jalankan seeder prodi terlebih dahulu!",
    );
    return;
  }

  const superadminUsername =
    process.env.SUPERADMIN_USERNAME ?? "admin@gmail.com";
  const superadminPassword = process.env.SUPERADMIN_PASSWORD ?? "admin123";

  const superAdmin = await prisma.pengguna.create({
    data: {
      nama: "Super Administrator",
      username: superadminUsername,
      password: hashSync(superadminPassword, 10),
      peran: "SUPERADMIN",
      avatar: null,
      programStudiId: findFirstProgramStudi.id,
    },
  });

  console.log(
    `Berhasil seeded akun SUPERADMIN: ${superAdmin.nama} (username: ${superAdmin.username})`,
  );
}

// Eksekusi jika file ini dijalankan langsung via CLI
if (require.main === module) {
  seedSuperadmin()
    .then(async () => {
      await prisma.$disconnect();
      console.log("Koneksi database terputus.");
    })
    .catch(async (e) => {
      console.error("Terjadi kesalahan saat seeding SUPERADMIN:", e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
