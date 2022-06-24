import bodyParser from 'body-parser'
import express from 'express'
import http from 'https'
import cors from 'cors'
import socketio from 'socket.io'

const Server = socketio.Server
const app = express()
const router = express.Router()
const port = process.env.PORT || 3333

// {
//   room_name: {
//     socket_id: { name: '', x: 0, y: 0 },
//     socket_id: { name: '', x: 0, y: 0 },
//     ...
//   },
//   ...
// }
const rooms: any = {}

const httpServer = http.createServer({}, app)
const io = new Server(httpServer, {
  path: '/',
  cors: true,
  origins: '*',
})

io.engine.on('connection_error', (err: any) => {
  console.log(err.req) // the request object
  console.log(err.code) // the error code, for example 1
  console.log(err.message) // the error message, for example "Session ID unknown"
  console.log(err.context) // some additional error context
})

io.on('connection', (socket: any) => {
  console.log('Connected socket!!')

  socket.on('join_room', (data: any) => {
    console.log('join_room', data)
    if (!rooms[data.room]) rooms[data.room] = {}

    if (rooms[data.room]) {
      rooms[data.room][data.user.name] = data.user
    }

    socket.join(data.room)
  })

  socket.on('update_position', (data: any) => {
    if (rooms[data.room]) {
      rooms[data.room][data.user.name] = data.user
    }

    io.to(data.room).emit('update_pointers', rooms[data.room])
  })

  socket.on('remove_position', (data: any) => {
    if (rooms[data.room] && rooms[data.room][data.user.name]) {
      delete rooms[data.room][data.user.name]
    }

    io.to(data.room).emit('update_pointers', rooms[data.room])
  })
})

io.on('disconnect', (socket: any) => {
  console.log('Disconnected socket!!')

  // if (rooms['room1'] && rooms['room1'][data.user.name]) {
  //   delete rooms['room1'][data.user.name]
  // }

  io.to('room1').emit('update_pointers', rooms['room1'])
})

app.use(
  cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  }),
)

app.use(bodyParser.json())
app.use(bodyParser.raw({type: 'application/vnd.custom-type'}))
app.use(bodyParser.text({type: 'text/html'}))

router.get('/', async (req: any, res: any) => {
  res.json({Hello: 'World'})
})

app.use(router)

httpServer.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
