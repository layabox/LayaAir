import { Quaternion } from "laya/d3/math/Quaternion";
import { Ray } from "laya/d3/math/Ray";
import { Vector3 } from "laya/d3/math/Vector3";
import { EventDispatcher } from "laya/events/EventDispatcher";
import { AxiGamepad, ButtonGamepad } from "./WebXRGamepad";

export class WebXRInput extends EventDispatcher {
    static HANDNESS_LEFT: string = "left";
    static HANDNESS_RIGHT: string = "right";
    static tempQua: Quaternion = new Quaternion();

    private preButtonEventList:Array<any>=[];
    private preAxisEventList:Array<any>=[];
    /**
     * @internal
     */
    public _inputSource: any;//XRInputSource

    public lastXRPose: any;
    /**
     * handMode
     */
    public handness: string;
    /**
     * input Ray
     */
    public ray: Ray;
    /**
     * hand Pos
     */
    public position: Vector3;
    /**
     * hand Rotate
     */
    public rotation: Quaternion;
    /**
     * lastRayPos
     */
    public _lastXRPose:any;

    /**
     * gamepad Button info
     */
    public gamepadButton:Array<ButtonGamepad>;

    /**
     * gamepad axis Info
     */
    public gamepadAxis:AxiGamepad;

    constructor(handness: string,inputsource:any) {
        super();
        this.handness = handness;
        this.position = new Vector3();
        this.rotation = new Quaternion();
        this.ray = new Ray(new Vector3(), new Vector3());
       

    }

    _updateByXRPose(xrFrame:any, referenceSpace:any) {
        //updateRay
        const rayPose = xrFrame.getPose(this._inputSource.targetRaySpace, referenceSpace);
        this._lastXRPose = rayPose;
        if (rayPose) {
            const pos = rayPose.transform.position;
            const orientation = rayPose.transform.orientation;
            WebXRInput.tempQua.setValue(orientation.x, orientation.y, orientation.z, orientation.w);
            this.ray.origin.setValue(pos.x, pos.y, pos.z);
            Vector3.transformQuat(Vector3._UnitZ, WebXRInput.tempQua, this.ray.direction);
            Vector3.scale(this.ray.direction,-1,this.ray.direction);
        }
        //updateMesh
        if (this._inputSource.gripSpace) {
            let meshPose = xrFrame.getPose(this._inputSource.gripSpace, referenceSpace);
            if (meshPose) {
                const pos = meshPose.transform.position;
                const orientation = meshPose.transform.orientation;
                this.position.setValue(pos.x, pos.y, pos.z);
                this.rotation.setValue(orientation.x, orientation.y, orientation.z, orientation.w);
            }
        }
        this.event("frameXRInputUpdate", [this]);
        //handle gamepad
        this._handleProcessGamepad();
    }


    //与任何给定按钮相关的框在触摸时将变为绿色，按下时将变为红色。长方体高度也将根据按钮的值进行缩放，使其看起来像被按下的按钮。
    _handleProcessGamepad(){
         //axis init
         const gamepad = this._inputSource.gamepad;
         if(!this.gamepadAxis){
             this.gamepadAxis = new AxiGamepad(this.handness,gamepad.axes.length);
            //preEvent
            this.preAxisEventList.forEach(element => {
                this.gamepadAxis.on(element.eventnam,element.caller,element.listener);
            });
         }
         if(!this.gamepadButton){
             this.gamepadButton = [];
             for (let i = 0; i < gamepad.buttons.length; ++i) {
                 this.gamepadButton.push(new ButtonGamepad(this.handness,i));
             }    
             //preEvent
             this.preButtonEventList.forEach(element => {
                this.addButtonEvent(element.index,element.type,element.caller,element.listener);
            });
         }
        //axis
        this.gamepadAxis.update(gamepad);
        //button
        for (let i = 0; i < gamepad.buttons.length; ++i) {
            let button = this.gamepadButton[i];
            button.update(gamepad.buttons[i]);
        }
    }

    /**
     * button监听
     * @param index 
     * @param type 
     * @param caller 
     * @param listener 
     */
    addButtonEvent(index:number,type:string,caller: any, listener: Function){
        if(!this.gamepadButton){
            this.preButtonEventList.push({
                "index":index,
                "type":type,
                "caller":caller,
                "listener":listener
            });
        }else{
            let button = this.gamepadButton[index];    
            button.on(type,caller,listener);
        }        
    }

    /**
     * axis监听
     * @param index 
     * @param type 
     * @param caller 
     * @param listener 
     */
    addAxisEvent(index:number,type:string,caller: any, listener: Function){
        if(!this.gamepadAxis){
            this.preAxisEventList.push({
                "eventnam":type+index.toString(),
                "caller":caller,
                "listener":listener
            });
        }else{
            const eventnam = type+index.toString();
            this.gamepadAxis.on(eventnam,caller,listener);
        }
        
    }


    destroy(){

    }


}