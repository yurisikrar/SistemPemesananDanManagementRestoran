import { db } from "../index";
import { meja } from "../schema";

async function main() {
  console.log("Seeding data meja...");
  
  const dataMeja = [];
  for (let i = 1; i <= 10; i++) {
    dataMeja.push({
      nomor_meja: `Meja ${i}`,
      status: "Tersedia" as const
    });
  }

  await db.insert(meja).values(dataMeja);
  console.log("Seeding selesai!");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
