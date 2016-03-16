app.controller('CoChatController', function ($scope, $stateParams, Poller, $ionicPopup, $sanitize, $timeout,$interval,$rootScope,
                                             $ionicSideMenuDelegate, $ionicScrollDelegate, Users, Engage, Send, $ionicActionSheet, SendTo,
                                             $q, $log, $ionicPopover, $state, Login, AutoSuggest, Record, $cordovaDeviceOrientation, $cordovaDeviceMotion,
                                             publicsocket) {

  $scope.userlist = Users.all();
  $scope.loginname = $stateParams.username;
  $scope.totalbadge = Users.getTotalBadge();
  $scope.activeUser = $rootScope.activeUser;
  $scope.target = 'all';
  $scope.data = {"matches": [], "search": ''};

  //Add colors
  var COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  ];
  //var agentids = {};

  $scope.recording = false;
  $scope.recordBtnClick = false;

  $scope.$on('notify', function(event, args) {
    console.info('notified result ' + args);
    //$ionicScrollDelegate.scrollBottom(true);
  })

  $scope.$on('active', function(event, args) {
    console.info('updateActiveIdx result ' + args);
    $scope.activeUser = $scope.userlist[Users.getLastActiveIndex()];
  })

  publicsocket.on('connect', function() {
    alert('connected to public socket')
    publicsocket.emit('add user', $stateParams.username);

    publicsocket.on('login', function (data) {
      $scope.connected = true
      $scope.number_message= message_string(data.numUsers)
    });

    // Whenever the server emits 'new message', update the chat body
    publicsocket.on('new message', function (data) {
      if(data.message&&data.username) {
        alert(data.message);
        //addMessageToList(data.username,true,data.message)
      }
    });
  })

  var scrollDown = function () {
    $ionicScrollDelegate.scrollBottom(true);
  }
  $interval(scrollDown, 500);

  // Called to select the given project
  $scope.selectUser = function (index) {
    $scope.activeUser = $scope.userlist[index];
    //$scope.activeUser = Users.all()[index];
    Users.resetBadge(index);
    Users.updateTotalBadge();
    Users.setLastActiveIndex(index);
  };

  $scope.deleteUser = function (index) {
    Users.all().splice(index, 1);
    $scope.activeUser = $scope.userlist[0];
    Users.updateTotalBadge();
  }

  $scope.toggleUser = function () {
    $ionicSideMenuDelegate.toggleLeft();
  };

  $scope.sendMessage = function () {
    if (!$scope.activeUser) {
      return;
    }
    Users.addMessageToList($scope.loginname, $scope.loginname, true, $scope.data.search, false);
    if (Users.getagentids()[$scope.activeUser.username]) {
      Send.sendMessage($scope.loginname, Users.getagentids()[$scope.activeUser.username], $scope.data.search);
      var shaObj = new jsSHA("SHA-1", "TEXT");
      shaObj.update($scope.data.search);
      var hash = shaObj.getHash("HEX");
      var phrase = $scope.data.search.trim();
      AutoSuggest.updateRecentPhrase(hash, phrase, $scope.loginname);
    }
    $scope.data.search = '';
  }


  $scope.sendReply = function (index) {
    if (!$scope.activeUser) {
      return;
    }
    var reply = $scope.popularReplies[index];
    addMessageToList($scope.loginname, $scope.loginname, true, reply, false);
    if (Users.getagentids()[$scope.activeUser.username]) {
      Send.sendMessage($scope.loginname, Users.getagentids()[$scope.activeUser.username], reply);
      var shaObj = new jsSHA("SHA-1", "TEXT");
      shaObj.update(reply);
      var hash = shaObj.getHash("HEX");
      var reply = reply.trim();
      AutoSuggest.updateRecentPhrase(hash, reply, $scope.loginname);
    }
  }

  $scope.goToBack = function () {
    $state.go('tab.chats',{username:$scope.loginname});
  }

  $scope.setLiSelect = function (index) {
    var value = $scope.data.matches[index];
    $scope.data.search = value;
    $scope.data.matches = [];
  }

  $scope.search = function () {
    if ($scope.data.search.endsWith(' ')) {
      AutoSuggest.getPhrase($scope.data.search.trim()).then(function (resp) {
        var data = resp.data.response;
        if (data.status.code.value === '0000') {
          var result = data.body.phrases.phrase;
          var m = [];
          if (angular.isArray(result)) {
            result.forEach(function (obj) {
              if (m.indexOf(obj.content) == -1) {
                m.push(obj.content);
              }
            })
          } else {
            m.push(result.content);
          }
          $scope.data.matches = m;
        }
      });
    } else {
      var m = $scope.statesdata.filter(function (state) {
        if ($scope.data.search && state) {
          if (state.toLowerCase().indexOf($scope.data.search.toLowerCase()) !== -1)
            return true;
        }
      })
      $scope.data.matches = m;
    }
  }


  $scope.sendTextMessage = function (text) {
    if (!$scope.activeUser) {
      return;
    }
    Users.addMessageToList($scope.loginname, $scope.loginname, true, text, false);
    if (Users.getagentids()[$scope.activeUser.username]) {
      Send.sendMessage($scope.loginname, Users.getagentids()[$scope.activeUser.username], text);
      var shaObj = new jsSHA("SHA-1", "TEXT");
      shaObj.update($scope.data.search);
      var hash = shaObj.getHash("HEX");
      var phrase = $scope.data.search.trim();
      AutoSuggest.updateRecentPhrase(hash, phrase, $scope.loginname);
    }
  }


  function addAudioToList(username, style_type, filename) {
    username = $sanitize(username)
    //removeChatTyping(username)
    var color = style_type ? getUsernameColor(username) : null
    var url = 'http://192.168.254.155:3000/audio/' + filename;
    var msg = {audio: true, style: style_type, url: url, username: username, color: color};
    updateMsg(msg, username);
    updateTotalBadge();
    $ionicScrollDelegate.scrollBottom();
  }


  //var userExist = function (username) {
  //  var bool = false;
  //  $scope.userlist.forEach(function (obj) {
  //    if (obj.username == username) {
  //      bool = true;
  //    }
  //  });
  //  return bool;
  //};
  //Generate color for the same user.
  //function getUsernameColor(username) {
  //  // Compute hash code
  //  var hash = 7;
  //  for (var i = 0; i < username.length; i++) {
  //    hash = username.charCodeAt(i) + (hash << 5) - hash;
  //  }
  //  // Calculate color
  //  var index = Math.abs(hash % COLORS.length);
  //  return COLORS[index];
  //}

  //var updateMsg = function (msg, username) {
  //  $scope.userlist.forEach(function (obj, index) {
  //    if (obj.username == username) {
  //      $scope.userlist[index].messages.push(msg);
  //    }
  //  })
  //};
  //var resetBadge = function (idx) {
  //  $scope.userlist.forEach(function (obj, index) {
  //    if (idx == index) {
  //      $scope.userlist[index].badge = 0;
  //    }
  //  });
  //};
  //var updateBadge = function (username) {
  //  $scope.userlist.forEach(function (obj, index) {
  //    if (obj.username == username) {
  //      ++$scope.userlist[index].badge;
  //    }
  //  })
  //};
  //
  //var updateTotalBadge = function () {
  //  $scope.totalbadge = 0;
  //  $scope.userlist.forEach(function (obj) {
  //    if (obj.badge > 0) {
  //      $scope.totalbadge += obj.badge;
  //    }
  //  })
  //}

  $scope.onSelectHold = function () {
    if ($scope.activeUser) {
      $ionicActionSheet.show({
        buttons: [{
          text: 'Send To Engine'
        }, {
          text: 'Send To Customer'
        }, {
          text: 'Send To Both'
        }],
        titleText: 'Who To Send',
        buttonClicked: function (index) {
          switch (index) {
            case 0: // Send Msg to Engine
              SendTo.sendTo(Users.getagentids()[$scope.activeUser.username], false, true, $scope.loginname);
              $scope.target = 'engine only';
              break;
            case 1: // Send Msg to Customer
              SendTo.sendTo(Users.getagentids()[$scope.activeUser.username], true, false, $scope.loginname);
              $scope.target = 'customer only';
              break;
            case 2: //Send Msg to both
              SendTo.sendTo(Users.getagentids()[$scope.activeUser.username], true, true, $scope.loginname);
              $scope.target = 'all';
              break;
          }
          return true;
        }
      });
    }
  }

  //load first user history when startup
  $timeout(function () {
    $scope.selectUser(0);
  }, 300);

  $scope.statesdata = ['Dial', 'Tone', 'Can', 'Call', 'Out', 'Transmission', 'Yes',
    'No', 'MLT', 'Slow', 'At', 'Times', 'Can\'t', 'Break', 'caller', 'my', 'phone', 'only', 'some', 'all', 'not', 'one', 'have', 'please', 'select', 'block'];

  $ionicPopover.fromTemplateUrl('templates/popover.html', {
    scope: $scope,
  }).then(function (popover) {
    $scope.popover = popover;
  });

  $scope.logoff = function () {
    Login.offline($scope.loginname).then(function () {
      console.log('login success');
      $state.go('login');
      $scope.popover.hide();
    }, function () {
      console.log('login error');
    })
  }

  var getPopularReplies = function () {
    $scope.popularReplies = [];
    AutoSuggest.getRecentPhrase($scope.loginname).then(function (resp) {
      console.log('popular' + resp.data);
      if (resp.data.status.code.value === '0000') {
        $scope.popularReplies = resp.data.body.phrases;
      }
    })
  }

  $scope.$watch(function () {
      return $ionicSideMenuDelegate.getOpenRatio();
    },
    function (ratio) {
      if (ratio === -1) {
        getPopularReplies();
      }
    });

  var sendTextMessage = function (text) {
    if (!$scope.activeUser) {
      return;
    }
    addMessageToList($scope.loginname, $scope.loginname, true, text, false);
    if (Users.getagentids()[$scope.activeUser.username]) {
      Send.sendMessage($scope.loginname, Users.getagentids()[$scope.activeUser.username], text);
      var shaObj = new jsSHA("SHA-1", "TEXT");
      shaObj.update(text);
      var hash = shaObj.getHash("HEX");
      var phrase = text.trim();
      AutoSuggest.updateRecentPhrase(hash, phrase, $scope.loginname);
    }
    $scope.data.search = '';
  }


  $scope.recordAudio = function () {
    if ($scope.recording) {
      if ($scope.watch) {
        $cordovaDeviceMotion.clearWatch($scope.watch)
          .then(function (result) {
            // success
            console.log('stop motion dection' + result);
          }, function (error) {
            // error
            console.log('stop motion dection' + error);
          });
      }
      onRecordEvent(false);
      //window.clearInterval(proximityID);
    } else {
      startWatchAcceleration();
      //getProximitySensorState();
      onRecordEvent(true);
    }
    //onRecordEvent();
  }

  var onRecordEvent = function (on) {
    console.log('onRecordEvent: ' + $scope.recording);
    if (!on) {
      $scope.recording = false;
      Record.stop();
      Record.save().then(function () {
        Record.upload().then(function (resp) {
          var response = resp.data;
          response = angular.fromJson(response);
          console.log(response);
          if (response.status.code.value === '0000' && response.body.result !== "") {
            sendTextMessage(response.body.result);
          }
        })
      });
    } else {
      $scope.recording = true;
      Record.start();
    }
  }

  //var options = {
  //  //frequency: 3000,
  //  filter: 30     // if frequency is set, filter is ignored
  //}
  //
  //var magneticHeading_cur;
  //var watch = $cordovaDeviceOrientation.watchHeading(options).then(
  //  null,
  //  function (error) {
  //    // An error occurred
  //    console.log('getCurrentHeading err out' + error);
  //  },
  //  function (result) {   // updates constantly (depending on frequency value)
  //    var magneticHeading = result.magneticHeading;
  //    var trueHeading = result.trueHeading;
  //    var accuracy = result.headingAccuracy;
  //    var timeStamp = result.timestamp;
  //    console.log('magneticHeading=' + magneticHeading);
  //    console.log('trueHeading=' + trueHeading);
  //    console.log('accuracy=' + accuracy);
  //    console.log('timeStamp=' + timeStamp);
  //    if (!magneticHeading_cur) {
  //      magneticHeading_cur = magneticHeading;
  //    }
  //    console.log('Rotation movement+++++++++' + Math.abs(magneticHeading_cur - magneticHeading));
  //    magneticHeading_cur = magneticHeading;

  //});
  var startWatchAcceleration = function () {
    var options = {frequency: 900};
    var x_cur, y_cur, z_cur;
    $scope.watch = $cordovaDeviceMotion.watchAcceleration(options).then(
      null,
      function (error) {
        console.log('motion detection error out: ' + error)
      },
      function (result) {
        var X = result.x;
        var Y = result.y;
        var Z = result.z;
        if (!x_cur || !y_cur || !z_cur) {
          x_cur = X;
          y_cur = Y;
          z_cur = Z;
        } else {
          var abs = Math.abs(x_cur - X) + Math.abs(y_cur - Y) + Math.abs(z_cur - Z);
          console.log('motion movement=========' + abs);
          x_cur = X;
          y_cur = Y;
          z_cur = Z;
          if (abs > 8) {
            console.log('motion movement=========' + abs + 'x=' + X + 'y= ' + Y + 'z= ' + Z);
            if ($scope.recording && Y < Z) { //Y<Z indicates lay phone down
              console.log('detected phone lay down');
              onRecordEvent(false);
            }
            if (!$scope.recording && Y > Z) {   //Y>Z indicate move phone up
              console.log('detected phone move up');
              onRecordEvent(true);
            }
          }
        }
      });
  }

  $scope.onFace = false;
  var proximityID = null;
  var proximityOnSuccess = function(val) {
    console.log(val);
    if(val) {
      console.log('phone close to face');
      $scope.onFace = true;
      if(!$scope.recording){
        onRecordEvent(true);
      }
    } else {
      $scope.onFace =false;
      if($scope.recording) {
        onRecordEvent(false);
      }
    }
  }

  var getCurProximitySensorState = function () {
    navigator.proximity.getProximityState(proximityOnSuccess);
  }
  var getProximitySensorState = function() {
    if (angular.isUndefined(navigator.proximity) || !angular.isFunction(navigator.proximity.enableSensor)) {
      console.log('Device do not support watchAcceleration');
    }
    navigator.proximity.enableSensor();
    proximityID = setInterval(getCurProximitySensorState, 200);
  }

  //cordovaProximity.proximitysensorWatchStart().then(function(state){
  //  console.log("proximity state= " + state);
  //});

  var stopWatchProximity = function(id) {
    $cordovaProximity.proximitysensorWatchStop(id || proximityID);
  }

  function message_string(number_of_users)
  {
    return number_of_users === 1 ? "there's 1 participant":"there are " + number_of_users + " participants"
  }

})


