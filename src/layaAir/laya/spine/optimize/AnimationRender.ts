import { AttachmentParse } from "./AttachmentParse";
import { IBCreator } from "./IBCreator";
import { IBRenderData } from "./SketonOptimise";
import { VBCreator } from "./VBCreator";
import { ChangeDeform } from "./change/ChangeDeform";
import { ChangeDrawOrder } from "./change/ChangeDrawOrder";
import { ChangeRGBA } from "./change/ChangeRGBA";
import { ChangeSlot } from "./change/ChangeSlot";
import { IChange } from "./interface/IChange";
import { IPreRender } from "./interface/IPreRender";
import { IVBChange } from "./interface/IVBChange";
const step = 1 / 30;
/**
 * @en Represents an animation renderer for spine animations.
 * @zh 表示骨骼动画的动画渲染器。
 */
export class AnimationRender {
    /**
     * @en Temporary IBCreator for index buffer creation.
     * @zh 用于创建索引缓冲区的临时IBCreator。
     */
    static tempIbCreate: IBCreator = new IBCreator();
    /**
     * @en Name of the animation.
     * @zh 动画的名称。
     */
    name: string;
    /**
     * @en Map of frame numbers to arrays of IChange objects.
     * @zh 帧号到IChange对象数组的映射。
     */
    changeIB: Map<number, IChange[]>;
    /**
     * @en Array of vertex buffer changes.
     * @zh 顶点缓冲区变化的数组。
     */
    changeVB: IVBChange[];
    /**
     * @en Array of frame numbers.
     * @zh 帧号数组。
     */
    frames: number[];
    /**
     * @en Total number of frames in the animation.
     * @zh 动画中的总帧数。
     */
    frameNumber: number;
    /**
     * @en Array of skin animation render data.
     * @zh 皮肤动画渲染数据数组。
     */
    skinDataArray: SkinAniRenderData[];
    /**
     * @en Array of bone transforms for each frame.
     * @zh 每帧的骨骼变换数组。
     */
    boneFrames: Float32Array[][];
    /**
     * @en Array of events for each frame.
     * @zh 每帧的事件数组。
     */
    eventsFrames: spine.Event[][];
    /**
     * @en Indicates if the animation is cached.
     * @zh 指示动画是否已缓存。
     */
    isCache: boolean;


    /**
     * @en Creates a Float32Array representing a bone's transform.
     * @param bone The spine bone to get the transform from.
     * @zh 创建表示骨骼变换的Float32Array。
     * @param bone 要获取变换的spine骨骼。
     */
    static getFloat32Array(bone: spine.Bone) {
        let rs = new Float32Array(8);
        rs[0] = bone.a;
        rs[1] = bone.b;
        rs[2] = bone.worldX;
        rs[3] = 0;
        rs[4] = bone.c;
        rs[5] = bone.d;
        rs[6] = bone.worldY;
        rs[7] = 0;
        return rs;
    }

    /** @ignore */
    constructor() {
        this.changeIB = new Map();
        this.frames = [];
        this.skinDataArray = [];
        this.boneFrames = [];
        this.eventsFrames = [];
    }

    private checkChangeVB() {
        if (!this.changeVB) {
            this.changeVB = [];
        }
    }

    /**
     * @en Gets the frame index for a given time.
     * @param time The time to get the frame index for.
     * @param frameIndex The current frame index.
     * @zh 获取给定时间的帧索引。
     * @param time 要获取帧索引的时间。
     * @param frameIndex 当前帧索引。
     */
    getFrameIndex(time: number, frameIndex: number) {
        let frames = this.frames;
        let lastFrame = this.frameNumber - 1;
        if (frameIndex < -1) {
            frameIndex = -1;
        }
        else if (frameIndex == lastFrame) {
            if (time < frames[lastFrame]) {
                frameIndex = -1;
            }
        }
        else if (time >= frames[frameIndex + 1]) {
            frameIndex++;
        }
        else if (time < frames[frameIndex]) {
            frameIndex = 0;
        }
        return frameIndex;
    }

