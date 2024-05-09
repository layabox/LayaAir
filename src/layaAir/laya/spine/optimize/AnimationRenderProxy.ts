import { AnimationRender, SkinAniRenderData } from "./AnimationRender";
import { VBCreator } from "./VBCreator";
import { IVBIBUpdate } from "./interface/IVBIBUpdate";

export class AnimationRenderProxy {
    currentTime: number;
    currentFrameIndex: number;
    animator: AnimationRender;
    //vb: VBCreator;
    currentSKin: SkinAniRenderData;

    constructor(animator: AnimationRender) {
        this.animator = animator;
        // this.vb = animator.vb;
        this.reset();
    }
    set skinIndex(value: number) {
        this.currentSKin = this.animator.skinDataArray[value];
    }

    get isNormalRender() {
        return this.currentSKin.isNormalRender;
    }

    get mutiRenderAble() {
        return this.currentSKin.mutiRenderAble;
    }

    reset() {
        this.currentTime = -1;
        this.currentFrameIndex = -2;
    }

    render(bones: spine.Bone[], slots: spine.Slot[], boneMat: Float32Array, updator: IVBIBUpdate, curTime: number) {
        //debugger;
        let beforeFrame = this.currentFrameIndex;
        let nowFrame = this.animator.getFrameIndex(curTime, beforeFrame);
        let currentSKin = this.currentSKin;
        let vb = currentSKin.vb;
        if (currentSKin.checkVBChange(slots)) {
            updator.updateVB(vb.vb, vb.vbLength);
        }
        if (nowFrame != beforeFrame) {
            //TODO
            let ib = currentSKin.getIB(nowFrame);
            updator.updateIB(ib.realIb, ib.realIb.length, ib.outRenderData);
            this.currentTime = curTime;
            this.currentFrameIndex = nowFrame;
        }
        vb.updateBone(bones, boneMat);
    }
}
