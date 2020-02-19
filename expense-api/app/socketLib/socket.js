const socketio = require('socket.io');
logger = require('pino')(); 
const events = require('events');
const tokenLib = require('./../libs/tokenLib')
const eventEmitter = new events.EventEmitter();

let setServer = (server)=>{

    let io = socketio.listen(server);
    let myIo = io.of('');
    let onlineUserList = [] ;
    myIo.on('connection',(socket)=>{
        
        
        socket.emit("verify",'');
        socket.on('set-user',function(authToken){
            tokenLib.verifyClaimWithOutSecret(authToken,(err,decoded)=>{
                if(err)
                {
                    socket.emit('auth-error',{status:404,error:'please provide auth token'});
                }
                else
                {
                    let currentUser = decoded.data;
                    socket.userId = currentUser.userId;
                    let fullName = `${currentUser.firstName} ${currentUser.lastName}`
                    console.log('user verified');
                    console.log(currentUser);
                    // let user = {
                    //    userId:currentUser.userId,
                    //    fullName:fullName
                    // };
                    //onlineUserList.push(user);
                    onlineUserList.push(fullName);
                     // socket.emit('online-user-list',onlineUserList);
                   
                    console.log('online list'+onlineUserList);
                    // socket.join('chat');
                    //  socket.to('chat').emit('online-user-list',onlineUserList);

                   socket.emit(currentUser.userId,"you are online");
                    

                }

            })

        })//end set-user

        socket.on('chat-msg',(msg)=>{
            console.log(msg.receivername +'received a msg from '+ msg.sendername);
            myIo.emit(msg.receivername,msg);
        })

        socket.on('disconnect',()=>{
            console.log('user is disconnected' );
            console.log(socket.userId);
            // let removeIndex = onlineUserList.map(function(user){
            //     return user.userId
            // }).indexOf(socket.userId);
            // onlineUserList.splice(removeIndex,1);
            // if(onlineUserList.length==0)
            // {
            //     console.log('no online users are present');
            // }
            // else
            // {
            // console.log('online'+onlineUserList);
            // }
            var removeIndex = onlineUserList.map(function(user) { return user.userId; }).indexOf(socket.userId);
            onlineUserList.splice(removeIndex,1)
            console.log(onlineUserList);
            

            // socket.to('chat').emit('online-user-list',onlineUserList);
            // socket.leave('chat');

        });

        socket.emit('online-user-list',onlineUserList);


    });


}

module.exports = {
    setServer:setServer
}