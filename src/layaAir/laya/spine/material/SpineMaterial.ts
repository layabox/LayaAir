
import { RenderState } from "../../RenderDriver/RenderModuleData/Design/RenderState";
import { Material } from "../../resource/Material";
import { Texture } from "../../resource/Texture";

export class SpineMaterial extends Material {
    private _blendMode: number = 0;

    static __initDefine__(): void {
    }

    constructor() {
        super();
        this.setShaderName("SpineNormal");
        this.renderQueue = Material.RENDERQUEUE_TRANSPARENT;
        this.alphaTest = false;
        this.depthWrite = false;
        this.cull = RenderState.CULL_BACK;
        this.blend = RenderState.BLEND_ENABLE_ALL;
        this.blendSrc = RenderState.BLENDPARAM_ONE;
        this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
        this.depthTest = RenderState.DEPTHTEST_LESS;
    }

    set blendMode(value: number) {
        //return;
        switch (value) {
            case 1: //light 
            case 3: //screen
                this.blendSrc = RenderState.BLENDPARAM_ONE;
                this.blendDst = RenderState.BLENDPARAM_ONE;
                this._blendMode = 1;
                break;
            case 2://multiply
                this.blendSrc = RenderState.BLENDPARAM_DST_COLOR;
                this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
                this._blendMode = 2;
                break;
            default://nomal
                this.blendSrc = RenderState.BLENDPARAM_ONE;
                this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
                this._blendMode = 0;
        }
    }

    get blendMode(): number {
        return this._blendMode;
    }

    set texture(value:Texture){
        this.setTexture("u_spriteTexture", value as any);
    }

    // get texture():Texture{
    //     return this.getTexture("u_spriteTexture") as Texture;
    // }
}