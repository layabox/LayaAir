import { Laya } from "../../Laya";
import { Scene } from "../display/Scene";
import { Physics2D } from "./Physics2D";
import { CommandBuffer2D } from "../display/Scene2DSpecial/RenderCMD2D/CommandBuffer2D";
import { DrawMesh2DCMD } from "../display/Scene2DSpecial/RenderCMD2D/DrawMesh2DCMD";
import { Color } from "../maths/Color";
import { Matrix } from "../maths/Matrix";
import { Vector2 } from "../maths/Vector2";
import { IndexFormat } from "../RenderEngine/RenderEnum/IndexFormat";
import { Material, MaterialRenderMode } from "../resource/Material";
import { Mesh2D, VertexMesh2D } from "../resource/Mesh2D";
import { Texture2D } from "../resource/Texture2D";
import { PhysicsDrawLine2DCMD } from "./Render/PhysicsDrawLine2DCMD";

/** @internal */
interface MeshAccumData {
    vertices: number[];
    indices: number[];
    vertexCount: number;
    color: Color;
}

/** @internal */
interface LineAccumData {
    points: number[];
    color: Color;
}

/**
 * @ignore
 * @blueprintIgnore
 */
export class Physics2DDebugDraw {
    _scene: Scene;
    _camera: any;
    _lineWidth = 3;

    private _matrix: Matrix = new Matrix();

    /**绘制需要使用的材质 */
    private _material: Material;

    private _cmdBuffer: CommandBuffer2D;

    // ---- Geometry accumulators (grouped by color key) ----
    private _meshAccums: Map<number, MeshAccumData> = new Map();
    private _lineAccums: Map<number, LineAccumData> = new Map();

    // ---- Temp arrays reused across frames during render() ----
    private _tmpMeshCmds: DrawMesh2DCMD[] = [];
    private _tmpMeshes: Mesh2D[] = [];
    private _tmpLineCmds: PhysicsDrawLine2DCMD[] = [];

    // ---- Legacy per-shape storage (for backward-compatible addMeshDebugDrawCMD / addLineDebugDrawCMD) ----
    private _cmdDrawLineList: PhysicsDrawLine2DCMD[] = [];
    private _linePointsList: any[] = [];
    private _cmdDrawMeshList: DrawMesh2DCMD[] = [];
    private _meshList: Mesh2D[] = [];

    constructor() {
        this._camera = {};
        this._camera.m_center = new Vector2(0, 0);
        this._camera.m_extent = 25;
        this._camera.m_zoom = 1;
        this._camera.m_width = 1280;
        this._camera.m_height = 800;

        this._cmdBuffer = new CommandBuffer2D("Physics2DDebugDraw");
    }

    // ---- Color → integer key ----

    private _colorToKey(color: Color): number {
        return ((color.r * 255 + 0.5) | 0) * 16777216 +
            ((color.g * 255 + 0.5) | 0) * 65536 +
            ((color.b * 255 + 0.5) | 0) * 256 +
            ((color.a * 255 + 0.5) | 0);
    }

    private _getMeshAccum(color: Color): MeshAccumData {
        let key = this._colorToKey(color);
        let accum = this._meshAccums.get(key);
        if (!accum) {
            accum = { vertices: [], indices: [], vertexCount: 0, color: color.clone() };
            this._meshAccums.set(key, accum);
        }
        return accum;
    }

    private _getLineAccum(color: Color): LineAccumData {
        let key = this._colorToKey(color);
        let accum = this._lineAccums.get(key);
        if (!accum) {
            accum = { points: [], color: color.clone() };
            this._lineAccums.set(key, accum);
        }
        return accum;
    }

    setActive(value: boolean) {
        if (value) {
            Laya.timer.frameLoop(1, this, this.render);
        } else {
            Laya.timer.clear(this, this.render);
        }
    }

    // ---- Accumulator-based API (batched, fewer draw calls) ----