    /**
     * @en Caches bone transforms for the animation.
     * @param preRender The pre-renderer to use for caching.
     * @zh 缓存动画的骨骼变换。
     * @param preRender 用于缓存的预渲染器。
     */
    cacheBones(preRender: IPreRender) {
        let duration = preRender._play(this.name);
        let totalFrame = Math.round(duration / step) || 1;
        for (let i = 0; i <= totalFrame; i++) {
            let bones = preRender._updateState(i == 0 ? 0 : step);
            let frame: Float32Array[] = [];
            this.boneFrames.push(frame);
            for (let j = 0; j < bones.length; j++) {
                let bone = bones[j];
                let rs = AnimationRender.getFloat32Array(bone);
                frame.push(rs);
            }
        }
    }

    /**
     * @en Checks and prepares the animation data.
     * @param animation The spine animation to check.
     * @param preRender The pre-renderer to use.
     * @zh 检查并准备动画数据。
     * @param animation 要检查的spine动画。
     * @param preRender 要使用的预渲染器。
     */
    check(animation: spine.Animation, preRender: IPreRender) {
        this.name = animation.name;

        let timeline = animation.timelines;
        let tempMap = this.changeIB;
        let tempArray = this.frames;
        //this.mainIb = mainib;
        tempMap.clear();
        tempArray.length = 0;
        let hasClip: boolean;
        for (let i = 0, n = timeline.length; i < n; i++) {
            let time = timeline[i];
            if (time instanceof spine.AttachmentTimeline) {
                let attachment = time as spine.AttachmentTimeline;
                let frames = attachment.frames;
                let attachmentNames = attachment.attachmentNames;
                let slotIndex = attachment.slotIndex;
                for (let j = 0, m = frames.length; j < m; j++) {
                    let frame = frames[j];
                    let change = new ChangeSlot();
                    change.slotId = slotIndex;
                    change.attachment = attachmentNames[j] || null;
                    let arr = tempMap.get(frame);
                    if (!arr) {
                        tempArray.push(frame);
                        arr = [];
                        tempMap.set(frame, arr);
                    }
                    arr.push(change);
                }
            }
            else if (time instanceof spine.DrawOrderTimeline) {
                let drawOrder = time as spine.DrawOrderTimeline;
                let frames = drawOrder.frames;
                let orders = time.drawOrders;
                for (let j = 0, m = frames.length; j < m; j++) {
                    let frame = frames[j];
                    let change = new ChangeDrawOrder();
                    change.order = orders[j];
                    let arr = tempMap.get(frame);
                    if (!arr) {
                        tempArray.push(frame);
                        arr = [];
                        tempMap.set(frame, arr);
                    }
                    arr.unshift(change);
                }
            }
            else if (
                //@ts-ignore
                time instanceof (spine.ColorTimeline || spine.RGBATimeline)
                //@ts-ignore
                 || ( spine.TwoColorTimeline && time instanceof spine.TwoColorTimeline)
                ) {
                let rgba = time as spine.RGBATimeline;
                let frames = rgba.frames;
                let slotIndex = rgba.slotIndex;
                if (frames.length == 5 && frames[0] == 0 && frames[4] == 0) {
                    let change = new ChangeSlot();
                    change.slotId = slotIndex;
                    change.attachment = null;
                    let arr = tempMap.get(0);
                    if (!arr) {
                        tempArray.push(0);
                        arr = [];
                        tempMap.set(0, arr);
                    }
                    arr.push(change);
                }
                else {
                    this.checkChangeVB();
                    let changeRGBA = new ChangeRGBA(slotIndex);
                    //this.vb = this.vb || mainvb.clone();
                    //changeRGBA.initChange(slotIndex, this.vb);
                    this.changeVB.push(changeRGBA);
                }
                // debugger;
            }
            else if (time instanceof window.spine.ClippingAttachment) {
                hasClip = true;
            }
            else if (time instanceof window.spine.EventTimeline) {
                if (preRender.canCache) {
                    let eventTime = time as spine.EventTimeline;
                    let frames = eventTime.frames;
                    let events = eventTime.events;
                    for (let j = 0, m = frames.length; j < m; j++) {
                        let frame = frames[j];
                        let event = events[j];
                        let arr = this.eventsFrames[Math.round(frame / step)] = this.eventsFrames[frame] || [];
                        arr.push(event);
                    }
                }
            }
            else if (time instanceof spine.DeformTimeline) {
                this.checkChangeVB();
                let slotIndex = time.slotIndex;
                let change = new ChangeDeform();
                change.slotId = slotIndex;
                this.changeVB.push(change);
            }
            // else if (time instanceof window.spine.AlphaTimeline) {
            //     debugger;
            // }
            // else if (time instanceof window.spine.RGBTimeline) {
            //     debugger;
            // }
        }
        tempArray.sort();
        if (!hasClip) {
            if (preRender.canCache) {
                this.cacheBones(preRender);
                this.isCache = true;
            }
        }
        this.frameNumber = tempArray.length;
    }

