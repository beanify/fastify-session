const { fastify: Fastify } = require('fastify')
const fastifyCookie = require('fastify-cookie')
const fastifySession = require('./index')

const fastify = Fastify({
  // logger: {
  //   prettyPrint: true
  // }
})

fastify.register(fastifyCookie)
fastify.register(fastifySession, {
  secret: '123456',
  cookieName: 'xbimer-id',
  cookie: {
    secure: false
  }
})

fastify.route({
  method: 'GET',
  url: '/test',
  async handler (req) {
    const { sessionManager } = req
    if (!req.session) {
      const sn = await sessionManager.generate(req)
      console.log(sn)
    }
    return Date.now()
  }
})

fastify.ready(e => {
  e && fastify.log.error(e.message)
  // fastify.inject(
  //   {
  //     url: '/test',
  //     method: 'GET'
  //   },
  //   (e, res) => {
  //     console.log({
  //       e,
  //       res
  //     })
  //   }
  // )
})
fastify.listen(3000)
