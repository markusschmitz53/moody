<template>
  <Page actionBarHidden="true" @loaded="onLoaded" @navigatingTo="onPageLoaded" @swipe="onSwipe">
    <StackLayout orientation="vertical" class="background-gradient m-t-30">
      <StackLayout width="100%" class="p-y-30" orientation="horizontal" horizontalAlignment="center">
        <Button :isEnabled="setDateBackwardsEnabled" @tap="onTapDayBackward"
                class="reduced-margin-and-padding m-t-30" width="30" height="36">
          <FormattedString>
						<Span class="fas button-icon-size reduced-margin-and-padding" color="#CCC"
                  text.decode="&#xf0d9;"></Span>
          </FormattedString>
        </Button>
        <StackLayout orientation="vertical" class="m-b-15">
          <Label width="40%" class="text-center weekday" :text="weekdayToday"></Label>
          <Label width="40%" class="dateLabel text-center" :text="dateToday"></Label>
        </StackLayout>
        <Button @tap="onTapDayForward" class="reduced-margin-and-padding m-t-30" width="30" height="36">
          <FormattedString>
						<Span class="fas button-icon-size h2 reduced-margin-and-padding" color="#CCC"
                  text.decode="&#xf0da;"></Span>
          </FormattedString>
        </Button>
      </StackLayout>
      <StackLayout width="100%" horizontalAlignment="left" orientation="horizontal" class="">
        <FlexboxLayout flexDirection="column" justifyContent="center" alignContent="flex-start">
          <Label @tap="showSleepHoursExplanation" textAlignment="center" width="25%" class="sleepHours m-x-20"
                 :color="sleepHoursColor" verticalAlignment="center"
                 :text="sleepHours"></Label>
          <Button @tap="showSleepHoursExplanation" class="transparent-bg button-z-index">
            <FormattedString>
              <Span class="fas" :color="sleepHoursColor" fontSize="20" text.decode="&#xf236;"></Span>
            </FormattedString>
          </Button>
        </FlexboxLayout>
        <ListPicker width="24%" :items="timeItems" @selectedIndexChange="sleepValueChangeStart"
                    v-model="sleepStartSelectedIndex"
                    class="m-r-20"/>
        <ListPicker width="24%" :items="timeItems" @selectedIndexChange="sleepValueChangeEnd"
                    v-model="sleepEndSelectedIndex"
                    class=""/>
      </StackLayout>
      <FlexboxLayout flexDirection="row" justifyContent="flex-start" alignItems="center" class="m-y-30">
        <FlexboxLayout flexDirection="column" justifyContent="center" alignContent="flex-center">
          <Label @tap="showMoodRatingExplanation" textWrap="true" textAlignment="center" width="25%"
                 class="m-x-20">
            <FormattedString>
              <Span class="far h1" :color="moodRatingColor" :text.decode="moodRatingLabel"></Span>
            </FormattedString>
          </Label>
          <Label @tap="showMoodRatingExplanation" textWrap="true" color="#CCC" textAlignment="center"
                 class="hint m-t-5" :text="moodRating"/>
        </FlexboxLayout>
        <AbsoluteLayout height="50">
          <Slider class="slide" width="55%" v-model="moodRating" value="50" minValue="0" maxValue="100"
                  @valueChange="onSliderValueChange($event)"></Slider>
        </AbsoluteLayout>
      </FlexboxLayout>
      <StackLayout class="m-y-30 m-x-30" orientation="horizontal" horizontalAlignment="center">
        <StackLayout class="m-r-10 m-b-5" orientation="horizontal">
          <Button width="40" @tap="showDysphoricExplanation"
                  class="far reduced-margin button-z-index transparent-bg">
            <FormattedString>
							<Span class="far h1  transparent-bg" :color="isDysphoricTintColor"
                    text.decode="&#xf556;"></Span>
            </FormattedString>
          </Button>
          <check-box :checked="isDysphoric" @checkedChange="onIsDysphoricChange"/>
        </StackLayout>
        <Button @tap="addLifeEvent" width="55" class="reduced-margin round-button m-b-10 m-x-10">
          <FormattedString>
            <Span class="far h2" color="#444" text.decode="&#xf073;"></Span>
          </FormattedString>
        </Button>
        <Button @tap="addComorbidSymptom" width="55" class="reduced-margin round-button m-b-10 m-x-10">
          <FormattedString>
            <Span class="far h2" color="#444" text.decode="&#xf0fe;"/>
          </FormattedString>
        </Button>
        <Button @tap="addImpairmentRating" width="55" class="reduced-margin round-button m-b-10 m-l-10">
          <FormattedString>
            <Span class="far h2" color="#444" text.decode="&#xf15c;"></Span>
          </FormattedString>
        </Button>
      </StackLayout>
      <FlexboxLayout class="m-t-30" width="100%">
        <Button v-if="questionDoneForToday" @tap="onCheckButtonTap"
                class="button-z-index reduced-margin transparent-bg">
          <FormattedString>
							<Span class="far button-icon-day-done transparent-bg" :color="assessmentStatusColor"
                    text.decode="&#xf058;"></Span>
          </FormattedString>
        </Button>
        <Button width="100%" text="fertig" :isEnabled="dataWasChanged" @tap="onTapSave"
                class="-primary -rounded-lg"></Button>
      </FlexboxLayout>
    </StackLayout>
  </Page>
