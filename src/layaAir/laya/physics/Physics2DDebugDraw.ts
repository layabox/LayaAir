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

    setActive(value: boolean) {
        if (value) {
            Laya.timer.frameLoop(1, this, this.render);
        } else {
            Laya.timer.clear(this, this.render);
        }
    }

    // 延迟 N 帧再 destroy，确保 LayaX 渲染线程在销毁前完成命令消费
    // 注意：不做对象池复用 —— 共享的 GPU VB/IB 被下一次 setData 覆盖时，GPU 可能还在读上一次的数据，导致顶点错位（"拉扯"）
    private static readonly _RETAIN_FRAMES = 6;
    private _pendingMeshCmdRing: DrawMesh2DCMD[][] = [];
    private _pendingMeshRing: Mesh2D[][] = [];
    private _pendingLineCmdRing: PhysicsDrawLine2DCMD[][] = [];

    private render(): void {
        this._matrix.identity();
        this._matrix.scale(Physics2D.toRenderX(1), Physics2D.toRenderY(1));

        if (this._pendingMeshCmdRing.length >= Physics2DDebugDraw._RETAIN_FRAMES) {
            const oldestMeshCmds = this._pendingMeshCmdRing.shift()!;
            for (let i = 0; i < oldestMeshCmds.length; i++) oldestMeshCmds[i].recover();
            const oldestMeshes = this._pendingMeshRing.shift()!;
            for (let i = 0; i < oldestMeshes.length; i++) oldestMeshes[i].destroy();
            const oldestLineCmds = this._pendingLineCmdRing.shift()!;
            for (let i = 0; i < oldestLineCmds.length; i++) oldestLineCmds[i].recover();
        }

        let area2D = this._scene._area2Ds.size > 0 ? this._scene._area2Ds.values().next().value._struct : null;
        //drawMesh cmds
        this._cmdBuffer.setRenderTarget(null, false);
        for (let i = 0; i < this._cmdDrawMeshList.length; i++) {
            let cmd = this._cmdDrawMeshList[i];
            if (area2D)
                (cmd as any)._renderElements[0] && ((cmd as any)._renderElements[0].owner = area2D);
            this._cmdBuffer.addCacheCommand(cmd);
        }

        //drawline cmds
        for (let i = 0; i < this._cmdDrawLineList.length; i++) {
            let cmd = this._cmdDrawLineList[i];
            if (area2D)
                cmd._renderElements[0] && (cmd._renderElements[0].owner = area2D);
            this._cmdBuffer.addCacheCommand(cmd);
        }

        this._cmdBuffer.apply(true);
        this._cmdBuffer.clear(false);

        // 本帧提交的资源入队末尾；延迟 _RETAIN_FRAMES 帧后才 destroy / recover
        this._pendingMeshCmdRing.push(this._cmdDrawMeshList.slice());
        this._pendingMeshRing.push(this._meshList.slice());
        this._pendingLineCmdRing.push(this._cmdDrawLineList.slice());

        for (let i = 0; i < this._linePointsList.length; i++) {
            this._linePointsList[i] = null;
        }

        this._cmdDrawLineList.length = 0;
        this._cmdDrawMeshList.length = 0;
        this._meshList.length = 0;
        this._linePointsList.length = 0;
    }

    /**
     * 根据多边形顶点生成Mesh2D，不添加中心点
     * @param vertices 多边形顶点数组 [x1, y1, x2, y2, ...]
     * @returns 生成的Mesh2D对象
     */
    createMesh2DByVertices(vertices: any[]): Mesh2D {
        const pointCount = vertices.length / 2;

        // 如果点数少于3个，无法形成多边形
        if (pointCount < 3) return null;

        // 创建顶点数据数组 (x, y, z, u, v)
        let vertexs = new Float32Array(pointCount * 5);

        // 计算多边形的边界以便映射UV
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

        // 添加多边形顶点
        let pos = 0;
        for (let i = 0; i < pointCount; i++, pos += 5) {
            const x = vertices[i * 2];
            const y = vertices[i * 2 + 1];

            vertexs[pos + 0] = x;
            vertexs[pos + 1] = y;
            vertexs[pos + 2] = 0; // z 坐标

            // 计算UV坐标 (从边界框范围映射到[0,1])
            vertexs[pos + 3] = (x - minX) / width;
            vertexs[pos + 4] = (y - minY) / height;
        }

        // 创建索引，使用三角形条带
        // 对于凸多边形，我们可以简单地使用(0,i,i+1)形式的三角形
        // 注意：这只适用于凸多边形，凹多边形需要更复杂的三角剖分
        let index = new Uint16Array((pointCount - 2) * 3);

        let ibIndex = 0;
        for (let i = 1; i < pointCount - 1; i++) {
            index[ibIndex++] = 0;      // 第一个顶点
            index[ibIndex++] = i;      // 当前顶点
            index[ibIndex++] = i + 1;  // 下一个顶点
        }

        const declaration = VertexMesh2D.getVertexDeclaration(["POSITION,UV"], false)[0];
        let mesh2D = Mesh2D.createMesh2DByPrimitive(
            [vertexs],
            [declaration],
            index,
            IndexFormat.UInt16,
            [{ length: index.length, start: 0 }]
        );

        return mesh2D;
    }


    createCircleMeshByVertices(center: { x: number, y: number }, radius: number, numSegments: number): Mesh2D {
        // 确保至少有3个分段
        if (numSegments < 3) numSegments = 3;
        if (radius <= 0) return null;

        const twoPi = Math.PI * 2;
        // 每个顶点有5个数据：x,y,z, u,v，最后一个顶点是圆心
        let vertices = new Float32Array((numSegments + 1) * 5);
        // 每个三角形3个索引，共numSegments个三角形
        let indices = new Uint16Array(numSegments * 3);

        let pos = 0;
        // 生成圆周上的顶点
        for (let i = 0; i < numSegments; i++, pos += 5) {
            const angle = twoPi * i / numSegments;
            // 计算环上顶点（已加圆心偏移）
            const x = center.x + radius * Math.cos(angle);
            const y = center.y + radius * Math.sin(angle);
            vertices[pos] = x;
            vertices[pos + 1] = y;
            vertices[pos + 2] = 0;
            // 修复UV坐标计算：使用标准化的局部坐标
            vertices[pos + 3] = 0.5 + 0.5 * Math.cos(angle);
            vertices[pos + 4] = 0.5 + 0.5 * Math.sin(angle);
        }

        // 添加圆心顶点
        vertices[pos] = center.x;
        vertices[pos + 1] = center.y;
        vertices[pos + 2] = 0;
        vertices[pos + 3] = 0.5;
        vertices[pos + 4] = 0.5;

        // 修复索引生成：确保正确的三角形顶点顺序（逆时针）
        let ibIndex = 0;
        for (let i = 0; i < numSegments; i++, ibIndex += 3) {
            const nextIndex = (i + 1) % numSegments;
            indices[ibIndex] = numSegments;     // 圆心索引
            indices[ibIndex + 1] = i;           // 当前顶点
            indices[ibIndex + 2] = nextIndex;   // 下一个顶点
        }

        // 根据项目中现有的接口获取顶点声明并创建Mesh2D
        var declaration = VertexMesh2D.getVertexDeclaration(["POSITION,UV"], false)[0];
        let mesh2D = Mesh2D.createMesh2DByPrimitive(
            [vertices],
            [declaration],
            indices,
            IndexFormat.UInt16,
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
        // 清理未渲染的 mesh
        if (this._meshList) {
            for (let i = 0; i < this._meshList.length; i++) {
                this._meshList[i].destroy();
            }
            this._meshList.length = 0;
        }
        // 回收未渲染的 CMD
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
        // 清理未来得及 destroy 的 pending mesh
        for (let i = 0; i < this._pendingMeshRing.length; i++) {
            const meshes = this._pendingMeshRing[i];
            for (let j = 0; j < meshes.length; j++) meshes[j].destroy();
        }
        this._pendingMeshRing.length = 0;
        this._pendingMeshCmdRing.length = 0;
        this._pendingLineCmdRing.length = 0;
    }
}

