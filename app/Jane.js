import * as simpleLibsodium from 'nativescript-simple-libsodium';
import {Observable} from '@nativescript/core';

const application = require("tns-core-modules/application");
const SecureStorage = require("nativescript-secure-storage").SecureStorage;
const STATE_IDLE = 0;
const STATE_THINKING = 1;


export default {
    install(Vue, options) {
        Vue.Jane = new Jane();
    }
}

class Jane extends Observable {
    constructor() {
        super();

        this.currentState = STATE_IDLE;
        this.lastUsedExpression = {};

        this._simpleLibsodium = new simpleLibsodium.SimpleLibsodium();
        this._key = this._simpleLibsodium.generateKeyWithSuppliedString('x921x44=18120-jf', 32);
        this._secureStorage = new SecureStorage();

        this.EVENT_THINKING_START = 'thinking_start';
        this.EVENT_THINKING_STOP = 'thinking_stop';
        this.EVENT_MISSING_SECRET = 'missing_secret';
        this.EVENT_AUTHENTICATED = 'authenticated';
        this.EVENT_UNAUTHENTICATED = 'unauthenticated';
    }

    encrypt(_mixedEncrypt) {
        if (typeof _mixedEncrypt === 'object') {
            _mixedEncrypt = JSON.stringify(_mixedEncrypt);
        }

        let enc = this._simpleLibsodium.AEDEncrypt(2, _mixedEncrypt, this._key.raw);
        return enc;
    }

    decrypt(_encryptedObject) {
        let decoded = this._simpleLibsodium.AEDDecrypt(2, _encryptedObject.rawCrypted, this._key.raw, _encryptedObject.rawNonce);

        try {
            decoded = JSON.parse(decoded.string);
        } catch (_error) {
            decoded = decoded.string;
        }
        return decoded;
    }

    setSecret(_key) {
        let base64hash = this.base64encode(this._simpleLibsodium.passwordHash(_key));
        let success = this._secureStorage.setSync({
                                                      key  : 'secret',
                                                      value: base64hash
                                                  });

        if (success) {
            this.graspSituation();
        }

        return success;
    }

    getSecret() {
        let secret = this._secureStorage.getSync({
                                                     key: 'secret',
                                                 });

        if (!secret) {
            this.notify({
                            eventName: this.EVENT_MISSING_SECRET
                        });
            return false;
        }

        this._secret = this.base64decode(secret);
        return true;
    }

    graspSituation() {
        this.forgetAuthentication();

        if (!this.getSecret()) {
            return;
        }

        if (!this.personIsAuthenticated()) {
            this.notify({
                            eventName: this.EVENT_UNAUTHENTICATED
                        });
        }
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
            case 'updatedit':
                expressions = ['Die Änderungen habe ich mir gemerkt.', 'Die Änderungen sind angekommen, danke.', 'Alles klar, danke.'];
                break;
            case 'rememberedIt':
                expressions = ['Hab\'s mir gemerkt', 'Ist gespeichert', 'Danke dir'];
                break;
        }

        let expression = _expression;

        if (expressions.length > 0) {
            do {
                expression = expressions[Math.floor(Math.random() * expressions.length)];
            } while (this.lastUsedExpression[_expression] === expression);

            this.lastUsedExpression[_expression] = expression;
        }

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

    base64encode(_var) {
        if (typeof _var === 'object') {
            _var = JSON.stringify(_var);
        }

        const text = new java.lang.String(_var);
        const data = text.getBytes('UTF-8');
        return android.util.Base64.encodeToString(data, android.util.Base64.DEFAULT);
    }

    base64decode(_var) {
        let data = android.util.Base64.decode(_var, android.util.Base64.DEFAULT);
        let decodedString = new java.lang.String(data, java.nio.charset.StandardCharsets.UTF_8);
        return JSON.parse(decodedString);
    }

    forgetAuthentication() {
        new SecureStorage().setSync({
                                  key  : 'isAuthenticated',
                                  value: '0'
                              });
    }

    authenticate(_key) {
        this.currentState = STATE_THINKING;
        this.notify({
                            eventName: this.EVENT_THINKING_START
                        });

        if (!this._secret) {
            // TODO: better way of handling this situation ...
            return;
            throw new Error('Person has no secret');
        }

        if (!this.personIsAuthenticated()) {
            if (!this._simpleLibsodium.passwordHashVerify(this._secret.plainHash, _key)) {
                return false;
            }

            let success = this._secureStorage.setSync({
                                            key : 'isAuthenticated',
                                            value: '1'
                                        });

            if (success) {
                this.notify({
                                eventName: this.EVENT_AUTHENTICATED,
                                object   : this
                            });

                application.android.on(application.AndroidApplication.saveActivityStateEvent, this.forgetAuthentication);
                application.android.on(application.AndroidApplication.activityStoppedEvent, this.forgetAuthentication);
                application.android.on(application.AndroidApplication.activityDestroyedEvent, this.forgetAuthentication);
            }
        }

        this.notify({
                            eventName: this.EVENT_THINKING_STOP
                        });
        this.currentState = STATE_IDLE;
        return true;
    }

    isThinking() {
        return (this.currentState === STATE_THINKING);
    }

    personIsAuthenticated() {
        //let enc = this.simpleLibsodium.SHA2Hash("MyPassword", 512); // or 256
        return (this._secureStorage.getSync({
                                                key: 'isAuthenticated'
                                            }) === '1');
    }
}
