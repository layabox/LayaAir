import { LayaEnv } from "../../LayaEnv";
import { Graphics } from "../display/Graphics"
import { Scene } from "../display/Scene";
import { Camera2D } from "../display/Scene2DSpecial/Camera2D";
import { CommandBuffer2D } from "../display/Scene2DSpecial/RenderCMD2D/CommandBuffer2D";
import { Draw2DLineCMD } from "../Line2D/Draw2DLineCMD";
import { DrawMesh2DCMD } from "../display/Scene2DSpecial/RenderCMD2D/DrawMesh2DCMD";
import { Sprite } from "../display/Sprite"
import { Color } from "../maths/Color";
import { Matrix } from "../maths/Matrix";
import { Vector2 } from "../maths/Vector2";
import { IndexFormat } from "../RenderEngine/RenderEnum/IndexFormat";
import { Material } from "../resource/Material";
import { Mesh2D, VertexMesh2D } from "../resource/Mesh2D";
import { Texture2D } from "../resource/Texture2D";
import { Physics2DWorldManager } from "./Physics2DWorldManager";
/**
 * @en Physical auxiliary line
 * @zh 物理辅助线
 */
export class Physics2DDebugDraw extends Sprite {

    /**@internal */
    protected _camera: any;

    /**@internal */
    protected _physics2DWorld: Physics2DWorldManager;

    /**@internal */
    protected _mG: Graphics;

    /**@internal */
    private _textSp: Sprite;

    /**@internal */
    protected _textG: Graphics;

    /**@protected */
    protected _lineWidth: number = 3;

    private _matrix: Matrix = new Matrix();

    /**绘制需要使用的材质 */
    private _material: Material;

    private _cmdBuffer: CommandBuffer2D;

    private _cmdDrawLineList: Draw2DLineCMD[] = [];

    private _linePointsList: any[] = [];

    private _cmdDrawMeshList: DrawMesh2DCMD[] = [];

    private _meshList: Mesh2D[] = [];

    /**
     * @en The color string used for drawing text.
     * @zh 用于绘制文本的颜色字符串。
     */
    DrawString_color: string;

    /**
     * @en The color string representing red.
     * @zh 表示红色的颜色字符串。
     */
    Red: string;

    /**
     * @en The color string representing green.
     * @zh 表示绿色的颜色字符串。
     */
    Green: string;

    /**
     * @en The Graphics object used for drawing shapes.
     * @zh 用于绘制形状的 Graphics 对象。
     */
    get mG(): Graphics {
        return this._mG;
    }

    /**
     * @en The Graphics object used for drawing text.
     * @zh 用于绘制文本的 Graphics 对象。
     */
    get textG(): Graphics {
        return this._textG;
    }

    /**
     * @en The current line width used for drawing.
     * @zh 用于绘制的当前线宽。
     */
    get lineWidth(): number {
        return this._lineWidth;
    }

    /**
     * @en The camera object associated with the scene or view.
     * @zh 与场景或视图关联的摄像机对象。
     */
    get camera(): any {
        return this._camera;
    }

    set physics2DWorld(world: Physics2DWorldManager) {
        this._physics2DWorld = world;
    }

    constructor() {
        super();
        this.DrawString_color = "#E69999";
        this.Red = "#ff0000";
        this.Green = "#00ff00"
        this._camera = {};
        this._camera.m_center = new Vector2(0, 0);
        this._camera.m_extent = 25;
        this._camera.m_zoom = 1;
        this._camera.m_width = 1280;
        this._camera.m_height = 800;

        this._mG = new Graphics();
        this.graphics = this._mG;

        this._textSp = new Sprite();
        this._textG = this._textSp.graphics;
        this.addChild(this._textSp);

        this._cmdBuffer = new CommandBuffer2D("Physics2DDebugDraw");
        this.material = new Material();
        this.material.setShaderName("baseRender2D");
    }

