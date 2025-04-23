import { run } from "node:test";
import { Const } from "../../Const";
import { GraphicsRunner } from "../../display/Scene2DSpecial/GraphicsRunner";
import { LayaGL } from "../../layagl/LayaGL";
import { IRenderElement2D } from "../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { IBufferState } from "../../RenderDriver/DriverDesign/RenderDevice/IBufferState";
import { IRenderGeometryElement } from "../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { RenderState } from "../../RenderDriver/RenderModuleData/Design/RenderState";
import { DrawType } from "../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../RenderEngine/RenderEnum/RenderPologyMode";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { VertexDeclaration } from "../../RenderEngine/VertexDeclaration";
import { Context } from "../../renders/Context";
import { Material } from "../../resource/Material";
import { BlendMode } from "../canvas/BlendMode";
import { ShaderDefines2D } from "../shader/d2/ShaderDefines2D";
import { GraphicsShaderInfo } from "../shader/d2/value/GraphicsShaderInfo";
import { RenderSpriteData, Value2D } from "../shader/d2/value/Value2D";
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

    material: Material;

    // 从VB中什么地方开始画，画到哪
    /**@internal */
    _startIdx = 0;		//indexbuffer 的偏移，单位是byte
    /**@internal */
    _numEle = 0;
    /** @internal */
    _internalInfo: GraphicsShaderInfo = null;
    // _colorFiler: ColorFilter = null;

    _renderElement:IRenderElement2D;

    _geometry: IRenderGeometryElement = null;

    _bufferState: IBufferState = null;

    constructor() {
        this._id = ++SubmitBase.ID;
    }
    
    protected initialize() {
        this._renderElement = LayaGL.render2DRenderPassFactory.createRenderElement2D();
        let geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
        let bufferState = LayaGL.renderDeviceFactory.createBufferState();

        this._renderElement.geometry = geometry;
        this._renderElement.nodeCommonMap = ["Sprite2D"];
        this._renderElement.renderStateIsBySprite = true;
        this._internalInfo = new GraphicsShaderInfo;
        geometry.bufferState = bufferState;
        geometry.indexFormat = IndexFormat.UInt16;
        this._geometry = geometry;
        this._bufferState = bufferState;
    }

    clear() {
        this._internalInfo.clear();
        this._mesh = null;
        this.material = null;
    }

    destroy() {
        this.clear();
        
        this._geometry.destroy();
        this._bufferState.destroy();
        this._internalInfo.destroy();
        this._renderElement.destroy();

        this._internalInfo = null;
        this._renderElement = null;
        this._bufferState = null;
        this._geometry = null;
        
    }

    updateRenderElement() {
        if (!this._mesh)
            return

        let vb = this._mesh.vertexBuffer;
        let ib = this._mesh.indexBuffer;
        this._bufferState.applyState([vb] , ib);

        this._geometry.clearRenderParams();
        this._geometry.setDrawElemenParams(this._numEle , this._startIdx );

        if (this.material) {
            this._renderElement.materialShaderData = this.material.shaderData;
            this._renderElement.subShader = this.material._shader.getSubShaderAt(0);
        }else {
            this._renderElement.materialShaderData = this._internalInfo.shaderData;
            this._renderElement.subShader = this._internalInfo._defaultShader.getSubShaderAt(0);
        }
    }

    /*
       create方法只传对submit设置的值
     */
    static create(runner: GraphicsRunner, mesh: Sprite2DGeometry , material:Material): SubmitBase {
        var o = new SubmitBase();
        o.initialize();
        o.mesh = mesh;
        o.material = material;
        let vertexDeclaration = mesh.vertexDeclarition;

        //vg的顶点格式是x ,y,rgba
        let data = RenderSpriteData.Zero;
        if (vertexDeclaration.vertexStride === 24) {
            data = RenderSpriteData.Primitive;
        }else if (vertexDeclaration.vertexStride === 48) {
            data = RenderSpriteData.Texture2D;
        }

        o._internalInfo.data = data;
        o._key.clear();
        o._key.submitType = SubmitBase.KEY_DRAWTEXTURE;
        o._startIdx = mesh.indexNum * Const.INDEX_BYTES;
        o._numEle = 0;
        var blendType = runner._nBlendType;
        
        if (runner.globalCompositeOperation != runner.sprite._blendMode) {
            o._key.blendShader = blendType;
            BlendMode.setShaderData(blendType, o._internalInfo.shaderData);
            o._renderElement.renderStateIsBySprite = false;
        }
        //sv.setValue(context._shader2D);
        // o._colorFiler = runner._colorFiler;
        return o;
    }
}

SubmitBase.RENDERBASE = new SubmitBase();

