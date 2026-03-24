import { Texture } from "../../resource/Texture";
import { BaseTexture } from "../../resource/BaseTexture";
import { Matrix } from "../../maths/Matrix";
import { GraphicsRunner } from "../Scene2DSpecial/GraphicsRunner";
import { Graphic2DDynamicVIBuffer } from "../Scene2DSpecial/Graphic2DDynamicVIBuffer";

/**
 * @en Split large triangle meshes into batches when vertex count exceeds the GPU index buffer limit.
 * Uint16Array indices can only reference vertices 0-65535, and the engine's dynamic VB limit is MAX_VERTEX (32768).
 * @zh 当顶点数超过 GPU 索引缓冲区限制时，将大型三角形网格拆分为多个批次。
 * Uint16Array 索引只能引用 0-65535 的顶点，引擎动态 VB 限制为 MAX_VERTEX (32768)。
 */
export function drawTrianglesBatched(
    runner: GraphicsRunner, tex: Texture | BaseTexture,
    x: number, y: number,
    vertices: Float32Array, uvs: Float32Array, indices: Uint16Array,
    matrix: Matrix | null, alpha: number, blendMode: string | null,
    colorNum: number | null, colors: Float32Array | null, uvRange: ArrayLike<number> | null
): void {
    const vertexCount = vertices.length / 2;
    const maxBatchVertices = Graphic2DDynamicVIBuffer.MAX_VERTEX;

    if (vertexCount <= maxBatchVertices) {
        runner.drawTriangles(tex, x, y, vertices, uvs, indices, matrix, alpha, blendMode, colorNum, colors, uvRange);
        return;
    }

    const triangleCount = indices.length / 3;
    let batchStart = 0;

    while (batchStart < triangleCount) {
        const remap = new Map<number, number>();
        let newVertCount = 0;
        let batchEnd = batchStart;

        // Find how many triangles fit in this batch
        while (batchEnd < triangleCount) {
            let needed = 0;
            for (let j = 0; j < 3; j++) {
                if (!remap.has(indices[batchEnd * 3 + j])) needed++;
            }
            if (newVertCount + needed > maxBatchVertices) break;

            for (let j = 0; j < 3; j++) {
                const idx = indices[batchEnd * 3 + j];
                if (!remap.has(idx)) {
                    remap.set(idx, newVertCount++);
                }
            }
            batchEnd++;
        }

        // Build batch arrays
        const batchVerts = new Float32Array(newVertCount * 2);
        const batchUVs = new Float32Array(newVertCount * 2);
        const batchColors = colors ? new Float32Array(newVertCount * 4) : null;
        const indexCount = (batchEnd - batchStart) * 3;
        const batchIndices = new Uint16Array(indexCount);

        // Fill vertices, uvs, colors via remap
        remap.forEach((newIdx, oldIdx) => {
            batchVerts[newIdx * 2] = vertices[oldIdx * 2];
            batchVerts[newIdx * 2 + 1] = vertices[oldIdx * 2 + 1];
            batchUVs[newIdx * 2] = uvs[oldIdx * 2];
            batchUVs[newIdx * 2 + 1] = uvs[oldIdx * 2 + 1];
            if (colors && batchColors) {
                batchColors[newIdx * 4] = colors[oldIdx * 4];
                batchColors[newIdx * 4 + 1] = colors[oldIdx * 4 + 1];
                batchColors[newIdx * 4 + 2] = colors[oldIdx * 4 + 2];
                batchColors[newIdx * 4 + 3] = colors[oldIdx * 4 + 3];
            }
        });

        // Fill remapped indices
        for (let t = batchStart; t < batchEnd; t++) {
            const bi = (t - batchStart) * 3;
            batchIndices[bi] = remap.get(indices[t * 3])!;
            batchIndices[bi + 1] = remap.get(indices[t * 3 + 1])!;
            batchIndices[bi + 2] = remap.get(indices[t * 3 + 2])!;
        }

        runner.drawTriangles(tex, x, y, batchVerts, batchUVs, batchIndices,
            matrix, alpha, blendMode, colorNum, batchColors, uvRange);

        batchStart = batchEnd;
    }
}
