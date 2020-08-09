const Couchbase = require('nativescript-couchbase-plugin').Couchbase;
const QueryLogicalOperator = require('nativescript-couchbase-plugin').QueryLogicalOperator;
const Observable = require('tns-core-modules/data/observable').Observable;

let instance;

class LifeChartService extends Observable {

    constructor() {
        super();

        this._changeListenerAdded = false;

        this.TYPE_COMORBID_SYMPTOM = 'comorbidSymptom';
        this.TYPE_LIFE_EVENT = 'lifeEvent';
        this.TYPE_DAILY_ASSESSMENT = 'dailyAssessment';
        this.TYPE_FUNCTIONAL_IMPAIRMENT = 'functionalImpairment';

        this.EVENT_DOCUMENT_CHANGE = 'document_change';
        /*
        this._databaseCommon = new Couchbase('ka4821LO-0041-common');
        this._databaseHuman = new Couchbase('ka4821LO-0041-human');
        this._databaseStatus = new Couchbase('ka4821LO-0041-lifechart');
        */
        this._setTimeItems();
        this._setImpairmentItems();
    }

    _authenticationDone() {
        console.log("login", this);
    }

    getLifechartDatabase() {
        if (!this._databaseLifechart) {
            this._databaseLifechart = new Couchbase('ka4821LO-0041-lifechart');
            this._addLifechartChangeListener(this._databaseLifechart);
        }

        return this._databaseLifechart;
    }

    getData() {
        return '';
    }

    getTimeItems() {
        return this.timeItems;
    }

    getImpairmentLabelForValue(_value) {
        let items = this._impairmentItems;
        for (let i = 0; i < items.length; i++) {
            if (items[i].value === _value) {
                return items[i].toString();
            }
        }

        return _value;
    }

    getImpairmentItems() {
        return this._impairmentItems;
    }

    getAssessments(_callback) {
        return this.getLifechartDatabase().query({
                                                select: [],
                                                where : [{
                                                    property  : 'type',
                                                    comparison: 'equalTo',
                                                    value     : this.TYPE_DAILY_ASSESSMENT
                                                }],
                                                order : [{property: 'date', direction: 'asc'}]
                                            });
    }

    getFunctionalImpairments() {
        return this.getLifechartDatabase().query({
                                                select: [],
                                                where : [
                                                    {
                                                        property  : 'type',
                                                        comparison: 'equalTo',
                                                        value     : this.TYPE_FUNCTIONAL_IMPAIRMENT
                                                    }
                                                ],
                                                order : [{property: 'date', direction: 'asc'}]
                                            });
    }

    getRatingForDay(_date) {
        return this.getLifechartDatabase().query({
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
        return this.getLifechartDatabase().query({
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

        return this.getLifechartDatabase().createDocument(_object);
    }

    removeFunctionalImpairment(_id) {
        return this._databaseLifechart.deleteDocument(_id);
    }

    updateDailyAssessment(_id, _object) {
        _object.editTimestamp = java.lang.System.currentTimeMillis();

        this.getLifechartDatabase().updateDocument(_id, _object);
    }

    removeDailyAssessment(_id) {
        return this.getLifechartDatabase().deleteDocument(_id);
    }

    saveDailyAssessment(_object) {
        _object.timestamp = java.lang.System.currentTimeMillis();
        _object.type = this.TYPE_DAILY_ASSESSMENT;

        return this.getLifechartDatabase().createDocument(_object);
    }

    saveLifeEvent(_object) {
        _object.timestamp = java.lang.System.currentTimeMillis();
        _object.type = this.TYPE_LIFE_EVENT;

        return this.getLifechartDatabase().createDocument(_object);
    }

    saveComorbidSymptom(_object) {
        _object.timestamp = java.lang.System.currentTimeMillis();
        _object.type = this.TYPE_COMORBID_SYMPTOM;

        return this.getLifechartDatabase().createDocument(_object);
    }

    removeLifeEvent(_id) {
        return this.getLifechartDatabase().deleteDocument(_id);
    }

    getLifeEvents(_date) {
        return this.getLifechartDatabase().query({
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
        return this.getLifechartDatabase().deleteDocument(_id);
    }

    getComborbidSymptoms(_date) {
        return this.getLifechartDatabase().query({
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

    _databaseChangedListener(_changes) {
        let Frame = require("tns-core-modules/ui/frame").Frame;
        Frame.topmost().notify({
                                   eventName: this.EVENT_DOCUMENT_CHANGE
                               });
        return;

        // todo: this here ...
        let hasDocumentChanges = false;

        for (let i = 0; i < _changes.length; i++) {
            let document = this._databaseLifechart.getDocument(_changes[i]);
            if (document && document.type) {
                hasDocumentChanges = true;
            }
        }

        if (hasDocumentChanges) {
            let Frame = require("tns-core-modules/ui/frame").Frame;
            Frame.topmost().notify({
                            eventName: this.EVENT_DOCUMENT_CHANGE
                        });
        }
    }

    _addLifechartChangeListener() {
        if (this._changeListenerAdded) {
            return;
        }

        this._databaseLifechart.addDatabaseChangeListener(this._databaseChangedListener.bind(this));

        this._changeListenerAdded = true;
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

    _setImpairmentItems() {
        this._impairmentItems = [
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
}

module.exports = {
    getInstance: function () {
        if (!instance) {
            instance = new LifeChartService();
        }

        return instance;
    }
}
