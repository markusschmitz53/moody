<template>
	<Page marginBottom="2%" @loaded="onPageLoaded" @navigatingTo="onPageLoaded">
		<ActionBar>
			<Label :visibility="!questionDoneForToday ? 'visible' : 'collapse'" text="Wie fühlst du dich heute?"></Label>
			<Label :visibility="questionDoneForToday ? 'visible' : 'collapse'" text="Danke :)"></Label>
		</ActionBar>

		<FlexboxLayout flexDirection="column" justifyContent="space-between">
			<ListPicker :visibility="!questionDoneForToday ? 'visible' : 'collapse'" selectedIndex="4" :items="items" v-model="selectedItemIndex"
						@selectedIndexChange="selectedIndexChanged"/>
			<Label :visibility="!questionDoneForToday ? 'visible' : 'collapse'" class="hint text-muted" :text="currentHint"/>
			<StackLayout :visibility="!questionDoneForToday ? 'visible' : 'collapse'" orientation="horizontal">
				<Slider width="80%" value="8" minValue="0" maxValue="24" @valueChange="sleepValueChange($event)"></Slider>
				<Label verticalAlignment="center" :text="sleepHours"/>
			</StackLayout>
			<StackLayout :visibility="!questionDoneForToday ? 'visible' : 'collapse'" class="hint" orientation="horizontal">
				<Label width="80%" class="text-left p-l-30" verticalAlignment="center" text="Fühlst du dich gereizt?"/>
				<Switch :checked="isIrritable" @checkedChange="isIrritable = $event.value"></Switch>
			</StackLayout>
			<Button :visibility="!questionDoneForToday ? 'visible' : 'collapse'" text="ok" :isEnabled="savingEnabled" @tap="onTap" class="-outline -rounded-lg"></Button>
			<Button :visibility="questionDoneForToday ? 'visible' : 'collapse'" text="reset" @tap="onTapReset" class="m-t-30 -outline -rounded-lg"></Button>
        </FlexboxLayout>
	</Page>
</template>

<script>
	import * as firebase from"nativescript-plugin-firebase";
	import * as dialogs from "tns-core-modules/ui/dialogs";
	import * as appSettings from "tns-core-modules/application-settings";

	export default {
		data   : () => {
			return {
				savingEnabled       : true,
				isIrritable         : false,
				questionDoneForToday: false,
				dayToday            : new Date().getDay() + '',
				selectedItemIndex   : 0,
				sleepHours          : 0,
				currentHint         : '',
				items               : [
					{
						value   : 4,
						name    : 'manie_4',
						hint    : 'unfähig irgendetwas zu tun oder hospitalisiert',
						toString: () => {
							return 'Manie: schwer';
						}
					},
					{
						value   : 3,
						name    : 'manie_3',
						hint    : 'große Schwierigkeiten mit zielgerichteten Aktivitäten',
						toString: () => {
							return 'Manie: deutlich';
						}
					},
					{
						value   : 2,
						name    : 'manie_2',
						hint    : 'einige Schwierigkeiten mit zielgerichteten Aktivitäten',
						toString: () => {
							return 'Manie: mäßig';
						}
					},
					{
						value   : 1,
						name    : 'manie_1',
						hint    : 'mehr energiegeladen & produktiv keine/geringe Beeinträchtigung',
						toString: () => {
							return 'Manie: leicht';
						}
					},
					{
						value   : 0,
						name    : 'neutral',
						hint    : '',
						toString: () => {
							return 'Neutral';
						}
					},
					{
						value   : -1,
						name    : 'depression_1',
						hint    : 'kann alles mühelos oder beinahe mühelos tun',
						toString: () => {
							return 'Depression: leicht';
						}
					},
					{
						value   : -2,
						name    : 'depression_2',
						hint    : 'kann alles nur mit einiger Mühe tun',
						toString: () => {
							return 'Depression: mäßig';
						}
					},
					{
						value   : -3,
						name    : 'depression_3',
						hint    : 'kann alles nur mit großer Mühe tun',
						toString: () => {
							return 'Depression: deutlich';
						}
					},
					{
						value   : -4,
						name    : 'depression_4',
						hint    : 'unfähig irgendwas zu tun oder hospitalisiert',
						toString: () => {
							return 'Depression: schwer';
						}
					}
				]

			};
		},
		methods: {
			sleepValueChange(event) {
				this.sleepHours = event.value;
			},
			onPageLoaded() {
				let storeDateString = appSettings.getString('lastLifeChartDay');
				this.questionDoneForToday = (storeDateString === this.dayToday);
				if (this.questionDoneForToday) {

				} else {

				}
				this.selectedItemIndex = 4;
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
			},
			onTap() {
		    	this.savingEnabled = false;
		    	this.questionDoneForToday = true;
				appSettings.setString('lastLifeChartDay', this.dayToday);

				firebase.push(
						'/events/lifechart',
						{
							type           : 'lifechart',
							mood           : this.items[this.selectedItemIndex].name,
							irritable      : this.isIrritable,
							sleepHours     : this.sleepHours,
							timestamp      : java.lang.System.currentTimeMillis(),
							serverTimestamp: firebase.ServerValue.TIMESTAMP
						}
				).then(
						(result) => {
							let message = 'mood: ' + this.items[this.selectedItemIndex].name + "\n" +
										  'sleep: ' + this.sleepHours + "\n" +
										  'irritable: ' + this.isIrritable;

							dialogs.alert({
											  title       : "Thanks!",
											  message     : message,
											  okButtonText: "cool"
										  });
						},
						(error) => {
							console.error("error");
							dialogs.alert({
											  title       : "",
											  message     : "an error occured:" + error,
											  okButtonText: "oh no :("
										  });
						}
				);
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
