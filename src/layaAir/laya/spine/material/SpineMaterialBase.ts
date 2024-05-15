import { RenderState } from "../../RenderDriver/RenderModuleData/Design/RenderState";
import { Material } from "../../resource/Material";
import { Texture } from "../../resource/Texture";

export class SpineMaterialBase extends Material{
    private _blendMode: number = 0;
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

    cloneTo(destObject: any): void {
        super.cloneTo(destObject);
        var destBaseMaterial: SpineMaterialBase = (<SpineMaterialBase>destObject);
        destBaseMaterial._blendMode = this._blendMode;
    }
 
}