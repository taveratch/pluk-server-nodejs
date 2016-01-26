var arg = process.argv.slice(2);

var myUsername = arg[0];
var friendName = arg[1];

var code = require("./code.js");
console.log(myUsername + " " + friendName);
code.makeConnection();
var callback = function(result){
  console.log(result);
}
code.addFriend(myUsername,friendName,callback);
// codeInstance.disconnect();
