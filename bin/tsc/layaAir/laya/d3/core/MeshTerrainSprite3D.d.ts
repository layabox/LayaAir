import { MeshSprite3D } from "./MeshSprite3D";
import { HeightMap } from "./HeightMap";
import { Mesh } from "../resource/models/Mesh";
import { Texture2D } from "../../resource/Texture2D";
/**
 * <code>TerrainMeshSprite3D</code> 类用于创建网格。
 */
export declare class MeshTerrainSprite3D extends MeshSprite3D {
    private static _tempVector3;
    private static _tempMatrix4x4;
    /**
     * 从网格创建一个TerrainMeshSprite3D实例和其高度图属性。
     * @param mesh 网格。
     * @param heightMapWidth 高度图宽度。
     * @param heightMapHeight 高度图高度。
     * @param name 名字。
     */
    static createFromMesh(mesh: Mesh, heightMapWidth: number, heightMapHeight: number, name?: string): MeshTerrainSprite3D;
    /**
     * 从网格创建一个TerrainMeshSprite3D实例、图片读取高度图属性。
     * @param mesh 网格。
     * @param image 高度图。
     * @param name 名字。
     */
    static createFromMeshAndHeightMap(mesh: Mesh, texture: Texture2D, minHeight: number, maxHeight: number, name?: string): MeshTerrainSprite3D;
    private _minX;
    private _minZ;
    private _cellSize;
    private _heightMap;
    /**
     * 获取地形X轴最小位置。
     * @return  地形X轴最小位置。
     */
    readonly minX: number;
    /**
     * 获取地形Z轴最小位置。
     * @return  地形X轴最小位置。
     */
    readonly minZ: number;
    /**
     * 获取地形X轴长度。
     * @return  地形X轴长度。
     */
    readonly width: number;
    /**
     * 获取地形Z轴长度。
     * @return  地形Z轴长度。
     */
    readonly depth: number;
    /**
     * 创建一个 <code>TerrainMeshSprite3D</code> 实例。
     * @param mesh 网格。
     * @param heightMap 高度图。
     * @param name 名字。
     */
    constructor(mesh: Mesh, heightMap: HeightMap, name?: string);
    private _disableRotation;
    private _getScaleX;
    private _getScaleZ;
    private _initCreateFromMesh;
    private _initCreateFromMeshHeightMap;
    private _computeCellSize;
    /**
     * 获取地形高度。
     * @param x X轴坐标。
     * @param z Z轴坐标。
     */
    getHeight(x: number, z: number): number;
}