</template>
<script>
	import VibratorService from "../Vibrator.service";
	import ComborbidSymptomsComponent from "./ComborbidSymptoms";
	import LifeEventsComponent from "./LifeEvents";
	import DysphoricMania from "./hints/DysphoricMania";
	import SleepHours from "./hints/SleepHours";
	import MoodRating from "./hints/MoodRating";
	import FunctionalImpairment from './FunctionalImpairment';
	import Vue from "nativescript-vue";
	import {Color, Observable} from '@nativescript/core';
	import { Feedback, FeedbackType, FeedbackPosition } from "nativescript-feedback";
  import ForgetDailyAssessment from '~/components/ForgetDailyAssessment';
  import Login from '~/components/Login';
  import Charts from '~/components/Charts';

  const LifeChartService = require('../LifeChart.service');
  const LifeChart = LifeChartService.getInstance();
  const Vibrator = new VibratorService();
  const FeedbackService = new Feedback();

	export default {
		data: () => {
			return {
			  isLoaded : false,
				setDateBackwardsEnabled : false,
				lastSavedRecord         : null,
				oneSuccessfulLoadDone   : false,
				dataWasChanged          : false,
				currentRecordId         : null,
				isDysphoric             : false,
				questionDoneForToday    : false,
				sleepHoursColor         : '#CCC',
				dateToday               : '',
				weekdayToday               : '',
				currentHourAndMinute    : '',
				currentDate             : null,
				isDysphoricTintColor    : '#CCCCCC',
				dayToday                : '',
				sleepHours              : 0,
				sleepStart              : 0,
				sleepEnd                : 0,
				sleepStartedSameDay     : true,
				sleepStartSelectedIndex : 2,
				sleepEndSelectedIndex   : 19,
				currentHint             : '',
				moodRating              : 50,
				moodRatingColor         : '#CCC',
				moodRatingBaseColor     : '#CCC',
				moodRatingHighlightColor: '#00CAAB',
				highlightChangeDuration : 1250,
				moodRatingWarningColor  : '#55FF4400',
				moodRatingLabel         : String.fromCharCode(parseInt('f11a', 16)),
				items                   : [],
				timeItems               : null,
				assessmentStatusColor   : '#CCC'
			};
		},
		methods: {
			onSwipe(_args) {
			  if (de.markusschmitz.Jane.BuildConfig.DEBUG) {
          console.log('DailyAssessment: onSwipe() --> ' + _args.direction);
        }
		    switch (_args.direction) {
		      case 1: this.onTapDayBackward(); break;
		      case 2: this.onTapDayForward(); break;
		      case 4: this.onShowChart(); break;
        }
			},
      onShowChart() {
        if (de.markusschmitz.Jane.BuildConfig.DEBUG) {
          console.log('DailyAssessment: onShowChart()');
        }

        const fileSystemModule = require("tns-core-modules/file-system");

        let FileOutputStream = java.io.FileOutputStream;
        let PdfRendererBuilder = com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
        try {
          let builder = new PdfRendererBuilder();
          builder.useFastMode();
          console.log(fileSystemModule.knownFolders.currentApp().path);
          builder.withUri("file://" + fileSystemModule.knownFolders.currentApp().path + "/in.htm");
          builder.toStream(new FileOutputStream(fileSystemModule.knownFolders.currentApp().path + "/out.pdf"));
          builder.run();
        } catch (e) {
          console.log(e);
        }

        let records = LifeChart.getAssessments();
        if (!records || records.length <= 1) {
          return;
        }

        this.$navigateTo(Charts, {
          animated: true,
          transition: {
            name    : "slideTop",
            duration: 700
          },
          frame   : 'main'
        });
      },
			onIsDysphoricChange(_event) {
				this.isDysphoric = _event.value;
				this.isDysphoricTintColor = this.isDysphoric ? '#FF4400' : '#CCCCCC';
				this.dataWasChanged = (!this.lastSavedRecord || this.lastSavedRecord && this.lastSavedRecord.dysphoric !== this.isDysphoric);
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
          animated  : true,
          props     : {
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
        this.$showModal(FunctionalImpairment, {
          animated: true,
          props   : {
            dateToday           : this.dateToday,
            dateTodayDb         : this.dateTodayDb,
            currentHourAndMinute: this.currentHourAndMinute
          }
        });
      },
			onTapDayForward() {
				this.setDateToday(1);
				this.reset();
				this.setRecord(LifeChart.getRatingForDay(this.dateTodayDb));
			},
			onTapDayBackward() {
			  // TODO: slide navigate to DailyAssessment with different date instead of reloading here
				this.setDateToday(-1);
				this.reset();
				this.setRecord(LifeChart.getRatingForDay(this.dateTodayDb));
			},
			onSliderValueChange(_event) {
				this.dataWasChanged = (!this.lastSavedRecord || this.lastSavedRecord && this.lastSavedRecord.mood !== this.moodRating);

				let currentBasecolor = this.moodRatingBaseColor;

				let face = String.fromCharCode(parseInt('f11a', 16));
				if (this.moodRating < 5) {
					face = String.fromCharCode(parseInt('f5a4', 16));
					currentBasecolor = this.moodRatingWarningColor;
				}
				else if (this.moodRating < 25) {
					face = String.fromCharCode(parseInt('f5b4', 16));
					currentBasecolor = this.moodRatingWarningColor;
				}else if (this.moodRating < 45)
					face = String.fromCharCode(parseInt('f119', 16));
				else if (this.moodRating < 55)
					face = String.fromCharCode(parseInt('f11a', 16)); // :-|
				else if (this.moodRating > 55 && this.moodRating < 65)
					face = String.fromCharCode(parseInt('f118', 16)); // :-)
				else if (this.moodRating >= 65 && this.moodRating < 75)
					face = String.fromCharCode(parseInt('f580', 16)); // :-D
				else if (this.moodRating >= 75 && this.moodRating < 90) {
					face = String.fromCharCode(parseInt('f581', 16));
					currentBasecolor = this.moodRatingWarningColor;
				}
				else if (this.moodRating >= 90) {
					face = String.fromCharCode(parseInt('f587', 16));
					currentBasecolor = this.moodRatingWarningColor;
				}

				this.moodRatingColor = currentBasecolor;

				if (this.dataWasChanged) {
					this.moodRatingColor = this.moodRatingHighlightColor;

					setTimeout(() => {
						this.moodRatingColor = currentBasecolor;
					}, this.highlightChangeDuration);
				}

				this.moodRatingLabel = face;
			},
			sleepValueChangeStart(_event) {
				if (_event.oldValue === this.timeItems.length - 2 && _event.value === this.timeItems.length - 1) {
					this.sleepStartSelectedIndex = 1;
					this.sleepStartedSameDay = true;
				}
				else if (_event.value === 0 && _event.oldValue === 1) {
					this.sleepStartSelectedIndex = this.timeItems.length - 2;
					this.sleepStartedSameDay = false;
				}

				this.sleepStart = this.timeItems[_event.value];
				this.dataWasChanged = (!this.lastSavedRecord || this.lastSavedRecord && this.lastSavedRecord.sleepStartIndex !== this.sleepStartSelectedIndex);
				if (this.dataWasChanged) {
					this.sleepHoursColor = '#00CAAB';

					setTimeout(() => {
						this.sleepHoursColor = '#CCC';
					}, this.highlightChangeDuration);
				}

				this.updateTimeSlept();
			},
			sleepValueChangeEnd(_event) {
				this.sleepEnd = this.timeItems[_event.value];

				this.dataWasChanged = (!this.lastSavedRecord || this.lastSavedRecord && this.lastSavedRecord.sleepEndIndex !== this.sleepEndSelectedIndex);
				if (this.dataWasChanged) {
					this.sleepHoursColor = '#00CAAB';

					setTimeout(() => {
						this.sleepHoursColor = '#CCC';
					}, this.highlightChangeDuration);
				}

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
				let realSystemDateToday = new Date();

				if (_changeDate === 1) {
					this.currentDate.setDate(this.currentDate.getDate() + 1);
				} else if (_changeDate === -1) {
					this.currentDate.setDate(this.currentDate.getDate() - 1);
				} else {
					this.currentDate = new Date();
				}

				let millisecondsPerDay = 24 * 60 * 60 * 1000;
				let daysBetween = Math.round((this.getUtc(this.currentDate) - this.getUtc(realSystemDateToday)) / millisecondsPerDay);
				this.setDateBackwardsEnabled = (daysBetween >= -6);

				let dd = String(this.currentDate.getDate()).padStart(2, '0');
				let mm = String(this.currentDate.getMonth() + 1).padStart(2, '0'); //January is 0!
				let yyyy = this.currentDate.getFullYear();
				let hh = String(this.currentDate.getHours()).padStart(2, '0')
				let ii = String(this.currentDate.getMinutes()).padStart(2, '0')

        this.dayToday = this.currentDate.getDay() + '';
        switch (this.dayToday) {
          case '0':
            this.weekdayToday = 'Sonntag';
            break;
          case '1':
            this.weekdayToday = 'Montag';
            break;
          case '2':
            this.weekdayToday = 'Dienstag';
            break;
          case '3':
            this.weekdayToday = 'Mittwoch';
            break;
          case '4':
            this.weekdayToday = 'Donnerstag';
            break;
          case '5':
            this.weekdayToday = 'Freitag';
            break;
          case '6':
            this.weekdayToday = 'Samstag';
            break;
        }

				this.dateToday = (dd + '.' + mm + '.' + yyyy);
				this.dateTodayDb = yyyy + '-' + mm + '-' + dd;
				this.currentHourAndMinute = hh + ':' + ii;
			},
			getUtc(_date) {
				let result = new Date(_date);
				result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
				return result;
			},
			setRecord(_records) {
				if (_records && _records.length) {
					let record = _records[0];

					this.lastSavedRecord = record;

					let sleepStartIndex = record.sleepStartIndex;
					let sleepEndIndex = record.sleepEndIndex;
					this.currentRecordId = record.id;
					this.moodRating = record.mood;
					this.sleepHours = record.sleepHours;
					this.isDysphoric = record.dysphoric;

					if (!record.id) {
						throw new Error("Record is missing id");
					}

					if (!sleepStartIndex) {
						this.sleepStartSelectedIndex = 2;
					}
					else {
						this.sleepStartSelectedIndex = sleepStartIndex;
					}

					if (!sleepEndIndex) {
						this.sleepEndSelectedIndex = 19;
					}
					else {
						this.sleepEndSelectedIndex = sleepEndIndex;
					}

					this.sleepStartedSameDay = record.sleepStartedSameDay;

					this.questionDoneForToday = true;
					this.assessmentStatusColor = '#444';

					this.oneSuccessfulLoadDone = true;
					this.dataWasChanged = false;
				} else {
					this.lastSavedRecord = null;
					this.dataWasChanged = true;
				}
			},
      onLoaded() {
        Vue.Jane.on(Vue.Jane.EVENT_AUTHENTICATED, this.onAuthenticationDone.bind(this));
      },
      onAuthenticationDone() {
			  this.initialize();
      },
      onPageLoaded(_event) {
				this.page = _event.object.page;

        this.initialize();
			},
      initialize() {
        if (!Vue.Jane.personIsAuthenticated()) {
          return;
        }

        if (this.oneSuccessfulLoadDone) {
          return;
        }

        this.isLoaded = true;
        this.setDateToday();
        this.onSliderValueChange();
        this.dataWasChanged = false;

        this.timeItems = LifeChart.getTimeItems();
        this.resetTimeSlept();
        this.updateTimeSlept();

        this.setRecord(LifeChart.getRatingForDay(this.dateTodayDb));
      },
			resetTimeSlept() {
				this.sleepStart = this.timeItems[2];
				this.sleepEnd = this.timeItems[19];
				this.sleepStartSelectedIndex = 2;
				this.sleepEndSelectedIndex = 19;
			},
			reset() {
				this.dataWasChanged = false;
				this.questionDoneForToday = false;
				this.isDysphoric = false;
				this.moodRating = 50;
				this.currentRecordId = null;
				this.sleepStartedSameDay = true;
				this.dataWasChanged = true;

        this.resetTimeSlept();
        this.updateTimeSlept();
      },
      forgetAssessment() {
        if (LifeChart.removeDailyAssessment(this.currentRecordId)) {
          this.reset();

          FeedbackService.show({
                                 type           : FeedbackType.Success,
                                 position       : FeedbackPosition.Top,
                                 duration       : 1000,
                                 backgroundColor: new Color('#E38E17'),
                                 message        : 'Erledigt'
                               });
        }
      },
      resolveForgetDailyAssessmentPromise(data) {
        if (data === 1) {
          this.forgetAssessment();
        }
        else if (data === 2) {
          console.log("TODO: delete alles")
        }
      },
      onCheckButtonTap() {
        this.$showModal(ForgetDailyAssessment, {
          animated: true
        }).then(this.resolveForgetDailyAssessmentPromise);
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
          // TODO: fix this error message
          FeedbackService.show({
                                 type           : FeedbackType.Error,
                                 position       : FeedbackPosition.Top,
                                 duration       : 1000,
                                 backgroundColor: new Color('#009680'),
                                 message        : Vue.Jane.say('rememberedIt')
                               });
          return;
				}

				this.questionDoneForToday = true;
				this.assessmentStatusColor = '#444';
				this.dataWasChanged = false;

				let record = {
					sleepStartedSameDay: this.sleepStartedSameDay,
					sleepStartIndex    : this.sleepStartSelectedIndex,
					sleepEndIndex      : this.sleepEndSelectedIndex,
					sleepHours         : this.sleepHours,
					mood               : this.moodRating,
					dysphoric          : this.isDysphoric,
					date               : this.dateTodayDb
				};

				Vibrator.vibrate(75);
        if (!this.currentRecordId) {
          this.currentRecordId = LifeChart.saveDailyAssessment(record);

          FeedbackService.show({
                                 type           : FeedbackType.Success,
                                 position       : FeedbackPosition.Top,
                                 backgroundColor: new Color('#009680'),
                                 duration       : 1000,
                                 message        : Vue.Jane.say('rememberedIt')
                               });
        }
        else {
          LifeChart.updateDailyAssessment(this.currentRecordId, record);

          FeedbackService.show({
                                 type           : FeedbackType.Success,
                                 position       : FeedbackPosition.Top,
                                 backgroundColor: new Color('#009680'),
                                 duration       : 1000,
                                 message        : Vue.Jane.say('updatedit')
                               });
        }

        this.lastSavedRecord = record;
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
		font-size: 14;
		margin-top: 6;
	}

	.slide {
		margin-left: -5;
	}

  Label.sleepHours {
    font-size: 24;
    font-weight: normal;
    margin-bottom: -10;
  }

  Label.weekday {
    color: #111111;
    font-size: 24;
    font-weight: normal;
    margin-bottom: 0;
  }

  .round-button {
    border-width: 1;
    border-color: #00CAAB;
    border-radius: 35;
  }

  .fab-button {
    height: 70;
    width: 70; /// this is required on iOS - Android does not require width so you might need to adjust styles
    margin: 15;
    background-color: #FFFFFF;
    border-color: #009680;
    border-width: 1;
    horizontal-align: right;
    vertical-align: top;
  }


</style>
