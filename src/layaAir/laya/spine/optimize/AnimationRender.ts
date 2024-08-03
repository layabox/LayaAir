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
export class AnimationRender {
    static tempIbCreate: IBCreator = new IBCreator();
    name: string;
    changeIB: Map<number, IChange[]>;
    changeVB: IVBChange[];
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

export class SkinAniRenderData {
    name: string;
    canInstance: boolean;
    ibs: IBRenderData[];
    mainibRender: IBRenderData;
    vb: VBCreator;
    mainIB: IBCreator;
    mutiRenderAble: boolean;
    isNormalRender: boolean;
    checkVBChange: (slots: spine.Slot[]) => boolean;
    updateBoneMat: (delta: number, animation: AnimationRender, bones: spine.Bone[], state: spine.AnimationState, boneMat: Float32Array) => void;
    changeVB: IVBChange[];

    constructor() {
        this.ibs = [];
        this.checkVBChange = this.checkVBChangeEmpty;
    }


    checkVBChangeEmpty(slots: spine.Slot[]): boolean {
        return false;
    }

    checkVBChangeS(slots: spine.Slot[]): boolean {
        let result = false;
        for (let i = 0, n = this.changeVB.length; i < n; i++) {
            if (this.changeVB[i].updateVB(this.vb, slots)) {
                result = true;
            }
        }
        return result;
    }



    getIB(frameIndex: number) {
        //return this.mainIb.realIb;
        if (frameIndex == -1) {
            return this.mainibRender;
        }
        return this.ibs[frameIndex];
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