import { IRenderGeometryElement } from "../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../RenderEngine/RenderEnum/RenderPologyMode";
import { VertexDeclaration } from "../../RenderEngine/VertexDeclaration";
import { LayaGL } from "../../layagl/LayaGL";
import { Context, IGraphicCMD } from "../../renders/Context"
import { Material } from "../../resource/Material";
import { Pool } from "../../utils/Pool"

/**
 * @en Draw geometry command
 * @zh 绘制几何体命令
 */
export class DrawGeoCmd implements IGraphicCMD {
    /**
     * @en Identifier for the DrawGeoCmd
     * @zh 绘制几何体命令的标识符
     */
    static ID: string = "DrawGeoCmd";

    /**
     * @en Geometry element to be rendered
     * @zh 要渲染的几何体元素
     */
    geo: IRenderGeometryElement;

    /**
     * @en Material used for rendering
     * @zh 用于渲染的材质
     */
    material: Material;

    /**
     * @private
     * @en Create a DrawGeoCmd instance
     * @param geo Geometry element to be rendered
     * @param material Material used for rendering
     * @returns A DrawGeoCmd instance
     * @zh 创建一个绘制几何体命令实例
     * @param geo 要渲染的几何体元素
     * @param material 用于渲染的材质
     * @returns DrawGeoCmd 实例
     */
    static create(geo: IRenderGeometryElement, material: Material): DrawGeoCmd {
        var cmd: DrawGeoCmd = Pool.getItemByClass("DrawGeoCmd" + material.id, DrawGeoCmd);
        cmd.init(geo, material);
        return cmd;
    }

    /**
     * @en Create a geometry element
     * @param decl Vertex declaration
     * @param vbArray Vertex buffer array
     * @param vblen Vertex buffer length
     * @param ibArray Index buffer array
     * @param iblen Index buffer length
     * @returns Created geometry element
     * @zh 创建一个几何体元素
     * @param decl 顶点声明
     * @param vbArray 顶点缓冲数组
     * @param vblen 顶点缓冲长度
     * @param ibArray 索引缓冲数组
     * @param iblen 索引缓冲长度
     * @returns 创建的几何体元素
     */
    static creatGEO(decl: VertexDeclaration, vbArray: Float32Array, vblen: number, ibArray: Uint16Array, iblen: number) {
        let geo = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
        let mesh = LayaGL.renderDeviceFactory.createBufferState();
        geo.bufferState = mesh;
        let vb = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
        vb.vertexDeclaration = decl;
        let ib = LayaGL.renderDeviceFactory.createIndexBuffer(BufferUsage.Dynamic);
        mesh.applyState([vb], ib)
        geo.indexFormat = IndexFormat.UInt16;
        //let vb = mesh._vertexBuffers[0];
        //let ib = mesh._bindedIndexBuffer;
        vb.setDataLength(vblen);
        vb.setData(vbArray.buffer, 0, 0, vblen)
        ib._setIndexDataLength(iblen)
        ib._setIndexData(new Uint16Array(ibArray.buffer, 0, iblen / 2), 0)
        geo.clearRenderParams();
        geo.setDrawElemenParams(iblen / 2, 0);
        return geo;
    }

    /**
     * @en Initialize the DrawGeoCmd
     * @param geo Geometry element to be rendered
     * @param material Material used for rendering
     * @zh 初始化绘制几何体命令
     * @param geo 要渲染的几何体元素
     * @param material 用于渲染的材质
     */
    init(geo: IRenderGeometryElement, material: Material): void {
        this.material = material;
        this.geo = geo;
    }

    /**
     * @en Recycle the instance to the object pool
     * @zh 将实例回收到对象池
     */
    recover(): void {
        Pool.recover("DrawGeoCmd" + this.material.id, this);
    }

    /**
     * @private
     * @en Execute the draw geometry command
     * @param context The rendering context
     * @param gx Global x-coordinate
     * @param gy Global Y-coordinate
     * @zh 执行绘制几何体命令
     * @param context 渲染上下文
     * @param gx 全局X坐标
     * @param gy 全局Y坐标
     */
    run(context: Context, gx: number, gy: number): void {
        context.drawGeo(this.geo, this.material, gx, gy);
    }

    /**
     * @private
     * @en The identifier for the DrawGeoCmd
     * @zh 绘制几何体命令的ID
     */
    get cmdID(): string {
        return DrawGeoCmd.ID;
    }
}
