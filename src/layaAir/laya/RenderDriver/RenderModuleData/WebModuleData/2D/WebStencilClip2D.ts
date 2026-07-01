import { LayaGL } from "../../../../layagl/LayaGL";
import { IRenderElement2D, WebGL2DStencilState } from "../../../DriverDesign/2DRenderPass/IRenderElement2D";
import { IClipInfo } from "../../Design/2D/IRenderStruct2D";
import { RenderState } from "../../Design/RenderState";
import { WebRenderStruct2D } from "./WebRenderStruct2D";

type StencilMaskElement2D = IRenderElement2D & {
    setClip(owner: WebRenderStruct2D, clipInfo: IClipInfo, ref: number, opZPass: number): void;
}

export class WebStencilClip2D {
    private _targetStack: IClipInfo[] = [];
    private _activeStack: IClipInfo[] = [];
    private _maskElements: StencilMaskElement2D[] = [];
    private _maskElementCount: number = 0;
    private _contentStates: WebGL2DStencilState[] = [];
    private _lastMaskOwner: WebRenderStruct2D = null;
    private _stencilOffState: WebGL2DStencilState = {
        enabled: false,
        test: RenderState.STENCILTEST_OFF,
        write: RenderState.Default.stencilWrite,
        ref: RenderState.Default.stencilRef,
        readMask: RenderState.Default.stencilReadMask,
        writeMask: RenderState.Default.stencilWriteMask,
        opFail: RenderState.Default.stencilOp.x,
        opZFail: RenderState.Default.stencilOp.y,
        opZPass: RenderState.Default.stencilOp.z
    };

    beginBuild(): void {
        this.reset();
    }

    reset(): void {
        this._activeStack.length = 0;
        this._maskElementCount = 0;
        this._lastMaskOwner = null;
    }

    appendElement(element: IRenderElement2D, addElement: (element: IRenderElement2D) => void): void {
        const owner = element.owner as WebRenderStruct2D;
        const clipInfo = owner && !owner.forceShaderClip ? owner.getClipInfo() : null;
        const depth = clipInfo && clipInfo.clipDepth > 0 ? this._buildClipStack(clipInfo) : 0;

        if (depth <= 0) {
            this._emitStackTransition(owner, 0, addElement);
            element.stencilClipState = this._stencilOffState;
            addElement(element);
            return;
        }

        this._emitStackTransition(owner, depth, addElement);
        element.stencilClipState = this._getContentState(depth);
        addElement(element);
    }

    finishBuild(addElement: (element: IRenderElement2D) => void): void {
        this._emitStackTransition(this._lastMaskOwner, 0, addElement);
    }

    private _emitStackTransition(owner: WebRenderStruct2D, targetDepth: number, addElement: (element: IRenderElement2D) => void): void {
        owner = owner || this._lastMaskOwner;
        let common = 0;
        const maxCommon = Math.min(this._activeStack.length, targetDepth);
        while (common < maxCommon && this._activeStack[common] === this._targetStack[common])
            common++;

        for (let i = this._activeStack.length - 1; i >= common; i--) {
            const maskElement = this._getMaskElement();
            maskElement.setClip(owner, this._activeStack[i], i + 1, RenderState.STENCILOP_DECR);
            addElement(maskElement);
        }

        for (let i = common; i < targetDepth; i++) {
            const maskElement = this._getMaskElement();
            maskElement.setClip(owner, this._targetStack[i], i, RenderState.STENCILOP_INCR);
            addElement(maskElement);
        }

        this._activeStack.length = targetDepth;
        for (let i = 0; i < targetDepth; i++)
            this._activeStack[i] = this._targetStack[i];
        if (owner)
            this._lastMaskOwner = owner;
    }

    private _buildClipStack(clipInfo: IClipInfo): number {
        const stack = this._targetStack;
        stack.length = 0;
        let info = clipInfo;
        while (info && info.clipDepth > 0) {
            stack.push(info);
            info = info.clipParent;
        }
        stack.reverse();
        return stack.length;
    }

    private _getMaskElement(): StencilMaskElement2D {
        const index = this._maskElementCount++;
        return this._maskElements[index] || (this._maskElements[index] = LayaGL.render2DRenderPassFactory.createStencilMaskElement2D() as StencilMaskElement2D);
    }

    private _getContentState(ref: number): WebGL2DStencilState {
        let state = this._contentStates[ref];
        if (state)
            return state;

        state = {
            enabled: true,
            test: RenderState.STENCILTEST_EQUAL,
            write: false,
            ref,
            readMask: 0xFF,
            writeMask: 0x00,
            opFail: RenderState.STENCILOP_KEEP,
            opZFail: RenderState.STENCILOP_KEEP,
            opZPass: RenderState.STENCILOP_KEEP
        };
        this._contentStates[ref] = state;
        return state;
    }

}
