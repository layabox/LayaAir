import { IRenderContext2D } from "../../../DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderStruct2D } from "../../Design/2D/IRenderStruct2D";
import { Rectangle } from "../../../../maths/Rectangle";
import { Matrix } from "../../../../maths/Matrix";
import { Vector4 } from "../../../../maths/Vector4";
import { BlendMode } from "../../../../webgl/canvas/BlendMode";
import { I2DGlobalRenderData, IRender2DDataHandle } from "../../Design/2D/IRender2DDataHandle";
import { GLESShaderData } from "../../../OpenGLESDriver/RenderDevice/GLESShaderData";
import { RTRender2DPass } from "./RTRender2DPass";
import { GLESRenderElement2D } from "../../../OpenGLESDriver/2DRenderPass/GLESRenderElement2D";
import { IRenderElement2D } from "../../../DriverDesign/2DRenderPass/IRenderElement2D";
import { RTRender2DDataHandle } from "./RTRenderDataHandle";
import { GLESRenderContext2D } from "../../../OpenGLESDriver/2DRenderPass/GLESRenderContext2D";
import { Stat } from "../../../../utils/Stat";


export class RTGlobalRenderData implements I2DGlobalRenderData {
   _nativeObj: any;
   constructor() {
      this._nativeObj = new (window as any).conchRTGlobalRenderData();
   }

   private _cullRect: Vector4;
   get cullRect(): Vector4 {
      return this._cullRect;
   }
   set cullRect(value: Vector4) {
      this._cullRect = value;
      this._nativeObj.setCullRect(value);
   }
   get renderLayerMask(): number {
      return this._nativeObj.renderLayerMask;
   }
   set renderLayerMask(value: number) {
      this._nativeObj.renderLayerMask = value;
   }  
   private _globalShaderData: GLESShaderData;    
   get globalShaderData(): GLESShaderData {
      return this._globalShaderData;
   }
   set globalShaderData(value: GLESShaderData) {
      this._globalShaderData = value;
      this._nativeObj.setGlobalShaderData(value ? value._nativeObj : null);
   }
}

export class RTRenderStruct2D implements IRenderStruct2D {

   _nativeObj: any;
  
   set zIndex(value: number) {
		this._nativeObj.zIndex = value;
	}
	get zIndex(): number {
		return this._nativeObj.zIndex;
	}
   private _rect: Rectangle = new Rectangle(0, 0, 0, 0);
   set rect(value: Rectangle) {
		this._nativeObj.rect = value;
	}
	get rect(): Rectangle {
		let rect = this._nativeObj.rect;
		this._rect.x = rect.x;
		this._rect.y = rect.y;
		this._rect.width = rect.width;
		this._rect.height = rect.height;
		return this._rect;
	}
   set renderLayer(value: number) {
		this._nativeObj.renderLayer = value;
	}
	get renderLayer(): number {
		return this._nativeObj.renderLayer;
	}
   
   private _parent: IRenderStruct2D;
   set parent(value: IRenderStruct2D) {
      this._parent = value;
		this._nativeObj.setParent(value ? (value as unknown as RTRenderStruct2D)._nativeObj : null);
	}
	get parent(): IRenderStruct2D | null {
		return this._parent;
	}
   private _children: IRenderStruct2D[] = [];
   public get children(): IRenderStruct2D[] {
       return this._children;
   }
   public set children(value: IRenderStruct2D[]) {
       this._children = value;
       let nativeArray = [];
       for (var i = 0; i < nativeArray.length; i++) {
           nativeArray.push((value[i] as unknown as RTRenderStruct2D)._nativeObj);
       }
       this._nativeObj.setChildren(nativeArray);
   }
   set renderType(value: number) {
		this._nativeObj.renderType = value;
	}
	get renderType(): number {
		return this._nativeObj.renderType;
	}

   set renderUpdateMask(value: number) {
		this._nativeObj.renderUpdateMask = value;
	}
	get renderUpdateMask(): number {
		return this._nativeObj.renderUpdateMask;
	}
   private _renderMatrix: Matrix = new Matrix();
   set renderMatrix(value: Matrix) {
		this._nativeObj.setRenderMatrix(value , Stat.loopCount);
	}
	get renderMatrix(): Matrix {
		let matrix = this._nativeObj.getRenderMatrix();
		this._renderMatrix.a = matrix.a;
		this._renderMatrix.b = matrix.b;
		this._renderMatrix.c = matrix.c;
		this._renderMatrix.d = matrix.d;
		this._renderMatrix.tx = matrix.tx;
		this._renderMatrix.ty = matrix.ty;
		return this._renderMatrix;
	}
   set globalAlpha(value: number) {
		this._nativeObj.globalAlpha = value;
	}
	get globalAlpha(): number {
		return this._nativeObj.globalAlpha;
	}

