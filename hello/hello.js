const AD = '\u001b[0m' // ANSI Default
const AG = '\u001b[32m' // ANSI Green
function dump (o, name) {
  const fields = Object.getOwnPropertyNames(o).sort()
  just.print(`${AG}${name}${AD}\n${JSON.stringify(fields, null, '  ')}`)
  for (const field of fields) {
    if ((typeof o[field]) === 'object') {
      if (field !== 'requireCache') {
        dump(o[field], `${name}.${field}`)
      }
    }
  }
}
dump(just, 'just')
just.print(`rss: ${just.memoryUsage().rss}`)
require('lib/repl.js').repl()
