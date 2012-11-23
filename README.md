Zendesk App for Bigcommerce
===============

A new Zendesk App for Bigcommerce

## Features

- When viewing a ticket in Zendesk, the Bigcommerce app displays customer details in the App panel on the right side of your screen.
- If a custom field for order numbers has been setup and filled out, then order information is also displayed.

## Prerequisites
- You must have new Zendesk enabled and accessible through http://{subdomain}.zendesk.com/agent/.

## Install the Bigcommerce app

1. **Login to the [new Zendesk](https://support.zendesk.com/entries/21926757-the-new-zendesk-faqs)**
	
	Navigate to http://{subdomain}.zendesk.com/agent/.


2. **Browse to the Manage page**
	
	Navigate to the manage page by clicking the **Manage** icon.


3. **Create a new app**
	
	Create a new app by selecting Create from the left navigation, then click Create a new app on the right.


4. **Upload the app**
	
	Fill in the name and description fields, upload the [.zip file attached](https://github.com/zendesk/bigcommerce_app/archive/master.zip), then click Save.


5. **Install the app**
	
	Click **Browse** from the left navigation, then hover over the Bigcommerce app and click **Install**.


6. **Configure the app**
	
	Next you'll need to tell the app which Bigcommerce store to connect with and provide authentication details.

	**Title:** This will display above the app in the sidebar.

	**Store URL:** The URL of your Bigcommerce store.

	**Username:** Your username on your Bigcommerce store. You can check it clicking on the menu item _Users_ on your Bigcommerce store.

	**API token:** Required to authenticate with your Bigcommerce store. See the [Enabling API Access](https://developer.bigcommerce.com/display/API/Authentication#Authentication-EnablingAPIAccess) section of the API documentation for instructions on obtaining an API token.

	**Order ID Field ID:** If you would like to have specific order information displayed in the app, you can supply the Zendesk ticket field ID. If you don't have this information yet you can leave it blank and update the app settings later.

	Once you are finished, simply click Install.

## Customer data right next to your support tickets

Now that you have installed the Bigcommerce app, when you navigate to a support ticket using the new Zendesk you'll be able to see customer and order information.

1. **Navigate to a ticket**
	
	Open a ticket from a customer who already exists in your Bigcommerce store. The Bigcommerce app matches users based on their email address.

2. **Display the app sidebar**
	
	If you haven't had the apps sidebar open before, you'll need to click the **Apps** button.

3. **Bigcommerce details displayed**
	
	Your customer's details and specific order details (if an order ID field is configured) should be displayed.

## Download the Bigcommerce App

[Click here to download](https://github.com/zendesk/bigcommerce_app/archive/master.zip)