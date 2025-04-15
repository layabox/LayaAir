import { Const } from "../../Const";
import { GraphicsRunner } from "../../display/Scene2DSpecial/GraphicsRunner";
import { ColorFilter } from "../../filters/ColorFilter";
import { LayaGL } from "../../layagl/LayaGL";
import { IRenderElement2D } from "../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { IBufferState } from "../../RenderDriver/DriverDesign/RenderDevice/IBufferState";
import { IRenderGeometryElement } from "../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { ShaderData } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../RenderEngine/RenderEnum/RenderPologyMode";
import { VertexDeclaration } from "../../RenderEngine/VertexDeclaration";
import { Context } from "../../renders/Context";
import { Material } from "../../resource/Material";
import { Value2D } from "../shader/d2/value/Value2D";
import { Sprite2DGeometry } from "../utils/Sprite2DGeometry";
import { SubmitKey } from "./SubmitKey";

export class SubmitBase {

    static KEY_ONCE = -1;
    static KEY_FILLRECT = 1;
    static KEY_DRAWTEXTURE = 2;
    static KEY_VG = 3;
    static KEY_TRIANGLES = 4;

    static RENDERBASE: SubmitBase;
    static ID = 1;

    clipInfoID = -1;	//用来比较clipinfo
    blendType = -1;
    protected _id = 0;
    /**@internal */
    _renderType = 0;
    //渲染key，通过key判断是否是同一个
    /**@internal */
    _key = new SubmitKey();
    
    private _mesh: Sprite2DGeometry;
    public get mesh(): Sprite2DGeometry {
        return this._mesh;
    }
    public set mesh(value: Sprite2DGeometry) {
        if (value) {
            
        }
        this._mesh = value;
    }

    private _material: Material;
    public get material(): Material {
        return this._material;
    }
    public set material(value: Material) {
        if (value) {
            this._renderElement.materialShaderData = value.shaderData;
            this._renderElement.subShader = value._shader.getSubShaderAt(0);
        }
        this._material = value;
    }

    // 从VB中什么地方开始画，画到哪
    /**@internal */
    _startIdx = 0;		//indexbuffer 的偏移，单位是byte
    /**@internal */
    _numEle = 0;

    // _colorFiler: ColorFilter = null;
    shaderValue: ShaderData = null;

    _renderElement:IRenderElement2D;

    _geometry: IRenderGeometryElement = null;

    _bufferState: IBufferState = null;

    constructor() {
        this._id = ++SubmitBase.ID;
        this._renderElement = LayaGL.render2DRenderPassFactory.createRenderElement2D();
        this.shaderValue = LayaGL.renderDeviceFactory.createShaderData();
        let geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
        let bufferState = LayaGL.renderDeviceFactory.createBufferState();
        geometry.bufferState = bufferState;
        geometry.indexFormat = IndexFormat.UInt16;
        this._geometry = geometry;
        this._bufferState = bufferState;
    }

    clear() {
        this.shaderValue.clearData();
        this._mesh = null;
        this._material = null;
    }

    destroy() {
        this._geometry.destroy();
        this._bufferState.destroy();
        this.shaderValue.destroy();
        this._renderElement.destroy();

        this._renderElement = null;
        this._bufferState = null;
        this.shaderValue = null;
        this._geometry = null;
        
    }

    updateGeometry() {
        if (!this._mesh)
            return

        let vb = this._mesh.vertexBuffer;
        let ib = this._mesh.indexBuffer;
        this._bufferState.applyState([vb] , ib);

        this._geometry.clearRenderParams();
        this._geometry.setDrawElemenParams(this._numEle , this._startIdx );
    }

    /*
       create方法只传对submit设置的值
     */
    static create(runner: GraphicsRunner, mesh: Sprite2DGeometry , material:Material): SubmitBase {
        var o = new SubmitBase();
        o.mesh = mesh;
        o.material = material;
        o._key.clear();
        o._key.submitType = SubmitBase.KEY_DRAWTEXTURE;
        o._startIdx = mesh.indexNum * Const.INDEX_BYTES;
        o._numEle = 0;
        var blendType = runner._nBlendType;
        o._key.blendShader = blendType;
        //sv.setValue(context._shader2D);
        // o._colorFiler = runner._colorFiler;
        return o;
    }
}

SubmitBase.RENDERBASE = new SubmitBase();

