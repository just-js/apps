const stringify = require('@stringify')
const justify = require('@justify')
const postgres = require('@pg')
const cache = require('@cache')
const html = require('@html')

const { Connection, compile, compileBatchUpdate, compileMultiQuery } = postgres
const { BinaryInt, VarChar } = postgres.pg
const { createServer } = justify
const { sjs, attr } = stringify
const { SimpleCache } = cache
const config = require('tfbconfig.js')
const { maxRandom, maxQuery } = config
const { port, address } = config.server

const getRandom = () => Math.ceil(Math.random() * maxRandom)
const getCount = qs => Math.min(parseInt((qs.q) || 1, 10), maxQuery) || 1

async function compileQueries (db, maxQuery, getRandom) {
  db.getWorldById = await compile(db,
    'select id, randomNumber from World where id = $1', 'getWorldById',
    [BinaryInt], [BinaryInt], [1])
  db.getAllFortunes = await compile(db, 'select * from Fortune',
    'getAllFortunes', [BinaryInt, VarChar], [], [], true)
  db.getRandomWorlds = compileMultiQuery(db.getWorldById, () => [getRandom()])
  db.batchUpdates = []
  const promises = []
  for (let i = 1; i < maxQuery + 1; i++) {
    promises.push(compileBatchUpdate(db, `batchUpdate${i}`, 'world',
      'randomnumber', 'id', i))
    if (i % 10 > 0) continue
    db.batchUpdates = db.batchUpdates.concat((await Promise.all(promises)))
    promises.length = 0
  }
}

async function main () {
  const extra = { id: 0, message: 'Additional fortune added at request time.' }
  const sDB = sjs({ id: attr('number'), randomnumber: attr('number') })
  const sJSON = sjs({ message: attr('string') })
  const message = 'Hello, World!'
  const json = { message }
  const fortunes = html.load(config.templates.fortunes)

  const db = new Connection(config.db)
  await db.connect()
  await compileQueries(db, maxQuery, getRandom)
  const { getWorldById, getAllFortunes, batchUpdates, getRandomWorlds } = db
  const worldCache = new SimpleCache(id => getWorldById.call(id)).start()

  const server = createServer()
    .get('/plaintext', (req, res) => res.text(message))
    .get('/json', (req, res) => res.json(sJSON(json)))
    .get('/db', async (req, res) => {
      const rows = await getWorldById.call(getRandom())
      res.json(sDB(rows[0]))
    })
    .get('/query', async (req, res) => {
      const rows = await getRandomWorlds(getCount(req.query))
      res.json(JSON.stringify(rows.map(r => r[0])))
    }, { qs: true })
    .get('/update', async (req, res) => {
      const count = getCount(req.query)
      const rows = (await getRandomWorlds(count))
        .map(row => Object.assign(row[0], { randomnumber: getRandom() }))
      await batchUpdates[count]
        .call(...rows.flatMap(row => [row.id, row.randomnumber]))
      res.json(JSON.stringify(rows))
    }, { qs: true })
    .get('/fortunes', async (req, res) => {
      const rows = await getAllFortunes.call()
      res.html(fortunes.call([extra, ...rows].sort()))
    })
    .get('/cached-worlds', async (req, res) => {
      const count = getCount(req.query)
      const promises = []
      for (let i = 0; i < count; i++) {
        promises.push(worldCache.get(getRandom()))
      }
      const rows = (await Promise.all(promises)).map(v => v[0])
      res.json(JSON.stringify(rows))
    }, { qs: true })
    .listen(port, address)
  server.name = 'j'
}

main().catch(err => just.error(err.stack))

just.setInterval(() => {
  const { user, system } = just.cpuUsage()
  const { rss } = just.memoryUsage()
  just.print(`mem ${rss} cpu (${user.toFixed(2)}/${system.toFixed(2)}) ${(user + system).toFixed(2)}`)
}, 1000)
