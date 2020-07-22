<template>
	<Page marginBottom="2%" actionBarHidden="true" @navigatingTo="onPageLoaded">
		<template v-if="!questionDoneForToday">
		<FlexboxLayout flexDirection="column" class="m-t-15" justifyContent="space-between">
			<FlexboxLayout height="50%" class="scrollview m-t-15">
				<template v-if="isLoading || !minimumLoadingTimeDone">
					<StackLayout width="100%" height="100%" verticalAlignment="center" horizontalAlignment="center">
						<Image src="res://ai" class="m-t-30 m-b-10 loadingImage" stretch="aspectFill"></Image>
					</StackLayout>
				</template>
				<template v-else>
					<template v-if="noRecords">
						<StackLayout width="100%" height="100%" verticalAlignment="center" horizontalAlignment="center">
							<Label class="m-t-30 m-b-10 text-center hint" color="#CCC">Wie schwer fielen dir Aktivitäten?</Label>
						</StackLayout>
					</template>
					<template v-else>
						<RadListView height="100%" class="m-t-10" ref="listView"
									 :items="records">
							<v-template>
								<StackLayout class="list-item" horizontalAlignment="center" orientation="horizontal">
									<Label :text="item.label" width="80%" class="m-l-20 m-t-10 h3"></Label>
									<Button text.decode="&#xf056;" class="m-l-10 m-r-20 fas list-item-button"
											@tap="onTapRemoveRecord" color="#CCC"></Button>
								</StackLayout>
							</v-template>
						</RadListView>
					</template>
				</template>
			</FlexboxLayout>
			<FlexboxLayout flexDirection="row" justifyContent="flex-start" alignItems="center">
				<Label textWrap="true" color="#CCC" textAlignment="center" width="40%" class="hint p-x-15 m-l-15" :text="currentHint"/>
				<ListPicker width="40%" selectedIndex="4" :items="items" v-model="selectedItemIndex" @selectedIndexChange="selectedIndexChanged"/>
			</FlexboxLayout>
			<FlexboxLayout flexDirection="row" justifyContent="center" alignItems="center">
				<Button class="far -rounded-lg reduced-margin fontsize" width="10" color="#444"
						text.decode="&#xf14a;" @tap="onTapBack"></Button>
				<Button width="70%" text="hinzufügen" :isEnabled="savingEnabled" @tap="onTapDone"
						class="-primary -rounded-lg reduced-margin"></Button>
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
				this.items = LifeChart.getImpairmentItems();
				this.isLoading = true;
				this.minimumLoadingTimeDone = false;
				setTimeout(() => {
					this.minimumLoadingTimeDone = true;
				}, 750);

				this.selectedItemIndex = 4;
				this.currentHint = this.items[this.selectedItemIndex].hint;
				this.setRecords(LifeChart.getFunctionalImpairmentsForDay(this.dateTodayDb));
			},
			setRecords(_records) {
				this.noRecords = true;
				this.records = [];

				this.isLoading = false;

				if (_records && _records.length) {
					this.noRecords = false;
					for (let i = 0; i < _records.length; i++) {
						let record = _records[i];
						console.log(LifeChart.getImpairmentLabelForValue(record.impairment));
						console.log(record.impairment);
						this.records.push({
											  impairment: record.impairment,
											  label     : LifeChart.getImpairmentLabelForValue(record.impairment),
											  id        : record.id
										  });
					}
				}
			},
			onTapRemoveRecord(event) {
				let selectedRecord = event.object.bindingContext;

				if (LifeChart.removeFunctionalImpairment(selectedRecord.id)) {
					this.setRecords(LifeChart.getFunctionalImpairmentsForDay(this.dateTodayDb));
				}
				else {
					dialogs.alert({
									  title       : "Fehler!",
									  message     : "hat nicht geklappt",
									  okButtonText: "shitte"
								  });
				}
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
				LifeChart.saveFunctionalImpairment(
						{
							impairment: this.items[this.selectedItemIndex].value,
							date      : this.dateTodayDb,
							time      : this.currentHourAndMinute
						}
				);

				Vibrator.vibrate(75);
				this.$navigateBack({
									   frame: 'main'
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
		margin-right: 5;
		margin-left: 5;
	}

	.list-item {
		margin: 5 20;
		padding: 0;
		height: 50%;
		background-color: #FAFAFA;
	}

	.list-item-button {
		margin: 0;
		padding: 0;
		z-index: 0;
		width: 50;
		color: #CCC;
		background-color: transparent;
	}

	.scrollview {
		padding-top: 5;
		padding-bottom: 5;
		border-bottom-width: 1;
		border-color: #FAFAFA;
	}


	.fontsize {
		font-size: 20;
	}
</style>
