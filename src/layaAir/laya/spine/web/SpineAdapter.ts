import { Laya } from "../../../Laya";
import { SpineConst } from "../SpineConst";
import { JSSpineFactory } from "./JSSpineFactory";
import { SpineNormalRenderUpdater } from "./base/optimize/SpineNormalRenderUpdater";

/**
 * @en SpineAdapter is an adapter class for integrating the Spine animation system.
 * @zh SpineAdapter 是一个适配器类，用于集成 Spine 动画系统。
 */
export class SpineAdapter {
    /**
     * @en Map of state values to their corresponding string representations.
     * @zh 状态值到其对应字符串表示的映射。
     */
    static stateMap: any = { 0: "start", 1: "interrupt", 2: "end", 3: "complete", 4: "dispose", 5: "event" };

    /**
     * @en Adapt the JavaScript version of Spine.
     * @zh 适配 JavaScript 版本的 Spine。
     */
    static adaptJS() {
        let ns = window.spine;
        if (ns) {
            let stateProto = ns.AnimationState.prototype;
            //@ts-ignore
            stateProto.getCurrentOld = stateProto.getCurrent;

            stateProto.getCurrent = function (trackIndex: number) {
                //@ts-ignore
                let result = this.getCurrentOld(trackIndex);
                //@ts-ignore
                this.currentTrack = result;
                return result;
            }

            if (SpineConst.VERSION == "3.7") {
                let bone_proto = ns.Bone.prototype
                bone_proto.active = true;
            }
        }
    }

}

Laya.addInitCallback(() => {
    SpineConst.factory = new JSSpineFactory();
    SpineNormalRenderUpdater.__init__();
    SpineAdapter.adaptJS();
});
