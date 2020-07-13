<template lang="html">
    <Page @navigatingTo="onPageLoaded" actionBarHidden="true" class="m-t-30">
        <!--
        <ScrollView class="m-t-30" orientation="vertical">
            <stack-layout>
               <card-view v-for="item in items" v-bind:data="item" v-bind:key="item.link" ripple="true" @tap="openLink($event, item)" height="60" marginRight="40" marginLeft="40" marginTop="40"  marginBottom="0" elevation="30" radius="10">
                    <stack-layout id="stack">
                        <label id="stack-text" opacity="1" class="m-x-20 m-y-20" :text="item.text"></label>
                        <label id="stack-question" opacity="0" class="m-x-20 m-y-20" :text="item.question"></label>
                        <TextField @returnPress="onReturnpress($event, item)" id="stack-question-field" opacity="0" class="m-x-20 m-y-20" visibility="collapsed" hint="Hier kannst du deinen Namen eingeben"></TextField>
                    </stack-layout>
                </card-view>
            </stack-layout>
        </ScrollView>-->
    </Page>
</template>

<script>
    import LifeChartService from '~/LifeChart.service';

    const ChatView = require("nativescript-chatview");
	import JaneService from '~/Jane.service';
    const timerModule = require("tns-core-modules/timer");
	const app = require('tns-core-modules/application');

	const Jane = new JaneService();

    function getTime() {
        let now = new Date();
        let hours = now.getHours();
        return String(hours).padStart(2, '0') + ":" +  String(now.getMinutes()).padStart(2, '0');
    }

    export default {
        data   : () => {
            return {
                timerId      : null,
                page         : null,
                items        : [],
                chatview: null,
                currentObject: null
            };
        },
        methods: {
            onReturnpress(event, item) {

            },
            _conversationOutputCallback(_eventData) {
                if (!this.chatview) {
                    return;
                }

                this.chatview.appendMessages({
                                                date   : getTime(),
                                                isRight: false,
                                                image  : "res://user",
                                                message: _eventData.output,
                                            });
            },
            _conversationHumanInputCallback(_eventData) {
                if (!this.chatview) {
                    return;
                }

                this.chatview.appendMessages({
                                                date   : getTime(),
                                                isRight: false,
                                                image  : "res://user",
                                                message: _eventData.output,
                                            });
            },
            onPageLoaded(_event) {
                this.page = _event.object.page;
                let chatView = new ChatView.ChatView();
                chatView.typeMessageHint = '';

                this.chatview = chatView;

                Jane.on('JANE_CONVERSATION_OUTPUT', this._conversationOutputCallback);
                Jane.on('JANE_CONVERSATION_HUMANINPUT', this._conversationHumanInputCallback);
                Jane.startConversation();
                setTimeout(() => {

                }, 750);

                chatView.notifyOnSendMessageTap((eventData) => {
                    chatView.resetMessage();

                    // add a chat message
                    eventData.object.appendMessages({
                                                        date   : getTime(),
                                                        isRight: true,
                                                        image  : "res://user",
                                                        message: eventData.message,
                                                    });
                    eventData.scrollToBottom();

                    setTimeout(() => {
                        chatView.appendMessages({
                                                    date   : getTime(),
                                                    isRight: false,
                                                    image  : "res://user",
                                                    message: 'easy',
                                                });
                        chatView.typeMessageHint = '';
                        chatView.scrollToBottom();

                        if (Math.random() > 0.5) {
                            chatView.focusMessageField();
                        }
                    }, 1000);
                });

                // focus text field
                chatView.focusMessageField();

                this.page.content = chatView;

                this.timerId = timerModule.setInterval(() => {
                    if (this.items.length < 1) {
                        this.items.push({
                                            text    : 'Beantwortest du mir eine Frage?',
                                            question: 'Wie heißt du?'
                                        });
                    }
                    else {
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
                this.page.getViewById('stack-text').animate({
                                                                opacity : 0,
                                                                duration: _animationDuration
                                                            }).then(function () {
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
