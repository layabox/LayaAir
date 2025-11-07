import { Laya } from "../../../../Laya";
import { SpineConst } from "../../SpineConst";
import { JSSpineFactory } from "./JSSpineFactory";
import { SpineNormalRenderUpdater } from "./SpineNormalRenderUpdater";

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
     * @en Perform all necessary adaptations for Spine integration.
     * @zh 执行所有必要的 Spine 集成适配。
     */
    static allAdpat() {
        let ns = window.spine;
        let stateProto = ns.AnimationState.prototype;
        //@ts-ignore
        stateProto.oldApply = stateProto.apply;
        //@ts-ignore
        stateProto.applyCache = function (skeleton: spine.Skeleton) {
            //this.setAnimationLast(this.animationLast);
        }
        //@ts-ignore
        stateProto.getCurrentPlayTimeOld = function (trackIndex: number) {
            //@ts-ignore
            // return Math.max(0, this.getCurrentOld(trackIndex).animationLast);
            return this.getCurrentOld(trackIndex).getAnimationTime();
        }
        //@ts-ignore
        stateProto.getCurrentPlayTime = stateProto.getCurrentPlayTimeOld;
        //@ts-ignore
        stateProto.getCurrentPlayTimeByCache = function (trackIndex: number) {
            let entry = this.getCurrent(trackIndex);
            //trackEntry.setAnimationLast(trackEntry.getAnimationTime());
            let animationStart = entry.animationStart, animationEnd = entry.animationEnd;
            let duration = animationEnd - animationStart;
            entry.trackLast = entry.nextTrackLast;
            let trackLastWrapped = entry.trackLast % duration;
            let animationTime = entry.getAnimationTime();
            //entry.setAnimationLast(animationTime);

            let complete = false;
            if (entry.loop)
                complete = duration == 0 || trackLastWrapped > entry.trackTime % duration;
            else
                complete = animationTime >= animationEnd && entry.animationLast < animationEnd;
            if (complete) {
                //@ts-ignore
                this.dispatchEvent(entry, "complete", null);
                entry.nextAnimationLast = -1;
                entry.nextTrackLast = -1;
                return 0;
                // animationTime = 0;
            }
            entry.nextAnimationLast = animationTime;
            entry.nextTrackLast = entry.trackTime;
            let animationLast = entry.animationLast;
            return Math.max(animationLast, 0);
        }



        let skeletonProto = ns.Skeleton.prototype;
        //@ts-ignore
        skeletonProto.oldUpdateWorldTransform = skeletonProto.updateWorldTransform;
        //@ts-ignore
        skeletonProto.updateWorldTransformCache = function () {

        }
        //@ts-ignore
        ns.AnimationState.prototype.dispatchEvent = function (entry: any, type: string, event: any) {
            //@ts-ignore
            this.eventsObject[type](entry, event);
        }
    }

    /**
     * @en Adapt the JavaScript version of Spine.
     * @zh 适配 JavaScript 版本的 Spine。
     */
    static adaptJS() {
        let ns = window.spine;
        if (ns) {
            //@ts-ignore 
            ns.AnimationState.prototype.oldAddListener = ns.AnimationState.prototype.addListener;
            ns.AnimationState.prototype.addListener = function (data: any) {
                //@ts-ignore 
                this.eventsObject = data;
                //@ts-ignore 
                this.oldAddListener(data);
            };
            let sketonDataProto = ns.SkeletonData.prototype;
            //@ts-ignore
            sketonDataProto.getAnimationsSize = function () { return this.animations.length };
            //@ts-ignore
            sketonDataProto.getAnimationByIndex = function (index: number) { return this.animations[index] };
            //@ts-ignore
            sketonDataProto.getSkinIndexByName = function (name: string) {
                let skins = this.skins;
                for (let i = 0, n = skins.length; i < n; i++) {
                    if (skins[i].name == name) {
                        return i;
                    }
                }
                return -1;
            }
            let skeletonProto = ns.Skeleton.prototype;
            //@ts-ignore
            skeletonProto.showSkinByIndex = function (index: number) {
                this.setSkin(this.data.skins[index]);
            }
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
    SpineAdapter.allAdpat();
});
