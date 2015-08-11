var express=require('express'),
app=express(),
server=require('http').createServer(app),  // create server
io=require('socket.io').listen(server);		// create io and it will listen to server

var usernames=[];
var title;
var username;
server.listen(process.env.PORT || 3000);   // server will listen to port 3000

app.get('/',function(req,res)             // for loading html in the server
{
	res.sendFile(__dirname+"/index.html");
});

// server side work

io.sockets.on('connection',function(socket)
{

	socket.on('send message',function(data)		// msg from client to server
	{	
		io.sockets.emit('new message',{msg:data,username:socket.username}); // msg from server to client

	});

	//display usernames
	// we will emit usernames array to client side

	socket.on('new username',function(data,callback) // define a callback to check duplicacy of username
	{	
		if(usernames.indexOf(data)!=-1)
		{
			callback(false);
		}
		else
		{
			callback(true);
			//add new user to array
			//set socket.username to data .. this is done to use data anywhere outside this function
			socket.username=data;
			username=data;
			usernames.push(socket.username);

			updateUser();

			if(socket.title!=null)
			{
				updateTitle();
			}

		}

	});

	function updateUser()
	{
		// emit usernames to client
		io.sockets.emit('usernames',usernames);
	}

	// disconnect
		socket.on('disconnect',function(data)
	{
		if(!socket.username)   
			return;
		usernames.splice(usernames.indexOf(socket.username),1);
		updateUser();
	});

	socket.on('new title',function(data)
	{	

		socket.title=data;
		title=data;
		updateTitle();
		
	});
	function updateTitle()
	{
		io.sockets.emit('set title',socket.title);
	}

	socket.on('singleUser',function(data)
	{
		
		socket.from=data.from;
		socket.to=data.to;

		io.sockets.emit('chat_with_single_user',{from:socket.from,to:socket.to});
	});

	socket.on('single chat message send',function(data)
	{
		// emit message only to the requested user

		
			if(data.from==socket.username ||data.to==socket.username)
			{
		io.sockets.emit('single chat new message',{msg :data.msg,name:socket.username});
	}
	

	});


});
