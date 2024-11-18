import { LightGenShader2D } from "./LightGen/LightGenShader2D";
import { ShadowGenShader2D } from "./ShadowGen/ShadowGenShader2D";
import { LightAndShadowGenShader2D } from "./LightAndShadowGen/LightAndShadowGenShader2D";
import { BaseLight2D } from "../BaseLight2D";

export class LightAndShadow {
    static __init__() {
        LightGenShader2D.__init__();
        ShadowGenShader2D.__init__();
        LightAndShadowGenShader2D.__init__();
        BaseLight2D._initLightRender2DRenderProperty();
    }
}