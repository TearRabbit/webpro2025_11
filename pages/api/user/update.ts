// pages/api/user/update.ts
import { getToken } from "next-auth/jwt";
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const secret = process.env.NEXTAUTH_SECRET!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = await getToken({ req, secret });
  if (!token || !token.id) return res.status(401).json({ message: "Unauthorized" });

  if (req.method === "POST") {
    const { name, color, iconUrl } = req.body;

    try {
      await prisma.user.update({
        where: { id: token.id as number },
        data: { name, color, iconUrl },
      });

      // 更新後のユーザー情報を取得してログ出力
      const updatedUser = await prisma.user.findUnique({
        where: { id: token.id as number },
      });
      console.log("Updated user:", updatedUser);

      res.status(200).json({ message: "Updated" });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Failed to update profile" });
    }
  } else {
    res.status(405).end();
  }
}

