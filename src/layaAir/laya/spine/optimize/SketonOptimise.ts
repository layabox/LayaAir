import { IRenderElement2D } from "../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { TextureFormat } from "../../RenderEngine/RenderEnum/TextureFormat";
import { Graphics } from "../../display/Graphics";
import { Texture2D } from "../../resource/Texture2D";
import { Spine2DRenderNode } from "../Spine2DRenderNode";
import { ESpineRenderType } from "../SpineSkeleton";
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

    maxBoneNumber: number;

    bakeData: TSpineBakeData;

    /** */
    dynamicInfo:SketonDynamicInfo;

    constructor() {
        this.blendModeMap = new Map();
        this.skinAttachArray = [];
        this.animators = [];
        this.canCache = SketonOptimise.cacheSwitch;
    }

    _initSpineRender(skeleton: spine.Skeleton, templet: SpineTemplet, renderNode: Spine2DRenderNode, state: spine.AnimationState): ISpineOptimizeRender {
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
        //不同skin vbib长度可能不一致
        let maxVertexCount = -Number.MAX_VALUE;
        let maxIndexCount = -Number.MAX_VALUE;

        for (let i = 0, n = skins.length; i < n; i++) {
            let skin = skins[i];
            let skinAttach = new SkinAttach();
            skinAttach.name = skin.name;
            if (i != 0) {
                skinAttach.copyFrom(defaultSkinAttach);
            }
            skinAttach.attachMentParse(skin, slots);
            this.skinAttachArray.push(skinAttach);
            // if (i != 0) {
            //     defaultSkinAttach.mainVB._cloneBones(skinAttach.mainVB)
            // }
            skinAttach.init(slots);
            maxVertexCount = Math.max(skinAttach.maxVertexCount);
            maxIndexCount = Math.max(skinAttach.maxIndexCount);
            if (i == 0) {
                defaultSkinAttach = skinAttach;
            }
        }

        let indexByteCount = 2;
        let indexFormat = IndexFormat.UInt16;
        if (maxVertexCount < 256) {
            indexByteCount = 1;
            indexFormat = IndexFormat.UInt8;
        }else if (maxVertexCount > 65535) {
            indexByteCount = 4;
            indexFormat = IndexFormat.UInt32;
        }

        this.dynamicInfo = {
            maxIndexCount,
            maxVertexCount,
            indexFormat,
            indexByteCount
        }
    }

    initAnimation(animations: spine.Animation[]) {
        let maxBoneNumber = 0;
        for (let i = 0, n = animations.length; i < n; i++) {
            let animation = animations[i];
            let animator = new AnimationRender();
            animator.check(animation, this);
            this.animators.push(animator);
            this.skinAttachArray.forEach((value: SkinAttach) => {
                value.initAnimator(animator);
            });
            animator.skinDataArray.forEach((skinData) => {
                if(!skinData.isNormalRender){
                    let boneNumber = skinData.vb.boneArray.length / 2;
                    if (boneNumber > maxBoneNumber) {
                        maxBoneNumber = boneNumber;
                    }
                }
            });
        }
        this.maxBoneNumber = maxBoneNumber;
    }

    cacheBone() {
        if(!SketonOptimise.cacheSwitch){
            for (let i = 0, n = this.animators.length; i < n; i++) {
                let animator = this.animators[i];
                if(animator.boneFrames.length==0){
                    animator.cacheBones(this);
                }
                //animator.cacheBone();
            }
        }
    }

    destroy(){
        for (let i = 0 , n = this.animators.length; i < n; i++)
            this.animators[i].destroy(); 
        this.animators.length = 0;
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
    isNormalRender: boolean;

    mainVB: VBCreator;
    mainIB: IBCreator;
    tempIbCreate:IBCreator;

    hasNormalRender: boolean;
    type: ESpineRenderType;
    /** 当前皮肤的最大顶点数 */
    maxVertexCount = 0;
    /** 当前皮肤的最大索引数 */
    maxIndexCount = 0;

    constructor() {
        this.slotAttachMap = new Map();
        this.mainAttachMentOrder = [];
    }

    copyFrom(other: SkinAttach) {
        other.slotAttachMap.forEach((value, key) => {
            this.slotAttachMap.set(key, new Map(value));
        });
    }

    // checkMainAttach(slots: spine.SlotData[]) {
        // let type: ESpineRenderType = ESpineRenderType.rigidBody;
        // for (let i = 0, n = slots.length; i < n; i++) {
        //     let slot = slots[i];
        //     let attachment = this.slotAttachMap.get(slot.index).get(slot.attachmentName);
        //     let tempType = SlotUtils.checkAttachment(attachment ? attachment.sourceData : null);
        //     if (tempType < type) {
        //         type = tempType;
        //         if (type == ESpineRenderType.normal) {
        //             break;
        //         }
        //     }
        // }
        // this.type = type;

        // let vertexCount = this.maxVertexCount;
        // let indexCount = this.maxIndexCount;
        // switch (this.type) {
        //     case ESpineRenderType.normal:
        //         this.mainVB = new VBBoneCreator(vertexCount);
        //         break;
        //     case ESpineRenderType.boneGPU:
        //         this.mainVB = new VBBoneCreator(vertexCount);
        //         break;
        //     case ESpineRenderType.rigidBody:
        //         this.mainVB = new VBRigBodyCreator(vertexCount);
        //         break;
        // }

        
        // let ntype:IndexFormat = IndexFormat.UInt32;
        // if (vertexCount < 256) {
        //     ntype = IndexFormat.UInt8;
        // }else if (vertexCount < 65536) {
        //     ntype = IndexFormat.UInt16;
        // }

        // this.mainIB = new IBCreator(ntype , indexCount);
        // this.tempIbCreate = new IBCreator( this.mainIB.type , this.mainIB.maxIndexCount);
        // this.init(slots);
    // }

    attachMentParse(skinData: spine.Skin, slots: spine.SlotData[]) {
        
        let type: ESpineRenderType = ESpineRenderType.rigidBody;
        let attachments = skinData.attachments;
        let vertexCount = 0;
        let indexCount = 0;
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

                    let tempType = SlotUtils.checkAttachment(parse.sourceData);
                    if (tempType < type) {
                        type = tempType;
                    }
                    indexCount += parse.indexCount;
                    vertexCount += parse.vertexCount;
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

        this.type = type;

        this.maxVertexCount = vertexCount;
        this.maxIndexCount = indexCount;

        switch (this.type) {
            case ESpineRenderType.normal:
                this.mainVB = new VBBoneCreator(vertexCount , "UV,COLOR,POSITION,BONE");
                break;
            case ESpineRenderType.boneGPU:
                this.mainVB = new VBBoneCreator(vertexCount , "UV,COLOR,POSITION,BONE");
                break;
            case ESpineRenderType.rigidBody:
                this.mainVB = new VBRigBodyCreator(vertexCount , "UV,COLOR,POSITION,RIGIDBODY");
                break;
        }

        
        let ntype:IndexFormat = IndexFormat.UInt32;
        if (vertexCount < 256) {
            ntype = IndexFormat.UInt8;
        }else if (vertexCount < 65536) {
            ntype = IndexFormat.UInt16;
        }

        this.mainIB = new IBCreator(ntype , indexCount);
        this.tempIbCreate = new IBCreator( this.mainIB.type , this.mainIB.maxIndexCount);
        // this.init(slots);
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
                if(attach.isclip) this.isNormalRender=true;
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
        let skinData = animator.createSkinData(
            this.mainVB, this.mainIB , this.tempIbCreate , this.slotAttachMap, this.mainAttachMentOrder , this.type
        );

        skinData.name = this.name;
        
        if(this.isNormalRender){
            skinData.isNormalRender = true;
        }
        // skinData.mainibRender = this.mainIB;
        if (skinData.isNormalRender) {
            this.hasNormalRender = true;
        }
    }
}

export type TSpineBakeData = {
    bonesNums: number;
    aniOffsetMap: { [key: string]: number };
    texture2d?: Texture2D;
    simpPath?:string;
}

export type SketonDynamicInfo = {
      /** 所有皮肤的最大顶点数 */
    maxVertexCount:number;
    /** 所有皮肤的最大索引数 */
    maxIndexCount:number;
    indexFormat :IndexFormat;
    indexByteCount:number;
}