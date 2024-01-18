
import { Component } from "../../../../components/Component";
import { Matrix4x4 } from "../../../../maths/Matrix4x4";
import { Quaternion } from "../../../../maths/Quaternion";
import { Vector3 } from "../../../../maths/Vector3";
import { Bounds } from "../../../math/Bounds";
import { Scene3D } from "../../scene/Scene3D";
import { NavTileCache } from "../NavTileData";
import { NavigationManager } from "../NavigationManager";
import { NavModifleBase } from "./NavModifleBase";

export enum NavObstaclesMeshType {
    BOX,
    CAPSULE,
    Num
}

let createObstacleData = function (slices: number, radiusOff: number = 0): NavTileCache {
    let vertexs = new Float32Array(slices * 6);
    const triCount = (slices - 1) * 4;
    let flags = new Uint8Array(triCount);
    flags.fill(1);
    let ibs = [];
    for (var i = 0; i < slices; i++) {
        if (i >= 1) {
            let index = 2 * i;
            ibs.push(index - 2, index + 1, index);
            ibs.push(index - 1, index + 1, index - 2);
            if (i >= 2) {
                ibs.push(0, index - 2, index);
                ibs.push(index - 1, 1, index + 1);
            }
        }
    }
    let endIndex = slices * 2;
    ibs.push(endIndex - 2, 1, 0);
    ibs.push(endIndex - 1, 1, endIndex - 2);
    var sliceAngle = (Math.PI * 2.0) / slices;
    for (var i = 0; i < slices; i++) {
        let triIndex = i * 6;
        vertexs[triIndex] = vertexs[triIndex + 3] = 0.5 * Math.cos(sliceAngle * i + radiusOff);
        vertexs[triIndex + 2] = vertexs[triIndex + 5] = 0.5 * Math.sin(sliceAngle * i + radiusOff);
        vertexs[triIndex + 1] = 0.5;
        vertexs[triIndex + 4] = -0.5;
    }
    let tileData = new NavTileCache();
    tileData.triVertex = vertexs;
    tileData.triIndex = new Uint32Array(ibs);
    tileData.triFlag = flags;
    return tileData;
}

/**
 * <code>NavObstacles</code> 常用形状。
 */
export class NavObstacles extends NavModifleBase {

    /**@internal */
    static _mapDatas: Map<NavObstaclesMeshType, NavTileCache>;
    /**@internal */
    static _defaltBound: Bounds;
    /**@internal */
    static _TempVec3: Vector3;
    /**@internal */
    static _init_() {
        this._mapDatas = new Map<NavObstaclesMeshType, any>();
        this._mapDatas.set(NavObstaclesMeshType.BOX, createObstacleData(4, Math.PI / 4));
        this._mapDatas.set(NavObstaclesMeshType.CAPSULE, createObstacleData(16, 0));
        this._defaltBound = new Bounds(new Vector3(-0.5, -0.5, -0.5), new Vector3(0.5, 0.5, 0.5));
        this._TempVec3 = new Vector3();
    }

    /**@internal */
    private _meshType: NavObstaclesMeshType = NavObstaclesMeshType.BOX;
    /**@internal */
    private _localMat: Matrix4x4;
    /**@internal */
    private _center: Vector3 = new Vector3(0, 0, 0);
    /**@internal */
    private _size: Vector3 = new Vector3(1, 1, 1);
    /**@internal */
    private _height: number = 1;
    /**@internal */
    private _radius: number = 0.5;
    /**@internal */
    private _crave: boolean;//TODO

    set meshType(value: NavObstaclesMeshType) {
        if (this._meshType == value)
            return;
        this._meshType = value;
        this._dtNavTileCache.init(NavObstacles._mapDatas.get(this._meshType).bindData);
        if (this._enabled)
            this._onWorldMatNeedChange();
    }

    get meshType() {
        return this._meshType;
    }

    /**
     * 中心偏移
     */
    set center(value: Vector3) {
        value.cloneTo(this._center);
        if (this._enabled) this._onWorldMatNeedChange();
    }

    get center() {
        return this._center;
    }

    /**
     * box size
     */
    set size(value: Vector3) {
        value.cloneTo(this.size);
        if (this._enabled && this._meshType == NavObstaclesMeshType.BOX) {
            this._onWorldMatNeedChange();
        }
    }

    get size() {
        return this._size;
    }

    /**
     * 圆柱高
     */
    set height(value: number) {
        this._height = value;
        if (this._enabled && this._meshType == NavObstaclesMeshType.CAPSULE) {
            this._onWorldMatNeedChange();
        }
    }

    get height() {
        return this._height;
    }

    /**
     * 圆柱半径
     */
    set radius(value: number) {
        this._radius = value;
        if (this._enabled && this._meshType == NavObstaclesMeshType.CAPSULE) {
            this._onWorldMatNeedChange();
        }
    }

    get radius() {
        return this._radius;
    }

    constructor() {
        super();
        this._localMat = new Matrix4x4();
    }

    /**@internal */
    protected _onEnable(): void {
        this._navManager = (this.owner.scene as Scene3D).getComponentElementManager("navMesh") as NavigationManager;
        this._dtNavTileCache.init(NavObstacles._mapDatas.get(this._meshType).bindData);
        super._onEnable();
    }


    /**
     * @internal
     */
    _refeashTranfrom(mat: Matrix4x4, bound: Bounds) {
        if (this._meshType == NavObstaclesMeshType.BOX) {
            Matrix4x4.createAffineTransformation(this._center, Quaternion.DEFAULT, this._size, this._localMat);
        } else {
            NavObstacles._TempVec3.setValue(this.radius, this.height, this.radius);
            Matrix4x4.createAffineTransformation(this._center, Quaternion.DEFAULT, NavObstacles._TempVec3, this._localMat);
        }
        Matrix4x4.multiply(mat, this._localMat, this._localMat);
        NavObstacles._defaltBound._tranform(this._localMat, bound);
        this._dtNavTileCache.transfromData(this._localMat.elements);
    }

    /**@internal */
    protected _onDestroy(): void {
        super._onDestroy();
    }

    /**@internal */
    _cloneTo(dest: Component): void {
        let obstacles = dest as NavObstacles;
        this._center.cloneTo(obstacles.center);
        obstacles._meshType = this._meshType;
        this.size.cloneTo(obstacles.size);
        obstacles.radius = this.radius;
        obstacles.height = this.height;
        super._cloneTo(dest);
    }

}