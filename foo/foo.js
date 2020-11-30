let foo = just.library('tls', 'openssl.so')
const b = new ArrayBuffer(100)
let ctx = foo.tls.serverContext(b)