    /**
     * @en Creates skin animation render data.
     * @param mainVB The main vertex buffer creator.
     * @param mainIB The main index buffer creator.
     * @param slotAttachMap Map of slot attachments.
     * @param attachMap Array of attachment parses.
     * @returns The created skin animation render data.
     * @zh 创建皮肤动画渲染数据。
     * @param mainVB 主顶点缓冲区创建器。
     * @param mainIB 主索引缓冲区创建器。
     * @param slotAttachMap 插槽附件映射。
     * @param attachMap 附件解析数组。
     * @returns 创建的皮肤动画渲染数据。
     */
    createSkinData(mainVB: VBCreator, mainIB: IBCreator, slotAttachMap: Map<number, Map<string, AttachmentParse>>, attachMap: AttachmentParse[]) {
        let skinData = new SkinAniRenderData();
        let tempMap = this.changeIB;
        let tempArray = this.frames;
        skinData.init(tempMap, mainVB, mainIB, tempArray, slotAttachMap, attachMap, this.changeVB);
        skinData.updateBoneMat = this.isCache ? (this.eventsFrames.length == 0 ? skinData.updateBoneMatCache : skinData.updateBoneMatCacheEvent) : skinData.updateBoneMatByBone;
        this.skinDataArray.push(skinData);
        return skinData;
    }
}

/**
 * @en Represents skin animation render data for spine animations.
 * @zh 表示骨骼动画的皮肤动画渲染数据。
 */
export class SkinAniRenderData {
    /**
     * @en Name of the skin animation.
     * @zh 皮肤动画的名称。
     */
    name: string;
    /**
     * @en Indicates if the skin can be instanced.
     * @zh 指示皮肤是否可以实例化。
     */
    canInstance: boolean;
    /**
     * @en Array of index buffer render data.
     * @zh 索引缓冲区渲染数据数组。
     */
    ibs: IBRenderData[];
    /**
     * @en Main index buffer render data.
     * @zh 主索引缓冲区渲染数据。
     */
    mainibRender: IBRenderData;
    /**
     * @en Vertex buffer creator.
     * @zh 顶点缓冲区创建器。
     */
    vb: VBCreator;
    /**
     * @en Main index buffer creator.
     * @zh 主索引缓冲区创建器。
     */
    mainIB: IBCreator;
    /**
     * @en Indicates if multiple render calls are possible.
     * @zh 指示是否可能进行多次渲染调用。
     */
    mutiRenderAble: boolean;
    /**
     * @en Indicates if normal rendering is required.
     * @zh 指示是否需要正常渲染。
     */
    isNormalRender: boolean;
    /**
     * @en Function to check vertex buffer changes.
     * @zh 检查顶点缓冲区变化的函数。
     */
    checkVBChange: (slots: spine.Slot[]) => boolean;
    /**
     * @en Function to update bone matrices.
     * @zh 更新骨骼矩阵的函数。
     */
    updateBoneMat: (delta: number, animation: AnimationRender, bones: spine.Bone[], state: spine.AnimationState, boneMat: Float32Array) => void;
    /**
     * @en Array of vertex buffer changes.
     * @zh 顶点缓冲区变化数组。
     */
    changeVB: IVBChange[];

    /** @ignore */
    constructor() {
        this.ibs = [];
        this.checkVBChange = this.checkVBChangeEmpty;
    }


