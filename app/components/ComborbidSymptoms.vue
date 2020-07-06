<template>
	<Page @load="onPageLoaded" @shownModally="onShownModally">
		<AbsoluteLayout orientation="vertical" backgroundColor="white">
			<DockLayout left="0" top="0" stretchLastChild="false" height="48" width="100%">
				<Button dock="right" class="far btn negativeMargin h2" width="64" color="#444" text.decode="&#xf14a;" @tap="onTapDone"></Button>
			</DockLayout>
			<ScrollView left="0" top="45" height="70%" width="100%" id="scrollview" orientation="vertical">
				<StackLayout>
					<template v-if="isLoading">
						<Image src="res://ai" class="m-t-30 m-b-10 loadingImage" stretch="aspectFill"></Image>
					</template>
					<template v-if="!isLoading && noSymptoms">
						<Label class="m-t-30 m-b-10 text-center hint" color="#CCC">Keine Symptome</Label>
					</template>
					<RadListView height="100%" ref="listView"
								 :items="symptoms"
								 @itemTap="onItemTap">
						<v-template>
							<StackLayout orientation="horizontal">
								<Label :text="item.text" :id="item.valueFieldId" width="60%"
									   class="m-l-25 m-t-20 h3"></Label>
								<Button :id="item.buttonId" text="x" class="btn btn-secondary btn-sm h2"
										@tap="onTapRemoveSymptom" color="#CCC"></Button>
							</StackLayout>
						</v-template>
					</RadListView>
					<TextField class="m-x-30 m-t-30 m-b-15" hint="Komorbides Symptom" :text='currentSymptomText'
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
				symptoms: new ObservableArray([]),
				symptomCount: 0,
				currentSymptomText: '',
				isLoading: false,
				noSymptoms: true,
				itemList: []
			}
		},
		methods: {
			onPageLoaded(event) {
			},
			onShownModally(event) {
				this.page = event.object.page;
				this.isLoading = true;
				LifeChart.getComborbidSymptoms(this.dateTodayDb, this.onComborbidSymptomQueryEvent);
			},
			onComborbidSymptomQueryEvent(result) {
				this.isLoading = false;
				if (!result.error) {
					let records = result.children;

					if (records && records.length) {
						this.noSymptoms = false;
						for (let i = 0; i < records.length; i++) {
							++this.symptomCount;
							this.symptoms.push({
												   text        : records[i].symptom,
												   key         : records[i].key,
												   valueFieldId: 'value-' + this.symptomCount,
												   buttonId    : this.symptomCount
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
			onTapRemoveSymptom(event) {
				let selectedRecord = event.object.bindingContext,
						symptomArrayLengthBeforeChange = this.symptoms.length;

				let promise = LifeChart.removeComorbidSymptom(selectedRecord.key);
				promise.then((result) => {
					this.symptoms.splice(this.symptoms.indexOf(selectedRecord), 1);
					if (symptomArrayLengthBeforeChange === this.symptoms.length) {
						dialogs.alert({
										  title       : "",
										  message     : "Symptom konnte nicht entfernt werden",
										  okButtonText: "oopsie"
									  });
						return;
					}
					this.noSymptoms = (this.symptoms.length === 0);
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

				this.currentSymptomText = '';
				event.object.text = '';

				let promise = LifeChart.saveComorbidSymptom({
																symptom: text,
																date   : this.dateTodayDb
															});

				promise.then((result) => {
					this.noSymptoms = false;
					++this.symptomCount;
					this.symptoms.push({
										   text        : text,
										   key         : result.key,
										   valueFieldId: 'value-' + this.symptomCount,
										   buttonId    : this.symptomCount
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

	.btn {
		z-index: 0;
	}

	.negativeMargin {
		margin-right: -15px;
		margin-top: -5px;
	}
</style>
