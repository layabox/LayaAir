import { IMeshRenderNode } from "../../../RenderDriverLayer/Render3DNode/IMeshRenderNode";
import { Sprite3D } from "../../../core/Sprite3D";
import { GLESRenderContext3D } from "../GLESRenderContext3D";
import { GLESBaseRenderNode } from "./GLESBaseRenderNode";

export class GLESMeshRenderNode extends GLESBaseRenderNode implements IMeshRenderNode {
    constructor() {
        super();
        this._calculateBoundingBox = this._ownerCalculateBoundingBox;
        //@ts-ignore
        this._renderUpdatePre = this._renderUpdate;
    }


    /**
     * @inheritDoc
     * @override
     * @internal
     */
    _renderUpdate(context: GLESRenderContext3D): void {
        (this.lightmapDirtyFlag == context.sceneModuleData?.lightmapDirtyFlag) && this._applyLightMapParams();
        this._applyReflection();
        this._applyLightProb();
        let trans = this.transform;
        this.shaderData.setMatrix4x4(Sprite3D.WORLDMATRIX, trans.worldMatrix);
        this._worldParams.x = trans.getFrontFaceValue();
        this.shaderData.setVector(Sprite3D.WORLDINVERTFRONT, this._worldParams);
    }

}