import { Vector3 } from "../../../../maths/Vector3";
import { ICameraCullInfo } from "../../../../RenderEngine/RenderInterface/RenderPipelineInterface/ICameraCullInfo";
import { IShadowCullInfo } from "../../../../RenderEngine/RenderInterface/RenderPipelineInterface/IShadowCullInfo";
import { SingletonList } from "../../../../utils/SingletonList";
import { BoundFrustum } from "../../../math/BoundFrustum";
import { Bounds } from "../../../math/Bounds";
import { CollisionUtils } from "../../../math/CollisionUtils";
import { ContainmentType } from "../../../math/ContainmentType";
import { IBoundsCell } from "../../../math/IBoundsCell";
import { Plane } from "../../../math/Plane";
import { BVHSpatialConfig, BVHSpatialManager } from "./SpatialManager";

/**
 * BVH子空间
 */
export class BVHSpatialBox<T> {
    private static _tempV3: Vector3 = new Vector3();
    private static _tempV3_2: Vector3 = new Vector3();

    /**
     * 包围盒和阴影相机的关系
     * @param box
     * @param cullInfo 
     * @returns 0: 不相交，1：包含， 2：相交
     */
    static sciContainsBox(box: Bounds, cullInfo: IShadowCullInfo) {
        const p = BVHSpatialBox._tempV3;
        const n = BVHSpatialBox._tempV3_2;
        const boxMin = box.min;
        const boxMax = box.max;
        let result = ContainmentType.Contains;
        for (let i = 0, nn = cullInfo.cullPlaneCount; i < nn; i++) {
            const plane = cullInfo.cullPlanes[i];
            const planeNor = plane.normal;

            if (planeNor.x >= 0) {
                p.x = boxMax.x;
                n.x = boxMin.x;
            } else {
                p.x = boxMin.x;
                n.x = boxMax.x;
            }
            if (planeNor.y >= 0) {
                p.y = boxMax.y;
                n.y = boxMin.y;
            } else {
                p.y = boxMin.y;
                n.y = boxMax.y;
            }
            if (planeNor.z >= 0) {
                p.z = boxMax.z;
                n.z = boxMin.z;
            } else {
                p.z = boxMin.z;
                n.z = boxMax.z;
            }

            if (CollisionUtils.intersectsPlaneAndPoint(plane, p) === Plane.PlaneIntersectionType_Back)
                return ContainmentType.Disjoint;
            if (CollisionUtils.intersectsPlaneAndPoint(plane, n) === Plane.PlaneIntersectionType_Back)
                result = ContainmentType.Intersects;
        }
        return result;
    }

    /**
     * 包围盒是否和阴影相机相交
     * @param box 
     * @param cullInfo 
    */
    static sciIntersectsBox(box: Bounds, cullInfo: IShadowCullInfo) {
        const cullPlaneCount = cullInfo.cullPlaneCount;
        const cullPlanes = cullInfo.cullPlanes;

        const min: Vector3 = box.min;
        const max: Vector3 = box.max;
        const minX: number = min.x;
        const minY: number = min.y;
        const minZ: number = min.z;
        const maxX: number = max.x;
        const maxY: number = max.y;
        const maxZ: number = max.z;

        let pass: boolean = true;
        for (let j = 0; j < cullPlaneCount; j++) {
            const plane = cullPlanes[j];
            const normal = plane.normal;
            if (plane.distance + (normal.x * (normal.x < 0.0 ? minX : maxX)) + (normal.y * (normal.y < 0.0 ? minY : maxY)) + (normal.z * (normal.z < 0.0 ? minZ : maxZ)) < 0.0) {
                pass = false;
                break;
            }
        }
        return pass;
    }
    /**@internal */
    protected _bounds: Bounds;
    /**@internal BVH实例数组 */
    protected _cellList: Array<IBoundsCell>;
    /**@internal 实例数量 */
    protected _cellCount: number; //本空间分支下的逻辑对象总数量（包括子空间）
    /**@internal 父节点 */
    protected _parent: BVHSpatialBox<T>; //父空间（只有根节点无父空间）
    /**@internal 子节点 */
    protected _children0: BVHSpatialBox<T>;
    protected _children1: BVHSpatialBox<T>;
    /**此BVH设置 */
    protected _config: BVHSpatialConfig;
    /**BVH管理 */
    protected _bvhmanager: BVHSpatialManager;
    /**包围盒标记 */
    _boundchanged: boolean;

