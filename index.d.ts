import { FastifyPluginCallback, FastifyInstance } from 'fastify'
import { FastifySessionOptions, SessionManager, Session } from './types/options'

declare const fastifySession: FastifyPluginCallback<FastifySessionOptions>

export = fastifySession
export { Session }

declare module 'fastify' {
  interface FastifyRegister {
    (
      plugin: FastifyPluginCallback<FastifySessionOptions>,
      opts: FastifySessionOptions
    ): FastifyInstance
  }

  interface FastifyInstance {
    sessionManager: SessionManager
  }

  interface FastifyRequest {
    sessionManager: SessionManager
    session?: Session
  }
}
