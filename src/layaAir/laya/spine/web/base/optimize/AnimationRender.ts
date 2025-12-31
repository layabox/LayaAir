import { AttachmentParse } from "../optimize/AttachmentParse";
import { IBCreator } from "../buffer/IBCreator";
import { MultiRenderData } from "../buffer/MultiRenderData";
import { VBCreator } from "../buffer/VBCreator";
import { ChangeDeform } from "./change/ChangeDeform";
import { ChangeDrawOrder } from "./change/ChangeDrawOrder";
import { ChangeRGBA } from "./change/ChangeRGBA";
import { ChangeSlot } from "./change/ChangeSlot";
import { IndexFormat } from "../../../../RenderEngine/RenderEnum/IndexFormat";
import { Mesh2D } from "../../../../resource/Mesh2D";
import { ESpineRenderType } from "../../../SpineSkeleton";
import { SpineMeshUtils } from "../utils/SpineMeshUtils";
import { SkeletonOptimise } from "../optimize/SkeletonOptimise";
import { IChange, IVBChange } from "../../IWebSpine";
import { SpineConst } from "../../../SpineConst";

export type FrameRenderData = {
    ib?: Uint16Array | Uint32Array | Uint8Array;
    vChanges?: IVBChange[];
    mulitRenderData?: MultiRenderData;
    type?: IndexFormat,
    size?: number;
}

export type FrameChanges = {
    iChanges?: IChange[],
    vChanges?: IVBChange[]
}

/**
 * @en Represents an animation renderer for spine animations.
 * @zh 表示骨骼动画的动画渲染器。
 */
export class AnimationRender {
    /**
     * @en Name of the animation.
     * @zh 动画的名称。
     */
    name: string;
    /**
     * @en Animation Corresponding Frame Change Queue.
     * @zh 动画对应帧变化队列。
     */
    changeMap: Map<number, FrameChanges>;
    /**
     * @en Whether it is a dynamic mesh.
     * @zh 是否为动态网格
     */
    isDynamic: boolean = false;
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
    isCache: boolean = false;

    /**
     * @en Indicates if the animation contains clipped attachments.
     * @zh 指示动画是否包含剪辑附件。
     */
    hasClip: boolean = false;

    /** @ignore */
    constructor() {
        this.changeMap = new Map();
        this.frames = [];
        this.skinDataArray = [];
        this.boneFrames = [];
        this.eventsFrames = [];
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
        let n = frames.length;
        for (let i = 1; i < n; i++)
            if (frames[i] > time)
                return i - 1;
        return n - 1;
    }

