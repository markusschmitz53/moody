<template>
  <Page class="page" actionBarHidden="true">
      <FlexboxLayout  flexDirection="column" justifyContent="center" class="p-x-20 p-y-30" width="100%">
          <Label textWrap="true" text="Deine Angaben für den Tag habe ich mir gemerkt. Was sollen wir machen?" class="p m-b-30"></Label>
          <Button text="Beurteilung vergessen" @tap="onTapForgetAssessment" class="-outline -rounded-lg smallButtonFont"></Button>
          <Button text="Ganzen Tag vergessen" @tap="onTapForget" class="-outline -rounded-lg smallButtonFont"></Button>
          <Button text="Nichts" @tap="onTapNothing" class="-primary -rounded-lg smallButtonFont"></Button>
      </FlexboxLayout>
  </Page>
</template>

<script>
export default {
  data   : () => {
    return {
      test: 1234
    };
  },
  methods: {
    onTapNothing() {
      this.$modal.close();
    },
    onTapForgetAssessment() {
      this.$modal.close(1); // TODO: magic number
    },
    onTapForget() {
      this.$modal.close(2); // TODO: magic number
    }
  }
};
</script>

<style scoped lang="scss">
// Start custom common variables
@import "~@nativescript/theme/scss/variables/blue";
// End custom common variables

// Custom styles

.smallButtonFont {
  font-size: 12;
}
</style>