    /**
     * Append circle vertices into the per-color mesh accumulator.
     */
    appendCircle(cx: number, cy: number, radius: number, color: Color, numSegments: number = 24): void {
        if (radius <= 0 || numSegments < 3) return;
        let accum = this._getMeshAccum(color);
        let base = accum.vertexCount;

        const twoPi = Math.PI * 2;
        const verts = accum.vertices;
        const idxs = accum.indices;

        for (let i = 0; i < numSegments; i++) {
            const angle = twoPi * i / numSegments;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            verts.push(cx + radius * cos, cy + radius * sin, 0, 0.5 + 0.5 * cos, 0.5 + 0.5 * sin);
        }
        // center vertex
        verts.push(cx, cy, 0, 0.5, 0.5);

        const centerIdx = base + numSegments;
        for (let i = 0; i < numSegments; i++) {
            idxs.push(centerIdx, base + i, base + ((i + 1) % numSegments));
        }
        accum.vertexCount += numSegments + 1;
    }

    /**
     * Append convex polygon vertices into the per-color mesh accumulator.
     * @param points flat array [x0,y0, x1,y1, ...]
     */
    appendPolygon(points: number[], pointCount: number, color: Color): void {
        if (pointCount < 3) return;

        let accum = this._getMeshAccum(color);
        let base = accum.vertexCount;

        // AABB for UV
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (let i = 0; i < pointCount; i++) {
            const x = points[i * 2], y = points[i * 2 + 1];
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }
        const w = maxX - minX || 1;
        const h = maxY - minY || 1;

        const verts = accum.vertices;
        const idxs = accum.indices;

        for (let i = 0; i < pointCount; i++) {
            const x = points[i * 2];
            const y = points[i * 2 + 1];
            verts.push(x, y, 0, (x - minX) / w, (y - minY) / h);
        }

        // fan triangulation (convex polygon)
        for (let i = 1; i < pointCount - 1; i++) {
            idxs.push(base, base + i, base + i + 1);
        }
        accum.vertexCount += pointCount;
    }

    /**
     * Append a single line segment into the per-color line accumulator.
     */
    appendLineSegment(x1: number, y1: number, x2: number, y2: number, color: Color): void {
        let accum = this._getLineAccum(color);
        accum.points.push(x1, y1, x2, y2);
    }

    /**
     * Append multiple line segments into the per-color line accumulator.
     * @param points flat array [x1,y1,x2,y2, x3,y3,x4,y4, ...] (multiples of 4)
     */
    appendLinePoints(points: number[], color: Color): void {
        if (points.length < 4) return;
        let accum = this._getLineAccum(color);
        let arr = accum.points;
        for (let i = 0, len = points.length; i < len; i++) {
            arr.push(points[i]);
        }
    }

    // ---- Render ----

