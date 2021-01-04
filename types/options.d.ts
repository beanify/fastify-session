import { CookieSerializeOptions } from 'fastify-cookie'
import { FastifyRequest } from 'fastify'

export interface FastifySessionOptions {
  secret: string
  cookieName?: string
  cookie?: CookieSerializeOptions
}

export interface Session {
  id: string
  expires: number
}

export interface SessionManager {
  generate(req: FastifyRequest): Promise<Session>
  destroy(req: FastifyRequest): Promise<void>
}
