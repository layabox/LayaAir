import { IRenderElement2D } from "../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { TextureFormat } from "../../RenderEngine/RenderEnum/TextureFormat";
import { Graphics } from "../../display/Graphics";
import { Mesh2D } from "../../resource/Mesh2D";
import { Texture2D } from "../../resource/Texture2D";
import { Spine2DRenderNode } from "../Spine2DRenderNode";
import { ESpineRenderType } from "../SpineSkeleton";
import { SpineTemplet } from "../SpineTemplet";
import { AnimationRender, FrameRenderData } from "./AnimationRender";
import { AttachmentParse } from "./AttachmentParse";
import { IBCreator } from "./IBCreator";
import { MultiRenderData } from "./MultiRenderData";
import { SlotUtils } from "./SlotUtils";
import { SpineNormalRender } from "./SpineNormalRender";
import { SpineOptimizeRender } from "./SpineOptimizeRender";
import { VBBoneCreator, VBCreator, VBRigBodyCreator } from "./VBCreator";
import { IPreRender } from "./interface/IPreRender";
import { ISpineOptimizeRender } from "./interface/ISpineOptimizeRender";

/**
 * @en SketonOptimise class used for skeleton optimization.
 * @zh SketonOptimise 类用于骨骼优化。
 */
export class SketonOptimise implements IPreRender {
    /**
     * @en Switch for normal rendering mode.
     * @zh 普通渲染模式的开关。
     */
    static normalRenderSwitch: boolean = false;

    /** optimise render的最大骨骼数 */
    static MAX_BONES = 100;

    /**
     * @en Switch for caching mode.
     * @zh 缓存模式的开关。
     */
    static cacheSwitch: boolean = false;
    /**
     * @en Indicates whether caching is possible.
     * @zh 表示是否可以缓存。
     */
    canCache: boolean;
    /**
     * @en The spine skeleton object.
     * @zh spine骨骼对象。
     */
    sketon: spine.Skeleton;

    _stateData: spine.AnimationStateData;
    _state: spine.AnimationState;

    /**
     * @en Map of blend modes.
     * @zh 混合模式的映射。
     */
    blendModeMap: Map<number, number>;

    /**
     * @en Array of animation renderers.
     * @zh 动画渲染器数组。
     */
    animators: AnimationRender[];

    /**
     * @en Array of skin attachments.
     * @zh 皮肤附件数组。
     */
    skinAttachArray: SkinAttach[];

    /**
     * @en Default skin attachment.
     * @zh 默认皮肤附件。
     */
    defaultSkinAttach: SkinAttach;

    private _tempIbCreate:IBCreator;

    /**
     * @en Maximum number of bones.
     * @zh 最大骨骼数量。
     */
    maxBoneNumber: number;

    /**
     * @en Baked spine data.
     * @zh 烘焙的spine数据。
     */
    bakeData: TSpineBakeData;

    _dynamicInfo:SketonDynamicInfo;

    /** @ignore */
    constructor() {
        this.blendModeMap = new Map();
        this.skinAttachArray = [];
        this.animators = [];
        this.canCache = SketonOptimise.cacheSwitch;
    }

    /** @internal */
    _initSpineRender(skeleton: spine.Skeleton, templet: SpineTemplet, renderNode: Spine2DRenderNode, state: spine.AnimationState): ISpineOptimizeRender {
        let sp: ISpineOptimizeRender;
        if (SketonOptimise.normalRenderSwitch) {
            sp = new SpineNormalRender();
        }
        else if (this.maxBoneNumber > SketonOptimise.MAX_BONES) {
            console.warn("The number of Bones :" , this.maxBoneNumber ," > " , SketonOptimise.MAX_BONES , ", use CPU caculation");
            sp = new SpineNormalRender();
        }
        else {
            sp = new SpineOptimizeRender(this);
        }
        sp.init(skeleton, templet, renderNode, state);
        return sp;
    }

    /** @internal */
    _updateState(delta: number) {
        this._state.update(delta);
        let trackEntry = this._state.getCurrent(0);
        this._state.apply(this.sketon);
        this.sketon.updateWorldTransform();
        return this.sketon.bones;
    }
    /** @internal */
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

    /**
     * @en Check and initialize the main attachment.
     * @param skeletonData The skeleton data to check.
     * @zh 检查并初始化主附件。
     * @param skeletonData 要检查的骨骼数据。
     */
    checkMainAttach(skeletonData: spine.SkeletonData) {
        // return;
        this.sketon = new window.spine.Skeleton(skeletonData);
        //@ts-ignore
        this._stateData = new window.spine.AnimationStateData(this.sketon.data);
        // 动画状态类
        this._state = new window.spine.AnimationState(this._stateData);
        this.attachMentParse(skeletonData);
        this.initAnimation(skeletonData.animations);
    }

    /**
     * @en Parse attachments from skeleton data.
     * @param skeletonData The skeleton data to parse.
     * @zh 从骨骼数据解析附件。
     * @param skeletonData 要解析的骨骼数据。
     */
    attachMentParse(skeletonData: spine.SkeletonData) {
        let skins = skeletonData.skins;
        let slots = skeletonData.slots;
        let defaultSkinAttach;

        this._tempIbCreate = new IBCreator();

        for (let i = 0, n = skins.length; i < n; i++) {
            let skin = skins[i];
            let skinAttach = new SkinAttach();
            skinAttach.name = skin.name;
            skinAttach._tempIbCreate = this._tempIbCreate;
            if (i != 0) {
                skinAttach.copyFrom(defaultSkinAttach);
            }
            skinAttach.attachMentParse(skin, slots);
            this.skinAttachArray.push(skinAttach);
            // if (i != 0) {
            //     defaultSkinAttach.mainVB._cloneBones(skinAttach.mainVB)
            // }
            skinAttach.init(slots);
            
            if (i == 0) {
                defaultSkinAttach = skinAttach;
            }
        }
    }

