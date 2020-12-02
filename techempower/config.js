const libs = [
  'lib/pg/pg.js',
  'lib/dns/dns.js',
  'lib/http/http.js',
  'lib/dns/protocol.js',
  'lib/pg/md5.js',
  'lib/pg/protocol.js',
  'lib/stringify.js',
  'lib/tcp/tcp.js'
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
  name: 'udp',
  obj: [
    'modules/udp/udp.o'
  ]
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
  name: 'http',
  obj: [
    'modules/http/http.o',
    'modules/http/picohttpparser.o'
  ]
}, {
  name: 'html',
  obj: [
    'modules/html/html.o'
  ]
}, {
  name: 'epoll',
  obj: [
    'modules/epoll/epoll.o'
  ]
}]

const embeds = []

const target = 'techempower'
const index = 'techempower.js'

module.exports = { version, libs, modules, capabilities, target, index, v8flags, embeds, debug, static: true }
