app.factory('socket',function(socketFactory){
  var myIoSocket = io.connect('http://192.168.254.122:3003');
  var mySocket = socketFactory({
    ioSocket: myIoSocket
  });
  return mySocket;
})

.factory('publicsocket', function(socketFactory) {
    var myIoSocket = io.connect('http://chat.socket.io');
    var mySocket = socketFactory({
      ioSocket: myIoSocket
    });
    return mySocket;
  })
