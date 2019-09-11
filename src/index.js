const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocation } = require('./utils/message');
let { addUsers, removeUser, getUser, getUsersInRoom }= require('./utils/users');

const app = express();
const port = process.env.PORT;

const server = http.createServer(app);
const io = socketio(server);

const publicDirectory = path.join(__dirname, '../public');

app.use(express.static(publicDirectory));


io.on('connection', (socket)=>{


    socket.on('join', ({ username, room }, ackCb)=>{
        let { error, user } = addUsers({
            id: socket.id,
            room: room,
            username: username
        });
        
        if(error){
            return ackCb(error);
        }
        socket.join(room);

        socket.emit('message', generateMessage('Welcome to cat bot!!', 'Admin'));
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined the room!`, user.username));

        io.to(user.room).emit('userData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });

        ackCb();
    });
    
    socket.on('sendMessage', (message, ackCB)=>{
        let filter = new Filter();
        let user = getUser(socket.id);
        io.to(user.room).emit('message', generateMessage(filter.clean(message), user.username));
        ackCB();
    });

    socket.on('sendLocation', ({ latitude, longitude }, cb)=>{
        let user = getUser(socket.id);

        io.to(user.room).emit('locationMessage', generateLocation(`https://google.com/maps?q=${latitude},${longitude}`, user.username));
        cb('received the location');
    });

    socket.on('disconnect', ()=>{
        let user = removeUser(socket.id);
        if(user && user.id){
            socket.broadcast.to(user.room).emit('message',generateMessage(`${user.username} has left!!`, user.username));
            io.to(user.room).emit('userData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        }
    })
})

server.listen(port, ()=>{
    console.log(`Listening on port ${port}`);
})