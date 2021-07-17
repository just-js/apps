const libs = []
const version = just.version.just
const v8flags = ''
const debug = false
const capabilities = [] // list of allowed internal modules, api calls etc. TBD
const modules = [{
  name: 'sys',
  obj: [
    'modules/sys/sys.o'
  ],
  lib: ['dl', 'rt']
}]
const embeds = ['mini.js']
const target = 'mini'
const main = 'mini.js'
module.exports = { version, libs, modules, capabilities, target, main, v8flags, embeds, static: false, debug }
