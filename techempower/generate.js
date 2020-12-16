const acorn = require('acorn.min.js')
const astring = require('astring.min.js')
const src = just.fs.readFile('config.js')
const ast = acorn.parse(src, {
  ecmaVersion: 2020,
  sourceType: 'module'
})
//just.print(JSON.stringify(ast, null, '  '))
require('fs').writeFile('ast.json', ArrayBuffer.fromString(JSON.stringify(ast, null, '  ')))
const vars = ast.body.filter(e => e.type === 'VariableDeclaration').map(v => v.declarations[0].id.name)
just.print(JSON.stringify(vars))

ast.body[0].declarations[0].id.name = 'foo'
ast.body[0].declarations[0].init.elements.push({
  type: 'Literal',
  value: 'lib/foo/bar.js',
  raw: "'lib/foo/bar.js'"
})

just.print(astring.generate(ast))
