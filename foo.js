const { crypto } = just.library('crypto', 'openssl.so')
const { encode } = just.library('encode')
const { sys } = just
const source = new ArrayBuffer(1024)
const fd = just.fs.open('/dev/urandom')
just.net.read(fd, source)
just.net.close(fd)
const dest = new ArrayBuffer(32)
const start = Date.now()
const runs = parseInt(just.args[1] || '1000', 10)
for (let i = 1; i < runs; i++) {
  crypto.hash(crypto.SHA256, source, dest, 1024)
}
const elapsed = Date.now() - start
just.print(runs / (elapsed / 1000))
const hexLength = encode.hexEncode(dest, source, 20)
const str = sys.readString(source, hexLength)
just.print(str)
just.print(just.memoryUsage().rss)
