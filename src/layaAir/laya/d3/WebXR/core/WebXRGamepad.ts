import { Vector2 } from "laya/d3/math/Vector2";
import { EventDispatcher } from "laya/events/EventDispatcher";

export class AxiGamepad extends EventDispatcher {
    static EVENT_OUTPUT:string = "outputAxi_id";
    /**
     * The handness of the AxiGamepad
     */
     public handness: string;
     
     public axisData:Array<Vector2> = new Array();

     public axisLength:number;
    
    
    constructor(handness:string,length:number) {
        super();
        this.handness = handness;
        this.axisData.length = length;
        this.axisLength = length;
    }

    update(padGameAxi:any) {
        
        for (let i = 0, j = 0; i < padGameAxi.axes.length; i+=2, ++j) {
            if(!this.axisData[j])
                this.axisData[j] = new Vector2();
            this.axisData[j].setValue(padGameAxi.axes[i],padGameAxi.axes[i+1]);
            this.outPutStickValue(this.axisData[j],j);
        }
        
    }

    outPutStickValue(value:Vector2,index:number) {
        const eventnam = AxiGamepad.EVENT_OUTPUT+index.toString();
        this.event(eventnam,[value]);
    }

    destroy() {
        for(let i = 0;i<this.axisLength;i++){
            let eventname = AxiGamepad.EVENT_OUTPUT+i.toString();
            this.offAll(eventname);
        }
    }
}

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

    lastTouch: boolean = false;
    lastPress: boolean = false;
    lastPressValue: number = 0;

    touch: boolean = false;
    press: boolean = false;
    pressValue: number = 0;


    constructor(handness: string, index: number) {
        super();
        this.handness = handness;
        this.index = index;
    }

    /**
     * GamePadButton
     */
    update(padButton:any) {
        //set Data
        this.lastTouch = this.touch;
        this.lastPress = this.press;
        this.lastPressValue = this.pressValue;
        this.touch = padButton.touched;
        this.press = padButton.pressed;
        this.pressValue = padButton.value;
        if(!this.lastTouch&&!this.touch){
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

    touchEnter() {
        this.event(ButtonGamepad.EVENT_TOUCH_ENTER);
    }

    touchStay() {
        this.event(ButtonGamepad.EVENT_TOUCH_STAY);
    }

    touchOut() {
        this.event(ButtonGamepad.EVENT_TOUCH_OUT);
    }

    pressEnter() {
        this.event(ButtonGamepad.EVENT_PRESS_ENTER);
    }

    pressStay() {
        this.event(ButtonGamepad.EVENT_PRESS_STAY);
    }

    pressOut() {
        this.event(ButtonGamepad.EVENT_PRESS_OUT);
    }

    outpressed() {
        this.event(ButtonGamepad.EVENT_PRESS_VALUE, [this.pressValue]);
    }

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