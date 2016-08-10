angular.module('goTransport-example', ['goTransport'])
	.controller('mainController', function($scope, goTransport) {
		goTransport.connect('http://localhost:8081/ws');

		goTransport.onConnect().then(function() {
			console.log('Connected!');
		});

		//Bidirectional method calling. With dynamic parameters

		//Server calling the client and sending back a optional response.
		goTransport.method('example', function(message, number) {
			console.log(message, number);
			return "Hello there server :-)";
		});

		//Client calling the server and getting a response.
		$scope.pong = '';
		$scope.ping = function() {
			goTransport.call('ping', ['hai']).then(function(result, err) {
				if(err) {
					console.error(err);
					return;
				}
				console.log(result);
				$scope.pong = result;
			}, function(err) {
				console.error(err);
			});
		};
		// setInterval($scope.ping, 100);

	});