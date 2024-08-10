const express=require('express');
const app=express()
const path=require('path')

// create server and connect to socketio
const http=require('http')
const server=http.createServer(app)
const socketio=require('socket.io')
const io=socketio(server)

app.set("view engine","ejs")
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection',function(socket){
    const username = `User${socket.id.slice(0, 6)}`;
    socket.on('send-location',function(data){
        io.emit('receive-location',{id:socket.id,username,...data})
    })
    socket.on('disconnect',function(){
        io.emit('user-disconnected',socket.id);
    })
    
    console.log(`User connected: ${username}`);
})
app.get('/',function(req,res){
    res.render('index')
})

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});