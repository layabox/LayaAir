import { RenderSpriteData, Value2D } from "./Value2D";
import { Shader3D } from "../../../../RenderEngine/RenderShader/Shader3D";

export class PrimitiveSV extends Value2D {
    constructor() {
        super(RenderSpriteData.Primitive);
        this._defaultShader = Shader3D.find("Sprite2DPrimitive");
    }
}

