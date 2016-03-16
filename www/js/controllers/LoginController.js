angular.module('app.loginController', [])
  .controller('LoginController',function($scope, $state,$sanitize) {
	var self=this;
  self.data = {};
  self.loginerror = false;
  self.errdetail;

  self.loginApp = function() {
    var username=$sanitize(self.data.username).toLowerCase();
    if(username)
    {
      $state.go('tab.chats',{username:username});
    } else {
      self.loginerror = true;
      self.errdetail = 'Please enter a nick name before starting chat';
    }
  }
});
