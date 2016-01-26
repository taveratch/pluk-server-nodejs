var db;

exports.makeConnection = function(){
  var dbName = "Pluk";
  var collection = ['users'];
  var mongojs = require("mongojs");
  db = mongojs("127.0.0.1:27017/"+dbName,collection);
}

exports.getNextId = function(name){
 var ret = db.users.findAndModify({
   query : { _id : name},
   update : {$inc : {seq : 1}},
   new : true
 });
 return ret.seq;
};

exports.insertData = function(username,password,email,callback){

  var callback2 = function(result){
    if(result == undefined){
      db.users.insert({
        "username" : username,
        "password" : password,
        "email" : email,
        "friends" : [],
        "waiting_friends" : []
      });
      callback(true); //not found this user on database.
    }else {
      callback(false); //found exist user then cannot insert this user.
    }
  }

  exports.searchUser(username,callback2)

}

exports.searchUser = function(username,callback){
 // console.log("Friend name : " + username);
 db.users.findOne({"username" : username} , function(err,result){
   callback(result);
 });
}

exports.addFriend = function(myUsername,friendUsername,callback){
  var checkBeFriend = function(user, friendUsername){
    for(var i=0;i<user.friends.length;i++){
      var friend = user.friends[i];
      if(friend.username == friendUsername) return true;
    }
    return false;
  }

  /**
    If friend request has been sent then it should appear in friend's waiting list.
  */
  var checkIsAlreadyRequest = function(friend , myUsername) {
    for(var i=0;i<friend.waiting_friends.length;i++){
      var user = friend.waiting_friends[i];
      if(user.username == myUsername) return true;
    }
    return false;
  }

  var callback1 = function(myUser){
    var isFriend = checkBeFriend(myUser,friendUsername);
    if(isFriend){
      callback(false);
    }else{
      var callback2 = function(friend){ // Add me to friend's waiting list.
        var isSentRequest = checkIsAlreadyRequest(friend,myUsername);
        if(isSentRequest){ //Already sent friend request.
          callback(false);
        }else{
          db.users.update({"username" : friend.username} ,
            {$push : {waiting_friends : myUser}}
          );
          callback(true);
        }
      };
      exports.searchUser(friendUsername, callback2);
    }

  }
    exports.searchUser(myUsername,callback1);
}



exports.checkLogin = function(username,password,callback){
 db.users.findOne({
   "username" : username,
   "password" : password
 },function(err, result){
   callback(result);
 });
}

exports.disconnect = function(){
 db.close();
}

exports.acceptFriend = function(myUsername,friendUsername,callback){
  var checkIsWaiting = function(myUser){
    for(var i =0;i<myUser.waiting_friends.length;i++){
      if(myUser.waiting_friends[i].username == friendUsername) return i;
    }
    return -1;
  }

  var callback1 = function(myUser){
    var isWaiting = checkIsWaiting(myUser);
    if(isWaiting >= 0){ //found on waiting list.
      var callback2 = function(friend){
        db.users.update({"username" : myUsername} ,
        {$push : {friends : friend}});
        db.users.update({"username" : myUsername} ,
        {$pull : {waiting_friends : {'username' : friendUsername}}});
        db.users.update({"username" : friendUsername} ,
        {$push : {friends : myUser}});
        callback(true);
      }
      exports.searchUser(friendUsername,callback2);
    }else{
      callback(false);
    }
  }

  exports.searchUser(myUsername,callback1);
}
