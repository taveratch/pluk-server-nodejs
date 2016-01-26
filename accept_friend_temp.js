var arg = process.argv.slice(2);

var myUsername = arg[0];
var friendUsername = arg[1];

var code = require("./code");
code.makeConnection();
var callback = function(result){
  console.log(result);
}
code.acceptFriend(myUsername,friendUsername,callback);
