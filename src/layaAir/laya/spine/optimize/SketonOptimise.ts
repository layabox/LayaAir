import { IRenderElement2D } from "../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { Graphics } from "../../display/Graphics";
import { Spine2DRenderNode } from "../Spine2DRenderNode";
import { ERenderType } from "../SpineSkeleton";
import { SpineTemplet } from "../SpineTemplet";
import { AnimationRender } from "./AnimationRender";
import { AttachmentParse } from "./AttachmentParse";
import { IBCreator } from "./IBCreator";
import { MultiRenderData } from "./MultiRenderData";
import { SlotUtils } from "./SlotUtils";
import { SpineNormalRender } from "./SpineNormalRender";
import { SpineOptimizeRender } from "./SpineOptimizeRender";
import { VBBoneCreator, VBCreator, VBRigBodyCreator } from "./VBCreator";
import { IPreRender } from "./interface/IPreRender";
import { ISpineOptimizeRender } from "./interface/ISpineOptimizeRender";

export class SketonOptimise implements IPreRender {
    static normalRenderSwitch: boolean = false;
    static cacheSwitch: boolean = false;
    canCache: boolean;
    sketon: spine.Skeleton;
    _stateData: spine.AnimationStateData;
    _state: spine.AnimationState;

    blendModeMap: Map<number, number>;

    animators: AnimationRender[];

    skinAttachArray: SkinAttach[];

    defaultSkinAttach: SkinAttach;


    constructor() {
        this.blendModeMap = new Map();
        this.skinAttachArray = [];
        this.animators = [];
        this.canCache = SketonOptimise.cacheSwitch;
    }

    _initSpineRender(skeleton: spine.Skeleton, templet: SpineTemplet, renderNode:Spine2DRenderNode, state: spine.AnimationState): ISpineOptimizeRender {
        let sp: ISpineOptimizeRender;
        if (SketonOptimise.normalRenderSwitch) {
            sp = new SpineNormalRender();
        }
        else {
            sp = new SpineOptimizeRender(this);
        }
        sp.init(skeleton, templet, renderNode, state);
        return sp;
    }


    _updateState(delta: number) {
        this._state.update(delta);
        let trackEntry = this._state.getCurrent(0);
        this._state.apply(this.sketon);
        this.sketon.updateWorldTransform();
        return this.sketon.bones;
    }

    _play(animationName: string) {
        // 设置执行哪个动画
        let trackEntry = this._state.setAnimation(0, animationName, true);
        // 设置起始和结束时间
        trackEntry.animationStart = 0;
        //trackEntry.animationEnd = end;
        //@ts-ignore
        let animationDuration = trackEntry.animation.duration;
        //this._duration = animationDuration;
        return animationDuration;
    }

    checkMainAttach(skeletonData: spine.SkeletonData) {
        // this.type = ERenderType.normal;
        // return;
        this.sketon = new window.spine.Skeleton(skeletonData);
        //@ts-ignore
        this._stateData = new window.spine.AnimationStateData(this.sketon.data);
        // 动画状态类
        this._state = new window.spine.AnimationState(this._stateData);
        this.attachMentParse(skeletonData);
        this.initAnimation(skeletonData.animations);
        // this.type = type;
        // this.attachMentParse();
        // switch (this.type) {
        //     case ERenderType.normal:
        //         return;
        //     case ERenderType.boneGPU:
        //         this.mainVB = new VBBoneCreator();
        //         break;
        //     case ERenderType.rigidBody:
        //         this.mainVB = new VBRigBodyCreator();
        //         break;
        // }
        //this.mainVB = new VBCreator();
    }

    attachMentParse(skeletonData: spine.SkeletonData) {
        let skins = skeletonData.skins;
        let slots = skeletonData.slots;
        let defaultSkinAttach;
        for (let i = 0, n = skins.length; i < n; i++) {
            let skin = skins[i];
            let skinAttach = new SkinAttach();
            skinAttach.name = skin.name;
            if (i != 0) {
                skinAttach.copyFrom(defaultSkinAttach);
            }
            skinAttach.attachMentParse(skin, slots);
            this.skinAttachArray.push(skinAttach);
            skinAttach.checkMainAttach(slots);
            if (i == 0) {
                defaultSkinAttach = skinAttach;
            }
        }
    }

    initAnimation(animations: spine.Animation[]) {
        for (let i = 0, n = animations.length; i < n; i++) {
            let animation = animations[i];
            let animator = new AnimationRender();
            animator.check(animation, this);
            this.animators.push(animator);
            this.skinAttachArray.forEach((value: SkinAttach) => {
                value.initAnimator(animator);
            });
        }
    }

