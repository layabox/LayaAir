import { Laya } from "../../../Laya";
import { TextureFormat } from "../../RenderEngine/RenderEnum/TextureFormat";
import { Script } from "../../components/Script";
import { Loader } from "../../net/Loader";
import { SpineOptimizeRender } from "./SpineOptimizeRender";
import { ISpineOptimizeRender } from "./interface/ISpineOptimizeRender";

export class SpineBakeScript extends Script {
    url: string;
    async attach(spine: ISpineOptimizeRender) {
        let texture = await Laya.loader.load({
            url: this.url,
            type: Loader.TEXTURE2D,
            constructParams: [
                256, 256, TextureFormat.R32G32B32A32, false, false, false, false
            ]
        });
        spine.initBake(texture, {
            bonesNums: 60,
            aniOffsetMap: {
                "idle": 0,
                "skill": 179 * 60 * 2
            }
        });
    }
    // width: number, height: number, format: TextureFormat, mipmap: boolean = true, canRead: boolean, sRGB: boolean = false, premultiplyAlpha: boolean = false
}