// pages/api/user/upload-icon.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";

// formidableはbodyParserと競合するため無効化
export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadsDir = path.join(process.cwd(), "public/uploads/icons");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = new IncomingForm({
    uploadDir: uploadsDir,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // 5MB
  });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Upload error" });

    const file = files.file?.[0] || files.file;
    const userId = fields.userId?.[0] || fields.userId;
    if (!file || !userId) return res.status(400).json({ error: "Missing data" });

    const ext = path.extname(file.originalFilename || "").toLowerCase();
    if (![".png", ".jpg", ".jpeg"].includes(ext)) {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    const targetPath = path.join(uploadsDir, `user_${userId}${ext}`);
    await fs.promises.rename(file.filepath, targetPath);

    const publicPath = `/uploads/icons/user_${userId}${ext}`;
    return res.status(200).json({ url: publicPath });
  });
}