    /**
     * 创建BVHSpaticalBox实例
     * @param bvhmanager 
     * @param config 
     */
    constructor(bvhmanager: BVHSpatialManager, config: BVHSpatialConfig) {
        this._bounds = new Bounds(new Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE), new Vector3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE));
        this._cellList = [];
        this._cellCount = 0;
        this._bvhmanager = bvhmanager;
        this._config = config;
    }

    /**
     * 父节点
     */
    set parent(value: BVHSpatialBox<IBoundsCell>) {
        this._parent = value;
    }

    get parent() {
        return this._parent;
    }

    /**
     * 去重
     * @param cell 
     * @returns 
     */
    private _isRepeat(cell: IBoundsCell): boolean {
        return (this._cellList.indexOf(cell) != -1);
    }

    /**
     * add one cell to list
     * @param cell 
     */
    private _addOneCell(cell: IBoundsCell) {
        this._cellList.push(cell);
        this._cellCount++;
        this._bvhmanager.bvhManager.set(cell.id, this);
        this._bvhmanager.cellCount++;
        // this._addBounds(cell);
    }

    /**
     * remove one cell to list
     * @param cell 
     * @returns 
     */
    private _removeOneCell(cell: IBoundsCell) {
        let index = this._cellList.indexOf(cell);
        if (index == -1)
            return false;
        this._cellCount--;
        this._cellList.splice(index, 1);
        this._bvhmanager.bvhManager.delete(cell.id);
        this._bvhmanager.cellCount--;
        return true;
    }

    /**
     * 清除队列
     * TODO 是否要清理bvhmanager
     */
    private _clearList() {
        this._bvhmanager.cellCount -= this._cellCount;
        this._cellCount = 0;
        this._cellList = null;
    }

    /**
     * 判断Float是否接近
     * @param x 
     * @param y 
     * @returns 
     */
    private _isFloatMax(x: number, y: number) {
        return x - y > 0.0001;//x>y 切
    }

    /**
     * 这个包围盒是否影响Box的包围盒大小
     */
    private _isBoundsContainedBySpatialBox(cell: IBoundsCell) {
        let cellMin = cell.bounds.getMin();
        let cellMax = cell.bounds.getMax();
        let boxMin = this._bounds.getMin();
        let boxMax = this._bounds.getMax();
        //如果cell 包围盒在box包围盒中间,则不影响包围盒改变
        if (this._isFloatMax(cellMin.x, boxMin.x) && this._isFloatMax(cellMin.y, boxMin.y) && this._isFloatMax(cellMin.z, boxMin.z) &&
            this._isFloatMax(boxMax.x, cellMax.x) && this._isFloatMax(boxMax.y, cellMax.y) && this._isFloatMax(boxMax.z, cellMax.z)) {
            return false;
        }
        return true;
    }

    /**
     * 给box增加一个Bounds
     * @param cell 
     */
    private _addBounds(cell: IBoundsCell) {
        this._boundchanged = this._isBoundsContainedBySpatialBox(cell);
    }

    /**
     * 给box减少一个bounds
     * @param cell 
     */
    private _removeBounds(cell: IBoundsCell) {
        this._boundchanged = this._isBoundsContainedBySpatialBox(cell);
    }

    /**
     * fill one Cell
     * add but dont Split immediately
     */
    fillCell(cell: IBoundsCell) {
        if (this._isRepeat(cell)) {
            return;
        }
        this._addOneCell(cell);
        this._boundchanged = true;
        this._bvhmanager.updateBVHBoxList.add(this);
    }

    /**
     * fill remove one cell
     * remove but dont split imediately
     * @param cell 
     */
    fillRemove(cell: IBoundsCell) {
        if (!this._isRepeat(cell)) {
            return;
        }
        this._removeOneCell(cell);
        this._boundchanged = true;
        this._bvhmanager.updateBVHBoxList.add(this);
    }

    /**
     * add one Cell
     * @param cell 
     * @returns 
     */
    addCell(cell: IBoundsCell) {
        if (this._isRepeat(cell)) {
            return;
        }
        this._addOneCell(cell);
        this._addBounds(cell);
    }

    /**
     * remove one Cell
     * @param cell 
     */
    removeCell(cell: IBoundsCell) {
        if (this._removeOneCell(cell)) {
            this._removeBounds(cell);
        }
    }

    /**
     * 构建BVHBox
     * @returns 
     */
    splitBox() {
        if (!this.isContentBox()) {
            this._children0 && this._children0.splitBox();
            this._children1 && this._children1.splitBox();
            return;
        }

        let v1 = this._bounds.getExtent(); //获取包围盒轮廓

        if ((this._config.max_SpatialCount > this._cellCount && this._config.limit_size >= 2 * Math.max(v1.x, v1.y, v1.z)) || this._cellCount <= 1)
            return;

        //sort方向尺寸大为分割方向
        if (v1.x > v1.y && v1.x > v1.z)
            this._cellList.sort((a: IBoundsCell, b: IBoundsCell) => {
                if (a && b)
                    return a.bounds.getCenter().x - b.bounds.getCenter().x;
                else return 0;
            }); //按照X轴方向分割
        else if (v1.y > v1.x && v1.y > v1.z) //排序使分割位置更加合理
            this._cellList.sort((a: IBoundsCell, b: IBoundsCell) => {
                if (a && b) return a.bounds.getCenter().y - b.bounds.getCenter().y;
                else return 0;
            }); //按照Y轴方向分割
        else if (v1.z > v1.x && v1.z > v1.y) //排序使分割位置更加合理
            this._cellList.sort((a: IBoundsCell, b: IBoundsCell) => {
                if (a && b) return a.bounds.getCenter().z - b.bounds.getCenter().z;
                else return 0;
            }); //按照Y轴方向分割
        const mid = this._cellCount / 2 | 0; //找中间位置

        this._children0 = this._creatChildNode();
        this._children0.parent = this;
        for (let i = 0; i < mid; i++) { //前一半逻辑对象放入第一个子空间中
            const cell = this._cellList[i];
            this._children0.fillCell(cell);
            Bounds.merge(this._children0._bounds, cell.bounds, this._children0._bounds);
        }
        this._children0._boundchanged = false;
        this._children0.splitBox();

        this._children1 = this._creatChildNode();
        this._children1.parent = this;

        for (let i = mid; i < this._cellCount; i++) { //后一半逻辑对象放入第二个子空间中
            const cell = this._cellList[i];
            this._children1.fillCell(cell);
            Bounds.merge(this._children1._bounds, cell.bounds, this._children1._bounds);
        }
        this._children1._boundchanged = false;
        this._children1.splitBox();

        this._clearList();
    }

    /**
     * 获得最近的Content BVHBox
     * @param checkPos 
     * @returns 
     */
    getNearlist(checkPos: Vector3): BVHSpatialBox<T> {
        if (this.isContentBox())
            return this;
        else {
            let v1 = this._children0._bounds.getCenter();
            let v2 = this._children1._bounds.getCenter();
            return Vector3.distanceSquared(v1, checkPos) < Vector3.distanceSquared(v2, checkPos) ? this._children0.getNearlist(checkPos) : this._children1.getNearlist(checkPos);
        }

    }

    /**
     * 获得这个节点包含的所有content
     * @param out 
     */
    traverseBoundsCell(out: SingletonList<IBoundsCell>) {
        if (this.isContentBox()) {
            for (var i = 0; i < this._cellCount; i++) {
                out.add(this._cellList[i]);
            }
        } else {
            this._children0 && this._children0.traverseBoundsCell(out);
            this._children1 && this._children1.traverseBoundsCell(out);
        }
    }

    /**
     * Override it
     * @returns 
     */
    protected _creatChildNode(): BVHSpatialBox<T> {
        return new BVHSpatialBox<T>(this._bvhmanager, this._config);
    }

    /**
     * 通过CameraCull查找逻辑对象
     * @override
     * @param frustum 视锥
     * @param out 输出逻辑对象组
     */
    getItemByCameraCullInfo(cameraCullInfo: ICameraCullInfo, out: SingletonList<IBoundsCell>) {
        var frustum: BoundFrustum = cameraCullInfo.boundFrustum;
        const result = frustum.containsBoundBox(this._bounds);
        if (result == 1) //完全包含
            this.traverseBoundsCell(out); //遍历分支，添加所有逻辑对象
        else if (result == 2) { //部分包含
            if (this.isContentBox()) {
                for (let i = 0; i < this._cellList.length; i++) { //逐个判断逻辑对象包围盒是否和视锥有交集
                    if (frustum.intersects(this._cellList[i].bounds))
                        out.add(this._cellList[i]);
                }
            } else {
                this._children0.getItemByCameraCullInfo(cameraCullInfo, out); //处理子空间
                this._children1.getItemByCameraCullInfo(cameraCullInfo, out); //处理子空间
            }
        }
    }

    /**
     * 通过视锥查找逻辑对象
     * @override
     * @param frustum 视锥
     * @param out 输出逻辑对象组
     */
    getItemByFrustum(frustum: BoundFrustum, out: SingletonList<IBoundsCell>) {
        const result = frustum.containsBoundBox(this._bounds);
        if (result == 1) //完全包含
            this.traverseBoundsCell(out); //遍历分支，添加所有逻辑对象
        else if (result == 2) { //部分包含
            if (this.isContentBox()) {
                for (let i = 0; i < this._cellList.length; i++) { //逐个判断逻辑对象包围盒是否和视锥有交集
                    if (frustum.intersects(this._cellList[i].bounds))
                        out.add(this._cellList[i]);
                }
            } else {
                this._children0.getItemByFrustum(frustum, out); //处理子空间
                this._children1.getItemByFrustum(frustum, out); //处理子空间
            }
        }
    }

    /**
     * 通过阴影裁剪信息查找逻辑对象
     * @override 
     * @param sci
     * @param out 
     */
    getItemBySCI(sci: IShadowCullInfo, out: SingletonList<IBoundsCell>) {
        const result = BVHSpatialBox.sciContainsBox(this._bounds, sci);
        if (result == 1) //完全包含
            this.traverseBoundsCell(out); //遍历分支，添加所有逻辑对象
        else if (result == 2) { //部分包含
            if (this.isContentBox()) {
                for (let i = 0; i < this._cellList.length; i++) { //逐个判断逻辑对象包围盒是否和视锥有交集
                    if (BVHSpatialBox.sciIntersectsBox(this._cellList[i].bounds, sci))
                        out.add(this._cellList[i]);
                }
            } else {
                this._children0.getItemBySCI(sci, out); //处理子空间
                this._children1.getItemBySCI(sci, out); //处理子空间
            }
        }
    }

    /**
     * 重算包围盒
     * null need Update by child
     * contents need Update by List
     */
    recaculateBox() {
        if (!!this._children0 && !!this._children1) {
            Bounds.merge(this._children0._bounds, this._children1._bounds, this._bounds);
        }
        else if (this._cellList && this._cellList.length >= 1) {
            this._cellList[0].bounds.cloneTo(this._bounds);
            for (var i = 0, n = this._cellList.length; i < n; i++) {
                Bounds.merge(this._cellList[i].bounds, this._bounds, this._bounds);
            }
        } else {
            console.error("BVHSpatialBox is illegal");
        }
        this.parent && this.parent.recaculateBox();
        this._boundchanged = false;
    }

    /**
     * 
     * @returns 
     */
    isRoot(): boolean {
        return !this._parent;
    }

    /**
     * 
     * @returns 
     */
    isContentBox(): boolean {
        return this._cellCount != 0;
    }

    /**
     * 删除box
     */
    destroy() {
        if (this.isContentBox()) {
            this._cellList = null;
        } else {
            this._children0.destroy();
            this._children1.destroy();
            this._children0 = null;
            this._children1 = null;
        }
        this._bounds = null;
        this._config = null;
        this._bvhmanager = null;
    }

}