   public get alpha(): number {
      return this._nativeObj.alpha;
   }

   public set alpha(value: number) {
      this._nativeObj.alpha = value;
   }

   public get blendMode(): BlendMode {
      return this._nativeObj.blendMode;
   }

   public set blendMode(value: BlendMode) {
      this._nativeObj.blendMode = value;
   }

   public get enable(): boolean {
      return this._nativeObj.enable;
   }

   public set enable(value: boolean) {
      this._nativeObj.enable = value;
   }

   public get isRenderStruct(): boolean {
      return this._nativeObj.isRenderStruct;
   }  
   public set isRenderStruct(value: boolean) {
      this._nativeObj.isRenderStruct = value;
   }

   private _renderElements: IRenderElement2D[] = [];
   set renderElements(value: IRenderElement2D[]) {
      this._renderElements = value;
      let nativeArray = [];
      for (let i = 0; i < value.length; i++) {
         nativeArray.push((value[i] as unknown as GLESRenderElement2D)._nativeObj);
      }
      this._nativeObj.setRenderElements(nativeArray);
   }
   get renderElements(): IRenderElement2D[] {   
      return this._renderElements;
   }

   private _spriteShaderData: GLESShaderData = null;
   set spriteShaderData(value: GLESShaderData) {
      this._spriteShaderData = value;
      this._nativeObj.setSpriteShaderData(value ? value._nativeObj : null);
   }
   get spriteShaderData(): GLESShaderData {
      return this._spriteShaderData;
   }  
   private _renderDataHandler: RTRender2DDataHandle;

   public get renderDataHandler(): RTRender2DDataHandle {
      return this._renderDataHandler;
   }

   public set renderDataHandler(value: RTRender2DDataHandle) {
      this._renderDataHandler = value;
      this._nativeObj.setRenderDataHandler(value ? value._nativeObj : null);
      if (value)
         this._renderDataHandler.owner = this;
   }

   private _globalRenderData: RTGlobalRenderData;
   set globalRenderData(value: RTGlobalRenderData) {
      this._globalRenderData = value;
      this._nativeObj.setGlobalRenderData(value ? value._nativeObj : null);
   }
   get globalRenderData(): RTGlobalRenderData {
      return this._globalRenderData;
   }

   private _pass: RTRender2DPass;
   private _parentPass: RTRender2DPass;

   public get pass(): RTRender2DPass {
      return this._pass || this._parentPass;
   }

   public set pass(value: RTRender2DPass) {
      this._pass = value;
      this._nativeObj.setPass(value ? value._nativeObj : null);
   }

   constructor() {
      this._nativeObj = new (window as any).conchRTRenderStruct2D();
   }

   // RenderNode
   // private _rnUpdateCall: any = null;
   private _rnUpdateFun: any = null;


   set_renderNodeUpdateCall(call: any, renderUpdateFun: any): void {
      this._rnUpdateFun = renderUpdateFun.bind(call);
      this._nativeObj.setRenderUpdate(this._rnUpdateFun);
   }
   private _clipRect: Rectangle;
   setClipRect(rect: Rectangle): void {
      this._clipRect = rect;
      this._nativeObj.setClipRect(rect);
   }

   setRepaint(): void {
      if (this.pass) {
         this.pass.repaint = true;
      }
      this._nativeObj.setRepaint();
   }

   addChild(child: IRenderStruct2D, index: number) {
      child.parent = this;
      this._children.splice(index, 0, child);

      this._nativeObj.addChild((child as unknown as RTRenderStruct2D)._nativeObj, index);
      return;
   }

   updateChildIndex(child: IRenderStruct2D, oldIndex: number, index: number): void {
      if (oldIndex === index)
         return;

      this.children.splice(oldIndex, 1);
      if (index >= this.children.length) {
         this.children.push(child);
      } else {
         this.children.splice(index, 0, child);
      }
      this._nativeObj.updateChildIndex((child as unknown as RTRenderStruct2D)._nativeObj, oldIndex, index); 
   }

   removeChild(child: IRenderStruct2D): void {
      const index = this.children.indexOf(child);
      if (index !== -1) {
         child.parent = null;
         this.children.splice(index, 1);
         this._nativeObj.removeChild((child as unknown as RTRenderStruct2D)._nativeObj); 
      }
   }

   renderUpdate(context: GLESRenderContext2D): void {
      if (this.renderDataHandler) {
         this.renderDataHandler.inheriteRenderData(context);
      }

      if (this._rnUpdateFun)
         this._rnUpdateFun(context);


      this._nativeObj.renderUpdate(context);
   }

   destroy(): void {
      this._nativeObj.destroy();
   }
}