    /**
     * @en Checks and prepares the animation data.
     * @param animation The spine animation to check.
     * @param optimise The optimizer to use.
     * @zh 检查并准备动画数据。
     * @param animation 要检查的spine动画。
     * @param optimise 要使用的优化器。
     */
    check(animation: spine.Animation, optimise: SkeletonOptimise) {
        this.name = animation.name;

        let timeline = animation.timelines;
        let changeMap = this.changeMap;
        let renderFrames = this.frames;
        //this.mainIb = mainib;
        let hasClip: boolean = false;

        renderFrames.push(0);
        changeMap.set(0, {});

        let isDynamic = false;
        for (let i = 0, n = timeline.length; i < n; i++) {
            let time = timeline[i];
            let frames = time.frames;
            if (time instanceof spine.AttachmentTimeline) {
                let attachmentNames = time.attachmentNames;
                let slotIndex = time.slotIndex;
                // let ntl = new AttachmentTimeline();

                for (let j = 0, m = frames.length; j < m; j++) {
                    let frame = frames[j];
                    let change = new ChangeSlot();
                    change.slotId = slotIndex;
                    change.attachment = attachmentNames[j] || null;
                    let changeItem = changeMap.get(frame);
                    if (!changeItem) {
                        this.frames.indexOf(frame) == -1 && this.frames.push(frame);
                        changeItem = {
                            iChanges: []
                        };
                        changeMap.set(frame, changeItem);
                    }

                    let arr = changeItem.iChanges = changeItem.iChanges || [];
                    arr.push(change);
                }
                isDynamic = true;
            }
            else if (time instanceof spine.DrawOrderTimeline) {
                let orders = time.drawOrders;
                for (let j = 0, m = frames.length; j < m; j++) {
                    let frame = frames[j];
                    let change = new ChangeDrawOrder();
                    change.order = orders[j];
                    let changeItem = changeMap.get(frame);
                    if (!changeItem) {
                        this.frames.indexOf(frame) == -1 && this.frames.push(frame);
                        changeItem = {
                            iChanges: []
                        };
                        changeMap.set(frame, changeItem);
                    }

                    let arr = changeItem.iChanges = changeItem.iChanges || [];
                    arr.push(change);
                    isDynamic = true;
                }
                // spine.timline
            }
            //@ts-ignore
            else if (time instanceof (spine.ColorTimeline || spine.RGBATimeline) || (spine.TwoColorTimeline && time instanceof spine.TwoColorTimeline)) {
                let rgba = time as spine.RGBATimeline;
                let slotIndex = rgba.slotIndex;

                if (frames.length == 5 && frames[0] == 0 && frames[4] == 0) {//优化，当0帧 透明度0时。
                    let change = new ChangeSlot();
                    change.slotId = slotIndex;
                    change.attachment = null;
                    let frame = 0;
                    let changeItem = changeMap.get(frame);
                    if (!changeItem) {
                        this.frames.indexOf(frame) == -1 && this.frames.push(frame);
                        changeItem = {
                            iChanges: []
                        };
                        changeMap.set(frame, changeItem);
                    }

                    let arr = changeItem.iChanges = changeItem.iChanges || [];
                    arr.push(change);
                }
                else {

                    let changeRGBA = new ChangeRGBA(slotIndex);
                    let startFrame = frames[0];
                    let num = frames.length / 5 | 0;
                    let endFrame = frames[(num - 1) * 5];

                    changeRGBA.startFrame = startFrame;
                    changeRGBA.endFrame = endFrame;

                    let changeItem = changeMap.get(startFrame);
                    if (!changeItem) {
                        this.frames.indexOf(startFrame) == -1 && this.frames.push(startFrame);
                        changeItem = {
                            vChanges: []
                        };
                        changeMap.set(startFrame, changeItem);
                    }

                    this.frames.indexOf(endFrame) == -1 && this.frames.push(endFrame);

                    let arr = changeItem.vChanges = changeItem.vChanges || [];
                    arr.push(changeRGBA);
                    //this.vb = this.vb || mainvb.clone();
                    //changeRGBA.initChange(slotIndex, this.vb);
                    // this.changeVB.push(changeRGBA);
                }
                isDynamic = true;
            }
            else if (time instanceof window.spine.ClippingAttachment) {
                hasClip = true;
            }
            else if (time instanceof window.spine.EventTimeline) {
                if (optimise.canCache) {
                    let eventTime = time as spine.EventTimeline;
                    let events = eventTime.events;
                    for (let j = 0, m = frames.length; j < m; j++) {
                        let frame = frames[j];
                        let event = events[j];
                        let arr = this.eventsFrames[Math.round(frame / SpineConst.SPINE_STEP)] = this.eventsFrames[frame] || [];
                        arr.push(event);
                    }
                }
            }
            else if (time instanceof spine.DeformTimeline) {
                let slotIndex = time.slotIndex;
                let change = new ChangeDeform();
                change.slotId = slotIndex;
                let startFrame = frames[0];
                let endFrame = frames[frames.length - 1];
                change.startFrame = startFrame;
                change.endFrame = endFrame;

                let changeItem = changeMap.get(startFrame);
                if (!changeItem) {
                    this.frames.indexOf(startFrame) == -1 && this.frames.push(startFrame);
                    changeItem = {
                        vChanges: []
                    };
                    changeMap.set(startFrame, changeItem);
                }

                this.frames.indexOf(endFrame) == -1 && this.frames.push(endFrame);

                let arr = changeItem.vChanges = changeItem.vChanges || [];
                arr.push(change);
                isDynamic = true;

            }
            else {
                // console.warn("unknow timeline:",time);
            }
            // else if (time instanceof window.spine.AlphaTimeline) {
            //     debugger;
            // }
            // else if (time instanceof window.spine.RGBTimeline) {
            //     debugger;
            // }
        }

        this.isDynamic = isDynamic;
        renderFrames.sort();
        this.hasClip = hasClip;
       
        this.frameNumber = renderFrames.length;
    }

