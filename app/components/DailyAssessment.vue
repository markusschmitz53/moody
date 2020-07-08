<template>
	<Page marginBottom="2%" actionBarHidden="true" @navigatingTo="onPageLoaded">
		<FlexboxLayout flexDirection="column" class="m-t-20" justifyContent="space-between">
			<StackLayout height="10%" class="m-t-30" orientation="horizontal" horizontalAlignment="center" @swipe="onSwipe" >
				<Button @tap="onTapDayBackward" class="reduced-margin-and-padding m-b-30" width="30" height="36">
					<FormattedString>
						<Span class="fas button-icon-size reduced-margin-and-padding" color="#CCC" text.decode="&#xf0d9;"></Span>
					</FormattedString>
				</Button>
				<Label width="30%" class="dateLabel text-center" :text="dateToday"></Label>
				<Button @tap="onTapDayForward" class="reduced-margin-and-padding m-b-30" width="30" height="36">
					<FormattedString>
						<Span class="fas button-icon-size h2 reduced-margin-and-padding" color="#CCC" text.decode="&#xf0da;"></Span>
					</FormattedString>
				</Button>
			</StackLayout>
			<StackLayout horizontalAlignment="left" orientation="horizontal" class="">
				<FlexboxLayout flexDirection="column" justifyContent="center" alignContent="flex-start">
					<Label @tap="showSleepHoursExplanation" textAlignment="center" width="25%" class="h1 m-x-20" :color="sleepHoursColor" verticalAlignment="center"
						   :text="sleepHours"></Label>
					<Button @tap="showSleepHoursExplanation" class="button-z-index">
						<FormattedString>
							<Span class="fas" :color="sleepHoursColor" fontSize="20" text.decode="&#xf236;"></Span>
						</FormattedString>
					</Button>
				</FlexboxLayout>
				<ListPicker width="24%" :items="timeItems" @selectedIndexChange="sleepValueChangeStart" v-model="sleepStartSelectedIndex"
							class="m-r-20"/>
				<ListPicker width="24%" :items="timeItems" @selectedIndexChange="sleepValueChangeEnd" v-model="sleepEndSelectedIndex"
							class=""/>
			</StackLayout>
			<FlexboxLayout flexDirection="row" justifyContent="flex-start" alignItems="center">
				<FlexboxLayout flexDirection="column" justifyContent="center" alignContent="flex-center">
					<Label @tap="showMoodRatingExplanation" textWrap="true" :color="moodRatingColor" textAlignment="center" width="25%" class="h1 m-x-20" :text="moodRatingLabel"/>
					<Label @tap="showMoodRatingExplanation" textWrap="true" color="#CCC" textAlignment="center" class="hint m-t-5" :text="moodRating"/>
				</FlexboxLayout>
				<Slider class="slide" width="55%" v-model="moodRating" value="50" minValue="0" maxValue="100" @valueChange="onSliderValueChange($event)"></Slider>
			</FlexboxLayout>
			<StackLayout class="m-t-15 m-x-30" orientation="horizontal" horizontalAlignment="center">
				<StackLayout class="m-r-10" orientation="horizontal">
					<Button width="40" @tap="showDysphoricExplanation" class="far reduced-margin button-z-index" >
						<FormattedString>
							<Span class="far h1" :color="isDysphoricTintColor"
								  text.decode="&#xf556;"></Span>
						</FormattedString>
					</Button>
					<check-box :checked="isDysphoric" @checkedChange="onIsDysphoricChange" />
				</StackLayout>
				<Button @tap="addLifeEvent" width="55" class="reduced-margin m-x-10">
					<FormattedString>
						<Span class="far h2" color="#444" text.decode="&#xf073;"></Span>
					</FormattedString>
				</Button>
				<Button @tap="addComorbidSymptom" width="55" class="reduced-margin m-x-10">
					<FormattedString>
						<Span class="far h2" color="#444" text.decode="&#xf0fe;"/>
					</FormattedString>
				</Button>
				<Button @tap="addImpairmentRating" width="55" class="reduced-margin m-l-10">
					<FormattedString>
						<Span class="far h2" color="#444" text.decode="&#xf080;"></Span>
					</FormattedString>
				</Button>
			</StackLayout>
			<FlexboxLayout class="m-x-10" width="100%">
				<Button width="100%" text="fertig" :isEnabled="savingEnabled" @tap="onTapSave" class="-primary -rounded-lg"></Button>
				<Button v-if="questionDoneForToday" @tap="onCheckButtonTap" class="button-z-index reduced-margin">
					<FormattedString>
						<Span class="far button-icon-day-done" :color="assessmentStatusColor" text.decode="&#xf058;"></Span>
					</FormattedString>
				</Button>
			</FlexboxLayout>
        </FlexboxLayout>
	</Page>
