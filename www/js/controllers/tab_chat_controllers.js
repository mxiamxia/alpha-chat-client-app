angular.module('app.controllers', [])

  .controller('ChatsCtrl', function ($rootScope, $scope, Chats, Users,
                                     socket, publicsocket, $stateParams) {

    $scope.publicSocketConnected = false;
    $scope.nickname = $stateParams.username;

    publicsocket.on('connect', function(){
      $scope.publicSocketConnected = true;

      socket.emit('add user', $stateParams.username);

    })

    //function called on Input Change
    self.updateTyping=function(){
      sendUpdateTyping()
    }

    // Display message by adding it to the message list
    function addMessageToList(username,style_type,message){
      username = $sanitize(username)
      removeChatTyping(username)
      var color = style_type ? getUsernameColor(username) : null
      self.messages.push({content:$sanitize(message),style:style_type,username:username,color:color})
      $ionicScrollDelegate.scrollBottom();
    }

    //Generate color for the same user.
    function getUsernameColor (username) {
      // Compute hash code
      var hash = 7;
      for (var i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + (hash << 5) - hash;
      }
      // Calculate color
      var index = Math.abs(hash % COLORS.length);
      return COLORS[index];
    }

    // Updates the typing event
    function sendUpdateTyping(){
      if(connected){
        if (!typing) {
          typing = true;
          socket.emit('typing');
        }
      }
      lastTypingTime = (new Date()).getTime();
      $timeout(function () {
        var typingTimer = (new Date()).getTime();
        var timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
          socket.emit('stop typing');
          typing = false;
        }
      }, TYPING_TIMER_LENGTH)
    }

    // Adds the visual chat typing message
    function addChatTyping (data) {
      addMessageToList(data.username,true," is typing");
    }

    // Removes the visual chat typing message
    function removeChatTyping (username) {
      self.messages = self.messages.filter(function(element){return element.username != username || element.content != " is typing"})
    }

    // Return message string depending on the number of users
    function message_string(number_of_users)
    {
      return number_of_users === 1 ? "there's 1 participant":"there are " + number_of_users + " participants"
    }

    $scope.userlist = Users.all();
    $scope.selectUser = function (index) {
      $rootScope.activeUser = $scope.userlist[index];
      Users.resetBadge(index);
      Users.updateTotalBadge();
      Users.setLastActiveIndex(index);
      $rootScope.$broadcast('active', 'active index updated');
    };

    $scope.remove = function (chat) {
      Chats.remove(chat);
    };
  })

  .controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
  })

  .controller('AccountCtrl', function ($scope) {
    $scope.settings = {
      enableFriends: true
    };
  });
