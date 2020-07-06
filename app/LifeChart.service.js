import * as firebase from 'nativescript-plugin-firebase';

export default class LifeChartService {

    constructor() {
        this.TYPE_COMORBID_SYMPTOM = 'comorbidSymptom';
        this.TYPE_LIFE_EVENT = 'lifeEvent';

        this.timeItems = ['23:30'];
        this.rootPathEvents = '/eventsV2/';
        this.rootPathChart = this.rootPathEvents + 'chart/';

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

    getRatingForDay(_date, _callback) {
         return firebase.query(
            _callback,
            this.rootPathChart + 'dailyAssessments/',
            {
                singleEvent: true,
                orderBy    : {
                    type : firebase.QueryOrderByType.CHILD,
                    value: 'date' // mandatory when type is 'child'
                },
                range      : {
                    type : firebase.QueryRangeType.EQUAL_TO,
                    value: _date
                }
            }
        );
    }

    getFunctionalImpairmentsForDay(_date, _callback) {
         return firebase.query(
            _callback,
            this.rootPathChart + 'functionalImpairments/',
            {
                singleEvent: true,
                orderBy    : {
                    type : firebase.QueryOrderByType.CHILD,
                    value: 'date' // mandatory when type is 'child'
                },
                range      : {
                    type : firebase.QueryRangeType.EQUAL_TO,
                    value: _date
                }
            }
        );
    }

    saveFunctionalImpairment(_object) {
        _object.serverTimestamp = firebase.ServerValue.TIMESTAMP;
        _object.timestamp = java.lang.System.currentTimeMillis();

        let path = this.rootPathChart + 'functionalImpairments/';

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

    removeFunctionalImpairment(key) {
        let data = {};
        data[key] = null;
        return firebase.update(this.rootPathChart + 'functionalImpairments/', data);
    }

    updateDailyAssessment(_key, _object) {
        _object.serverTimestamp = firebase.ServerValue.TIMESTAMP;
        _object.timestamp = java.lang.System.currentTimeMillis();

        let path = this.rootPathChart + 'dailyAssessments/';

        return firebase.update(path + _key, _object);
    }

    saveDailyAssessment(_object) {
        _object.serverTimestamp = firebase.ServerValue.TIMESTAMP;
        _object.timestamp = java.lang.System.currentTimeMillis();

        let path = this.rootPathChart + 'dailyAssessments/';

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

    saveLifeEvent(_object) {
        _object.serverTimestamp = firebase.ServerValue.TIMESTAMP;
        _object.type = this.TYPE_LIFE_EVENT;
        _object.timestamp = java.lang.System.currentTimeMillis();

        let path = this.rootPathChart + 'lifeEvents/';

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

        let path = this.rootPathChart + 'comorbidSymptoms/';

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
        return firebase.update(this.rootPathChart + 'lifeEvents/', data);
    }

    getLifeEvents(date, callback) {
        return firebase.query(
            callback,
            this.rootPathChart + 'lifeEvents/',
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
        return firebase.update(this.rootPathChart + 'comorbidSymptoms/', data);
    }

    getComborbidSymptoms(date, callback) {
        return firebase.query(
            callback,
            this.rootPathChart + 'comorbidSymptoms/',
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
