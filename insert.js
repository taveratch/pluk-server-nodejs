var arg = process.argv.slice(2);

var username = arg[0];
var password = arg[1];
var email = arg[2];


// $.getScript("code.js", function(){
//   makeConnection();
//   insertData(username,password,email);
//   disconnect();
// });

// var NewScript=document.createElement('script')
// NewScript.src="code.js"
// document.body.appendChild(NewScript);


// require(["code"],function(code){
//   code.makeConnection();
// });


var code = require("./code.js");
var callback = function(result){
  console.log(result);
};
code.makeConnection();
// console.log(username);
code.insertData(username,password,email,callback);
code.disconnect();
