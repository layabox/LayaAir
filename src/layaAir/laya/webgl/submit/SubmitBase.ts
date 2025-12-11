import { GraphicsRunner } from "../../display/Scene2DSpecial/GraphicsRunner";
import { LayaGL } from "../../layagl/LayaGL";
import { IPrimitiveRenderElement2D } from "../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { IGraphics2DVertexBlock, I2DGraphicIndexDataView, IGraphics2DBufferBlock } from "../../RenderDriver/RenderModuleData/Design/2D/IRender2DDataHandle";
import { DrawType } from "../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../RenderEngine/RenderEnum/RenderPologyMode";
import { BaseTexture } from "../../resource/BaseTexture";
import { Material } from "../../resource/Material";
import { Texture } from "../../resource/Texture";
import { IPool, Pool } from "../../utils/Pool";
import { FastSinglelist } from "../../utils/SingletonList";
import { BlendModeHandler } from "../canvas/BlendMode";
import { Shader2D } from "../shader/d2/Shader2D";
import { GraphicsShaderInfo } from "../shader/d2/value/GraphicsShaderInfo";
import { GraphicsMesh, MeshBlockInfo } from "../utils/GraphicsMesh";
import { SubmitKey } from "./SubmitKey";

export type GraphicsRunnerCacheChunk = {
    // 缓存
    vbdata: Float32Array;
    // 顶点数量
    vertexCount: number;
    // 索引数据
    indices: number[];
    // 本地坐标位置
    positions: number[];
};

export interface SubmitCacheInfo {
    chunks: GraphicsRunnerCacheChunk[];
    blendShader?: number; // 渲染模式
    texture?: BaseTexture | null; // 渲染纹理
    vertexCount: number;
}

export class SubmitBase {

    static readonly _pool: IPool<IPrimitiveRenderElement2D> = Pool.createPool2<IPrimitiveRenderElement2D>(() => { //create
        let element = LayaGL.render2DRenderPassFactory.createPrimitiveRenderElement2D();
        element.renderStateIsBySprite = false;
        element.nodeCommonMap = ["Sprite2D"];
        return element;

    }, (element: IPrimitiveRenderElement2D, needGeometry?: boolean) => { //init
        if (needGeometry || needGeometry == null) {
            element.geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
            element.geometry.indexFormat = IndexFormat.UInt16;
        } else {
            if (element.geometry) {
                element.geometry.destroy();
                element.geometry = null;
            }
        }

    }, (element: IPrimitiveRenderElement2D) => { //reset
        if (element.geometry) {
            element.geometry.clearRenderParams();
            element.geometry.bufferState = null;
        }
        element.materialShaderData = null;
        element.value2DShaderData = null;
        element.primitiveShaderData = null;
        element.globalShaderData = null;
        element.owner = null;
        element.subShader = null;
        element.renderStateIsBySprite = false;
        element.type = 0;
    });

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

    private _mesh: GraphicsMesh;

    public get mesh(): GraphicsMesh {
        return this._mesh;
    }

    public set mesh(value: GraphicsMesh) {
        if (this._mesh == value)
            return

        if (this.indexView && this._mesh) {
            this._mesh.clearIndexView(this.indexView);
            this.indexView = null;
        }

        this._mesh = value;

        if (value) {
            this.renderElement.geometry.bufferState = value.bufferState;
            this._bufferBlock.vertexBuffer = value._buffer.vertexBuffer;
        }
    }

    private _material: Material;
    public get material(): Material {
        return this._material;
    }

    public set material(value: Material) {
        if (this._material == value)
            return;
        if (this._material) {
            this._material._removeOwnerElement(this.renderElement);
        }
        this._material = value;

        if (value) {
            this.renderElement.subShader = value.shader.getSubShaderAt(0);
            this.renderElement.materialShaderData = value.shaderData;
            value._setOwner2DElement(this.renderElement);
        }else{
            this.renderElement.subShader = Shader2D.graphicsShader.getSubShaderAt(0);
            this.renderElement.materialShaderData = null;
        }
    }

    indexCount: number = 0;

    indices: number[] = [];

    indexView: I2DGraphicIndexDataView;

    /** @internal */
    _internalInfo: GraphicsShaderInfo = null;

    renderStateIsBySprite = true;

    vertexs: FastSinglelist<IGraphics2DVertexBlock> = new FastSinglelist;

    renderElement: IPrimitiveRenderElement2D = null;

    _bufferBlock: IGraphics2DBufferBlock = null;

    /** @internal submit 的缓存信息，可以从这里获取 */
    _cacheInfo: SubmitCacheInfo | null = null;

    constructor() {
        this._id = ++SubmitBase.ID;
    }

    /** @internal 获取或创建 cache 信息 */
    _getCacheInfo(): SubmitCacheInfo {
        if (!this._cacheInfo) {
            this._cacheInfo = {
                chunks: [],
                vertexCount: 0,
            };
        }
        return this._cacheInfo;
    }

    clear() {
        this._key.clear();
        this._internalInfo.clear();
        this.indexCount = 0;
        this.vertexs.length = 0;
        this.indices.length = 0;
        this._cacheInfo = null;
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

    prepare() {
        let element: IPrimitiveRenderElement2D = this.renderElement;
        this.vertexs.clean();

        let indexView: I2DGraphicIndexDataView = this.indexView;
        if (!indexView || indexView.length !== this.indexCount) {
            if (indexView) {
                this.mesh.clearIndexView(indexView);
            }

            indexView = this.mesh.checkIndex(this.indexCount);
            this.indexView = indexView;
            this._bufferBlock.indexView = indexView;
            indexView.setGeometry(element.geometry);
        }

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

        // 更新缓存信息
        if (this._cacheInfo) {
            this._cacheInfo.texture = texture;
            this._cacheInfo.blendShader = this._key.blendShader;
        }

        return this._bufferBlock;
    }

    destroy() {
        this.clear();
        this.material = null;
        this.mesh = null;
        this._internalInfo.destroy();
        this._internalInfo = null;
        this._bufferBlock = null;
        this.vertexs.destroy();
        this.vertexs = null;
        SubmitBase._pool.recover(this.renderElement);
        this.renderElement = null;
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
        o.renderElement = SubmitBase._pool.take();
        o.renderElement.primitiveShaderData = o._internalInfo.shaderData;
        o._bufferBlock = LayaGL.render2DRenderPassFactory.createGraphic2DBufferBlock();
        o._bufferBlock.vertexs = o.vertexs.elements;
        o.renderElement.subShader = Shader2D.graphicsShader.getSubShaderAt(0);
        o.renderElement.materialShaderData = null;

        o.update(runner);
        return o;
    }
}

SubmitBase.RENDERBASE = new SubmitBase();

