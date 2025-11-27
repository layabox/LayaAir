import { Sprite3D } from "../../../../d3/core/Sprite3D";
import { Vector2 } from "../../../../maths/Vector2";
import { IRenderContext3D } from "../../../DriverDesign/3DRenderPass/I3DRenderPass";
import { IMeshRenderNode } from "../../Design/3D/I3DRenderModuleData";
import { WebBaseRenderNode } from "./WebBaseRenderNode"
var baseRenderNode: any = null;
export function WebMeshRenderNode() {//这么封装是为了避免此时WebBaseRenderNode.BaseRenderNodeClass还没有赋值
    if (!baseRenderNode)
        baseRenderNode = class extends WebBaseRenderNode.BaseRenderNodeClass implements IMeshRenderNode {
            private _cacheMoved: Vector2 = new Vector2(-1, -1);

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
                if (context.sceneModuleData.lightmapDirtyFlag != this.lightmapDirtyFlag) {
                    this._applyLightMapParams();
                    this.lightmapDirtyFlag = context.sceneModuleData.lightmapDirtyFlag;
                }
                this._applyReflection();
                this._applyLightProb();
                if (this.ismoved.x > this._cacheMoved.x || (this.ismoved.x == this._cacheMoved.x && this.ismoved.y > this._cacheMoved.y)) {
                    let trans = this.transform;
                    this.shaderData.setMatrix4x4(Sprite3D.WORLDMATRIX, trans.worldMatrix);
                    this._worldParams.x = trans.getFrontFaceValue();
                    this.shaderData.setVector(Sprite3D.WORLDINVERTFRONT, this._worldParams);
                    this.ismoved.cloneTo(this._cacheMoved);
                }
            }

        } as any;   //这是为了不让ts报错，否则返回类的函数里的类必须全部是public的
    return baseRenderNode;
}