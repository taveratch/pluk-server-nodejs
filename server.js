var fs = require("fs");
var host = "taweesoft.xyz";
var port = 8080;
var express = require("express");

var app = express();
app.use(express.static(__dirname + "/public")); //use static files in ROOT/public folder

var code = require("./code.js");
app.get("/checkLogin", function(request, response){ //root dir
    var username = request.query.username;
    var password = request.query.password;
    code.makeConnection();
    var callback = function(info){
      var found = info!=null;
      console.log("-- Check Login : " + username + " : " + found +  " --");
      response.send(info);
    }
    code.checkLogin(username,password,callback);
});

app.get("/register" , function(request, response) {
    var username = request.query.username;
    var password = request.query.password;
    var email = request.query.email;
    code.makeConnection();
    var callback = function(result){
      console.log("-- Register : " + username + " : " + result + " --");
      response.send(result);
    }
    code.insertData(username,password,email,callback);
});

app.get("/addFriend" , function(request , response) {
    var myUsername = request.query.myUsername;
    var friendUsername = request.query.friendUsername;
    code.makeConnection();
    var callback = function(result){
      console.log('-- Add friend from : ' + myUsername + " to " + friendUsername + ' : ' + result + ' --' );
      response.send(result);
    }
    code.addFriend(myUsername,friendUsername,callback);
});

app.get("/acceptFriend" , function(request , response) {
    var myUsername = request.query.myUsername;
    var friendUsername = request.query.friendUsername;
    code.makeConnection();
    var callback = function(result){
      console.log('-- Accept friend request from : ' + myUsername + " to " + friendUsername + " : " + result + " --");
      response.send(result);
    }
    code.acceptFriend(myUsername,friendUsername,callback);
});
app.listen(port, host);
console.log("Server running on port " + port);
