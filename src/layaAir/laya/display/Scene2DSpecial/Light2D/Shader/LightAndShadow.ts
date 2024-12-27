import { LightGenShader2D } from "./LightGen/LightGenShader2D";
import { ShadowGenShader2D } from "./ShadowGen/ShadowGenShader2D";
import { LightAndShadowGenShader2D } from "./LightAndShadowGen/LightAndShadowGenShader2D";
import { BaseLight2D } from "../BaseLight2D";
import { Light2DManager } from "../Light2DManager";

export class LightAndShadow {
    static __init__() {
        LightGenShader2D.__init__();
        ShadowGenShader2D.__init__();
        LightAndShadowGenShader2D.__init__();
        BaseLight2D.__init__();
        Light2DManager.__init__();
    }
}