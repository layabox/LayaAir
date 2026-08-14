import { AttachmentParse } from "./AttachmentParse";
import { IBCreator } from "../buffer/IBCreator";
import { SpineBoneRegistry, VBBoneCreator, VBCreator, VBRigBodyCreator } from "../buffer/VBCreator";
import { ISkeletonOptimise } from "../../../interface/ISpineParse";
import { ESpineRenderType } from "../../../SpineSkeleton";
import { ESpineRenderMode, SpineConst, TSpineBakeData } from "../../../SpineConst";
import { AnimationRender, SkinAniRenderData } from "./AnimationRender";
import { SpineNormalRenderUpdater } from "./SpineNormalRenderUpdater";
import { Texture } from "../../../../resource/Texture";
import { Texture2D } from "../../../../resource/Texture2D";
import { SpineTexture } from "../../SpineTexture";

/**
 * @en SkeletonOptimise class used for skeleton optimization.
 * @zh SkeletonOptimise 类用于骨骼优化。
 */
export class SkeletonOptimise implements ISkeletonOptimise {
    private static emptyBounds: {x:number , y:number , width:number , height:number} = {x:0, y:0, width:0, height:0};

    private _registTextures: Record<string, spine.TextureAtlasPage> = {};

    /**
     * 4.2版本以上支持物理
     * @en Indicates if physics is needed
     * @zh 是否需要物理
     */
    hasPhysics: boolean = false;
    
    /**
     * @en Indicates whether caching is possible.
     * @zh 表示是否可以缓存。
     */
    canCache: boolean;
    /**
     * @en The spine skeleton object.
     * @zh spine骨骼对象。
     */
    skeleton: spine.Skeleton;
    /**
     * @en The spine skeleton data.
     * @zh spine骨骼数据。
     */
    data: spine.SkeletonData;

    _stateData: spine.AnimationStateData;
    _state: spine.AnimationState;

    /**
     * @en Map of blend modes.
     * @zh 混合模式的映射。
     */
    blendModeMap: Map<number, number> = new Map();

    /**
     * @en Array of animation renderers.
     * @zh 动画渲染器数组。
     */
    animators: AnimationRender[] = [];

    /**
     * @en Array of skin attachments.
     * @zh 皮肤附件数组。
     */
    skinAttachArray: SkinAttach[] = [];

    /**
     * @en Default skin attachment.
     * @zh 默认皮肤附件。
     */
    defaultSkinAttach: SkinAttach;

    private _tempIbCreate: IBCreator;

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

    private _bones: SpineBoneRegistry;

    private _skinNames: string[] = [];

    /** @ignore */
    constructor() {
    }

    getAllSkinNames(): string[] {
        return this._skinNames;
    }
    
    getAnimationCount(): number {
        return this.data.animations.length;
    }

    getAniNameByIndex(index: number): string | null {
        let tAni = this.data.animations[index];
        if (tAni) return tAni.name;
        return null;
    }

    findAnimation(name: string): any | null {
        return this.data.findAnimation(name);
    }

    hasAnimation(name: string): boolean {
        return !!this.data.findAnimation(name);
    }
    
    getSkinIndexByName(skinName: string): number {
        let skins = this.data.skins;
        for (let i = 0, n = skins.length; i < n; i++) {
            if (skins[i].name == skinName) {
                return i;
            }
        }
        return -1;
    }

