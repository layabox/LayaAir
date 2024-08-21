import { EventDispatcher } from "../../../events/EventDispatcher";
import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { Ray } from "../../math/Ray";
import { ButtonGamepad, AxiGamepad } from "./WebXRGamepad";


/**
 * @en The `WebXRInput` class is used to describe input devices for WebXR.
 * @zh `WebXRInput` 类用来描述 WebXR 的输入设备。
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

    /**
     * @en The last XR pose data.
     * @zh 上一次的 XR 姿态数据。
     */
    public lastXRPose: any;
    /**
     * @en The handness of the device, "left" or "right".
     * @zh 设备名称，"left" 或 "right"。
     */
    public handness: string;
    /**
     * @en The input ray representing the direction of the hand or controller.
     * @zh 表示手或控制器方向的输入射线。
     */
    public ray: Ray;
    /**
     * @en The position of the hand or controller.
     * @zh 手或控制器的位置。
     */
    public position: Vector3;
    /**
     * @en The rotation of the hand or controller.
     * @zh 手或控制器的旋转。
     */
    public rotation: Quaternion;
    /**
     * @en The last position of the input ray.
     * @zh 输入射线的上一个位置。
     */
    public _lastXRPose: any;

    /**
     * @en Information about the gamepad buttons.
     * @zh 游戏手柄按钮的信息。
     */
    public gamepadButton: Array<ButtonGamepad>;

    /**
     * @en Information about the gamepad axes.
     * @zh 游戏手柄轴的信息。
     */
    public gamepadAxis: AxiGamepad;

    /**
     * @ignore
     * @en Creates a new instance of the `WebXRInput` class.
     * @param handness  The handness of the device, "left" or "right".
     * @zh 创建 `WebXRInput` 类的新实例。
     * @param handness 设备名称，"left" 或 "right"。
     */
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
     * @en Adds an event listener for a gamepad button.
     * @param index The index of the button.
     * @param type The type of event.
     * @param caller The execution scope of the event listener function.
     * @param listener The event listener function.
     * @zh 为游戏手柄按钮添加事件侦听器
     * @param index 按钮索引。
     * @param type 事件类型。
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
     * @en Adds an event listener for a gamepad axis.
     * @param index The index of the axis.
     * @param type The type of event.
     * @param caller The execution scope of the event listener function.
     * @param list ener The event listener function.
     * @zh 为游戏手柄轴添加事件侦听器。
     * @param index 轴索引。
     * @param type 事件类型。
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
     * @en Removes an event listener for a gamepad axis.
     * @param index The index of the axis.
     * @param type The type of event.
     * @param caller The execution scope of the event listener function.
     * @param listener The event listener function.
     * @zh 移除游戏手柄轴的事件侦听器。
     * @param index 轴索引。
     * @param type 事件类型。
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
     * @en Removes an event listener for a gamepad button.
     * @param index The index of the button.
     * @param type The type of event.
     * @param caller The execution scope of the event listener function.
     * @param listener The event listener function.
     * @zh 移除游戏手柄按钮的事件侦听器
     * @param index 按钮索引。
     * @param type 事件类型。
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
     * @en Destroys and cleans up the WebXR input instance.
     * @zh 销毁并清理 WebXR 输入实例。
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