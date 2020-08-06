<template>
  <Page @shownModally="shownModally" class="page" actionBarHidden="true">
      <FlexboxLayout  flexDirection="column" justifyContent="center" id="questionBox" class="p-20" width="100%">
          <Label :text="question" class="w-100 text-center"></Label>
          <TextField v-if="textanswer" v-model="answer" @textChange="onTextChange"
                     id="answer"></TextField>
          <Button :isEnabled="buttonIsEnabled" text="ok" @tap="onTap" class="-outline -rounded-lg"></Button>
      </FlexboxLayout>
  </Page>
</template>

<script>
import Vue from 'nativescript-vue';

export default {
  data   : () => {
    return {
      buttonIsEnabled: false,
      answer         : '',
      question       : '',
      textanswer     : false
    };
  },
  methods: {
    setQuestion(page, question) {
      this.question = question.text;
      this.textanswer = false;

      switch (question.type) {
        case 'text':
          this.textanswer = true;
          break;
        case 'number':
          this.textanswer = true;
          break;
      }
    },
    shownModally(args) {
      let page = args.object;
      this.setQuestion(page, {
        text: 'Welche PIN sollen wir benutzen?',
        type: 'text'
      });
    },
    onTextChange() {
      if (this.answer) {
        this.buttonIsEnabled = true;
      }
    },
    onTap() {
      Vue.Jane.setSecret(this.answer);
      this.$modal.close();
    }
  }
};
</script>

<style scoped lang="scss">
// Start custom common variables
@import "~@nativescript/theme/scss/variables/blue";
// End custom common variables

// Custom styles
</style>
