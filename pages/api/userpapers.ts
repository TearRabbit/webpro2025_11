// pages/api/userpapers.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session?.user?.email) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // `comments` を include に追加
    const userPapers = await prisma.userPaper.findMany({
      where: { userId: user.id },
      include: {
        paper: true,
        progress: true,
        likes: true,
        bookmarks: true,
        comments: true, // 👈 ここを追加
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(userPapers);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}