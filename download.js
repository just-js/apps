const { encode } = just.library('encode')
const { connect, constants } = require('@pg')
const { createServer } = require('@tcp')
const { createParser } = require('@http')
const { sjs, attr } = require('@stringify')
const { fetch } = require('@fetch')

async function main (url) {
  const result = await fetch(url)
  just.print(JSON.stringify(result, null, '  '))
}

main(...just.args.slice(1)).catch(err => just.error(err.stack))
