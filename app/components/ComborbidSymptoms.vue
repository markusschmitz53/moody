<template>
	<Page @shownModally="onShownModally">
		<StackLayout backgroundColor="#FFFFFF" orientation="vertical">
			<StackLayout orientation="vertical">
				<DockLayout stretchLastChild="false" height="48" width="100%">
					<Button dock="left" class="far transparent-bg button-z-index h2" margin="0" width="64" color="#CCC"
							text.decode="&#xf059;" @tap="showExplanation"></Button>
					<Button dock="right" class="far transparent-bg button-z-index h2" margin="0" width="64" color="#444"
							text.decode="&#xf057;" @tap="onTapDone"></Button>
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
										<Label :text="item.text" width="80%" class="m-l-20 m-t-10 h3"></Label>
										<Button text.decode="&#xf056;" class="m-l-10 m-r-20 fas list-item-button"
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
	import * as dialogs from 'tns-core-modules/ui/dialogs';
	import {ObservableArray} from 'tns-core-modules/data/observable-array';
	import ComorbidSymptoms from '~/components/hints/ComorbidSymptoms';
	import VibratorService from '~/Vibrator.service';

	const Vibrator = new VibratorService();
  const LifeChartService = require('../LifeChart.service');
	let LifeChart = LifeChartService.getInstance();

    export default {
  		props: ['dateTodayDb'],
		data: () => {
			return {
				symptoms: new ObservableArray([]),
				currentSymptomText: '',
				isLoading: false,
				minimumLoadingTimeDone: false,
				noSymptoms: true,
				itemList: []
			}
		},
		methods: {
			onShownModally(_event) {
				this.page = _event.object.page;
				this.isLoading = true;

				this.minimumLoadingTimeDone = false;
				setTimeout(() => {
					this.minimumLoadingTimeDone = true;
				}, 750);
				this.setRecords(LifeChart.getComborbidSymptoms(this.dateTodayDb));
			},
			setRecords(_records) {
				if (_records && _records.length) {
					this.noSymptoms = false;
					for (let i = 0; i < _records.length; i++) {
						let record = _records[i];
						this.symptoms.unshift({
												  text        : record.symptom,
												  id          : record.id
											  });
					}
				}
				this.isLoading = false;
			},
			onTapDone() {
		  	this.$modal.close();
			},
			onTapRemoveSymptom(_event) {
				let selectedRecord = _event.object.bindingContext,
						symptomArrayLengthBeforeChange = this.symptoms.length;


				if (LifeChart.removeComorbidSymptom(selectedRecord.id)) {
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
				}
				else {
					dialogs.alert({
									  title       : "Fehler!",
									  message     : "hat nicht geklappt",
									  okButtonText: "shitte"
								  });
				}
			},
			showExplanation() {
				this.$showModal(ComorbidSymptoms, {
					animated  : true
				});
			},
			onReturnPress(_event) {
				let text = _event.object.text;

				if (!text || text === '') {
					return;
				}

				this.currentSymptomText = '';
				_event.object.text = '';

				Vibrator.vibrate(75);

				let documentId = LifeChart.saveComorbidSymptom({
																   symptom: text,
																   date   : this.dateTodayDb
															   });

				this.noSymptoms = false;
				this.symptoms.unshift({
										  text: text,
										  id  : documentId
									  });
			}
		}
	}
</script>

<style scoped lang="scss">
	// Start custom common variables
	@import "~@nativescript/theme/scss/variables/blue";
	// End custom common variables

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
