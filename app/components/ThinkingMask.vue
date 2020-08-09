<template>
  <Page @loaded="onLoaded" width="100%" actionBarHidden="true">
    <FlexboxLayout width="100%" flexDirection="column" class="m-x-30" justifyContent="center">
      <Label class="m-x-30 m-y-30 text-center" width="100%" text="einen Moment"/>
    </FlexboxLayout>
  </Page>
</template>

<script>
import Vue from 'nativescript-vue';

export default {
  data() {
    return {};
  },
  methods: {
    onLoaded() {
      this.minimumVisibleTimeDone = false;
      this.closeModalNow = false;

      setTimeout(() => {
        this.minimumVisibleTimeFinished = true;

        if (this.closeModalNow) {
          this.$modal.close();
        }
      }, 1500);

      if (Vue.Jane.isThinking()) {
        Vue.Jane.on(Vue.Jane.EVENT_THINKING_STOP, this._onJaneStopThinking);
      } else {
        this._onJaneStopThinking();
      }
    },
    _onJaneStopThinking() {
      this.closeModalNow = true;

      if (!this.minimumVisibleTimeDone) {
        return;
      }

      this.$modal.close();
    },
  }
};
</script>

<style scoped lang="scss">
// Start custom common variables
@import "~@nativescript/theme/scss/variables/blue";
// End custom common variables

// Custom styles

</style>
