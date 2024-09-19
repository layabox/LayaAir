import { Laya } from "../../../Laya";
import { Component } from "../../components/Component";
import { Scene3D } from "../../d3/core/scene/Scene3D";
import { BaseNavigationManager } from "../common/BaseNavigationManager";
import { NavTileCache } from "../common/NavTileData";

export enum NavObstaclesMeshType {
    BOX,
    CYLINDER,
    CUSTOMER,
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
    tileData.boundMin.setValue(-radius, -radius, -radius);
    tileData.boundMax.setValue(radius, radius, radius);
    return tileData;
}

export class NavigationManager extends BaseNavigationManager {
    /**@internal  */
    static managerName: string = "navMesh";
    static _obstacleMap: Map<NavObstaclesMeshType, NavTileCache> = new Map();

    static getNavManager(comp: Component): NavigationManager {
        return (comp.owner.scene as Scene3D).getComponentElementManager(NavigationManager.managerName) as NavigationManager;
    }


    static initialize(): Promise<void> {

        return BaseNavigationManager._initialize(() => {
            NavigationManager.__init__();
        });
    }

    private static __init__(): void {
        NavigationManager._obstacleMap.set(NavObstaclesMeshType.BOX, createObstacleData(4));
        NavigationManager._obstacleMap.set(NavObstaclesMeshType.CYLINDER, createObstacleData(20));
    }

    static getObstacleData(type: NavObstaclesMeshType): NavTileCache {
        return this._obstacleMap.get(type);
    }

    constructor() {
        super(NavigationManager.managerName);
    }

}

//reg nav Component Manager
Scene3D.regManager(NavigationManager.managerName, NavigationManager);
//reg loader init
Laya.addBeforeInitCallback(NavigationManager.initialize);