    private render(): void {
        this._matrix.identity();
        this._matrix.scale(Physics2D.toRenderX(1), Physics2D.toRenderY(1));

        let area2D = this._scene._area2Ds.size > 0 ? this._scene._area2Ds.values().next().value._struct : null;

        // --- Flush mesh accumulators → merged DrawMesh2DCMD ---
        let tmpMeshCmds = this._tmpMeshCmds;
        let tmpMeshes = this._tmpMeshes;
        let tmpLineCmds = this._tmpLineCmds;

        const declaration = VertexMesh2D.getVertexDeclaration(["POSITION,UV"], false)[0];
        this._meshAccums.forEach(accum => {
            if (accum.vertexCount === 0) return;
            const verts = new Float32Array(accum.vertices);
            const useUint32 = accum.vertexCount > 65535;
            const indices = useUint32 ? new Uint32Array(accum.indices) : new Uint16Array(accum.indices);
            const mesh = Mesh2D.createMesh2DByPrimitive(
                [verts], [declaration], indices,
                useUint32 ? IndexFormat.UInt32 : IndexFormat.UInt16,
                [{ length: indices.length, start: 0 }]
            );
            const cmd = DrawMesh2DCMD.create(mesh, this._matrix, Texture2D.whiteTexture, accum.color, this._material);
            if (cmd) tmpMeshCmds.push(cmd);
            tmpMeshes.push(mesh);
            // reset for next frame (keep array allocation)
            accum.vertices.length = 0;
            accum.indices.length = 0;
            accum.vertexCount = 0;
        });

        // --- Flush line accumulators → merged PhysicsDrawLine2DCMD ---
        // Note: PhysicsDrawLine2DCMD stores the points array by reference,
        // so we must NOT clear accum.points here. Clear after apply().
        this._lineAccums.forEach(accum => {
            if (accum.points.length < 4) return;
            const cmd = PhysicsDrawLine2DCMD.create(accum.points, this._matrix, accum.color, this._lineWidth);
            if (cmd) tmpLineCmds.push(cmd);
        });

        // --- Submit all CMDs to command buffer ---
        this._cmdBuffer.setRenderTarget(null, false);

        // legacy mesh CMDs (from addMeshDebugDrawCMD)
        for (let i = 0; i < this._cmdDrawMeshList.length; i++) {
            let cmd = this._cmdDrawMeshList[i];
            if (area2D)
                (cmd as any)._renderElements[0] && ((cmd as any)._renderElements[0].owner = area2D);
            this._cmdBuffer.addCacheCommand(cmd);
        }
        // merged mesh CMDs
        for (let i = 0; i < tmpMeshCmds.length; i++) {
            let cmd = tmpMeshCmds[i];
            if (area2D)
                (cmd as any)._renderElements[0] && ((cmd as any)._renderElements[0].owner = area2D);
            this._cmdBuffer.addCacheCommand(cmd);
        }

        // legacy line CMDs (from addLineDebugDrawCMD)
        for (let i = 0; i < this._cmdDrawLineList.length; i++) {
            let cmd = this._cmdDrawLineList[i];
            if (area2D)
                cmd._renderElements[0] && (cmd._renderElements[0].owner = area2D);
            this._cmdBuffer.addCacheCommand(cmd);
        }
        // merged line CMDs
        for (let i = 0; i < tmpLineCmds.length; i++) {
            let cmd = tmpLineCmds[i];
            if (area2D)
                cmd._renderElements[0] && (cmd._renderElements[0].owner = area2D);
            this._cmdBuffer.addCacheCommand(cmd);
        }

        this._cmdBuffer.apply(true);
        this._cmdBuffer.clear(false);

        // --- Cleanup legacy ---
        for (let i = 0; i < this._cmdDrawMeshList.length; i++) {
            this._cmdDrawMeshList[i].recover();
        }
        for (let i = 0; i < this._meshList.length; i++) {
            this._meshList[i].destroy();
        }
        for (let i = 0; i < this._cmdDrawLineList.length; i++) {
            this._cmdDrawLineList[i].recover();
        }
        for (let i = 0; i < this._linePointsList.length; i++) {
            this._linePointsList[i] = null;
        }
        this._cmdDrawLineList.length = 0;
        this._cmdDrawMeshList.length = 0;
        this._meshList.length = 0;
        this._linePointsList.length = 0;

        // --- Cleanup merged ---
        for (let i = 0; i < tmpMeshCmds.length; i++) {
            tmpMeshCmds[i].recover();
        }
        for (let i = 0; i < tmpMeshes.length; i++) {
            tmpMeshes[i].destroy();
        }
        for (let i = 0; i < tmpLineCmds.length; i++) {
            tmpLineCmds[i].recover();
        }
        tmpMeshCmds.length = 0;
        tmpMeshes.length = 0;
        tmpLineCmds.length = 0;

        // Clear line accumulator points (deferred to here because
        // PhysicsDrawLine2DCMD holds a reference to the array until apply() finishes)
        this._lineAccums.forEach(accum => { accum.points.length = 0; });
    }

    // ---- Legacy API (backward-compatible, per-shape) ----

    /**
     * Create a Mesh2D from polygon vertices (legacy, prefer appendPolygon).
     */
    createMesh2DByVertices(vertices: any[]): Mesh2D {
        const pointCount = vertices.length / 2;
        if (pointCount < 3) return null;

        let vertexs = new Float32Array(pointCount * 5);
        let minX = Number.MAX_VALUE, minY = Number.MAX_VALUE;
        let maxX = Number.MIN_VALUE, maxY = Number.MIN_VALUE;

        for (let i = 0; i < vertices.length; i += 2) {
            minX = Math.min(minX, vertices[i]);
            maxX = Math.max(maxX, vertices[i]);
            minY = Math.min(minY, vertices[i + 1]);
            maxY = Math.max(maxY, vertices[i + 1]);
        }

        const width = maxX - minX;
        const height = maxY - minY;
        let pos = 0;
        for (let i = 0; i < pointCount; i++, pos += 5) {
            const x = vertices[i * 2];
            const y = vertices[i * 2 + 1];
            vertexs[pos + 0] = x;
            vertexs[pos + 1] = y;
            vertexs[pos + 2] = 0;
            vertexs[pos + 3] = (x - minX) / width;
            vertexs[pos + 4] = (y - minY) / height;
        }

        let index = new Uint16Array((pointCount - 2) * 3);
        let ibIndex = 0;
        for (let i = 1; i < pointCount - 1; i++) {
            index[ibIndex++] = 0;
            index[ibIndex++] = i;
            index[ibIndex++] = i + 1;
        }

        const declaration = VertexMesh2D.getVertexDeclaration(["POSITION,UV"], false)[0];
        let mesh2D = Mesh2D.createMesh2DByPrimitive(
            [vertexs], [declaration], index, IndexFormat.UInt16,
            [{ length: index.length, start: 0 }]
        );
        return mesh2D;
    }

