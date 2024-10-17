import { BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { LayaGL } from "../../layagl/LayaGL";
import { Material } from "../../resource/Material";
import { Mesh2D } from "../../resource/Mesh2D";
import { ESpineRenderType } from "../SpineSkeleton";
import { SpineMeshBase } from "../mesh/SpineMeshBase";
import { SpineMeshUtils } from "../mesh/SpineMeshUtils";
import { AttachmentParse } from "./AttachmentParse";
import { IBCreator } from "./IBCreator";
import { MultiRenderData } from "./MultiRenderData";
import { VBCreator } from "./VBCreator";
import { ChangeDeform } from "./change/ChangeDeform";
import { ChangeDrawOrder } from "./change/ChangeDrawOrder";
import { ChangeRGBA } from "./change/ChangeRGBA";
import { ChangeSlot } from "./change/ChangeSlot";
import { IChange } from "./interface/IChange";
import { IPreRender } from "./interface/IPreRender";
import { ITimeline } from "./interface/ITimeLine";
import { IVBChange } from "./interface/IVBChange";
import { AttachmentTimeline } from "./timelines/AttachmentTimeline";

export type FrameRenderData = {
    ib?: Uint16Array|Uint32Array|Uint8Array;
    vChanges?: IVBChange[];
    mulitRenderData: MultiRenderData;
    type?:IndexFormat,
    size?:number;
}

export type FrameChanges = {
    iChanges?:IChange[],
    vChanges?:IVBChange[]
}
const step = 1 / 30;
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
    changeMap: Map<number,FrameChanges>;
    /**
     * @en Whether it is a dynamic mesh.
     * @zh 是否为动态网格
     */
    isDynamic:boolean = false;
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

    timelines:ITimeline[] = [];

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
        // let lastFrame = this.frameNumber - 1;
        // if (frameIndex < -1) {
        //     frameIndex = 0;
        // }
        // else if (frameIndex == lastFrame) {
        //     if (time < frames[lastFrame]) {
        //         frameIndex = 0;
        //     }
        // }
        // else if (time >= frames[frameIndex + 1]) {
        //     frameIndex++;
        // }
        // else if (time < frames[frameIndex]) {
        //     frameIndex = 0;
        // }
        // return frameIndex;
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
        let changeMap = this.changeMap;
        let renderFrames = this.frames;
        //this.mainIb = mainib;
        changeMap.clear();
        renderFrames.length = 0;
        let hasClip: boolean;

        let lTimelines = this.timelines;

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
                            iChanges:[]
                        };
                        changeMap.set(frame, changeItem);
                    }
                    
                    let arr = changeItem.iChanges = changeItem.iChanges||[];
                    arr.push(change);
                }
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
                            iChanges:[]
                        };
                        changeMap.set(frame, changeItem);
                    }

                    let arr = changeItem.iChanges = changeItem.iChanges||[];
                    arr.push(change);
                }
                // spine.timline
            }
            //@ts-ignore
            else if (time instanceof (spine.ColorTimeline || spine.RGBATimeline ) || (spine.TwoColorTimeline && time instanceof spine.TwoColorTimeline)) {
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
                            iChanges:[]
                        };
                        changeMap.set(frame, changeItem);
                    }

                    let arr = changeItem.iChanges = changeItem.iChanges||[];
                    arr.push(change);
                }
                else {

                    let changeRGBA = new ChangeRGBA(slotIndex);
                    let startFrame = frames[0];
                    let num = frames.length / 5 | 0;
                    let endFrame = frames[(num - 1 ) * 5];

                    changeRGBA.startFrame = startFrame;
                    changeRGBA.endFrame = endFrame;

                    let changeItem = changeMap.get(startFrame);
                    if (!changeItem) {
                        this.frames.indexOf(startFrame) == -1 && this.frames.push(startFrame);
                        changeItem = {
                            vChanges:[]
                        };
                        changeMap.set(startFrame, changeItem);
                    }
                    
                    this.frames.indexOf(endFrame) == -1 && this.frames.push(endFrame);
                    
                    let arr = changeItem.vChanges = changeItem.vChanges||[];
                    arr.push(changeRGBA);
                    //this.vb = this.vb || mainvb.clone();
                    //changeRGBA.initChange(slotIndex, this.vb);
                    // this.changeVB.push(changeRGBA);
                }
            }
            else if (time instanceof window.spine.ClippingAttachment) {
                hasClip = true;
            }
            else if (time instanceof window.spine.EventTimeline) {
                if (preRender.canCache) {
                    let eventTime = time as spine.EventTimeline;
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
                        vChanges:[]
                    };
                    changeMap.set(startFrame, changeItem);
                }
                
                this.frames.indexOf(endFrame) == -1 && this.frames.push(endFrame);

                let arr = changeItem.vChanges = changeItem.vChanges||[];
                arr.push(change);
              
            }
            else{
                // console.warn("unknow timeline:",time);
            }
            // else if (time instanceof window.spine.AlphaTimeline) {
            //     debugger;
            // }
            // else if (time instanceof window.spine.RGBTimeline) {
            //     debugger;
            // }
        }

        this.isDynamic = !!changeMap.size;
        renderFrames.sort();

        if (!hasClip) {
            if (preRender.canCache) {
                this.cacheBones(preRender);
                this.isCache = true;
            }
        }
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
        mainVB: VBCreator, mainIB: IBCreator, tempIbCreate:IBCreator,
        slotAttachMap: Map<number, Map<string, AttachmentParse>>, 
        attachMap: AttachmentParse[] , type:ESpineRenderType
    ) {
        let skinData = new SkinAniRenderData();
        skinData.type = type;
        let frames = this.frames;
        skinData.init(this.changeMap, mainVB, mainIB , tempIbCreate, frames, slotAttachMap, attachMap, this.isDynamic);
        skinData.updateBoneMat = this.isCache ? (this.eventsFrames.length == 0 ? skinData.updateBoneMatCache : skinData.updateBoneMatCacheEvent) : skinData.updateBoneMatByBone;
        this.skinDataArray.push(skinData);
        return skinData;
    }

    destroy(){
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
 */
export class SkinAniRenderData {

    /** 当前皮肤动画的最大顶点数 */
    maxVertexCount = 0;
    /** 当前皮肤动画的最大索引数 */
    maxIndexCount = 0;

 	isDynamic:boolean = false;
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
    _defaultMesh:Mesh2D;
    /** 
     * @en Default FrameData
     * @zh 默认帧数据
     */
    _defaultFrameData:FrameRenderData;

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
    type:ESpineRenderType;

    /**
     * @en Animation Frame Data. 
     * @zh 动画帧数据。
     */
    renderDatas:FrameRenderData[];

    /**
     * @en Indicates if normal rendering is required.
     * @zh 指示是否需要正常渲染。
     */
    isNormalRender: boolean;
    // checkVBChange: (slots: spine.Slot[]) => boolean;
    /**
     * @en Function to update bone matrices.
     * @zh 更新骨骼矩阵的函数。
     */
    updateBoneMat: (delta: number, animation: AnimationRender, bones: spine.Bone[], state: spine.AnimationState, boneMat: Float32Array) => void;
    // changeVB: IVBChange[];

    /** @ignore */
    constructor() {
        // this.ibs = [];
        this.renderDatas = [];
        // this.materials = [];
        // this.checkVBChange = this.checkVBChangeEmpty;
    }

   
    getMesh(){
        return this._defaultMesh;
    }

    getFrameData(frameIndex: number) {
        return this.renderDatas[frameIndex] || this._defaultFrameData;
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
     * @param changeMap Map of frame changes.
     * @param mainVB Main vertex buffer creator.
     * @param ibCreator Main index buffer creator.
     * @param tempCreator Temp index buffer creator.
     * @param frames Array of frame numbers.
     * @param slotAttachMap Map of slot attachments.
     * @param attachMap Array of attachment parses.
     * @param changeVB Array of vertex buffer changes.
     * @param isDynamic Whether it is a dynamic mesh.
     * @zh 初始化皮肤动画渲染数据。
     * @param changeMap 帧变化映射。
     * @param mainVB 主顶点缓冲区创建器。
     * @param ibCreator 主索引缓冲区创建器。
     * @param tempCreator 临时索引缓冲区创建器。
     * @param frames 帧号数组。
     * @param slotAttachMap 插槽附件映射。
     * @param attachMap 附件解析数组。
     * @param changeVB 顶点缓冲区变化数组。
     * @param isDynamic 是否为动态网格
     */    
    init(
        changeMap: Map<number, FrameChanges>, 
        mainVB: VBCreator , ibCreator: IBCreator , tempCreator:IBCreator, 
        frames: number[], slotAttachMap: Map<number, Map<string, AttachmentParse>>, 
        attachMap: AttachmentParse[], isDynamic:boolean) 
    {
        this.mainIB = ibCreator;
        this.isDynamic = isDynamic;
        this.canInstance = !this.isDynamic;

        if (isDynamic) {
            this.vb = mainVB.clone();
            this.vb.initBoneMat();

            let creator = tempCreator;
            let tAttachMap = attachMap.slice();

            let framesLength = frames.length;
            for (let i = 0  ; i < framesLength; i++) {
                let frame = frames[i];
                let fcs = changeMap.get(frame);
                if (!fcs) continue;
                let order:number[];
                let iChanges = fcs.iChanges;
                
                if (iChanges){
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
                }
                //动画部分
                creator.createIB(tAttachMap, this.vb, order);

                let outRenderData = creator.outRenderData;
                let data:FrameRenderData = {
                    ib : creator.ib.slice(0,creator.ibLength),
                    mulitRenderData : outRenderData,
                    type:creator.type,
                    size:creator.size,
                }
                let vChanges = fcs.vChanges;
                if (vChanges) {
                    let myChangeVB = [];
                    for (let j = 0 , m = vChanges.length; j < m; j++) {
                        let changeVBItem = vChanges[j].clone();

                        if (changeVBItem.initChange(this.vb)) {
                            changeVBItem.startFrame = i;
                            changeVBItem.endFrame = frames.indexOf(changeVBItem.endFrame);

                            myChangeVB.push(changeVBItem);
                        }
                    }
                    data.vChanges = myChangeVB;
                }

                this.renderDatas.push(data);

                if (!frame) {
                    this._defaultFrameData = data;
                }
            }

            this.maxIndexCount = creator.maxIndexCount;
            
        }else{
            this.vb = mainVB;
            this._defaultMesh = SpineMeshUtils.createMesh(this.type, this.vb , ibCreator , this.isDynamic);;
            this.maxIndexCount = ibCreator.maxIndexCount;
        }

        this.maxVertexCount = this.vb.maxVertexCount;

        if (!this._defaultFrameData) {
            this._defaultFrameData = {
                mulitRenderData : ibCreator.outRenderData,
                ib:ibCreator.ib.slice(0,this.mainIB.ibLength),
                type:ibCreator.type,
                size:ibCreator.size
            }
        }
    }

    /**
     * @en Destroy Render.
     * @zh 销毁当前Render。
     */
    destroy(){
        this._defaultMesh && this._defaultMesh.destroy();
        this._defaultMesh = null;
        this._defaultFrameData = null;
        this.renderDatas = null;
    }

}