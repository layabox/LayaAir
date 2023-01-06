import { Component } from "../../components/Component";
import { Camera } from "../core/Camera";
import { BaseRender, RenderBitFlag } from "../core/render/BaseRender";
import { Scene3D } from "../core/scene/Scene3D";
import { Sprite3D } from "../core/Sprite3D";
import { Bounds } from "../math/Bounds";
import { Event } from "../../events/Event";
import { Utils3D } from "../utils/Utils3D";
import { IBoundsCell } from "../math/IBoundsCell";
import { Vector3 } from "../../maths/Vector3";

const tempVec = new Vector3();
const tempVec1 = new Vector3();

/**
 * 此类描述Lod数据
 */
export class LODInfo {
    /**@internal */
    _mincullRate: number;//裁剪比例 0-1

    /**@internal */
    _renders: BaseRender[];//此LOD显示的渲染节点

    /**@internal */
    _cachSprite3D: Sprite3D[];

    /**@internal */
    _lodIndex: number;

    /**@internal */
    private _group: LODGroup;

    /**
     * 实例化一个LODInfo
     * @param mincullRate 
     */
    constructor(mincullRate: number) {
        this._mincullRate = mincullRate;
        this._renders = [];
        this._cachSprite3D = []
    }

    /**
     * 设置最小通过率
     */
    set mincullRate(value: number) {
        this._mincullRate = value;
    }

    get mincullRate() {
        return this._mincullRate;
    }

    /**
     * @internal
     * 设置LODGroup
     */
    set group(value: LODGroup) {
        if (value == this._group)
            return;
        if (this._group) {//remove old event
            // this._renders.forEach(element => {
            //     (element.owner as Sprite3D).transform.off(Event.TRANSFORM_CHANGED, this._group._updateRecaculateFlag);
            //     element._LOD = -1;
            // })
            for (let i = 0, n = this._renders.length; i < n; i++) {
                let element = this._renders[i];
                (element.owner as Sprite3D).transform.off(Event.TRANSFORM_CHANGED, this._group._updateRecaculateFlag);
                element._LOD = -1;
            }
        }
        this._group = value;
        for (let i = 0, n = this._renders.length; i < n; i++) {
            let element = this._renders[i];
            (element.owner as Sprite3D).transform.on(Event.TRANSFORM_CHANGED, this._group, this._group._updateRecaculateFlag);
            element._LOD = this._lodIndex;
        }
    }

    /**
     * 设置LODInfo的节点信息
     */
    set renders(value: Sprite3D[]) {
        this._cachSprite3D = value;
        for (var i = 0, n = value.length; i < n; i++) {
            this.addNode(value[i]);
        }
    }

    get renders(): Sprite3D[] {
        return this._cachSprite3D;
    }

    /**
     * 在lodInfo中增加渲染节点
     * @param node 
     */
    addNode(node: Sprite3D) {
        if (!node)
            return;
        let ren = node;
        if (ren._isRenderNode > 0) {
            let components = ren.components;
            for (let comp of components) {
                if ((comp instanceof BaseRender) && this._renders.indexOf(comp) == -1)
                    this._renders.push(comp);
            }
            this._group && node.transform.on(Event.TRANSFORM_CHANGED, this._group, this._group._updateRecaculateFlag);
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
            let components = ren.components;
            let index: number;
            for (let comp of components) {
                if ((comp instanceof BaseRender) && (index = this._renders.indexOf(comp)) == -1) {
                    this._renders.splice(index, 1);
                    comp.setRenderbitFlag(RenderBitFlag.RenderBitFlag_CullFlag, false);
                    this._group && node.transform.off(Event.TRANSFORM_CHANGED, this._group._updateRecaculateFlag);
                }
            }
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
            element.setRenderbitFlag(RenderBitFlag.RenderBitFlag_CullFlag, false);
        })
    }
}

/**
 * <code>SpotLight</code> 类用于构建LOD组件
 */
export class LODGroup extends Component implements IBoundsCell {

    /**
     * 是否需要重新计算_lodBoundsRadius，和_bounds
     * 在LOD值里面位置有相对改动的时候是需要重新计算的
     */
    private _needcaculateBounds: boolean = false;

    /**     
     * lodGroup所有的渲染节点的包围盒计算
     */
    private _bounds: Bounds;

    /**
     * size
     */
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

    /**
     * 显示节点
     */
    private _visialIndex = -1;


    /**
     * 实例化一个LODGroup
     */
    constructor() {
        super();
        this._bounds = new Bounds();
        this._lodPosition = new Vector3();
        this.runInEditor = true;
    }

    /**
    * get LODInfo 数组
    * @returns 
    */
    get lods(): LODInfo[] {
        return this._lods;
    }

    /**
     * 设置 LODInfo 数组
     * @param data 
     */
    set lods(data: LODInfo[]) {
        this._lods = data;
        for (var i = 0, n = this._lods.length; i < n; i++) {
            let element = this._lods[i]
            element._lodIndex = i;
            element.group = this;
            this._setLODinvisible(i);
        }
        this._updateRecaculateFlag();
        this._visialIndex = -1;
        //this.recalculateBounds();
        this._lodCount = this._lods.length;
    }

    /**
     * 获得LOD包围盒
     */
    get bounds() {
        this.recalculateBounds();
        return this._bounds;
    }

    /**
     * @internal
     */
    protected _onEnable(): void {
        super._onEnable();
        //this.onPreRender();
    }

    /**
     * @internal
     */
    protected _onDisable(): void {
        super._onDisable();
        this._lods.forEach(element => {
            element.removeAllRender();
        })
    }

    /**
     * 设置显示隐藏组
     * @param rate 
     * @returns 
     */
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
        for (var i = 0, n = lod._renders.length; i < n; i++) {
            lod._renders[i].setRenderbitFlag(RenderBitFlag.RenderBitFlag_CullFlag, false);
        }
    }

    /**
     * 设置某一级LOD不显示
     * @param index 
     */
    private _setLODinvisible(index: number) {
        let lod = this._lods[index];
        for (var i = 0, n = lod._renders.length; i < n; i++) {
            lod._renders[i].setRenderbitFlag(RenderBitFlag.RenderBitFlag_CullFlag, true);
        }
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
     * @internal
     * @param lodGroup 
     */
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
        lodGroup.lods = lodArray;
    }

    /**
     * @internal
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
     * @internal
     * 渲染之前的更新
     */
    onPreRender() {
        this.recalculateBounds();
        //查看相机的距离
        let checkCamera = (this.owner.scene as Scene3D).cullInfoCamera as Camera;
        let maxYDistance = checkCamera.maxlocalYDistance;
        let cameraFrustum = checkCamera.boundFrustum;
        Vector3.subtract(this._lodPosition, checkCamera.transform.position, tempVec);
        //大于farplane,或者不在视锥内.不做lod操作
        let length = tempVec.length();
        if (length > checkCamera.farPlane || cameraFrustum.containsPoint(this._lodPosition) == 0) {
            return;
        }
        checkCamera.transform.worldMatrix.getForward(tempVec1);
        Vector3.normalize(tempVec, tempVec);
        Vector3.normalize(tempVec1, tempVec1);
        let rateYDistance = length * Vector3.dot(tempVec, tempVec1) / checkCamera.farPlane * maxYDistance;

        let rate = (this._size / rateYDistance);
        this._applyVisibleRate(rate);
    }
}
