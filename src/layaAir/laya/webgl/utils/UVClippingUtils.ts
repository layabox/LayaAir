import { Vector4 } from "../../maths/Vector4";
import { Earcut } from "../shapes/Earcut";

/**
 * @en Clip vertex structure with position, UV, and color data
 * @zh 裁剪顶点结构,包含位置、UV和颜色数据
 */
interface _ClipVertex {
    x: number;
    y: number;
    u: number;
    v: number;
    r: number;
    g: number;
    b: number;
    a: number;
    index: number; // 原始顶点索引，用于快速查找预计算的边界状态
}

const _ClipTriangle: _ClipVertex[] = [
    { x: 0, y: 0, u: 0, v: 0, r: 0, g: 0, b: 0, a: 0, index: 0 },
    { x: 0, y: 0, u: 0, v: 0, r: 0, g: 0, b: 0, a: 0, index: 0 },
    { x: 0, y: 0, u: 0, v: 0, r: 0, g: 0, b: 0, a: 0, index: 0 }
];

const tempVec4 = new Vector4();

/**
 * @en UV-based triangle clipping utilities for 2D rendering
 * @zh 用于2D渲染的UV三角形裁剪工具类
 */
export class UVClippingUtils {
    /** @en Epsilon value for floating point comparison */
    private static readonly EPSILON = 1e-7;

