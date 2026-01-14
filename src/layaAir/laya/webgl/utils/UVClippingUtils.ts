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
    /** @internal */
    private static readonly EPSILON = 1e-7;

    /** @internal */
    private static _threadLocalContext = {
        // 中间数组缓冲区 - 使用索引访问,避免length=0和push导致的扩容
        outVertices: [] as number[],
        outIndices: [] as number[],
        outUVs: [] as number[],
        outColors: [] as number[],
        clipBuffer1: [] as _ClipVertex[],
        clipBuffer2: [] as _ClipVertex[],
        earcutData: [] as number[],
        vertexIndices: [] as number[],

        // 有效长度计数器 - 分离逻辑长度和物理容量
        outVerticesLength: 0,
        outIndicesLength: 0,
        outUVsLength: 0,
        outColorsLength: 0,
        clipBuffer1Length: 0,
        clipBuffer2Length: 0,
        earcutDataLength: 0,
        // vertexIndicesLength: 0,

        // 可复用的TypedArray缓冲区,用于减少对象创建和GC开销
        verticesBuffer: new Float32Array(0),
        indicesBuffer: new Uint16Array(0),
        uvsBuffer: new Float32Array(0),
        colorsBuffer: new Float32Array(0),
    };

    /**
     * @internal 重置缓冲区 - 只重置长度计数器,保持数组容量避免GC
     */
    private static _resetBuffers(): void {
        const ctx = UVClippingUtils._threadLocalContext;
        // 只重置长度计数器,不修改数组length,避免扩容导致的GC
        ctx.outVerticesLength = 0;
        ctx.outIndicesLength = 0;
        ctx.outUVsLength = 0;
        ctx.outColorsLength = 0;
        ctx.clipBuffer1Length = 0;
        ctx.clipBuffer2Length = 0;
        ctx.earcutDataLength = 0;
        // ctx.vertexIndicesLength = 0;
    }

    /**
     * @internal 确保TypedArray缓冲区容量足够,不足时扩容
     * @param buffer 当前缓冲区
     * @param requiredLength 所需长度
     * @param constructor TypedArray构造函数
     * @returns 足够容量的缓冲区(可能是原缓冲区或新创建的)
     */
    private static _ensureBufferCapacity<T extends Float32Array | Uint16Array>(
        buffer: T,
        requiredLength: number,
        constructor: new (length: number) => T
    ): T {
        if (buffer.length >= requiredLength) {
            return buffer;
        }
        const newLength = Math.max(requiredLength, Math.ceil(buffer.length * 1.5));
        return new constructor(newLength);
    }

    /**
     * @en CPU-side UV vertex clipping. Clips triangles based on UV range and outputs clipped vertices, indices, UVs, and color data.
     * @param vertices Vertex position array (x, y pairs)
     * @param indices Index array (groups of 3 for each triangle)
     * @param uvs UV coordinate array (u, v pairs)
     * @param uvRange Clipping range [minU, minV, width, height]
     * @param colors Vertex color array (r, g, b, a groups of 4)
     * @param reuseBuffer Whether to reuse internal buffers (default: true). When true, returns views of reusable buffers for better performance. When false, returns newly created arrays.
     * @returns Clipped data {vertices, indices, uvs, colors}
     *
     * @zh CPU端UV顶点裁剪。根据UV范围裁剪三角形，输出裁剪后的顶点、索引、UV和颜色数据。
     * @param vertices 顶点位置数组 (x, y 成对)
     * @param indices 索引数组 (每3个一组表示一个三角形)
     * @param uvs UV坐标数组 (u, v 成对)
     * @param uvRange 裁剪范围 [minU, minV, width, height]
     * @param colors 顶点颜色数组 (r, g, b, a 四个一组)
     * @param reuseBuffer 是否复用内部缓冲区（默认：true）。为true时返回可复用缓冲区的视图以获得更好的性能，为false时返回新创建的数组。
     * @returns 裁剪后的数据 {vertices, indices, uvs, colors}
     *
     * @important
     * @en When reuseBuffer=true (default): The returned TypedArrays are views of reusable internal buffers.
     * The data is only valid until the next call to this method. If you need to persist the data,
     * either set reuseBuffer=false or copy it yourself (e.g., new Float32Array(result.vertices)).
     * Using reuseBuffer=true reduces GC pressure in high-frequency rendering loops.
     *
     * @zh 当reuseBuffer=true（默认）时：返回的TypedArray是可复用内部缓冲区的视图。
     * 数据仅在下次调用此方法前有效。如果需要持久化数据，
     * 可以设置reuseBuffer=false或自行复制（例如：new Float32Array(result.vertices)）。
     * 使用reuseBuffer=true可减少高频渲染循环中的GC压力。
     */
    static clipTrianglesByUVRange(
        vertices: Float32Array,
        indices: Uint16Array,
        uvs: Float32Array,
        uvRange: ArrayLike<number>,
        colors: Float32Array,
        reuseBuffer: boolean = true
    ): { vertices: Float32Array, indices: Uint16Array, uvs: Float32Array, colors: Float32Array } {

        UVClippingUtils._resetBuffers();
        const ctx = UVClippingUtils._threadLocalContext;

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

        // 使用ThreadLocal缓冲区替代临时数组
        const outVertices = ctx.outVertices;
        const outIndices = ctx.outIndices;
        const outUVs = ctx.outUVs;
        const outColors = ctx.outColors;
        let nextVertexIndex = 0;

        const addVertex = (vert: _ClipVertex): number => {
            const index = nextVertexIndex++;
            const baseIdx = ctx.outVerticesLength;
            const colorIdx = ctx.outColorsLength;

            // 直接通过索引赋值,JS会自动扩容
            outVertices[baseIdx] = vert.x;
            outVertices[baseIdx + 1] = vert.y;
            outUVs[baseIdx] = vert.u;
            outUVs[baseIdx + 1] = vert.v;
            outColors[colorIdx] = vert.r;
            outColors[colorIdx + 1] = vert.g;
            outColors[colorIdx + 2] = vert.b;
            outColors[colorIdx + 3] = vert.a;

            // 更新有效长度
            ctx.outVerticesLength = baseIdx + 2;
            ctx.outUVsLength = baseIdx + 2;
            ctx.outColorsLength = colorIdx + 4;

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

        const setClipVertex = (buffer: _ClipVertex[], id: number , x: number , y: number , u: number , v: number , r: number , g: number , b: number , a: number , index: number ): void => {
            if (!buffer[id]) {
                buffer[id] = { x, y, u, v, r, g, b, a, index };
            }else{
                let vertex = buffer[id];
                vertex.x = x;
                vertex.y = y;
                vertex.u = u;
                vertex.v = v;
                vertex.r = r;
                vertex.g = g;
                vertex.b = b;
                vertex.a = a;
                vertex.index = index;
            }
        }

        // 计算线段与裁剪边的交点（线性插值），直接写入output数组
        const computeIntersection = (v1: _ClipVertex, v2: _ClipVertex, edge: number, output: _ClipVertex[], outputLen: number): boolean => {
            let t: number;

            // 根据裁剪边计算插值参数 t
            switch (edge) {
                case 0: // left: u = minU
                    if (Math.abs(v2.u - v1.u) < EPSILON) return false;
                    t = (minU - v1.u) / (v2.u - v1.u);
                    break;
                case 1: // right: u = maxU
                    if (Math.abs(v2.u - v1.u) < EPSILON) return false;
                    t = (maxU - v1.u) / (v2.u - v1.u);
                    break;
                case 2: // bottom: v = minV
                    if (Math.abs(v2.v - v1.v) < EPSILON) return false;
                    t = (minV - v1.v) / (v2.v - v1.v);
                    break;
                case 3: // top: v = maxV
                    if (Math.abs(v2.v - v1.v) < EPSILON) return false;
                    t = (maxV - v1.v) / (v2.v - v1.v);
                    break;
                default:
                    return false;
            }

            if (t < -EPSILON || t > 1 + EPSILON) return false;

            setClipVertex(
                output, outputLen, 
                v1.x + t * (v2.x - v1.x), 
                v1.y + t * (v2.y - v1.y), 
                v1.u + t * (v2.u - v1.u), 
                v1.v + t * (v2.v - v1.v), 
                v1.r + t * (v2.r - v1.r), 
                v1.g + t * (v2.g - v1.g), 
                v1.b + t * (v2.b - v1.b), 
                v1.a + t * (v2.a - v1.a),
                -1
            );
            return true;
        };

        // Sutherland-Hodgman算法：用矩形裁剪多边形（使用双缓冲优化）
        const clipPolygon = (inputVertices: _ClipVertex[], inputLength: number): { length: number, buffer: _ClipVertex[] } => {
            let input = inputVertices;
            let inputLen = inputLength;
            let outputBuffer: _ClipVertex[] = ctx.clipBuffer1;

            for (let edge = 0; edge < 4; edge++) {
                // 双缓冲: ping-pong交替使用clipBuffer1和clipBuffer2
                const output = (edge % 2 === 0) ? ctx.clipBuffer1 : ctx.clipBuffer2;
                let outputLen = 0;

                if (inputLen === 0) return { length: 0, buffer: output };

                const edgeMask = 1 << edge;

                for (let i = 0; i < inputLen; i++) {
                    const current = input[i];
                    const next = input[(i + 1) % inputLen];

                    const currentInside = current.index >= 0
                        ? (vertexInsideFlags[current.index] & edgeMask) !== 0
                        : isInside(current, edge);
                    const nextInside = next.index >= 0
                        ? (vertexInsideFlags[next.index] & edgeMask) !== 0
                        : isInside(next, edge);

                    if (currentInside) {
                        setClipVertex(output, outputLen++, current.x, current.y, current.u, current.v, current.r, current.g, current.b, current.a, current.index);

                        if (!nextInside) {
                            if (computeIntersection(current, next, edge, output, outputLen)) {
                                outputLen++;
                            }
                        }
                    } else if (nextInside) {
                        if (computeIntersection(current, next, edge, output, outputLen)) {
                            outputLen++;
                        }
                    }
                }

                if (outputLen === 0) return { length: 0, buffer: output };
                input = output;
                inputLen = outputLen;
                outputBuffer = output;

                // 更新长度计数器
                if (edge % 2 === 0) {
                    ctx.clipBuffer1Length = outputLen;
                } else {
                    ctx.clipBuffer2Length = outputLen;
                }
            }

            return { length: inputLen, buffer: outputBuffer };
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
                // 直接索引赋值,JS会自动扩容
                outIndices[ctx.outIndicesLength++] = idx0;
                outIndices[ctx.outIndicesLength++] = idx1;
                outIndices[ctx.outIndicesLength++] = idx2;
                continue;
            }

            const combinedFlags = flags0 | flags1 | flags2;
            if (!(combinedFlags & 0x01) || // 所有顶点都在left外侧
                !(combinedFlags & 0x02) || // 所有顶点都在right外侧
                !(combinedFlags & 0x04) || // 所有顶点都在bottom外侧
                !(combinedFlags & 0x08)) { // 所有顶点都在top外侧
                continue;
            }

            const clippedResult = clipPolygon(triangle, 3);
            const clippedPolygonLen = clippedResult.length;
            const clippedPolygon = clippedResult.buffer;

            if (clippedPolygonLen < 3) {// 裁剪后顶点不足3个，跳过
                continue;
            }

            if (clippedPolygonLen === 3) {// 已经是三角形，直接输出
                const idx0 = addVertex(clippedPolygon[0]);
                const idx1 = addVertex(clippedPolygon[1]);
                const idx2 = addVertex(clippedPolygon[2]);
                // 直接索引赋值,JS会自动扩容
                outIndices[ctx.outIndicesLength++] = idx0;
                outIndices[ctx.outIndicesLength++] = idx1;
                outIndices[ctx.outIndicesLength++] = idx2;
            } else {
                // 多边形需要三角化，使用Earcut
                const earcutData = ctx.earcutData;
                let earcutLen = 0;
                for (let i = 0; i < clippedPolygonLen; i++) {
                    earcutData[earcutLen++] = clippedPolygon[i].x;
                    earcutData[earcutLen++] = clippedPolygon[i].y;
                }
                ctx.earcutDataLength = earcutLen;

                const triangulated = Earcut.earcut(earcutData, null, 2);

                if (triangulated.length > 0) {
                    const vertexIndices = ctx.vertexIndices;
                    for (let i = 0; i < clippedPolygonLen; i++) {
                        vertexIndices[i] = addVertex(clippedPolygon[i]);
                    }

                    for (let i = 0; i < triangulated.length; i += 3) {
                        outIndices[ctx.outIndicesLength++] = vertexIndices[triangulated[i]];
                        outIndices[ctx.outIndicesLength++] = vertexIndices[triangulated[i + 1]];
                        outIndices[ctx.outIndicesLength++] = vertexIndices[triangulated[i + 2]];
                    }
                }
            }
        }

        if (reuseBuffer) {
            // 使用有效长度而非数组length
            ctx.verticesBuffer = UVClippingUtils._ensureBufferCapacity(
                ctx.verticesBuffer,
                ctx.outVerticesLength,
                Float32Array
            );
            ctx.indicesBuffer = UVClippingUtils._ensureBufferCapacity(
                ctx.indicesBuffer,
                ctx.outIndicesLength,
                Uint16Array
            );
            ctx.uvsBuffer = UVClippingUtils._ensureBufferCapacity(
                ctx.uvsBuffer,
                ctx.outUVsLength,
                Float32Array
            );
            ctx.colorsBuffer = UVClippingUtils._ensureBufferCapacity(
                ctx.colorsBuffer,
                ctx.outColorsLength,
                Float32Array
            );

            // 复制有效数据
            for (let i = 0; i < ctx.outVerticesLength; i++) {
                ctx.verticesBuffer[i] = outVertices[i];
            }
            for (let i = 0; i < ctx.outIndicesLength; i++) {
                ctx.indicesBuffer[i] = outIndices[i];
            }
            for (let i = 0; i < ctx.outUVsLength; i++) {
                ctx.uvsBuffer[i] = outUVs[i];
            }
            for (let i = 0; i < ctx.outColorsLength; i++) {
                ctx.colorsBuffer[i] = outColors[i];
            }

            return {
                vertices: ctx.verticesBuffer.subarray(0, ctx.outVerticesLength) as Float32Array,
                indices: ctx.indicesBuffer.subarray(0, ctx.outIndicesLength) as Uint16Array,
                uvs: ctx.uvsBuffer.subarray(0, ctx.outUVsLength) as Float32Array,
                colors: ctx.colorsBuffer.subarray(0, ctx.outColorsLength) as Float32Array
            };
        } else {
            // 使用有效长度创建新数组
            const newVertices = new Float32Array(ctx.outVerticesLength);
            const newIndices = new Uint16Array(ctx.outIndicesLength);
            const newUVs = new Float32Array(ctx.outUVsLength);
            const newColors = new Float32Array(ctx.outColorsLength);

            for (let i = 0; i < ctx.outVerticesLength; i++) {
                newVertices[i] = outVertices[i];
            }
            for (let i = 0; i < ctx.outIndicesLength; i++) {
                newIndices[i] = outIndices[i];
            }
            for (let i = 0; i < ctx.outUVsLength; i++) {
                newUVs[i] = outUVs[i];
            }
            for (let i = 0; i < ctx.outColorsLength; i++) {
                newColors[i] = outColors[i];
            }

            return {
                vertices: newVertices,
                indices: newIndices,
                uvs: newUVs,
                colors: newColors
            };
        }
    }

}
