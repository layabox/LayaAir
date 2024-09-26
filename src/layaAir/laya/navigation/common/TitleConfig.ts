import { Vector3 } from "../../maths/Vector3";


/**
 * @internal
 * @zh js向wasm 写入数据，内部使用；不对外开放。
 */
export class TitleConfig {
    tx: number;
    ty: number;
    bmin: number[];
    bmax: number[];
    agentHeight: number;
    agentRadius: number;
    agentMaxClimb: number;
    maxEdgeLen: number;
    maxSimplificationError: number;
    partitionType: any;
    constructor() {
        this.tx = 0;
        this.ty = 0;
        this.maxSimplificationError = 0.9;
        this.bmin = [0, 0, 0];
        this.bmax = [0, 0, 0];
    }

    /**
     * 设置Title序列
     * @param {*}
     * @return {*}
     */
    _setOff(tx: number, ty: number) {
        this.tx = tx;
        this.ty = ty;
    }


    /**
     * 设置包围盒最小值
     * @param {*}
     * @return {*}
     */
    _setMin(value: Vector3): void {
        this.bmin[0] = value.x;
        this.bmin[1] = value.y;
        this.bmin[2] = value.z;
    }

    /**
     *设置包围盒最大值
     */
    _setMax(value: Vector3): void {
        this.bmax[0] = value.x;
        this.bmax[1] = value.y;
        this.bmax[2] = value.z;
    }

    /**
     * 设置运行代理的参数
     * @param {number} height
     * @param {number} radius
     * @param {number} maxClimb
     */
    _setAgent(height: number, radius: number, maxClimb: number) {
        this.agentHeight = height;
        this.agentRadius = radius;
        this.agentMaxClimb = maxClimb;
    }

    /** 设置最大边长 */
    _setMaxEdgeLen(value: number) {
        this.maxEdgeLen = Math.ceil(value);
    }
}