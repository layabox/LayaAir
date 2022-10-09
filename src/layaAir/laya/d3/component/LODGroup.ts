import { Component } from "../../components/Component";
import { LayaGL } from "../../layagl/LayaGL";
import { Camera } from "../core/Camera";
import { BaseRender } from "../core/render/BaseRender";
import { Scene3D } from "../core/scene/Scene3D";
import { Sprite3D } from "../core/Sprite3D";
import { Bounds } from "../math/Bounds";
import { Vector3 } from "../math/Vector3";
import { Event } from "../../events/Event";
import { Utils3D } from "../utils/Utils3D";

export class LODInfo {
    _mincullRate: number;//裁剪比例 0-1
    /**@internal */
    _renders: BaseRender[];//此LOD显示的渲染节点
    /**@internal */
    private _group: LODGroup;
    constructor(mincullRate: number) {
        this._mincullRate = mincullRate;
        this._renders = [];
    }

    set mincullRate(value: number) {
        this._mincullRate = value;
    }

    get mincullRate() {
        return this._mincullRate;
    }

    set group(value: LODGroup) {
        if (value == this._group)
            return;
        if (this._group) {//remove old event
            this._renders.forEach(element => {
                (element.owner as Sprite3D).transform.off(Event.TRANSFORM_CHANGED, this._group._updateRecaculateFlag);
            })
        }
        this._group = value;
        this._renders.forEach(element => {
            (element.owner as Sprite3D).transform.on(Event.TRANSFORM_CHANGED, this._group._updateRecaculateFlag);
        })

    }
    /**
     * 在lodInfo中增加渲染节点
     * @param node 
     */
    addNode(node: Sprite3D) {
        let ren = node;
        if (ren._isRenderNode > 0) {
            let components = ren.renderComponent as BaseRender[];
            //this._renders = this._renders.concat(components);
            components.forEach(value=>{
                if(this._renders.indexOf(value)==-1){
                    this._renders.push(value);
                }
            });
            this._group && node.transform.on(Event.TRANSFORM_CHANGED, this._group._updateRecaculateFlag);
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
                    this._group && node.transform.off(Event.TRANSFORM_CHANGED, this._group._updateRecaculateFlag);
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
    private _needcaculateBounds: boolean = false;

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
        this._bounds = new Bounds();
        this._lodPosition = new Vector3();
        this.runInEditor = true;
    }

    protected _onEnable(): void {
        super._onEnable();
        //this.onPreRender();
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
    setLODs(data: LODInfo[]) {
        this._lods = data;
        this._lods.forEach((element, index) => {
            element.group = this;
            this._setLODinvisible(index);
        });
        this._updateRecaculateFlag();
        this._visialIndex = -1;
        //this.recalculateBounds();
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
                if (firstBounds) {
                    element.bounds.cloneTo(this._bounds);
                    firstBounds = false;
                }
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
        let rateYDistance = length * Vector3.dot(LODGroup.tempVec, LODGroup.tempVec1) / checkCamera.farPlane * maxYDistance;

        let rate = (this._size / rateYDistance);
        this._applyVisibleRate(rate);
    }

    private _applyVisibleRate(rate: number) {
        for (var i = 0; i < this._lodCount; i++) {
            let lod = this._lods[i];
            if (rate > lod.mincullRate) {
                if (i == -1) {
                    this._setLODvisible(i);
                    this._visialIndex = i;
                    return;
                }
                if (i == this._visialIndex)
                    return;
                else {
                    (this._visialIndex != -1) && this._setLODinvisible(this._visialIndex);
                    this._setLODvisible(i);
                    this._visialIndex = i;
                    return;
                }
            }
        }
        //cull
        if (this._visialIndex != -1) {
            this._setLODinvisible(this._visialIndex);
            this._visialIndex = -1;
        }
    }


    /**
     * 设置某一级LOD显示
     * @param index 
     */
    private _setLODvisible(index: number): void {
        let lod = this._lods[index];
        lod._renders.forEach(element => {
            element.setRenderbitFlag(BaseRender.RenderBitFlag_CullFlag, false);
        });
    }

    /**
     * 设置某一级LOD不显示
     * @param index 
     */
    private _setLODinvisible(index: number) {
        let lod = this._lods[index];
        lod._renders.forEach(element => {
            element.setRenderbitFlag(BaseRender.RenderBitFlag_CullFlag, true);
        });
    }

    //只保留同级或者低级关联节点
    _cloneTo(lodGroup: LODGroup) {
        super._cloneTo(lodGroup);
        //get common parent
        let getCommomParent = (rootNode: Sprite3D, rootCheckNode: Sprite3D): Sprite3D => {
            let nodeArray: Sprite3D[] = [];
            let node = rootNode;
            while (!!node) {
                if (node instanceof Sprite3D)
                    nodeArray.push(node);
                node = node.parent as Sprite3D;
            }
            let checkNode: Sprite3D = rootCheckNode;
            while (!!checkNode && nodeArray.indexOf(checkNode) == -1) {
                checkNode = checkNode.parent as Sprite3D;
            }
            return checkNode;
        }
        let cloneHierachFun = (rootNode: Sprite3D, rootCheckNode: Sprite3D, destNode: Sprite3D): Sprite3D => {
            let rootparent: Sprite3D = getCommomParent(rootNode, rootCheckNode);
            if (!rootparent)
                return null;
            let path: number[] = [];
            Utils3D._getHierarchyPath(rootparent, rootNode, path);
            let pathcheck: number[] = [];
            Utils3D._getHierarchyPath(rootparent, rootCheckNode, pathcheck);
            let destParent = Utils3D._getParentNodeByHierarchyPath(destNode, path);
            if (!destParent)
                return null;
            return Utils3D._getNodeByHierarchyPath(destParent, pathcheck) as Sprite3D;
        }
        let lodArray: LODInfo[] = [];
        for (let i = 0, n = this._lodCount; i < n; i++) {
            let lod = this._lods[i];
            let cloneLOD = new LODInfo(lod.mincullRate);
            lodArray.push(cloneLOD);
            lod._renders.forEach(element => {
                let node = cloneHierachFun(this.owner as Sprite3D, element.owner as Sprite3D, lodGroup.owner as Sprite3D);
                if (node)
                    cloneLOD.addNode(node);
            });
        }
        lodGroup.setLODs(lodArray);
    }
}
