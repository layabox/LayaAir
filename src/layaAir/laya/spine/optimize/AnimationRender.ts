import { AttachmentParse } from "./AttachmentParse";
import { IBCreator } from "./IBCreator";
import { MultiRenderData } from "./MultiRenderData";
import { VBCreator } from "./VBCreator";
import { ChangeDrawOrder } from "./change/ChangeDrawOrder";
import { ChangeSlot } from "./change/ChangeSlot";
import { IChange } from "./interface/IChange";
import { IVBChange } from "./interface/IVBChange";

export class AnimationRender {
    static EMPTY: IVBChange[];
    static tempIbCreate: IBCreator = new IBCreator();
    name: string;
    ibs: [Uint16Array, MultiRenderData][];
    mainibRender: [Uint16Array, MultiRenderData];
    vb: VBCreator;
    mainIb: IBCreator;
    changeIB: Map<number, IChange[]>;
    changeVB: IVBChange[];
    frames: number[];
    frameNumber: number;

    checkVBChange: (slots: spine.Slot[]) => boolean;
    constructor() {
        this.changeIB = new Map();
        this.frames = [];
        this.ibs = [];
        this.changeVB = AnimationRender.EMPTY;
        this.checkVBChange = this.checkVBChangeEmpty;
    }

    private checkChangeVB() {
        if (this.changeVB == AnimationRender.EMPTY) {
            this.changeVB = [];
            this.checkVBChange = this.checkVBChangeS;
        }
    }

    getFrameIndex(time: number, frameIndex: number) {
        let frames = this.frames;
        let lastFrame = this.frameNumber - 1;
        if (frameIndex < 0) {
            frameIndex = 0;
        }
        else if (frameIndex == lastFrame && time < frames[lastFrame]) {
            frameIndex = 0;
        }
        for (let i = frameIndex; i < this.frameNumber; i++) {
            if (time < frames[i]) {
                frameIndex = i - 1;
                break;
            }
            if (i == lastFrame) {
                frameIndex = i;
            }
        }
        return frameIndex;
    }

    checkVBChangeEmpty(slots: spine.Slot[]): boolean {
        return false;
    }

    checkVBChangeS(slots: spine.Slot[]): boolean {
        for (let i = 0, n = this.changeVB.length; i < n; i++) {
            this.changeVB[i].updateVB(this.vb, slots);
        }
        return true;
    }

    getIB(frameIndex: number) {
        //return this.mainIb.realIb;
        if (frameIndex == -1) {
            return this.mainibRender;
        }
        return this.ibs[frameIndex];
    }

    check(animation: spine.Animation, mainvb: VBCreator, mainib: IBCreator, slotAttachMap: Map<number, Map<string, AttachmentParse>>, attachMap: AttachmentParse[]) {
        this.name = animation.name;
        let timeline = animation.timelines;
        let tempMap = this.changeIB;
        let tempArray = this.frames;
        this.mainIb = mainib;
        tempMap.clear();
        tempArray.length = 0;
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
            // else if (time instanceof spine.RGBATimeline) {
            //     this.checkChangeVB();
            //     let rgba = time as spine.RGBATimeline;
            //     let changeRGBA = new ChangeRGBA();
            //     this.vb = this.vb || mainvb.clone();
            //     changeRGBA.initChange(rgba.slotIndex, this.vb);
            //     this.changeVB.push(changeRGBA);
            //     // debugger;
            // }
            // else if (time instanceof spine.AlphaTimeline) {
            //     debugger;
            // }
            // else if (time instanceof spine.RGBTimeline) {
            //     debugger;
            // }
        }
        tempArray.sort();
        if (tempArray.length == 0) {
            //没有修改IB的情况
            this.vb = mainvb;
            this.ibs.push([this.mainIb.realIb, this.mainIb.outRenderData]);
            //this.mainIb = mainib;
        }
        else {
            this.vb = this.vb || mainvb.clone();
            let n = tempArray.length;
            for (let i = 0, n = tempArray.length; i < n; i++) {
                let frame = tempArray[i];
                let arr = tempMap.get(frame);
                for (let j = 0, m = arr.length; j < m; j++) {
                    arr[j].change(this.vb, slotAttachMap);
                }
            }
            if (n == 1 && tempArray[0] == 0) {
                //只有一帧
                //this.vb=mainvb.clone();
            }
            //debugger;
        }
        this.frameNumber = tempArray.length;

        let tAttachMap = attachMap.slice();
        let order;
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
            this.ibs[j] = [ibnew, ib.outRenderData];
        }
    }
}
