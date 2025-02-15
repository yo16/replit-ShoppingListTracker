import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { webhookPayloadSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/webhook", async (req, res) => {
    try {
      const payload = webhookPayloadSchema.parse(req.body);

      // パスワードの検証
      const adminPassword = process.env.ADMIN_PASSWORD;
      if (!adminPassword) {
        throw new Error("Configuration error");
      }

      if (payload.password !== adminPassword) {
        return res.status(401).json({ message: "認証エラー" });
      }

      const webhookUrl = process.env.WEBHOOK_URL;
      if (!webhookUrl) {
        throw new Error("Configuration error");
      }

      // webhookへのリクエストからパスワードを除外
      const { password, ...webhookData } = payload;
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(webhookData)
      });

      // 成功時は単にステータスコード200のみを返す
      res.sendStatus(200);
    } catch (error) {
      console.error('Error sending webhook:', error);
      // エラー時も詳細は返さない
      res.status(500).json({ message: "Request failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}