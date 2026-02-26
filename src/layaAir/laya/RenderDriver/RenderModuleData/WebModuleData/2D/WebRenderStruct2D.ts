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

type ParentData = {
   clipInfo: IClipInfo;
   blendMode: BlendMode;
   globalRenderData: WebGlobalRenderData;
   pass: WebRender2DPass;
   enableCulling: boolean;
   dcOptimize: boolean;
   globalAlpha: number;
}

const _DefaultParentData: ParentData = {
   clipInfo: _DefaultClipInfo,
   blendMode: BlendMode.invalid,
   globalRenderData: null,
   pass: null,
   enableCulling: false,
   dcOptimize: false,
   globalAlpha: 1,
}

export class WebRenderStruct2D implements IRenderStruct2D {
   owner: Sprite;

   /** @internal 原始数据，修改操作时修改这个 */
   _parentData: ParentData = {
      ..._DefaultParentData,
   };

   /** @internal 读取数据，用于读取数据，subStruct 截断 */
   _currentData: ParentData = this._parentData;

   //2d 渲染组织流程数据
   zIndex: number = 0;
   //加上父节点的zindex后的最终zIndex值
   _effectZ: number = 0;
   stackingRoot = false;

   rect: Rectangle = new Rectangle();

   private _enableCulling: boolean = false;

   get enableCulling(): boolean {
      return this._enableCulling;
   }

   set enableCulling(value: boolean) {
      this._enableCulling = value;
      this.updateChildren(ChildrenUpdateType.Culling);
   }

