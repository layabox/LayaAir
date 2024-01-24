import { Sprite3D } from "../../../../d3/core/Sprite3D";
import { IRenderContext3D } from "../../../DriverDesign/3DRenderPass/I3DRenderPass";
import { IMeshRenderNode } from "../../Design/3D/I3DRenderModuleData";
import { WebBaseRenderNode } from "./WebBaseRenderNode";


export class WebMeshRenderNode extends WebBaseRenderNode implements IMeshRenderNode {
    constructor() {
        super();
        this.set_renderUpdatePreCall(this, this._renderUpdate);
    }

    /**
     * @inheritDoc
     * @override
     * @internal
     */
    _renderUpdate(context: IRenderContext3D): void {
        if (this.lightmapDirtyFlag) {
            (this.lightmapDirtyFlag == context.sceneModuleData?.lightmapDirtyFlag) && this._applyLightMapParams();
        }
        this._applyReflection();
        this._applyLightProb();
        let trans = this.transform;
        this.shaderData.setMatrix4x4(Sprite3D.WORLDMATRIX, trans.worldMatrix);
        this._worldParams.x = trans.getFrontFaceValue();
        this.shaderData.setVector(Sprite3D.WORLDINVERTFRONT, this._worldParams);
    }

}