    /**
     * @en Creates skin animation render data.
     * @param mainVB The main vertex buffer creator.
     * @param mainIB The main index buffer creator.
     * @param tempIbCreate Temp index buffer creator.
     * @param slotAttachMap Map of slot attachments.
     * @param attachMap Array of attachment parses.
     * @param type Animtion Render Type.
     * @returns The created skin animation render data.
     * @zh 创建皮肤动画渲染数据。
     * @param mainVB 主顶点缓冲区创建器。
     * @param mainIB 主索引缓冲区创建器。
     * @param tempIbCreate 临时索引缓冲区创建器。
     * @param slotAttachMap 插槽附件映射。
     * @param attachMap 附件解析数组。
     * @param type 动画渲染类型。
     * @returns 创建的皮肤动画渲染数据。
     */
    createSkinData(
        mainVB: VBCreator, mainIB: IBCreator, tempIbCreate: IBCreator,
        slotAttachMap: Map<number, Map<string, AttachmentParse>>,
        attachMap: AttachmentParse[], type: ESpineRenderType
    ) {
        let skinData = new SkinAniRenderData();
        skinData.type = type;
        let frames = this.frames;
        skinData.init(this.changeMap, mainVB, mainIB, tempIbCreate, frames, slotAttachMap, attachMap, this.isDynamic);
        this.skinDataArray.push(skinData);
        return skinData;
    }

    destroy() {
        for (let i = 0, n = this.skinDataArray.length; i < n; i++)
            this.skinDataArray[i].destroy()
        this.skinDataArray.length = 0;
        this.frames.length = 0;
        this.changeMap.clear();
    }
}

/**
 * @en Represents skin animation render data for spine animations.
 * @zh 表示骨骼动画的皮肤动画渲染数据。
 * @blueprintIgnore
 */
export class SkinAniRenderData {

    /** 当前皮肤动画的最大顶点数 */
    maxVertexCount = 0;
    /** 当前皮肤动画的最大索引数 */
    maxIndexCount = 0;

    isDynamic: boolean = false;
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
     * @en Default Mesh
     * @zh 默认mesh 
     */
    _defaultMesh: Mesh2D;
    /** 
     * @en Default FrameData
     * @zh 默认帧数据
     */
    _defaultFrameData: FrameRenderData;

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
     * @en Animtion Render Type.
     * @zh 动画渲染类型。
     */
    type: ESpineRenderType;

    /**
     * @en Animation Frame Data. 
     * @zh 动画帧数据。
     */
    renderDatas: FrameRenderData[];

    /**
     * @en Indicates if normal rendering is required.
     * @zh 指示是否需要正常渲染。
     */
    isNormalRender: boolean;

    /** @ignore */
    constructor() {
        this.renderDatas = [];
    }

    getMesh() {
        return this._defaultMesh;
    }

    getFrameData(frameIndex: number) {
        return this.renderDatas[frameIndex] || this._defaultFrameData;
    }

