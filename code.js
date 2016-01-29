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
  var checkBeFriend = function(user, myFriend){
    for(var i=0;i<user.friends.length;i++){
      var friendID = user.friends[i].toString();
      if(friendID == myFriend._id.toString()) return true;
    }
    return false;
  }

  var checkIsOnWaitingList = function(user,friend){
    for(var i=0;i<user.waiting_friends.length;i++){
      var friendID = user.waiting_friends[i].toString();
      if(friendID == friend._id.toString()) return true;
    }
    return false;
  }
  /**
    If friend request has been sent then it should appear in friend's waiting list.
  */
  var checkIsAlreadyRequest = function(friend , myUser) {
    for(var i=0;i<friend.waiting_friends.length;i++){
      var userID = friend.waiting_friends[i].toString();
      if(userID == myUser._id.toString()) return true;
    }
    return false;
  }

  var callback1 = function(myUser){
    var callback2 = function(friend){
      var isOnWaitingList = checkIsOnWaitingList(myUser,friend);
      if(isOnWaitingList){
        exports.acceptFriend(myUsername,friendUsername,callback);
      }else{
        var isFriend = checkBeFriend(myUser,friend);
        if(isFriend){
          callback(false);
        }else{
          var isSentRequest = checkIsAlreadyRequest(friend,myUser);
          // console.log(isSentRequest);
          if(isSentRequest){ //Already sent friend request.
            callback(false);
          }else{
            db.users.update({"username" : friend.username} ,
              {$push : {waiting_friends : myUser._id}}
            );
            callback(true);
          }
        }
      }

    }
    exports.searchUser(friendUsername, callback2);
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
  var checkIsWaiting = function(myUser,friend){
    for(var i =0;i<myUser.waiting_friends.length;i++){
      if(myUser.waiting_friends[i].toString() == friend._id.toString()) return i;
    }
    return -1;
  }

  var callback1 = function(myUser){
    var callback2 = function(friend){
      var isWaiting = checkIsWaiting(myUser,friend);
      if(isWaiting >= 0){
        db.users.update({"username" : myUsername} ,
        {$push : {friends : friend._id}});
        db.users.update({"username" : myUsername} ,
        {$pull : {waiting_friends : friend._id}});
        db.users.update({"username" : friendUsername} ,
        {$push : {friends : myUser._id}});
        callback(true);
      }else{
        callback(false);
      }
    }
    exports.searchUser(friendUsername,callback2);
  }

  exports.searchUser(myUsername,callback1);
}
