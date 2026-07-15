import { IRenderContext2D } from "../../../DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderElement2D } from "../../../DriverDesign/2DRenderPass/IRenderElement2D";
import { IClipInfo, IRenderStruct2D } from "../../Design/2D/IRenderStruct2D";
import { Rectangle } from "../../../../maths/Rectangle";
import { WebRender2DPass } from "./WebRender2DPass";
import { ShaderData } from "../../../DriverDesign/RenderDevice/ShaderData";
import { Matrix } from "../../../../maths/Matrix";
import { Vector2 } from "../../../../maths/Vector2";
import { Vector4 } from "../../../../maths/Vector4";
import { Const } from "../../../../Const";
import { WebRender2DDataHandle } from "./WebRenderDataHandle";
import { BlendMode, BlendModeHandler } from "../../../../webgl/canvas/BlendMode";
import { I2DGlobalRenderData } from "../../Design/2D/IRender2DDataHandle";
import { ShaderDefines2D } from "../../../../webgl/shader/d2/ShaderDefines2D";
import { Sprite } from "../../../../display/Sprite";
import { Transform2DStore } from "../../../../display/transform2d/Transform2DStore";
import { SlotConst } from "../../../../display/transform2d/Transform2DLayout";

/** @internal 读 store world 矩阵的模块级 scratch(无 per-call 分配) */
const _wm6 = new Float32Array(6);
let _clipUpdateFrame = 1;
let _clipRectUpdateFrame = 1;

const _DefaultClipInfo: IClipInfo = {
   clipMatrix: new Matrix(),
   clipMatDir: new Vector4(Const.MAX_CLIP_SIZE, 0, 0, Const.MAX_CLIP_SIZE),
   clipMatPos: new Vector4(0, 0, 0, 0),
   _updateFrame: 0,
   clipDepth: 0,
   clipParent: null
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
   Alpha = 4,// 死位：alpha 已由 _setAlphaBase + SoA 接管，updateChildren 不再传播；结构变更须配套调用 _setAlphaBase
   Pass = 8,
   Global = 16,
   Culling = 32,
   DcOptimize = 64,
}


type ParentData = {
   clipInfo: IClipInfo;
   blendMode: BlendMode;
   globalRenderData: WebGlobalRenderData;
   pass: WebRender2DPass;
   enableCulling: boolean;
   dcOptimize: boolean;
}

const _DefaultParentData: ParentData = {
   clipInfo: _DefaultClipInfo,
   blendMode: BlendMode.invalid,
   globalRenderData: null,
   pass: null,
   enableCulling: false,
   dcOptimize: false,
}

export class WebRenderStruct2D implements IRenderStruct2D {
   owner: Sprite;
   forceShaderClip: boolean = false;

   /** 手动渲染模式：子节点不参与父 pass 的自动遍历和渲染 */
   manualRender: boolean = false;

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

   /**
    * @zh 本节点在 Transform2DStore(SoA) 中的 slot。渲染底层据此直接按 slot 取 world 矩阵，
    * 不再经 SpriteGlobalTransform 那一层。由 Sprite 在构造/创建 subStruct 时写入。
    */
   transSlot: number = SlotConst.None;

   /** @internal getter 每帧从 store 填一次的临时矩阵；非权威存储，权威在 Transform2DStore。 */
   private _renderMatrix: Matrix = new Matrix();
   /** @internal renderMatrix 每帧从 store 读一次的缓存帧标记 */
   private _rmFrame: number = -1;

   /** @internal */
   public getRenderMatrixVersion(): number {
      return Transform2DStore.instance.getMatrixFrame(this.transSlot);
   }

