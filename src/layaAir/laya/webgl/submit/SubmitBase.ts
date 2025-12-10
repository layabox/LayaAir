import { GraphicsRunner } from "../../display/Scene2DSpecial/GraphicsRunner";
import { LayaGL } from "../../layagl/LayaGL";
import { IPrimitiveRenderElement2D } from "../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { IGraphics2DVertexBlock, I2DGraphicIndexDataView, IGraphics2DBufferBlock } from "../../RenderDriver/RenderModuleData/Design/2D/IRender2DDataHandle";
import { BaseTexture } from "../../resource/BaseTexture";
import { Material } from "../../resource/Material";
import { Texture } from "../../resource/Texture";
import { FastSinglelist } from "../../utils/SingletonList";
import { BlendModeHandler } from "../canvas/BlendMode";
import { Shader2D } from "../shader/d2/Shader2D";
import { GraphicsShaderInfo } from "../shader/d2/value/GraphicsShaderInfo";
import { GraphicsMesh, MeshBlockInfo } from "../utils/GraphicsMesh";
import { SubmitKey } from "./SubmitKey";

export class SubmitBase {

    static RENDERBASE: SubmitBase;
    static ID = 1;

    clipInfoID = -1;	//用来比较clipinfo
    // blendType = -1;
    protected _id = 0;
    /**@internal */
    _renderType = 0;
    //渲染key，通过key判断是否是同一个
    /**@internal */
    _key = new SubmitKey();
    /** @internal */
    private _prevMesh: GraphicsMesh = null;
    mesh: GraphicsMesh;

    material: Material;

    indexCount: number = 0;

    indices: number[] = [];

    indexView: I2DGraphicIndexDataView;

    /** @internal */
    _internalInfo: GraphicsShaderInfo = null;

    renderStateIsBySprite = true;

    vertexs: FastSinglelist<IGraphics2DVertexBlock> = new FastSinglelist;

    renderElement: IPrimitiveRenderElement2D = null;

    _bufferBlock: IGraphics2DBufferBlock = null;

    constructor() {
        this._id = ++SubmitBase.ID;
    }

    clear() {
        this._prevMesh = this.mesh;
        this._key.clear();
        this._internalInfo.clear();
        this.material = null;
        this.indexCount = 0;
        this.vertexs.length = 0;
        this.indices.length = 0;
    }

    /**
     * @param info 添加顶点数据到submit
     */
    appendData(info: MeshBlockInfo) {
        let vertexBlock: IGraphics2DVertexBlock;
        if (this.vertexs.elements.length > this.vertexs.length) {
            vertexBlock = this.vertexs.elements[this.vertexs.length];
        } else {
            vertexBlock = LayaGL.render2DRenderPassFactory.createGraphic2DVertexBlock();
        }
        vertexBlock.positions = info.positions;
        vertexBlock.vertexViews = info.vertexViews;
        this.vertexs.add(vertexBlock);
    }

    prepare(element: IPrimitiveRenderElement2D) {
        element.primitiveShaderData = this._internalInfo.shaderData;
        if (this.material) {
            element.subShader = this.material.shader.getSubShaderAt(0);
            element.materialShaderData = this.material.shaderData;
            this.material._setOwner2DElement(element);
        } else {
            element.subShader = Shader2D.graphicsShader.getSubShaderAt(0);
            element.materialShaderData = null;
        }
        element.geometry.bufferState = this.mesh.bufferState;

        if (!this._bufferBlock) {
            this._bufferBlock = LayaGL.render2DRenderPassFactory.createGraphic2DBufferBlock();
            this._bufferBlock.vertexs = this.vertexs.elements;
        }

        //清理多余的vertexBlock
        this.vertexs.clean();

        let indexView: I2DGraphicIndexDataView = null;
        let geometry = element.geometry;

        if (geometry.bufferState !== this.mesh.bufferState) {
            geometry.bufferState = this.mesh.bufferState;
        }

        let oIndexView = this.indexView;

        if (this.indexView && oIndexView.length === this.indexCount) {
           indexView = oIndexView;
        } else {
            if (oIndexView) {
                this._prevMesh.clearIndexView(oIndexView);
            }

            indexView = this.mesh.checkIndex(this.indexCount);
            this.indexView = indexView;
            this._bufferBlock.indexView = indexView;
        }

        this._bufferBlock.vertexBuffer = this.mesh._buffer.vertexBuffer;

        indexView.setGeometry(geometry);
        //会慢
        indexView.setData(this.indices);

        //set flag
        let useCustomMaterial = this.material ? 1 : 0;
        let mc = (useCustomMaterial === 0 && this._internalInfo.materialClip) ? 1 : 0;
        let texture: BaseTexture;
        let textureHost = this._internalInfo.textureHost;
        if (textureHost)
            texture = (textureHost as Texture).bitmap || textureHost as BaseTexture;

        element.type = this._key.blendShader
            | (useCustomMaterial << 4) //16
            | (mc << 5) //32
            | ((texture ? texture.id : 0) << 6); //64

        return this._bufferBlock;
    }

    destroy() {
        this.clear();
        this.mesh = null;
        this._internalInfo.destroy();
        this._internalInfo = null;
        this._bufferBlock = null;
        this.vertexs.destroy();
        this.vertexs = null;
        this._prevMesh = null;
    }

    update(runner: GraphicsRunner) {
        let sBlendMode = runner.sprite._struct.blendMode;
        var blendType = runner._nBlendType;
        this._key.blendShader = blendType;

        if (runner.globalCompositeOperation != sBlendMode) {
            BlendModeHandler.setShaderData(blendType, this._internalInfo.shaderData);
            this._internalInfo._blend = blendType;
            this.renderStateIsBySprite = false;
        }
    }

    /*
       create方法只传对submit设置的值
     */
    static create(runner: GraphicsRunner): SubmitBase {
        var o = new SubmitBase();
        o._internalInfo = new GraphicsShaderInfo();
        o.update(runner);
        return o;
    }
}

SubmitBase.RENDERBASE = new SubmitBase();

