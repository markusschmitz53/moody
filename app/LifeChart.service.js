import * as firebase from 'nativescript-plugin-firebase';

export default class LifeChartService {

    constructor() {
        this.TYPE_FUNCTIONAL_IMPAIRMENT = 'functionalImpairment';
        this.TYPE_DAILY_ASSESSMENT = 'dailyAssessment';
        this.TYPE_COMORBID_SYMPTOM = 'comorbidSymptom';
        this.TYPE_LIFE_EVENT = 'lifeEvent';

        this.timeItems = ['23:30'];
        this.rootPathEvents = '/eventsV2/';

        for (let i = 0; i < 24; i++) {
            this.timeItems.push(i + ':00');
            this.timeItems.push(i + ':30');
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

    saveFunctionalImpairment(_object) {
        _object.serverTimestamp = firebase.ServerValue.TIMESTAMP;
        _object.type = this.TYPE_FUNCTIONAL_IMPAIRMENT;
        _object.timestamp = java.lang.System.currentTimeMillis();

        return firebase.push(
            this.rootPathEvents + 'lifechart',
            _object
        );
    }

    saveDailyAssessment(_object) {
        _object.serverTimestamp = firebase.ServerValue.TIMESTAMP;
        _object.type = this.TYPE_DAILY_ASSESSMENT;
        _object.timestamp = java.lang.System.currentTimeMillis();

        return firebase.push(
            this.rootPathEvents + 'lifechart',
            _object
        );
    }

    saveLifeEvent(_object) {
        _object.serverTimestamp = firebase.ServerValue.TIMESTAMP;
        _object.type = this.TYPE_LIFE_EVENT;
        _object.timestamp = java.lang.System.currentTimeMillis();

        let path = this.rootPathEvents + 'lifeEvents/';

       return firebase.push(
            path,
            _object
        ).then(function (result) {
            firebase.update(path + result.key, {
                key: result.key
            });

            return result;
        });


    }

    saveComorbidSymptom(_object) {
        _object.serverTimestamp = firebase.ServerValue.TIMESTAMP;
        _object.type = this.TYPE_COMORBID_SYMPTOM;
        _object.timestamp = java.lang.System.currentTimeMillis();

        let path = this.rootPathEvents + 'comorbidSymptoms/';

       return firebase.push(
            path,
            _object
        ).then(function (result) {
            firebase.update(path + result.key, {
                key: result.key
            });

            return result;
        });


    }

    removeLifeEvent(key) {
        let data = {};
        data[key] = null;
        return firebase.update(this.rootPathEvents + 'lifeEvents/', data);
    }

    getLifeEvents(date, callback) {
        return firebase.query(
            callback,
            this.rootPathEvents + 'lifeEvents',
            {
                // set this to true if you want to check if the value exists or just want the event to fire once
                // default false, so it listens continuously.
                // Only when true, this function will return the data in the promise as well!
                singleEvent: true,
                orderBy    : {
                    type : firebase.QueryOrderByType.CHILD,
                    value: 'date' // mandatory when type is 'child'
                },
                range      : {
                    type : firebase.QueryRangeType.EQUAL_TO,
                    value: date
                }
            }
        );
    }

    removeComorbidSymptom(key) {
        let data = {};
        data[key] = null;
        return firebase.update(this.rootPathEvents + 'comorbidSymptoms/', data);
    }

    getComborbidSymptoms(date, callback) {
        return firebase.query(
            callback,
            this.rootPathEvents + 'comorbidSymptoms',
            {
                // set this to true if you want to check if the value exists or just want the event to fire once
                // default false, so it listens continuously.
                // Only when true, this function will return the data in the promise as well!
                singleEvent: true,
                orderBy    : {
                    type : firebase.QueryOrderByType.CHILD,
                    value: 'date' // mandatory when type is 'child'
                },
                range      : {
                    type : firebase.QueryRangeType.EQUAL_TO,
                    value: date
                }
            }
        );
    }
}
