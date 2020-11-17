const libs = [
  'lib/fs.js',
  'lib/loop.js',
  'lib/path.js',
  'lib/repl.js'
]

const version = just.version.just
const v8flags = ''

const debug = false
const capabilities = [] // list of allowed internal modules, api calls etc. TBD

const modules = [{
  name: 'sys',
  obj: [
    'modules/sys/sys.o'
  ],
  lib: ['dl']
}, {
  name: 'fs',
  obj: [
    'modules/fs/fs.o'
  ]
}, {
  name: 'net',
  obj: [
    'modules/net/net.o'
  ]
}, {
  name: 'vm',
  obj: [
    'modules/vm/vm.o'
  ]
}, {
  name: 'epoll',
  obj: [
    'modules/epoll/epoll.o'
  ]
}]

const embeds = [
  'hello.js',
  'just.js'
]

const target = 'hello'
const main = 'just.js'
const index = 'hello.js'

module.exports = { version, libs, modules, capabilities, target, main, v8flags, embeds, index, debug, static: true }
