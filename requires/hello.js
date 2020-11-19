/*
function requireText (text, fileName = 'eval', dirName = just.sys.cwd()) {
  const params = ['exports', 'require', 'module']
  const exports = {}
  const module = { exports, dirName, fileName, type: 'js' }
  module.text = text
  const fun = just.vm.compile(module.text, fileName, params, [])
  module.function = fun
  fun.call(exports, exports, p => require(p, module), module)
  return module.exports
}
*/
/*
const cache = {}
const appRoot = just.sys.cwd()

function require (path, parent = { dirName: appRoot }) {
  const ext = path.split('.').slice(-1)[0]
  if (ext === 'js' || ext === 'json') {
    const { join, baseName } = just.path
    let dirName = parent.dirName
    const fileName = join(dirName, path)
    if (cache[fileName]) return cache[fileName].exports
    dirName = baseName(fileName)
    const params = ['exports', 'require', 'module']
    const exports = {}
    const module = { exports, dirName, fileName, type: ext }
    if (just.fs.isFile(fileName)) {
      module.text = just.fs.readFile(fileName)
    } else {
      path = fileName.replace(appRoot, '')
      if (path[0] === '/') path = path.slice(1)
      module.text = just.builtin(path)
      if (!module.text) return
    }
    cache[fileName] = module
    if (ext === 'js') {
      const fun = just.vm.compile(module.text, fileName, params, [])
      module.function = fun
      fun.call(exports, exports, p => require(p, module), module)
    } else {
      module.exports = JSON.parse(module.text)
    }
    return module.exports
  }
  return just.requireNative(path, parent)
}
*/
/*
const repl = require('repl').repl()
repl.requireText = requireText
repl.onCommand = command => {
  return just.vm.runScript(command, 'repl')
}
*/

const foo = require('stuff/foo/test.js')
const bar = require('stuff/bar/test.js')
const baz = require('stuff/baz/test.js')
just.print(JSON.stringify(foo, null, '  '))
just.print(JSON.stringify(bar, null, '  '))
just.print(JSON.stringify(baz, null, '  '))
just.print(JSON.stringify(require.cache, null, '  '))
