import { Graphics } from "../../display/Graphics";
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
import { ISpineOptimizeRender } from "./interface/ISpineOptimizeRender";

export class SketonOptimise {
    sketon: spine.Skeleton;

    blendModeMap: Map<number, number>;

    slotAttachMap: Map<number, Map<string, AttachmentParse>>;

    mainVB: VBCreator;
    mainIB: IBCreator;
    mainAttachMentOrder: AttachmentParse[];
    animators: AnimationRender[];

    hasNormalRender: boolean;

    type: ERenderType;

    constructor() {
        this.slotAttachMap = new Map();
        this.mainIB = new IBCreator();
        this.mainAttachMentOrder = [];
        this.blendModeMap = new Map();
    }

    _initSpineRender(skeleton: spine.Skeleton, templet: SpineTemplet, graphics: Graphics): ISpineOptimizeRender {
        let sp: ISpineOptimizeRender;
        if (this.type == ERenderType.normal) {
            sp = new SpineNormalRender();
        }
        else {
            sp = new SpineOptimizeRender(this);
        }
        sp.init(skeleton, templet, graphics);
        return sp;
    }

    checkMainAttach(skeletonData: spine.SkeletonData) {
        // this.type = ERenderType.normal;
        // return;
        this.sketon = new spine.Skeleton(skeletonData);
        let slots = this.sketon.slots;
        let type: ERenderType = ERenderType.rigidBody;
        for (let i = 0, n = slots.length; i < n; i++) {
            let slot = slots[i];
            let tempType = SlotUtils.checkAttachment(slot.getAttachment());
            if (tempType < type) {
                type = tempType;
                if (type == ERenderType.normal) {
                    break;
                }
            }
        }
        this.type = type;
        this.attachMentParse();
        switch (this.type) {
            case ERenderType.normal:
                return;
            case ERenderType.boneGPU:
                this.mainVB = new VBBoneCreator();
                break;
            case ERenderType.rigidBody:
                this.mainVB = new VBRigBodyCreator();
                break;
        }
        //this.mainVB = new VBCreator();
        this.init(slots);
    }

    attachMentParse() {
        let attachments = this.sketon.data.defaultSkin.attachments;
        let slots = this.sketon.slots;
        for (let i = 0, n = attachments.length; i < n; i++) {
            let attachment = attachments[i];
            let slot = slots[i];
            this.blendModeMap.set(i, slot.data.blendMode);
            let boneIndex = slot.bone.data.index;
            let map = this.slotAttachMap.get(i);
            if (!map) {
                map = new Map();
                this.slotAttachMap.set(i, map);
            }
            for (let key in attachment) {
                let attach = attachment[key];
                let deform = slot.deform;
                let parse = new AttachmentParse();
                parse.init(attach, boneIndex, i, deform, slot);
                map.set(key, parse);
            }

            let nullAttachment = new AttachmentParse();
            nullAttachment.slotId = i;
            nullAttachment.color = slot.color;
            nullAttachment.boneIndex = boneIndex;
            nullAttachment.attachment = null;
            map.set(nullAttachment.attachment, nullAttachment);
            //nullAttachment.
        }
    }

    init(slots: spine.Slot[]) {
        let mainAttachMentOrder = this.mainAttachMentOrder;
        slots.forEach((slot: spine.Slot, index: number) => {
            let attchment = slot.getAttachment();
            if (attchment) {
                let attach = this.slotAttachMap.get(index).get(attchment.name);
                this.mainVB.appendVB(attach);
                mainAttachMentOrder.push(attach);
            }
            else {
                let attach = this.slotAttachMap.get(index).get(null);
                mainAttachMentOrder.push(attach);
            }
        });
        this.mainVB.createIB(mainAttachMentOrder, this.mainIB);
        this.animators = [];
        let animations = this.sketon.data.animations;
        let mainibRender: [Uint16Array, MultiRenderData] = [this.mainIB.realIb, this.mainIB.outRenderData];
        for (let i = 0, n = animations.length; i < n; i++) {
            let animation = animations[i];
            let animator = new AnimationRender();
            animator.check(animation, this.mainVB, this.mainIB, this.slotAttachMap, mainAttachMentOrder);
            animator.mainibRender = mainibRender;
            if (animator.isNormalRender) {
                this.hasNormalRender = true;
            }
            this.animators.push(animator);
        }
    }
}