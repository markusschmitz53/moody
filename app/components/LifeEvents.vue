<template>
	<Page @load="onPageLoaded" @shownModally="onShownModally">
		<AbsoluteLayout orientation="vertical" backgroundColor="white">
			<DockLayout left="0" top="0" stretchLastChild="false" height="48" width="100%">
				<Button dock="right" class="far btn negativeMargin h2" width="64" color="#444" text.decode="&#xf14a;" @tap="onTapDone"></Button>
			</DockLayout>
			<ScrollView left="0" top="45" height="70%" width="100%" id="scrollview" orientation="vertical">
				<StackLayout>
					<template v-if="isLoading || !minimumLoadingTimeDone">
						<Image src="res://ai" class="m-t-30 m-b-10 loadingImage" stretch="aspectFill"></Image>
					</template>
					<template v-if="!isLoading && minimumLoadingTimeDone && noRecords">
						<Label class="m-t-30 m-b-10 text-center hint" color="#CCC">Keine Ereignisse</Label>
					</template>
					<template v-if="!isLoading && minimumLoadingTimeDone">
						<RadListView height="100%" ref="listView"
									 :items="records"
									 @itemTap="onItemTap">
							<v-template>
								<StackLayout orientation="horizontal">
									<Label :text="item.text" :id="item.valueFieldId" width="60%"
										   class="m-l-25 m-t-20 h3"></Label>
									<Button :id="item.buttonId" text="x" class="btn btn-secondary btn-sm h2"
											@tap="onTapRemoveRecord" color="#CCC"></Button>
								</StackLayout>
							</v-template>
						</RadListView>
					</template>
					<TextField class="m-x-30 m-t-30 m-b-15" hint="Lebensereignis" :text='currentText'
							   returnKeyType="done"
							   @returnPress="onReturnPress($event)">
					</TextField>
				</StackLayout>
			</ScrollView>
		</AbsoluteLayout>
	</Page>
</template>

<script>
	import { Label } from 'tns-core-modules/ui/label';
	import { Button } from 'tns-core-modules/ui/button';
	import { StackLayout } from 'tns-core-modules/ui/layouts/stack-layout';
	import * as dialogs from 'tns-core-modules/ui/dialogs';
	import LifeChartService from '~/LifeChart.service';
	import { ObservableArray } from 'tns-core-modules/data/observable-array';

	const LifeChart = new LifeChartService();

    export default {
  		props: ['dateTodayDb'],
		data: () => {
			return {
				records               : new ObservableArray([]),
				recordCount           : 0,
				currentText           : '',
				isLoading             : false,
				minimumLoadingTimeDone: false,
				noRecords             : true,
				itemList              : []
			}
		},
		methods: {
			onPageLoaded(event) {
			},
			onShownModally(event) {
				this.page = event.object.page;
				this.isLoading = true;
				this.minimumLoadingTimeDone = false;
				setTimeout(() => {
					this.minimumLoadingTimeDone = true;
				}, 750);
				LifeChart.getLifeEvents(this.dateTodayDb, this.onQueryEvent);
			},
			onQueryEvent(result) {
				this.isLoading = false;
				if (!result.error) {
					let records = result.children;

					if (records && records.length) {
						this.noRecords = false;
						for (let i = 0; i < records.length; i++) {
							++this.recordCount;
							this.records.push({
												   text        : records[i].event,
												   key         : records[i].key,
												   valueFieldId: 'value-' + this.recordCount,
												   buttonId    : this.recordCount
											   });
						}
					}
				}
				else {
					console.error(result.error);
				}
			},
			onTapDone(event) {
				event.object.page.closeModal();
			},
			onTapRemoveRecord(event) {
				let page = event.object.page,
						id = event.object.id,
						selectedRecord = event.object.bindingContext,
						item,
						recordArrayLengthBeforeChange = this.records.length;

				if (!page.getViewById('value-' + id)) {
					throw new Error("Couldn't find value field");
				}

				item = page.getViewById('value-' + id).text;

				let promise = LifeChart.removeLifeEvent(selectedRecord.key);
				promise.then((result) => {
					this.records.splice(this.records.indexOf(selectedRecord), 1);
					if (recordArrayLengthBeforeChange === this.records.length) {
						dialogs.alert({
										  title       : "",
										  message     : "uh, da stimmt was nich",
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
			onReturnPress(event) {
				let text = event.object.text;

				this.currentText = '';
				event.object.text = '';

				let promise = LifeChart.saveLifeEvent({
																event: text,
																date   : this.dateTodayDb
															});

				promise.then((result) => {
					this.noRecords = false;
					++this.recordCount;
					this.records.push({
										   text        : text,
										   key         : result.key,
										   valueFieldId: 'value-' + this.recordCount,
										   buttonId    : this.recordCount
									   });
				}, (error) => {
					dialogs.alert({
									  title       : "Fehler!",
									  message     : "hat nicht geklappt",
									  okButtonText: "shitte"
								  });
				});
			}
		}
	}
</script>

<style scoped lang="scss">
	// Start custom common variables
	@import "~@nativescript/theme/scss/variables/blue";
	// End custom common variables

	.loadingImage {
		height: 32;
		width: 32;

		animation-name: rotate;
		animation-duration: 1s;
		animation-iteration-count: infinite;
		animation-timing-function: ease-in-out;
		animation-fill-mode: backwards;
	}

	@keyframes rotate {
		0% {
			transform: scale(1.0);
		}
		50% {
			transform: scale(0.85);
		}
		100% {
			transform: scale(1.0);
		}
	}

	.btn {
		z-index: 0;
	}

	.negativeMargin {
		margin-right: -15px;
		margin-top: -5px;
	}
</style>
