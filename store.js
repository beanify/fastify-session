const kDie = Symbol('store.die')

function Store () {
  this.storages = new Map()
}

Store.prototype.set = async function (id, sn) {
  sn[kDie] = Date.now() + sn.expires * 1000
  this.storages.set(id, sn)
}

Store.prototype.get = async function (id) {
  const sn = this.storages.get(id)
  if (!sn) {
    return
  }

  const di = Date.now() + sn.expires * 1000

  if (sn[kDie] <= di) {
    return sn
  } else {
    await this.destroy(id)
  }
}

Store.prototype.destroy = async function (id) {
  this.storages.delete(id)
}

module.exports = Store
