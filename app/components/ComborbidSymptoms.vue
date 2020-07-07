<template>
	<Page @shownModally="onShownModally">
		<StackLayout backgroundColor="#FFFFFF" orientation="vertical">
			<StackLayout orientation="vertical">
				<DockLayout stretchLastChild="false" height="48" width="100%">
					<Button dock="left" class="far btn h2" margin="0" width="64" color="#CCC"
							text.decode="&#xf059;" @tap="showExplanation"></Button>
					<Button dock="right" class="far btn h2" margin="0" width="64" color="#444"
							text.decode="&#xf14a;" @tap="onTapDone"></Button>
				</DockLayout>
				<ScrollView class="scrollview" id="scrollview" orientation="vertical">
					<StackLayout margin="2">
						<template v-if="isLoading || !minimumLoadingTimeDone">
							<Image src="res://ai" class="m-t-30 m-b-10 loadingImage" stretch="aspectFill"></Image>
						</template>
						<template v-if="!isLoading && minimumLoadingTimeDone && noSymptoms">
							<Label class="m-t-30 text-center hint" color="#CCC">Welches Symptom hattest du?</Label>
						</template>
						<template v-if="!isLoading && minimumLoadingTimeDone">
							<RadListView class="listview" ref="listView" :items="symptoms" @itemTap="onItemTap">
								<v-template>
									<StackLayout class="list-item" horizontalAlignment="center" orientation="horizontal">
										<Label :text="item.text" :id="item.valueFieldId" width="80%"
											   class="m-l-20 m-t-10 h3"></Label>
										<Button :id="item.buttonId" text.decode="&#xf056;" class="m-l-10 m-r-20 fas list-item-button"
												@tap="onTapRemoveSymptom" color="#CCC"></Button>
									</StackLayout>
								</v-template>
							</RadListView>
						</template>
					</StackLayout>
				</ScrollView>
			</StackLayout>
			<TextField class="m-x-30 m-b-15" height="35" hint="Komorbides Symptom" :text='currentSymptomText'
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
	import ComorbidSymptoms from '~/components/hints/ComorbidSymptoms';

	const LifeChart = new LifeChartService();

    export default {
  		props: ['dateTodayDb'],
		data: () => {
			return {
				symptoms: new ObservableArray([]),
				symptomCount: 0,
				currentSymptomText: '',
				isLoading: false,
				minimumLoadingTimeDone: false,
				noSymptoms: true,
				itemList: []
			}
		},
		methods: {
			onShownModally(event) {
				this.page = event.object.page;
				this.isLoading = true;

				this.minimumLoadingTimeDone = false;
				setTimeout(() => {
					this.minimumLoadingTimeDone = true;
				}, 750);
				LifeChart.getComborbidSymptoms(this.dateTodayDb, this.onComborbidSymptomQueryEvent);
			},
			onComborbidSymptomQueryEvent(result) {
				if (!result.error) {
					let records = result.children;

					if (records && records.length) {
						this.noSymptoms = false;
						for (let i = 0; i < records.length; i++) {
							++this.symptomCount;
							this.symptoms.unshift({
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

				this.isLoading = false;
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
			showExplanation() {
				this.$showModal(ComorbidSymptoms, {
					animated  : true
				});
			},
			onReturnPress(event) {
				let text = event.object.text;

				if (!text || text === '') {
					return;
				}

				this.currentSymptomText = '';
				event.object.text = '';

				let promise = LifeChart.saveComorbidSymptom({
																symptom: text,
																date   : this.dateTodayDb
															});

				promise.then((result) => {
					this.noSymptoms = false;
					++this.symptomCount;
					this.symptoms.unshift({
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
