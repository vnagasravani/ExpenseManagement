const socket = io("http://localhost:3000");
const authToken ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RpZCI6ImpOSzlZR0tRIiwiaWF0IjoxNTgyNDQ4NTUyOTM5LCJleHAiOjE1ODI1MzQ5NTIsInN1YiI6ImF1dGhUb2tlbiIsImlzcyI6ImVkQ2hhdCIsImRhdGEiOnsidXNlck5hbWUiOiJyYWNoYW5hIHB1amFyaSIsImZpcnN0TmFtZSI6InJhY2hhbmEiLCJsYXN0TmFtZSI6InB1amFyaSIsImVtYWlsIjoidm5hZ2FzcmF2YW5pMTk5OEBnbWFpbC5jb20iLCJtb2JpbGVOdW1iZXIiOiI5MTMzMDgzMjQ5IiwicGFzc3dvcmQiOiIkMmIkMTAkL2Y3N1ZzSnkySmNqQ25XSmhSWjBQLlFIRjQ1S2pUWG0vTTZaem9hRHFRRldxdWFpMEtYSE8iLCJncm91cHNMaXN0IjpbImhlbGxvNSIsImhlbGxvMiJdLCJjcmVhdGVkT24iOiIyMDIwLTAyLTIzVDA4OjUyOjQ5LjAwMFoiLCJfaWQiOiI1ZTUyM2Q2MWFlMTkxNjMxYzQ3NjcyODUiLCJ1c2VySWQiOiJiZXNUVkpWWiIsIl9fdiI6MH19.x34NrrpNG-1VN7EbejwAhkaVZHT9xo6aJrMDgv0Ftas";
let msg ={
    senderid:"besTVJVZ",
    receiverid:"wdmOWWpI",

    sendername:"user1",
    receivername:"user2",
    groupName:'hello1'
}

let chat = () =>{
    $("#send").on('click', function () {

        let searchValue = $("#messageToSend").val();
        console.log('searched value'+searchValue)
        socket.emit("search-user",searchValue);
    
      });

      $("#add").on('click', function () {
        socket.emit(`add-group`,msg);
        console.log('while emit'+msg.receiverid);
    
      });

      socket.on('add-groupi',(data)=>{
        console.log('add group i is called in user1');
       if(data.receiverid === msg.senderid){
           console.log('matched and add is called');
           socket.emit('add',data.groupName);
       }
      });

      socket.on('add-group-response',data=>{
       console.log(data);
       })


      $("#del-exp").on('click', function () {
        console.log('click function is called to del-exp');
        socket.emit(`delete-an-expense`,{
            userName:'user1',
            userId:'trCgDpCz',
            expenseId:"sr5NW_OH"
        });
      });

      socket.on('delexp-ack',(data)=>{
        console.log(data);
        if(data.status==200)
         socket.emit('send-mail',{data:data,email:'vnagasravanii1998@gmail.com',userName:'user2'});
    })

      $("#edit-amt").on('click', function () {
        console.log('click function is called to edit amount');
        socket.emit(`edit-amount`,{
            userName:'user1',
            userId:'trCgDpCz',
            expenseId:"sr5NW_OH",
            amount:4000
        });
      });

      socket.on('edit-amount-ack',data=>{
          console.log(data);
        if(data.status==200)
        socket.emit('send-mail',{data:data,email:'vnagasravanii1998@gmail.com',userName:'user2'});
      })

      $("#edit-whopaid").on('click', function () {
        console.log('click function is called to edit amount');
        socket.emit(`edit-whopaid`,{
            userName:'user1',
            userId:'trCgDpCz',
            expenseId:"sr5NW_OH",
            whoPaid:'abc'
        });
      });

      socket.on('edit-whopaid-ack',data=>{
          console.log(data);
        if(data.status==200)
        socket.emit('send-mail',{data:data,email:'vnagasravanii1998@gmail.com',userName:'user2'});
      })

      $("#edit-people").on('click', function () {
        console.log('click function is called to edit amount');
        socket.emit(`edit-people`,{
            userName:'user1',
            userId:'trCgDpCz',
            expenseId:"BEq2q7ey",
            people:['abc','def']
        });
      });

      socket.on('edit-people-ack',data=>{
          console.log(data);
        if(data.status==200)
        socket.emit('send-mail',{data:data,email:'vnagasravanii1998@gmail.com',userName:'user2'});
      })

      $("#delete-people").on('click', function () {
        console.log('click function is called to edit amount');
        socket.emit(`delete-people`,{
            userName:'user1',
            userId:'trCgDpCz',
            expenseId:"BEq2q7ey",
            people:['abc','def']
        });
      });

      socket.on('delete-people-ack',data=>{
          console.log(data);
        if(data.status==200)
        socket.emit('send-mail',{data:data,email:'vnagasravanii1998@gmail.com',userName:'user2'});
      })



      socket.on("verify",function(data){
        console.log('verifying user');
        socket.emit("set-user",authToken);
    });

    socket.on('searched-result',function(data){

        console.log('searched-result'+data);
        for(user of data)
        {
            console.log(user);
        }
    });

    socket.on('online-user-list',function(data){
        console.log('some one joined or leave the room');
        console.log(data);
    });


}

chat();
