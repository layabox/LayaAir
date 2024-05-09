import { SubShader } from "../../../../RenderEngine/RenderShader/SubShader";
import { DrawNodeCMDData, RenderCMDType } from "../../../DriverDesign/3DRenderPass/IRendderCMD";
import { WebBaseRenderNode } from "../../../RenderModuleData/WebModuleData/3D/WebBaseRenderNode";
import { WebGPUShaderData } from "../../RenderDevice/WebGPUShaderData";
import { WebGPURenderContext3D } from "../WebGPURenderContext3D";
import { WebGPURenderElement3D } from "../WebGPURenderElement3D";

export class WebGPUDrawNodeCMDData extends DrawNodeCMDData {
    type: RenderCMDType;

    protected _node: WebBaseRenderNode;
    protected _destShaderData: WebGPUShaderData;
    protected _destSubShader: SubShader;
    protected _subMeshIndex: number;

    get node(): WebBaseRenderNode {
        return this._node;
    }
    set node(value: WebBaseRenderNode) {
        this._node = value;
    }

    get destShaderData(): WebGPUShaderData {
        return this._destShaderData;
    }
    set destShaderData(value: WebGPUShaderData) {
        this._destShaderData = value;
    }

    get destSubShader(): SubShader {
        return this._destSubShader;
    }
    set destSubShader(value: SubShader) {
        this._destSubShader = value;
    }

    get subMeshIndex(): number {
        return this._subMeshIndex;
    }
    set subMeshIndex(value: number) {
        this._subMeshIndex = value;
    }

    constructor() {
        super();
        this.type = RenderCMDType.DrawNode;
    }

    apply(context: WebGPURenderContext3D): void {
        this.node._renderUpdatePre(context);
        if (this.subMeshIndex == -1) {
            this.node.renderelements.forEach(element => {
                const oriSubShader = element.subShader;
                const oriMatShaderData = element.materialShaderData;
                element.subShader = this._destSubShader;
                element.materialShaderData = this._destShaderData;
                context.drawRenderElementOne(element as WebGPURenderElement3D);
                element.subShader = oriSubShader;
                element.materialShaderData = oriMatShaderData;
            });
        }
        else {
            const element = this.node.renderelements[this.subMeshIndex];
            const oriSubShader = element.subShader;
            const oriMatShaderData = element.materialShaderData;
            element.subShader = this._destSubShader;
            element.materialShaderData = this._destShaderData;
            context.drawRenderElementOne(element as WebGPURenderElement3D);
            element.subShader = oriSubShader;
            element.materialShaderData = oriMatShaderData;
        }
    }
}