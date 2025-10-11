import { IRenderContext2D } from "../../../DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderElement2D } from "../../../DriverDesign/2DRenderPass/IRenderElement2D";
import { IClipInfo, IRenderStruct2D } from "../../Design/2D/IRenderStruct2D";
import { Rectangle } from "../../../../maths/Rectangle";
import { WebRender2DPass } from "./WebRender2DPass";
import { ShaderData } from "../../../DriverDesign/RenderDevice/ShaderData";
import { Matrix } from "../../../../maths/Matrix";
import { Vector4 } from "../../../../maths/Vector4";
import { Const } from "../../../../Const";
import { WebRender2DDataHandle } from "./WebRenderDataHandle";
import { BlendMode, BlendModeHandler } from "../../../../webgl/canvas/BlendMode";
import { I2DGlobalRenderData } from "../../Design/2D/IRender2DDataHandle";
import { Stat } from "../../../../utils/Stat";
import { ShaderDefines2D } from "../../../../webgl/shader/d2/ShaderDefines2D";
import { Sprite } from "../../../../display/Sprite";

const _DefaultClipInfo: IClipInfo = {
   clipMatrix: new Matrix(),
   clipMatDir: new Vector4(Const.MAX_CLIP_SIZE, 0, 0, Const.MAX_CLIP_SIZE),
   clipMatPos: new Vector4(0, 0, 0, 0),
   _updateFrame: 0
}

export class WebGlobalRenderData implements I2DGlobalRenderData {
   cullRect: Vector4;
   renderLayerMask: number;
   globalShaderData: ShaderData;
}

enum ChildrenUpdateType {
   All = -1,
   None = 0,
   Clip = 1,
   Blend = 2,
   Alpha = 4,
   Pass = 8,
   Global = 16,
   Culling = 32,
   DcOptimize = 64,
}

interface StructTransform {
   matrix: Matrix;
   modifiedFrame: number;
}


export class WebRenderStruct2D implements IRenderStruct2D {
   owner: Sprite;

   //2d 渲染组织流程数据
   zIndex: number = 0;
   //加上父节点的zindex后的最终zIndex值
   _effectZ: number = 0;
   stackingRoot = false;

   rect: Rectangle = new Rectangle();

   private _enableCulling: boolean = false;
   private _parentEnableCulling: boolean = false;

   get enableCulling(): boolean {
      return this._enableCulling;
   }

   set enableCulling(value: boolean) {
      this._enableCulling = value;
      this.updateChildren(ChildrenUpdateType.Culling);
   }

   get inheritedEnableCulling(): boolean {
      return this._enableCulling || this._parentEnableCulling;
   }

   renderLayer: number = 1;

   parent: WebRenderStruct2D | null;

   children: WebRenderStruct2D[] = [];

   /** 按标记来 */
   renderType: number = -1;

   renderUpdateMask: number = 0;

   //自动优化dc相关
   /** @internal */
   _dcOptimize: boolean;
   private _parentDcOptimize: boolean;

   get dcOptimize(): boolean {
      return this._dcOptimize;
   }

   set dcOptimize(value: boolean) {
      this._dcOptimize = value;
      this.updateChildren(ChildrenUpdateType.DcOptimize);
   }

   get inheritedDcOptimize(): boolean {
      return this._dcOptimize || this._parentDcOptimize;
   }

   dcOptimizeEnd: WebRenderStruct2D;

   public get renderMatrix(): Matrix {
      return this.trans.matrix;
   }

   public set renderMatrix(value: Matrix) {
      if (this.trans) {
         this.trans.matrix = value;
         this.trans.modifiedFrame = Stat.loopCount;
      }
      else {
         //da buffer 的位置   abcd dx dy modify
         this.trans = { matrix: value, modifiedFrame: Stat.loopCount };
      }
   }

   trans: StructTransform;

   globalAlpha: number = 1.0;

   private _alpha: number = 1.0;

   public get alpha(): number {
      return this._alpha;
   }

   public set alpha(value: number) {
      this._alpha = value;
      if (this.parent) {
         this.globalAlpha = this.parent.globalAlpha * value;
      } else
         this.globalAlpha = value;

      this.updateChildren(ChildrenUpdateType.Alpha);
   }