    init(slots: spine.Slot[]) {
        // let mainAttachMentOrder = this.mainAttachMentOrder;
        // slots.forEach((slot: spine.Slot, index: number) => {
        //     let attchment = slot.getAttachment();
        //     if (attchment) {
        //         let attach = this.slotAttachMap.get(index).get(attchment.name);
        //         this.mainVB.appendVB(attach);
        //         mainAttachMentOrder.push(attach);
        //     }
        //     else {
        //         let attach = this.slotAttachMap.get(index).get(null);
        //         mainAttachMentOrder.push(attach);
        //     }
        // });
        // this.mainVB.createIB(mainAttachMentOrder, this.mainIB);
        // this.animators = [];
        // let animations = this.sketon.data.animations;
        // let mainibRender: [Uint16Array, MultiRenderData] = [this.mainIB.realIb, this.mainIB.outRenderData];
        // for (let i = 0, n = animations.length; i < n; i++) {
        //     let animation = animations[i];
        //     let animator = new AnimationRender();
        //     animator.check(animation, this.mainVB, this.mainIB, this.slotAttachMap, mainAttachMentOrder);
        //     animator.mainibRender = mainibRender;
        //     if (animator.isNormalRender) {
        //         this.hasNormalRender = true;
        //     }
        //     this.animators.push(animator);
        // }
    }
}

export class SkinAttach {
    name: string;
    /**
     * Attachments for each slot
     */
    slotAttachMap: Map<number, Map<string, AttachmentParse>>;
    mainAttachMentOrder: AttachmentParse[];
    mainVB: VBCreator;
    mainIB: IBCreator;
    hasNormalRender: boolean;
    type: ERenderType;

    constructor() {
        this.slotAttachMap = new Map();
        this.mainIB = new IBCreator();
        this.mainAttachMentOrder = [];
    }

    copyFrom(other: SkinAttach) {
        other.slotAttachMap.forEach((value, key) => {
            this.slotAttachMap.set(key, new Map(value));
        });
    }

    checkMainAttach(slots: spine.SlotData[]) {
        let type: ERenderType = ERenderType.rigidBody;
        for (let i = 0, n = slots.length; i < n; i++) {
            let slot = slots[i];
            let attachment = this.slotAttachMap.get(slot.index).get(slot.attachmentName);
            let tempType = SlotUtils.checkAttachment(attachment ? attachment.sourceData : null);
            if (tempType < type) {
                type = tempType;
                if (type == ERenderType.normal) {
                    break;
                }
            }
        }
        this.type = type;
        switch (this.type) {
            case ERenderType.normal:
                this.mainVB = new VBBoneCreator();
                break;
            case ERenderType.boneGPU:
                this.mainVB = new VBBoneCreator();
                break;
            case ERenderType.rigidBody:
                this.mainVB = new VBRigBodyCreator();
                break;
        }
        this.init(slots);
    }

    attachMentParse(skinData: spine.Skin, slots: spine.SlotData[]) {
        let attachments = skinData.attachments;
        for (let i = 0, n = slots.length; i < n; i++) {
            let attachment = attachments[i];
            let slot = slots[i];
            let boneIndex = slot.boneData.index;
            let map = this.slotAttachMap.get(i);
            if (!map) {
                map = new Map();
                this.slotAttachMap.set(i, map);
            }
            if (attachment) {
                for (let key in attachment) {
                    let attach = attachment[key];
                    let deform = null;//slot.deform; TODO
                    let parse = new AttachmentParse();
                    parse.init(attach, boneIndex, i, deform, slot);
                    map.set(key, parse);
                }
            }
            if (!map.get(null)) {
                let nullAttachment = new AttachmentParse();
                nullAttachment.slotId = i;
                nullAttachment.color = slot.color;
                nullAttachment.boneIndex = boneIndex;
                nullAttachment.attachment = null;
                map.set(nullAttachment.attachment, nullAttachment);
            }
        }
    }

    init(slots: spine.SlotData[]) {
        let mainAttachMentOrder = this.mainAttachMentOrder;
        slots.forEach((slot: spine.SlotData, index: number) => {
            let attchment = slot.attachmentName;
            if (attchment) {
                let attach = this.slotAttachMap.get(index).get(attchment);
                if (attach) {
                    this.mainVB.appendVB(attach);
                }
                else {
                    attach = this.slotAttachMap.get(index).get(null);
                }
                mainAttachMentOrder.push(attach);
            }
            else {
                let attach = this.slotAttachMap.get(index).get(null);
                mainAttachMentOrder.push(attach);
            }
        });
        this.mainVB.initBoneMat();
        this.mainVB.createIB(mainAttachMentOrder, this.mainIB);
    }

    initAnimator(animator: AnimationRender) {
        let skinData = animator.createSkinData(this.mainVB, this.mainIB, this.slotAttachMap, this.mainAttachMentOrder);
        skinData.mainibRender = this.mainIB;
        skinData.name = this.name;
        if (skinData.isNormalRender) {
            this.hasNormalRender = true;
        }
    }
}

export type IBRenderData = {
    realIb: Uint16Array;
    outRenderData: MultiRenderData;
}