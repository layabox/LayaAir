import { ICameraCullInfo } from "../../../../RenderEngine/RenderInterface/RenderPipelineInterface/ICameraCullInfo";
import { IShadowCullInfo } from "../../../../RenderEngine/RenderInterface/RenderPipelineInterface/IShadowCullInfo";
import { SingletonList } from "../../../../utils/SingletonList";
import { BoundFrustum } from "../../../math/BoundFrustum";
import { IBoundsCell } from "../../../math/IBoundsCell";
import { BVHSpatialBox } from "./BVHSpatialBox";
import { BVHSpatialConfig, BVHSpatialManager } from "./SpatialManager";

/**
 * BVH系统
 */
export class BVHSpatial {

    /**@internal */
    protected _BVHConfig: BVHSpatialConfig;

    /**@internal */
    protected _BVHManager: BVHSpatialManager;

    /**@internal */
    protected _BVHSpatialBox: BVHSpatialBox<IBoundsCell>;

    /**@internal */
    protected _isBuild: boolean = false;

    /**
     * Override it
     * @returns 
     */
    protected _creatChildNode(): BVHSpatialBox<IBoundsCell> {
        return new BVHSpatialBox<IBoundsCell>(this._BVHManager, this._BVHConfig);
    }

    /**
     * 创建BVH系统实例
     */
    constructor(bvhConfig: BVHSpatialConfig = null, bvhManager: BVHSpatialManager = null) {
        this._BVHConfig = bvhConfig ? bvhConfig : new BVHSpatialConfig();
        this._BVHManager = bvhManager ? bvhManager : new BVHSpatialManager();
        this._BVHSpatialBox = this._creatChildNode();
    }

    /**
     * 获得空间节点
     */
    get bvhSpatialBox(){
        return this._BVHSpatialBox;
    }

    /**
     * 是否合法
     * @param cell 
     * @returns 
     */
    cellLegal(cell: IBoundsCell): boolean {
        let extend = cell.bounds.getExtent();
        return this._BVHConfig.limit_size > (Math.max(extend.x, extend.y, extend.z) * 2);// too large is cant 
    }

    /**
     * add one
     * @param cell 
     */
    addOne(cell: IBoundsCell) {
        if (!this.cellLegal(cell)) {
            return false
        }
        if (this._isBuild) {
            let spatial = this._BVHSpatialBox.getNearlist(cell.bounds.getCenter());
            spatial.addCell(cell);
            this._BVHManager.updateBVHBoxList.add(spatial);
        } else {
            this._BVHSpatialBox.fillCell(cell);
        }
        return true;
    }

    /**
     * remove one
     * @param cell 
     * @returns 
     */
    removeOne(cell: IBoundsCell) {
        if (!this._BVHManager.bvhManager.has(cell.id)) {
            return false;
        }
        if (this._isBuild) {
            let spatial = this._BVHManager.bvhManager.get(cell.id);
            spatial.removeCell(cell);
            this._BVHManager.updateBVHBoxList.add(spatial);
        } else {
            this._BVHSpatialBox.fillRemove(cell);
        }
        return true;
    }

    /**
     * remove
     * @param cell 
     */
    motionOne(cell: IBoundsCell) {
        if (this._BVHSpatialBox.getNearlist(cell.bounds.getCenter()) == this._BVHManager.bvhManager.get(cell.id)) {
            return;
        } else {
            this.removeOne(cell);
            this.addOne(cell);
        }

    }

    /**
    * 通过CameraCull查找逻辑对象
    * @override
    * @param frustum 视锥
    * @param out 输出逻辑对象组
    */
    getItemByCameraCullInfo(cameraCullInfo: ICameraCullInfo, out: SingletonList<IBoundsCell>) {
        if (this._BVHManager.updateBVHBoxList.length > 0) {
            this.update();
        }
        if (this._isBuild) {
            this._BVHSpatialBox.getItemByCameraCullInfo(cameraCullInfo, out);
        } else {
            this._BVHSpatialBox.traverseBoundsCell(out);
        }
    }

    /**
     * 通过视锥查找逻辑对象
     * @override
     * @param frustum 视锥
     * @param out 输出逻辑对象组
     */
    getItemByFrustum(frustum: BoundFrustum, out: SingletonList<IBoundsCell>) {
        if (this._BVHManager.updateBVHBoxList.length > 0) {
            this.update();
        }
        if (this._isBuild) {
            this._BVHSpatialBox.getItemByFrustum(frustum, out);
        } else {
            this._BVHSpatialBox.traverseBoundsCell(out);
        }

    }

    /**
     * 通过阴影裁剪信息查找逻辑对象
     * @override 
     * @param sci
     * @param out 
     */
    getItemBySCI(sci: IShadowCullInfo, out: SingletonList<IBoundsCell>) {
        if (this._BVHManager.updateBVHBoxList.length > 0) {
            this.update();
        }
        if (this._isBuild) {
            this._BVHSpatialBox.getItemBySCI(sci, out);
        } else {
            this._BVHSpatialBox.traverseBoundsCell(out);
        }
    }

    /**
     * 帧循环，根据具体需求，选适合频率调用
     */
    update() {
        if (!this._isBuild) {//first build
            if (this._BVHManager.cellCount > this._BVHConfig.Min_BVH_Build_Nums) {
                this._BVHSpatialBox.recaculateBox();
                this._BVHSpatialBox.splitBox();//build
                this._BVHManager.updateBVHBoxList.remove(this._BVHSpatialBox);
                this._isBuild = true;
            }
            this._BVHManager.updateBVHBoxList.length = 0;
        } else {
            let list = this._BVHManager.updateBVHBoxList;
            for (let i = 0, n = list.length; i < n; i++) {
                let spatial = list.elements[i];
                spatial._boundchanged && spatial.recaculateBox();
                spatial.splitBox();
            }
            list.length = 0;
        }
    }

    /**
     * rebuild
     */
    rebuild() {
        if (this._isBuild) {//reBuild
            let out = new SingletonList<IBoundsCell>();
            this._BVHSpatialBox.traverseBoundsCell(out);
            this._BVHSpatialBox.destroy();
            this._BVHManager.clear();
            this._isBuild = false;
            this._BVHSpatialBox = this._creatChildNode();
            for (let i = 0, n = out.length; i < n; i++) {
                this.addOne(out.elements[i]);
            }
            this._BVHSpatialBox.recaculateBox();
            this._BVHSpatialBox.splitBox();//build
        }
    }

    /**
     * destroy
     */
    destroy() {
        this._BVHSpatialBox.destroy();
        this._BVHManager.destroy();
    }
}