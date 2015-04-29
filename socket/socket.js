module.exports = function (io, rooms) {
	var chatrooms = io.of('/roomlist').on('connection', function (socket) {
		console.log('Connection Established on the server');

		socket.emit('roomupdate', JSON.stringify(rooms));

		socket.on('newroom', function (data) {
			rooms.push(data);
			socket.broadcast.emit('roomupdate', JSON.stringify(rooms)); //converted array to string 
			socket.emit('roomupdate', JSON.stringify(rooms)); 
			//after refreshing the page the the connection is re-established and I wasn't able to see the created chatrooms
			//SO I am emiting the socket when the connection was established 
		});
	});

	var messages = io.of('/messages').on('connection', function (socket) {
		console.log('Connection Established !');

		socket.on('joinroom', function (data) {
			socket.username = data.user;
			socket.userPic = data.userPic;
			socket.join(data.room);
			updateUserList(data.room, true);
		});

		socket.on('newMessage', function (data) {
			socket.broadcast.to(data.room_number).emit('messagefeed', JSON.stringify(data));
			//back in the room.html I have to listen for the 'messagefeed' event
		})

		

		function updateUserList(room, updateAll) {
			var getUsers  =  io.of('/messages').clients(room);
			var userlist = [];
			for (var i in getUsers) {
				userlist.push({user:getUsers[i].username, userPic:getUsers[i].userPic});
			}
			socket.to(room).emit('updateUsersList', JSON.stringify(userlist));
		

			if(updateAll) {
				socket.broadcast.to(room).emit('updateUsersList', JSON.stringify(userlist)) //this will forcefully update the list of active users for menmbers connected to the particular chatroom.
			}
		}

		socket.on('updateList', function (data) {
			updateUserList(data.room);
		});

	});

}