import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();
const chats = await prisma.whatsAppChat.findMany();
console.log('CHATS:', chats.map(c => ({ id: c.id, name: c.name, createdAt: c.createdAt, updatedAt: c.updatedAt })));
await prisma.$disconnect();
