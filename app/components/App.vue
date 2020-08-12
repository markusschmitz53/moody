<template lang="html">
  <BottomNavigation id="mainNavigation" @loaded="onLoaded">
    <TabContentItem>
      <Frame id="main">
        <DailyAssessment />
      </Frame>
    </TabContentItem>
  </BottomNavigation>
</template>

<script>
import Home from "./Home.vue";
import Activity from "./Activity.vue";
import Charts from "./Charts.vue";
import Login from "./Login.vue";
import Question from "./Question.vue";
import FunctionalImpairment from "./FunctionalImpairment.vue";
import DailyAssessment from "./DailyAssessment.vue";

import Vue from "nativescript-vue";
import {on, getRootView, uncaughtErrorEvent} from "tns-core-modules/application";

const app = require("tns-core-modules/application");
const application = require("tns-core-modules/application");
const LifeChartService = require('../LifeChart.service');
const LifeChart = LifeChartService.getInstance();

export default {
  data: () => {
    return {
      isLoaded                : false,
      _authenticationIsPending: false,
      _bottomNavigationHidden : false,
    }
  },
  components: {
    Home,
    Login,
    Activity,
    Question,
    Charts,
    DailyAssessment,
    FunctionalImpairment
  },
  methods   : {
    authenticationDone() {
      this._authenticationIsPending = false;

      let Frame = require("tns-core-modules/ui/frame").Frame;
      Frame.topmost().on(LifeChart.EVENT_DOCUMENT_CHANGE, this._onDocumentsChanged.bind(this));
      this._onDocumentsChanged();
    },
    authenticationPending() {
      if (this._authenticationIsPending) {
        return;
      }

      this._authenticationIsPending = true;
      this.$showModal(Login, {
        animated  : true,
        fullscreen: true
      });
    },
    showBottomNavigationBar() {
      if (!this._bottomNavigationHidden)
        return;

      let bottomBar = getRootView();
      if (bottomBar && bottomBar.android) {
        bottomBar._bottomNavigationBar.setVisibility(android.view.View.VISIBLE);
        this._bottomNavigationHidden = false;
      }
    },
    hideBottomNavigationBar() {
      if (this._bottomNavigationHidden) {
        return;
      }

      let bottomBar = getRootView();
      if (bottomBar && bottomBar.android) {
        bottomBar._bottomNavigationBar.setVisibility(android.view.View.GONE);
        this._bottomNavigationHidden = true;
      }
    },
    requestSecret() {
      this.$showModal(Question, {
        animated  : true,
        fullscreen: true
      });
    },
    _onDocumentsChanged() {

    },
    onLoaded(_args) {
      if (de.markusschmitz.Jane.BuildConfig.DEBUG) {
        console.log('Component loaded: App');
      }

      on(uncaughtErrorEvent, function() {
        // TODO: what to do on crash?
      });

      this._page = _args.object;

      // register callbacks for Jane lifecycle on app start
      Vue.Jane.on(Vue.Jane.EVENT_AUTHENTICATED, this.authenticationDone);
      Vue.Jane.on(Vue.Jane.EVENT_UNAUTHENTICATED, this.authenticationPending);
      Vue.Jane.on(Vue.Jane.EVENT_MISSING_SECRET, this.requestSecret);

      Vue.Jane.graspSituation();

      let utils = require("tns-core-modules/utils/utils");
      let scheduler = require("../Scheduler");
      let backgroundService = require("../BackgroundService"); // require so it's part of webpack bundle
      scheduler.scheduleJob(utils.ad.getApplicationContext());
    }
  }
};

</script>

<style lang="scss">
// Start custom common variables
@import "~@nativescript/theme/scss/variables/blue";
// End custom common variables

TabStrip {
    background-color: #FFF;
    border-color: #FAFAFA;
    border-top-width: 2;
}

TabStripItem:active Image {
    color: #006968;
}

TabStripItem Image {
    color: #CCC;
}
</style>
