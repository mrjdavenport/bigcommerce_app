(function() {

	return {

		requests: {

		},

		events: {
			'app.activated': 'requestApp'
		},

		requestApp: function() {
			this.switchTo('profile');
		}

	};

}());