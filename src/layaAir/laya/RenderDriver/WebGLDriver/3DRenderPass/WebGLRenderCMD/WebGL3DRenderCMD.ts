import { RenderClearFlag } from "../../../../RenderEngine/RenderEnum/RenderClearFlag";
import { SubShader } from "../../../../RenderEngine/RenderShader/SubShader";
import { Command } from "../../../../d3/core/render/command/Command";
import { Color } from "../../../../maths/Color";
import { Vector4 } from "../../../../maths/Vector4";
import { Viewport } from "../../../../maths/Viewport";
import { BlitQuadCMDData, DrawElementCMDData, DrawNodeCMDData, SetRenderTargetCMD, SetViewportCMD } from "../../../DriverDesign/3DRenderPass/IRender3DCMD";
import { RenderCMDType } from "../../../DriverDesign/RenderDevice/IRenderCMD";
import { InternalRenderTarget } from "../../../DriverDesign/RenderDevice/InternalRenderTarget";
import { InternalTexture } from "../../../DriverDesign/RenderDevice/InternalTexture";
import { WebBaseRenderNode } from "../../../RenderModuleData/WebModuleData/3D/WebBaseRenderNode";
import { WebGLShaderData } from "../../../RenderModuleData/WebModuleData/WebGLShaderData";
import { WebGLInternalRT } from "../../RenderDevice/WebGLInternalRT";
import { WebGLRenderContext3D } from "../WebGLRenderContext3D";
import { WebGLRenderElement3D } from "../WebGLRenderElement3D";

export class WebGLDrawNodeCMDData extends DrawNodeCMDData {
    
    type: RenderCMDType;

    protected _node: WebBaseRenderNode;
    
    protected _destShaderData: WebGLShaderData;
    
    protected _destSubShader: SubShader;
    
    protected _subMeshIndex: number;

    get node(): WebBaseRenderNode {
        return this._node;
    }

    set node(value: WebBaseRenderNode) {
        this._node = value;
    }

    get destShaderData(): WebGLShaderData {
        return this._destShaderData;
    }

    set destShaderData(value: WebGLShaderData) {
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

    apply(context: WebGLRenderContext3D): void {
        if (this.destShaderData && this.destSubShader) {
            this.node._renderUpdatePre(context);
            if (this.subMeshIndex == -1) {
                this.node.renderelements.forEach(element => {
                    let oriSubShader = element.subShader;
                    let oriMatShaderData = element.materialShaderData;
                    element.subShader = this._destSubShader;
                    element.materialShaderData = this._destShaderData;
                    context.drawRenderElementOne(element as WebGLRenderElement3D);
                    element.subShader = oriSubShader;
                    element.materialShaderData = oriMatShaderData;
                });
            }
            else {
                let element = this.node.renderelements[this.subMeshIndex];
                let oriSubShader = element.subShader;
                let oriMatShaderData = element.materialShaderData;
                element.subShader = this._destSubShader;
                element.materialShaderData = this._destShaderData;
                context.drawRenderElementOne(element as WebGLRenderElement3D);
                element.subShader = oriSubShader;
                element.materialShaderData = oriMatShaderData;
            }
        }
    }
}

export class WebGLBlitQuadCMDData extends BlitQuadCMDData {
    
    type: RenderCMDType;
    
    private _sourceTexelSize: Vector4;
    
    protected _dest: WebGLInternalRT;
    
    protected _viewport: Viewport;
    
    protected _source: InternalTexture;
    
    protected _scissor: Vector4;
    
    protected _offsetScale: Vector4;
    
    protected _element: WebGLRenderElement3D;

    get dest(): WebGLInternalRT {
        return this._dest;
    }

    set dest(value: WebGLInternalRT) {
        this._dest = value;
    }

    get viewport(): Viewport {
        return this._viewport;
    }

    set viewport(value: Viewport) {
        value.cloneTo(this._viewport);
    }

    get scissor(): Vector4 {
        return this._scissor;
    }

