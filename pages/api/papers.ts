// pages/api/papers.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const session = await getSession({ req });
    if (!session?.user?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { title, authors, year, pdfUrl } = req.body;

    if (!title || !authors || !year || !pdfUrl) {
      return res.status(400).json({ message: "必須項目が不足しています" });
    }

    try {
      // 新しいPaperをDBに登録
      const newPaper = await prisma.paper.create({
        data: {
          title,
          authors,
          year,
          pdfUrl,
          createdAt: new Date(),
        },
      });

      return res.status(201).json(newPaper);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "内部サーバーエラー" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
