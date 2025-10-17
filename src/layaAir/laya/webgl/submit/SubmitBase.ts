import { GraphicsRunner } from "../../display/Scene2DSpecial/GraphicsRunner";
import { LayaGL } from "../../layagl/LayaGL";
import { IGraphics2DVertexBlock, I2DGraphicIndexDataView } from "../../RenderDriver/RenderModuleData/Design/2D/IRender2DDataHandle";
import { Material } from "../../resource/Material";
import { BlendModeHandler } from "../canvas/BlendMode";
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

    mesh: GraphicsMesh;

    material: Material;

    vertexs: IGraphics2DVertexBlock[] = [];
    blockIndexs: number[] = [];

    indexCount: number = 0;

    indices: number[] = [];

    indexView: I2DGraphicIndexDataView;

    /** @internal */
    _internalInfo: GraphicsShaderInfo = null;

    renderStateIsBySprite = true;

    constructor() {
        this._id = ++SubmitBase.ID;
    }

    clear() {
        this._key.clear();
        this._internalInfo.clear();
        this.material = null;

        if (this.mesh) {
            this.mesh.clearBlocks(this.blockIndexs);
            this.mesh.clearIndexView(this.indexView);
            this.vertexs.length = 0;
            this.blockIndexs.length = 0;
            this.mesh = null;
        }
    }

    destroy() {
        this.clear();

        if (this.indexView) {
            this.indexView.destroy();
            this.indexView = null;
        }
        this._internalInfo.destroy();
        this._internalInfo = null;
    }

    appendData(info: MeshBlockInfo) {
        this.blockIndexs.push(...info.vertexBlocks);
        let vertexBlock = LayaGL.render2DRenderPassFactory.createGraphic2DVertexBlock();
        vertexBlock.positions = info.positions;
        vertexBlock.vertexViews = info.vertexViews;
        this.vertexs.push(vertexBlock);
    }

    update(runner: GraphicsRunner, mesh: GraphicsMesh, material: Material) {
        var blendType = runner._nBlendType;
        let struct = runner.sprite._struct;
        let sBlendMode = struct.blendMode;
        this._key.blendShader = blendType;

        if (runner.globalCompositeOperation != sBlendMode) {
            BlendModeHandler.setShaderData(blendType, this._internalInfo.shaderData);
            this.renderStateIsBySprite = false;
        }

        this.mesh = mesh;
        this.material = material;
    }

    /*
       create方法只传对submit设置的值
     */
    static create(runner: GraphicsRunner, mesh: GraphicsMesh, material: Material): SubmitBase {
        var o = new SubmitBase();
        o._internalInfo = new GraphicsShaderInfo();
        o.update(runner, mesh, material);
        return o;
    }
}

SubmitBase.RENDERBASE = new SubmitBase();

