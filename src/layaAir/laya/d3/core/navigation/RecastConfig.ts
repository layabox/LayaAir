import { IClone } from "../../../utils/IClone";

/**
 * create Recast navMesh Config
 */
export class RecastConfig implements IClone {

    /**
     * @internal
     *内部标记；用于记录数据是否有变化需要重新生成
     */
    _dirtyFlag: number = 0;

    /**
     * @internal
     *像素格子尺寸 单位/m
     */
    _cellSize: number = 0.2;

    /**name */
    agentName: string;

    /**像素格子高度 单位/m */
    cellHeight: number = 0.3;

    /**路径最大坡度 单位/角度 */
    agentMaxSlope: number = 45;

    /**路径最大高度跨度 单位/m */
    agentHeight: number = 2;

    /**路径最大高度 单位/m */
    agentMaxClimb: number = 0.3;

    /**代理半径 单位/m */
    agentRadius: number = 0.2;

    /**每个tile的格子数量 单位/个 */
    tileSize: number = 32;

    /**
     * 像素格子尺寸 单位/m
     */
    set cellSize(value: number) {
        this._cellSize = value;
        this._dirtyFlag++;
    }

    get cellSize(): number {
        return this._cellSize;
    }

    constructor() {

    }

    /**
    * clone
    * @returns 
    */
    clone(): RecastConfig {
        let data = new RecastConfig();
        this.cloneTo(data);
        return data;
    }
    /**
    * 克隆。
    * @param	destObject 克隆源。
    */
    cloneTo(destObject: any): void {
        var data: RecastConfig = (<RecastConfig>destObject);
        data.agentName = this.agentName;
        data.cellSize = this.cellSize;
        data.cellHeight = this.cellHeight;
        data.agentMaxSlope = this.agentMaxSlope;
        data.agentHeight = this.agentHeight;
        data.agentMaxClimb = this.agentMaxClimb;
        data.agentRadius = this.agentRadius;
        data.tileSize = this.tileSize;
    }
}
