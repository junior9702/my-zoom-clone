const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidV4 } = require('uuid');

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`);
});

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room });
});

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId, userName) => {
        socket.join(roomId);
        
        // Notify others someone joined
        socket.to(roomId).emit('user-connected', userId, userName);

        // Handle Chat Messages
        socket.on('message', (message) => {
            io.to(roomId).emit('createMessage', message, userName);
        });

        // Handle Hand Raise
        socket.on('raise-hand', () => {
            io.to(roomId).emit('user-raised-hand', userName);
        });

        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId, userName);
        });
    });
});

server.listen(3000, () => console.log('Server running on http://localhost:3000'));