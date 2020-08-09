const NotificationService = require('~/NotificationService');

android.app.job.JobService.extend("com.tns.notifications.BackgroundService", {
    onStartJob: function (params) {
        let notificationService = NotificationService.getInstance();
        notificationService.showNotification('Tägliche Einschätzung', 'Jetzt die Stimmung erfassen');

        // false says, "the work is done for this job". true says "we had a problem, please reschedule this job again to happen soonish"
        return false;
    },

    onStopJob: function () {
        console.log("Stopping job ...");
    }
});
