import { Couchbase, QueryLogicalOperator, ConcurrencyMode } from 'nativescript-couchbase-plugin';

export default class LifeChartService {

    constructor() {
        this.TYPE_COMORBID_SYMPTOM = 'comorbidSymptom';
        this.TYPE_LIFE_EVENT = 'lifeEvent';
        this.TYPE_DAILY_ASSESSMENT = 'dailyAssessment';
        this.TYPE_FUNCTIONAL_IMPAIRMENT = 'functionalImpairment';

        this.databaseCommon = new Couchbase('ka4821LO-0041-common');
        this.databaseLifechart = new Couchbase('ka4821LO-0041-lifechart');
        this.databaseHuman = new Couchbase('ka4821LO-0041-human');
        this.databaseStatus = new Couchbase('ka4821LO-0041-lifechart');

        this._setTimeItems();
    }

    _setTimeItems() {
        this.timeItems = ['23:30'];
        for (let i = 0; i < 24; i++) {
            let number = i + '';
            number = number.padStart(2, '0');
            this.timeItems.push(number + ':00');
            this.timeItems.push(number + ':30');
        }
        this.timeItems.push('00:00');
    }

    getData() {
        return '';
    }

    getTimeItems() {
        return this.timeItems;
    }

    getMoodItems() {
        return [
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
                hint    : 'ausgeglichen',
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
        ];
    }

    getAssessments(_callback) {
        console.log("TODO: check loaded records order");
        return this.databaseLifechart.query({
                                                select: [],
                                                where : [],
                                                order : [{property: 'date', direction: 'asc'}]
                                            });
    }

    getFunctionalImpairments() {
        return this.databaseLifechart.query({
                                                select: [],
                                                where : [
                                                    {
                                                        property  : 'type',
                                                        comparison: 'equalTo',
                                                        value     : this.TYPE_FUNCTIONAL_IMPAIRMENT,
                                                        logical   : QueryLogicalOperator.AND
                                                    }
                                                ],
                                                order : [{property: 'timestamp', direction: 'asc'}]
                                            });
    }

    getRatingForDay(_date) {
        return this.databaseLifechart.query({
                                                select: [],
                                                where : [
                                                    {property: 'date', comparison: 'equalTo', value: _date},
                                                    {property     : 'type',
                                                        comparison: 'equalTo',
                                                        value     : this.TYPE_DAILY_ASSESSMENT,
                                                        logical   : QueryLogicalOperator.AND
                                                    }
                                                ],
                                                order : [],
                                                limit : 1
                                            });
    }

    getFunctionalImpairmentsForDay(_date) {
        return this.databaseLifechart.query({
                                                select: [],
                                                where : [
                                                    {property: 'date', comparison: 'equalTo', value: _date},
                                                    {
                                                        property  : 'type',
                                                        comparison: 'equalTo',
                                                        value     : this.TYPE_FUNCTIONAL_IMPAIRMENT,
                                                        logical   : QueryLogicalOperator.AND
                                                    }
                                                ],
                                                order : [{property: 'timestamp', direction: 'desc'}]
                                            });
    }

    saveFunctionalImpairment(_object) {
        _object.timestamp = java.lang.System.currentTimeMillis();
        _object.type = this.TYPE_FUNCTIONAL_IMPAIRMENT;

        return this.databaseLifechart.createDocument(_object);
    }

    removeFunctionalImpairment(_id) {
        return this.databaseLifechart.deleteDocument(_id);
    }

    updateDailyAssessment(_id, _object) {
        _object.editTimestamp = java.lang.System.currentTimeMillis();

        this.databaseLifechart.updateDocument(_id, _object);
    }

    removeDailyAssessment(_id) {
        return this.databaseLifechart.deleteDocument(_id);
    }

    saveDailyAssessment(_object) {
        _object.timestamp = java.lang.System.currentTimeMillis();
        _object.type = this.TYPE_DAILY_ASSESSMENT;

        return this.databaseLifechart.createDocument(_object);
    }

    saveLifeEvent(_object) {
        _object.timestamp = java.lang.System.currentTimeMillis();
        _object.type = this.TYPE_LIFE_EVENT;

        return this.databaseLifechart.createDocument(_object);
    }

    saveComorbidSymptom(_object) {
        _object.timestamp = java.lang.System.currentTimeMillis();
        _object.type = this.TYPE_COMORBID_SYMPTOM;

        return this.databaseLifechart.createDocument(_object);
    }

    removeLifeEvent(_id) {
        return this.databaseLifechart.deleteDocument(_id);
    }

    getLifeEvents(_date) {
        return this.databaseLifechart.query({
                                                select: [],
                                                where : [
                                                    {property: 'date', comparison: 'equalTo', value: _date},
                                                    {
                                                        property  : 'type',
                                                        comparison: 'equalTo',
                                                        value     : this.TYPE_LIFE_EVENT,
                                                        logical   : QueryLogicalOperator.AND
                                                    }
                                                ],
                                                order : [{property: 'timestamp', direction: 'asc'}]
                                            });
    }

    removeComorbidSymptom(_id) {
        return this.databaseLifechart.deleteDocument(_id);
    }

    getComborbidSymptoms(_date) {
        return this.databaseLifechart.query({
                                                select: [],
                                                where : [
                                                    {property: 'date', comparison: 'equalTo', value: _date},
                                                    {
                                                        property  : 'type',
                                                        comparison: 'equalTo',
                                                        value     : this.TYPE_COMORBID_SYMPTOM,
                                                        logical   : QueryLogicalOperator.AND
                                                    }
                                                ],
                                                order : [{property: 'timestamp', direction: 'asc'}]
                                            });
    }
}
