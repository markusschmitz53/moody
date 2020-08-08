<template>
  <Page @shownModally="onShownModally" actionBarHidden="true">
    <FlexboxLayout class="page">
      <StackLayout class="form">
        <Label class="header" text="moody"/>
        <StackLayout class="input-field" marginBottom="25">
          <TextField ref="password" class="input text-center" hint="" secure="true"
                     @textChange="onTextChange" fontSize="18"/>
          <StackLayout class="hr-light"/>
        </StackLayout>
      </StackLayout>
    </FlexboxLayout>
  </Page>
</template>

<script>
import Vue from "nativescript-vue";
export default {
  data() {
    return {};
  },
  methods: {
    onShownModally() {
      this.$refs.password.nativeView.focus();
    },
    onTextChange(_event) {
      if (_event.value.length === 4) {
        if (Vue.Jane.authenticate(_event.value)) {
          this.$modal.close();
        } else {
          // TODO: else
          console.log("login wrong TODO");
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
