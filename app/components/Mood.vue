<template>
	<Page marginBottom="2%" actionBarHidden="true" @navigatingTo="onPageLoaded">
		<template v-if="!questionDoneForToday">
		<FlexboxLayout flexDirection="column" class="m-t-15" justifyContent="space-between">
			<FlexboxLayout height="50%">
				<template v-if="isLoading || !minimumLoadingTimeDone">
					<StackLayout width="100%" height="100%" verticalAlignment="center" horizontalAlignment="center">
						<Image src="res://ai" class="m-t-30 m-b-10 loadingImage" stretch="aspectFill"></Image>
					</StackLayout>
				</template>
				<template v-else>
					<RadListView height="100%" class="m-t-10" ref="listView"
								 :items="records">
						<v-template>
							<StackLayout orientation="horizontal">
								<Label :text="item.impairment" width="60%" class="m-l-25 m-t-20 h3"></Label>
								<Button text="x" class="btn btn-secondary btn-sm h2"
										@tap="onTapRemoveRecord" color="#CCC"></Button>
							</StackLayout>
						</v-template>
					</RadListView>
				</template>
			</FlexboxLayout>
			<FlexboxLayout flexDirection="row" justifyContent="flex-start" alignItems="center">
				<Label textWrap="true" color="#CCC" textAlignment="center" width="40%" class="hint p-x-15 m-l-15" :text="currentHint"/>
				<ListPicker width="40%" selectedIndex="4" :items="items" v-model="selectedItemIndex" @selectedIndexChange="selectedIndexChanged"/>
			</FlexboxLayout>
			<FlexboxLayout class="m-x-10" flexDirection="row" justifyContent="space-around" alignItems="center">
				<StackLayout orientation="horizontal">
					<Button text="abbrechen" @tap="onTapBack" class="-outline -rounded-lg reduced-margin"></Button>
					<Button width="70%" text="hinzufügen" :isEnabled="savingEnabled" @tap="onTapDone"
							class="-primary -rounded-lg reduced-margin"></Button>
				</StackLayout>
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
	import { ObservableArray } from 'tns-core-modules/data/observable-array';

	const LifeChart = new LifeChartService();
	const Vibrator = new VibratorService();

	export default {
		props: ["dateToday", "dateTodayDb", "currentHourAndMinute"],
		data : () => {
			return {
				savingEnabled          : true,
				isLoading              : false,
				minimumLoadingTimeDone : false,
				noRecords              : true,
				questionDoneForToday   : false,
				currentDate            : null,
				selectedItemIndex      : 0,
				sleepHours             : 0,
				sleepStart             : 0,
				sleepEnd               : 0,
				sleepStartedSameDay    : false,
				sleepStartSelectedIndex: 46,
				currentHint            : '',
				items                  : [],
				timeItems              : null,
				records                : new ObservableArray([])
			};
		},
		methods: {
			onPageLoaded() {
				this.items = LifeChart.getMoodItems();
				this.isLoading = true;
				this.minimumLoadingTimeDone = false;
				setTimeout(() => {
					this.minimumLoadingTimeDone = true;
				}, 750);

				this.selectedItemIndex = 4;
				this.currentHint = this.items[this.selectedItemIndex].hint;
				LifeChart.getFunctionalImpairmentsForDay(this.dateTodayDb, this.onRecordsLoaded);
			},
			onRecordsLoaded(result) {
				this.isLoading = false;
				if (!result.error) {
					let records = result.children;

					if (records && records.length) {
						this.noSymptoms = false;
						for (let i = 0; i < records.length; i++) {
							this.records.unshift({
												  impairment: records[i].impairment,
												  key       : records[i].key
											  });
						}
					}
				}
			},
			onTapRemoveRecord(event) {
				let selectedRecord = event.object.bindingContext,
						recordArrayLengthBeforeChange = this.records.length;

				let promise = LifeChart.removeFunctionalImpairment(selectedRecord.key);
				promise.then(() => {
					this.records.splice(this.records.indexOf(selectedRecord), 1);
					if (recordArrayLengthBeforeChange === this.records.length) {
						dialogs.alert({
										  title       : "",
										  message     : "da ist was schief gegangen",
										  okButtonText: "oopsie"
									  });
						return;
					}
					this.noRecords = (this.records.length === 0);
				}, (error) => {
					dialogs.alert({
									  title       : "Fehler!",
									  message     : "hat nicht geklappt",
									  okButtonText: "shitte"
								  });
				});
			},
			selectedIndexChanged() {
				if (this.items[this.selectedItemIndex]) {
					this.currentHint = this.items[this.selectedItemIndex].hint;
				}
			},
			onTapReset() {
				this.selectedItemIndex = 4;
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
							date      : this.dateTodayDb,
							time      : this.currentHourAndMinute
						}
				);

				promise.then((result) => {
					let message = 'Datum: ' + this.dateToday + "\n" +
								  'Einschränkung: ' + this.items[this.selectedItemIndex].name;
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

	.reduced-margin {
		margin-right: 10px;
		margin-left: 10px;
	}
</style>
