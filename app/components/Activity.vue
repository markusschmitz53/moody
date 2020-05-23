<template>
	<Page marginBottom="2%" class="page" @navigatingTo="onPageLoaded" actionBarHidden="true">
		<ActionBar>
			<Label text="Activity"></Label>
		</ActionBar>
		<FlexboxLayout flexDirection="column" justifyContent="space-between">
			<Label height="80%" class="hint" :text="currentText"  textWrap="true"/>
			<Button text="listen" :isEnabled="!isListening" @tap="onTapListen" class="-outline -rounded-lg "></Button>
			<Button text="stop" :isEnabled="isListening" @tap="onTapStop" class="-outline -rounded-lg "></Button>
			<Button text="reset" @tap="onTap" class="-outline -rounded-lg "></Button>
        </FlexboxLayout>
	</Page>
</template>

<script>
	import * as firebase from 'nativescript-plugin-firebase';

	const ActivityDetection = require("../ActivityRecognitionV2");
	const NotificationReceiveService = require("../NotificationReceiveService");
	const NotificationService = require("../NotificationService");
	const AppSettings = require("tns-core-modules/application-settings");
	const timerModule = require("tns-core-modules/timer");
	const app = require('tns-core-modules/application');

	export default {
		data   : () => {
			return {
				isListening: false,
				lastActivityType: null,
				currentText: ''
			};
		},
		methods: {
		    onPageLoaded() {

			},
			reloadActivities() {
		    	this.currentText = '';

		    	let storedRows = AppSettings.getAllKeys(),
				string;

		    	if (storedRows && storedRows.length > 0) {
					for (let rowKey in storedRows) {
						string = AppSettings.getString(storedRows[rowKey]);
						if (string) {
							this.currentText += "\n" + AppSettings.getString(storedRows[rowKey]);
						}
					}

					if (storedRows.length > 25) {
						AppSettings.clear();
						AppSettings.flush();
					}
				}
			},
			setAppsettingsString(_string) {
		    	let index = AppSettings.getAllKeys().length + '';
				if (!index) {
					index = '0';
				}

				AppSettings.setString(index, _string);
				AppSettings.flush();
				this.reloadActivities();
			},
			onNotification(eventData) {
		    	console.info('notification');
				this.setAppsettingsString(eventData.message);
			},
			onConnection(eventData) {
		    	this.setAppsettingsString(eventData.message);
			},
			onActivity(eventData) {
				let activityType = eventData.activity.type;
				let transitionType = eventData.activity.transition;
				let date = new Date();
				let activity, transition;

				switch(activityType) {
					case 0:
						activity = 'IN_VEHICLE';
						break;
					case 1:
						activity = 'ON_BICYCLE';
						break;
					case 2:
						activity = 'ON_FOOT';
						break;
					case 3:
						activity = 'STILL';
						break;
					case 4:
						activity = 'UNKNOWN';
						break;
					case 5:
						activity = 'TILTING'; // stand up from desk etc.
						break;
					case 7:
						activity = 'WALKING';
						break;
					case 8:
						activity = 'RUNNING';
						break;
				}

				switch(transitionType) {
					case 0:
						transition = 'enter';
						break;
					case 1:
						transition = 'exit';
						break;
				}

				this.setAppsettingsString(activity + ' (' + transition + ')');
/*
				if (activityType !== this.lastActivityType) {
					let index = AppSettings.getAllKeys().length + '';
					if (!index) {
						index = '0';
					}

					if (!AppSettings.getString(index)) {
						if (date.toString()) {
							let dateParts = date.toString().split(' ');
							//date = dateParts[2] + '. ' + dateParts[1] + ' ' + dateParts[4];
							date = dateParts[4];
						}

						AppSettings.setString(index, activity + ' (' + date + ')');
						AppSettings.flush();
						this.reloadActivities();
					}
				}*/
			},
			showNotification(_title, _message) {
				let notificationServiceInstance = NotificationService.getInstance();
				notificationServiceInstance.showNotification(_title, _message);
			},
			onTapListen() {
				this.showNotification('test', 'yoooo ' + Math.random());

				this.isListening = true;
				console.info('# Triggered listen');
				app.android.registerBroadcastReceiver(android.content.Intent.ACTION_SCREEN_OFF,
													  (androidContext, intent) => {
														  console.log("off")
													  });
				app.android.registerBroadcastReceiver(android.content.Intent.ACTION_SCREEN_ON,
													  (androidContext, intent) => {
														  console.log("on")
													  });
		    	//let notificationServiceInstance = NotificationReceiveService.getInstance();
				//notificationServiceInstance.on(NotificationReceiveService.notificationEvent, this.onNotification);
			},

			getDeleteIntent(context) {

			},

			onTapListenActivity() {
		    	this.isListening = true;
				console.info('# Triggered listen');
		    	let activityDetection = ActivityDetection.getInstance();

				activityDetection.on(ActivityDetection.activityEvent, this.onActivity);
				activityDetection.on(ActivityDetection.connectionEvent, this.onConnection);
				activityDetection.start();
/*
				timerModule.setInterval(() => {
					let type = (Math.random() > 0.5) ? 3 : 2;
					this.onActivity({
										activity: {
											type      : type,
											confidence: '100'
										}
									});
				}, 10000);*/

				this.reset();
			},
			onTapStop() {
		    	this.isListening = false;
				app.android.unregisterBroadcastReceiver(android.content.Intent.ACTION_SCREEN_OFF);
				app.android.unregisterBroadcastReceiver(android.content.Intent.ACTION_SCREEN_ON);
			},
			onTapStopActivity() {
		    	this.isListening = false;
				let activityDetection = ActivityDetection.getInstance();
				activityDetection.stop();
			},
			onTap() {
				this.reset();
			},
			reset() {
		    	AppSettings.clear();
				AppSettings.flush();
		    	this.reloadActivities();
			}
		}
	};
</script>

<style scoped lang="scss">
	// Start custom common variables
	@import "~@nativescript/theme/scss/variables/blue";
	// End custom common variables

    // Custom styles
    .hint {
        text-align: center;
    }
</style>
