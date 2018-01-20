import Express from 'express'
import Http from 'http'
import SocketIO from 'socket.io'
import dotenv from 'dotenv'

import socketHandler from './socketHandler'

dotenv.config()

const app = Express()
const http = Http.Server(app)
const io = SocketIO(http)
const port = process.env.PORT

io.on('connection', socketHandler(io))

http.listen(port, () => {
  console.log(`listening on *:${port}`)
})
