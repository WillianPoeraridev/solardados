import "dotenv/config";
import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();

  try {
    const result = await prisma.$queryRaw<
      { table_name: string }[]
    >`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`;

    const tabelas = result
      .map((r) => r.table_name)
      .filter((name) => name !== "_prisma_migrations");

    console.log(`✅ Conexão OK — ${tabelas.length} tabelas criadas`);
    console.log(`   ${tabelas.join(", ")}`);
  } catch (error) {
    console.error("❌ Falha na conexão:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
