// pages/api/comments/add.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const session = await getSession({ req });
  console.log("API side session:", session);

  if (!session?.user?.email) {
    console.log("Unauthorized: Session or email missing.");
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { userPaperId, page, x, y, body } = req.body;

  // 必須フィールドのバリデーション
  if (!userPaperId || typeof page !== 'number' || typeof x !== 'number' || typeof y !== 'number' || !body) {
    return res.status(400).json({ message: "Missing required fields (userPaperId, page, x, y, body)" });
  }

  try {
    // コメントを追加するUserPaperが存在し、かつ現在のユーザーに紐づいているか確認
    const existingUserPaper = await prisma.userPaper.findUnique({
      where: { id: userPaperId },
      include: { user: true },
    });

    if (!existingUserPaper) {
      return res.status(404).json({ message: "UserPaper not found" });
    }
    if (existingUserPaper.user.email !== session.user.email) {
      return res.status(403).json({ message: "Forbidden: You do not own this UserPaper." });
    }

    // コメントを作成
    const newComment = await prisma.comment.create({
      data: {
        userPaperId: userPaperId,
        page: page,
        x: x,
        y: y,
        body: body,
        // expanded, hidden はデフォルト値が設定されているため指定不要
      },
    });

    return res.status(201).json({ message: "Comment added successfully", comment: newComment });
  } catch (error) {
    console.error("Error adding comment:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}