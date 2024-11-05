import { SubShader } from "../../../../RenderEngine/RenderShader/SubShader";
import { Color } from "../../../../maths/Color";
import { Vector4 } from "../../../../maths/Vector4";
import { Viewport } from "../../../../maths/Viewport";
import { BlitQuadCMDData, DrawElementCMDData, DrawNodeCMDData, SetRenderTargetCMD, SetViewportCMD } from "../../../DriverDesign/3DRenderPass/IRender3DCMD";
import { RenderCMDType } from "../../../DriverDesign/RenderDevice/IRenderCMD";
import { RTBaseRenderNode } from "../../../RenderModuleData/RuntimeModuleData/3D/RTBaseRenderNode";
import { RTSubShader } from "../../../RenderModuleData/RuntimeModuleData/RTSubShader";
import { GLESInternalRT } from "../../RenderDevice/GLESInternalRT";
import { GLESInternalTex } from "../../RenderDevice/GLESInternalTex";
import { GLESShaderData } from "../../RenderDevice/GLESShaderData";
import { GLESRenderElement3D } from "../GLESRenderElement3D";

export class GLESDrawNodeCMDData extends DrawNodeCMDData {

    type: RenderCMDType;

    protected _node: RTBaseRenderNode;

    protected _destShaderData: GLESShaderData;

    protected _destSubShader: SubShader;

    protected _subMeshIndex: number;

    /**@internal */
    _nativeObj: any;

    get node(): RTBaseRenderNode {
        return this._node;
    }

    set node(value: RTBaseRenderNode) {
        this._node = value;
        this._nativeObj.setBaseRenderNode(value._nativeObj);
    }

    get destShaderData(): GLESShaderData {
        return this._destShaderData;
    }

    set destShaderData(value: GLESShaderData) {
        this._destShaderData = value;
        this._nativeObj.setShaderData(value._nativeObj);
    }

    get destSubShader(): SubShader {
        return this._destSubShader;
    }

    set destSubShader(value: SubShader) {
        this._destSubShader = value;
        this._nativeObj.setSubShader((value.moduleData as any as RTSubShader)._nativeObj);
    }

    get subMeshIndex(): number {
        return this._subMeshIndex;
    }

    set subMeshIndex(value: number) {
        this._subMeshIndex = value;
        this._nativeObj.setSubMeshIndex(value);
    }

    constructor() {
        super();
        this.type = RenderCMDType.DrawNode;
        this._nativeObj = new (window as any).conchGLESDrawNodeCMDData();
    }
}

export class GLESBlitQuadCMDData extends BlitQuadCMDData {

    type: RenderCMDType;

    protected _dest: GLESInternalRT;

    protected _viewport: Viewport;

    protected _source: GLESInternalTex;

    protected _scissor: Vector4;

    protected _offsetScale: Vector4;

    protected _element: GLESRenderElement3D;

    /**@internal */
    _nativeObj: any;

    get dest(): GLESInternalRT {
        return this._dest;
    }

    set dest(value: GLESInternalRT) {
        this._dest = value;
        this._nativeObj.setDest(value ? value._nativeObj : null);
    }

    get viewport(): Viewport {
        return this._viewport;
    }

    set viewport(value: Viewport) {
        value.cloneTo(this._viewport);
        this._nativeObj.setViewport(value);
    }

    get scissor(): Vector4 {
        return this._scissor;
    }

    set scissor(value: Vector4) {
        value.cloneTo(this._scissor);
        this._nativeObj.setScissor(value);
    }

    get source(): GLESInternalTex {
        return this._source;
    }

    set source(value: GLESInternalTex) {
        this._source = value;
        this._nativeObj.setSource(value._nativeObj);
    }

    get offsetScale(): Vector4 {
        return this._offsetScale;
    }

    set offsetScale(value: Vector4) {
        value.cloneTo(this._offsetScale);
        this._nativeObj.setOffsetScale(this._offsetScale);
    }

    get element(): GLESRenderElement3D {
        return this._element;
    }
    set element(value: GLESRenderElement3D) {
        this._element = value;
        this._nativeObj.setRenderElement(value._nativeObj);
    }

    constructor() {
        super();
        this.type = RenderCMDType.Blit;
        this._viewport = new Viewport();
        this._scissor = new Vector4();
        this._offsetScale = new Vector4();
        this._nativeObj = new (window as any).conchGLESBlitQuadCMDData();
    }
}

export class GLESDrawElementCMDData extends DrawElementCMDData {

    type: RenderCMDType;

    /**@internal */
    _nativeObj;

    private _elemets: GLESRenderElement3D[];

    constructor() {
        super();
        this.type = RenderCMDType.DrawElement;
        this._nativeObj = new (window as any).conchGLESDrawElementCMDData();
    }

    setRenderelements(value: GLESRenderElement3D[]): void {
        this._elemets = value;
        this._nativeObj.clearElement();
        if (value.length == 1) {
            this._nativeObj.addOneElement(value[0]._nativeObj);
        } else {
            value.forEach(element => {
                this._nativeObj.addOneElement(element._nativeObj);
            });
        }
    }
}

export class GLESSetViewportCMD extends SetViewportCMD {

    type: RenderCMDType;

    /**@internal */
    _nativeObj: any;

    protected _viewport: Viewport;

    protected _scissor: Vector4;

    get viewport(): Viewport {
        return this._viewport;
    }

    set viewport(value: Viewport) {
        this._viewport = value;
        this._nativeObj.setViewport(value);
    }

    get scissor(): Vector4 {
        return this._scissor;
    }

    set scissor(value: Vector4) {
        this._scissor = value;
        this._nativeObj.setScissor(value);
    }

    constructor() {
        super();
        this.type = RenderCMDType.ChangeViewPort;
        this.scissor = new Vector4();
        this.viewport = new Viewport();
        this._nativeObj = new (window as any).conchGLESSetViewportCMD();
    }
}

export class GLESSetRenderTargetCMD extends SetRenderTargetCMD {

    type: RenderCMDType;

    /**@internal */
    _nativeObj: any;

    protected _rt: GLESInternalRT;

    protected _clearFlag: number;

    protected _clearColorValue: Color;

    protected _clearDepthValue: number;

    protected _clearStencilValue: number;

    get rt(): GLESInternalRT {
        return this._rt;
    }

    set rt(value: GLESInternalRT) {
        this._rt = value;
        this._nativeObj.setRT(value._nativeObj);
    }

    get clearFlag(): number {
        return this._clearFlag;
    }

    set clearFlag(value: number) {
        this._clearFlag = value;
        this._nativeObj.setClearFlag(value)
    }

    get clearColorValue(): Color {
        return this._clearColorValue;
    }

    set clearColorValue(value: Color) {
        value.cloneTo(this._clearColorValue);
        this._nativeObj.clearColorValue(value);
    }

    get clearDepthValue(): number {
        return this._clearDepthValue;
    }

    set clearDepthValue(value: number) {
        this._clearDepthValue = value;
        this._nativeObj.clearDepthValue(value);
    }

    get clearStencilValue(): number {
        return this._clearStencilValue;

    }

    set clearStencilValue(value: number) {
        this._clearStencilValue = value;
        this._nativeObj.clearStencilValue(value);
    }

    constructor() {
        super();
        this.type = RenderCMDType.ChangeRenderTarget;
        this._clearColorValue = new Color();
        this._nativeObj = new (window as any).conchGLESSetRenderTargetCMD();
    }
}
