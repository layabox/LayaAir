import { RenderSpriteData, Value2D } from "./Value2D";
import { Shader3D } from "../../../../RenderEngine/RenderShader/Shader3D";

export class TextureSV extends Value2D {


    constructor() {
        super(RenderSpriteData.Texture2D);
        TextureSV.prototype.initialize.call(this);
    }

    protected initialize(): void {
     

        this._defaultShader = Shader3D.find("Sprite2DTexture");
    }

    reinit() {
        super.initialize();
        this.initialize();
    }


}
