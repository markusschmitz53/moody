<template lang="html">
    <Page @navigatingTo="onPageLoaded">
        <ActionBar>
			<Label text=""></Label>
		</ActionBar>
        <ScrollView orientation="vertical">
            <stack-layout>
               <card-view v-for="item in items" ripple="true" @tap="openLink(item.link)" height="100" marginRight="40" marginLeft="40" marginTop="40"  marginBottom="0" elevation="30" radius="10">-->
                    <stack-layout >
                        <label class="m-x-20 m-y-20" :text="item.text"></label>
                    </stack-layout>
                </card-view>
            </stack-layout>
        </ScrollView>
    </Page>
</template>

<script>
    const timerModule = require("tns-core-modules/timer");

    export default {
    data: () => {
        return {
            timerId: null,
            items : [
                {
                    text: 'Beantworte mir eine Frage 1',
                    link: 'yo1'
                }
            ]
        };
    },
    methods: {
        onPageLoaded() {
            this.timerId = timerModule.setInterval(() => {
                if (this.items.length < 3) {
                    this.items.push({
                                        text: 'Beantworte mir eine Frage ' + this.items.length,
                                        link: 'yo' + this.items.length
                                    });
                } else {
                    timerModule.clearInterval(this.timerId);
                }
            }, 10000);
        },
        openLink(_link) {
            console.log("tappi", _link);
        }
    }
}
</script>

<style lang="scss" scoped>
// Start custom common variables
@import "~@nativescript/theme/scss/variables/blue";
// End custom common variables

// Custom styles
</style>
