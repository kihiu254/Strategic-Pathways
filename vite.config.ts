import path from "path"
import type { IncomingMessage, ServerResponse } from "node:http"
import react from "@vitejs/plugin-react"
import type { VercelRequest, VercelResponse } from "@vercel/node"
import { defineConfig, loadEnv, type PluginOption } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'
import authEmailOtpHandler from "./api/auth-email-otp"
import notificationsHandler from "./api/notifications"
import sendHandler from "./api/send"
import initializePaystackHandler from "./api/paystack/initialize"
import verifyPaystackHandler from "./api/paystack/verify"

type ApiHandler = (req: VercelRequest, res: VercelResponse) => Promise<unknown> | unknown

const readJsonBody = async (req: IncomingMessage) => {
  const chunks: Buffer[] = []

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  if (!chunks.length) {
    return {}
  }

  const rawBody = Buffer.concat(chunks).toString("utf8").trim()

  if (!rawBody) {
    return {}
  }

  try {
    return JSON.parse(rawBody)
  } catch {
    return {}
  }
}

const createJsonResponse = (res: ServerResponse) => {
  const response = res as VercelResponse

  response.status = ((statusCode: number) => {
    res.statusCode = statusCode
    return response
  }) as VercelResponse["status"]

  response.json = ((body: unknown) => {
    if (!res.headersSent) {
      res.setHeader("Content-Type", "application/json")
    }

    res.end(JSON.stringify(body))
    return response
  }) as VercelResponse["json"]

  return response
}

const localApiPlugin = (): PluginOption => ({
  name: "local-api",
  apply: "serve",
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const pathname = req.url ? req.url.split("?")[0] : ""
      const handlers: Record<string, ApiHandler> = {
        "/api/auth-email-otp": authEmailOtpHandler,
        "/api/notifications": notificationsHandler,
        "/api/send": sendHandler,
        "/api/paystack/initialize": initializePaystackHandler,
        "/api/paystack/verify": verifyPaystackHandler,
      }
      const handler = handlers[pathname] ?? null

      if (!handler) {
        next()
        return
      }

      try {
        ;(req as VercelRequest).body = await readJsonBody(req)
        await handler(req as VercelRequest, createJsonResponse(res))
      } catch (error) {
        console.error(`Local API error for ${pathname}:`, error)

        if (!res.headersSent) {
          res.statusCode = 500
          res.setHeader("Content-Type", "application/json")
          res.end(
            JSON.stringify({
              error: error instanceof Error ? error.message : "Local API request failed.",
            }),
          )
        }
      }
    })
  },
})

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""))

  return {
    base: '/',
    plugins: [inspectAttr(), react(), localApiPlugin()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
            'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
            'supabase': ['@supabase/supabase-js'],
          },
        },
      },
      cssCodeSplit: true,
      minify: 'terser',
    },
  }
});