</template>
<script>
	import * as dialogs from "tns-core-modules/ui/dialogs";
	import * as appSettings from "tns-core-modules/application-settings";
	import LifeChartService from '~/LifeChart.service';
	import VibratorService from "../Vibrator.service";
	import ComborbidSymptomsComponent from "./ComborbidSymptoms";
	import DysphoricMania from "./hints/DysphoricMania";
	import SleepHours from "./hints/SleepHours";
	import MoodRating from "./hints/MoodRating";
	import LifeEventsComponent from "./LifeEvents";
	import Mood from './FunctionalImpairment';
	import {Observable} from '@nativescript/core';
	const fromObject = require("tns-core-modules/data/observable").fromObject;

	const LifeChart = new LifeChartService();
	const Vibrator = new VibratorService();

	export default {
		data: () => {
			return {
				oneSuccessfulLoadDone  : false,
				savingEnabled          : true,
				currentRecordKey       : null,
				isDysphoric            : false,
				questionDoneForToday   : false,
				sleepHoursColor    : '#CCC',
				moodRatingColor    : '#CCC',
				dateToday              : '',
				currentHourAndMinute   : '',
				currentDate            : null,
				isDysphoricTintColor   : '#CCCCCC',
				dayToday               : '',
				sleepHours             : 0,
				sleepStart             : 0,
				sleepEnd               : 0,
				sleepStartedSameDay    : false,
				sleepStartSelectedIndex: 46,
				sleepEndSelectedIndex  : 18,
				currentHint            : '',
				moodRating             : 50,
				moodRatingLabel        : '50',
				items                  : [],
				timeItems              : null,
				assessmentStatusColor  : '#CCC'
			};
		},
		methods: {
			onSwipe(args) {
				if (args.direction === 1) {
					this.onTapDayBackward();
				} else if (args.direction === 2) {
					this.onTapDayForward();
				}
			},
			onIsDysphoricChange(event) {
				this.isDysphoric = event.value;
				this.isDysphoricTintColor = this.isDysphoric ? '#FF4400' : '#CCCCCC';
			},
			showDysphoricExplanation() {
				this.$showModal(DysphoricMania, {
					animated  : true,
					props     : {
						currentValue: this.isDysphoric
					}
				});
			},
			showSleepHoursExplanation() {
				this.$showModal(SleepHours, {
					animated  : true
				});
			},
			showMoodRatingExplanation() {
				this.$showModal(MoodRating, {
					animated  : true
				});
			},
			addComorbidSymptom() {
				this.$showModal(ComborbidSymptomsComponent, {
					animated: true,
					props: {
						dateTodayDb: this.dateTodayDb
					}
				});
			},
			addLifeEvent() {
				this.$showModal(LifeEventsComponent, {
					animated: true,
					props   : {
						dateTodayDb: this.dateTodayDb
					}
				});
			},
			addImpairmentRating() {
				this.$navigateTo(Mood, {
					animated: true,
					frame: 'main',
					props: {
						dateToday           : this.dateToday,
						dateTodayDb         : this.dateTodayDb,
						currentHourAndMinute: this.currentHourAndMinute
					}
				});
			},
			onTapDayForward() {
				this.setDateToday(1);
				this.resetRating();
				LifeChart.getRatingForDay(this.dateTodayDb, this.onRecordLoaded);
			},
			onTapDayBackward() {
				this.setDateToday(-1);
				this.resetRating();
				LifeChart.getRatingForDay(this.dateTodayDb, this.onRecordLoaded);
			},
			onSliderValueChange(event) {
				this.moodRatingColor = '#00CAAB';

				setTimeout(() => {
					this.moodRatingColor = '#CCC';
				}, 1250);

				let face = ':-|';
				if (this.moodRating < 5)
					face = ':\'-C';
				else if (this.moodRating < 25)
					face = ':\'-(';
				else if (this.moodRating < 45)
					face = ':-(';
				else if (this.moodRating < 55)
					face = ':-|';
				else if (this.moodRating > 55 && this.moodRating < 75)
					face = ':-)';
				else if (this.moodRating >= 75)
					face = ':-D'

				this.moodRatingLabel = face;
			},
			sleepValueChangeStart(event) {
				if (event.oldValue === this.timeItems.length - 2 && event.value === this.timeItems.length - 1) {
					this.sleepStartSelectedIndex = 1;
					this.sleepStartedSameDay = true;
				}
				else if (event.value === 0 && event.oldValue === 1) {
					this.sleepStartSelectedIndex = this.timeItems.length - 2;
					this.sleepStartedSameDay = false;
				}

				this.sleepStart = this.timeItems[event.value];
				this.updateTimeSlept();
			},
			sleepValueChangeEnd(event) {
				this.sleepEnd = this.timeItems[event.value];
				this.updateTimeSlept();
			},
			updateTimeSlept() {
				this.sleepHoursColor = '#00CAAB';

				setTimeout(() => {
					this.sleepHoursColor = '#CCC';
				}, 1250);

				let sleepStartTimeParts = this.sleepStart.split(':');
				let sleepEndTimeParts = this.sleepEnd.split(':');

				if (sleepStartTimeParts.length !== 2 || sleepEndTimeParts.length !== 2)
					return;

				let today = new Date();
				let yesterday = new Date();

				if (this.sleepStartedSameDay)
					yesterday.setDate(today.getDate());
				else
					yesterday.setDate(today.getDate() - 1);

				let date1 = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), sleepStartTimeParts[0], sleepStartTimeParts[1], 0)
				let date2 = new Date(today.getFullYear(), today.getMonth(), today.getDate(), sleepEndTimeParts[0], sleepEndTimeParts[1], 0)
				this.sleepHours = Math.abs(date2 - date1) / 36e5;
			},
			setDateToday(_changeDate) {
				if (_changeDate === 1) {
					this.currentDate.setDate(this.currentDate.getDate() + 1);
				} else if (_changeDate === -1) {
					this.currentDate.setDate(this.currentDate.getDate() - 1);
				} else {
					this.currentDate = new Date();
				}

				let dd = String(this.currentDate.getDate()).padStart(2, '0');
				let mm = String(this.currentDate.getMonth() + 1).padStart(2, '0'); //January is 0!
				let yyyy = this.currentDate.getFullYear();
				let hh = String(this.currentDate.getHours()).padStart(2, '0')
				let ii = String(this.currentDate.getMinutes()).padStart(2, '0')

				this.dayToday = this.currentDate.getDay() + '';
				this.dateToday = (dd + '.' + mm + '.' + yyyy);
				this.dateTodayDb = yyyy + '-' + mm + '-' + dd;
				this.currentHourAndMinute = hh + ':' + ii;
			},
			onRecordLoaded(result) {
				if (!result.error) {
					let records = result.children;

					if (records && records.length) {
						let record = records[0];

						let sleepStartIndex = record.sleepStartIndex;
						let sleepEndIndex = record.sleepEndIndex;
						this.currentRecordKey = record.key;
						this.moodRating = record.mood;
						this.sleepHours = record.sleepHours;
						this.isDysphoric = record.dysphoric;

						if (!record.key) {
							throw new Error("Record is missing key");
						}

						if (!sleepStartIndex) {
							this.sleepStartSelectedIndex = 46;
						}
						else {
							this.sleepStartSelectedIndex = sleepStartIndex;
						}

						if (!sleepEndIndex) {
							this.sleepEndSelectedIndex = 18;
						}
						else {
							this.sleepEndSelectedIndex = sleepEndIndex;
						}

						this.sleepStartedSameDay = record.sleepStartedSameDay;

						this.questionDoneForToday = true;
						this.assessmentStatusColor = '#444';

						this.oneSuccessfulLoadDone = true;
					}
				} else {
					console.error(result.error);
				}
			},
			onPageLoaded(event) {
				if (this.oneSuccessfulLoadDone) {
					return;
				}

				this.page = event.object.page;

				this.setDateToday();
				this.onSliderValueChange();

				this.timeItems = LifeChart.getTimeItems();
				this.resetTimeSlept();
				this.updateTimeSlept();

				LifeChart.getRatingForDay(this.dateTodayDb, this.onRecordLoaded);
			},
			resetTimeSlept() {
				this.sleepStart = this.timeItems[46];
				this.sleepEnd = this.timeItems[18];
				this.sleepStartSelectedIndex = 46;
				this.sleepEndSelectedIndex = 18;
			},
			resetRating() {
				this.questionDoneForToday = false;
				this.savingEnabled = true;
				this.isDysphoric = false;
				this.moodRating = 50;
				this.currentRecordKey = null;

				this.resetTimeSlept();
				this.updateTimeSlept();
			},
			onCheckButtonTap() {
				let that = this;
				dialogs.confirm({
									title           : "",
									message         : "alles erledigt für heute",
									cancelButtonText: "cool",
									okButtonText    : "vergiss den Tag"
								}).then(function (result) {
					if (result) {
						LifeChart.removeDailyAssessment(that.currentRecordKey).then((result) => {
							that.resetRating();
						});
					}
				});
			},
			validate() {
				if (!this.dateTodayDb || this.dateTodayDb === '') {
					throw new Error('Invalid value exception for property dateToday');
				}

				if (isNaN(parseFloat(this.sleepHours)) || !isFinite(this.sleepHours) || this.sleepHours < 0) {
					throw new Error('Invalid value exception for property sleepHours');
				}

				if (isNaN(parseFloat(this.moodRating)) || !isFinite(this.moodRating) || this.moodRating < 0) {
					throw new Error('Invalid value exception for property moodRating');
				}

				return true;
			},
			onTapSave() {
				if (!this.validate()) {
					console.error('Validation failed');
					return;
				}

				this.questionDoneForToday = true;
				this.assessmentStatusColor = '#444';

				Vibrator.vibrate(75);

				let promise;

				if (!this.currentRecordKey) {
					promise = LifeChart.saveDailyAssessment(
							{
								sleepHours         : this.sleepHours,
								sleepStartIndex    : this.sleepStartSelectedIndex,
								sleepEndIndex      : this.sleepEndSelectedIndex,
								sleepStartedSameDay: this.sleepStartedSameDay,
								mood               : this.moodRating,
								dysphoric          : this.isDysphoric,
								date               : this.dateTodayDb
							}
					);
				}
				else {
					promise = LifeChart.updateDailyAssessment(this.currentRecordKey,
															  {
																  sleepStartedSameDay: this.sleepStartedSameDay,
																  sleepStartIndex    : this.sleepStartSelectedIndex,
																  sleepEndIndex      : this.sleepEndSelectedIndex,
																  sleepHours         : this.sleepHours,
																  mood               : this.moodRating,
																  dysphoric          : this.isDysphoric,
																  date               : this.dateTodayDb
															  }
					);
				}

				promise.then((result) => {
					if (!this.currentRecordKey) {
						this.currentRecordKey = result.key;
					}
					let message = 'Tag: ' + this.dateTodayDb + "\n" +
								  'Schlaf Stunden: ' + this.sleepHours + "\n" +
								  'Stimmung: ' + this.moodRating + "\n" +
								  'Dysphorisch: ' + this.isDysphoric;
					dialogs.alert({
									  title       : "",
									  message     : message,
									  okButtonText: "cool"
								  });
				}, (error) => {
					console.error("error");
					dialogs.alert({
									  title       : "",
									  message     : "es gab einen Fehler:" + error,
									  okButtonText: "oh no :("
								  });
				});
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

	.reduced-margin-and-padding {
		margin: 0;
		padding: 10;
	}

	.reduced-margin {
		margin: 0;
		padding: 0;
	}

	.button-icon-size {
		font-size: 16;
	}

	.button-icon-day-done {
		font-size: 25;
	}

	.dateLabel {
		color: #444444;
		font-size: 15;
		margin-top: 3;
	}


	.slide {
		margin-left: -5;
	}
</style>