    set scissor(value: Vector4) {
        value.cloneTo(this._scissor);
    }

    get source(): InternalTexture {
        return this._source;
    }

    set source(value: InternalTexture) {
        this._source = value;
        if (this._source) {
            this._sourceTexelSize.setValue(1.0 / this._source.width, 1.0 / this._source.height, this._source.width, this._source.height);
        }
    }

    get offsetScale(): Vector4 {
        return this._offsetScale;
    }

    set offsetScale(value: Vector4) {
        value.cloneTo(this._offsetScale);
    }

    get element(): WebGLRenderElement3D {
        return this._element;
    }
    
    set element(value: WebGLRenderElement3D) {
        this._element = value;
    }

    constructor() {
        super();
        this.type = RenderCMDType.Blit;
        this._viewport = new Viewport();
        this._scissor = new Vector4();
        this._offsetScale = new Vector4();
        this._sourceTexelSize = new Vector4();
    }

    apply(context: WebGLRenderContext3D): void {
        this.element.materialShaderData._setInternalTexture(Command.SCREENTEXTURE_ID, this._source);
        this.element.materialShaderData.setVector(Command.SCREENTEXTUREOFFSETSCALE_ID, this._offsetScale);
        this.element.materialShaderData.setVector(Command.MAINTEXTURE_TEXELSIZE_ID, this._sourceTexelSize);
        context.setViewPort(this._viewport);
        context.setScissor(this._scissor);
        context.setRenderTarget(this.dest, RenderClearFlag.Nothing);
        context.drawRenderElementOne(this.element);
    }
}

export class WebGLDrawElementCMDData extends DrawElementCMDData {
    
    type: RenderCMDType;
    
    private _elemets: WebGLRenderElement3D[];
    
    constructor() {
        super();
        this.type = RenderCMDType.DrawElement;
    }

    setRenderelements(value: WebGLRenderElement3D[]): void {
        this._elemets = value;
    }

    apply(context: WebGLRenderContext3D): void {
        if (this._elemets.length == 1) {
            context.drawRenderElementOne(this._elemets[0]);
        } else {
            this._elemets.forEach(element => {
                context.drawRenderElementOne(element);
            });
        }
    }
}

export class WebGLSetViewportCMD extends SetViewportCMD {
    
    type: RenderCMDType;
    
    protected _viewport: Viewport;
    
    protected _scissor: Vector4;

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

    constructor() {
        super();
        this.type = RenderCMDType.ChangeViewPort;
        this.scissor = new Vector4();
        this.viewport = new Viewport();
    }

    apply(context: WebGLRenderContext3D): void {
        context.setViewPort(this.viewport);
        context.setScissor(this.scissor);
    }
}

const viewport = new Viewport();
const scissor = new Vector4();
export class WebGLSetRenderTargetCMD extends SetRenderTargetCMD {
    
    type: RenderCMDType;
    
    protected _rt: InternalRenderTarget;
    
    protected _clearFlag: number;
    
    protected _clearColorValue: Color;
    
    protected _clearDepthValue: number;
    
    protected _clearStencilValue: number;

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

    get clearColorValue(): Color {
        return this._clearColorValue;
    }

    set clearColorValue(value: Color) {
        value.cloneTo(this._clearColorValue);
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

    constructor() {
        super();
        this.type = RenderCMDType.ChangeRenderTarget;
        this._clearColorValue = new Color();
    }

    apply(context: WebGLRenderContext3D): void {
        context.setRenderTarget(this.rt, RenderClearFlag.Nothing);
        context.setClearData(this.clearFlag, this.clearColorValue, this.clearDepthValue, this.clearStencilValue);
        if (this.rt) {
            // todo
            viewport.set(0, 0, this.rt._textures[0].width, this.rt._textures[0].height);
            scissor.setValue(0, 0, this.rt._textures[0].width, this.rt._textures[0].height);
            context.setViewPort(viewport);
            context.setScissor(scissor);
        }

    }
}
