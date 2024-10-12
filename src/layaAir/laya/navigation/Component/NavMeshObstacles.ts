
import { Component } from "../../components/Component";
import { Scene3D } from "../../d3/core/scene/Scene3D";
import { Matrix4x4 } from "../../maths/Matrix4x4";
import { Quaternion } from "../../maths/Quaternion";
import { Vector3 } from "../../maths/Vector3";
import { NavTileCache } from "../NavTileData";
import { NavigationManager } from "../NavigationManager";
import { NavigationUtils } from "../NavigationUtils";
import { NavModifleBase } from "./NavModifleBase";

/**
 * @en Enum for the different types of obstacle meshes supported by the navigation system.
 * @zh 导航系统支持的不同类型的障碍物网格枚举。
 */
export enum NavObstaclesMeshType {
    BOX,
    CAPSULE,
    Num
}

let createObstacleData = function (slices: number, radiusOff: number = 0, radius: number = 1): NavTileCache {
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
        vertexs[triIndex] = vertexs[triIndex + 3] = radius * Math.cos(sliceAngle * i + radiusOff);
        vertexs[triIndex + 2] = vertexs[triIndex + 5] = radius * Math.sin(sliceAngle * i + radiusOff);
        vertexs[triIndex + 1] = radius;
        vertexs[triIndex + 4] = -radius;
    }
    let tileData = new NavTileCache();
    tileData.triVertex = vertexs;
    tileData.triIndex = new Uint32Array(ibs);
    tileData.triFlag = flags;
    return tileData;
}

/**
 * @en NavMeshObstacles Common shapes for navigation mesh obstacles.
 * @zh NavMeshObstacles 常用的导航网格障碍物形状。
 */
export class NavMeshObstacles extends NavModifleBase {

    /**@internal */
    static _mapDatas: Map<NavObstaclesMeshType, NavTileCache>;
    /**@internal */
    static _defaltMin: Vector3;
    static _defaltMax: Vector3;
    /**@internal */
    static _TempVec3: Vector3;
    /**@internal */
    static _init_() {
        this._mapDatas = new Map<NavObstaclesMeshType, any>();
        this._mapDatas.set(NavObstaclesMeshType.BOX, createObstacleData(4, Math.PI / 4, 1 / Math.sqrt(2)));
        this._mapDatas.set(NavObstaclesMeshType.CAPSULE, createObstacleData(16, 0));
        this._defaltMin = new Vector3(-0.5, -0.5, -0.5);
        this._defaltMax = new Vector3(0.5, 0.5, 0.5);
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

    /**
     * @en The mesh type of the obstacle.
     * @param value The mesh type to set.
     * @zh 障碍物的网格类型。
     * @param value 障碍物的网格类型。
     */
    get meshType() {
        return this._meshType;
    }

    set meshType(value: NavObstaclesMeshType) {
        if (this._meshType == value)
            return;
        this._meshType = value;
        this._dtNavTileCache.init(NavMeshObstacles._mapDatas.get(this._meshType).bindData);
        if (this._enabled)
            this._onWorldMatNeedChange();
    }

    /**
     * @en The center offset of the obstacle.
     * @param value The center offset vector to set.
     * @zh 障碍物的中心偏移。
     * @param value 障碍物的中心偏移向量。
     */
    get center() {
        return this._center;
    }

    set center(value: Vector3) {
        value.cloneTo(this._center);
        if (this._enabled) this._onWorldMatNeedChange();
    }

    /**
     * @en The size of the box obstacle.
     * @param value The size vector to set.
     * @zh 盒型障碍物的大小。
     * @param value 盒型障碍物的大小向量。
     */
    get size() {
        return this._size;
    }

    set size(value: Vector3) {
        value.cloneTo(this.size);
        if (this._enabled && this._meshType == NavObstaclesMeshType.BOX) {
            this._onWorldMatNeedChange();
        }
    }


    /**
     * @en The height of the capsule obstacle.
     * @param value The height to set.
     * @zh 胶囊障碍物的圆柱高度。
     * @param value 胶囊障碍物的圆柱高度。
     */
    get height() {
        return this._height;
    }

    set height(value: number) {
        this._height = value;
        if (this._enabled && this._meshType == NavObstaclesMeshType.CAPSULE) {
            this._onWorldMatNeedChange();
        }
    }

    /**
     * @en Set the radius of the capsule obstacle.
     * @param value The radius to set.
     * @zh 设置胶囊障碍物的圆柱半径。
     * @param value 胶囊障碍物的圆柱半径。
     */
    get radius() {
        return this._radius;
    }

    set radius(value: number) {
        this._radius = value;
        if (this._enabled && this._meshType == NavObstaclesMeshType.CAPSULE) {
            this._onWorldMatNeedChange();
        }
    }

    /**
     * @ignore
     * @en Create a new NavMeshObstacles instance.
     * @zh 创建NavMeshObstacles的一个新实例。
     */
    constructor() {
        super();
        this._localMat = new Matrix4x4();
    }

    /**@internal */
    protected _onEnable(): void {
        this._navManager = (this.owner.scene as Scene3D).getComponentElementManager("navMesh") as NavigationManager;
        this._dtNavTileCache.init(NavMeshObstacles._mapDatas.get(this._meshType).bindData);
        super._onEnable();
    }


    /**
     * @internal
     */
    _refeashTranfrom(mat: Matrix4x4, min:Vector3,max:Vector3) {
        if (this._meshType == NavObstaclesMeshType.BOX) {
            Matrix4x4.createAffineTransformation(this._center, Quaternion.DEFAULT, this._size, this._localMat);
        } else {
            NavMeshObstacles._TempVec3.setValue(this.radius, this.height, this.radius);
            Matrix4x4.createAffineTransformation(this._center, Quaternion.DEFAULT, NavMeshObstacles._TempVec3, this._localMat);
        }
        Matrix4x4.multiply(mat, this._localMat, this._localMat);
        NavigationUtils.transfromBound(this._localMat, NavMeshObstacles._defaltMin, NavMeshObstacles._defaltMax, min, max);
        this._dtNavTileCache.transfromData(this._localMat.elements);
    }

    /**@internal */
    protected _onDestroy(): void {
        super._onDestroy();
    }

    /**@internal */
    _cloneTo(dest: Component): void {
        let obstacles = dest as NavMeshObstacles;
        this._center.cloneTo(obstacles.center);
        obstacles._meshType = this._meshType;
        this.size.cloneTo(obstacles.size);
        obstacles.radius = this.radius;
        obstacles.height = this.height;
        super._cloneTo(dest);
    }

}