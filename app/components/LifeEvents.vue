<template>
	<Page @load="onPageLoaded" @shownModally="onShownModally">
		<StackLayout backgroundColor="#FFFFFF" orientation="vertical">
			<StackLayout orientation="vertical">
				<DockLayout stretchLastChild="false" height="48" width="100%">
					<Button dock="right" class="far btn h2" margin="0" width="64" color="#444"
							text.decode="&#xf14a;" @tap="onTapDone"></Button>
				</DockLayout>
				<ScrollView class="scrollview" id="scrollview" orientation="vertical">
					<StackLayout margin="2">
						<template v-if="isLoading || !minimumLoadingTimeDone">
							<Image src="res://ai" class="m-t-30 m-b-10 loadingImage" stretch="aspectFill"></Image>
						</template>
						<template v-if="!isLoading && minimumLoadingTimeDone && noRecords">
							<Label class="m-t-30 m-b-10 text-center hint" color="#CCC">Was ist passiert?</Label>
						</template>
						<template v-if="!isLoading && minimumLoadingTimeDone">
							<RadListView class="listview" ref="listView" :items="records" @itemTap="onItemTap">
								<v-template>
									<StackLayout class="list-item" horizontalAlignment="center" orientation="horizontal">
										<Label :text="item.text" :id="item.valueFieldId" width="80%"
											   class="m-l-20 m-t-10 h3"></Label>
										<Button :id="item.buttonId" text.decode="&#xf056;" class="m-l-10 m-r-20 fas list-item-button"
												@tap="onTapRemoveRecord"></Button>
									</StackLayout>
								</v-template>
							</RadListView>
						</template>
					</StackLayout>
				</ScrollView>
			</StackLayout>
			<TextField class="m-x-30 m-b-15" height="35" hint="Lebensereignis" :text='currentText'
					   returnKeyType="done" @returnPress="onReturnPress($event)">
			</TextField>
		</StackLayout>
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
				this.setRecords(LifeChart.getLifeEvents(this.dateTodayDb));
			},
			setRecords(_records) {
				this.isLoading = false;
				if (_records && _records.length) {
					this.noRecords = false;
					for (let i = 0; i < _records.length; i++) {
						++this.recordCount;
						let record = _records[i];
						this.records.unshift({
												 text        : record.event,
												 id          : record.id,
												 valueFieldId: 'value-' + this.recordCount,
												 buttonId    : this.recordCount
											 });
					}
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

				if (LifeChart.removeLifeEvent(selectedRecord.id)) {
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
				}
				else {
					dialogs.alert({
									  title       : "Fehler!",
									  message     : "hat nicht geklappt",
									  okButtonText: "shitte"
								  });
				}
			},
			onReturnPress(event) {
				let text = event.object.text;

				if (!text || text === '') {
					return;
				}

				this.currentText = '';
				event.object.text = '';

				let documentId = LifeChart.saveLifeEvent({
															 event: text,
															 date : this.dateTodayDb
														 });

				this.noRecords = false;
				++this.recordCount;

				this.records.unshift({
										 text        : text,
										 id          : documentId,
										 valueFieldId: 'value-' + this.recordCount,
										 buttonId    : this.recordCount
									 });
			}
		}
	}
</script>

<style scoped lang="scss">
	// Start custom common variables
	@import "~@nativescript/theme/scss/variables/blue";
	// End custom common variables

	.btn {
		z-index: 0;
		background-color: transparent;
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

	.listview {
		padding-top: 10;
		padding-bottom: 10;
	}

	.scrollview {
		border-top-width: 1;
		border-bottom-width: 1;
		border-color: #FAFAFA;
		width: 100%;
		height: 230;
	}
</style>
