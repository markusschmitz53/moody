const Vibrate = require("nativescript-vibrate").Vibrate;

export default class VibratorService {

    constructor() {
        this.vibrator = new Vibrate();
    }

    vibrate(_duration) {
        this.vibrator.vibrate(_duration);
    }
}
