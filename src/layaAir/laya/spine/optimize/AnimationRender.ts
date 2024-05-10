import { AttachmentParse } from "./AttachmentParse";
import { IBCreator } from "./IBCreator";
import { MultiRenderData } from "./MultiRenderData";
import { IBRenderData } from "./SketonOptimise";
import { VBCreator } from "./VBCreator";
import { ChangeDrawOrder } from "./change/ChangeDrawOrder";
import { ChangeRGBA } from "./change/ChangeRGBA";
import { ChangeSlot } from "./change/ChangeSlot";
import { IChange } from "./interface/IChange";
import { IVBChange } from "./interface/IVBChange";

export class AnimationRender {
    static tempIbCreate: IBCreator = new IBCreator();
    name: string;
    changeIB: Map<number, IChange[]>;
    changeVB: IVBChange[];
    frames: number[];
    frameNumber: number;
    skinDataArray: SkinAniRenderData[];
    constructor() {
        this.changeIB = new Map();
        this.frames = [];
        this.skinDataArray = [];
    }

    private checkChangeVB() {
        if (!this.changeVB) {
            this.changeVB = [];
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

    check(animation: spine.Animation) {
        this.name = animation.name;
        let timeline = animation.timelines;
        let tempMap = this.changeIB;
        let tempArray = this.frames;
        //this.mainIb = mainib;
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
            //@ts-ignore
            else if (time instanceof (spine.ColorTimeline || spine.RGBATimeline)) {
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
            // else if (time instanceof spine.AlphaTimeline) {
            //     debugger;
            // }
            // else if (time instanceof spine.RGBTimeline) {
            //     debugger;
            // }
        }
        tempArray.sort();
        this.frameNumber = tempArray.length;
    }

    createSkinData(mainVB: VBCreator, mainIB: IBCreator, slotAttachMap: Map<number, Map<string, AttachmentParse>>, attachMap: AttachmentParse[]) {
        let skinData = new SkinAniRenderData();
        let tempMap = this.changeIB;
        let tempArray = this.frames;
        skinData.init(tempMap, mainVB, mainIB, tempArray, slotAttachMap, attachMap, this.changeVB);
        this.skinDataArray.push(skinData);
        return skinData;
    }

}

export class SkinAniRenderData {
    name: string;
    ibs: IBRenderData[];
    mainibRender: IBRenderData;
    vb: VBCreator;
    mainIB: IBCreator;
    mutiRenderAble: boolean;
    isNormalRender: boolean;
    checkVBChange: (slots: spine.Slot[]) => boolean;
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

    init(tempMap: Map<number, IChange[]>, mainVB: VBCreator, mainIB: IBCreator, tempArray: number[], slotAttachMap: Map<number, Map<string, AttachmentParse>>, attachMap: AttachmentParse[], changeVB: IVBChange[]) {
        this.mainIB = mainIB;
        let mutiRenderAble = false;
        if (changeVB) {
            this.vb = mainVB.clone();
            this.checkVBChange = this.checkVBChangeS;
            let myChangeVB: IVBChange[] = this.changeVB = [];
            for (let i = 0, n = changeVB.length; i < n; i++) {
                let changeVBItem = changeVB[i].clone();
                if (changeVBItem.initChange(mainVB)) {
                    myChangeVB.push(changeVBItem);
                }
            }
        }
        if (tempArray.length == 0) {
            //没有修改IB的情况
            if(this.vb){
                this.vb.initBoneMat();
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