    _getBounds(): { x: number, y: number, width: number, height: number } {
        let skeleton: spine.Skeleton = this.skeleton;
        let skeletonData: spine.SkeletonData = this.data;
        
        let offset = new spine.Vector2;
        let size = new spine.Vector2;
        
        let skins = skeletonData.skins;
        let minX = Number.POSITIVE_INFINITY, minY = Number.POSITIVE_INFINITY, maxX = Number.NEGATIVE_INFINITY, maxY = Number.NEGATIVE_INFINITY;
        for (let index = 0; index < skins.length; index++) {
            const skin = skins[index];
            skeleton.setSkin(skin);
            skeleton.setToSetupPose();
            skeleton.updateWorldTransform(0);
            skeleton.getBounds(offset, size);
            minX = Math.min(minX, offset.x);
            minY = Math.min(minY, offset.y);
            maxX = Math.max(maxX, offset.x + size.x);
            maxY = Math.max(maxY, offset.y + size.y);
        }

        if (minX == Number.POSITIVE_INFINITY
            || minY == Number.POSITIVE_INFINITY
            || maxX == Number.NEGATIVE_INFINITY
            || maxY == Number.NEGATIVE_INFINITY
        ) {
            return SkeletonOptimise.emptyBounds;
        }
        
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        }
    }

    getSkin(index: number) {
        return this.data.skins[index];
    }

    /** @internal */
    _updateState(delta: number) {
        this._state.update(delta);
        let trackEntry = this._state.getCurrent(0);
        this._state.apply(this.skeleton);
        this.skeleton.updateWorldTransform(2);// spine.Physics.update;
        return this.skeleton.bones;
    }

    /** @internal */
    _play(animationName: string) {
        // 设置执行哪个动画
        let trackEntry = this._state.setAnimation(0, animationName, true);
        // 设置起始和结束时间
        trackEntry.animationStart = 0;
        //@ts-ignore
        let animationDuration = trackEntry.animation.duration;
        //this._duration = animationDuration;
        return animationDuration;
    }

    /**
     * @en Check and initialize the main attachment.
     * @param skeleton The skeleton
     * @param data The skeleton data to check.
     * @zh 检查并初始化主附件。
     * @param skeleton 骨骼对象。
     * @param data 要检查的骨骼数据。
     */
    checkMainAttach(skeleton: spine.Skeleton, data: spine.SkeletonData) {
        this.skeleton = skeleton;
        this.data = data;
        //@ts-ignore
        this._stateData = new spine.AnimationStateData(data);
        // 动画状态类
        this._state = new spine.AnimationState(this._stateData);

        this._bones = new SpineBoneRegistry;
        
        this.attachMentParse(data);
        this.initAnimation(data.animations);
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
        this._skinNames.length = 0;
        for (let i = 0, n = skins.length; i < n; i++) {
            let skin = skins[i];
            let skinAttach = new SkinAttach();
            skinAttach.index = i;
            skinAttach.name = skin.name;
            skinAttach._tempIbCreate = this._tempIbCreate;
            if (i != 0) {
                skinAttach.copyFrom(defaultSkinAttach);
            }
            skinAttach.attachMentParse(skin, slots, this._bones);
            this.skinAttachArray.push(skinAttach);
            skinAttach.init(slots);

            if (i == 0) {
                defaultSkinAttach = skinAttach;
            }

            this._skinNames.push(skin.name);
        }
    }

    registerTexture(texture: Texture): spine.TextureAtlasRegion {
        let tex2d = texture.bitmap as Texture2D;
        if (!tex2d) return null;

        let bitmapUrl = tex2d.url || "texture";
        let spineTexture = new SpineTexture(tex2d);

        let page = this._registTextures[bitmapUrl];
        if (!page) {
            page = new spine.TextureAtlasPage( bitmapUrl );
            page.name = bitmapUrl;
            
            //@ts-ignore
            page.texture = spineTexture;
            page.width = tex2d.width;
            page.height = tex2d.height;
            
            this._registTextures[bitmapUrl] = page;
        }

        let textureName = this._getTextureName(texture);
        let region: spine.TextureAtlasRegion = null;
        
        if (!region) {
            region = new spine.TextureAtlasRegion(page, textureName);
            region.page = page;
            region.name = textureName;
        }
        
        region.width = texture.width;
        region.height = texture.height;
        region.originalWidth = texture.sourceWidth ;
        region.originalHeight = texture.sourceHeight ;
        region.offsetX = texture.offsetX;
        region.offsetY = texture.offsetY;
        
        if (texture.uv && texture.uv.length >= 8) {
            region.u = texture.uv[0];
            region.v = texture.uv[1];
            region.u2 = texture.uv[4];
            region.v2 = texture.uv[5];
        } else {
            // 默认使用完整纹理
            region.u = 0;
            region.v = 0;
            region.u2 = 1.0;
            region.v2 = 1.0;
        }
        
        region.texture = spineTexture;
        return region;
    }

    private _getTextureName(texture: Texture): string {
        let textureName = texture.name;
        if (!textureName && texture.url) {
            textureName = texture.url.split("/").pop().split("\\").pop();
        }
        return textureName || "texture";
    }

    getTextureRegion(pageName: string, textureName: string): spine.TextureAtlasRegion {
        let page = this._registTextures[pageName];
        if (!page) return null;

        return page.regions.find(region => region.name === textureName);
    }
    
    /**
     * @en Initialize animations from the skeleton data.
     * @param animations Array of animations to initialize.
     * @zh 从骨骼数据初始化动画。
     * @param animations 要初始化的动画数组。
     */
    initAnimation(animations: spine.Animation[]) {
        //不同skin vbib长度可能不一致
        for (let i = 0, n = animations.length; i < n; i++) {
            let animation = animations[i];
            let animator = new AnimationRender();
            animator.check(animation, this);
            this.animators.push(animator);

            this.skinAttachArray.forEach((value: SkinAttach) => {
                let skinData = value.initAnimator(animator);
            });

            if (this.canCache) {
                this._initBoneFrame(animator);
            }
        }
        this.maxBoneNumber = this._bones.boneCount;
    }

    private _initBoneFrame(animator: AnimationRender) {
        let duration = this._play(animator.name);
        let totalFrame = Math.round(duration / SpineConst.SPINE_STEP) || 1;
        let offsetX = 0;
        let offsetY = 0;
        for (let i = 0; i <= totalFrame; i++) {
            let bones = this._updateState(i == 0 ? 0 : SpineConst.SPINE_STEP);
            let frame: Float32Array[] = [];
            animator.boneFrames.push(frame);
            for (let j = 0; j < bones.length; j++) {
                let bone = bones[j];
                let rs = new Float32Array(8);
                rs[0] = bone.a;
                rs[1] = bone.b;
                rs[2] = bone.worldX + offsetX;
                rs[3] = 0;
                rs[4] = bone.c;
                rs[5] = bone.d;
                rs[6] = bone.worldY + offsetY;
                rs[7] = 0;
                frame.push(rs);
            }
        }
        animator.isCache = true;
    }

    /**
     * @en Cache bone data for optimization.
     * @zh 缓存骨骼数据以进行优化。
     */
    cacheBone() {
        let boneS = this._bones.boneIdIndexPairs;

        // 保存并设置所有使用骨骼的 skinRequired = true
        let boneIndexSet = new Set<number>();
        let originalSkinRequiredMap = new Map<number, boolean>();

        for (let i = 1, n = boneS.length; i < n; i += 2) {
            let boneIndex = boneS[i];
            boneIndexSet.add(boneIndex);
            let bone = this.skeleton.bones[boneIndex];
            if (bone && bone.data) {
                originalSkinRequiredMap.set(boneIndex, bone.data.skinRequired);
                bone.data.skinRequired = false;
            }
        }
        
        this.skeleton.updateCache();

        // 执行 cache 操作
        for (let i = 0, n = this.animators.length; i < n; i++) {
            let animator = this.animators[i];
            if (animator.boneFrames.length == 0 && !animator.hasClip) {
                this._initBoneFrame(animator);
            }
        }
        
        // 还原原始设置
        originalSkinRequiredMap.forEach((originalValue, boneIndex) => {
            let bone = this.skeleton.bones[boneIndex];
            if (bone && bone.data) {
                bone.data.skinRequired = originalValue;
            }
        });
    }

    /**
     * @en Cache normal mode render data (vertices, indices, submesh, materials).
     * @zh 缓存 Normal 模式的渲染数据（顶点、索引、submesh、材质）。
     */
    cacheRender(): void {
        if (!SpineConst.cacheSwitch) {
            for (let i = 0, n = this.animators.length; i < n; i++) {
                let animator = this.animators[i];

                if (animator.hasRenderCache) continue;

                for (let skinData of animator.skinDataArray) {
                    this._cacheRenderForSkin(animator, skinData);
                }

                animator.hasRenderCache = true;
            }
        }
    }

    private _cacheRenderForSkin(animator: AnimationRender, skinData: SkinAniRenderData): void {
        // 播放动画并计算总帧数
        let duration = this._play(animator.name);
        let totalFrame = Math.round(duration / SpineConst.SPINE_STEP) || 1;

        let tempUpdater = new SpineNormalRenderUpdater();

        // 初始化缓存数组
        skinData.renderCache = [];

        // 逐帧生成并缓存渲染数据
        for (let frameIndex = 0; frameIndex <= totalFrame; frameIndex++) {
            this._updateState(frameIndex == 0 ? 0 : SpineConst.SPINE_STEP);
            this.skeleton.updateWorldTransform(2);  // spine.Physics.update

            tempUpdater.renderUpdate(frameIndex * SpineConst.SPINE_STEP, this.skeleton, null, -1, -1, 0, 0);

            // 导出缓存数据
            let frameCache = tempUpdater.exportToCache();

            skinData.renderCache[frameIndex] = frameCache;
        }

        skinData.hasRenderCache = true;
    }

    destroy() {
        for (let i = 0, n = this.animators.length; i < n; i++)
            this.animators[i].destroy();
        this.animators.length = 0;
    }
}

