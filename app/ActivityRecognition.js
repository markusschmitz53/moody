const {Observable} = require("data/observable");
const application = require('application');

const GoogleApiClient = com.google.android.gms.common.api.GoogleApiClient;
const ActivityRecognition = com.google.android.gms.location.ActivityRecognition;
const ActivityRecognitionResult = com.google.android.gms.location.ActivityRecognitionResult;
const DetectedActivity = com.google.android.gms.location.DetectedActivity;

const activityEvent = "activity-event";
const ACTIVITY_TYPE = {
	IN_VEHICLE: DetectedActivity.IN_VEHICLE,
	ON_BICYCLE: DetectedActivity.ON_BICYCLE,
	ON_FOOT: 	DetectedActivity.ON_FOOT,
	STILL: DetectedActivity.STILL,
	UNKNOWN: DetectedActivity.UNKNOWN,
	RUNNING: DetectedActivity.RUNNING,
	WALKING: DetectedActivity.WALKING,
	TILTING: DetectedActivity.TILTING
};

var instance;

com.pip3r4o.android.app.IntentService.extend('de.markusschmitz.ActivityIntentService', {
	onHandleIntent: function (intent) {
		if (instance) {
			if (ActivityRecognitionResult.hasResult(intent)) {
				let result = ActivityRecognitionResult.extractResult(intent);
				let activity = result.getMostProbableActivity();
				let activityType = activity.getType();

				// var list = result.getProbableActivities();
				// for (let f = 0; f < list.size(); f++) {
				// 	let activity = list.get(f);
				// 	let activityType = activity.getType();
				// 	instance.notifyActivity(activityType, activity.getConfidence());
				// }
				// instance.notifyActivity(ACTIVITY_TYPE.UNKNOWN, 99.9);

				instance.notifyActivity(activityType, activity.getConfidence());
			}
		}
	}
});

class NativeActivityRecognition extends Observable {

	constructor() {
	    super();

	    console.info('# Constructed NativeActivityRecognition');

		this.context = application.android.context;

		let intent = new android.content.Intent(this.context, de.markusschmitz.ActivityIntentService.class);
		this.activityReconPendingIntent = android.app.PendingIntent.getService(this.context, 0, intent, android.app.PendingIntent.FLAG_UPDATE_CURRENT);

	}

	start(context) {
		if (context) {
			this.context = context;
		}

		console.info('# Started NativeActivityRecognition');

		this.apiClient = new GoogleApiClient.Builder(this.context)
		.addConnectionCallbacks(new GoogleApiClient.ConnectionCallbacks({
			onConnected: this.onConnected.bind(this),
			onConnectionSuspended: function() {
				console.error("Activity Detection: Connection SUSPENDED");
			}.bind(this)
		}))
		.addOnConnectionFailedListener(new GoogleApiClient.OnConnectionFailedListener({
			onConnectionFailed: function() {
				console.error("Activity Detection: Connection FAILED");
			}.bind(this)
		}))
		.addApi(ActivityRecognition.API)
		.build();

		this.apiClient.connect();
	}

	stop() {
		ActivityRecognition.ActivityRecognitionApi.removeActivityUpdates(this.apiClient, this.activityReconPendingIntent);
	}

	onConnected() {
		ActivityRecognition.ActivityRecognitionApi.requestActivityUpdates(this.apiClient, 0, this.activityReconPendingIntent);
	}

	notifyActivity(type, confidence) {
		this.notify({
			eventName: activityEvent,
			activity: {
				type: type,
				confidence: confidence
			}
		});
	}
}

module.exports = {
	getInstance: function () {
		if (!instance) {
			instance = new NativeActivityRecognition();
		}

		return instance;
	},
	TYPE: ACTIVITY_TYPE,
	activityEvent: activityEvent
};
