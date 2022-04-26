const express = require('express');
const app = express();
const { v4: uuidV4 } = require('uuid')
const { ExpressPeerServer } = require('peer');


const server = require('http').Server(app);
const peerServer = ExpressPeerServer(server, {
    debug: true
});
const io = require('socket.io')(server)
app.use(express.static('public'))
app.use('/peerjs', peerServer);

app.set('view engine', 'ejs');
app.get('/', (req, res) => {

    res.redirect(`/${uuidV4()}`)


})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })

})


server.listen(process.env.PORT || 3030);

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-connected', userId);
        socket.on('message', data => {
            io.to(roomId).emit('createMessage', data);

        })

        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId)
        });

    })
})