const io = require('socket.io')

io.on('connection', socket => {
  socket.on('disconnect', () => {
    console.log('kthxbai')
  })
})
