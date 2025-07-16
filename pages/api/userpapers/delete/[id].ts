// pages/api/userpapers/delete/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const session = await getSession({ req });
  if (!session?.user?.email) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userPaperId = Number(req.query.id); // URLからuserPaperのIDを取得
  if (isNaN(userPaperId)) {
    return res.status(400).json({ message: "Invalid UserPaper ID" });
  }

  try {
    // 削除対象のUserPaperを取得し、現在のユーザーがそのオーナーであることを確認
    // これにより、他のユーザーのUserPaperを誤って削除することを防ぐ
    const userPaperToDelete = await prisma.userPaper.findUnique({
      where: { id: userPaperId },
      include: { user: true }, // 関連するUser情報も取得
    });

    if (!userPaperToDelete) {
      return res.status(404).json({ message: "UserPaper not found" });
    }

    // セッションのメールアドレスとUserPaperのユーザーメールアドレスを比較
    if (userPaperToDelete.user.email !== session.user.email) {
      return res.status(403).json({ message: "Forbidden: You do not own this paper entry." });
    }

    // UserPaperを削除
    await prisma.userPaper.delete({
      where: { id: userPaperId },
    });

    return res.status(200).json({ message: "UserPaper deleted successfully" });
  } catch (error) {
    console.error("Error deleting UserPaper:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}