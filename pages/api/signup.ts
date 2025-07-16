// pages/api/signup.ts
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ message: "Email is already registered" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const colors = ["red", "blue", "green", "purple", "orange"];
    const color = colors[Math.floor(Math.random() * colors.length)];
  
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        color,  // ランダムな色をセット
      },
    });
    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}