   private _blendMode: BlendMode = BlendMode.invalid;
   private _parentBlendMode: BlendMode = BlendMode.invalid;

   public get blendMode(): BlendMode {
      return this._blendMode || this._parentBlendMode || BlendMode.normal;
   }

   public set blendMode(value: BlendMode) {
      this._updateBlendMode(value);
      this._setBlendMode();
      this.updateChildren(ChildrenUpdateType.Blend);
   }

   /** @internal */
   needUploadClip = -1;

   /** @internal */
   needUploadAlpha = true;

   /** 是否启动 */
   enabled: boolean = true;

   //渲染数据

   isRenderStruct: boolean = false;

   renderElements: IRenderElement2D[] = null;

   spriteShaderData: ShaderData = null;

   private _renderDataHandler: WebRender2DDataHandle;

   public get renderDataHandler(): WebRender2DDataHandle {
      return this._renderDataHandler;
   }

   public set renderDataHandler(value: WebRender2DDataHandle) {
      this._renderDataHandler = value;
      if (value)
         this._renderDataHandler.owner = this;
   }


   /** @internal */
   _globalShaderData: ShaderData = null;

   /** @internal */
   private _globalRenderData: WebGlobalRenderData = null;
   /** @internal */
   _parentGlobalRenderData: WebGlobalRenderData = null;

   public get globalRenderData(): WebGlobalRenderData {
      return this._globalRenderData || this._parentGlobalRenderData;
   }

   public set globalRenderData(value: WebGlobalRenderData) {
      if (value) {
         this._globalShaderData = value.globalShaderData;
      } else {
         this._globalShaderData = null;
      }
      this._globalRenderData = value;
      this.updateChildren(ChildrenUpdateType.Global);
   }
   
   /** @internal */
   _pass: WebRender2DPass;
   private _parentPass: WebRender2DPass;

   public get pass(): WebRender2DPass {
      return this._pass || this._parentPass;
   }

   public set pass(value: WebRender2DPass) {
      if (value !== this._pass) {
         this._pass = value;
         if (value && this._parentPass) {
            value.priority = this._parentPass.priority + 1;
         }
         this.updateChildren(ChildrenUpdateType.Pass);
      }
   }

   private _subStruct: WebRenderStruct2D;

   public get subStruct(): WebRenderStruct2D {
      return this._subStruct;
   }

   public set subStruct(value: WebRenderStruct2D) {
      //不存在上一个
      if (value != this._subStruct) {
         let updateFlag = 0;

         if (value) {
            value._parentClipInfo = this._parentClipInfo;
            value._blendMode = this._blendMode;
            value._parentBlendMode = this._parentBlendMode;
            value._parentGlobalRenderData = this._parentGlobalRenderData;
            value._globalShaderData = this._globalShaderData;

            //自己没有裁剪，有父裁剪
            if (!this._clipInfo && this._parentClipInfo) {
               updateFlag |= ChildrenUpdateType.Clip;
            }

            if (!this._globalRenderData && this._parentGlobalRenderData) {
               updateFlag |= ChildrenUpdateType.Global;
            }

            //只要有混合就需要重新更新
            if ( this._blendMode !== BlendMode.invalid|| this._parentBlendMode !== BlendMode.invalid ) {
               updateFlag |= ChildrenUpdateType.Blend;
            }

            this._parentClipInfo = null;
            this._blendMode = BlendMode.invalid;
            this._parentBlendMode = BlendMode.invalid;
            this._parentGlobalRenderData = null;
            this._globalShaderData = null;

         } else if (this._subStruct) {

            this._parentClipInfo = this._subStruct._parentClipInfo;
            this._blendMode = this._subStruct._blendMode;
            this._parentBlendMode = this._subStruct._parentBlendMode;
            this._parentGlobalRenderData = this._subStruct._parentGlobalRenderData;
            this._globalShaderData = this._subStruct._globalShaderData;
            
            if (!this._clipInfo && this._parentClipInfo) { 
               updateFlag |= ChildrenUpdateType.Clip;
            }
            
            if (!this._globalRenderData && this._subStruct._parentGlobalRenderData) {
               updateFlag |= ChildrenUpdateType.Global;
            }

            if (this._blendMode !== BlendMode.invalid || this._parentBlendMode !== BlendMode.invalid) {
               updateFlag |= ChildrenUpdateType.Blend;
            }

            this._subStruct._parentClipInfo = null;
            this._subStruct._blendMode = BlendMode.invalid;
            this._subStruct._parentBlendMode = BlendMode.invalid;
            this._subStruct._parentGlobalRenderData = null;
            this._subStruct._globalShaderData = null;
         }

         this.updateChildren(updateFlag);
         this._subStruct = value;
         this._setBlendMode();
      }
   }

