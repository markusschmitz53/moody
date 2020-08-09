const Observable = require('tns-core-modules/data/observable').Observable;
const utils = require('tns-core-modules/utils/utils');
const app = require('tns-core-modules/application');

let instance;

class NotificationService extends Observable {

    constructor() {
        super();
    }

    showNotification(_title, _message) {
        if (android.os.Build.VERSION.SDK_INT >= 26) {
            const channelId = 'moody_channel_1';
            const importance = android.app.NotificationManager.IMPORTANCE_LOW;
            const notificationChannelInstance = new android.app.NotificationChannel(channelId, 'Moody', importance);
            notificationChannelInstance.enableVibration(true);

            let context = utils.ad.getApplicationContext();
            let builder = new android.app.Notification.Builder(context);
            let manager = context.getSystemService(android.content.Context.NOTIFICATION_SERVICE);
            manager.createNotificationChannel(notificationChannelInstance);

            let mainIntent = new android.content.Intent(context, app.android.startActivity.getClass());
            mainIntent.addFlags(android.content.Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
            mainIntent.setAction(android.content.Intent.ACTION_MAIN);
            mainIntent.addCategory(android.content.Intent.CATEGORY_LAUNCHER);
            let pendingIntent = android.app.PendingIntent.getActivity(context, 0, mainIntent, 0);

            builder.setContentTitle(_title)
                .setAutoCancel(true) // remove when user taps
                .setColor(android.R.color.holo_blue_dark)
                .setContentText(_message)
                .setContentIntent(pendingIntent)
                .setVibrate([100, 200, 100])
                .setChannelId(channelId)
                .setSmallIcon(android.R.drawable.btn_star_big_on);

            manager.notify(1, builder.build());
        }
    }
}

module.exports = {
    getInstance: function () {
        if (!instance) {
            instance = new NotificationService();
        }

        return instance;
    }
}