    /**@internal */
    private _renderToGraphic(): void {
        if (!this._physics2DWorld) return;
        this._textG.clear();
        this._mG.clear();
        this._mG.save();
        this._mG.scale(this._physics2DWorld.getPixel_Ratio(), this._physics2DWorld.getPixel_Ratio());
        if ((this._scene as Scene)._area2Ds.length != 0) {
            for (let i = 0; i < (this._scene as Scene)._area2Ds.length; i++) {
                let area = (this._scene as Scene)._area2Ds[i];
                if (area && area.mainCamera) {
                    let shaderData = (this._scene as Scene).sceneShaderData;
                    if (shaderData) {
                        shaderData.addDefine(Camera2D.SHADERDEFINE_CAMERA2D);
                    }
                    break;
                }
            }
        }

        //drawMesh cmds
        this._cmdBuffer.setRenderTarget(null, false);
        for (let i = 0; i < this._cmdDrawMeshList.length; i++) {
            let cmd = this._cmdDrawMeshList[i];
            this._cmdBuffer.addCacheCommand(cmd);
        }

        //drawline cmds
        for (let i = 0; i < this._cmdDrawLineList.length; i++) {
            let cmd = this._cmdDrawLineList[i];
            this._cmdBuffer.addCacheCommand(cmd);
        }

        this._cmdBuffer.apply(true);
        this._cmdBuffer.clear(false);

        for (let i = 0; i < this._cmdDrawMeshList.length; i++) {
            let cmd = this._cmdDrawMeshList[i];
            cmd.recover();
        }

        for (let i = 0; i < this._meshList.length; i++) {
            let mesh = this._meshList[i];
            mesh.destroy();
        }

        for (let i = 0; i < this._cmdDrawLineList.length; i++) {
            let cmd = this._cmdDrawLineList[i];
            cmd.recover();
        }

        for (let i = 0; i < this._linePointsList.length; i++) {
            let point = this._linePointsList[i];
            point = null;
        }

        this._cmdDrawLineList.length = 0;
        this._cmdDrawMeshList.length = 0;

        if ((this._scene as Scene)._area2Ds.length != 0) {
            for (let i = 0; i < (this._scene as Scene)._area2Ds.length; i++) {
                let area = (this._scene as Scene)._area2Ds[i];
                if (area && area.mainCamera) {
                    let shaderData = (this._scene as Scene).sceneShaderData;
                    if (shaderData) {
                        shaderData.removeDefine(Camera2D.SHADERDEFINE_CAMERA2D);
                    }
                    break;
                }
            }
        }
        this._mG.restore();
    }

    /**
     * @override
     * @en Renders the object using the given context and position.
     * @zh 使用给定的上下文和位置渲染对象。
     */
    render(x: number, y: number): void {
        if (!LayaEnv.isPlaying) return;

        this._renderToGraphic();
        super.render(x, y);
    }

    /**
     * @en Saves the current state of the environment and remaps the position and rotation on the canvas.
     * @zh 保存当前环境的状态，重新映射画布上的位置和旋转。
     */
    PushTransform(tx: number, ty: number, angle: number): void {
        this._mG.save();
        this._mG.translate(tx, ty);
        this._mG.rotate(angle);
    }

    /**
     * @en Restores the previously saved path state and properties.
     * @zh 返回之前保存过的路径状态和属性。
     */
    PopTransform(): void {
        this._mG.restore();
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

        // 创建顶点声明
        const declaration = VertexMesh2D.getVertexDeclaration(["POSITION,UV"], false)[0];

        // 创建Mesh2D
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
        const twoPi = Math.PI * 2;
        // 每个顶点有5个数据：x,y,z, u,v，最后一个顶点是圆心
        let vertices = new Float32Array((numSegments + 1) * 5);
        // 每个三角形3个索引，共numSegments个三角形
        let indices = new Uint16Array(numSegments * 3);
        let pos = 0;
        for (let i = 0; i < numSegments; i++, pos += 5) {
            const angle = twoPi * i / numSegments;
            // 计算环上顶点（已加圆心偏移）
            const x = center.x + radius * Math.cos(angle);
            const y = center.y + radius * Math.sin(angle);
            vertices[pos] = x;
            vertices[pos + 1] = y;
            vertices[pos + 2] = 0;
            // 计算UV坐标：将环上顶点转换为相对于圆心的局部坐标，再映射到[0, 1]
            vertices[pos + 3] = 0.5 + (x - center.x) / (2 * radius);
            vertices[pos + 4] = 0.5 + (y - center.y) / (2 * radius);
        }
        // 添加圆心顶点
        vertices[pos] = center.x;
        vertices[pos + 1] = center.y;
        vertices[pos + 2] = 0;
        vertices[pos + 3] = 0.5;
        vertices[pos + 4] = 0.5;

        // 根据扇形原理构建三角形索引（numSegments个扇形）
        let ibIndex = 0;
        for (let i = 1; i < numSegments; i++, ibIndex += 3) {
            indices[ibIndex] = i;
            indices[ibIndex + 1] = i - 1;
            indices[ibIndex + 2] = numSegments; // 圆心索引
        }
        // 最后一个三角形：连接第一个顶点、最后一个顶点与圆心
        indices[ibIndex] = 0;
        indices[ibIndex + 1] = numSegments - 1;
        indices[ibIndex + 2] = numSegments;

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
        if (!matrix) matrix = this._matrix;
        let cmd = DrawMesh2DCMD.create(mesh2D, matrix, Texture2D.whiteTexture, color, this._material);
        cmd && this._cmdDrawMeshList.push(cmd);
        this._meshList.push(mesh2D);
    }


    addLineDebugDrawCMD(points: any[], color: Color, lineWidth: number, matrix?: Matrix) {
        if (!matrix) matrix = this._matrix;
        let cmd = Draw2DLineCMD.create(points, matrix, color, lineWidth);
        cmd && this._cmdDrawLineList.push(cmd);
        this._linePointsList.push(points);
    }


    destroy() {
        super.destroy();
        this._cmdBuffer && this._cmdBuffer.clear(false);
        this._material && this._material.destroy();
        this._material && (this._material = null);
        this._cmdBuffer && (this._cmdBuffer = null);
        this._cmdDrawLineList && (this._cmdDrawLineList.length = 0);
        this._cmdDrawMeshList && (this._cmdDrawMeshList.length = 0);
    }
}