    /**
     * @en Initializes the skin animation render data.
     * @param changeMap Map of frame changes.
     * @param mainVB Main vertex buffer creator.
     * @param ibCreator Main index buffer creator.
     * @param tempCreator Temp index buffer creator.
     * @param frames Array of frame numbers.
     * @param slotAttachMap Map of slot attachments.
     * @param attachMap Array of attachment parses.
     * @param isDynamic Whether it is a dynamic mesh.
     * @zh 初始化皮肤动画渲染数据。
     * @param changeMap 帧变化映射。
     * @param mainVB 主顶点缓冲区创建器。
     * @param ibCreator 主索引缓冲区创建器。
     * @param tempCreator 临时索引缓冲区创建器。
     * @param frames 帧号数组。
     * @param slotAttachMap 插槽附件映射。
     * @param attachMap 附件解析数组。
     * @param isDynamic 是否为动态网格
     */
    init(changeMap: Map<number, FrameChanges>,
        mainVB: VBCreator, ibCreator: IBCreator, tempCreator: IBCreator,
        frames: number[], slotAttachMap: Map<number, Map<string, AttachmentParse>>,
        attachMap: AttachmentParse[], isDynamic: boolean) {
        this.mainIB = ibCreator;
        this.isDynamic = isDynamic;
        this.canInstance = !this.isDynamic;

        if (isDynamic) {
            this.vb = mainVB.clone();

            let tAttachMap = attachMap.slice();

            let framesLength = frames.length;
            let order: number[];
            let lastData: FrameRenderData;

            for (let i = 0; i < framesLength; i++) {
                let frame = frames[i];
                let fcs = changeMap.get(frame);
                if (!fcs) {
                    this.renderDatas[i] = lastData;
                    continue;
                }

                let iChanges = fcs.iChanges;

                let data: FrameRenderData = {};
                if (iChanges) {
                    for (let j = 0, m = iChanges.length; j < m; j++) {
                        let ichange = iChanges[j];

                        if (!ichange.change(this.vb, slotAttachMap)) {
                            this.isNormalRender = true;
                        }

                        let newOrder = ichange.changeOrder(tAttachMap);
                        if (newOrder) {
                            order = newOrder;
                        }
                    }

                    //动画部分
                    tempCreator.createIB(tAttachMap, this.vb, order);
                    data.ib = tempCreator.ib.slice(0, tempCreator.ibLength);
                    data.mulitRenderData = tempCreator.outRenderData;
                    data.type = tempCreator.type;
                    data.size = tempCreator.size;
                }

                let vChanges = fcs.vChanges;
                if (vChanges) {
                    let myChangeVB = [];
                    for (let j = 0, m = vChanges.length; j < m; j++) {
                        let changeVBItem = vChanges[j].clone();

                        if (changeVBItem.initChange(this.vb)) {
                            changeVBItem.startFrame = i;
                            changeVBItem.endFrame = frames.indexOf(changeVBItem.endFrame);

                            myChangeVB.push(changeVBItem);
                        }
                    }
                    data.vChanges = myChangeVB;
                }

                this.renderDatas[i] = data;
                lastData = data;

                if (!frame) {
                    if (!data.ib) {
                        data.mulitRenderData = ibCreator.outRenderData;
                        data.ib = ibCreator.ib.slice(0, this.mainIB.ibLength);
                        data.type = ibCreator.type;
                        data.size = ibCreator.size;
                    }
                    this._defaultFrameData = data;
                }
            }

            this.maxIndexCount = Math.max(tempCreator.maxIndexCount, this.mainIB.maxIndexCount);

        } else {
            this.vb = mainVB;
            this._defaultMesh = SpineMeshUtils.createMesh(this.type, this.vb, ibCreator, this.isDynamic);
            this._defaultMesh.lock = true;
            this.maxIndexCount = ibCreator.maxIndexCount;
        }

        this.maxVertexCount = this.vb.maxVertexCount;

        if (!this._defaultFrameData) {
            this._defaultFrameData = {
                mulitRenderData: ibCreator.outRenderData,
                ib: ibCreator.ib.slice(0, this.mainIB.ibLength),
                type: ibCreator.type,
                size: ibCreator.size
            }
        }
    }

    /**
     * @en Destroy Render.
     * @zh 销毁当前Render。
     */
    destroy() {
        this._defaultMesh && this._defaultMesh.destroy();
        this._defaultMesh = null;
        this._defaultFrameData = null;
        this.renderDatas = null;
    }

}