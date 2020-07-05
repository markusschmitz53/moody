<template>
	<Page marginBottom="2%" actionBarHidden="true" @loaded="onPageLoaded" @navigatingTo="onPageLoaded">
		<FlexboxLayout flexDirection="column" class="m-t-15" justifyContent="space-between">
			<StackLayout height="10%" class="m-t-30" orientation="horizontal" verticalAlignment="center">
				<Label @tap="onTapDayBackward" width="35%" class="h3 text-right" color="#AAA" text="<"></Label>
				<Label width="30%" class="h3 m-t-2 text-center" color="#CCC" :text="dateToday"></Label>
				<Label @tap="onTapDayForward" width="35%" class="h3 text-left" color="#AAA" text=">"></Label>
			</StackLayout>
			<StackLayout horizontalAlignment="left" orientation="horizontal">
				<Label textAlignment="center" width="25%" class="h1 m-x-20" color="#CCC" verticalAlignment="center" :text="sleepHours"></Label>
				<ListPicker width="24%" :items="timeItems" @selectedIndexChange="sleepValueChangeStart" :selectedIndex="sleepStartSelectedIndex"
							class="m-r-20"/>
				<ListPicker width="24%" :items="timeItems" @selectedIndexChange="sleepValueChangeEnd" selectedIndex="18"
							class=""/>
			</StackLayout>
			<FlexboxLayout flexDirection="row" justifyContent="flex-start" alignItems="center">
				<Label textWrap="true" color="#CCC" textAlignment="center" width="20%" class="h1 m-l-20" :text="moodRatingLabel"/>
				<Label textWrap="true" color="#CCC" textAlignment="center" class="hint" :text="moodRating"/>
				<Slider width="60%" v-model="moodRating" value="50" minValue="0" maxValue="100" @valueChange="onSliderValueChange($event)"></Slider>
			</FlexboxLayout>
			<FlexboxLayout class="m-t-15" flexDirection="row" justifyContent="space-around" alignItems="center">
				<StackLayout orientation="horizontal">
					<Button @tap="addLifeEvent" class="-rounded-sm" width="50">
						<FormattedString>
							<Span class="far h1 button-icon" color="#444" text.decode="&#xf073;"></Span>
						</FormattedString>
					</Button>
					<Button @tap="addComorbidSymptom" class="-rounded-sm m-x-25" width="50">
						<FormattedString>
							<Span class="far h1" color="#444" text.decode="&#xf0fe;"/>
						</FormattedString>
					</Button>
					<Button @tap="addImpairmentRating" class="-rounded-sm" width="50">
						<FormattedString>
							<Span class="far h1 button-icon" color="#444" text.decode="&#xf14a;"></Span>
						</FormattedString>
					</Button>
				</StackLayout>
			</FlexboxLayout>
			<FlexboxLayout width="100%">
				<Button width="90%" text="fertig" :isEnabled="savingEnabled" @tap="onTapSave" class="-primary -rounded-lg"></Button>
				<Button v-if="questionDoneForToday" @tap="onCheckButtonTap" class="button-z-index">
					<FormattedString>
						<Span class="far h1 button-icon" :color="assessmentStatusColor" text.decode="&#xf058;"></Span>
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
	import LifeEventsComponent from "./LifeEvents";
	import Mood from './Mood';

	const LifeChart = new LifeChartService();
	const Vibrator = new VibratorService();

	export default {
		data: () => {
			return {
				savingEnabled          : true,
				currentRecordKey       : null,
				isDysphoric            : false,
				questionDoneForToday   : false,
				dateToday              : '',
				currentHourAndMinute   : '',
				currentDate            : null,
				isDysphoricTintColor   : '#CCCCCC',
				dayToday               : '',
				selectedItemIndex      : 0,
				sleepHours             : 0,
				sleepStart             : 0,
				sleepEnd               : 0,
				sleepStartedSameDay    : false,
				sleepStartSelectedIndex: 46,
				currentHint            : '',
				moodRating             : 50,
				moodRatingLabel        : '50',
				items                  : [],
				timeItems              : null,
				assessmentStatusColor  : '#CCC'
			};
		},
		methods: {
			addComorbidSymptom() {
				this.$showModal(ComborbidSymptomsComponent, {
						props: {
							dateTodayDb: this.dateTodayDb
						}
					});
			},
			addLifeEvent() {
				this.$showModal(LifeEventsComponent, {
						props: {
							dateTodayDb: this.dateTodayDb
						}
					});
			},
			addImpairmentRating() {
				this.$navigateTo(Mood, {
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
				this.currentRecordKey = null;
				this.questionDoneForToday = false;
				let ratingRecord = LifeChart.getRatingForDay(this.dateTodayDb, this.onRecordLoaded);
			},
			onTapDayBackward() {
				this.setDateToday(-1);
				this.currentRecordKey = null;
				this.questionDoneForToday = false;
				let ratingRecord = LifeChart.getRatingForDay(this.dateTodayDb, this.onRecordLoaded);
			},
			onSliderValueChange(event) {
				let face = ':-|';
				if (this.moodRating < 5)
					face = ':\'-C';
				else if (this.moodRating < 25)
					face = ':\'-(';
				else if (this.moodRating < 45)
					face = ':-(';
				else if (this.moodRating < 55)
					face = ':-|';
				else if (this.moodRating > 55)
					face = ':-)';
				else if (this.moodRating > 75)
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
						this.currentRecordKey = records[0].key;
						this.questionDoneForToday = true;
						this.assessmentStatusColor = '#444';
					}
				} else {
					console.error(result.error);
				}
			},
			onPageLoaded() {
				this.setDateToday();
				this.onSliderValueChange();

				this.timeItems = LifeChart.getTimeItems();
				this.sleepStart = this.timeItems[46];
				this.sleepEnd = this.timeItems[18];

				LifeChart.getRatingForDay(this.dateTodayDb, this.onRecordLoaded);

				this.updateTimeSlept();
			},
			selectedIndexChanged() {
				if (this.items[this.selectedItemIndex]) {
					this.currentHint = this.items[this.selectedItemIndex].hint;
				}
			},
			onTapReset() {
				appSettings.remove('lastLifeChartDay');
				this.questionDoneForToday = false;
				this.selectedItemIndex = 4;
				this.savingEnabled = true;
				this.sleepHours = 0;
			},
			onCheckButtonTap() {
				dialogs.alert({
									  title       : "",
									  message     : 'alles erledigt für heute',
									  okButtonText: "cool"
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
				appSettings.setString('lastLifeChartDay', this.dayToday);

				let promise;

				if (!this.currentRecordKey) {
					promise = LifeChart.saveDailyAssessment(
							{
								sleepHours: this.sleepHours,
								mood      : this.moodRating,
								date      : this.dateTodayDb
							}
					);
				} else {
					promise = LifeChart.updateDailyAssessment(this.currentRecordKey,
							{
								sleepHours: this.sleepHours,
								mood      : this.moodRating,
								date      : this.dateTodayDb
							}
					);
				}

				promise.then((result) => {
					if (!this.currentRecordKey) {
						this.currentRecordKey = result.key;
					}
					let message = 'Tag: ' + this.dateTodayDb + "\n" +
								  'Schlaf Stunden: ' + this.sleepHours + "\n" +
								  'Stimmung: ' + this.moodRating;
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
</style>
