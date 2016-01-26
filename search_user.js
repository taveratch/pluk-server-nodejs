var arg = process.argv.slice(2);

var username = arg[0];

var code_temp = require('./code.js');
var callback = function(result){
  console.log(result);
  code_temp.disconnect();
}


code_temp.makeConnection();
code_temp.searchUser(username,callback);
