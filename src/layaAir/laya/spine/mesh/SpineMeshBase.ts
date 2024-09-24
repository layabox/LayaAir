import { IRenderElement2D } from "../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { IIndexBuffer } from "../../RenderDriver/DriverDesign/RenderDevice/IIndexBuffer";
import { IRenderGeometryElement } from "../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { IVertexBuffer } from "../../RenderDriver/DriverDesign/RenderDevice/IVertexBuffer";
import { BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../RenderEngine/RenderEnum/RenderPologyMode";
import { VertexDeclaration } from "../../RenderEngine/VertexDeclaration";
import { LayaGL } from "../../layagl/LayaGL";
import { Material } from "../../resource/Material";

/**
 * @en Abstract base class for Spine mesh rendering.
 * @zh Spine 网格渲染的抽象基类。
 */
export abstract class SpineMeshBase {
    /**
     * @en Maximum number of vertices. Limited by 64K indexbuffer constraint.
     * @zh 最大顶点数。受64K索引缓冲区限制。
     */
    static maxVertex: number = 10922;//64*1024/3/2 
    /**
     * @en Render element for 2D rendering.
     * @zh 用于2D渲染的渲染元素。
     */
    element: IRenderElement2D;
    /**
     * @en Geometry element for rendering.
     * @zh 用于渲染的几何元素。
     */
    geo: IRenderGeometryElement;

    private _material: Material;

    /**
     * @en The material of the mesh.
     * @zh 网格的材质。
     */
    get material() {
        return this._material;
    }

    set material(value: Material) {
        this._material = value;
        this.element.materialShaderData = this._material._shaderValues;
        this.element.subShader = this._material._shader.getSubShaderAt(0);
    }

    /**
     * @en Vertex buffer interface.
     * @zh 顶点缓冲区接口。
     */
    protected vb: IVertexBuffer;
    /**
     * @en Index buffer interface.
     * @zh 索引缓冲区接口。
     */
    protected ib: IIndexBuffer;

    /**
     * @en Vertex array.
     * @zh 顶点数组。
     */
    protected vertexArray: Float32Array;
    /**
     * @en Index array.
     * @zh 索引数组。
     */
    protected indexArray: Uint16Array;


    /**
     * @en Vertex array length.
     * @zh 顶点数组中顶点的数量。
     */
    protected verticesLength: number = 0;
    /**
     * @en Index array length.
     * @zh 引数组中索引的数量。
     */
    protected indicesLength: number = 0;

    /**
     * @en Create a new instance of SpineMeshBase.
     * @param material The material to use for this mesh.
     * @zh 创建 SpineMeshBase 类的新实例。
     * @param material 网格使用的材质。
     */
    constructor(material: Material) {

        this.init();
        this.material = material;
    }

    /**
     * @en Initialize the mesh.
     * @zh 初始化网格。
     */
    init() {
        let geo = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
        let mesh = LayaGL.renderDeviceFactory.createBufferState();
        geo.bufferState = mesh;
        let vb = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
        vb.vertexDeclaration = this.vertexDeclarition;
        let ib = LayaGL.renderDeviceFactory.createIndexBuffer(BufferUsage.Dynamic);
        mesh.applyState([vb], ib)
        geo.indexFormat = IndexFormat.UInt16;
        this.geo = geo;
        this.vb = vb;
        this.ib = ib;
        //set renderelement2D
        this.element = LayaGL.render2DRenderPassFactory.createRenderElement2D();
        this.element.nodeCommonMap = [ "BaseRender2D","spine2D"];
        //@ts-ignore
        this.element.canotPool = true;
        this.element.geometry = geo;
        this.element.renderStateIsBySprite = false;

    }
    /**
     * @en Get the vertex declaration for this mesh.
     * @zh 获取此网格的顶点声明。
     */
    abstract get vertexDeclarition(): VertexDeclaration;

    /**
     * @en Add the mesh to the rendering queue.
     * @zh 添加到渲染队列。
     */
    draw() {
        let vb = this.vb;
        let ib = this.ib;
        let vblen = this.verticesLength * 4;
        let iblen = this.indicesLength * 2;

        vb.setDataLength(vblen);
        vb.setData(this.vertexArray.buffer, 0, this.vertexArray.byteOffset, vblen)
        ib._setIndexDataLength(iblen);
        ib._setIndexData(new Uint16Array(this.indexArray.buffer, this.indexArray.byteOffset, iblen / 2), 0)
        this.geo.clearRenderParams();
        this.geo.setDrawElemenParams(iblen / 2, 0);
        this.element.geometry = this.geo;
        //graphics.drawGeo(this.geo, this.material);
    }

    /**
     * @en Draw the mesh using provided vertex and index data.
     * @param vertices Vertex data array.
     * @param vblength Number of vertices.
     * @param indices Index data array.
     * @param iblength Number of indices.
     * @zh 使用提供的顶点和索引数据绘制网格。
     * @param vertices 顶点数据数组。
     * @param vblength 顶点数量。
     * @param indices 索引数据数组。
     * @param iblength 索引数量。
     */
    drawByData(vertices: Float32Array, vblength: number, indices: Uint16Array, iblength: number) {
        this.vertexArray = vertices;
        this.indexArray = indices;
        this.verticesLength = vblength;
        this.indicesLength = iblength;

        this.draw();
    }

    /**
     * @en Clear the mesh data.
     * @zh 清空网格数据。
     */
    clear() {
        this.verticesLength = 0;
        this.indicesLength = 0;
    }

    /** @internal */
    _cloneTo(target: SpineMeshBase) {
        target.verticesLength = this.verticesLength;
        target.indicesLength = this.indicesLength;
        target.vertexArray = new Float32Array(this.vertexArray);
        target.indexArray = new Uint16Array(this.indexArray);
    }

}