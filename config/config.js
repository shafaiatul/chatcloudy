//This will load one of these files => development.json or prduction.json depending on the MODE the app is running in
//Back in the app.js file we are loading the config.js file 
module.exports = require('./' + (process.env.NODE_ENV || 'development') + '.json');