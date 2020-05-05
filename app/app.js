import Vue from "nativescript-vue";
import App from "./components/App";
import firebase from 'nativescript-plugin-firebase';

firebase.init({
  // Optionally pass in properties for database, authentication and cloud messaging,
  // see their respective docs.
}).then(
    function () {
      console.log("firebase.init done");
    },
    function (error) {
      console.log("firebase.init error: " + error);
    }
);

new Vue({
    render: h => h(App)
}).$start();

Vue.registerElement(
  'CardView',
  () => require('@nstudio/nativescript-cardview').CardView
);
