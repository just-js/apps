const binary = require('@binary')
const { Parser, protocols } = require('@packet')
const { sys } = just.library('sys')
const { hrtime } = sys

let last = hrtime()

function onPacket (packet, u8) {
  const time = hrtime()
  const { offset, bytes, frame, header } = packet
  if (frame && frame.protocol === 'IPv4' && header && header.protocol === protocols.TCP) {
    just.print(`\n${tcpDump(packet)}`)
    if (bytes > offset) just.print(dump(u8.slice(offset, bytes)), false)
  } else if (frame && frame.protocol === 'IPv4' && header && header.protocol === protocols.UDP) {
    just.print(`\n${udpDump(packet)}`)
    if (bytes > offset) just.print(dump(u8.slice(offset, bytes)), false)
  }
  last = time
}

const { net, SystemError } = just
const { SOCK_RAW, AF_PACKET, PF_PACKET, ETH_P_ALL } = net
const { dump, toMAC, htons16, tcpDump, udpDump } = binary

function main (args) {
  const { buf, u8, parse } = new Parser()
  const iff = args[0]
  let i = 0
  const fd = net.socket(PF_PACKET, SOCK_RAW, htons16(ETH_P_ALL))
  if (fd < 0) throw new SystemError('socket')
  if (iff) {
    const mac = new ArrayBuffer(6)
    let r = net.getMacAddress(fd, iff, mac)
    if (r < 0) throw new SystemError('getMacAddress')
    r = net.bindInterface(fd, iff, AF_PACKET, htons16(ETH_P_ALL))
    if (r < 0) throw new SystemError('bindInterface')
    just.print(`bound to interface ${iff} (${toMAC(new Uint8Array(mac))})`)
  }
  while (1) {
    const bytes = net.recv(fd, buf, 0, buf.byteLength)
    if (bytes === 0) break
    if (bytes < 0) throw new SystemError('recv')
    if (!(iff === 'lo' && ((i++ % 2) === 0))) onPacket(parse(bytes, true), u8)
  }
  net.close(fd)
}

main(just.args[0] === 'just' ? just.args.slice(2) : just.args.slice(1))
