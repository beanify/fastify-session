const fp = require('fastify-plugin')
const uid = require('uid-safe').sync
const cookieSignature = require('cookie-signature')
const { default: AJV } = require('ajv')
const Store = require('./store')

const kOptions = Symbol('session.options')

function _idGenerator () {
  return uid(24)
}

class SessionManager {
  constructor (opts) {
    this[kOptions] = opts
  }

  async generate (req) {
    const { idGenerator, cookie } = this[kOptions]
    req.session = {
      id: idGenerator(),
      expires: cookie.maxAge
    }

    return req.session
  }

  async destroy (req) {
    const sn = req.session
    if (!sn) {
      return
    }

    const { store } = this[kOptions]
    await store.destroy(sn.id)
  }
}

module.exports = fp(function (fastify, opts, done) {
  const ajv = new AJV({
    useDefaults: true
  })

  const optSchema = require('./schemas/options.json')
  const verifyCall = ajv.compile(optSchema)
  if (!verifyCall(opts)) {
    const msg = ajv.errorsText(verifyCall.errors)
    return done(new Error(msg))
  }

  opts.idGenerator = opts.idGenerator || _idGenerator
  opts.store = opts.store || new Store()
  const sm = new SessionManager(opts)

  fastify.decorate('sessionManager', sm)
  fastify.decorateRequest('sessionManager', sm)
  fastify.addHook('preValidation', async function (req, rep) {
    const { store, cookie, cookieName } = opts
    const url = req.raw.url
    if (url.indexOf(cookie.path || '/') !== 0) {
      return
    }

    const eid = req.cookies[cookieName]
    if (!eid) {
      return
    }
    const id = cookieSignature.unsign(eid, opts.secret)
    if (id === false) {
      return
    }

    req.session = await store.get(id)
  })
  fastify.addHook('onSend', async function (req, rep) {
    const sn = req.session
    if (!sn) {
      return
    }

    const { store, cookie, cookieName } = opts
    await store.set(sn.id, sn)
    const eid = cookieSignature.sign(sn.id, opts.secret)
    rep.setCookie(cookieName, eid, cookie)
  })
  done()
})