   get inheritedEnableCulling(): boolean {
      // 获取准确数据
      return this._enableCulling || this._parentData.enableCulling;
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

   get dcOptimize(): boolean {
      return this._dcOptimize;
   }

   set dcOptimize(value: boolean) {
      this._dcOptimize = value;
      this.updateChildren(ChildrenUpdateType.DcOptimize);
   }

   get inheritedDcOptimize(): boolean {
      // 获取准确数据
      return this._dcOptimize || this._parentData.dcOptimize;
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

   public get globalAlpha(): number {
      return this._currentData.globalAlpha;
   }

   public set globalAlpha(value: number) {
      this._parentData.globalAlpha = value;
   }

   private _alpha: number = 1.0;

   public get alpha(): number {
      return this._alpha;
   }

   public set alpha(value: number) {
      this._alpha = value;
      this._updateGlobalAlpha(value , this.parent ? this.parent.globalAlpha : 1);
      this.updateChildren(ChildrenUpdateType.Alpha);
   }

   /** @internal 最特殊，需要最后一个处理混合 */
   private _blendMode: BlendMode = BlendMode.invalid;

   public get blendMode(): BlendMode {
      return this._blendMode || this._currentData.blendMode || BlendMode.normal;
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

   public get globalRenderData(): WebGlobalRenderData {
      return this._globalRenderData || this._currentData.globalRenderData;
   }

   public set globalRenderData(value: WebGlobalRenderData) {
      this._globalRenderData = value;
      this._updateGlobalShaderData();
      this.updateChildren(ChildrenUpdateType.Global);
   }
   
   private _updateGlobalShaderData(){
      let renderData = this.globalRenderData;
      if (renderData) {
         this._globalShaderData = renderData.globalShaderData;
      }else{
         this._globalShaderData = null;
      }

      if (this._subStruct) {
         this._subStruct._updateGlobalShaderData();
      }
   }

   /** @internal */
   _pass: WebRender2DPass;
   /** @internal */
   _maskParentPass: WebRender2DPass;

   private _updatePriority(){
      if (this._pass) {
         if (this._maskParentPass) {
            this._pass.priority = this._maskParentPass.priority + 1;
         } else if (this._parentData.pass) {//按真实的父节点来
            this._pass.priority = this._parentData.pass.priority + 1;
         } else {
            this._pass.priority = 0;
         }
      }
   }

   /** @internal */
   setMaskParentPass(pass: WebRender2DPass): void {
      this._maskParentPass = pass;
      this._updatePriority();
      if (this._pass) {
         this.updateChildren(ChildrenUpdateType.Pass);
      }
   }

   public get pass(): WebRender2DPass {
      return this._pass || this._currentData.pass;
   }

   public set pass(value: WebRender2DPass) {
      if (value !== this._pass) {
         this._pass = value;
         this._updatePriority();
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
            let parentData = this._parentData;

            value._blendMode = this._blendMode;
            value._currentData = parentData;
            value._maskParentPass = this._maskParentPass;
            
            if (parentData.globalAlpha !== 1) {
               updateFlag |= ChildrenUpdateType.Alpha;
            }

            if (!this._globalRenderData && parentData.globalRenderData) {
               updateFlag |= ChildrenUpdateType.Global;
            }

            //自己没有裁剪，有父裁剪
            if (!this._clipInfo && parentData.clipInfo) {
               updateFlag |= ChildrenUpdateType.Clip;
            }

            //只要有混合就需要重新更新
            if ( this._blendMode !== BlendMode.invalid|| parentData.blendMode !== BlendMode.invalid ) {
               updateFlag |= ChildrenUpdateType.Blend;
            }

            this._blendMode = BlendMode.invalid;
            this._currentData = _DefaultParentData;
            value.needUploadAlpha = true;

         } else if (this._subStruct) {

            let parentData = this._parentData;
            this._subStruct._currentData = this._subStruct._parentData;
            this._blendMode = this._subStruct._blendMode;

            if (parentData.globalAlpha !== 1) {
               updateFlag |= ChildrenUpdateType.Alpha;
            }

            if (!this._clipInfo && parentData.clipInfo) { 
               updateFlag |= ChildrenUpdateType.Clip;
            }
            
            if (!this._globalRenderData && parentData.globalRenderData) {
               updateFlag |= ChildrenUpdateType.Global;
            }

            if (this._blendMode !== BlendMode.invalid || parentData.blendMode !== BlendMode.invalid) {
               updateFlag |= ChildrenUpdateType.Blend;
            }

            this._subStruct._blendMode = BlendMode.invalid;
            this._subStruct._maskParentPass = null;
            this._currentData = parentData;
         }
         
         this._subStruct = value;
         this._updateGlobalShaderData();
         this.updateChildren(updateFlag);
         this._setBlendMode();
      }
   }

   constructor() {
   }

   /** @internal */
   _clipRect: Rectangle = null;
   /** @internal */
   _clipInfo: IClipInfo = null;

   private _uniformClip = false;
   /**@deprecated 使用_currentData.clipInfo代替 */
   get _parentClipInfo(): IClipInfo {
      return this._currentData.clipInfo;
   }

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
         let clipInfo = this._currentData.clipInfo;
         let parentClipUpdateFrame = clipInfo && clipInfo !== _DefaultClipInfo ? clipInfo._updateFrame : -1;

         if (trans) {
            if (info._updateFrame < trans.modifiedFrame || info._updateFrame < parentClipUpdateFrame) {
               let mat = trans.matrix;
               let cm = info.clipMatrix;
               let { x, y, width, height } = rect;
               width = Math.max(width, 0.0001);
               height = Math.max(height, 0.0001);
               let tx = mat.tx, ty = mat.ty;
               cm.tx = x * mat.a + y * mat.c + tx;
               cm.ty = x * mat.b + y * mat.d + ty;
               cm.a = width * mat.a;
               cm.b = width * mat.b;
               cm.c = height * mat.c;
               cm.d = height * mat.d;

               if (parentClipUpdateFrame !== -1) {

                  let parentClipPos = clipInfo.clipMatPos;
                  let offsetx = parentClipPos.z - parentClipPos.x;
                  let offsety = parentClipPos.w - parentClipPos.y;
                  //计算交集
                  if (cm.a > 0 && cm.d > 0) {
                     let parentMat = clipInfo.clipMatrix;
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
                           tx = parentMinX;
                        }
                        if (cmaxx > parentMaxX) {
                           cm.a -= (cmaxx - parentMaxX);
                        }
                        if (ty < parentMinY) {
                           cm.d -= (parentMinY - ty);
                           ty = parentMinY;
                        }
                        if (cmaxy > parentMaxY) {
                           cm.d -= (cmaxy - parentMaxY);
                        }
                        if (cm.a <= 0) cm.a = -0.1;
                        if (cm.d <= 0) cm.d = -0.1;
                        
                        if (cm.tx < parentMinX) {
                           cm.tx = parentMinX;
                        }
                        if (cm.ty < parentMinY) {
                           cm.ty = parentMinY;
                        }
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
         if (info !== _DefaultClipInfo) {
            if (this.needUploadClip < info._updateFrame) {
               data.setVector(ShaderDefines2D.UNIFORM_CLIPMATDIR, info.clipMatDir);
               data.setVector(ShaderDefines2D.UNIFORM_CLIPMATPOS, info.clipMatPos);
               this.needUploadClip = info._updateFrame;
            }

            if (!this._uniformClip) {
               this._uniformClip = true;
               data.addDefine(ShaderDefines2D.UNIFORMCLIP);
            }
            
         }else if (this._uniformClip) {
            data.removeDefine(ShaderDefines2D.UNIFORMCLIP);
            this._uniformClip = false;
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

   private _updateGlobalAlpha(value: number , parentAlpha: number = 1): void {
      this._parentData.globalAlpha = parentAlpha * value;
      // if (this._subStruct) {
      //    this.globalAlpha = value;
      //    this._subStruct.globalAlpha = parentAlpha;
      // } else {
      //    this.globalAlpha = parentAlpha * value;
      // }
   }

   private _updateBlendMode(blendMode: BlendMode): void {
      if (this._subStruct && this._subStruct.enabled) {
         this._subStruct._blendMode = blendMode;
      } else {
         this._blendMode = blendMode;
      }
   }

   getClipInfo(): IClipInfo {
      return this._clipInfo || this._currentData.clipInfo || _DefaultClipInfo;
   }

   /** 是否存在有效裁剪（非默认值） */
   hasClip(): boolean {
      return this.getClipInfo() !== _DefaultClipInfo;
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
         if (this._subStruct) {
            this._subStruct.needUploadClip = -1;
         }
         updateClip = true;
      }

      if (type & ChildrenUpdateType.Blend) {
         blendMode = this.blendMode;
         updateBlend = true;
      }

      if (type & ChildrenUpdateType.Alpha) {
         alpha = this.globalAlpha;
         this.needUploadAlpha = true;
         if (this._subStruct) {
            this._subStruct.needUploadAlpha = true;
         }
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
         globalRenderData = this.globalRenderData;
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
         let childParentData = child._parentData;
         if (updateClip) {
            childParentData.clipInfo = info;
            if (!child._clipInfo) {
               updateChild = true;
            }
         }

         if (updateBlend) {
            if (child._blendMode === BlendMode.invalid) {//有效值
               childParentData.blendMode = blendMode;
               child._setBlendMode();
               updateChild = true;
            }
         }

         if (updateAlpha) {
            child._updateGlobalAlpha(child.alpha , alpha);
            updateChild = true;
         }

         if (updatePass) {
            childParentData.pass = pass;
            if (child._pass && child._pass !== pass) {
               child._pass.priority = priority;
            }
            //需要更新优先级
            updateChild = true;
         }

         if (updateGlobal) {
            childParentData.globalRenderData = globalRenderData;
            child._updateGlobalShaderData();
            if (!child._globalRenderData) {
               updateChild = true;
            }
         }

         if (updateCulling) {
            childParentData.enableCulling = enableCulling;
            if (child._pass) {
               child._pass.repaint = true;
            }
            updateChild = true;
         }

         if (updateDcOptimize) {
            childParentData.dcOptimize = dcOptimize;
            if (child._pass) {
               child._pass.repaint = true;
            }
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

      let childParentData = child._parentData;
      childParentData.clipInfo = this.getClipInfo();
      childParentData.blendMode = this.blendMode;
      child._setBlendMode();
      child._updateGlobalAlpha(child.alpha , this.globalAlpha);
      let parentPass = this.pass;

      childParentData.pass = parentPass;
      child._updatePriority();
      childParentData.globalRenderData = this.globalRenderData;
      child._updateGlobalShaderData();
      childParentData.enableCulling = this.inheritedEnableCulling;
      childParentData.dcOptimize = this.inheritedDcOptimize;
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

         let childParentData = child._parentData;
         childParentData.pass = null;

         child._updatePriority();
         childParentData.clipInfo = null;
         childParentData.blendMode = BlendMode.invalid;
         child._updateGlobalAlpha(child._alpha);
         childParentData.globalRenderData = null;
         child._updateGlobalShaderData();
         childParentData.enableCulling = false;
         childParentData.dcOptimize = false;

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
      this._currentData = null;
      this._parentData = null;
      this._clipRect = null;
      this.renderElements = null;
      this.spriteShaderData = null;
      this.parent = null;
      this.children.length = 0;
      this.children = null;
      this.pass = null;
   }
}