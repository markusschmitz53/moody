<template>
	<Page marginBottom="2%" actionBarHidden="true" @loaded="onPageLoaded" @navigatingTo="onPageLoaded">
		<template v-if="!questionDoneForToday">
		<FlexboxLayout flexDirection="column" class="m-t-15" justifyContent="space-between">
			<FlexboxLayout height="25%"></FlexboxLayout>
			<FlexboxLayout flexDirection="row" justifyContent="flex-start" alignItems="center">
				<Label textWrap="true" color="#CCC" textAlignment="center" width="40%" class="hint p-x-15 m-l-15" :text="currentHint"/>
				<ListPicker width="40%" selectedIndex="4" :items="items" v-model="selectedItemIndex" @selectedIndexChange="selectedIndexChanged"/>
			</FlexboxLayout>
			<FlexboxLayout class="m-b-20" flexDirection="row" justifyContent="space-around" alignItems="center">
				<StackLayout class="m-l-20" orientation="horizontal" width="30%">
					<Image src.decode="font://&#xf556;" :tintColor="isDysphoricTintColor" class="far m-x-5" width="32"></Image>
					<Switch :checked="isDysphoric" @checkedChange="onIsDysphoricChange"></Switch>
				</StackLayout>
				<Button text="abbrechen" @tap="onTapBack" class="-outline -rounded-lg"></Button>
				<Button text="fertig" :isEnabled="savingEnabled" @tap="onTapDone" class="-primary -rounded-lg"></Button>
			</FlexboxLayout>
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
    	props: ["dateToday", "dateTodayDb", "currentHourAndMinute"],
		data   : () => {
			return {
				savingEnabled          : true,
				isDysphoric            : false,
				questionDoneForToday   : false,
				currentDate            : null,
				isDysphoricTintColor   : '#CCCCCC',
				selectedItemIndex      : 0,
				sleepHours             : 0,
				sleepStart             : 0,
				sleepEnd               : 0,
				sleepStartedSameDay    : false,
				sleepStartSelectedIndex: 46,
				currentHint            : '',
				items                  : [],
				timeItems              : null
			};
		},
		methods: {
			onIsDysphoricChange(event) {
				this.isDysphoric = event.value;
				this.isDysphoricTintColor = this.isDysphoric ? '#FF0000' : '#CCC';
			},
			onPageLoaded() {
				this.items = LifeChart.getMoodItems();

				this.selectedItemIndex = 4;
				this.currentHint = this.items[this.selectedItemIndex].hint;
			},
			selectedIndexChanged() {
				if (this.items[this.selectedItemIndex]) {
					this.currentHint = this.items[this.selectedItemIndex].hint;
				}
			},
			onTapReset() {
				this.selectedItemIndex = 4;
				this.isDysphoric = false;
			},
			onTapBack() {
				this.$navigateBack({
									   frame: 'main'
								   });
			},
			onTapDone() {
				let promise = LifeChart.saveFunctionalImpairment(
						{
							impairment: this.items[this.selectedItemIndex].name,
							dysphoric : this.isDysphoric,
							date      : this.dateTodayDb,
							time      : this.currentHourAndMinute
						}
				);

				promise.then((result) => {
					let message = 'Datum: ' + this.dateToday + "\n" +
								  'Einschränkung: ' + this.items[this.selectedItemIndex].name + "\n" +
								  'Dysphorisch/Gereizt: ' + this.isDysphoric;
					Vibrator.vibrate(75);
					dialogs.alert({
									  title       : "",
									  message     : message,
									  okButtonText: "cool"
								  });
					this.$navigateBack({
										   frame: 'main'
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
