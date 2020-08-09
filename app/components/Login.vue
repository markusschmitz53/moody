<template>
  <Page @shownModally="onShownModally" actionBarHidden="true">
    <FlexboxLayout class="page">
      <StackLayout class="form">
        <Label class="header" text="moody"/>
        <StackLayout class="input-field" marginBottom="25">
          <TextField :editable="isEditable" maxLength="4" ref="password" class="input text-center" hint="" secure="true"
                     @textChange="onTextChange" :color="inputTextColor" fontSize="18"/>
          <StackLayout class="hr-light"/>
          <Label class="m-t-5" :text="labelText"/>
        </StackLayout>
      </StackLayout>
    </FlexboxLayout>
  </Page>
</template>

<script>
import Vue from "nativescript-vue";
export default {
  data() {
    return {
      pinTries      : 0,
      inputTextColor: '#111111',
      isEditable    : true,
      labelText : ''
    };
  },
  methods: {
    onShownModally() {
      this.$refs.password.nativeView.focus();
    },
    onTextChange(_event) {
      this.inputTextColor = '#111111';

      if (_event.value.length === 4) {
        this.inputTextColor = '#CCCCCC';
        ++this.pinTries;
        this.isEditable = false;

        if (this.pinTries > 3) {
          let counter = 30;
          this.labelText = 'Bitte warte ' + counter + ' Sekunden';

          // TODO: Move into Jane authentication method and connect to securestorage for app restart
          let timerModule = require("tns-core-modules/timer");
          let id = timerModule.setInterval(() => {
            --counter;
            this.labelText = 'Bitte warte ' + counter + ' Sekunden';

            if (counter < 0) {
              this.isEditable = true;
              this.labelText = '';
              this.pinTries = 0;
              this.inputTextColor = '#111111';
              timerModule.clearInterval(id);
            }
          }, 1000);
        }

        if (Vue.Jane.authenticate(_event.value)) {
          this.inputTextColor = '#00FF00';

          setTimeout(() => {
            this.$modal.close();
          }, 800);
        } else {
          // TODO: nicer color
          this.inputTextColor = '#FF0000';
          this.isEditable = true;
        }
      }
    },
    /*
            login() {

              return Promise.resolve(user);
                userService
                    .login(this.user)
                    .then(() => {

                    })
                    .catch(() => {
                        this.alert("Unfortunately we could not find your account.");
                    });
            },
      */
  }
};
</script>

<style scoped>
	.page {
		align-items: center;
		flex-direction: column;
	}

	.form {
		margin-left: 30;
		margin-right: 30;
		flex-grow: 2;
		vertical-align: middle;
	}

	.header {
		horizontal-align: center;
		font-size: 40;
		font-weight: 600;
		margin-bottom: 70;
		text-align: center;
		color: #00CAAB;
	}

	.input-field {
		margin-bottom: 25;
	}

	.input {
    width: 75;
		font-size: 18;
    letter-spacing: 0.5;
		placeholder-color: #A8A8A8;
	}

	.input-field .input {
		font-size: 54;
	}

</style>
