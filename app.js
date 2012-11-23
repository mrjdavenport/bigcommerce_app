(function() {

	return {

		defaultState: 'loading',

		profileData: {},

		resources: {
			PROFILE_URI			: '/api/v2/customers.json?email=',
			RECENT_ORDERS_URI	: '/api/v2/orders.json?customer_id=',
			CUSTOMER_URI		: '%@/admin/index.php?ToDo=searchCustomersRedirect&idFrom=%@&idTo=%@',
			ORDER_URI			: '%@/admin/index.php?ToDo=searchOrdersRedirect&orderFrom=%@&orderTo=%@'
		},

		requests: {
			'getProfile' : function(email) {
				return this.getRequest(this.settings.url + this.resources.PROFILE_URI + email);
			},
			'getOrders' : function(customer_id) {
				return this.getRequest(this.settings.url + this.resources.RECENT_ORDERS_URI + customer_id);
			}
		},

		events: {
			'app.activated'						: 'dataChanged',
			'ticket.subject.changed'			: 'dataChanged',
			'ticket.requester.email.changed'	: 'dataChanged',
			'getProfile.fail'					: 'handleGetProfileError',
			'getProfile.done'					: 'handleGetProfile',
			'getOrders.done'					: 'handleGetOrders',

			'getOrders.always'					: function() {
				this.switchTo('profile',this.profileData);
			}
		},

		getRequest: function(resource) {
			return {
				headers  : {
					'Authorization': 'Basic ' + Base64.encode(this.settings.username + ':' + this.settings.api_token)
				},
				url      : resource,
				method   : 'GET',
				dataType : 'json'
			};
		},

		handleGetProfile: function(data) {
			if (_.isUndefined(data[0])) return;
			this.profileData = data[0];
			this.profileData.notes = data[0].notes;
			this.profileData.customer_uri = helpers.fmt(this.resources.CUSTOMER_URI,this.settings.url,this.profileData.id,this.profileData.id);
			this.ajax('getOrders', this.profileData.id);
		},

		handleGetOrders: function(data) {
			if (_.isUndefined(data[0])) return;
			this.profileData.recentOrders = data;
			this.profileData.ordersCount = data.length;

			if (data.length > 3) {
				this.profileData.recentOrders = data.slice(data.length-3, data.length).reverse();
			} else {
				this.profileData.recentOrders = data.reverse();
			}

			_.each(this.profileData.recentOrders, function(order) {
				order.uri = helpers.fmt(this.resources.ORDER_URI,this.settings.url,order.id,order.id);
			}, this);

			this.checkTicketOrder(data);
		},

		checkTicketOrder : function(data) {
			var customFieldName, orderId;

			if (this.settings.order_id_field_id) {
				customFieldName = 'custom_field_' + this.settings.order_id_field_id;
				orderId = this.ticket().customField(customFieldName);

				if (orderId) {
					this.profileData.ticketOrder = _.find(data, function(order){
						return (order.id == orderId);
					});
				}
			}
		},

		dataChanged: function() {
			var ticketSubject = this.ticket().subject();
			if (_.isUndefined(ticketSubject)) { return; }
			var requester = this.ticket().requester();
			if (_.isUndefined(requester)) { return; }
			var requesterEmail = this.ticket().requester().email();
			if (_.isUndefined(requesterEmail)) return;
			this.ajax('getProfile', requesterEmail);
		},

		showError: function(title, msg) {
			this.switchTo('error', {
				title: title || this.I18n.t('global.error.title'),
				message: msg || this.I18n.t('global.error.message')
			});
		},

		handleGetProfileError: function() {
			// Show fail message
			this.showError(this.I18n.t('global.error.customerNotFound'), " ");
		},

		handleFail: function() {
			// Show fail message
			this.showError();
		}
	};

}());