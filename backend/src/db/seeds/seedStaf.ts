import { db } from "../index";
import { staf } from "../schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

async function seedStaf() {
  console.log("Seeding staf kasir...");

  try {
    const existing = await db.select().from(staf).where(eq(staf.username, "kasir1")).limit(1);

    if (existing.length > 0) {
      console.log("Staf kasir1 sudah ada di database.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("kasir123", 10);

    await db.insert(staf).values({
      username: "kasir1",
      password: hashedPassword,
      nama_lengkap: "Budi (Kasir 1)",
      role: "Kasir",
    });

    console.log("Berhasil mendaftarkan 1 staf kasir ke database:");
    console.log("Username: kasir1");
    console.log("Password: kasir123");
    process.exit(0);
  } catch (err) {
    console.error("Gagal mendaftarkan staf:", err);
    process.exit(1);
  }
}

seedStaf();
