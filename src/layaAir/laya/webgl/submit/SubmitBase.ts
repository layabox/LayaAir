import { GraphicsRunner } from "../../display/Scene2DSpecial/GraphicsRunner";
import { Material } from "../../resource/Material";
import { BlendMode } from "../canvas/BlendMode";
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
    
    infos: MeshBlockInfo[] = [];

    /** @internal */
    _internalInfo: GraphicsShaderInfo = null;

    renderStateIsBySprite = false;

    constructor() {
        this._id = ++SubmitBase.ID;
    }
  
    clear() {
        this._internalInfo.clear();
        this.material = null;
        for (let i = 0, n = this.infos.length; i < n; i++) {
            this.mesh.clearBlocks(this.infos[i].vertexBlocks, this.infos[i].indexBlocks);
        }
        this.infos.length = 0;
        this.mesh = null;
    }

    destroy() {
        this.clear();
        this._internalInfo.destroy();
        this._internalInfo = null;
    }

    appendData(info: MeshBlockInfo) {
        this.infos.push(info);
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

