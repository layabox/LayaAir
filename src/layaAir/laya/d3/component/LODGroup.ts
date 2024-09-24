import { Component } from "../../components/Component";
import { Camera } from "../core/Camera";
import { BaseRender, RenderBitFlag } from "../core/render/BaseRender";
import { Scene3D } from "../core/scene/Scene3D";
import { Sprite3D } from "../core/Sprite3D";
import { Bounds } from "../math/Bounds";
import { Event } from "../../events/Event";
import { Utils3D } from "../utils/Utils3D";
import { Vector3 } from "../../maths/Vector3";

const tempVec = new Vector3();
const tempVec1 = new Vector3();

/**
 * @en The `LODInfo` class describes Level of Detail (LOD) data.
 * @zh `LODInfo` 类描述了细节层次（LOD）数据。
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
     * @en Constructor method of LODInfo.
     * @zh 细节层次数据的构造方法
     */
    constructor(mincullRate: number) {
        this._mincullRate = mincullRate;
        this._renders = [];
        this._cachSprite3D = [];
    }

    /**
     * @en Minimum culling ratio for LOD.
     * @zh LOD的最小剔除率。
     */
    get mincullRate() {
        return this._mincullRate;
    }

    set mincullRate(value: number) {
        this._mincullRate = value;
    }


    /**
     * @internal
     * @en Sets the LOD group
     * @zh 设置LOD组。
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
     * @en The node information for the LODInfo.
     * @zh LODInfo的节点信息。
     */
    get renders(): Sprite3D[] {
        return this._cachSprite3D;
    }

    set renders(value: Sprite3D[]) {
        this._cachSprite3D = value;
        for (var i = 0, n = value.length; i < n; i++) {
            this.addNode(value[i]);
        }
    }


    /**
     * @en Adds a rendering node to the LODInfo.
     * @param node The Sprite3D node to be added as a rendering node.
     * @zh 在LODInfo中增加渲染节点。
     * @param node 要作为渲染节点添加的Sprite3D节点。
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
     * @en Removes a LOD node from the LODInfo.
     * @param node The Sprite3D node to be removed from the LOD.
     * @zh 从LODInfo中删除某个LOD节点。
     * @param node 要从LOD中删除的Sprite3D节点。
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
     * @en Releases all render node cull flags in the LODInfo.
     * @zh 释放LODInfo中的所有渲染节点的剔除标记。
     */
    removeAllRender() {
        this._renders.forEach(element => {
            element.setRenderbitFlag(RenderBitFlag.RenderBitFlag_CullFlag, false);
        })
    }
}

/**
 * @en The `LODGroup` class is used to build LOD components.
 * @zh SpotLight 类用于构建LOD组件
 */
export class LODGroup extends Component {

    /**
   * @en Indicates whether the LOD bounds radius and bounds need to be recalculated. Recalculation is needed when there is a relative change in the LOD values.
   * @zh 是否需要重新计算 _lodBoundsRadius 和 _bounds。当 LOD 值的位置有相对改动时，需要重新计算。
   */
    private _needcaculateBounds: boolean = false;

    /**
     * @en The bounds calculation for all rendering nodes in the LOD group.
     * @zh lodGroup 所有的渲染节点的包围盒计算
     */
    private _bounds: Bounds;

    /**
     * @en The size of the LOD group.
     * @zh LOD组大小
     */
    private _size: number;

    /**
     * @en The center position of the bounding box.
     * @zh 包围盒中心位置
     */
    private _lodPosition: Vector3;

    /**
     * @en The number of LOD levels.
     * @zh LOD 等级数量
     */
    private _lodCount: number;

    /**
     * @en The information of LOD levels.
     * @zh LOD 等级信息
     */
    private _lods: LODInfo[] = [];

    /**
     * @en The index of the visible node.
     * @zh 显示节点
     */
    private _visialIndex = -1;

    /**
     * @en The ratio of the LOD node.
     * @zh LOD节点比例
     */
    private _nowRate: number;

    /**
     * @en Constructor method of LODGroup.
     * @zh LOD组的构造方法
     */
    constructor() {
        super();
        this._bounds = new Bounds();
        this._lodPosition = new Vector3();
        this.runInEditor = true;
    }

    /**
     * @en Shadow culling pass
     * @zh 阴影裁剪pass
     */
    shadowCullPass(): boolean {
        return false;
    }

    /**
     * @en The array of LODInfo objects
     * @zh LODInfo数组
     */
    get lods(): LODInfo[] {
        return this._lods;
    }

    set lods(data: LODInfo[]) {
        this._lods = data;
        for (var i = 0, n = this._lods.length; i < n; i++) {
            let element = this._lods[i]
            element._lodIndex = i;
            element.group = this;
        }
        this._updateRecaculateFlag();
        this._lodCount = this._lods.length;
    }

    /**
     * @en Proportion of lod nodes
     * @zh lod节点比例
     */
    get nowRate() {
        return this._nowRate;
    }

    /**
     * @en LOD bounds
     * @zh LOD包围盒
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
        for (var i = 0, n = this._lods.length; i < n; i++) {
            this._setLODinvisible(i);
        }
        this._visialIndex = -1;


        this._applyVisibleRate(1);
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
     * @en Called when the object is being destroyed to perform cleanup operations.
     * @zh 在对象被销毁时调用，以执行清理操作。
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
     * @en Recalculate the bounding box
     * @zh 重新计算包围盒
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
        this._lodPosition = this._bounds._imp.getCenter();
        let extend = this._bounds.getExtent();
        this._size = 2 * Math.max(extend.x, extend.y, extend.z);
        this._needcaculateBounds = false;
    }

    /**
     * @internal
     * @en Update before rendering
     * @zh 渲染之前的更新
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
        let rateYDistance = length / checkCamera.farPlane * maxYDistance;
        let rate = (this._size / rateYDistance);
        this._nowRate = rate;
        this._applyVisibleRate(rate);
    }
}
