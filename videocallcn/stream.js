const stream = (socket) => {
    socket.on('subscribe', (data) => {
        socket.join(data.room);
        socket.join(data.socketId);

        if (socket.adapter.rooms[data.room].length > 1) {
            socket.to(data.room).emit('new user', { socketId: data.socketId });
        }
    });


    socket.on('clientAdded', (data) => {
        socket.to(data.to).emit('clientAdded', { sender: data.sender });
    });


    socket.on('sdp', (data) => {
        socket.to(data.to).emit('sdp', { description: data.description, sender: data.sender });
    });

    // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/icecandidate_event
    socket.on('ice candidates', (data) => {
        socket.to(data.to).emit('ice candidates', { candidate: data.candidate, sender: data.sender });
        console.log('ice candidates');
    });


    socket.on('chat', (data) => {
        socket.to(data.room).emit('chat', { sender: data.sender, msg: data.msg });
    });
};

module.exports = stream;