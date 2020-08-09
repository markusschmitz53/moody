<template lang="html">
    <Page @loaded="onPageLoaded" actionBarHidden="true">
      <template v-if="hasItems">
        <FlexboxLayout flexDirection="column" justifyContent="center" class="background-gradient">
          <StackLayout height="10%" class="m-t-30" orientation="horizontal" horizontalAlignment="center"
                       @swipe="onSwipe">
            <Button @tap="onTapMonthBackward" class="reduced-margin-and-padding m-b-30" width="30" height="36">
              <FormattedString>
                        <Span class="fas button-icon-size reduced-margin-and-padding" color="#CCC"
                              text.decode="&#xf0d9;"></Span>
              </FormattedString>
            </Button>
            <Label width="35%" class="dateLabel text-center" :text="currentMonth"></Label>
            <Button @tap="onTapMonthForward" class="reduced-margin-and-padding m-b-30" width="30" height="36">
              <FormattedString>
                        <Span class="fas button-icon-size h2 reduced-margin-and-padding" color="#CCC"
                              text.decode="&#xf0da;"></Span>
              </FormattedString>
            </Button>
          </StackLayout>
          <Label text="Stimmung" class="text-center"></Label>
          <RadCartesianChart class="p-t-5 chart" height="35%">
            <CategoricalAxis hidden="true" v-tkCartesianHorizontalAxis/>
            <LinearAxis labelTextColor="#CCC" lineColor="#CCC" :majorStep="this.majorStepValue"
                        v-tkCartesianVerticalAxis id="verBarAxis" labelFormat="%.0f" :maximum="this.moodMaxValue"
                        :minimum="this.moodMinValue"/>
            <SplineSeries v-tkCartesianSeries :items="items" categoryProperty="date" valueProperty="mood"/>
            <ChartGridLineAnnotation v-tkCartesianAnnotations axisId="verBarAxis" hidden="false" value="50"
                                     zPosition="AboveSeries" strokeWidth="2" strokeColor="#00CAAB">
            </ChartGridLineAnnotation>
            <Trackball v-tkCartesianTrackball></Trackball>
          </RadCartesianChart>
          <Label text="Funktionale Einschränkung" class="m-t-30 text-center"></Label>
          <RadCartesianChart class="chart" height="35%">
            <CategoricalAxis hidden="true" v-tkCartesianHorizontalAxis/>
            <LinearAxis labelTextColor="#CCC" lineColor="#CCC" majorStep="1"
                        v-tkCartesianVerticalAxis id="verBarAxisImpairment" labelFormat="%.0f" maximum="4"
                        minimum="-4"/>
            <SplineSeries v-tkCartesianSeries :items="impairmentRecords" categoryProperty="date"
                          valueProperty="impairment"/>
            <ChartGridLineAnnotation v-tkCartesianAnnotations axisId="verBarAxisImpairment" hidden="false" value="0"
                                     zPosition="AboveSeries" strokeWidth="2" strokeColor="#00CAAB">
            </ChartGridLineAnnotation>
            <Trackball v-tkCartesianTrackball></Trackball>
          </RadCartesianChart>

        </FlexboxLayout>
      </template>
      <template v-else>
        <StackLayout width="100%" height="100%" verticalAlignment="center" horizontalAlignment="center">
          <Label class="m-t-30 m-b-10 text-center hint" color="#CCC">Ich habe noch keine Auswertung erstellt.</Label>
        </StackLayout>
      </template>
    </Page>
</template>
<script>
const LifeChartService = require('~/LifeChart.service');
let LifeChart = LifeChartService.getInstance();

export default {
  data: () => {
          return {
            timerId          : null,
            moodMinValue     : 0,
            moodMaxValue     : 100,
            items            : [],
            hasItems         : true,
            currentMonth     : '',
            impairmentRecords: []
          };
        },
        methods: {
            onTapMonthForward() {
                this.setDateToday(1);
               // LifeChart.getRatingForDay(this.dateTodayDb, this.onRecordLoaded);
            },
            onTapMonthBackward() {
                this.setDateToday(-1);
              //  LifeChart.getRatingForDay(this.dateTodayDb, this.onRecordLoaded);
            },
            onSwipe(args) {
                if (args.direction === 1) {
                    this.onTapMonthBackward();
                }
                else if (args.direction === 2) {
                    this.onTapMonthForward();
                }
            },
            setAssessmentRecords(_records) {
              this.hasItems = _records && _records.length;
                if (this.hasItems) {
                    let minValue = 100,
                            maxValue = 0;

                    this.items = _records;

                    for (let i = 0; i < _records.length; i++) {
                        let currentValue = _records[i].mood;
                        if (currentValue < minValue) {
                            minValue = currentValue;
                        }
                        if (currentValue > maxValue) {
                            maxValue = currentValue;
                        }

                        if (maxValue < 50) {
                            maxValue = 54;
                        }
                    }

                    this.moodMinValue = minValue - 2;
                    this.moodMaxValue = maxValue + 2;
                    this.majorStepValue = this.moodMaxValue - this.moodMinValue;
                }
            },
            setImpairmentRecords(_records) {
                if (_records && _records.length) {
                    this.impairmentRecords = _records;
                }
            },
            onPageLoaded() {
                this.setDateToday();
                this.setAssessmentRecords(LifeChart.getAssessments());
                this.setImpairmentRecords(LifeChart.getFunctionalImpairments());
            },
            setDateToday(_changeDate) {
                if (_changeDate === 1) {
                    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                }
                else if (_changeDate === -1) {
                    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                }
                else {
                    this.currentDate = new Date();
                }

                let dd = String(this.currentDate.getDate()).padStart(2, '0');
                let mm = String(this.currentDate.getMonth() + 1).padStart(2, '0'); //January is 0!
                let yyyy = this.currentDate.getFullYear();
                let hh = String(this.currentDate.getHours()).padStart(2, '0')
                let ii = String(this.currentDate.getMinutes()).padStart(2, '0')

                let monthAsString = mm;
                switch (mm) {
                    case '01':
                        monthAsString = 'Januar';
                        break;
                    case '02':
                        monthAsString = 'Februar';
                        break;
                    case '03':
                        monthAsString = 'März';
                        break;
                    case '04':
                        monthAsString = 'April';
                        break;
                    case '05':
                        monthAsString = 'Mai';
                        break;
                    case '06':
                        monthAsString = 'Juni';
                        break;
                    case '07':
                        monthAsString = 'Juli';
                        break;
                    case '08':
                        monthAsString = 'August';
                        break;
                    case '09':
                        monthAsString = 'September';
                        break;
                    case '10':
                        monthAsString = 'Oktober';
                        break;
                    case '11':
                        monthAsString = 'November';
                        break;
                    case '12':
                        monthAsString = 'Dezember';
                        break;
                }

                this.currentMonth = monthAsString + ' ' + yyyy;

            }
        }
    }
</script>

<style lang="scss" scoped>
// Start custom common variables
@import "~@nativescript/theme/scss/variables/blue";
// End custom common variables

// Custom styles
.chart {
    margin: 0;
    padding: 0;
}

.dateLabel {
    color: #444444;
    font-size: 15;
    margin-top: 5;
}

.reduced-margin-and-padding {
    margin: 0;
    padding: 10;
}


.button-icon-size {
    font-size: 16;
}
</style>