   constructor() {
   }

   /** @internal */
   _clipRect: Rectangle = null;
   /** @internal */
   _parentClipInfo: IClipInfo = null;
   /** @internal */
   _clipInfo: IClipInfo = null;

   // RenderNode
   private _rnUpdateFun: any = null;

   setRenderUpdateCallback(func: Function): void {
      this._rnUpdateFun = func;
   }

   //处理Struct的继承数据，后续没有必要就删除
   _handleInterData(): void {
      //clip处理 
      let rect = this._clipRect;

      if (rect) {
         let info = this._clipInfo;
         let trans = this.trans;
         let parentClipUpdateFrame = this._parentClipInfo && this._parentClipInfo !== _DefaultClipInfo ? this._parentClipInfo._updateFrame : -1;

         if (trans) {
            if (info._updateFrame < trans.modifiedFrame || info._updateFrame < parentClipUpdateFrame) {
               let mat = trans.matrix;
               let cm = info.clipMatrix;
               let { x, y, width, height } = rect;
               let tx = mat.tx, ty = mat.ty;
               cm.tx = x * mat.a + y * mat.c + tx;
               cm.ty = x * mat.b + y * mat.d + ty;
               cm.a = width * mat.a;
               cm.b = width * mat.b;
               cm.c = height * mat.c;
               cm.d = height * mat.d;

               if (parentClipUpdateFrame !== -1) {

                  let parentClipPos = this._parentClipInfo.clipMatPos;
                  let offsetx = parentClipPos.z - parentClipPos.x;
                  let offsety = parentClipPos.w - parentClipPos.y;
                  //计算交集
                  if (cm.a > 0 && cm.d > 0) {
                     let parentMat = this._parentClipInfo.clipMatrix;
                     let parentMinX = parentMat.tx;
                     let parentMinY = parentMat.ty;
                     let parentMaxX = parentMinX + parentMat.a;
                     let parentMaxY = parentMinY + parentMat.d;

                     let cmaxx = tx + cm.a;
                     let cmaxy = ty + cm.d;

                     if (cmaxx <= parentMinX || cmaxy <= parentMinY || tx >= parentMaxX || ty >= parentMaxY) {
                        //超出范围了
                        cm.a = -0.1; cm.d = -0.1;
                     } else {
                        if (tx < parentMinX) {
                           cm.a -= (parentMinX - tx);
                           tx = cm.tx = parentMinX;
                           // offsetx += parentMinX - cm.tx;
                        }
                        if (cmaxx > parentMaxX) {
                           cm.a -= (cmaxx - parentMaxX);
                        }
                        if (ty < parentMinY) {
                           cm.d -= (parentMinY - ty);
                           ty = cm.ty = parentMinY;
                           // offsety += parentMinY - cm.ty;
                        }
                        if (cmaxy > parentMaxY) {
                           cm.d -= (cmaxy - parentMaxY);
                        }
                        if (cm.a <= 0) cm.a = -0.1;
                        if (cm.d <= 0) cm.d = -0.1;
                     }
                  }

                  tx += offsetx;
                  ty += offsety;
               }
               info.clipMatDir.setValue(cm.a, cm.b, cm.c, cm.d);
               info.clipMatPos.setValue(cm.tx, cm.ty, tx, ty);

               info._updateFrame = Math.max(trans.modifiedFrame, parentClipUpdateFrame);
            }
         }
      }

      if (this._renderDataHandler) {

         let data = this.spriteShaderData;
         // clip
         let info = this.getClipInfo();
         if (this.needUploadClip < info._updateFrame) {
            data.setVector(ShaderDefines2D.UNIFORM_CLIPMATDIR, info.clipMatDir);
            data.setVector(ShaderDefines2D.UNIFORM_CLIPMATPOS, info.clipMatPos);
            this.needUploadClip = info._updateFrame;
         }

         // global alpha
         if (this.needUploadAlpha) {
            data.setNumber(ShaderDefines2D.UNIFORM_VERTALPHA, this.globalAlpha);
            this.needUploadAlpha = false;
         }
      }
   }