   public get renderMatrix(): Matrix {
      // Web struct 只把 transSlot 当身份：矩阵按 slot 从 Transform2DStore 读，缓存 key 用 SoA 的 matrixFrame
      // (不是 Stat.loopCount)——否则同帧 update() 前先读过一次后，update() 改了矩阵也不会刷新、拿旧值。
      if (this.transSlot >= 0) {
         const store = Transform2DStore.instance;
         if (store.dirtyM) {
            // 本帧尚有未结账的矩阵写入：matrixFrame 还没盖准，直接现算并使缓存失效(update 后会重读)。
            store.computeWorldMatrix(this.transSlot, _wm6);
            this._rmFrame = -1;
         } else {
            // 已结账：只有 world 矩阵真变(matrixFrame 变)才刷新本地 Matrix。
            const matFrame = store.getMatrixFrame(this.transSlot);
            if (this._rmFrame === matFrame)
               return this._renderMatrix;
            this._rmFrame = matFrame;
            store.readWorldMatrix(this.transSlot, _wm6);
         }
         const m = this._renderMatrix;
         m.a = _wm6[0]; m.b = _wm6[1]; m.c = _wm6[2]; m.d = _wm6[3]; m.tx = _wm6[4]; m.ty = _wm6[5];
         m._checkTransform();
      }
      return this._renderMatrix;
   }

   public set renderMatrix(value: Matrix) {
      // Web struct 的矩阵权威在 Transform2DStore(getter 读)，setter 不再存。
      // 仅无 slot 的旧路径(理论上不出现在 Web)才把外部矩阵临时拷入并使缓存失效。
      if (this.transSlot < 0) {
         value.copyTo(this._renderMatrix);
         this._rmFrame = -1;
      }
   }

   /**
    * @zh cache 隔离基准 slot：本 struct alpha 相对该 cache 根隔离(None=无 cache 祖先/主 pass)。
    * 仅在树结构 / cacheAs / mask 变化时更新(_setAlphaBase)，不随 alpha 写入变化。
    */
   _alphaBaseSlot: number = SlotConst.None;
   /** @internal _handleInterData 上次写入 UNIFORM_VERTALPHA 的值；值比较门控，无变化不重传。 */
   private _lastUploadedAlpha: number = -1;

   /**
    * @zh 全局(级联) alpha：base<0 直读 worldAlpha(slot)；cache 子树取相对 base 的相对 alpha。
    * 与旧 _currentData.globalAlpha 逐场景等价(普通/cache 内容/合成/嵌套/mask)。
    */
   public get globalAlpha(): number {
      const slot = this.transSlot;
      if (slot < 0) return 1; // 无 SoA 节点的临时 struct(line/debug draw)兜底
      const store = Transform2DStore.instance;
      let base = this._alphaBaseSlot;
      // 遮罩合成 quad：K 的 SoA 父=maskParent M，worldAlpha(K) 含 worldAlpha(M)；以 M 为 base 除掉它只取 localAlpha(K)
      // (M 的 alpha 在其 RT 合成时另施加，否则重复变暗≈alpha²)。owner._maskParent 排除普通 sprite 手设 blendMode="mask"。
      if (this._blendMode === BlendMode.mask && this.owner && this.owner._maskParent) {
         base = store.getParent(slot);
      }
      if (base < 0)
         return store.dirtyA ? store.computeWorldAlpha(slot) : store.getWorldAlpha(slot);
      return store.getRelativeWorldAlpha(slot, base, store.dirtyA);
   }

   public get alpha(): number {
      // local alpha 直接来自 SoA(slot)，struct 不另存一份。无 slot 的临时 struct(line/debug)兜底 1。
      return this.transSlot < 0 ? 1 : Transform2DStore.instance.readAlpha(this.transSlot);
   }

