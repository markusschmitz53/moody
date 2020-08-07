<template lang="html">
  <BottomNavigation id="mainNavigation" @loaded="onLoaded">
    <TabStrip>
      <TabStripItem class="navigation__item">
        <Image src.decode="font://&#xf274;" class="far"></Image>
      </TabStripItem>
      <TabStripItem class="navigation__item">
        <Image src.decode="font://&#xf080;" class="far"></Image>
      </TabStripItem>
      <!--
      <TabStripItem class="navigation__item">
          <Image src.decode="font://&#xf086;" class="far"></Image>
      </TabStripItem>
      <TabStripItem class="navigation__item">
          <Image src.decode="font://&#xf21e;" class="fas"></Image>
      </TabStripItem>
      -->
    </TabStrip>

    <TabContentItem>
      <Frame id="main">
        <DailyAssessment />
      </Frame>
    </TabContentItem>

    <TabContentItem>
      <Frame>
        <Charts/>
      </Frame>
    </TabContentItem>

    <TabContentItem>
      <Frame>
        <Login/>
      </Frame>
    </TabContentItem>

    <TabContentItem>
      <Frame>
        <Home/>
      </Frame>
    </TabContentItem>

    <TabContentItem>
      <Frame>
        <Activity/>
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
import LifeChartService from '~/LifeChart.service';

const LifeChart = new LifeChartService();
const application = require("tns-core-modules/application");

export default {
  data: () => {
    return {
      isLoaded                : false,
      _authenticationIsPending: false,
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
      this.$navigateTo(DailyAssessment, {
        animated: true,
        frame   : 'main'
      });
    },
    authenticationPending() {
      if (this._authenticationIsPending) {
        return;
      }

      this._authenticationIsPending = true;
      this.$navigateTo(Login, {
        animated: true,
        frame   : 'main'
      }).then(() => {
                if (this._page.getViewById("mainNavigation").selectedIndex !== 0) {
                  this._page.getViewById("mainNavigation").selectedIndex = 0;
                }
              }
      );
    },
    requestSecret() {
   //   this.hideBottomNavigationBar();

      this.$showModal(Question, {
        animated: true
      });
    },
    onLoaded(_args) {
      on(uncaughtErrorEvent, function() {
        // TODO: what to do on crash?
      });

      this._page = _args.object;

      // register callbacks for Jane lifecycle on app start
      Vue.Jane.on(Vue.Jane.EVENT_AUTHENTICATED, this.authenticationDone);
      Vue.Jane.on(Vue.Jane.EVENT_UNAUTHENTICATED, this.authenticationPending);
      Vue.Jane.on(Vue.Jane.EVENT_MISSING_SECRET, this.requestSecret);

      Vue.Jane.graspSituation();
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