   private _setBlendMode(): void {
      if (!this.spriteShaderData) return;
      BlendModeHandler.setShaderData(this.blendMode, this.spriteShaderData);
      if (this._subStruct) {
         this._subStruct._setBlendMode();
      }
   }


   setClipRect(rect: Rectangle): void {
      this._clipRect = rect;
      rect ? this._initClipInfo() : this._clipInfo = null;
      this.updateChildren(ChildrenUpdateType.Clip);
   }

   private _initClipInfo(): void {
      if (!this._clipInfo) {
         this._clipInfo = {
            clipMatDir: new Vector4,
            clipMatPos: new Vector4,
            clipMatrix: new Matrix,
            _updateFrame: -1
         };
      }
      else
         this._clipInfo._updateFrame = -1;
   }

   /**
    *  @internal
    * 父节点的裁剪影响substruct
    */
   private _updateParentClipInfo(clipInfo: IClipInfo): void {
      if (this._subStruct && this._subStruct.enabled) {
         this._subStruct._parentClipInfo = clipInfo;
      } else {
         this._parentClipInfo = clipInfo;
      }
   }

   /**
    *  @internal
    * 父节点的全局渲染数据影响substruct
    */
   private _updateParentGlobalRenderData(globalRenderData: WebGlobalRenderData): void {
      if (this._subStruct && this._subStruct.enabled) {
         this._subStruct._parentGlobalRenderData = globalRenderData;
         if (globalRenderData) {
            this._subStruct._globalShaderData = globalRenderData.globalShaderData;
         }
      } else {
         this._parentGlobalRenderData = globalRenderData;
         if (!this._globalRenderData && globalRenderData) {
            this._globalShaderData = globalRenderData.globalShaderData;
         }
      }
   }

   private _updateParentBlendMode(blendMode: BlendMode): void {
      if (this._subStruct && this._subStruct.enabled) {
         this._subStruct._parentBlendMode = blendMode;
      } else {
         this._parentBlendMode = blendMode;
      }
   }
   
   private _updateBlendMode(blendMode: BlendMode): void {
      if (this._subStruct && this._subStruct.enabled) {
         this._subStruct._blendMode = blendMode;
      } else {
         this._blendMode = blendMode;
      }
   }

   getClipInfo(): IClipInfo {
      return this._clipInfo || this._parentClipInfo || _DefaultClipInfo;
   }

