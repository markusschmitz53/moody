const { Observable } = require("data/observable");
const application = require('application');

const OnSuccessListener = com.google.android.gms.tasks.OnSuccessListener;
const OnFailureListener = com.google.android.gms.tasks.OnFailureListener;
const GoogleApiClient = com.google.android.gms.common.api.GoogleApiClient;
const ActivityRecognition = com.google.android.gms.location.ActivityRecognition;
const ActivityRecognitionClient = com.google.android.gms.location.ActivityRecognitionClient;
const ActivityTransition = com.google.android.gms.location.ActivityTransition;
const ActivityTransitionRequest = com.google.android.gms.location.ActivityTransitionRequest;
const ActivityTransitionResult = com.google.android.gms.location.ActivityTransitionResult;
const ActivityRecognitionResult = com.google.android.gms.location.ActivityRecognitionResult;
const DetectedActivity = com.google.android.gms.location.DetectedActivity;

const activityEvent = "activity-event";
const connectionEvent = "connection-event";
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
            instance.notify({
                                eventName: connectionEvent,
                                message  : 'onIntent #1'
                            });
			if (ActivityTransitionResult.hasResult(intent)) {
				let result = ActivityTransitionResult.extractResult(intent);
				let events = result.transitionEvents.toArray();

                instance.notify({
                                    eventName: connectionEvent,
                                    message  : 'onIntent #2'
                                });

                if (events && events.length) {
                    let event;

                    instance.notify({
                                        eventName: connectionEvent,
                                        message  : 'onIntent #3'
                                    });

                    while (event = events.pop()) {
                        let transitionType = event.getTransitionType();
                        let activityType = event.getActivityType();
                        instance.notifyActivity(activityType, transitionType);
                    }
                }
			}
		}
	}
});

class NativeActivityRecognition extends Observable {

	constructor() {
	    super();

	    console.info('# Constructed NativeActivityRecognition');

		this.context = application.android.context;

		let transitions = new java.util.ArrayList(8);

        transitions.add(new ActivityTransition.Builder()
            .setActivityType(DetectedActivity.STILL)
            .setActivityTransition(ActivityTransition.ACTIVITY_TRANSITION_ENTER)
            .build());

        transitions.add(new ActivityTransition.Builder()
            .setActivityType(DetectedActivity.STILL)
            .setActivityTransition(ActivityTransition.ACTIVITY_TRANSITION_EXIT)
            .build());

       transitions.add(new ActivityTransition.Builder()
            .setActivityType(DetectedActivity.ON_FOOT)
            .setActivityTransition(ActivityTransition.ACTIVITY_TRANSITION_ENTER)
            .build());

        transitions.add(new ActivityTransition.Builder()
            .setActivityType(DetectedActivity.ON_FOOT)
            .setActivityTransition(ActivityTransition.ACTIVITY_TRANSITION_EXIT)
            .build());

       transitions.add(new ActivityTransition.Builder()
            .setActivityType(DetectedActivity.ON_BICYCLE)
            .setActivityTransition(ActivityTransition.ACTIVITY_TRANSITION_ENTER)
            .build());

        transitions.add(new ActivityTransition.Builder()
            .setActivityType(DetectedActivity.ON_BICYCLE)
            .setActivityTransition(ActivityTransition.ACTIVITY_TRANSITION_EXIT)
            .build());

       transitions.add(new ActivityTransition.Builder()
            .setActivityType(DetectedActivity.RUNNING)
            .setActivityTransition(ActivityTransition.ACTIVITY_TRANSITION_ENTER)
            .build());

        transitions.add(new ActivityTransition.Builder()
            .setActivityType(DetectedActivity.RUNNING)
            .setActivityTransition(ActivityTransition.ACTIVITY_TRANSITION_EXIT)
            .build());

        // create intent for a hard-coded class instead of relying on the system to find an appropriate class
		let intent = new android.content.Intent(this.context, de.markusschmitz.ActivityIntentService.class);

        // get pendingIntent that starts a service
		this.activityReconPendingIntent = android.app.PendingIntent.getService(this.context, 0, intent, android.app.PendingIntent.FLAG_UPDATE_CURRENT);
		this.activityTransitionRequest = new ActivityTransitionRequest(transitions);
	}

	start(context) {
		if (context) {
			this.context = context;
		}

		console.info('# Started NativeActivityRecognition');
		let client = ActivityRecognition.getClient(this.context);
        let task = client.requestActivityTransitionUpdates(this.activityTransitionRequest, this.activityReconPendingIntent);
        task.addOnSuccessListener(new OnSuccessListener({
                                                            onSuccess: function () {
                                                                this.notify({
                                                                                eventName: connectionEvent,
                                                                                message: 'transition request successful'
                                                                            });
                                                            }.bind(this)
                                                        }));
        task.addOnFailureListener(new OnFailureListener({
                                                            onFailure: function (error) {
                                                                console.error('# Activity Detection: transition request error');
                                                                console.error(error);
                                                            }.bind(this)
                                                        }));
	}

	stop() {
	     console.info('# Activity Detection: stop')
		ActivityRecognition.getClient(this.context).removeActivityTransitionUpdates(this.activityReconPendingIntent);
	}

	onConnected() {
	    console.info('# Activity Detection: connected')
	    ActivityRecognition.getClient(this.context).requestActivityTransitionUpdates(this.activityTransitionRequest, this.activityReconPendingIntent);
	}

	notifyActivity(_activityType, _transitionType) {
	    console.info(_activityType, _transitionType);
		this.notify({
			eventName: activityEvent,
			activity: {
				type: _activityType,
				transition: _transitionType
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
	activityEvent: activityEvent,
	connectionEvent: connectionEvent
};
