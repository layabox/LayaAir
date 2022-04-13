import { EventDispatcher } from "../../../events/EventDispatcher";
import { Vector2 } from "../../math/Vector2";

/**
 * 类用来描述gamepad Axis
 */
export class AxiGamepad extends EventDispatcher {
    static EVENT_OUTPUT: string = "outputAxi_id";
    /**
     * 轴设备名字
     */
    public handness: string;
    /**
     * 轴数量
     */
    public axisLength: number;
    /**
     * axis Array
     */
    private axisData: Array<Vector2> = new Array();

    /**
     * 类用于创建轴数据
     * @internal
     * @param handness 轴设备名字
     * @param length 轴数量
     */
    constructor(handness: string, length: number) {
        super();
        this.handness = handness;
        this.axisData.length = length;
        this.axisLength = length;
    }

    /**
     * @internal
     * @param padGameAxi 轴数据
     */
    update(padGameAxi: any) {
        for (let i = 0, j = 0; i < padGameAxi.axes.length; i += 2, ++j) {
            if (!this.axisData[j])
                this.axisData[j] = new Vector2();
            this.axisData[j].setValue(padGameAxi.axes[i], padGameAxi.axes[i + 1]);
            this.outPutStickValue(this.axisData[j], j);
        }
    }

    /**
     * 派发轴事件
     * @internal
     * @param value 
     * @param index 
     */
    outPutStickValue(value: Vector2, index: number) {
        const eventnam = AxiGamepad.EVENT_OUTPUT + index.toString();
        this.event(eventnam, [value]);
    }

    /**
     * destroy
     */
    destroy() {
        for (let i = 0; i < this.axisLength; i++) {
            let eventname = AxiGamepad.EVENT_OUTPUT + i.toString();
            this.offAll(eventname);
        }
    }

}