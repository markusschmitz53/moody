import * as firebase from 'nativescript-plugin-firebase';

export default class LifeChartService {

  constructor() {
      this.timeItems = ['23:30'];
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

  save(_object) {
      _object.serverTimestamp = firebase.ServerValue.TIMESTAMP;

      return firebase.push(
          '/events/lifechart',
          _object
      );
  }
}
