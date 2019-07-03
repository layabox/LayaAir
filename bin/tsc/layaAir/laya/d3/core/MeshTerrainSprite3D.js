import { MeshSprite3D } from "./MeshSprite3D";
import { HeightMap } from "./HeightMap";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Vector2 } from "../math/Vector2";
import { Vector3 } from "../math/Vector3";
/**
 * <code>TerrainMeshSprite3D</code> 类用于创建网格。
 */
export class MeshTerrainSprite3D extends MeshSprite3D {
    /**
     * 创建一个 <code>TerrainMeshSprite3D</code> 实例。
     * @param mesh 网格。
     * @param heightMap 高度图。
     * @param name 名字。
     */
    constructor(mesh, heightMap, name = null) {
        super(mesh, name);
        this._heightMap = heightMap;
        this._cellSize = new Vector2();
    }
    /**
     * 从网格创建一个TerrainMeshSprite3D实例和其高度图属性。
     * @param mesh 网格。
     * @param heightMapWidth 高度图宽度。
     * @param heightMapHeight 高度图高度。
     * @param name 名字。
     */
    static createFromMesh(mesh, heightMapWidth, heightMapHeight, name = null) {
        var meshTerrainSprite3D = new MeshTerrainSprite3D(mesh, null, name);
        meshTerrainSprite3D._initCreateFromMesh(heightMapWidth, heightMapHeight);
        return meshTerrainSprite3D;
    }
    /**
     * 从网格创建一个TerrainMeshSprite3D实例、图片读取高度图属性。
     * @param mesh 网格。
     * @param image 高度图。
     * @param name 名字。
     */
    static createFromMeshAndHeightMap(mesh, texture, minHeight, maxHeight, name = null) {
        var meshTerrainSprite3D = new MeshTerrainSprite3D(mesh, null, name);
        meshTerrainSprite3D._initCreateFromMeshHeightMap(texture, minHeight, maxHeight);
        return meshTerrainSprite3D;
    }
    /**
     * 获取地形X轴最小位置。
     * @return  地形X轴最小位置。
     */
    get minX() {
        var worldMat = this.transform.worldMatrix;
        var worldMatE = worldMat.elements;
        return this._minX * this._getScaleX() + worldMatE[12];
    }
    /**
     * 获取地形Z轴最小位置。
     * @return  地形X轴最小位置。
     */
    get minZ() {
        var worldMat = this.transform.worldMatrix;
        var worldMatE = worldMat.elements;
        return this._minZ * this._getScaleZ() + worldMatE[14];
    }
    /**
     * 获取地形X轴长度。
     * @return  地形X轴长度。
     */
    get width() {
        return (this._heightMap.width - 1) * this._cellSize.x * this._getScaleX();
    }
    /**
     * 获取地形Z轴长度。
     * @return  地形Z轴长度。
     */
    get depth() {
        return (this._heightMap.height - 1) * this._cellSize.y * this._getScaleZ();
    }
    _disableRotation() {
        var rotation = this.transform.rotation;
        rotation.x = 0;
        rotation.y = 0;
        rotation.z = 0;
        rotation.w = 1;
        this.transform.rotation = rotation;
    }
    _getScaleX() {
        var worldMat = this.transform.worldMatrix;
        var worldMatE = worldMat.elements;
        var m11 = worldMatE[0];
        var m12 = worldMatE[1];
        var m13 = worldMatE[2];
        return Math.sqrt((m11 * m11) + (m12 * m12) + (m13 * m13));
    }
    _getScaleZ() {
        var worldMat = this.transform.worldMatrix;
        var worldMatE = worldMat.elements;
        var m31 = worldMatE[8];
        var m32 = worldMatE[9];
        var m33 = worldMatE[10];
        return Math.sqrt((m31 * m31) + (m32 * m32) + (m33 * m33));
    }
    _initCreateFromMesh(heightMapWidth, heightMapHeight) {
        this._heightMap = HeightMap.creatFromMesh(this.meshFilter.sharedMesh, heightMapWidth, heightMapHeight, this._cellSize);
        var boundingBox = this.meshFilter.sharedMesh.bounds;
        var min = boundingBox.getMin();
        var max = boundingBox.getMax();
        this._minX = min.x;
        this._minZ = min.z;
    }
    _initCreateFromMeshHeightMap(texture, minHeight, maxHeight) {
        var boundingBox = this.meshFilter.sharedMesh.bounds;
        this._heightMap = HeightMap.createFromImage(texture, minHeight, maxHeight);
        this._computeCellSize(boundingBox);
        var min = boundingBox.getMin();
        var max = boundingBox.getMax();
        this._minX = min.x;
        this._minZ = min.z;
    }
    _computeCellSize(boundingBox) {
        var min = boundingBox.getMin();
        var max = boundingBox.getMax();
        var minX = min.x;
        var minZ = min.z;
        var maxX = max.x;
        var maxZ = max.z;
        var widthSize = maxX - minX;
        var heightSize = maxZ - minZ;
        this._cellSize.x = widthSize / (this._heightMap.width - 1);
        this._cellSize.y = heightSize / (this._heightMap.height - 1);
    }
    /**
     * @internal
     */
    _update(state) {
        this._disableRotation();
        //super._update(state);
    }
    /**
     * 获取地形高度。
     * @param x X轴坐标。
     * @param z Z轴坐标。
     */
    getHeight(x, z) {
        MeshTerrainSprite3D._tempVector3.x = x;
        MeshTerrainSprite3D._tempVector3.y = 0;
        MeshTerrainSprite3D._tempVector3.z = z;
        this._disableRotation();
        var worldMat = this.transform.worldMatrix;
        worldMat.invert(MeshTerrainSprite3D._tempMatrix4x4);
        Vector3.transformCoordinate(MeshTerrainSprite3D._tempVector3, MeshTerrainSprite3D._tempMatrix4x4, MeshTerrainSprite3D._tempVector3);
        x = MeshTerrainSprite3D._tempVector3.x;
        z = MeshTerrainSprite3D._tempVector3.z;
        var c = (x - this._minX) / this._cellSize.x;
        var d = (z - this._minZ) / this._cellSize.y;
        var row = Math.floor(d);
        var col = Math.floor(c);
        var s = c - col;
        var t = d - row;
        var uy;
        var vy;
        var worldMatE = worldMat.elements;
        var m21 = worldMatE[4];
        var m22 = worldMatE[5];
        var m23 = worldMatE[6];
        var scaleY = Math.sqrt((m21 * m21) + (m22 * m22) + (m23 * m23));
        var translateY = worldMatE[13];
        var h01 = this._heightMap.getHeight(row, col + 1);
        var h10 = this._heightMap.getHeight((row + 1), col);
        if (isNaN(h01) || isNaN(h10))
            return NaN;
        if (s + t <= 1.0) {
            var h00 = this._heightMap.getHeight(row, col);
            if (isNaN(h00))
                return NaN;
            uy = h01 - h00;
            vy = h10 - h00;
            return (h00 + s * uy + t * vy) * scaleY + translateY;
        }
        else {
            var h11 = this._heightMap.getHeight((row + 1), col + 1);
            if (isNaN(h11))
                return NaN;
            uy = h10 - h11;
            vy = h01 - h11;
            return (h11 + (1.0 - s) * uy + (1.0 - t) * vy) * scaleY + translateY;
        }
    }
}
MeshTerrainSprite3D._tempVector3 = new Vector3();
MeshTerrainSprite3D._tempMatrix4x4 = new Matrix4x4();
