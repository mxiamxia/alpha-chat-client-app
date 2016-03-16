app.factory('Users', function() {
    var userList = [];
    var agentids = {};
    var totalBadge = 0
    var loginID = '';

    var updateMsg = function (msg, username) {
      //var users = all();
      console.log(userList);
      userList.forEach(function (obj, index) {
        if (obj.username == username) {
          userList[index].messages.push(msg);
        }
      })
    };
    var resetBadge = function (idx) {
      var users = all();
      console.log(users);
      users.forEach(function (obj, index) {
        if (idx == index) {
          users[index].badge = 0;
        }
      });
    };
    var updateBadge = function (username) {
      var users = angular.toJson(all());
      users.forEach(function (obj, index) {
        if (obj.username == username) {
          ++users[index].badge;
        }
      })
    };
    var updateTotalBadge = function () {
      totalBadge = 0;
      var users = all();
      users.forEach(function (obj) {
        if (obj.badge > 0) {
          totalBadge += obj.badge;
        }
      })
    }

    var userExist = function (username) {
      var bool = false;
      var users = all();
      users.forEach(function (obj) {
        if (obj.username == username) {
          bool = true;
        }
      });
      return bool;
    };

    var all = function () {
      //var users = window.localStorage['userList'];
      //if(users) {
      //  return angular.fromJson(users);
      //}
      //return [];
      return userList;
    };

    var save = function (user) {
      //var tmpList = all();
      //tmpList.push(user);
      //window.localStorage['userList'] = angular.toJson(tmpList);
      userList.push(user);
    };

    var getLastActiveIndex =  function () {
      return parseInt(window.localStorage['lastActiveUser']) || 0;
    };

    var setLastActiveIndex = function (index) {
      window.localStorage['lastActiveUser'] = index;
    }

    var getTotalBadge = function() {
      return totalBadge;
    }

    var setLoginID = function(name) {
      loginID = name;
    }

    var getLoginID = function() {
      return loginID;
    }

    var getagentids = function() {
      return agentids;
    }

    return {
      all: all,
      save: save,
      getLastActiveIndex: getLastActiveIndex,
      setLastActiveIndex: setLastActiveIndex,
      updateMsg: updateMsg,
      getagentids: getagentids,
      updateBadge: updateBadge,
      resetBadge: resetBadge,
      getTotalBadge: getTotalBadge,
      updateTotalBadge: updateTotalBadge,
      setLoginID: setLoginID,
      getLoginID: getLoginID
    }

  })
