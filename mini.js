just.sys = just.load('sys').sys
const mem = new BigUint64Array(16)
just.sys.memoryUsage(mem)
const rss = mem[0]
const AD = '\u001b[0m'
const AG = '\u001b[32m'
function dump (o, name) {
  const fields = Object.getOwnPropertyNames(o).sort()
  just.print(`${AG}${name}${AD}\n${JSON.stringify(fields, null, '  ')}`)
  for (const field of fields) {
    if ((typeof o[field]) === 'object') dump(o[field], `${name}.${field}`)
  }
}
just.print(JSON.stringify(just.args))
just.print(JSON.stringify(just.version))
just.print(just.builtin('mini.js'))
dump(just, 'just')
function library (name, path = `${name}.so`) {
  return just.load(just.sys.dlsym(just.sys.dlopen(path), `_register_${name}`))
}
const { encode } = library('encode')
just.print('oh')
const src = just.sys.calloc(1, just.args[1].slice(0, 100))
const dest = new ArrayBuffer(128)
const bytes = encode.base64Encode(src, dest)
just.print(just.sys.readString(dest, bytes))
just.sys.memoryUsage(mem)
just.print(`rss ${mem[0]} used ${mem[0] - rss}`)
function dumplib (name, path) {
  dump(library(name, path), name)
}
dumplib('blake3')
dumplib('encode')
dumplib('epoll')
dumplib('ffi')
dumplib('fs')
dumplib('html')
dumplib('http')
dumplib('inspector')
dumplib('netlink')
dumplib('net')
dumplib('pg')
dumplib('sha1')
dumplib('signal')
dumplib('sys')
dumplib('tcc')
dumplib('thread')
dumplib('udp')
dumplib('vm')
dumplib('zlib')
dumplib('crypto', 'openssl.so')
dumplib('tls', 'openssl.so')
just.sys.memoryUsage(mem)
just.print(`rss ${mem[0]} used ${mem[0] - rss}`)
