import { Camera } from "../d3/core/Camera";
import { BaseRender } from "../d3/core/render/BaseRender";
import { Scene3D } from "../d3/core/scene/Scene3D";
import { Sprite3D } from "../d3/core/Sprite3D";
import { Bounds } from "../d3/math/Bounds";
import { Vector3 } from "../d3/math/Vector3";
import { Event } from "../events/Event";
import { LayaGL } from "../layagl/LayaGL";
import { Component } from "./Component";
export class LODInfo {
    _maxcullRate: number;//裁剪比例 0-1
    /**@internal */
    _renders: BaseRender[];//此LOD显示的渲染节点
    /**@internal */
    _group: LODGroup;
    constructor(maxcullRate: number) {
        this._maxcullRate = maxcullRate;
    }

    set maxcullRate(value: number) {
        this._maxcullRate = value;
    }

    get maxcullRate() {
        return this._maxcullRate;
    }
    /**
     * 在lodInfo中增加渲染节点
     * @param node 
     */
    addNode(node: Sprite3D) {
        let ren = node;
        if (ren._isRenderNode > 0) {
            let components = ren.renderComponent as BaseRender[];
            this._renders.concat(components);
            node.transform.on(Event.TRANSFORM_CHANGED, this._group._updateRecaculateFlag);
        }
        for (var i = 0, n = node.numChildren; i < n; i++) {
            this.addNode(node.getChildAt(i) as Sprite3D);
        }
    }

    /**
     * 删除某个lod节点
     * @param node 
     */
    removeNode(node: Sprite3D) {
        let ren = node;
        if (ren._isRenderNode > 0) {
            let components = ren.renderComponent as BaseRender[];
            components.forEach(element => {
                let index = this._renders.indexOf(element);
                if (index != -1) {
                    this._renders.splice(index, 1);
                    element.setRenderbitFlag(BaseRender.RenderBitFlag_CullFlag, false);
                    node.transform.off(Event.TRANSFORM_CHANGED, this._group._updateRecaculateFlag);
                }
            })
        }
        for (var i = 0, n = node.numChildren; i < n; i++) {
            this.removeNode(node.getChildAt(i) as Sprite3D);
        }
    }

    /**
     * 释放所有的渲染节点cull标记
     */
    removeAllRender() {
        this._renders.forEach(element => {
            element.setRenderbitFlag(BaseRender.RenderBitFlag_CullFlag, false);
        })
    }
}

export class LODGroup extends Component {
    public static tempVec: Vector3 = new Vector3();
    public static tempVec1: Vector3 = new Vector3();
    /**
     * 是否需要重新计算_lodBoundsRadius，和_bounds
     * 在LOD值里面位置有相对改动的时候是需要重新计算的
     */
    private _needcaculateBounds: boolean;

    /**
     * lodGroup所有的渲染节点的包围盒计算
     */
    private _bounds: Bounds;

    private _size: number;
    /**
     * 包围盒中心位置
     */
    private _lodPosition: Vector3;

    /**
     * lod等级数量
     */
    private _lodCount: number;

    /**
     * lod等级信息
     */
    private _lods: LODInfo[] = [];

    private _visialIndex = -1;

    constructor() {
        super();
        this._bounds = LayaGL.renderOBJCreate.createBounds(new Vector3(), new Vector3());
    }

    protected _onEnable(): void {
        super._onEnable();
        this.onPreRender();
    }

    protected _onDisable(): void {
        super._onDisable();
        this._lods.forEach(element => {
            element.removeAllRender();
        })
    }

    /**
    * @internal
    * 删除
    */
    onDestroy() {
        this._lods.forEach(element => {
            let renderarray = element._renders;
            for (var i = 0; i < renderarray.length; i++) {
                element.removeNode(renderarray[i].owner as Sprite3D);
            }
        })
    }

    /**
    * @internal
    */
    _updateRecaculateFlag() {
        this._needcaculateBounds = true;
    }

    /**
     * get LODInfo 数组
     * @returns 
     */
    getLODs(): LODInfo[] {
        return this._lods;
    }

    /**
     * 设置 LODInfo 数组
     * @param data 
     */
    setLODS(data: LODInfo[]) {
        this._lods = data;
        this._lods.forEach((element, index) => {
            element._group = this;
            this.setLODDisvisual(index);
        })
        this.recalculateBounds();
        this._lodCount = this._lods.length;
    }

    /**
     * 重新计算包围盒
     */
    recalculateBounds() {
        if (!this._needcaculateBounds) {
            return;
        }
        let firstBounds = true;
        for (let i = 0, n = this._lods.length; i < n; i++) {
            let lod = this._lods[i];
            lod._renders.forEach(element => {
                if (firstBounds)
                    element.bounds.cloneTo(this._bounds);
                else
                    Bounds.merge(this._bounds, element.bounds, this._bounds);
            });
        }
        this._lodPosition = this._bounds.getCenter();
        let extend = this._bounds.getExtent();
        this._size = 2 * Math.max(extend.x, extend.y, extend.z);
        this._needcaculateBounds = false;
    }

    /**
     * 渲染之前的更新
     */
    onPreRender() {
        this.recalculateBounds();
        //查看相机的距离
        let checkCamera = (this.owner.scene as Scene3D).cullInfoCamera as Camera;
        let maxYDistance = checkCamera.maxlocalYDistance;
        let cameraFrustum = checkCamera.boundFrustum;
        Vector3.subtract(this._lodPosition, checkCamera.transform.position, LODGroup.tempVec);
        //大于farplane,或者不在视锥内.不做lod操作
        if (LODGroup.tempVec.lengthSquared() > checkCamera.farPlane || cameraFrustum.containsPoint(this._lodPosition) == 0) {
            return;
        }
        let length = LODGroup.tempVec.length();
        checkCamera.transform.worldMatrix.getForward(LODGroup.tempVec1);
        Vector3.normalize(LODGroup.tempVec, LODGroup.tempVec);
        Vector3.normalize(LODGroup.tempVec1, LODGroup.tempVec1);
        let rateYDistance = Vector3.dot(LODGroup.tempVec, LODGroup.tempVec1) / checkCamera.farPlane * maxYDistance;

        let rate = (this._size / rateYDistance);
        for (var i = 0; i < this._lodCount; i++) {

        }

    }


    /**
     * 设置某一级LOD显示
     * @param index 
     */
    private setLODvisual(index: number): void {
        let lod = this._lods[index];
        lod._renders.forEach(element => {
            element.setRenderbitFlag(BaseRender.RenderBitFlag_CullFlag, false);
        });
    }

    /**
     * 设置某一级LOD不显示
     * @param index 
     */
    private setLODDisvisual(index: number) {
        let lod = this._lods[index];
        lod._renders.forEach(element => {
            element.setRenderbitFlag(BaseRender.RenderBitFlag_CullFlag, true);
        });
    }


}
