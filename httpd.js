const { createServer } = require('../libs/justify/justify.js')
createServer()
  .get('/', (req, res) => res.text('Hello, World!'))
  .get('/foo', () => {
    throw new Error('Foo')
  })
  .get('/async', async () => {
    throw new Error('Async')
  })
  .listen()

just.setInterval(() => just.print(just.memoryUsage().rss), 1000)
