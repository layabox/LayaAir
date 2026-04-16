import { SimpleSkinnedMeshSprite3D } from "../../../d3/core/SimpleSkinnedMeshSprite3D";
import { Vector4 } from "../../../maths/Vector4";
import { IRenderContext3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { ISimpleSkinRenderNode } from "../../RenderModuleData/Design/3D/I3DRenderModuleData";
import { LayaXBaseRenderNode } from "./LayaXBaseRenderNode";

export class LayaXSimpleSkinRenderNode extends LayaXBaseRenderNode implements ISimpleSkinRenderNode {

    /** @internal */
    private _shareBuffer: Float32Array;
    /** @internal */
    private _simpleAnimatorParams: Vector4;

    /** @internal */
    protected _getNativeObj(): void {
        this._nativeObj = new (window as any).conchLayaXSimpleSkinRenderNode();
        let buffer = new ArrayBuffer(4 * 4);
        this._shareBuffer = new Float32Array(buffer);
        this._nativeObj.setShareBuffer(buffer);
    }

    constructor() {
        super();
        this._simpleAnimatorParams = new Vector4();
        this.set_renderUpdatePreCall(this, this._renderUpdate);
    }

    setSimpleAnimatorParams(value: Vector4): void {
        value.cloneTo(this._simpleAnimatorParams);
        this.shaderData.setVector(SimpleSkinnedMeshSprite3D.SIMPLE_SIMPLEANIMATORPARAMS, this._simpleAnimatorParams);
        this._shareBuffer[0] = value.x;
        this._shareBuffer[1] = value.y;
        this._shareBuffer[2] = value.z;
        this._shareBuffer[3] = value.w;
        this._nativeObj.setSimpleAnimatorParamsByBuffer();
    }

    _renderUpdate(context3D: IRenderContext3D): void {
        this.shaderData.setVector(SimpleSkinnedMeshSprite3D.SIMPLE_SIMPLEANIMATORPARAMS, this._simpleAnimatorParams);
    }
}
