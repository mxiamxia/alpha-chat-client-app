angular.module('app.controllers', [])

  .controller('ChatsCtrl', function ($rootScope, $scope, Users,
                                     socket, publicsocket, $stateParams) {

    $scope.publicSocketConnected = false;
    $scope.nickname = $stateParams.username;

    $scope.selectUser = function (index) {
      $rootScope.activeUser = $scope.userlist[index];
      Users.resetBadge(index);
      Users.updateTotalBadge();
      Users.setLastActiveIndex(index);
      $rootScope.$broadcast('active', 'active index updated');
    };

    $scope.selectFirstUser = function () {
      $rootScope.activeUser = Users.all()[0];
      Users.setLastActiveIndex(0);
    }

    $scope.remove = function (chat) {
      //Chats.remove(chat);
    };

    $scope.publicSocketConnected = true;
    publicsocket.emit('add user', $stateParams.username);
    //var message = {audio: false, content: $sanitize(message), style: style_type, username: robotname, color: color};
    Users.save({username: $stateParams.username, messages: [], badge: 0});

  })