    /**
     * @en Initialize animations from the skeleton data.
     * @param animations Array of animations to initialize.
     * @zh 从骨骼数据初始化动画。
     * @param animations 要初始化的动画数组。
     */
    initAnimation(animations: spine.Animation[]) {
        let maxBoneNumber = 0;
        //不同skin vbib长度可能不一致
        let maxVertexCount = -Number.MAX_VALUE;
        let maxIndexCount = -Number.MAX_VALUE;

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
                maxVertexCount = Math.max(skinData.maxVertexCount, maxVertexCount) 
                maxIndexCount = Math.max(skinData.maxIndexCount , maxIndexCount) 
            });
        }
        
        this.maxBoneNumber = maxBoneNumber;

        this._dynamicInfo = {
            maxIndexCount,
            maxVertexCount,
        }
    }

    /**
     * @en Cache bone data for optimization.
     * @zh 缓存骨骼数据以进行优化。
     */
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

    /**
     * @en Initialize the skeleton with given slots.
     * @param slots Array of spine slots.
     * @zh 使用给定的插槽初始化骨骼。
     * @param slots spine插槽数组。
     */
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

/**
 * @en SkinAttach class represents skin attachment.
 * @zh SkinAttach类表示皮肤附件。
 */
export class SkinAttach {
    /**
     * @en Name of the skin attachment.
     * @zh 皮肤附件的名称。
     */
    name: string;
    /**
     * @en Attachments for each slot
     * @zh 每个插槽的附件。
     */
    slotAttachMap: Map<number, Map<string, AttachmentParse>>;
    /**
     * @en Order of main attachments.
     * @zh 主要附件的顺序。
     */
    mainAttachMentOrder: AttachmentParse[];
    /**
     * @en Indicates if normal rendering is used.
     * @zh 表示是否使用普通渲染。
     */
    isNormalRender: boolean;
    /**
     * @en Main vertex buffer creator.
     * @zh 主顶点缓冲区创建器。
     */
    mainVB: VBCreator;
    /**
     * @en Main index buffer creator.
     * @zh 主索引缓冲区创建器。
     */
    mainIB: IBCreator;
    /**
     * @en Used for constructing temp Mesh2D
     * @zh 用于构建临时Mesh2D
     */
    _tempIbCreate:IBCreator;
    /**
     * @en Indicates if there's any normal rendering.
     * @zh 表示是否存在任何普通渲染。
     */
    hasNormalRender: boolean;
    /**
     * @en Type of spine rendering.
     * @zh spine渲染的类型。
     */
    type: ESpineRenderType;

    /** @ignore */
    constructor() {
        this.slotAttachMap = new Map();
        this.mainAttachMentOrder = [];
    }

    /**
     * @en Copy data from another SkinAttach.
     * @param other The SkinAttach to copy from.
     * @zh 从另一个SkinAttach复制数据。
     * @param other 要复制的SkinAttach。
     */
    copyFrom(other: SkinAttach) {
        other.slotAttachMap.forEach((value, key) => {
            this.slotAttachMap.set(key, new Map(value));
        });
    }

    /**
     * @en Parse attachments from skin data.
     * @param skinData The spine skin data.
     * @param slots Array of spine slot data.
     * @zh 从皮肤数据解析附件。
     * @param skinData spine皮肤数据。
     * @param slots spine插槽数据数组。
     */
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
            let slotAttachName = slot.attachmentName;

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
            }else if (slotAttachName) {
                let parse = map.get(slotAttachName);
                if (parse) {
                    indexCount += parse.indexCount;
                    vertexCount += parse.vertexCount;
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

        switch (this.type) {
            case ESpineRenderType.normal:
                this.mainVB = new VBBoneCreator( "UV,COLOR,POSITION,BONE" , vertexCount);
                break;
            case ESpineRenderType.boneGPU:
                this.mainVB = new VBBoneCreator( "UV,COLOR,POSITION,BONE" , vertexCount);
                break;
            case ESpineRenderType.rigidBody:
                this.mainVB = new VBRigBodyCreator( "UV,COLOR,POSITION,RIGIDBODY" , vertexCount);
                break;
        }
        
        //皮肤的基础长度
        this.mainIB = new IBCreator();
        this.mainIB.updateFormat(vertexCount);
        this.mainIB.setBufferLength(indexCount);
    }

    /**
     * @en Initialize the skin attachment.
     * @param slots Array of spine slot data.
     * @zh 初始化皮肤附件。
     * @param slots spine插槽数据数组。
     */
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
        this.mainIB.createIB(mainAttachMentOrder, this.mainVB);
    }

    /**
     * @en Initialize an animator with this skin attachment.
     * @param animator The animation renderer to initialize.
     * @zh 使用此皮肤附件初始化动画器。
     * @param animator 要初始化的动画渲染器。
     */
    initAnimator(animator: AnimationRender) {
        let skinData = animator.createSkinData(
            this.mainVB, this.mainIB , this._tempIbCreate , this.slotAttachMap, this.mainAttachMentOrder , this.type
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
    /** 所有皮肤动画的最大顶点数 */
    maxVertexCount:number;
    /** 所有皮肤动画的最大索引数 */
    maxIndexCount:number;
}