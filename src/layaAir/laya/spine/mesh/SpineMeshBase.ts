import { IRenderElement2D } from "../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { IIndexBuffer } from "../../RenderDriver/DriverDesign/RenderDevice/IIndexBuffer";
import { IRenderGeometryElement } from "../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { IVertexBuffer } from "../../RenderDriver/DriverDesign/RenderDevice/IVertexBuffer";
import { BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../RenderEngine/RenderEnum/RenderPologyMode";
import { VertexDeclaration } from "../../RenderEngine/VertexDeclaration";
import { Graphics } from "../../display/Graphics";
import { LayaGL } from "../../layagl/LayaGL";
import { Material } from "../../resource/Material";

export abstract class SpineMeshBase {
    static maxVertex: number = 10922;//64*1024/3/2  indexbuffer 64K限制
    element: IRenderElement2D;
    /**
     * Geometry
     */
    geo: IRenderGeometryElement;
    /**
     * Material
     */
    private _material: Material;

    get material() {
        return this._material;
    }

    set material(value: Material) {
        this._material = value;
        this.element.materialShaderData = this._material._shaderValues;
        this.element.subShader = this._material._shader.getSubShaderAt(0);
    }

    protected vb: IVertexBuffer;
    protected ib: IIndexBuffer;

    protected vertexArray: Float32Array;
    protected indexArray: Uint16Array;


    protected verticesLength: number = 0;
    protected indicesLength: number = 0;

    constructor(material: Material) {

        this.init();
        this.material = material;
    }

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
        this.element.geometry = geo;
        this.element.renderStateIsBySprite = false;

    }
    abstract get vertexDeclarition(): VertexDeclaration;

    /**
     * 添加到渲染队列
     * @param graphics 
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
     * 清空
     */
    clear() {
        this.verticesLength = 0;
        this.indicesLength = 0;
    }


    _cloneTo(target: SpineMeshBase) {
        target.verticesLength = this.verticesLength;
        target.indicesLength = this.indicesLength;
        target.vertexArray = new Float32Array(this.vertexArray);
        target.indexArray = new Uint16Array(this.indexArray);
    }

}