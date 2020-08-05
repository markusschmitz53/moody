import { Observable } from 'tns-core-modules/data/observable';
import * as simpleLibsodium from 'nativescript-simple-libsodium';
const application = require("tns-core-modules/application");
const appSettings = require("tns-core-modules/application-settings");
const SecureStorage = require("nativescript-secure-storage").SecureStorage;

export default class JaneService extends Observable {

    constructor() {
        super();
        this.isAuthenticated = false;
        this.lastUsedExpression = {};
        this.simpleLibsodium = new simpleLibsodium.SimpleLibsodium();
        this.key = this.simpleLibsodium.generateKeyWithSuppliedString("x921x44=18120-jf", 32);
        this._secureStorage = new SecureStorage();
    }

    encrypt(_mixedEncrypt) {
        if (typeof _mixedEncrypt === 'object') {
            _mixedEncrypt = JSON.stringify(_mixedEncrypt);
        }

        let enc = this.simpleLibsodium.AEDEncrypt(2, _mixedEncrypt, this.key.raw);
        return enc;
    }

    decrypt(_encryptedObject) {
        let decoded = this.simpleLibsodium.AEDDecrypt(2, _encryptedObject.rawCrypted, this.key.raw, _encryptedObject.rawNonce);

        try {
            decoded = JSON.parse(decoded.string);
        } catch (_error) {
            decoded = decoded.string;
        }
        return decoded;
    }

    getSecret(_key) {
        var success = this._secureStorage.setSync({
                                                      key  : this.key,
                                                      value: 1234
                                                  });

        this._secret = this._secureStorage.getSync({
                                                       key: this.key
                                                   });
    }

    graspSituation() {
        console.log("grasping");
        this.getSecret();
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

    authenticate(_key) {
        if (!appSettings.getBoolean('isAuthenticated')) {
            appSettings.setBoolean('isAuthenticated', true);

            application.android.on(application.AndroidApplication.saveActivityStateEvent, function () {
                appSettings.setBoolean('isAuthenticated', false);
            });

            application.android.on(application.AndroidApplication.activityStoppedEvent, function () {
                appSettings.setBoolean('isAuthenticated', false);
            });

            application.android.on(application.AndroidApplication.activityDestroyedEvent, function () {
                appSettings.setBoolean('isAuthenticated', false);
            });
        }

        return true;
    }

    personIsAuthenticated() {
        let enc = this.simpleLibsodium.SHA2Hash("MyPassword", 512); // or 256
        //console.dir(JSON.stringify(enc));
        return appSettings.getBoolean('isAuthenticated');
    }


}
