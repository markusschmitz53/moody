import { Observable } from 'tns-core-modules/data/observable';

export default class JaneService extends Observable {

    constructor() {
        super();
    }

    graspSituation() {
        console.log("test");
    }

    say(_expression) {
        let expressions = [];

        switch(_expression) {
            case 'hi':
                expressions = ['Hi', 'Hey', 'Moin', 'Guten Tag'];
                break;
            case 'niceToMeetYou':
                expressions = ['Schön dich kennen zu lernen', 'Freut mich dich kennen zu lernen'];
                break;
            case 'myNameIs':
                expressions = ['Ich bin Jane'];
                break;
            case 'askForName':
                expressions = ['Wie soll ich dich nennen'];
                break;
            case 'doThatLater':
                expressions = ['Machen wir später', 'Das erledigen wir später.'];
                break;
            case 'thanks':
                expressions = ['Danke'];
                break;
            case 'gotit':
                expressions = ['Alles klar', 'In Ordnung'];
                break;
        }

        let expression = _expression;

        if (expressions.length > 0)
            expression = expressions[Math.floor(Math.random() * expressions.length)];

        return expression;
    }

    startConversation() {
        this._conversation = {
            actions: [
                {
                    say  : this.say('hi') + '! ' + this.say('myNameIs') + '.',
                    delay: 3
                },
                {
                    say : this.say('niceToMeetYou') + '.',
                    delay: 3
                },
                {
                    say : this.say('askForName') + '?'
                },
                {
                    ask: {
                        timeout          : 30,
                        timeoutReply     : this.say('gotit') + '. ' + this.say('doThatLater'),
                        notNowReply      : this.say('doThatLater'),
                        answerReply      : this.say('thanks'),
                        interfaceElements: [
                            'textfield',
                            'notnowbutton'
                        ]
                    }
                }
            ]
        };

        this.currentConversationPart = 0;
        this.continueConversation();
    }

    getCurrentConversationOutput() {

    }

    continueConversation() {
        let currentAction,
            actions = this._conversation.actions;

        for (let i = 0; i < actions.length; i++) {
            currentAction = actions[i];
            if (currentAction.say) {
                this.notify({
                                eventName: "JANE_CONVERSATION_OUTPUT",
                                output: actions[i].say,
                                delay: actions[i].delay
                            });
            }
            else if (currentAction.ask) {
                console.log("ask");
            }
        }

        ++this.currentConversationPart;
    }
}
