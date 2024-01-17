import { Vector3 } from "../../../maths/Vector3";

/**
 * @internal
 * 写入三角形数据；用于生成tile
 */
export class TitleConfig {
    tx: number;
    ty: number;
    bmin: number[];
    bmax: number[];
    agentHeight: number;
    agentRadius: number;
    agentMaxClimb: number;
    partitionType: any;
    constructor() {
        this.tx = 0;
        this.ty = 0;
        this.bmin = [0, 0, 0];
        this.bmax = [0, 0, 0];
    }


    /**
     * 设置Title序列
     * @param {*}
     * @return {*}
     */
    public setOff(tx: number, ty: number) {
        this.tx = tx;
        this.ty = ty;
    }


    /**
     * 设置包围盒最小值
     * @param {*}
     * @return {*}
     */
    public setMin(value: Vector3): void {
        this.bmin[0] = value.x;
        this.bmin[1] = value.y;
        this.bmin[2] = value.z;
    }

    /**
     *设置包围盒最大值
     */
    public setMax(value: Vector3): void {
        this.bmax[0] = value.x;
        this.bmax[1] = value.y;
        this.bmax[2] = value.z;
    }

    public setAgent(height: number, radius: number, maxClimb: number) {
        this.agentHeight = height;
        this.agentRadius = radius;
        this.agentMaxClimb = maxClimb;
    }

}