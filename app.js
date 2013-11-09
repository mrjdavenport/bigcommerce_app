(function() {

  return {

    errorCodes: _.range(400,416),
    currAttempt : 0,
    MAX_ATTEMPTS : 20,
    defaultState: 'loading',
    profileData: {},
    storeUrl: '',

    resources: {
      PROFILE_URI       : '/api/v2/customers.json?email=',
      RECENT_ORDERS_URI : '/api/v2/orders.json?customer_id=',
      CUSTOMER_URI      : '%@/admin/index.php?ToDo=searchCustomersRedirect&idFrom=%@&idTo=%@',
      ORDER_URI         : '%@/admin/index.php?ToDo=searchOrdersRedirect&orderFrom=%@&orderTo=%@'
    },

    requests: {
      'getProfile' : function(email) {
        return this.getRequest(this.storeUrl + this.resources.PROFILE_URI + email);
      },
      'getOrders' : function(customer_id) {
        return this.getRequest(this.storeUrl + this.resources.RECENT_ORDERS_URI + customer_id);
      },
      'userInfo': {
        url: '/api/v2/users/me.json'
      }
    },

    events: {
      'app.activated'   : 'init',
      'getProfile.fail' : 'handleGetProfileError',
      'getProfile.done' : 'handleGetProfile',
      'getOrders.done'  : 'handleGetOrders',
      'userInfo.done'   : 'handleUserInfo',

      'getOrders.always': function() {
        if (this.profileData.notes === 'No notes yet.') {
          this.profileData.notes = this.I18n.t('customer.no_notes');
        }
        this.switchTo('profile', this.profileData);
      }
    },

    onUserInfoDone: function(data) {
      this.locale = data.user.locale;
    },

    localizeDate: function(date, params) {
      var options = _.extend({
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }, params || {});
      return new Date(date).toLocaleDateString(this.locale, options);
    },

    init: function(data){
      if(!data.firstLoad){
        return;
      }

      this.ajax('userInfo').done(function() {
        this.requiredProperties = [
          'ticket.requester.email'
        ];

        this.storeUrl = this.checkStoreUrl(this.settings.url);

        _.defer(this.queryBigCommerce.bind(this));
      }.bind(this));
    },

    queryBigCommerce: function(){
      this.switchTo('requesting');
      this.ajax('getProfile', this.ticket().requester().email());
    },

    safeGetPath: function(propertyPath) {
      return _.inject( propertyPath.split('.'), function(context, segment) {
        if (context == null) { return context; }
        var obj = context[segment];
        if ( _.isFunction(obj) ) { obj = obj.call(context); }
        return obj;
      }, this);
    },

    validateRequiredProperty: function(propertyPath) {
      var value = this.safeGetPath(propertyPath);
      return value != null && value !== '' && value !== 'no';
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

    checkStoreUrl: function(url) {
      // First, lets make sure there is no trailing slash, we'll add one later.
      if (url.slice(-1) === '/') { url = url.slice(0, -1); }
      // Test whether we have a front-controller reference here.
      if (url.indexOf('index.php') === -1)
      {
        // Nothing to do, the front-controller isn't in the url, pass it back unaltered.
        return url;
      }
      url = url.replace(/\/index.php/g, '');
      return url;
    },

    handleGetProfile: function(data, txt, resp) {
      if (resp.status === 204) {
        this.handleGetProfileError();
      }
      if (_.isUndefined(data[0])) return;

      // checks if status returned a HTTP error instead of order status (proxy bug)
      if (_.indexOf(this.errorCodes, data[0].status) !== -1 && !_.isUndefined(data[0].message)) {
        this.showError(this.I18n.t('global.error.title'),data[0].message);
        return;
      }

      this.profileData = data[0];

      if (data[0].notes === "") {
        this.profileData.notes = "No notes yet.";
      } else {
        this.profileData.notes = data[0].notes;
      }

      this.profileData.customer_uri = helpers.fmt(this.resources.CUSTOMER_URI,this.storeUrl,this.profileData.id,this.profileData.id);
      this.profileData.ordersCount = 0;
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
        order.status_locale = this.I18n.t('order.statuses.%@'.fmt(order.status_id));
        order.uri = helpers.fmt(this.resources.ORDER_URI,this.storeUrl,order.id,order.id);
        order.date_created_locale = this.localizeDate(order.date_created);
        order.date_shipped_locale = this.localizeDate(order.date_modified);
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

          if (!_.isUndefined(this.profileData.ticketOrder)) {
            // formatting of numbers and dates
            var date_length = this.profileData.ticketOrder.date_created.length;
            this.profileData.ticketOrder.subtotal_inc_tax = parseFloat(this.profileData.ticketOrder.subtotal_inc_tax).toFixed(2);
            this.profileData.ticketOrder.total_inc_tax = parseFloat(this.profileData.ticketOrder.total_inc_tax).toFixed(2);
            this.profileData.ticketOrder.date_created = this.profileData.ticketOrder.date_created.substr(0,date_length - 6);
            this.profileData.ticketOrder.date_shipped = this.profileData.ticketOrder.date_shipped.substr(0,date_length - 6);
          }
        }
      }
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
