import { EventDispatcher } from "../../../events/EventDispatcher";

/**
 * 类用来描述gamepad Button
 */
 export class ButtonGamepad extends EventDispatcher {
    static EVENT_TOUCH_ENTER: string = "touchEnter";
    static EVENT_TOUCH_STAY: string = "touchStay";
    static EVENT_TOUCH_OUT: string = "touchOut";
    static EVENT_PRESS_ENTER: string = "pressEnter";
    static EVENT_PRESS_STAY: string = "pressStay";
    static EVENT_PRESS_OUT: string = "pressOut";
    static EVENT_PRESS_VALUE: string = "outpressed";

    /**
     * The id of the gamepad
     */
    public handness: string;
    /**
    * The index of the gamepad
    */
    public index: number;

    /**
     * front touch state
     */
    private lastTouch: boolean = false;
    private lastPress: boolean = false;
    private lastPressValue: number = 0;

    /**
     * current touch state
     */
    private touch: boolean = false;
    private press: boolean = false;
    private pressValue: number = 0;


    /**
     * 类用于创建Button对象
     * @param handness 设备名称
     * @param index button缩影
     */
    constructor(handness: string, index: number) {
        super();
        this.handness = handness;
        this.index = index;
    }

    /**
     * @internal
     * GamePadButton update
     */
    update(padButton: any) {
        //set Data
        this.lastTouch = this.touch;
        this.lastPress = this.press;
        this.lastPressValue = this.pressValue;
        this.touch = padButton.touched;
        this.press = padButton.pressed;
        this.pressValue = padButton.value;
        if (!this.lastTouch && !this.touch) {
            return;
        }
        if (this.lastTouch != this.touch && this.touch) {
            this.touchEnter();
        } else if (this.lastTouch == this.touch && this.touch) {
            this.touchStay();
        } else if (this.lastTouch != this.touch && !this.touch) {
            this.touchOut();
        }
        if (this.lastPress != this.press && this.press) {
            this.pressEnter();
        } else if (this.lastPress == this.press && this.press) {
            this.pressStay();
        } else if (this.lastPress != this.press && !this.press) {
            this.pressOut();
        }
        if (this.touch) {
            this.outpressed();
        }
    }

    /**
     * @internal
     * event touch enter
     */
    private touchEnter() {
        this.event(ButtonGamepad.EVENT_TOUCH_ENTER);
    }

    /**
     * @internal
     * event touch Stay
     */
    private touchStay() {
        this.event(ButtonGamepad.EVENT_TOUCH_STAY);
    }

    /**
     * @internal
     * event touch Out
     */
    private touchOut() {
        this.event(ButtonGamepad.EVENT_TOUCH_OUT);
    }

    /**
     * @internal
     * event press enter
     */
    private pressEnter() {
        this.event(ButtonGamepad.EVENT_PRESS_ENTER);
    }

    /**
     * @internal
     * event press Stay
     */
    private pressStay() {
        this.event(ButtonGamepad.EVENT_PRESS_STAY);
    }

    /**
     * @internal
     * event press Out
     */
    private pressOut() {
        this.event(ButtonGamepad.EVENT_PRESS_OUT);
    }

    /**
     * @internal
     * event press value
     */
    private outpressed() {
        this.event(ButtonGamepad.EVENT_PRESS_VALUE, [this.pressValue]);
    }

    /**
     * destroy
     */
    destroy() {
        this.offAll(ButtonGamepad.EVENT_PRESS_ENTER);
        this.offAll(ButtonGamepad.EVENT_PRESS_STAY);
        this.offAll(ButtonGamepad.EVENT_PRESS_OUT);
        this.offAll(ButtonGamepad.EVENT_PRESS_ENTER);
        this.offAll(ButtonGamepad.EVENT_PRESS_STAY);
        this.offAll(ButtonGamepad.EVENT_PRESS_OUT);
        this.offAll(ButtonGamepad.EVENT_PRESS_VALUE);
    }
}