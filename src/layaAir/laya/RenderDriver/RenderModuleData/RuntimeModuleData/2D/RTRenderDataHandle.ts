import { Color } from "../../../../maths/Color";
import { Matrix } from "../../../../maths/Matrix";
import { Vector4 } from "../../../../maths/Vector4";
import { BaseRenderNode2D } from "../../../../NodeRender2D/BaseRenderNode2D";
import { BaseTexture } from "../../../../resource/BaseTexture";
import { Texture2D } from "../../../../resource/Texture2D";
import { SpineShaderInit } from "../../../../spine/material/SpineShaderInit";
import { ShaderDefines2D } from "../../../../webgl/shader/d2/ShaderDefines2D";
import { IRenderContext2D } from "../../../DriverDesign/2DRenderPass/IRenderContext2D";
import { BufferModifyType, Graphics2DBufferBlock, I2DBaseRenderDataHandle, I2DGraphicBufferDataView, I2DPrimitiveDataHandle, IMesh2DRenderDataHandle, IRender2DDataHandle, ISpineRenderDataHandle } from "../../Design/2D/IRender2DDataHandle";
import { IRenderStruct2D } from "../../Design/2D/IRenderStruct2D";
import { GLESRenderContext2D } from "../../../OpenGLESDriver/2DRenderPass/GLESRenderContext2D";
import { RTRenderStruct2D } from "./RTRenderStruct2D";
import { WebRenderStruct2D } from "../../WebModuleData/2D/WebRenderStruct2D";

export abstract class RTRender2DDataHandle implements IRender2DDataHandle {
    _nativeObj: any;
    constructor(nativeObj: any) {
        this._nativeObj = nativeObj;
    }
    protected _owner: RTRenderStruct2D;
    public get owner(): RTRenderStruct2D {
        return this._owner;
    }
    public set owner(value: RTRenderStruct2D) {
        this._owner = value;
    }
    public get needUseMatrix(): boolean {
        return this._nativeObj.needUseMatrix;
    }
    public set needUseMatrix(value: boolean) {
       this._nativeObj.needUseMatrix = value;
    }
    destroy(): void {
        this._nativeObj.destroy();
    }

    inheriteRenderData(context: GLESRenderContext2D): void {
        this._nativeObj.inheriteRenderData(context._nativeObj);
    }
}
    export class RTPrimitiveDataHandle extends RTRender2DDataHandle implements I2DPrimitiveDataHandle {
        constructor() {
            super(new (window as any).conchRTPrimitiveDataHandle());
        }

        _mask: RTRenderStruct2D | null = null;
        get mask(): RTRenderStruct2D | null {
            return this._mask;
        }
        set mask(value: RTRenderStruct2D | null) {
            this._mask = value;
            this._nativeObj.setMask(value ? value._nativeObj : null);
        }   

        private _blocks: Graphics2DBufferBlock[] = [];
        
        applyVertexBufferBlock(blocks: Graphics2DBufferBlock[] ): void {
            this._blocks = blocks;
            this._nativeObj.applyVertexBufferBlock(blocks); 
        }
    
        inheriteRenderData(context: GLESRenderContext2D): void {
            this._nativeObj.inheriteRenderData(context._nativeObj);
        }
    }