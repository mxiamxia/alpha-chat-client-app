angular.module('app.userServices', [])
.factory('Users', function(Poller, $ionicPopup, $ionicScrollDelegate,$sanitize, Engage, $timeout, $rootScope) {
    var userList = [];
    var agentids = {};
    var totalBadge = 0
    var loginID = '';
    var COLORS = [
      '#e21400', '#91580f', '#f8a700', '#f78b00',
      '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
      '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
    ];


    var poll = function(user) {
      console.log('polling');
      Poller.poll(user).then(function (resp) {
        if (resp.data.status.code == '0000' && resp.data.body.result && Array.isArray(resp.data.body.result) && resp.data.body.result.length > 0) {
          resp.data.body.result.forEach(function (message) {
            console.log('poll result= ' + message);
            chatProcess(message);
            console.log('polling ==' + message);
          });
        }
        $timeout(poll, 1000);
      });
    }

    var chatProcess = function (message) {
      var type = message.messageType;
      var from = message.from;
      //var sender = message.sender;
      //var senderType = message.senderType;
      var senderName = message.senderName;
      var senderText = message.text;
      //var receiver = message.receiver;
      if (senderName) {
        agentids[senderName] = message.chatId;
      }
      if (type == 'Command' && message.command) {
        switch (message.command) {
          case "userRequestChat" :
            var robotname = message.data;
            if (message.senderType == 'User') {

            } else {
              if (!userExist(senderName)) {
                var confirmPopup = $ionicPopup.confirm({
                  title: 'Engagement',
                  template: 'Do you want to start another engagement with ' + senderName + '?'
                });
                confirmPopup.then(function (res) {
                  if (res) {
                    userList.push({username: senderName, messages: [], badge: 0});
                    if (userList.length > 0) {
                      //$scope.activeUser = $scope.userlist[$scope.userlist.length - 1];
                      setLastActiveIndex(0);
                    }
                    addMessageToList(senderName, robotname, true, senderText, true);
                    Engage.acceptEngage(senderName, agentids[senderName]);
                  } else {
                    console.log('Engagement end');
                    Engage.rejectEngage(senderName, agentids[senderName]);
                  }
                });
                $timeout(function () {
                  confirmPopup.close(); //close the popup after 30 seconds for some reason
                  Engage.rejectEngage(senderName, agentids[senderName]);
                }, 30000);
              } else {
                addMessageToList(senderName, robotname, true, senderText, false)
              }
            }
            break;
          case "userAcceptChat" :
            break;
          case "userDeclineChat" :
            break;
        }
      } else if (message.body.response) {
        //get message txt from body response message field
        var msgbody = message.body.response.message;
        if (msgbody['@from']) {
          var from = msgbody['@from'];
        } else {
          var from = message.props.robotid;
        }

        if (msgbody['@robotname']) {
          var name = msgbody['@robotname'];
        } else {
          var name = message.props.robotname;
        }
        if (from && from.indexOf('ntelagent-conversation') > -1) {
          addMessageToList(senderName, name, true, senderText, true);
        } else {
          addMessageToList(senderName, name, true, senderText, false);
        }
      } else {
        if (message.body instanceof String || typeof message.body === "string") {
          var text = message.body;
          addMessageToList(senderName, senderName, true, text, false);
        }
      }
    }

    function addMessageToList(username, robotname, style_type, message, robot) {
      username = $sanitize(username)
      var color = style_type ? getUsernameColor(username) : null
      if (loginID == username) { //if message come form user $scope
        var curuser = userList[getLastActiveIndex()].username;
        var msg = {
          audio: false,
          content: $sanitize(message),
          style: style_type,
          username: loginID,
          color: color
        };
        updateMsg(msg, curuser);
      } else if (robot) {
        var curuser = userList[getLastActiveIndex()].username;
        var msg = {audio: false, content: $sanitize(message), style: style_type, username: robotname, color: color};
        updateMsg(msg, curuser);
      } else {
        if (userList[getLastActiveIndex()].username !== username) {
          updateBadge(username);
          updateTotalBadge();
        }
        var msg = {audio: false, content: $sanitize(message), style: style_type, username: username, color: color};
        updateMsg(msg, username);
      }
      $rootScope.$broadcast('notify', 'updated');
    }

    function getUsernameColor(username) {
      // Compute hash code
      var hash = 7;
      for (var i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + (hash << 5) - hash;
      }
      // Calculate color
      var index = Math.abs(hash % COLORS.length);
      return COLORS[index];
    }
    var updateMsg = function (msg, username) {
      userList.forEach(function (obj, index) {
        if (obj.username == username) {
          userList[index].messages.push(msg);
        }
      })
    };
    var resetBadge = function (idx) {
      userList.forEach(function (obj, index) {
        if (idx == index) {
          userList[index].badge = 0;
        }
      });
    };
    var updateBadge = function (username) {
      userList.forEach(function (obj, index) {
        if (obj.username == username) {
          ++userList[index].badge;
        }
      })
    };
    var updateTotalBadge = function () {
      totalBadge = 0;
      userList.forEach(function (obj) {
        if (obj.badge > 0) {
          totalBadge += obj.badge;
        }
      })
    }

    var userExist = function (username) {
      var bool = false;
      userList.forEach(function (obj) {
        if (obj.username == username) {
          bool = true;
        }
      });
      return bool;
    };

    var all = function () {
      return userList;
    };

    var save = function (user) {
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
      getagentids: getagentids,
      addMessageToList: addMessageToList,
      updateBadge: updateBadge,
      resetBadge: resetBadge,
      getTotalBadge: getTotalBadge,
      updateTotalBadge: updateTotalBadge,
      poll: poll,
      setLoginID: setLoginID,
      getLoginID: getLoginID
    }

  })
