import Vue from "nativescript-vue";
import App from "./components/App";

import RadChart from 'nativescript-ui-chart/vue';
Vue.use(RadChart);

import RadListView from 'nativescript-ui-listview/vue';
Vue.use(RadListView);

new Vue({
    render: h => h(App)
}).$start();

Vue.registerElement(
  'CardView',
  () => require('@nstudio/nativescript-cardview').CardView
);

Vue.registerElement(
  'CheckBox',
  () => require('@nstudio/nativescript-checkbox').CheckBox,
  {
    model: {
      prop: 'checked',
      event: 'checkedChange'
    }
  }
);