    /**
     * Create a Mesh2D from circle parameters (legacy, prefer appendCircle).
     */
    createCircleMeshByVertices(center: { x: number, y: number }, radius: number, numSegments: number): Mesh2D {
        if (numSegments < 3) numSegments = 3;
        if (radius <= 0) return null;

        const twoPi = Math.PI * 2;
        let vertices = new Float32Array((numSegments + 1) * 5);
        let indices = new Uint16Array(numSegments * 3);

        let pos = 0;
        for (let i = 0; i < numSegments; i++, pos += 5) {
            const angle = twoPi * i / numSegments;
            const x = center.x + radius * Math.cos(angle);
            const y = center.y + radius * Math.sin(angle);
            vertices[pos] = x;
            vertices[pos + 1] = y;
            vertices[pos + 2] = 0;
            vertices[pos + 3] = 0.5 + 0.5 * Math.cos(angle);
            vertices[pos + 4] = 0.5 + 0.5 * Math.sin(angle);
        }

        vertices[pos] = center.x;
        vertices[pos + 1] = center.y;
        vertices[pos + 2] = 0;
        vertices[pos + 3] = 0.5;
        vertices[pos + 4] = 0.5;

        let ibIndex = 0;
        for (let i = 0; i < numSegments; i++, ibIndex += 3) {
            const nextIndex = (i + 1) % numSegments;
            indices[ibIndex] = numSegments;
            indices[ibIndex + 1] = i;
            indices[ibIndex + 2] = nextIndex;
        }

        var declaration = VertexMesh2D.getVertexDeclaration(["POSITION,UV"], false)[0];
        let mesh2D = Mesh2D.createMesh2DByPrimitive(
            [vertices], [declaration], indices, IndexFormat.UInt16,
            [{ length: indices.length, start: 0 }]
        );
        return mesh2D;
    }

    addMeshDebugDrawCMD(mesh2D: Mesh2D, color: Color, matrix?: Matrix) {
        if (!mesh2D) return;
        if (!matrix) matrix = this._matrix;
        let cmd = DrawMesh2DCMD.create(mesh2D, matrix, Texture2D.whiteTexture, color, this._material);
        cmd && this._cmdDrawMeshList.push(cmd);
        this._meshList.push(mesh2D);
    }

    addLineDebugDrawCMD(points: any[], color: Color, lineWidth?: number, matrix?: Matrix) {
        if (!matrix) matrix = this._matrix;
        if (!lineWidth) lineWidth = this._lineWidth;
        let cmd = PhysicsDrawLine2DCMD.create(points, matrix, color, lineWidth);
        cmd && this._cmdDrawLineList.push(cmd);
        this._linePointsList.push(points);
    }

    destroy() {
        Laya.timer.clear(this, this.render);
        this._cmdBuffer && this._cmdBuffer.clear(false);
        this._material && this._material.destroy();
        this._material = null;
        this._cmdBuffer = null;
        if (this._meshList) {
            for (let i = 0; i < this._meshList.length; i++) {
                this._meshList[i].destroy();
            }
            this._meshList.length = 0;
        }
        if (this._cmdDrawMeshList) {
            for (let i = 0; i < this._cmdDrawMeshList.length; i++) {
                this._cmdDrawMeshList[i].recover();
            }
            this._cmdDrawMeshList.length = 0;
        }
        if (this._cmdDrawLineList) {
            for (let i = 0; i < this._cmdDrawLineList.length; i++) {
                this._cmdDrawLineList[i].recover();
            }
            this._cmdDrawLineList.length = 0;
        }
        this._linePointsList && (this._linePointsList.length = 0);
        this._meshAccums.clear();
        this._lineAccums.clear();
    }
}