/**
 * @en SkinAttach class represents skin attachment.
 * @zh SkinAttach类表示皮肤附件。
 */
export class SkinAttach {
    /**
     * @en Index of the skin attachment.
     * @zh 皮肤附件的索引。
     */
    index: number;
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
    _tempIbCreate: IBCreator;
    /**
     * @en Type of spine rendering.
     * @zh spine渲染的类型。
     */
    type: ESpineRenderType;
    /**
     * @en The number of bones that affect a vertex.
     * @zh 影响一个顶点的最大骨骼数。
     */
    vertexBones: number = 0;
    /**
     * @en The index of the rigid body bone.
     * @zh 刚体骨骼的索引。
     */
    rbBoneIndex: number = -1;
    /**
     * @en Indicates if two color tint is used.
     * @zh 表示是否使用双色着色。
     */
    twoColorTint: boolean = false;

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
    attachMentParse(skinData: spine.Skin, slots: spine.SlotData[] , boneRegistry : SpineBoneRegistry) {
        let vertexBones = 0;
        let attachments = skinData.attachments;
        let vertexCount = 0;
        let indexCount = 0;
        let twoColorTint = false;
        let bones = new Set<number>();
        
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
                    // if (parse.isNormalRender) this.isNormalRender = true;
                    vertexBones = Math.max(vertexBones, parse.vertexBones);
                    indexCount += parse.indexCount;
                    vertexCount += parse.vertexCount;
                    twoColorTint = twoColorTint || !!parse.darkColor;
                    map.set(key, parse);
                    parse.bones.forEach(bone => {
                        bones.add(bone);
                    });
                }
            } else if (slotAttachName) {
                let parse = map.get(slotAttachName);
                if (parse) {
                    indexCount += parse.indexCount;
                    vertexCount += parse.vertexCount;
                    vertexBones = Math.max(vertexBones, parse.vertexBones);
                    twoColorTint = twoColorTint || !!parse.darkColor;
                    parse.bones.forEach(bone => {
                        bones.add(bone);
                    });
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

        let size = bones.size;
        if (size > 1) {
            this.type = ESpineRenderType.boneGPU;
        }
        else if(size === 1){
            this.type = ESpineRenderType.rigidBody;
            this.rbBoneIndex = bones.values().next().value;
        }
        else {
            this.type = ESpineRenderType.normal;
        }
        this.vertexBones = vertexBones;
        
        this.twoColorTint = twoColorTint;
        let flag: string;
        switch (this.type) {
            case ESpineRenderType.normal:
                flag = "UV,COLOR,POSITION,BONE";
                if (twoColorTint) flag += ",COLOR2";
                this.mainVB = new VBBoneCreator(flag, vertexCount, true , boneRegistry);
                break;
            case ESpineRenderType.boneGPU:
                flag = "UV,COLOR,POSITION,BONE";
                if (twoColorTint) flag += ",COLOR2";
                this.mainVB = new VBBoneCreator(flag, vertexCount , true, boneRegistry);
                break;
            case ESpineRenderType.rigidBody:
                flag = "UV,COLOR,POSITION";
                if (twoColorTint) flag += ",COLOR2";
                this.mainVB = new VBRigBodyCreator(flag, vertexCount , true , boneRegistry);
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
                let parse = this.slotAttachMap.get(index).get(attchment);
                if (parse) {
                    this.mainVB.appendVB(parse);
                }
                else {
                    parse = this.slotAttachMap.get(index).get(null);
                }
                if (parse.isClip) this.isNormalRender = true;
                mainAttachMentOrder.push(parse);
            }
            else {
                let attach = this.slotAttachMap.get(index).get(null);
                mainAttachMentOrder.push(attach);
            }
        });
        this.mainIB.createIB(mainAttachMentOrder, this.mainVB);
    }

    /**
     * @en Initialize an animator with this skin attachment.
     * @param animator The animation renderer to initialize.
     * @zh 使用此皮肤附件初始化动画器。
     * @param animator 要初始化的动画渲染器。
     */
    initAnimator(animator: AnimationRender): SkinAniRenderData {
        let skinData = animator.createSkinData(
            this.mainVB, this.mainIB, this._tempIbCreate, this.slotAttachMap, this.mainAttachMentOrder, this.type
        );
        skinData.name = this.name + "_" + animator.name;
        return skinData;
    }
}
