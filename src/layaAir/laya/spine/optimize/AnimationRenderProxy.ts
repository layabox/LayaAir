import { AnimationRender, SkinAniRenderData } from "./AnimationRender";
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

    get name(){
        return this.animator.name;
    }

    reset() {
        this.currentTime = -1;
        this.currentFrameIndex = -2;
    }

    render(bones: spine.Bone[], slots: spine.Slot[], updator: IVBIBUpdate, curTime: number) {
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
            updator.updateIB(ib.realIb, ib.realIb.length, currentSKin.mutiRenderAble?ib.outRenderData:null);
            this.currentTime = curTime;
            this.currentFrameIndex = nowFrame;
        }
        vb.updateBone(bones);
        return vb.boneMat;
    }
}
