<template>
	<Page marginBottom="2%" class="page" @navigatingTo="onPageLoaded">
		<ActionBar>
			<Label text="Activity"></Label>
		</ActionBar>
		<FlexboxLayout flexDirection="column" justifyContent="space-between">
			<Label height="80%" class="hint" :text="currentText"  textWrap="true"/>
			<Button text="listen" :isEnabled="!isListening" @tap="onTapListen" class="-outline -rounded-lg "></Button>
			<Button text="reset" @tap="onTap" class="-outline -rounded-lg "></Button>
        </FlexboxLayout>
	</Page>
</template>

<script>
	const ActivityDetection = require("../ActivityRecognitionV2");
	const AppSettings = require("tns-core-modules/application-settings");
	const timerModule = require("tns-core-modules/timer");

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
			onActivity(eventData) {
				let activityType = eventData.activity.type;
				let transition = eventData.activity.transition;
				let date = new Date();
				let activity;

				let index = AppSettings.getAllKeys().length + '';
				if (!index) {
					index = '0';
				}

				AppSettings.setString(index, activityType + ' (' + transition + ')');
				AppSettings.flush();
				this.reloadActivities();
/*
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
			onTapListen() {
		    	this.isListening = true;
				console.info('# Triggered listen');
		    	let activityDetection = ActivityDetection.getInstance();

				activityDetection.on(ActivityDetection.activityEvent, this.onActivity);
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
