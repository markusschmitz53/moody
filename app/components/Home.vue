<template lang="html">
    <Page @navigatingTo="onPageLoaded" actionBarHidden="true">
        <ScrollView class="m-t-30" orientation="vertical">
            <stack-layout>
               <card-view v-for="item in items" v-bind:data="item" v-bind:key="item.link" ripple="true" @tap="openLink($event, item)" height="60" marginRight="40" marginLeft="40" marginTop="40"  marginBottom="0" elevation="30" radius="10">-->
                    <stack-layout id="stack">
                        <label id="stack-text" opacity="1" class="m-x-20 m-y-20" :text="item.text"></label>
                        <label id="stack-question" opacity="0" class="m-x-20 m-y-20" :text="item.question"></label>
                        <TextField @returnPress="onReturnpress($event, item)" id="stack-question-field" opacity="0" class="m-x-20 m-y-20" visibility="collapsed" hint="Hier kannst du deinen Namen eingeben"></TextField>
                    </stack-layout>
                </card-view>
            </stack-layout>
        </ScrollView>
    </Page>
</template>

<script>
    const timerModule = require("tns-core-modules/timer");
    import Question from './Question';

    export default {
    data: () => {
        return {
            timerId: null,
            page: null,
            items : [],
            currentObject: null
        };
    },
    methods: {
        onReturnpress(event, item) {

        },
        onPageLoaded(_event) {
            this.page = _event.object.page;
            this.timerId = timerModule.setInterval(() => {
                if (this.items.length < 1) {
                    this.items.push({
                                        text: 'Beantwortest du mir eine Frage?',
                                        question: 'Wie heißt du?'
                                    });
                } else {
                    timerModule.clearInterval(this.timerId);
                }
            }, 1000);
        },
        showQuestion(_object, _animationDuration) {
            if (!_object || typeof _object.animate !== 'function') {
                throw new Error('Invalid object passed to showQuestion()');
            }

            let page = this.page;
            this.currentObject = _object;
            this.currentObject.animate({height: 150, duration: _animationDuration});
            this.page.getViewById('stack-text').animate({opacity: 0, duration: _animationDuration}).then(function () {
                page.getViewById('stack-text').visibility = "collapsed";
                page.getViewById('stack-question').visibility = "visible";
                page.getViewById('stack-question-field').visibility = "visible";
                page.getViewById('stack-question').animate({opacity: 1, duration: _animationDuration});
                page.getViewById('stack-question-field').animate({opacity: 1, duration: _animationDuration});
            });
        },
        hideQuestion(_object, _animationDuration) {
            if (!_object || typeof _object.animate !== 'function') {
                throw new Error('Invalid object passed to hideQuestion()');
            }

            let page = this.page;

            _object.animate({height: 60, duration: _animationDuration});
            this.page.getViewById('stack-question').animate({
                                                                opacity : 0,
                                                                duration: _animationDuration
                                                            }).then(function () {
                page.getViewById('stack-question').visibility = "collapsed";
                page.getViewById('stack-question-field').visibility = "collapsed";
                page.getViewById('stack-text').visibility = "visible";
                page.getViewById('stack-text').animate({opacity: 1, duration: _animationDuration});
            });
            this.currentObject = null;
        },
        openLink(_event, _item) {
            let index = this.items.indexOf(_item);
            let animationDuration = 500;
            if (index > -1) {
                if (!this.items[index].isFullscreen) {
                    this.items[index].isFullscreen = true;
                    this.showQuestion(_event.object, animationDuration)
                }
                else {
                    this.items[index].isFullscreen = false;
                    this.hideQuestion(_event.object, animationDuration);
                }
            }
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
