import { Laya, init } from "../../../Laya";
import { TextureFormat } from "../../RenderEngine/RenderEnum/TextureFormat";
import { Script } from "../../components/Script";
import { Event } from "../../events/Event";
import { Loader } from "../../net/Loader";
import { ClassUtils } from "../../utils/ClassUtils";
import { Spine2DRenderNode } from "../Spine2DRenderNode";
import { TSpineBakeData } from "./SketonOptimise";
import { SpineOptimizeRender } from "./SpineOptimizeRender";
import { ISpineOptimizeRender } from "./interface/ISpineOptimizeRender";

export class SpineBakeScript extends Script {
    url: string;
    private _bakeData: TSpineBakeData;

    constructor() {
        super();
    }

    async attach(spine: ISpineOptimizeRender) {
        let texture = await Laya.loader.load({
            url: this.url,
            type: Loader.TEXTURE2D,
            constructParams: [
                256, 256, TextureFormat.R32G32B32A32, false, false, false, false
            ]
        });
        spine.initBake({
            bonesNums: 60,
            aniOffsetMap: {
                "idle": 0,
                "skill": 179 * 60 * 2
            },
            texture2d: texture
        });
    }
    // width: number, height: number, format: TextureFormat, mipmap: boolean = true, canRead: boolean, sRGB: boolean = false, premultiplyAlpha: boolean = false

    private async initBake(data: TSpineBakeData) {
        const textureWidth = data.aniOffsetMap.textureWidth || 256;
        let texture = await Laya.loader.load({
            url: data.simpPath,
            type: Loader.TEXTURE2D,
            constructParams: [
                textureWidth, textureWidth, TextureFormat.R32G32B32A32, false, false, false, false
            ]
        });
        data.texture2d = texture;

        let spine = this.owner.getComponent(Spine2DRenderNode) as Spine2DRenderNode;
        if (spine.spineItem) {
            spine.spineItem.initBake(data);
        } else {
            this.owner.on(Event.READY, this, () => {
                spine.spineItem.initBake(data);
            });
        }
    }

    public get bakeData(): any {
        return this._bakeData;
    }
    public set bakeData(value: string) {
        this._bakeData = value ? JSON.parse(value) : null;

        if (this._bakeData)
            this.initBake(this._bakeData);
    }
}

ClassUtils.regClass("SpineBakeScript", SpineBakeScript);