const { fetch } = require('@fetch')

async function main (url) {
  const result = await fetch(url)
  just.print(JSON.stringify(result, null, '  '))
}

main(...just.args.slice(1)).catch(err => just.error(err.stack))
