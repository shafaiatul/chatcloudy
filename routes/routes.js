module.exports = function (express, app, passport, config, rooms) {
	var router = express.Router(); //from express 4, using brand new express router. I had to use the instance of this router to define all routes

	router.get('/', function (req, res, next) {
		res.render('index', {title : 'Welcome to ChatCat'});
	});

	router.get('/auth/facebook', passport.authenticate('facebook')); 
	router.get('/auth/facebook/callback', passport.authenticate('facebook', {
		successRedirect : '/chatrooms',
		failureRedirect : '/'
	}))

	function securePages (req, res, next) {
		if (req.isAuthenticated()) {
			next();
		} else {
			res.redirect('/'); //redirect to the root directory the login page
		}
	}

	router.get('/chatrooms', securePages, function (req, res, next) {
		res.render('chatrooms', {title : 'Chatrooms', user:req.user, config:config})
	});

	router.get('/room/:id', securePages, function (req, res, next) {
		var room_name = findTitle(req.params.id); //this will extract the room title for me.
		res.render('room', {user:req.user, room_number:req.params.id, room_name:room_name, config:config});
	});

	function findTitle (room_id) {
		var n = 0;
		while (n < rooms.length) {
			if(rooms[n].room_number == room_id) {
				return rooms[n].room_name;
				break;
			} else {
				n++;
				continue;
			}
		}
	}

	router.get('/logout', function (req, res, next) {
		req.logout();
		res.redirect('/'); //redirect to the root directory the login page
	})


	app.use('/', router); //setting the default route to be handled by the instance of router I just created

}