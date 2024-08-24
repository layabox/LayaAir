import { Spine2DRenderNode } from "../Spine2DRenderNode";
import { AnimationRender, SkinAniRenderData } from "./AnimationRender";
import { IVBIBUpdate } from "./interface/IVBIBUpdate";

export class AnimationRenderProxy {
    state: spine.AnimationState;
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

    get name() {
        return this.animator.name;
    }

    reset() {
        this.currentTime = -1;
        this.currentFrameIndex = -2;
    }

    renderWithOutMat(slots: spine.Slot[], updator: IVBIBUpdate, curTime: number) {
        let beforeFrame = this.currentFrameIndex;
        let nowFrame = this.animator.getFrameIndex(curTime, beforeFrame);
        let currentSKin = this.currentSKin;
        // let vb = currentSKin.vb;
        // let vb = currentSKin.;
        // if (currentSKin.checkVBChange(slots)) {
        //     updator.updateVB(vb.vb, vb.vbLength);
        // }
        updator.renderUpdate(currentSKin , nowFrame);
        
        this.currentTime = curTime;
        this.currentFrameIndex = nowFrame;

        // if (nowFrame != beforeFrame) {
        //     //TODO
        // }
    }

    render(bones: spine.Bone[], slots: spine.Slot[], updator: IVBIBUpdate, curTime: number, boneMat: Float32Array) {
        this.renderWithOutMat(slots, updator, curTime );
        this.currentSKin.updateBoneMat(curTime, this.animator, bones, this.state, boneMat);
    }
}
