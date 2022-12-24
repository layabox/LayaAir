import { EventDispatcher } from "../../../events/EventDispatcher";
import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { Ray } from "../../math/Ray";
import { ButtonGamepad, AxiGamepad } from "./WebXRGamepad";


/**
 * @author miner
 * 类用来描述输入设备
 */
export class WebXRInput extends EventDispatcher {
    static HANDNESS_LEFT: string = "left";
    static HANDNESS_RIGHT: string = "right";
    static EVENT_FRAMEUPDATA_WEBXRINPUT: string = "frameXRInputUpdate";
    private static tempQua: Quaternion = new Quaternion();
    /**
     * 预处理Button事件
     */
    private preButtonEventList: Array<any> = [];
    /**
     * 预处理axis事件
     */
    private preAxisEventList: Array<any> = [];
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
    public _lastXRPose: any;

    /**
     * gamepad Button info
     */
    public gamepadButton: Array<ButtonGamepad>;

    /**
     * gamepad axis Info
     */
    public gamepadAxis: AxiGamepad;

    constructor(handness: string) {
        super();
        this.handness = handness;
        this.position = new Vector3();
        this.rotation = new Quaternion();
        this.ray = new Ray(new Vector3(), new Vector3());
    }

    /**
     * 更新XRInput数据
     * @internal
     * @param xrFrame WebXR帧数据
     * @param referenceSpace 参考空间
     */
    _updateByXRPose(xrFrame: any, referenceSpace: any) {
        //updateRay
        const rayPose = xrFrame.getPose(this._inputSource.targetRaySpace, referenceSpace);
        this._lastXRPose = rayPose;
        if (rayPose) {
            const pos = rayPose.transform.position;
            const orientation = rayPose.transform.orientation;
            WebXRInput.tempQua.setValue(orientation.x, orientation.y, orientation.z, orientation.w);
            this.ray.origin.setValue(pos.x, pos.y, pos.z);
            Vector3.transformQuat(Vector3.UnitZ, WebXRInput.tempQua, this.ray.direction);
            Vector3.scale(this.ray.direction, -1, this.ray.direction);
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
        this.event(WebXRInput.EVENT_FRAMEUPDATA_WEBXRINPUT, [this]);
        //handle gamepad
        this._handleProcessGamepad();
    }


    /**
     * handle gamepad Event
     */
    private _handleProcessGamepad() {
        //axis init
        const gamepad = this._inputSource.gamepad;
        if (!this.gamepadAxis) {
            this.gamepadAxis = new AxiGamepad(this.handness, gamepad.axes.length);
            //preEvent
            this.preAxisEventList.forEach(element => {
                this.gamepadAxis.on(element.eventnam, element.caller, element.listener);
            });
        }
        if (!this.gamepadButton) {
            this.gamepadButton = [];
            for (let i = 0; i < gamepad.buttons.length; ++i) {
                this.gamepadButton.push(new ButtonGamepad(this.handness, i));
            }
            //preEvent
            this.preButtonEventList.forEach(element => {
                this.addButtonEvent(element.index, element.type, element.caller, element.listener);
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
     * add button event
     * @param index button索引
     * @param type 事件类型
     * @param caller 事件侦听函数的执行域。
     * @param listener 事件侦听函数。
     */
    addButtonEvent(index: number, type: string, caller: any, listener: Function) {
        if (!this.gamepadButton) {
            this.preButtonEventList.push({
                "index": index,
                "type": type,
                "caller": caller,
                "listener": listener
            });
        } else {
            let button = this.gamepadButton[index];
            button.on(type, caller, listener);
        }
    }

    /**
     * add axis event
     * @param index axis索引
     * @param type 事件类型
     * @param caller 事件侦听函数的执行域。
     * @param listener 事件侦听函数。
     */
    addAxisEvent(index: number, type: string, caller: any, listener: Function) {
        if (!this.gamepadAxis) {
            this.preAxisEventList.push({
                "eventnam": type + index.toString(),
                "caller": caller,
                "listener": listener
            });
        } else {
            const eventnam = type + index.toString();
            this.gamepadAxis.on(eventnam, caller, listener);
        }
    }

    /**
     * remove axis event
     * @param index axis索引
     * @param type 事件类型
     * @param caller 事件侦听函数的执行域。
     * @param listener 事件侦听函数。
     */
    offAxisEvent(index: number, type: string, caller: any, listener: Function) {
        if (this.gamepadAxis) {
            const eventnam = type + index.toString();
            this.gamepadAxis.off(eventnam, caller, listener);
        }
    }

    /**
     * remove Button event
     * @param index axis索引
     * @param type 事件类型
     * @param caller 事件侦听函数的执行域。
     * @param listener 事件侦听函数。
     */
    offButtonEvent(index: number, type: string, caller: any, listener: Function) {
        if (this.gamepadButton) {
            let button = this.gamepadButton[index];
            button.off(type, caller, listener);
        }
    }

    /**
     * 销毁
     */
    destroy() {
        this.preButtonEventList = null;
        this.ray = null;
        this.position = null;
        this.rotation = null;
        this.gamepadAxis.destroy();
        this.gamepadButton.forEach(element => {
            element.destroy();
        });
    }
}