// pages/api/userpapers/add.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const session = await getSession({ req });
  if (!session?.user?.email) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { title, authors, year } = req.body;
  if (!title || !authors || !year) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Paperがすでに存在するか確認（タイトルと著者で簡易的に）
    let paper = await prisma.paper.findFirst({
      where: { title, authors, year: Number(year) },
    });

    if (!paper) {
      paper = await prisma.paper.create({
        data: { title, authors, year: Number(year), pdfUrl: "" },
      });
    }

    // UserPaperが既に存在していなければ作成
    const existing = await prisma.userPaper.findUnique({
      where: {
        userId_paperId: {
          userId: user.id,
          paperId: paper.id,
        },
      },
    });

    if (!existing) {
      await prisma.userPaper.create({
        data: {
          userId: user.id,
          paperId: paper.id,
        },
      });
    }

    return res.status(201).json({ message: "Paper added successfully", paper });
  } catch (error) {
    console.error("Error adding paper:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
