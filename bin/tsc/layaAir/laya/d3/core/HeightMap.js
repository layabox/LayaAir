import { Ray } from "../math/Ray";
import { Vector3 } from "../math/Vector3";
import { Picker } from "../utils/Picker";
/**
 * <code>HeightMap</code> 类用于实现高度图数据。
 */
export class HeightMap {
    /**
     * 创建一个 <code>HeightMap</code> 实例。
     * @param width 宽度。
     * @param height 高度。
     * @param minHeight 最大高度。
     * @param maxHeight 最大高度。
     */
    constructor(width, height, minHeight, maxHeight) {
        this._datas = [];
        this._w = width;
        this._h = height;
        this._minHeight = minHeight;
        this._maxHeight = maxHeight;
    }
    /**
     * 从网格精灵生成高度图。
     * @param meshSprite 网格精灵。
     * @param width	高度图宽度。
     * @param height 高度图高度。
     * @param outCellSize 输出 单元尺寸。
     */
    static creatFromMesh(mesh, width, height, outCellSize) {
        var vertices = [];
        var indexs = [];
        var submesheCount = mesh.subMeshCount;
        for (var i = 0; i < submesheCount; i++) {
            var subMesh = mesh.getSubMesh(i);
            var vertexBuffer = subMesh._vertexBuffer;
            var verts = vertexBuffer.getFloat32Data();
            var subMeshVertices = [];
            for (var j = 0; j < verts.length; j += vertexBuffer.vertexDeclaration.vertexStride / 4) {
                var position = new Vector3(verts[j + 0], verts[j + 1], verts[j + 2]);
                subMeshVertices.push(position);
            }
            vertices.push(subMeshVertices);
            var ib = subMesh._indexBuffer;
            indexs.push(ib.getData());
        }
        var bounds = mesh.bounds;
        var minX = bounds.getMin().x;
        var minZ = bounds.getMin().z;
        var maxX = bounds.getMax().x;
        var maxZ = bounds.getMax().z;
        var minY = bounds.getMin().y;
        var maxY = bounds.getMax().y;
        var widthSize = maxX - minX;
        var heightSize = maxZ - minZ;
        var cellWidth = outCellSize.x = widthSize / (width - 1);
        var cellHeight = outCellSize.y = heightSize / (height - 1);
        var heightMap = new HeightMap(width, height, minY, maxY);
        var ray = HeightMap._tempRay;
        var rayDir = ray.direction; //Direction
        rayDir.x = 0;
        rayDir.y = -1;
        rayDir.z = 0;
        const heightOffset = 0.1; //OriginalY
        var rayY = maxY + heightOffset;
        ray.origin.y = rayY;
        for (var h = 0; h < height; h++) {
            var posZ = minZ + h * cellHeight;
            heightMap._datas[h] = [];
            for (var w = 0; w < width; w++) {
                var posX = minX + w * cellWidth;
                var rayOri = ray.origin;
                rayOri.x = posX;
                rayOri.z = posZ;
                var closestIntersection = HeightMap._getPosition(ray, vertices, indexs);
                heightMap._datas[h][w] = (closestIntersection === Number.MAX_VALUE) ? NaN : rayY - closestIntersection;
            }
        }
        return heightMap;
    }
    /**
     * 从图片生成高度图。
     * @param image 图片。
     * @param maxHeight 最小高度。
     * @param maxHeight 最大高度。
     */
    static createFromImage(texture, minHeight, maxHeight) {
        var textureWidth = texture.width;
        var textureHeight = texture.height;
        var heightMap = new HeightMap(textureWidth, textureHeight, minHeight, maxHeight);
        var compressionRatio = (maxHeight - minHeight) / 254;
        var pixelsInfo = texture.getPixels();
        var index = 0;
        for (var h = 0; h < textureHeight; h++) {
            var colDatas = heightMap._datas[h] = [];
            for (var w = 0; w < textureWidth; w++) {
                var r = pixelsInfo[index++];
                var g = pixelsInfo[index++];
                var b = pixelsInfo[index++];
                var a = pixelsInfo[index++];
                if (r == 255 && g == 255 && b == 255 && a == 255)
                    colDatas[w] = NaN;
                else {
                    colDatas[w] = (r + g + b) / 3 * compressionRatio + minHeight;
                }
            }
        }
        return heightMap;
    }
    static _getPosition(ray, vertices, indexs) {
        var closestIntersection = Number.MAX_VALUE;
        for (var i = 0; i < vertices.length; i++) {
            var subMeshVertices = vertices[i];
            var subMeshIndexes = indexs[i];
            for (var j = 0; j < subMeshIndexes.length; j += 3) {
                var vertex1 = subMeshVertices[subMeshIndexes[j + 0]];
                var vertex2 = subMeshVertices[subMeshIndexes[j + 1]];
                var vertex3 = subMeshVertices[subMeshIndexes[j + 2]];
                var intersection = Picker.rayIntersectsTriangle(ray, vertex1, vertex2, vertex3);
                if (!isNaN(intersection) && intersection < closestIntersection) {
                    closestIntersection = intersection;
                }
            }
        }
        return closestIntersection;
    }
    /**
     * 获取宽度。
     * @return value 宽度。
     */
    get width() {
        return this._w;
    }
    /**
     * 获取高度。
     * @return value 高度。
     */
    get height() {
        return this._h;
    }
    /**
     * 最大高度。
     * @return value 最大高度。
     */
    get maxHeight() {
        return this._maxHeight;
    }
    /**
     * 最大高度。
     * @return value 最大高度。
     */
    get minHeight() {
        return this._minHeight;
    }
    /** @internal */
    _inBounds(row, col) {
        return row >= 0 && row < this._h && col >= 0 && col < this._w;
    }
    /**
     * 获取高度。
     * @param row 列数。
     * @param col 行数。
     * @return 高度。
     */
    getHeight(row, col) {
        if (this._inBounds(row, col))
            return this._datas[row][col];
        else
            return NaN;
    }
}
HeightMap._tempRay = new Ray(new Vector3(), new Vector3());
