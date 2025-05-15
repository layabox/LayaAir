import { GraphicsRunner } from "../../display/Scene2DSpecial/GraphicsRunner";
import { Material } from "../../resource/Material";
import { BlendMode } from "../canvas/BlendMode";
import { GraphicsShaderInfo } from "../shader/d2/value/GraphicsShaderInfo";
import { GraphicsMesh, MeshBlockInfo } from "../utils/GraphicsMesh";
import { SubmitKey } from "./SubmitKey";
import { IBufferDataView } from "../../RenderDriver/RenderModuleData/Design/2D/IRender2DDataHandle";

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
    
    vertexViews: IBufferDataView[] = [];
    indexViews: IBufferDataView[] = [];
    vertexBlocks: number[] = [];
    indexBlocks: number[] = [];

    /** @internal */
    _internalInfo: GraphicsShaderInfo = null;

    renderStateIsBySprite = false;

    constructor() {
        this._id = ++SubmitBase.ID;
    }
  
    clear() {
        this._internalInfo.clear();
        this.material = null;
        this.mesh.clearBlocks(this.vertexBlocks, this.indexBlocks);
        this.vertexViews.length = 0;
        this.indexViews.length = 0;
        this.vertexBlocks.length = 0;
        this.indexBlocks.length = 0;
        this.mesh = null;
    }

    destroy() {
        this.clear();
        this._internalInfo.destroy();
        this._internalInfo = null;
    }

    appendData(info: MeshBlockInfo) {
        this.vertexViews.push(...info.vertexViews);
        this.indexViews.push(...info.indexViews);
        this.vertexBlocks.push(...info.vertexBlocks);
        this.indexBlocks.push(...info.indexBlocks);
    }

    update(runner: GraphicsRunner , mesh: GraphicsMesh , material: Material) {
        var blendType = runner._nBlendType;
        let struct = runner.sprite._struct;
        let sBlendMode = struct.getBlendMode();
        this._key.blendShader = blendType;

        if (runner.globalCompositeOperation != sBlendMode) {
            BlendMode.setShaderData(blendType, this._internalInfo.shaderData);
            this.renderStateIsBySprite = false;
        }

        this.mesh = mesh;
        this.material = material;
        this._key.clear();
    }

    /*
       create方法只传对submit设置的值
     */
    static create( runner: GraphicsRunner , mesh: GraphicsMesh , material: Material): SubmitBase {
        var o = new SubmitBase();
        o._internalInfo = new GraphicsShaderInfo();
        o.update(runner , mesh , material);
        return o;
    }
}

SubmitBase.RENDERBASE = new SubmitBase();

