const { Observable } = require("tns-core-modules/data/observable");
const application = require('tns-core-modules/application');
const utils = require("tns-core-modules/utils/utils");

var Intent = android.content.Intent;
var instance;

const notificationEvent = 'notificationEvent';

class NotificationReceiveService extends Observable {

    constructor() {
        super();
	    console.info('# Constructed NotificationReceiveService');
    }

    postNotification() {
        // Do something. For example, fetch fresh data from backend to create a rich notification?
        var context = utils.ad.getApplicationContext();// get a reference to the application context in Android
        var builder = new android.app.Notification.Builder(context);
        builder.setContentTitle("Scheduled Notification")
            .setAutoCancel(true)
            .setColor(android.R.color.holo_purple)// optional
            .setContentText("This notification has been triggered by Notification Service")
            .setVibrate([100, 200, 100])// optional
            .setSmallIcon(android.R.drawable.btn_star_big_on);
        // will open main NativeScript activity when the notification is pressed
        var mainIntent = new android.content.Intent(context, com.tns.NativeScriptActivity.class);
        var pendingIntent = android.app.PendingIntent.getActivity(context,
                                                                  1,
                                                                  mainIntent,
                                                                  android.app.PendingIntent.FLAG_UPDATE_CURRENT);
        builder.setContentIntent(pendingIntent);
        builder.setDeleteIntent(getDeleteIntent(context));
        var manager = context.getSystemService(android.content.Context.NOTIFICATION_SERVICE);
        manager.notify(1, builder.build());
    }
}

android.content.BroadcastReceiver.extend('de.markusschmitz.broadcastreceiver.NotificationEventReceiver', {
   onReceive: function (context, intent) {
       // creates the service when notification is received
    console.log("test");
   }
});

/*
android.content.WakefulBroadcastReceiver.extend('de.markusschmitz.NotificationEventReceiver', {
   onReceive:function (context, intent) {
       // creates the service when notification is received
       var action = intent.getAction();
       var serviceIntent = createIntentStartNotificationService(context);

       if (serviceIntent) {
           android.content.WakefulBroadcastReceiver.startWakefulService(context, serviceIntent);
       }
   }
})*/

module.exports = {
	getInstance: function () {
		if (!instance) {
			instance = new NotificationReceiveService();
		}

		return instance;
	},
	notificationEvent: notificationEvent
};
