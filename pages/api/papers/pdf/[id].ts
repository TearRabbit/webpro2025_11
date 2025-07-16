// pages/api/papers/pdf/[id].ts
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id);
  if (isNaN(id)) {
    console.warn("Invalid paper ID:", req.query.id);
    return res.status(400).json({ error: "Invalid paper ID" });
  }

  const paper = await prisma.paper.findUnique({ where: { id } });
  if (!paper) {
    console.warn("Paper not found in DB for ID:", id);
    return res.status(404).json({ error: "Paper not found" });
  }

  console.log("Paper record from DB:", paper);
  const pdfUrl = paper.pdfUrl;
  const filePath = path.join(process.cwd(), "public", pdfUrl);
  console.log("Attempting to read file at:", filePath);

  if (!fs.existsSync(filePath)) {
    console.error("File does not exist:", filePath);
    return res.status(404).json({ error: "PDF file not found" });
  }

  const stat = fs.statSync(filePath);
  res.writeHead(200, {
    "Content-Type": "application/pdf",
    "Content-Length": stat.size,
    "Content-Disposition": "inline", // attachmentにするとDLされる
  });

  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
}