    /**
     * @en Empty check for vertex buffer changes.
     * @param slots Spine slots.
     * @zh 空的顶点缓冲区变化检查。
     * @param slots 骨骼插槽。
     */
    checkVBChangeEmpty(slots: spine.Slot[]): boolean {
        return false;
    }

    /**
     * @en Checks for vertex buffer changes.
     * @param slots Spine slots.
     * @zh 检查顶点缓冲区变化。
     * @param slots 骨骼插槽。
     */
    checkVBChangeS(slots: spine.Slot[]): boolean {
        let result = false;
        for (let i = 0, n = this.changeVB.length; i < n; i++) {
            if (this.changeVB[i].updateVB(this.vb, slots)) {
                result = true;
            }
        }
        return result;
    }



    /**
     * @en Gets the index buffer for a given frame index.
     * @param frameIndex The frame index.
     * @zh 获取给定帧索引的索引缓冲区。
     * @param frameIndex 帧索引。
     */
    getIB(frameIndex: number) {
        //return this.mainIb.realIb;
        if (frameIndex == -1) {
            return this.mainibRender;
        }
        return this.ibs[frameIndex];
    }

    /**
     * @en Updates bone matrices using cached data.
     * @param delta Time delta.
     * @param animation Animation render data.
     * @param bones Spine bones.
     * @param state Spine animation state.
     * @param boneMat Bone matrix array.
     * @zh 使用缓存数据更新骨骼矩阵。
     * @param delta 时间增量。
     * @param animation 动画渲染数据。
     * @param bones 骨骼数组。
     * @param state 骨骼动画状态。
     * @param boneMat 骨骼矩阵数组。
     */
    updateBoneMatCache(delta: number, animation: AnimationRender, bones: spine.Bone[], state: spine.AnimationState, boneMat: Float32Array): void {
        this.vb.updateBoneCache(animation.boneFrames, delta / step, boneMat);
    }

    /**
     * @en Updates bone matrices using cached data and handles events.
     * @param delta Time delta.
     * @param animation Animation render data.
     * @param bones Spine bones.
     * @param state Spine animation state.
     * @param boneMat Bone matrix array.
     * @zh 使用缓存数据更新骨骼矩阵并处理事件。
     * @param delta 时间增量。
     * @param animation 动画渲染数据。
     * @param bones 骨骼数组。
     * @param state 骨骼动画状态。
     * @param boneMat 骨骼矩阵数组。
     */
    updateBoneMatCacheEvent(delta: number, animation: AnimationRender, bones: spine.Bone[], state: spine.AnimationState, boneMat: Float32Array): void {
        let f = delta / step;
        this.vb.updateBoneCache(animation.boneFrames, f, boneMat);
        let currFrame = Math.round(f);
        //@ts-ignore
        let curentTrack: spine.TrackEntry = state.currentTrack;
        //@ts-ignore
        let lastEventFrame = curentTrack.lastEventFrame;
        if (lastEventFrame == currFrame) {
            return;
        }
        if (lastEventFrame > currFrame || lastEventFrame == undefined) {
            lastEventFrame = -1;
        }

        if (currFrame - lastEventFrame <= 1) {
            let events = animation.eventsFrames[currFrame];
            if (events) {
                for (let i = 0, n = events.length; i < n; i++) {
                    //@ts-ignore
                    state.dispatchEvent(null, "event", events[i]);//TODO enty
                }
            }
        }
        else {
            for (let i = lastEventFrame + 1; i <= currFrame; i++) {
                let events = animation.eventsFrames[i];
                if (events) {
                    for (let j = 0, m = events.length; j < m; j++) {
                        //@ts-ignore
                        state.dispatchEvent(null, "event", events[j]);//TODO enty
                    }
                }
            }
        }
        //@ts-ignore
        curentTrack.lastEventFrame = currFrame;
    }

