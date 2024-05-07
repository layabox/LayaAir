import { AnimationRender } from "./AnimationRender";
import { VBCreator } from "./VBCreator";
import { IVBIBUpdate } from "./interface/IVBIBUpdate";

export class AnimationRenderProxy {
    currentTime: number;
    currentFrameIndex: number;
    animator: AnimationRender;
    vb: VBCreator;

    constructor(animator: AnimationRender) {
        this.animator = animator;
        this.vb = animator.vb;
        this.reset();
    }

    reset() {
        this.currentTime = -1;
        this.currentFrameIndex = -2;
    }


    needDraw(slots: spine.Slot[], updator: IVBIBUpdate, curTime: number) {
        let beforeFrame = this.currentFrameIndex;
        let nowFrame = this.animator.getFrameIndex(curTime, beforeFrame);
        if (this.animator.checkVBChange(slots)) {
            updator.updateVB(this.vb.vb, this.vb.vbLength);
        }
        if (nowFrame != beforeFrame) {
            //TODO
            let ib = this.animator.getIB(nowFrame);
            updator.updateIB(ib[0], ib[0].length, ib[1]);
            this.currentTime = curTime;
            this.currentFrameIndex = nowFrame;
        }
    }

    render(bones: spine.Bone[], slots: spine.Slot[], boneMat: Float32Array, updator: IVBIBUpdate, curTime: number) {
        //debugger;
        this.needDraw(slots, updator, curTime);
        let vb = this.vb;
        vb.updateBone(bones, boneMat);
    }
}
