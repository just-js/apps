function fixRequire () {
  const appRoot = just.sys.cwd()
  const cache = just.require.cache

  function require (path, parent = { dirName: appRoot }) {
    if (path[0] === '@') path = `${appRoot}/lib/${path.slice(1)}/${path.slice(1)}.js`
    just.print(`require ${path}`)
    const ext = path.split('.').slice(-1)[0]
    if (ext === 'js' || ext === 'json') {
      const { join, baseName } = just.path
      let dirName = parent.dirName
      const fileName = join(dirName, path)
      if (cache[fileName]) {
        just.print('cache: HIT')
        return cache[fileName].exports
      }
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

  require.cache = cache
  just.require = global.require = require
}

fixRequire()

const { connect, constants } = require('@pg')
const { createServer, createParser } = require('@http')
const { sjs, attr } = require('lib/stringify.js')

just.print(JSON.stringify(Object.keys(just.require.cache), null, '  '))