    /**
     * @en Updates bone matrices using individual bone data.
     * @param delta Time delta.
     * @param animation Animation render data.
     * @param bones Spine bones.
     * @param state Spine animation state.
     * @param boneMat Bone matrix array.
     * @zh 使用单个骨骼数据更新骨骼矩阵。
     * @param delta 时间增量。
     * @param animation 动画渲染数据。
     * @param bones 骨骼数组。
     * @param state 骨骼动画状态。
     * @param boneMat 骨骼矩阵数组。
     */
    updateBoneMatByBone(delta: number, animation: AnimationRender, bones: spine.Bone[], state: spine.AnimationState, boneMat: Float32Array): void {
        this.vb.updateBone(bones, boneMat);
    }

    /**
     * @en Initializes the skin animation render data.
     * @param tempMap Map of frame changes.
     * @param mainVB Main vertex buffer creator.
     * @param mainIB Main index buffer creator.
     * @param tempArray Array of frame numbers.
     * @param slotAttachMap Map of slot attachments.
     * @param attachMap Array of attachment parses.
     * @param changeVB Array of vertex buffer changes.
     * @zh 初始化皮肤动画渲染数据。
     * @param tempMap 帧变化映射。
     * @param mainVB 主顶点缓冲区创建器。
     * @param mainIB 主索引缓冲区创建器。
     * @param tempArray 帧号数组。
     * @param slotAttachMap 插槽附件映射。
     * @param attachMap 附件解析数组。
     * @param changeVB 顶点缓冲区变化数组。
     */
    init(tempMap: Map<number, IChange[]>, mainVB: VBCreator, mainIB: IBCreator, tempArray: number[], slotAttachMap: Map<number, Map<string, AttachmentParse>>, attachMap: AttachmentParse[], changeVB: IVBChange[]) {
        this.mainIB = mainIB;
        let mutiRenderAble = false;
        if (changeVB) {
            this.vb = mainVB.clone();
            this.checkVBChange = this.checkVBChangeS;
            let myChangeVB: IVBChange[] = this.changeVB = [];
            for (let i = 0, n = changeVB.length; i < n; i++) {
                let changeVBItem = changeVB[i].clone();
                if (changeVBItem.initChange(this.vb)) {
                    myChangeVB.push(changeVBItem);
                }
            }
        }
        if (tempArray.length == 0) {
            //没有修改IB的情况
            if (this.vb) {
                this.vb.initBoneMat();
            }
            else {
                this.canInstance = true;
            }
            this.vb = this.vb || mainVB;
            this.ibs.push(this.mainIB);
            //this.mainIb = mainib;
            if (this.mainIB.outRenderData.renderData.length > 1) {
                mutiRenderAble = true;
            }
        }
        else {
            this.vb = this.vb || mainVB.clone();
            let n = tempArray.length;
            for (let i = 0, n = tempArray.length; i < n; i++) {
                let frame = tempArray[i];
                let arr = tempMap.get(frame);
                for (let j = 0, m = arr.length; j < m; j++) {
                    if (!arr[j].change(this.vb, slotAttachMap)) {
                        this.isNormalRender = true;
                    }
                }
            }
            if (n == 1 && tempArray[0] == 0) {
                //只有一帧
                //this.vb=mainvb.clone();
            }
            //debugger;

            let tAttachMap = attachMap.slice();
            let order;
            this.vb.initBoneMat();
            for (let j = 0, m = tempArray.length; j < m; j++) {
                // debugger;
                let iChanges = tempMap.get(tempArray[j]);
                for (let k = 0, l = iChanges.length; k < l; k++) {
                    let ichange = iChanges[k];
                    let newOrder = ichange.changeOrder(tAttachMap);
                    if (newOrder) {
                        order = newOrder;
                    }
                }
                let ib = AnimationRender.tempIbCreate;
                this.vb.createIB(tAttachMap, ib, order);
                let temp = new Uint16Array(ib.ib.buffer, 0, ib.ibLength);
                let ibnew = new Uint16Array(temp);
                let outRenderData = ib.outRenderData;
                this.ibs[j] = { realIb: ibnew, outRenderData: outRenderData };
                if (outRenderData.renderData.length > 1) {
                    mutiRenderAble = true;
                }
            }
        }
        this.mutiRenderAble = mutiRenderAble;


    }
}