    /**
     * @en CPU-side UV vertex clipping. Clips triangles based on UV range and outputs clipped vertices, indices, UVs, and color data.
     * @param vertices Vertex position array (x, y pairs)
     * @param indices Index array (groups of 3 for each triangle)
     * @param uvs UV coordinate array (u, v pairs)
     * @param uvRange Clipping range [minU, minV, width, height]
     * @param colors Vertex color array (r, g, b, a groups of 4)
     * @returns Clipped data {vertices, indices, uvs, colors}
     * @zh CPU端UV顶点裁剪。根据UV范围裁剪三角形，输出裁剪后的顶点、索引、UV和颜色数据。
     * @param vertices 顶点位置数组 (x, y 成对)
     * @param indices 索引数组 (每3个一组表示一个三角形)
     * @param uvs UV坐标数组 (u, v 成对)
     * @param uvRange 裁剪范围 [minU, minV, width, height]
     * @param colors 顶点颜色数组 (r, g, b, a 四个一组)
     * @returns 裁剪后的数据 {vertices, indices, uvs, colors}
     */
    static clipTrianglesByUVRange(
        vertices: Float32Array,
        indices: Uint16Array,
        uvs: Float32Array,
        uvRange: ArrayLike<number>,
        colors: Float32Array
    ): { vertices: Float32Array, indices: Uint16Array, uvs: Float32Array, colors: Float32Array } {

        const EPSILON = UVClippingUtils.EPSILON;
        const minU = uvRange[0];
        const minV = uvRange[1];
        const maxU = uvRange[0] + uvRange[2];
        const maxV = uvRange[1] + uvRange[3];
        let epsilon_edge = tempVec4
        epsilon_edge.x = minU - EPSILON;
        epsilon_edge.y = minV - EPSILON;
        epsilon_edge.z = maxU + EPSILON;
        epsilon_edge.w = maxV + EPSILON;
        
        // bit0=left, bit1=right, bit2=bottom, bit3=top (1表示inside，0表示outside)
        const vertexCount = uvs.length / 2;
        const vertexInsideFlags = new Uint8Array(vertexCount);
        let allUVsInside = true;
        
        for (let i = 0; i < vertexCount; i++) {
            const u = uvs[i * 2];
            const v = uvs[i * 2 + 1];
            let flags = 0;
            
            // 计算四个边界的状态
            if (u >= epsilon_edge.x) flags |= 0x01; // left inside
            if (u <= epsilon_edge.z) flags |= 0x02; // right inside
            if (v >= epsilon_edge.y) flags |= 0x04; // bottom inside
            if (v <= epsilon_edge.w) flags |= 0x08; // top inside
            
            vertexInsideFlags[i] = flags;
            
            // 如果顶点不在完全内部（所有位都是1），标记为不全在内部
            if (flags !== 0x0F) {
                allUVsInside = false;
            }
        }
        
        if (allUVsInside) {
            return {
                vertices,
                indices,
                uvs,
                colors,
            };
        }
        
        // 输出数组
        const outVertices: number[] = [];
        const outIndices: number[] = [];
        const outUVs: number[] = [];
        const outColors: number[] = [];
        let nextVertexIndex = 0;

        const addVertex = (vert: _ClipVertex): number => {
            const index = nextVertexIndex++;
            outVertices.push(vert.x, vert.y);
            outUVs.push(vert.u, vert.v);
            outColors.push(vert.r, vert.g, vert.b, vert.a);
            return index;
        };

        // 判断顶点是否在裁剪边内侧
        const isInside = (vert: _ClipVertex, edge: number): boolean => {
            switch (edge) {
                case 0: return vert.u >= epsilon_edge.x; // left
                case 1: return vert.u <= epsilon_edge.z; // right
                case 2: return vert.v >= epsilon_edge.y; // bottom
                case 3: return vert.v <= epsilon_edge.w; // top
            }
            return false;
        };

        // 计算线段与裁剪边的交点（线性插值）
        const computeIntersection = (v1: _ClipVertex, v2: _ClipVertex, edge: number): _ClipVertex | null => {
            let t: number;

            // 根据裁剪边计算插值参数 t
            switch (edge) {
                case 0: // left: u = minU
                    if (Math.abs(v2.u - v1.u) < EPSILON) return null;
                    t = (minU - v1.u) / (v2.u - v1.u);
                    break;
                case 1: // right: u = maxU
                    if (Math.abs(v2.u - v1.u) < EPSILON) return null;
                    t = (maxU - v1.u) / (v2.u - v1.u);
                    break;
                case 2: // bottom: v = minV
                    if (Math.abs(v2.v - v1.v) < EPSILON) return null;
                    t = (minV - v1.v) / (v2.v - v1.v);
                    break;
                case 3: // top: v = maxV
                    if (Math.abs(v2.v - v1.v) < EPSILON) return null;
                    t = (maxV - v1.v) / (v2.v - v1.v);
                    break;
                default:
                    return null;
            }

            if (t < -EPSILON || t > 1 + EPSILON) return null;

            return {
                x: v1.x + t * (v2.x - v1.x),
                y: v1.y + t * (v2.y - v1.y),
                u: v1.u + t * (v2.u - v1.u),
                v: v1.v + t * (v2.v - v1.v),
                r: v1.r + t * (v2.r - v1.r),
                g: v1.g + t * (v2.g - v1.g),
                b: v1.b + t * (v2.b - v1.b),
                a: v1.a + t * (v2.a - v1.a),
                index: -1 // 交点顶点，没有原始索引
            };
        };

        // Sutherland-Hodgman算法：用一条边裁剪多边形
        const clipPolygonByEdge = (inputVertices: _ClipVertex[], edge: number): _ClipVertex[] => {
            if (inputVertices.length === 0) return [];

            const output: _ClipVertex[] = [];
            const edgeMask = 1 << edge;

            for (let i = 0; i < inputVertices.length; i++) {
                const current = inputVertices[i];
                const next = inputVertices[(i + 1) % inputVertices.length];

                const currentInside = current.index >= 0 
                    ? (vertexInsideFlags[current.index] & edgeMask) !== 0
                    : isInside(current, edge);
                const nextInside = next.index >= 0
                    ? (vertexInsideFlags[next.index] & edgeMask) !== 0
                    : isInside(next, edge);

                if (currentInside) {
                    output.push(current);

                    if (!nextInside) {
                        // 下一个点在外侧，计算并输出交点
                        const intersection = computeIntersection(current, next, edge);
                        if (intersection) {
                            output.push(intersection);
                        }
                    }
                } else if (nextInside) {
                    // 当前点在外侧，下一个点在内侧，计算并输出交点
                    const intersection = computeIntersection(current, next, edge);
                    if (intersection) {
                        output.push(intersection);
                    }
                }
                // 两点都在外侧，不输出任何点
            }

            return output;
        };

        // Sutherland-Hodgman算法：用矩形裁剪多边形
        const clipPolygon = (inputVertices: _ClipVertex[]): _ClipVertex[] => {
            let result = inputVertices;

            for (let edge = 0; edge < 4; edge++) {
                result = clipPolygonByEdge(result, edge);
                if (result.length === 0) break;
            }

            return result;
        };

        const buildVertex = (index: number , vertexIndex: number): _ClipVertex => {
            let vertex = _ClipTriangle[index];
            vertex.x = vertices[vertexIndex * 2];
            vertex.y = vertices[vertexIndex * 2 + 1];
            vertex.u = uvs[vertexIndex * 2];
            vertex.v = uvs[vertexIndex * 2 + 1];
            vertex.r = colors[vertexIndex * 4];
            vertex.g = colors[vertexIndex * 4 + 1];
            vertex.b = colors[vertexIndex * 4 + 2];
            vertex.a = colors[vertexIndex * 4 + 3];
            vertex.index = vertexIndex; // 保存原始顶点索引，用于快速查找预计算的边界状态
            return vertex;
        };

        const triangleCount = indices.length / 3;
        let triangle = _ClipTriangle;
        for (let t = 0; t < triangleCount; t++) {
            buildVertex(0,indices[t * 3]);
            buildVertex(1,indices[t * 3 + 1]);
            buildVertex(2,indices[t * 3 + 2]);

            const flags0 = vertexInsideFlags[triangle[0].index];
            const flags1 = vertexInsideFlags[triangle[1].index];
            const flags2 = vertexInsideFlags[triangle[2].index];
            
            // 完全在内部：所有顶点的flags都是0x0F（所有边界都在内侧）
            if (flags0 === 0x0F && flags1 === 0x0F && flags2 === 0x0F) {
                const idx0 = addVertex(triangle[0]);
                const idx1 = addVertex(triangle[1]);
                const idx2 = addVertex(triangle[2]);
                outIndices.push(idx0, idx1, idx2);
                continue;
            }

            const combinedFlags = flags0 | flags1 | flags2;
            if (!(combinedFlags & 0x01) || // 所有顶点都在left外侧
                !(combinedFlags & 0x02) || // 所有顶点都在right外侧
                !(combinedFlags & 0x04) || // 所有顶点都在bottom外侧
                !(combinedFlags & 0x08)) { // 所有顶点都在top外侧
                continue;
            }

            const clippedPolygon = clipPolygon(triangle);

            if (clippedPolygon.length < 3) {// 裁剪后顶点不足3个，跳过
                continue;
            }
            
            if (clippedPolygon.length === 3) {// 已经是三角形，直接输出
                const idx0 = addVertex(clippedPolygon[0]);
                const idx1 = addVertex(clippedPolygon[1]);
                const idx2 = addVertex(clippedPolygon[2]);
                outIndices.push(idx0, idx1, idx2);
            } else {
                // 多边形需要三角化，使用Earcut
                const earcutData: number[] = [];
                for (let i = 0; i < clippedPolygon.length; i++) {
                    // 使用顶点位置进行三角化（更稳定）
                    earcutData.push(clippedPolygon[i].x, clippedPolygon[i].y);
                }

                const triangulated = Earcut.earcut(earcutData, null, 2);

                if (triangulated.length > 0) {
                    const vertexIndices: number[] = [];
                    for (let i = 0; i < clippedPolygon.length; i++) {
                        vertexIndices.push(addVertex(clippedPolygon[i]));
                    }

                    for (let i = 0; i < triangulated.length; i += 3) {
                        outIndices.push(
                            vertexIndices[triangulated[i]],
                            vertexIndices[triangulated[i + 1]],
                            vertexIndices[triangulated[i + 2]]
                        );
                    }
                }
            }
        }

        return {
            vertices: new Float32Array(outVertices),
            indices: new Uint16Array(outIndices),
            uvs: new Float32Array(outUVs),
            colors: new Float32Array(outColors)
        };
    }

}
