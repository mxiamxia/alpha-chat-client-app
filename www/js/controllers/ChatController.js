app.controller('CoChatController', function ($scope, $rootScope, $state, $stateParams, publicsocket, Users,
                                             $sanitize, $ionicScrollDelegate) {

  $scope.loginname = $stateParams.username;
  $scope.totalbadge = Users.getTotalBadge();
  $scope.activeUser = $rootScope.activeUser;
  var COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  ];
  $scope.data = {"matches": [], "search": ''};

  publicsocket.emit('add user', $stateParams.username);

  publicsocket.on('login', function (data) {
    $scope.connected = true;
    $scope.number_message = message_string(data.numUsers)
  });

  publicsocket.on('new message', function (data) {
    if (data.message && data.username) {
      addMessageToList(data.username, true, data.message)
    }
  });

  $scope.sendMessage = function () {
    if(isBlank($scope.data.search)) {
      return;
    }
    addMessageToList($scope.loginname, true, $scope.data.search);
    publicsocket.emit('new message', $scope.data.search);
    $scope.data.search = '';
  }

  $scope.goToBack = function () {
    $state.go('tab.chats', {username: $scope.loginname});
  }

  var message_string = function (number_of_users) {
    return number_of_users === 1 ? "there's 1 participant" : "there are " + number_of_users + " participants"
  }

  function addMessageToList(username, style_type, message) {
    username = $sanitize(username);
    var color = style_type ? getUsernameColor(username) : null;
    var activeUser = Users.all()[Users.getLastActiveIndex()].username;
    if ($scope.loginname === username) { //if message come form user $scope
      var msg = {
        audio: false,
        content: $sanitize(message),
        style: style_type,
        username: $scope.loginname,
        color: color
      };
      Users.updateMsg(msg, activeUser);
    } else {
      //if (Users.all()[Users.getLastActiveIndex()].username !== username) {
      //  //updateBadge(username);
      //  //updateTotalBadge();
      //}
      var msg = {audio: false, content: $sanitize(message), style: style_type, username: username, color: color};
      Users.updateMsg(msg, activeUser);
    }
    //$rootScope.$broadcast('notify', 'updated');
    $ionicScrollDelegate.scrollBottom();
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

  var isBlank = function(str) {
    return (!str || /^\s*$/.test(str));
  }

});
