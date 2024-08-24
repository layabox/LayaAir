import { IClone } from "../utils/IClone";


/**
 * @en Create Recast navMesh Config
 * @zh 创建 Recast 导航网格配置
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

    /**
     * @en Agent name
     * @zh 代理名称
     */
    agentName: string;

    /**
     * @en Cell height in meters
     * @zh 像素格子高度，单位：米
     */
    cellHeight: number = 0.3;

    /**
     * @en Maximum slope for the path in degrees
     * @zh 路径最大坡度，单位：角度
     */
    agentMaxSlope: number = 45;

    /**
     * @en Maximum height of the agent in meters
     * @zh 代理最大高度跨度，单位：米
     */
    agentHeight: number = 2;

    /**
     * @en Maximum climb height for the agent in meters
     * @zh 代理最大攀爬高度，单位：米
     */
    agentMaxClimb: number = 0.3;

    /**
     * @en Agent radius in meters
     * @zh 代理半径，单位：米
     */
    agentRadius: number = 0.2;

    /**
     * @en Number of cells per tile
     * @zh 每个瓦片的格子数量
     */
    tileSize: number = 32;

    /**
     * @en Cell size in meters
     * @zh 像素格子尺寸，单位：米
     */
    set cellSize(value: number) {
        this._cellSize = value;
        this._dirtyFlag++;
    }

    get cellSize(): number {
        return this._cellSize;
    }

    /** @ignore */
    constructor() {

    }

    /**
     * @en Clone the RecastConfig object
     * @returns A new RecastConfig object with the same properties
     * @zh 克隆 RecastConfig 对象
     * @returns 具有相同属性的新 RecastConfig 对象
     */
    clone(): RecastConfig {
        let data = new RecastConfig();
        this.cloneTo(data);
        return data;
    }
    /**
     * @en Clone properties to another object
     * @param destObject The target object to clone to
     * @zh 将属性克隆到另一个对象
     * @param destObject 要克隆到的目标对象
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
