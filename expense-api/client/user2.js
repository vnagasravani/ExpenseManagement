socket = io("http://localhost:3000");
const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RpZCI6IjQzZFRzRC12IiwiaWF0IjoxNTgyNDQ4NjU4MzMxLCJleHAiOjE1ODI1MzUwNTgsInN1YiI6ImF1dGhUb2tlbiIsImlzcyI6ImVkQ2hhdCIsImRhdGEiOnsidXNlck5hbWUiOiJyYWNoYW5hIHB1amFyaSIsImZpcnN0TmFtZSI6InJhY2hhbmEiLCJsYXN0TmFtZSI6InB1amFyaSIsImVtYWlsIjoidm5hZ2FzcmF2YW5paTE5OThAZ21haWwuY29tIiwibW9iaWxlTnVtYmVyIjoiOTEzMzA4MzI0OSIsInBhc3N3b3JkIjoiJDJiJDEwJHgwVEJoQ2pSMW1DWVlERldieU9pL09EcnI0LzJMeXdrS0lwLmcuTDZBbUtmQUk3OFVSa1BlIiwiZ3JvdXBzTGlzdCI6W10sImNyZWF0ZWRPbiI6IjIwMjAtMDItMjNUMDk6MDA6MjAuMDAwWiIsIl9pZCI6IjVlNTIzZjI0NGQ1NmU1MmIzY2E3YzJhYiIsInVzZXJJZCI6IndkbU9XV3BJIiwiX192IjowfX0.Jt4emAKqAPgkGHwKf4G7WG_iYkhLttRlEIQQcu2UuiM";
let msg ={
    receiverid:"wdmOWWpI",
    senderid:"besTVJVZ",

    receivername:"user1",
    sendername:"user2"
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
        console.log('click function is called to del-exp');
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

      socket.on('add-groupi',(data)=>{
        console.log('add group i is called in user2');
          if(data.receiverid === msg.senderid){
            console.log('matched and add is called');
              socket.emit('add',data.groupName);
          }
      });

      socket.on('add-group-response',data=>{
          console.log('add-group-response');
          console.log(data);
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
