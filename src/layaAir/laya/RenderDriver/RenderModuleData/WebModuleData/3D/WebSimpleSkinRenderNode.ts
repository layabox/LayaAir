import { SimpleSkinnedMeshSprite3D } from "../../../../d3/core/SimpleSkinnedMeshSprite3D";
import { Sprite3D } from "../../../../d3/core/Sprite3D";
import { Vector4 } from "../../../../maths/Vector4";
import { IRenderContext3D } from "../../../DriverDesign/3DRenderPass/I3DRenderPass";
import { ISimpleSkinRenderNode } from "../../Design/3D/I3DRenderModuleData";
import { WebBaseRenderNode } from "./WebBaseRenderNode";

export class WebSimpleSkinRenderNode extends WebBaseRenderNode implements ISimpleSkinRenderNode{
    _simpleAnimatorParams: Vector4;

    constructor() {
        super();
        this.set_renderUpdatePreCall(this, this._renderUpdate);
        this._simpleAnimatorParams = new Vector4();
    }

    setSimpleAnimatorParams(value:Vector4){
        value.cloneTo(this._simpleAnimatorParams);  
        this.shaderData.setVector(SimpleSkinnedMeshSprite3D.SIMPLE_SIMPLEANIMATORPARAMS, this._simpleAnimatorParams);
    }

    _renderUpdate(context3D: IRenderContext3D): void {
        let shaderData = this.shaderData;
        //let 
        let worldMat = this.transform.worldMatrix;
        let worldParams = this._worldParams;
        worldParams.x = this.transform.getFrontFaceValue();
        shaderData.setMatrix4x4(Sprite3D.WORLDMATRIX, worldMat);
        shaderData.setVector(Sprite3D.WORLDINVERTFRONT, worldParams);
        this._applyLightProb();
        this._applyReflection();
        shaderData.setVector(SimpleSkinnedMeshSprite3D.SIMPLE_SIMPLEANIMATORPARAMS, this._simpleAnimatorParams);
    }
}