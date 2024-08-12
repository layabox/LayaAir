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
import { IVBChange } from "./interface/IVBChange";

export type FrameRenderData = {
    ib?: Uint16Array|Uint32Array|Uint8Array;
    vChanges?: IVBChange[];
    mulitRenderData: MultiRenderData;
}

export type FrameChanges = {
    iChanges?:IChange[],
    vChanges?:IVBChange[]
}
const step = 1 / 30;
export class AnimationRender {
    name: string;
    changeMap: Map<number,FrameChanges>;

    isDynamic:boolean = false;
    frames: number[];
    frameNumber: number;
    skinDataArray: SkinAniRenderData[];
    boneFrames: Float32Array[][];
    eventsFrames: spine.Event[][];
    isCache: boolean;

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

    constructor() {
        this.changeMap = new Map();
        this.frames = [];
        this.skinDataArray = [];
        this.boneFrames = [];
        this.eventsFrames = [];
    }

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

    check(animation: spine.Animation, preRender: IPreRender) {
        this.name = animation.name;

        let timeline = animation.timelines;
        let changeMap = this.changeMap;
        let renderFrames = this.frames;
        //this.mainIb = mainib;
        changeMap.clear();
        renderFrames.length = 0;
        let hasClip: boolean;
        for (let i = 0, n = timeline.length; i < n; i++) {
            let time = timeline[i];
            let frames = time.frames;
            if (time instanceof spine.AttachmentTimeline) {
                let attachmentNames = time.attachmentNames;
                let slotIndex = time.slotIndex;
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
            else if (time instanceof (spine.ColorTimeline || spine.RGBATimeline ) || time instanceof spine.TwoColorTimeline) {
                let rgba = time as spine.RGBATimeline;
                let slotIndex = rgba.slotIndex;
                if (frames.length == 5 && frames[0] == 0 && frames[4] == 0) {
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
                    let endFrame = frames[frames.length - 1];
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

export class SkinAniRenderData {
    isDynamic:boolean = false;
    name: string;
    canInstance: boolean;

    /** 默认mesh */
    _defaultMesh:Mesh2D;
    _defaultFrameData:FrameRenderData;

    vb: VBCreator;
    mainIB: IBCreator;
    type:ESpineRenderType;

    renderDatas:FrameRenderData[];

    isNormalRender: boolean;
    // checkVBChange: (slots: spine.Slot[]) => boolean;
    updateBoneMat: (delta: number, animation: AnimationRender, bones: spine.Bone[], state: spine.AnimationState, boneMat: Float32Array) => void;
    // changeVB: IVBChange[];

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

    updateBoneMatCache(delta: number, animation: AnimationRender, bones: spine.Bone[], state: spine.AnimationState, boneMat: Float32Array): void {
        this.vb.updateBoneCache(animation.boneFrames, delta / step, boneMat);
    }

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

    updateBoneMatByBone(delta: number, animation: AnimationRender, bones: spine.Bone[], state: spine.AnimationState, boneMat: Float32Array): void {
        this.vb.updateBone(bones, boneMat);
    }

    init(
        changeMap: Map<number, FrameChanges>, 
        mainVB: VBCreator , ibCreator: IBCreator , tempCreator:IBCreator, 
        frames: number[], slotAttachMap: Map<number, Map<string, AttachmentParse>>, 
        attachMap: AttachmentParse[], isDynamic:boolean) 
    {
        this.mainIB = ibCreator;
        this.isDynamic = isDynamic;
        this.canInstance = !this.isDynamic;

        this._defaultFrameData = {
            mulitRenderData : ibCreator.outRenderData,
            ib:ibCreator.ib.slice(0,this.mainIB.ibLength)
        }

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

                this.vb.createIB(tAttachMap, creator, order);
                let outRenderData = creator.outRenderData;
                let data:FrameRenderData = {
                    ib : creator.ib.slice(0,creator.ibLength),
                    mulitRenderData : outRenderData,
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
            }
          
        }else{
            this.vb = mainVB;
            this._defaultMesh = SpineMeshUtils.createMesh(this.type, this.vb , ibCreator , this.isDynamic);;
        }

    }

    destroy(){
        this._defaultMesh && this._defaultMesh.destroy();
        this._defaultMesh = null;
        this._defaultFrameData = null;
        this.renderDatas = null;
    }

}