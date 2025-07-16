// pages/api/papers/add.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm, Fields, Files } from "formidable";
import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";
import { getSession } from "next-auth/react";

export const config = { api: { bodyParser: false } };

const prisma = new PrismaClient();
const uploadDir = path.join(process.cwd(), "public/uploads/papers");

// アップロードディレクトリが存在しない場合は作成
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

function parseForm(req: NextApiRequest): Promise<{ fields: Fields; files: Files }> {
  const form = new IncomingForm({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 20 * 1024 * 1024, // 20MB
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const session = await getSession({ req });
    if (!session?.user?.email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { fields, files } = await parseForm(req);
    const { title, authors, year } = fields;
    const file = files.file;

    if (!title || !authors || !year || !file) {
      return res.status(400).json({ error: "Missing data" });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let filePath: string;
    if (Array.isArray(file)) {
      filePath = (file[0] as any).filepath;
    } else {
      filePath = (file as any).filepath;
    }

    const fileName = path.basename(filePath);
    const pdfUrl = `/uploads/papers/${fileName}`;

    // 論文を登録
    const newPaper = await prisma.paper.create({
      data: {
        title: String(title),
        authors: String(authors),
        year: parseInt(String(year)),
        pdfUrl,
      },
    });

    // UserPaperを作成して紐づけ
    await prisma.userPaper.create({
      data: {
        userId: user.id,
        paperId: newPaper.id,
      },
    });

    return res.status(200).json({ message: "Paper added successfully", paper: newPaper });
  } catch (err) {
    console.error("Failed to add paper:", err);
    return res.status(500).json({ error: "Failed to save paper" });
  }
}
