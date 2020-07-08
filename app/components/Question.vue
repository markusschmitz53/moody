<template>
  <Page @navigatedTo="navigatedTo" class="page" actionBarHidden="true">
      <FlexboxLayout  flexDirection="column" justifyContent="center" id="questionBox">
          <Label :text="question" class="w-100 text-center"></Label>
          <TextField v-if="textanswer" v-model="nameOfUser" @textChange="onTextChange"
                     id="nameOfUser"></TextField>
          <Button :isEnabled="buttonIsEnabled" text="ok" @tap="onTap" class="-outline -rounded-lg"></Button>
      </FlexboxLayout>
  </Page>
</template>

<script>

export default {
    data: () => {
        return {
            buttonIsEnabled: false,
            nameOfUser: '',
            question: '',
            textanswer: false
        };
    },
    methods: {
        setQuestion (page, question) {
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
        navigatedTo(args) {
            let page = args.object;
            this.setQuestion(page, {
                text: 'Verrätst du mir deinen Namen?',
                type: 'text'
            });
        },
        onTextChange () {
            if (this.nameOfUser) {
                this.buttonIsEnabled = true;
            }
        },
        onTap () {

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
