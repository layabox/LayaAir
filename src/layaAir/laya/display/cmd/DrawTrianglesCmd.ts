import { Matrix } from "../../maths/Matrix"
import { Vector4 } from "../../maths/Vector4"
import { Texture } from "../../resource/Texture"
import { IMeshFactory } from "../mesh/MeshFactory"
import { ClassUtils } from "../../utils/ClassUtils"
import { ColorUtils } from "../../utils/ColorUtils"
import { Pool } from "../../utils/Pool"
import { VertexStream } from "../../utils/VertexStream"
import { IGraphicsBoundsAssembler, IGraphicsCmd } from "../IGraphics";
import { GraphicsRunner } from "../Scene2DSpecial/GraphicsRunner"
import { Rectangle } from "../../maths/Rectangle"

const className = "DrawTrianglesCmd";

/**
 * @en Draw triangles command
 * @zh 绘制三角形命令
 */
export class DrawTrianglesCmd implements IGraphicsCmd {
    /** @internal */
    _cacheData: any;

    canCache: boolean = true;
    
    /**
     * @en Identifier for the DrawTrianglesCmd
     * @zh 绘制三角形命令的标识符
     */
    static readonly ID: string = className;

    /**
     * @en The texture to be drawn.
     * @zh 要绘制的纹理。
     */
    texture: Texture | null;
    /**
     * @en X-axis offset.
     * @zh X轴偏移量。
     */
    x: number = 0;
    /**
     * @en Y-axis offset.
     * @zh Y轴偏移量。
     */
    y: number = 0;
    /**
     * @en Vertex array.
     * @zh 顶点数组。
     */
    vertices: Float32Array;
    /**
     * @en UV data.
     * @zh UV数据。
     */
    uvs: Float32Array;
    /**
     * @en Vertex indices.
     * @zh 顶点索引。
     */
    indices: Uint16Array;
    /**
     * @en Scaling matrix.
     * @zh 缩放矩阵。
     */
    matrix: Matrix | null;
    /**
     * @en Alpha value.
     * @zh 透明度值。
     */
    alpha: number;
    /**
     * @en Blend mode.
     * @zh 混合模式。
     */
    blendMode: string | null;
    /**
     * @en Color transformation.
     * @zh 颜色变换。
     */
    color: number | null;
    /**
     * @en Mesh factory for creating the mesh.
     * @zh 用于创建网格的工厂。
     */
    mesh: IMeshFactory;

    /**
     * @en Create a DrawTrianglesCmd instance
     * @param texture The texture to be drawn
     * @param x X-axis offset
     * @param y Y-axis offset
     * @param vertices Vertex array
     * @param uvs UV data
     * @param indices Vertex indices
     * @param matrix Scaling matrix
     * @param alpha Alpha value
     * @param color Color transformation
     * @param blendMode Blend mode
     * @returns DrawTrianglesCmd instance
     * @zh 创建一个绘制三角形命令实例
     * @param texture 要绘制的纹理  
     * @param x X轴偏移量  
     * @param y Y轴偏移量  
     * @param vertices 顶点数组  
     * @param uvs UV数据  
     * @param indices 顶点索引  
     * @param matrix 缩放矩阵  
     * @param alpha 透明度值  
     * @param color 颜色变换  
     * @param blendMode 混合模式  
     * @returns 绘制三角形命令实例
     */
    static create(texture: Texture, x: number, y: number, vertices: Float32Array, uvs: Float32Array, indices: Uint16Array,
        matrix?: Matrix, alpha?: number, color?: string | number, blendMode?: string): DrawTrianglesCmd {
        var cmd: DrawTrianglesCmd = Pool.getItemByClass(className, DrawTrianglesCmd);
        cmd.texture = texture;
        texture?._addReference();
        cmd.x = x;
        cmd.y = y;
        cmd.vertices = vertices;
        cmd.uvs = uvs;
        cmd.indices = indices;
        cmd.matrix = matrix;
        cmd.alpha = alpha ?? 1;
        cmd.color = color != null ? ColorUtils.create(color).numColor : 0xffffffff;
        cmd.blendMode = blendMode;
        cmd.canCache = true;
        return cmd;
    }

    /**
     * @en Create a DrawTrianglesCmd instance using a mesh factory
     * @param texture The texture to be drawn
     * @param mesh Mesh factory for creating the mesh
     * @param color Color transformation
     * @returns DrawTrianglesCmd instance
     * @zh 使用网格工厂创建一个绘制三角形命令实例
     * @param texture 要绘制的纹理
     * @param mesh 用于创建网格的工厂
     * @param color 颜色变换
     * @returns 绘制三角形命令实例
     */
    static create2(texture: Texture, mesh: IMeshFactory, color?: string | number): DrawTrianglesCmd {
        var cmd: DrawTrianglesCmd = Pool.getItemByClass(className, DrawTrianglesCmd);
        cmd.texture = texture;
        texture?._addReference();
        cmd.x = 0;
        cmd.y = 0;
        cmd.mesh = mesh;
        cmd.color = color != null ? ColorUtils.create(color).numColor : 0xffffffff;
        cmd.canCache = false;
        return cmd;
    }

    /**
     * @en Recycle to the object pool
     * @zh 回收到对象池
     */
    recover(): void {
        this.texture?._removeReference();
        this.texture = null;
        this.vertices = null;
        this.uvs = null;
        this.indices = null;
        this.matrix = null;
        this.mesh = null;
        this._cacheData = null;
        Pool.recover(className, this);
    }

    /**
     * @en Execute the drawing triangles command
     * @param runner The rendering context
     * @param gx Global X offset
     * @param gy Global Y offset
     * @zh 执行绘制三角形命令
     * @param runner 渲染上下文  
     * @param gx 全局X偏移  
     * @param gy 全局Y偏移  
     */
    run(runner: GraphicsRunner, gx: number, gy: number): void {
        if (this.mesh) {
            let vb = VertexStream.pool.take(this.texture);
            vb.contentRect.setTo(0, 0, runner.sprite.width, runner.sprite.height);
            if (this.color)
                vb.color.setABGR(this.color);

            try {
                this.mesh.onPopulateMesh(vb);
            } catch (e) {
                console.error(e);
            }

            runner.drawTriangles(this.texture, this.x + gx, this.y + gy, vb.getVertices(), vb.getUVs(), vb.getIndices(),
                this.matrix, this.alpha, this.blendMode, null, vb.getColors(), this.texture?.uvrect);

            VertexStream.pool.recover(vb);
        }
        else if (this.vertices && this.uvs && this.indices) {
            runner.drawTriangles(this.texture, this.x + gx, this.y + gy, this.vertices, this.uvs, this.indices,
                this.matrix, this.alpha, this.blendMode, this.color);
        }
    }

    /**
     * @en The identifier for the DrawTrianglesCmd
     * @zh 绘制三角形命令的标识符
     */
    get cmdID(): string {
        return DrawTrianglesCmd.ID;
    }

    /**
     * @ignore
     */
    getBounds(assembler: IGraphicsBoundsAssembler): void {
        Rectangle.TEMP.setTo(0, 0, assembler.width, assembler.height).getBoundPoints(assembler.points);
    }
}

ClassUtils.regClass(className, DrawTrianglesCmd);