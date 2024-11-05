import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { Viewport } from "../../../maths/Viewport";
import { IBaseRenderNode } from "../../RenderModuleData/Design/3D/I3DRenderModuleData";
import { IRenderCMD, RenderCMDType } from "../RenderDevice/IRenderCMD";
import { InternalRenderTarget } from "../RenderDevice/InternalRenderTarget";
import { InternalTexture } from "../RenderDevice/InternalTexture";
import { ShaderData } from "../RenderDevice/ShaderData";
import { IRenderContext3D, IRenderElement3D } from "./I3DRenderPass";

export interface IRender3DCMD extends IRenderCMD {
    apply(context: IRenderContext3D): void;
}


export class DrawNodeCMDData implements IRender3DCMD {
    /**
     * @en render cmd type
     * @zh 渲染指令类型
     */
    type: RenderCMDType;

    protected _node: IBaseRenderNode;

    protected _destShaderData: ShaderData;

    protected _destSubShader: SubShader;

    protected _subMeshIndex: number;

    /**
     * @en render node
     * @zh 渲染节点
     */
    get node(): IBaseRenderNode {
        return this._node;
    }

    set node(value: IBaseRenderNode) {
        this._node = value;
    }

    get destShaderData(): ShaderData {
        return this._destShaderData;
    }

    set destShaderData(value: ShaderData) {
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

    apply(context: IRenderContext3D): void {
        throw new Error("Method not implemented.");
    }
}

export class BlitQuadCMDData implements IRender3DCMD {
    /**
     * @en render cmd type
     * @zh 渲染指令类型
     */
    type: RenderCMDType;

    protected _dest: InternalRenderTarget;

    protected _viewport: Viewport;

    protected _scissor: Vector4;

    protected _source: InternalTexture;

    protected _offsetScale: Vector4;

    protected _element: IRenderElement3D;

    get element(): IRenderElement3D {
        return this._element;
    }

    set element(value: IRenderElement3D) {
        this._element = value;
    }

    get dest(): InternalRenderTarget {
        return this._dest;
    }

    set dest(value: InternalRenderTarget) {
        this._dest = value;
    }

    get viewport(): Viewport {
        return this._viewport;
    }

    set viewport(value: Viewport) {
        this._viewport = value;
    }

    get scissor(): Vector4 {
        return this._scissor;
    }

    set scissor(value: Vector4) {
        this._scissor = value;
    }

    get source(): InternalTexture {
        return this._source;
    }

    set source(value: InternalTexture) {
        this._source = value;
    }

    get offsetScale(): Vector4 {
        return this._offsetScale;
    }

    set offsetScale(value: Vector4) {
        this._offsetScale = value;
    }

    apply(context: IRenderContext3D): void {
        throw new Error("Method not implemented.");
    }
}

export class DrawElementCMDData implements IRender3DCMD {
    /**
     * @en render cmd type
     * @zh 渲染指令类型
     */
    type: RenderCMDType;

    setRenderelements(value: IRenderElement3D[]): void {
        throw new Error("Method not implemented.");
    }

    apply(context: IRenderContext3D): void {
        throw new Error("Method not implemented.");
    }
}

export class SetViewportCMD implements IRender3DCMD {
    /**
     * @en render cmd type
     * @zh 渲染指令类型
     */
    type: RenderCMDType;

    protected _viewport: Viewport;

    protected _scissor: Vector4;

    public get viewport(): Viewport {
        return this._viewport;
    }

    public set viewport(value: Viewport) {
        this._viewport = value;
    }

    public get scissor(): Vector4 {
        return this._scissor;
    }

    public set scissor(value: Vector4) {
        this._scissor = value;
    }

    apply(context: IRenderContext3D): void {
        throw new Error("Method not implemented.");
    }
}

export class SetRenderTargetCMD implements IRender3DCMD {
    /**
     * @en render cmd type
     * @zh 渲染指令类型
     */
    type: RenderCMDType;

    protected _rt: InternalRenderTarget;

    protected _clearFlag: number;

    protected _clearDepthValue: number;

    protected _clearStencilValue: number;

    protected _clearColorValue: Color;

    get rt(): InternalRenderTarget {
        return this._rt;
    }

    set rt(value: InternalRenderTarget) {
        this._rt = value;
    }

    get clearFlag(): number {
        return this._clearFlag;
    }

    set clearFlag(value: number) {
        this._clearFlag = value;
    }

    get clearDepthValue(): number {
        return this._clearDepthValue;
    }

    set clearDepthValue(value: number) {
        this._clearDepthValue = value;
    }

    get clearStencilValue(): number {
        return this._clearStencilValue;
    }

    set clearStencilValue(value: number) {
        this._clearStencilValue = value;
    }

    get clearColorValue(): Color {
        return this._clearColorValue;
    }

    set clearColorValue(value: Color) {
        this._clearColorValue = value;
    }

    apply(context: IRenderContext3D): void {
        throw new Error("Method not implemented.");
    }
}


