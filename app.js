(function() {

	return {

		profileData: {},

		resources: {
			PROFILE_URI		: '/api/v2/customers.json?email=',
			CUSTOMER_URI	: '/admin/index.php?ToDo=viewCustomers&searchId='
		},

		requests: {
			'getProfile' : function(email) {
				return {
					headers  : {
						'Authorization': 'Basic ' + Base64.encode(this.settings.username + ':' + this.settings.api_token)
					},
					url      : this.settings.url + this.resources.PROFILE_URI + email,
					method   : 'GET',
					dataType : 'json'
				};
			}
		},

		events: {
			'app.activated'						: 'dataChanged',
			'ticket.subject.changed'			: 'dataChanged',
			'ticket.requester.email.changed'	: 'dataChanged',
			'getProfile.done'					: 'handleGetProfile'
		},

		handleGetProfile: function(data) {
			this.profileData = data[0];
			this.profileData.customer_uri = this.settings.url+ this.resources.CUSTOMER_URI + this.profileData.id;
			this.switchTo('profile',this.profileData);
		},

		dataChanged: function() {
			var ticketSubject = this.ticket().subject();
			if (_.isUndefined(ticketSubject)) { return; }
			var requester = this.ticket().requester();
			if (_.isUndefined(requester)) { return; }
			var requesterEmail = this.ticket().requester().email();
			if (_.isUndefined(requesterEmail)) return;
			this.ajax('getProfile', requesterEmail);
		}
	};

}());