angular.module('app.controllers', [])

  .controller('ChatsCtrl', function ($rootScope, $scope, Chats, Users, socket) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});


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
