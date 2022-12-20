import { BaseRender } from "../../render/BaseRender";
import { StaticFlag } from "../../Sprite3D";
import { BVHSpatial } from "../bvh/BVHSpatial";
import { BVHRenderBox } from "./BVHRenderSpatialBox";

export class BVHRenderSpatial extends BVHSpatial {
    /**
     * Override it
     * @returns 
     */
    protected _creatChildNode(): BVHRenderBox<BaseRender> {
        return new BVHRenderBox<BaseRender>(this._BVHManager, this._BVHConfig);
    }
    
    /**
     * 是否合法
     * @param cell 
     * @returns 
     */
    cellLegal(cell: BaseRender): boolean {
        if (cell.renderNode.staticMask == StaticFlag.StaticBatch&&super.cellLegal(cell))
            return true;
        return false;
    }
}