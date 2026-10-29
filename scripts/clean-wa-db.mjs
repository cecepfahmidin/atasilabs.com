import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  for (let i = 0; i < 5; i++) {
    await prisma.whatsAppMessage.deleteMany({});
    await prisma.whatsAppChat.deleteMany({});
    const m = await prisma.whatsAppMessage.count();
    const c = await prisma.whatsAppChat.count();
    console.log(`Loop ${i + 1} -> Messages: ${m}, Chats: ${c}`);
    if (m === 0 && c === 0) break;
    await new Promise((r) => setTimeout(r, 1000));
  }
  await prisma.$disconnect();
}

main().catch(console.error);
