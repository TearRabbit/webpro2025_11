// pages/api/auth/register.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { name, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required." });
  }

  // 重複チェック
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(409).json({ error: "User already exists." });
  }

  // パスワードハッシュ化
  const hashedPassword = await bcrypt.hash(password, 10);

  // ユーザ作成
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      color: "#000000",  // デフォルト色など適宜設定
    },
  });

  return res.status(201).json({ message: "User created", userId: user.id });
}
