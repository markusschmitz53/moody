<template>
  <Page width="100%" actionBarHidden="true" @shownModally="onShownModally">
    <FlexboxLayout flexDirection="column" class="m-b-15" justifyContent="space-between">
      <StackLayout orientation="vertical">
        <DockLayout stretchLastChild="false" height="48" width="100%">
          <Button dock="left" class="far transparent-bg button-z-index h2" margin="0" width="64" color="#CCC"
                  text.decode="&#xf059;" @tap="showExplanation"></Button>
          <Button dock="right" class="far transparent-bg button-z-index h2" margin="0" width="64" color="#444"
                  text.decode="&#xf057;" @tap="onTapClose"></Button>
        </DockLayout>
      </StackLayout>
      <FlexboxLayout height="35%" class="scrollview m-t-15">
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
        <Label textWrap="true" color="#CCC" textAlignment="center" width="40%" class="hint p-x-15 m-l-15"
               :text="currentHint"/>
        <ListPicker width="40%" selectedIndex="4" :items="items" v-model="selectedItemIndex"
                    @selectedIndexChange="selectedIndexChanged"/>
      </FlexboxLayout>
      <FlexboxLayout flexDirection="row" justifyContent="center" alignItems="center">
        <Button width="70%" text="hinzufügen" :isEnabled="savingEnabled" @tap="onTapDone"
                class="-primary -rounded-lg reduced-margin"></Button>
      </FlexboxLayout>
    </FlexboxLayout>
  </Page>
</template>
<script>
	import * as dialogs from "tns-core-modules/ui/dialogs";
	import VibratorService from "../Vibrator.service";
	import {ObservableArray} from 'tns-core-modules/data/observable-array';
  import FunctionalImpairment from '~/components/hints/FunctionalImpairment';

  const LifeChartService = require('../LifeChart.service');
	const LifeChart = LifeChartService.getInstance();
	const Vibrator = new VibratorService();

	export default {
		props: ["dateToday", "dateTodayDb", "currentHourAndMinute"],
		data : () => {
			return {
				savingEnabled          : true,
				isLoading              : false,
				minimumLoadingTimeDone : false,
				noRecords              : true,
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
			onShownModally() {
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
						this.records.push({
											  impairment: record.impairment,
											  label     : LifeChart.getImpairmentLabelForValue(record.impairment),
											  id        : record.id
										  });
					}
				}
			},
			onTapRemoveRecord(_event) {
				let selectedRecord = _event.object.bindingContext;

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
      showExplanation() {
				this.$showModal(FunctionalImpairment, {
					animated  : true
				});
			},
			onTapReset() {
				this.selectedItemIndex = 4;
			},
			onTapClose() {
		  	this.$modal.close();
			},
			onTapDone() {
				let record = {
					impairment: this.items[this.selectedItemIndex].value,
					date      : this.dateTodayDb,
					time      : this.currentHourAndMinute
				};

				record.id = LifeChart.saveFunctionalImpairment(record);
				record.label = LifeChart.getImpairmentLabelForValue(record.impairment);

				this.noRecords = false;
				this.records.unshift(record);

				Vibrator.vibrate(75);
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
