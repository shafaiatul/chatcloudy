module.exports = function (passport, FacebookStrategy, config, mongoose) {
	//all the authentication codes go here

	var chatUser = new mongoose.Schema ({
		profileID : String, //facebook ID
		fullname : String,
		profilePic : String
	})
	var userModel = mongoose.model('chatUser', chatUser) //I will use userModel to interact with mongolab account

	//serialize and deserialize method
	passport.serializeUser(function (user, done) { //serializeUser store data in the session 
		done(null, user.id);
	});

	passport.deserializeUser(function (id, done) {
		userModel.findById(id, function(err,user) {
			//simply return the user
			done(err, user);
		});
	});

	passport.use(new FacebookStrategy({
		//all of these are parameters
		clientID : config.fb.appID, //from developement.json and production.json
		clientSecret : config.fb.appSecret,
		callbackURL : config.fb.callbackURL, //this is url to which facebook will re-direct after it has done the authentication 
		profileFields : ['id', 'displayName', 'photos'] //this is the data I am requesting fb to send back to me after the authorization 
	}, function (accessToken, refreshToken, profile, done) {
		//check if the user exists in MongoDB Database
		//if not, create one and return the profile so that it can be used in the app
		//if the user exists simply return the profile 
		userModel.findOne({'profileID' : profile.id}, function (err, result) {
			if(result) {
				done(null, result);
			} else {
				//create a new user in our mongolab account 
				var newChatUser = new userModel ({
					profileID : profile.id,  //profile.id is what returned by facebook
					fullname : profile.displayName, //.dsiplayName is something which fb returns, refers to the fb doc
					profilePic : profile.photos[0].value || '' //photos is an array which returned by fb, in order to find the profile pic u need to get the first element
				});
				//once we find the value, now we wanna store the value in the database
				newChatUser.save(function (err) {
					done(null, newChatUser);
				});
			}
		})
	}))
}


//Summary of New Facebook Strategy:
//---------------------------------
//As you can see I have created a new facebook strategy where defined the client ID and client Secret and the callback URL 
//where facebook will redirect to once the test successfully complete the authorization, we have also requested facebook to
//provide us with the FB id, the display name and the photos. Once this successfully completes then we are invoking the callback
//function which provides us with access to profile, once we have our profile we are checking to see if this particular user 
//exists in our mongolab account or not. If it does, user directly returned, if not existed then the user will create in our 
//mongolab account and return. 

//Idea behind the serializeUser and deserializeUser:
//--------------------------------------------------
//serializeUser is used for storing a particular user's reference in the session, so that it is available across pages 
//whenever specific data regarding a user is required then the deserializeUser method is called and it finds that user's record 
//in the database and it returns it back.