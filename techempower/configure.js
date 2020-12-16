const acorn = require('acorn.min.js')
const { baseName, fileName, join } = just.path
const { isFile, isDir } = require('fs')
const buildModule = require('build')
const { launch } = just.process

const AD = '\u001b[0m' // ANSI Default
const AY = '\u001b[33m' // ANSI Yellow
const AM = '\u001b[35m' // ANSI Magenta
const AC = '\u001b[36m' // ANSI Cyan
const AG = '\u001b[32m' // ANSI Green

function requireText (text) {
  const { vm } = just
  const params = ['exports', 'require', 'module']
  const exports = {}
  const module = { exports, type: 'native' }
  module.text = text
  if (!module.text) return
  const fun = vm.compile(module.text, just.sys.cwd(), params, [])
  module.function = fun
  fun.call(exports, exports, p => just.require(p, module), module)
  return module.exports
}

function createCache () {
  const libs = new Set()
  const natives = new Set()
  const modules = new Set()
  const external = new Set()
  return { main: '', index: '', libs, natives, modules, external }
}

const appRoot = just.sys.cwd()
let { HOME, JUST_TARGET, JUST_HOME } = just.env()
if (!JUST_TARGET) {
  JUST_TARGET = `${HOME}/.just`
}
if (!JUST_HOME) {
  JUST_HOME = JUST_TARGET
}

function make (...args) {
  const currentDir = just.sys.cwd()
  const process = launch('make', ['C=gcc', 'CC=g++', ...args], currentDir)
  process.onStdout = (buf, len) => {}
  process.onStderr = (buf, len) => {}
  return process
}

const moduleCache = {}
const config = require('config.json') || require('config.js')
if (!isFile('config.js')) {
  delete config.embeds
}
const builtin = requireText(just.builtin('config.js')) || {}
const cache = createCache()
for (const module of builtin.modules) {
  moduleCache[module.name] = module
}
if (!config.external) config.external = {}

const appDir = just.sys.cwd()

function getExternalLibrary (originalFileName, fileName) {
  if (config.external[originalFileName]) {
    just.print(`${originalFileName} found in config`)
  } else {
    // it is an internal/blessed module
    const libsDir = `${JUST_TARGET}/libs`
    if (!isDir(libsDir)) {
      just.fs.chdir(JUST_TARGET)
      const process = make('libs')
      while (1) {
        const [status, kpid] = just.sys.waitpid(new Uint32Array(2), process.pid)
        if (kpid === process.pid) {
          if (status !== 0) throw new Error(`make failed ${status}`)
          break
        }
      }
      just.fs.chdir(appDir)
    }
    const moduleDir = `${JUST_TARGET}/libs/${originalFileName}`
    if (!isDir(moduleDir)) {
      throw new Error(`module not found ${moduleDir}`)
    }
    fileName = `${moduleDir}/${originalFileName}.js`
    // we now have the module directory - need to copy files over
    // TODO: make vendoring an option - src for modules too
  }
  return fileName
}

// TODO: if JUST_TARGET does not exists we must create and install it

function getModule (fileName) {
  // we will assume for now only internal/blessed c++ modules are allowed
  const moduleDir = `${JUST_TARGET}/modules/${fileName}`
  if (!isDir(moduleDir)) {
    just.print(`downloading ${fileName} to ${moduleDir}`)
  }
  const entry = { name: fileName, obj: [`modules/${fileName}/${fileName}.o`] }
  const json = require(`${moduleDir}/${fileName}.json`)
  if (json) {
    for (const obj of json.obj) {
      entry.obj.push(`modules/${fileName}/${obj}`)
    }
    entry.lib = json.lib
  }
  cache.modules.add(fileName)
  moduleCache[fileName] = entry
}

function parse (fileName, type = 'script', depth = 0) {
  let external = false
  const originalFileName = fileName
  if (fileName[0] === '@') {
    cache.external.add(fileName.slice(1))
    fileName = `${appRoot}/lib/${fileName.slice(1)}/${just.path.fileName(fileName.slice(1))}.js`
    just.print(`${'  '.repeat(depth)}${AG}external${AD} ${fileName}`)
    fileName = getExternalLibrary(originalFileName.slice(1), fileName)
    external = true
  }
  const parent = `${baseName(fileName)}`
  if (type === 'script') {
    cache.index = fileName
    just.print(`${'  '.repeat(depth)}${fileName}`)
  }
  if (type === 'module' && fileName.indexOf('.') === -1) {
    just.print(`${'  '.repeat(depth)}${AY}native${AD} ${fileName}`)
    cache.natives.add(just.path.fileName(fileName))
    return
  }
  if (type === 'module') {
    if (!external) just.print(`${'  '.repeat(depth)}${AC}module${AD} ${fileName}`)
    cache.libs.add(fileName.replace(`${appRoot}/`, ''))
  }
  if (!isFile(fileName)) {
    throw new Error(`${fileName} Not Found`)
  }
  const src = just.fs.readFile(fileName)
  depth++
  acorn.parse(src, {
    ecmaVersion: 2020,
    sourceType: type,
    onToken: token => {
      if (token.value === 'require') {
        const expr = acorn.parseExpressionAt(src, token.start)
        if (expr.type === 'CallExpression') {
          if (expr.arguments[0].name !== 'path') {
            let fileName = expr.arguments[0].value
            if (fileName[0] !== '@') {
              const ext = fileName.split('.').slice(-1)[0]
              if (ext === 'js' || ext === 'json') {
                fileName = join(parent, fileName)
              }
            }
            parse(fileName, 'module', depth)
          }
        }
        return
      }
      if (token.value === 'library') {
        const expr = acorn.parseExpressionAt(src, token.start)
        if (expr.type === 'CallExpression') {
          const [fileName] = expr.arguments
          just.print(`${'  '.repeat(depth)}${AM}library${AD} ${fileName.value}`)
          getModule(fileName.value)
        }
      }
    }
  })
  return cache
}

const scriptName = just.args[2] || 'techempower.js'
const { index, libs, natives, modules, external } = parse(scriptName)
const builtinModules = builtin.modules.map(v => v.name)
if (!config.target || config.target === 'just') {
  const fn = fileName(scriptName)
  config.target = fn.slice(0, fn.lastIndexOf('.'))
}
const cfg = {
  version: config.version || builtin.version,
  v8flags: config.v8flags || builtin.v8flags,
  debug: config.debug || builtin.debug,
  capabilities: config.capabilities || builtin.capabilities,
  target: config.target,
  static: config.static || true,
  index,
  libs: Array.from(libs.keys()),
  modules: [...new Set([...builtinModules, ...Array.from(modules.keys())])].map(k => moduleCache[k]),
  embeds: config.embeds || []
}
buildModule.run(cfg, { dump: false, clean: true, cleanall: false, silent: false })
  .catch(err => just.error(err.stack))
