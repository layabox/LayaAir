import { Laya } from "../../../Laya";
import { Component } from "../../components/Component";
import { Scene } from "../../display/Scene";
import { BaseNavigationManager } from "../common/BaseNavigationManager";
import { NavigationConfig } from "../common/NavigationConfig";
import { NavTileCache } from "../common/NavTileData";
import { Navgiation2DUtils } from "./Navgiation2DUtils";



let create2DObstacleData = function (slices: number, radiusOff: number = 0, radius: number = 1): NavTileCache {
    let vertexs = new Float32Array(slices * 3);
    const triCount = slices - 2;
    let flags = new Uint8Array(triCount);
    flags.fill(1);
    let ibs = [];
    for (var i = 2; i < slices; i++) {
        ibs.push(0, i, i - 1);
    }
    var sliceAngle = (Math.PI * 2.0) / slices;
    for (var i = 0; i < slices; i++) {
        let triIndex = i * 3;
        vertexs[triIndex] = radius * Math.cos(sliceAngle * i + radiusOff);
        vertexs[triIndex + 2] = radius * Math.sin(sliceAngle * i + radiusOff);
        vertexs[triIndex + 1] = 0;
    }
    let tileData = new NavTileCache();
    tileData.triVertex = vertexs;
    tileData.triIndex = new Uint32Array(ibs);
    tileData.triFlag = flags;
    tileData.boundMin.setValue(-radius, 0, -radius);
    tileData.boundMax.setValue(radius, 0, radius);
    return tileData;
}
export enum NavObstacles2DType {
    RECT,
    CIRCLE,
    CUSTOMER,
}
export class Navigation2DManage extends BaseNavigationManager {

    /**@internal */
    static _managerName = "navMesh2D";
    
    static _obstacleMap:Map<NavObstacles2DType,NavTileCache> = new Map();

    /**
     * 获取导航管理器
     * @internal
     * @param comp 
     */
    static _getNavManager(comp: Component): Navigation2DManage {
        let scene = comp.owner.scene as Scene;
        if (scene) {
            return scene.getComponentElementManager(Navigation2DManage._managerName) as Navigation2DManage;
        } else {
            return null;
        }
    }

    /** @internal */
    static __initialize(): Promise<void> {
        return BaseNavigationManager._initialize(() => {
            Navigation2DManage.__init__();
            Navgiation2DUtils.__init__();
        });
    }

    /**@internal */
    protected static __init__(): void {
        this._obstacleMap.set(NavObstacles2DType.RECT, create2DObstacleData(4, Math.PI / 4, 1 / Math.sqrt(2)));
        this._obstacleMap.set(NavObstacles2DType.CIRCLE, create2DObstacleData(60, 0));
    }

    /** @internal */
    static _getObstacleData(type: NavObstacles2DType): NavTileCache {
        return this._obstacleMap.get(type);
    }

    constructor() {
        super(Navigation2DManage._managerName);
    }

    /** 
     * @internal 
     */
    _init(): void {
        super._init();
        let config = this.getNavConfig(NavigationConfig.defaltAgentName);
        config.cellSize = 2;
        config.tileSize = 256;
    }
}

//reg nav Component Manager
Scene.regManager(Navigation2DManage._managerName, Navigation2DManage);
//reg loader init
//Laya.addBeforeInitCallback(Navigation2DManage.__initialize);