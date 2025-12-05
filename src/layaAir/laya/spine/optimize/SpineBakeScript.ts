import { Laya } from "../../../Laya";
import { TextureFormat } from "../../RenderEngine/RenderEnum/TextureFormat";
import { Script } from "../../components/Script";
import { Event } from "../../events/Event";
import { Loader } from "../../net/Loader";
import { ClassUtils } from "../../utils/ClassUtils";
import { Spine2DRenderNode } from "../Spine2DRenderNode";
import { TSpineBakeData } from "./SketonOptimise";
import { SpineEmptyRender } from "./SpineEmptyRender";
import { SpineOptimizeRender } from "./SpineOptimizeRender";
import { ISpineOptimizeRender } from "./interface/ISpineOptimizeRender";


/**
 * @en Script class for baking Spine animations.
 * @zh 用于烘焙 Spine 动画的脚本类。
 */
export class SpineBakeScript extends Script {
    /**
     * @en URL of the data.
     * @zh 数据的地址。
     */
    url: string;
    /**
     * @en Bake data in string format.
     * @zh 字符串格式的烘焙数据。
     */
    bakeData: string;

    /** @ignore */
    constructor() {
        super();
    }

    /**
     * @en Called when the script is enabled.
     * @zh 当脚本被启用时调用。
     */
    onEnable(): void {
        if (this.bakeData)
            this.initBake(JSON.parse(this.bakeData));
    }

    /**
     * @en Called when the script is disabled.
     * @zh 当脚本被禁用时调用。
     */
    onDisable(): void {
        let spine = this.owner.getComponent(Spine2DRenderNode) as Spine2DRenderNode;
        if (spine.spineItem){
            spine.spineItem.initBake(null);
        }
    }

    async initBake(data: TSpineBakeData) {
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
        if (spine.spineItem && !(spine.spineItem instanceof SpineEmptyRender)) {
            if (spine.useFastRender) {
                if (!(spine.spineItem instanceof SpineOptimizeRender)) {
                    spine.changeFast();
                    spine.play(spine.animationName, spine.loop, true, spine.currentTime);
                }
                spine.spineItem.initBake(data);
            }
        } else {
            this.owner.on(Event.READY, this, () => {
                spine.spineItem.initBake(data);
            });
        }
    }
}

ClassUtils.regClass("SpineBakeScript", SpineBakeScript);