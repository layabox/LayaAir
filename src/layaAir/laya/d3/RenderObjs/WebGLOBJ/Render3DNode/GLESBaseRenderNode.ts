import { SingletonList } from "../../../../utils/SingletonList";
import { IBaseRenderNode } from "../../../RenderDriverLayer/Render3DNode/IBaseRenderNode";
import { Transform3D } from "../../../core/Transform3D";
import { BoundFrustum } from "../../../math/BoundFrustum";
import { Bounds } from "../../../math/Bounds";
import { RenderElementOBJ } from "../../RenderObj/RenderElementOBJ";
import { GLESRenderContext3D } from "../GLESRenderContext3D";

export class GLESBaseRenderNode implements IBaseRenderNode {
    transform: Transform3D;
    _commonUniformMap: string[];
    distanceForSort: number;
    renderQueue: number[];
    sortingFudge: number;
    castShadow: boolean;
    enable: boolean;
    renderbitFlag: number;
    layer: number;
    bounds: Bounds;
    customCull: boolean;
    customCullResoult: boolean;
    staticMask: number;
    renderelements: RenderElementOBJ[];
    preUpdateRenderData() {
        //update Sprite ShaderData
        //update geometry data(TODO)
    }

    /**
     * @internal
     */
    _renderUpdatePre(context: GLESRenderContext3D): void {

    }

    _needRender(boundFrustum: BoundFrustum):boolean {
        return true;
    }

    shadowCullPass():boolean{
        return false;
    }
}