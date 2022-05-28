const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io').listen(server);

const bodyParser = require('body-parser');

const logger = require('morgan');
const methodOverride = require('method-override');
const errorHandler = require('errorhandler');

app.set('port',process.env.PORT || 3000);
app.set('views',__dirname+'/views');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

if ('development' == app.get('env')) {
    app.use(errorHandler());
}

app.get('/',function(req,res){
    res.sendfile('views/chat.html');
});

var userNo = 0;

io.on('connection',function(socket){
    userNo++;
    
    socket.emit('onlinepeople',userNo);
    socket.emit('open');

    var client = {
        socket:socket,
        name:false,
        color:getColor()
    }

    socket.on('message',function(msg){
        var obj = {
            time:getTime(),
            color:client.color
        };
        if(!client.name){
            client.name = msg;
            obj['text']=client.name;
            obj['author']='System';
            obj['type']='welcome';

            socket.emit('system',obj);
            socket.broadcast.emit('system',obj);
            socket.emit('onlinepeople',userNo);
        }else{
            obj['text']=msg;
            obj['author']=client.name;
            obj['type']='message';

            socket.emit('message',obj);
            socket.broadcast.emit('message',obj);
        }
    });

    socket.on('disconnect',function(){
        userNo--;
       var obj = {
         time:getTime(),
           color:client.color,
           author:'System',
           text:client.name,
           type:'disconnect'
       };
        socket.broadcast.emit('system',obj);
    });
});

server.listen(app.get('port'), function(){
    console.log("Server listening on port " + app.get('port'));
});

var getTime=function() {
    var date = new Date();
    return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
};

var getColor=function(){
    var colors = ['red','green','orange','blue','brown'];
    return colors[Math.round(Math.random() * 10000 % colors.length)];
};
