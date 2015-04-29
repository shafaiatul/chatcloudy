var express = require('express'),
	app = express(),
	path = require('path'),
	cookieParser = require('cookie-parser'),
	session = require('express-session'),
	config = require('./config/config.js'),
	ConnectMongo = require('connect-mongo')(session), //this will invoke a function and reference to the session variable, this will also allow you to store all your sessions in.
	mongoose = require('mongoose').connect(config.dbURL),
	passport = require('passport'),
	FacebookStrategy = require('passport-facebook').Strategy,
	rooms = [];

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('hogan-express')); //using Hogan Templating Engine
app.set('view engine', 'html'); //used view engine to use html files
app.use(express.static(path.join(__dirname, 'public'))); 

app.use(cookieParser()); //cookieParser middleware to enable the session

var env = process.env.NODE_ENV || 'development';
if(env === 'development') {
	//Dev specific setting
	app.use(session({secret : config.sessionSecret}));
} else {
	//Production specific setting
	app.use(session({
		secret : config.sessionSecret,
		store : new ConnectMongo({ //new instance of ConnectMongo we just installed, inside of it I will pass the configuration
			mongoose_connection : mongoose.connection[0], //first instance of the array which has the active connection I have instantiated earlier, this way you wont have multiple connection going on in ur mongolab account
			stringify : true //all the session values are converted to strings and then stored at 'mongolab'
		})

	}))
}


app.use(passport.initialize());
app.use(passport.session());

require('./auth/passportAuth.js')(passport, FacebookStrategy, config, mongoose);
require('./routes/routes.js')(express, app, passport, config, rooms); //passing the reference to invoke the function from routes module


app.set('port', process.env.PORT || 3000);
var server = require('http').createServer(app);
var io = require('socket.io').listen(server); 
require('./socket/socket.js')(io, rooms);
server.listen(app.get('port'), function () {
	console.log('ChatCat on port :' + app.get('port'));
});