   private updateChildren(type: ChildrenUpdateType): void {
      if (type == ChildrenUpdateType.None) return;
      let info: IClipInfo, blendMode: BlendMode, alpha: number;
      let priority: number = 0, pass: WebRender2DPass = null, enableCulling: boolean = false, dcOptimize: boolean = false;
      let globalShaderData: ShaderData = null, globalRenderData: WebGlobalRenderData = null;
      let updateBlend = false, updateClip = false, updateAlpha = false, updatePass = false, updateGlobal = false, updateCulling = false, updateDcOptimize = false;

      if (type & ChildrenUpdateType.Clip) {
         info = this.getClipInfo();
         this.needUploadClip = -1;
         updateClip = true;
      }

      if (type & ChildrenUpdateType.Blend) {
         blendMode = this.blendMode;
         updateBlend = true;
      }

      if (type & ChildrenUpdateType.Alpha) {
         alpha = this.globalAlpha;
         this.needUploadAlpha = true;
         updateAlpha = true;
      }

      if (type & ChildrenUpdateType.Pass) {
         pass = this.pass;
         priority = pass ? pass.priority + 1 : 0;
         updatePass = true;
      }

      if (type & ChildrenUpdateType.Global) {
         updateGlobal = true;
         globalShaderData = this._globalShaderData;
         globalRenderData = this._globalRenderData;
      }

      if (type & ChildrenUpdateType.Culling) {
         updateCulling = true;
         enableCulling = this.inheritedEnableCulling;
      }

      if (type & ChildrenUpdateType.DcOptimize) {
         updateDcOptimize = true;
         dcOptimize = this.inheritedDcOptimize;
      }

      for (const child of this.children) {
         let updateChild = false;
         if (updateClip) {
            child._updateParentClipInfo(info);
            if (!child._clipInfo) {
               updateChild = true;
            }
         }

         if (updateBlend) {
            if (child._blendMode === BlendMode.invalid) {//有效值
               child._updateParentBlendMode(blendMode);
               child._setBlendMode();
               updateChild = true;
            }
         }

         if (updateAlpha) {
            child.globalAlpha = alpha * child.alpha;
            updateChild = true;
         }

         if (updatePass) {
            child._parentPass = pass;

            if (child._pass && child._pass !== pass) {
               child._pass.priority = priority;
            }
            //需要更新优先级
            updateChild = true;
         }

         if (updateGlobal) {
            child._updateParentGlobalRenderData(globalRenderData);

            if (!child._globalRenderData) {
               updateChild = true;
            }
         }

         if (updateCulling) {
            child._parentEnableCulling = enableCulling;
            updateChild = true;
         }

         if (updateDcOptimize) {
            child._parentDcOptimize = dcOptimize;
            updateChild = true;
         }

         if (updateChild) {
            child.updateChildren(type);
         }
      }
   }

   setRepaint(): void {
      if (this.pass) {
         this.pass.repaint = true;
      }
   }

   addChild(child: WebRenderStruct2D, index: number): void {
      child.parent = this;
      this.children.splice(index, 0, child);

      child._updateParentClipInfo(this.getClipInfo());
      child._updateParentBlendMode(this.blendMode);
      child.globalAlpha = this.globalAlpha * child._alpha;
      let parentPass = this.pass;
      child._parentPass = parentPass;
      if (child._pass && parentPass) {
         child._pass.priority = parentPass.priority + 1;
      }
      child._updateParentGlobalRenderData(this.globalRenderData);
      child._parentEnableCulling = this.inheritedEnableCulling;
      child._parentDcOptimize = this.inheritedDcOptimize;
      //效率
      child.updateChildren(ChildrenUpdateType.All);
      return;
   }

   updateChildIndex(child: WebRenderStruct2D, oldIndex: number, index: number): void {
      if (oldIndex === index)
         return;

      this.children.splice(oldIndex, 1);
      if (index >= this.children.length) {
         this.children.push(child);
      } else {
         this.children.splice(index, 0, child);
      }
   }

   removeChild(child: WebRenderStruct2D): void {
      const index = this.children.indexOf(child);
      if (index !== -1) {
         child.parent = null;
         this.children.splice(index, 1);

         child._parentPass = null;
         if (child._pass) {
            child._pass.priority = 0;
         }
         child._updateParentClipInfo(null);
         child._updateParentBlendMode(BlendMode.invalid);
         child.globalAlpha = child._alpha;
         child._parentGlobalRenderData = null;
         child._parentEnableCulling = false;
         child._parentDcOptimize = false;
         child._updateParentGlobalRenderData(null);
         child.updateChildren(ChildrenUpdateType.All);
      }
   }

   renderUpdate(context: IRenderContext2D): void {
      if (this.renderDataHandler) {
         this.renderDataHandler.inheriteRenderData(context);
      }

      if (this._rnUpdateFun) {
         this._rnUpdateFun(context);
      }
   }

   destroy(): void {
      this._clipInfo = null;
      this._parentClipInfo = null;
      this._clipRect = null;
      this.renderElements = null;
      this.spriteShaderData = null;
      this.parent = null;
      this.children.length = 0;
      this.children = null;
      this.pass = null;
   }
}