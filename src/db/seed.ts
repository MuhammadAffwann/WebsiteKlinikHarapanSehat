import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { admins } from "./schema";

async function seed() {
  const email = process.env["ADMIN_EMAIL"] || "admin@harapansehat.id";
  const password = process.env["ADMIN_PASSWORD"] || "admin123456";

  console.log(`Checking admin account for ${email}...`);

  const existing = await db.select().from(admins).where(eq(admins.email, email)).get();

  if (existing) {
    console.log(`Admin account ${email} already exists. Skipping insertion.`);
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  await db.insert(admins).values({
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
  });

  console.log(`Successfully created admin account: ${email}`);
}

seed()
  .then(() => {
    console.log("Seed completed successfully.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
