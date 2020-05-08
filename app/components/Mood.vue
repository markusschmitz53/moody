<template>
	<Page marginBottom="2%" actionBarHidden="true" @loaded="onPageLoaded" @navigatingTo="onPageLoaded">
		<template v-if="!questionDoneForToday">
		<FlexboxLayout flexDirection="column" justifyContent="space-around">
			<StackLayout class="m-t-30" orientation="horizontal" verticalAlignment="center">
				<Label @tap="onTapDayBackward" width="35%" class="h3 text-right" color="#AAA" text="<"></Label>
				<Label width="30%" class="h3 m-t-2 text-center" color="#CCC" :text="dateToday"></Label>
				<Label @tap="onTapDayForward" width="35%" class="h3 text-left" color="#AAA" text=">"></Label>
			</StackLayout>
			<FlexboxLayout flexDirection="row" justifyContent="flex-start" alignItems="center">
				<Label textWrap="true" color="#CCC" textAlignment="center" width="40%" class="hint p-x-15 m-l-15" :text="currentHint"/>
				<ListPicker width="40%" selectedIndex="4" :items="items" v-model="selectedItemIndex" @selectedIndexChange="selectedIndexChanged"/>
			</FlexboxLayout>
			<StackLayout horizontalAlignment="left" orientation="horizontal">
				<Label textAlignment="center" width="40%" class="h1 m-l-15" color="#CCC" verticalAlignment="center" :text="sleepHours"></Label>
				<ListPicker :items="timeItems" @selectedIndexChange="sleepValueChangeStart" selectedIndex="46"
							class="m-x-10"/>
				<ListPicker :items="timeItems" @selectedIndexChange="sleepValueChangeEnd" selectedIndex="18"
							class="m-x-10"/>
			</StackLayout>
			<!--<Image src.decode="font://&#xf017;" tintColor="#CCC" class="far m-x-30" width="32"></Image>-->
			<!--<Slider width="80%" value="8" minValue="0" maxValue="24" @valueChange="sleepValueChange($event)"></Slider>-->
			<StackLayout class="hint" orientation="horizontal">
				<Label width="80%" class="text-left p-l-30" verticalAlignment="center" text="Fühlst du dich gereizt?"/>
				<Switch :checked="isIrritable" @checkedChange="isIrritable = $event.value"></Switch>
			</StackLayout>
			<Button text="ok" :isEnabled="savingEnabled" @tap="onTap" class="-outline -rounded-lg"></Button>
        </FlexboxLayout>
		</template>
		<template v-else>
			<FlexboxLayout flexDirection="column" justifyContent="space-between">
				<Label text="Alles erledigt für heute :)"
					   class="h2 w-100 text-center m-t-30 p-t-30"></Label>
				<Button text="reset" @tap="onTapReset"
						class="m-t-30 -outline -rounded-lg"></Button>
			</FlexboxLayout>
		</template>
	</Page>
</template>
<script>
	import * as dialogs from "tns-core-modules/ui/dialogs";
	import * as appSettings from "tns-core-modules/application-settings";
	import LifeChartService from "../LifeChart.service";
	import VibratorService from "../Vibrator.service";

	const LifeChart = new LifeChartService();
	const Vibrator = new VibratorService();

	export default {
		data   : () => {
			return {
				savingEnabled       : true,
				isIrritable         : false,
				questionDoneForToday: false,
				dateToday			: '',
				currentDate			: null,
				dayToday            : new Date().getDay() + '',
				selectedItemIndex   : 0,
				sleepHours          : 0,
				sleepStart          : 0,
				sleepEnd            : 0,
				currentHint         : '',
				items               : null,
				timeItems           : null
			};
		},
		methods: {
			onTapDayForward() {
				this.setDateToday(1);
			},
			onTapDayBackward() {
				this.setDateToday(-1);
			},
			sleepValueChangeStart(event) {
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
				yesterday.setDate(today.getDate() - 1)
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
				this.dateToday = (dd + '.' + mm + '.' + yyyy);
			},
			onPageLoaded() {
				this.setDateToday();
				this.items = LifeChart.getMoodItems();
				this.timeItems = LifeChart.getTimeItems();

				this.selectedItemIndex = 4;
				this.currentHint = this.items[this.selectedItemIndex].hint;

				this.sleepStart = this.timeItems[46];
				this.sleepEnd = this.timeItems[18];
				let storeDateString = appSettings.getString('lastLifeChartDay');
				this.questionDoneForToday = (storeDateString === this.dayToday);
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
				this.isIrritable = false;
				this.savingEnabled = true;
				this.sleepHours = 0;
			},
			onTap() {
		    	this.savingEnabled = false;
		    	this.questionDoneForToday = true;
				appSettings.setString('lastLifeChartDay', this.dayToday);

				let promise = LifeChart.save(
						{
							type      : 'lifechart',
							mood      : this.items[this.selectedItemIndex].name,
							irritable : this.isIrritable,
							sleepHours: this.sleepHours,
							date: this.dateToday,
							timestamp : java.lang.System.currentTimeMillis()
						}
				);

				promise.then((result) => {
					let message = 'date: ' + this.dateToday + "\n" +
								  'mood: ' + this.items[this.selectedItemIndex].name + "\n" +
								  'sleep: ' + this.sleepHours + "\n" +
								  'irritable: ' + this.isIrritable;
					Vibrator.vibrate(100);
					dialogs.alert({
									  title       : "Thanks!",
									  message     : message,
									  okButtonText: "cool"
								  });
				}, (error) => {
					console.error("error");
					dialogs.alert({
									  title       : "",
									  message     : "an error occured:" + error,
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