   public set alpha(value: number) {
      if (this.transSlot >= 0) Transform2DStore.instance.writeAlpha(this.transSlot, value);
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
   private _needUploadClipOffset = -1;
   private _clipOffset: Vector2 = new Vector2();

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
      if (this._renderDataHandler) {
         this._renderDataHandler.owner = null;
      }
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
         const prevContentBase = this._alphaBaseSlot; // 成为 cache 根前的外层 base
         let restoreBase = SlotConst.None;

         if (value) {
            let parentData = this._parentData;

            value._blendMode = this._blendMode;
            value._currentData = parentData;
            value._maskParentPass = this._maskParentPass;

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

         } else if (this._subStruct) {

            let parentData = this._parentData;
            restoreBase = this._subStruct._alphaBaseSlot; // composite 保存的外层 base
            this._subStruct._currentData = this._subStruct._parentData;
            this._blendMode = this._subStruct._blendMode;

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

         // alpha 隔离基准：启用→content 相对自己(报1)/composite 用外层 base/孩子相对自己；解除→回退外层 base。
         if (value) {
            value._alphaBaseSlot = prevContentBase;
            this._alphaBaseSlot = this.transSlot;
            for (let i = 0, n = this.children.length; i < n; i++) {
               this.children[i]._setAlphaBase(this.transSlot);
            }
         } else {
            this._setAlphaBase(restoreBase);
         }

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
   private _clipMatFrame: number = -1;
   private _clipParentUpdateFrame: number = -2;
   private _clipRectUpdateFrame: number = 0;
   private _clipRectAppliedFrame: number = -1;

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
         let matrixVersion = this.getRenderMatrixVersion();
         let clipInfo = this._currentData.clipInfo;
         let parentClipUpdateFrame = clipInfo && clipInfo !== _DefaultClipInfo ? clipInfo._updateFrame : -1;

         if (this.transSlot >= 0) {
            if (this._clipMatFrame !== matrixVersion
               || this._clipParentUpdateFrame !== parentClipUpdateFrame
               || this._clipRectAppliedFrame !== this._clipRectUpdateFrame) {
               this._clipMatFrame = matrixVersion;
               this._clipParentUpdateFrame = parentClipUpdateFrame;
               this._clipRectAppliedFrame = this._clipRectUpdateFrame;
               let mat = this.renderMatrix;
               let cm = info.clipMatrix;
               let { x, y, width, height } = rect;
               width = Math.max(width, 0.0001);
               height = Math.max(height, 0.0001);
               let tx = mat.tx, ty = mat.ty;
               let maskA = width * mat.a, maskB = width * mat.b;
               let maskC = height * mat.c, maskD = height * mat.d;
               let parentOffsetX = 0, parentOffsetY = 0;
               if (parentClipUpdateFrame !== -1) {
                  let parentClipPos = clipInfo.clipMatPos;
                  parentOffsetX = parentClipPos.z - parentClipPos.x;
                  parentOffsetY = parentClipPos.w - parentClipPos.y;
               }

               const rawClipX = x * mat.a + y * mat.c + tx;
               const rawClipY = x * mat.b + y * mat.d + ty;
               const contentTx = tx + parentOffsetX;
               const contentTy = ty + parentOffsetY;
               const maskTx = contentTx;
               const maskTy = contentTy;

               cm.a = maskA;
               cm.b = maskB;
               cm.c = maskC;
               cm.d = maskD;
               cm.tx = maskTx;
               cm.ty = maskTy;

               info.clipMatDir.setValue(maskA, maskB, maskC, maskD);
               info.clipMatPos.setValue(rawClipX, rawClipY, contentTx, contentTy);
               info.clipDepth = (parentClipUpdateFrame !== -1 ? clipInfo.clipDepth : 0) + 1;
               info.clipParent = parentClipUpdateFrame !== -1 ? clipInfo : null;

               info._updateFrame = ++_clipUpdateFrame;
            }
         }
      }

      if (this._renderDataHandler) {

         let data = this.spriteShaderData;
         // clip
         let info = this.getClipInfo();
         if (info !== _DefaultClipInfo) {
            if (this._needUploadClipOffset < info._updateFrame) {
               this._clipOffset.setValue(info.clipMatPos.z - info.clipMatPos.x, info.clipMatPos.w - info.clipMatPos.y);
               data.setVector2(ShaderDefines2D.UNIFORM_CLIPOFFSET, this._clipOffset);
               this._needUploadClipOffset = info._updateFrame;
            }

            if (!this._uniformClip) {
               this._uniformClip = true;
               data.addDefine(ShaderDefines2D.UNIFORMCLIP);
            }
         } else if (this._uniformClip) {
            data.removeDefine(ShaderDefines2D.UNIFORMCLIP);
            this._uniformClip = false;
         }

         // global alpha：按 slot 直读 store 的(隔离)worldAlpha，值变才重传 UNIFORM_VERTALPHA。
         let ga = this.globalAlpha;
         if (this._lastUploadedAlpha !== ga) {
            data.setNumber(ShaderDefines2D.UNIFORM_VERTALPHA, ga);
            this._lastUploadedAlpha = ga;
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
      this._clipRectUpdateFrame = ++_clipRectUpdateFrame;
      this._invalidateClipCache();
      rect ? this._initClipInfo() : this._clipInfo = null;
      this.updateChildren(ChildrenUpdateType.Clip);
   }

   private _invalidateClipCache(): void {
      this._clipMatFrame = -1;
      this._clipParentUpdateFrame = -2;
      this._clipRectAppliedFrame = -1;
      this._needUploadClipOffset = -1;
   }

   private _initClipInfo(): void {
      if (!this._clipInfo) {
         this._clipInfo = {
            clipMatDir: new Vector4,
            clipMatPos: new Vector4,
            clipMatrix: new Matrix,
            _updateFrame: -1,
            clipDepth: 1,
            clipParent: null
         };
      }
      else {
         this._clipInfo._updateFrame = -1;
         this._clipInfo.clipDepth = 1;
         this._clipInfo.clipParent = null;
      }
   }

   /** @zh 交给孩子的 alpha 隔离基准：cache 根→自身 slot；否则继承自身 base。 */
   private _childAlphaBase(): number {
      return this._subStruct ? this.transSlot : this._alphaBaseSlot;
   }

   /**
    * @zh 传播 alpha 隔离基准(外层 cache 根 slot)，仅结构 / cacheAs / mask 变化时调用。
    * cache 根：只更新 composite 基准，content/孩子相对自己隔离不受外层影响；普通节点：更新自身并向下传(未变剪枝)。
    */
   _setAlphaBase(outerBase: number): void {
      if (this._subStruct) {
         this._subStruct._alphaBaseSlot = outerBase;
         return;
      }
      if (this._alphaBaseSlot === outerBase) return;
      this._alphaBaseSlot = outerBase;
      for (let i = 0, n = this.children.length; i < n; i++) {
         this.children[i]._setAlphaBase(outerBase);
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
      return this._clipInfo || this._currentData.clipInfo || _DefaultClipInfo;
   }

   /** 是否存在有效裁剪（非默认值） */
   hasClip(): boolean {
      return this.getClipInfo() !== _DefaultClipInfo;
   }

   private updateChildren(type: ChildrenUpdateType): void {
      if (type == ChildrenUpdateType.None) return;
      let info: IClipInfo, blendMode: BlendMode;
      let priority: number = 0, pass: WebRender2DPass = null, enableCulling: boolean = false, dcOptimize: boolean = false;
      let globalShaderData: ShaderData = null, globalRenderData: WebGlobalRenderData = null;
      let updateBlend = false, updateClip = false, updatePass = false, updateGlobal = false, updateCulling = false, updateDcOptimize = false;

      if (type & ChildrenUpdateType.Clip) {
         info = this.getClipInfo();
         this._needUploadClipOffset = -1;
         if (this._subStruct) {
            this._subStruct._needUploadClipOffset = -1;
         }
         updateClip = true;
      }

      if (type & ChildrenUpdateType.Blend) {
         blendMode = this.blendMode;
         updateBlend = true;
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
      child._setAlphaBase(this._childAlphaBase());
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
         child._setAlphaBase(SlotConst.None);
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
      this._pass = null;
   }
}
