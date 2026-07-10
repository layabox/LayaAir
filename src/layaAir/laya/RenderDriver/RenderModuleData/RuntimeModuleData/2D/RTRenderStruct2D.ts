import { IRenderContext2D } from "../../../DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderStruct2D } from "../../Design/2D/IRenderStruct2D";
import { Rectangle } from "../../../../maths/Rectangle";
import { Matrix } from "../../../../maths/Matrix";
import { Vector4 } from "../../../../maths/Vector4";
import { BlendMode } from "../../../../webgl/canvas/BlendMode";
import { I2DGlobalRenderData } from "../../Design/2D/IRender2DDataHandle";
import { GLESShaderData } from "../../../OpenGLESDriver/RenderDevice/GLESShaderData";
import { RTRender2DPass } from "./RTRender2DPass";
import { GLESRenderElement2D } from "../../../OpenGLESDriver/2DRenderPass/GLESRenderElement2D";
import { IRenderElement2D } from "../../../DriverDesign/2DRenderPass/IRenderElement2D";
import { RTRender2DDataHandle } from "./RTRenderDataHandle";
import { Sprite } from "../../../../display/Sprite";
import { Transform2DStore } from "../../../../display/transform2d/Transform2DStore";

/** @internal conchRTGlobalRenderData 共享块槽位（与 C++ RTGlobalRenderData::Props 一致）。 */
const enum RTGlobalRenderDataSlot {
   cullRectX = 0,
   cullRectY = 1,
   cullRectZ = 2,
   cullRectW = 3,
   renderLayerMask = 4,
   Count = 5,
}

/** @internal conchRTRenderStruct2D 共享块槽位（与 C++ RTRenderStruct2D::Props 一致）。
 *  [0..11] JS 写 / C++ 读（[2]renderType 双写：spine 也写）；[12..15] C++ 写镜像 / JS 读。 */
const enum RTRenderStruct2DSlot {
   zIndex = 0,
   renderLayer = 1,
   renderType = 2,
   renderUpdateMask = 3,
   enable = 4,
   isRenderStruct = 5,
   manualRender = 6,
   stackingRoot = 7,
   rectX = 8,
   rectY = 9,
   rectW = 10,
   rectH = 11,
   ownEnableCulling = 12,
   inheritedEnableCulling = 13,
   inheritedDcOptimize = 14,
   alphaBaseSlot = 15,
   Count = 16,
}

const _wm6 = new Float32Array(6);

export class RTGlobalRenderData implements I2DGlobalRenderData {
   _nativeObj: any;

   // TS-owned 5-slot block: [0..3]f32 cullRect xyzw, [4]i32 renderLayerMask. C++ lazily reads it.
   private _buf: ArrayBuffer;
   private _f32: Float32Array;
   private _i32: Int32Array;

   constructor() {
      this._nativeObj = new (window as any).conchRTGlobalRenderData();
      this._buf = new ArrayBuffer(RTGlobalRenderDataSlot.Count * 4);
      this._f32 = new Float32Array(this._buf);
      this._i32 = new Int32Array(this._buf);
      this._i32[RTGlobalRenderDataSlot.renderLayerMask] = -1; // default = all
      this._nativeObj.bindPropertyBuffer(this._buf);
   }

   private _cullRect: Vector4;
   get cullRect(): Vector4 {
      return this._cullRect;
   }
   set cullRect(value: Vector4) {
      this._cullRect = value;
      this._f32[RTGlobalRenderDataSlot.cullRectX] = value.x;
      this._f32[RTGlobalRenderDataSlot.cullRectY] = value.y;
      this._f32[RTGlobalRenderDataSlot.cullRectZ] = value.z;
      this._f32[RTGlobalRenderDataSlot.cullRectW] = value.w;
   }

   get renderLayerMask(): number {
      return this._i32[RTGlobalRenderDataSlot.renderLayerMask];
   }
   set renderLayerMask(value: number) {
      this._i32[RTGlobalRenderDataSlot.renderLayerMask] = value;
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

   owner: Sprite;

   // TS-owned 15-slot property block (see RTRenderStruct2DSlot). C++ reads it directly via a struct
   // overlay (no flush-back). Slots [12..14] are the culling mirror written by C++ for JS to read.
   private _buf: ArrayBuffer;
   private _i32: Int32Array;
   private _f32: Float32Array;

   /** 手动渲染模式：子节点不参与父 pass 的自动遍历和渲染 */
   private _manualRender: boolean = false;
   get manualRender(): boolean {
      return this._manualRender;
   }
   set manualRender(value: boolean) {
      this._manualRender = value;
      this._i32[RTRenderStruct2DSlot.manualRender] = value ? 1 : 0;
   }

   /**
    * @zh 全局(级联) alpha：与 Web 完全对称，按 slot 直读共享 Transform2DStore(免 FFI)。
    * base(alpha 隔离基准) 由 C++ 写进共享块的 alphaBaseSlot 镜像；mask 合成分支与 Web 一致(以 SoA 父为 base)。
    */
   public get globalAlpha(): number {
      const slot = this._transSlot;
      if (slot < 0) return 1; // 无 SoA 节点的临时 struct 兜底
      const store = Transform2DStore.instance;
      let base = this._i32[RTRenderStruct2DSlot.alphaBaseSlot];
      if (this._blendMode === BlendMode.mask && this.owner && this.owner._maskParent) {
         base = store.getParent(slot);
      }
      if (base < 0)
         return store.dirtyA ? store.computeWorldAlpha(slot) : store.getWorldAlpha(slot);
      return store.getRelativeWorldAlpha(slot, base, store.dirtyA);
   }

   private _clipRect: Rectangle = new Rectangle(0, 0, 0, 0);

   private _dcOptimize: boolean = false;
   public get dcOptimize(): boolean {
      return this._dcOptimize;
   }
   public set dcOptimize(value: boolean) {
      this._dcOptimize = value;
      this._nativeObj.setDcOptimize(value);
   }

   public get inheritedDcOptimize(): boolean {
      // C++ writes the propagated value into the shared block; read it directly (no FFI).
      return this._i32[RTRenderStruct2DSlot.inheritedDcOptimize] !== 0;
   }

   private _zIndex: number = 0;
   set zIndex(value: number) {
      this._zIndex = value;
      this._i32[RTRenderStruct2DSlot.zIndex] = value;
   }
   get zIndex(): number {
      return this._zIndex;
   }

   private _stackingRoot: boolean = false;
   set stackingRoot(value: boolean) {
      this._stackingRoot = value;
      this._i32[RTRenderStruct2DSlot.stackingRoot] = value ? 1 : 0;
   }
   get stackingRoot(): boolean {
      return this._stackingRoot;
   }
   get enableCulling(): boolean {
      // C++ mirrors _enableCulling into the shared block; read it directly (no FFI).
      return this._i32[RTRenderStruct2DSlot.ownEnableCulling] !== 0;
   }
   set enableCulling(value: boolean) {
      this._nativeObj.setEnableCulling(value);
   }

   get inheritedEnableCulling(): boolean {
      // C++ writes the propagated value into the shared block; read it directly (no FFI).
      return this._i32[RTRenderStruct2DSlot.inheritedEnableCulling] !== 0;
   }

   private _rect: Rectangle = new Rectangle(0, 0, 0, 0);
   set rect(value: Rectangle) {
      value.cloneTo(this._rect);
      this._f32[RTRenderStruct2DSlot.rectX] = value.x;
      this._f32[RTRenderStruct2DSlot.rectY] = value.y;
      this._f32[RTRenderStruct2DSlot.rectW] = value.width;
      this._f32[RTRenderStruct2DSlot.rectH] = value.height;
   }
   get rect(): Rectangle {
      return this._rect;
   }

   private _renderLayer: number = 1;
   set renderLayer(value: number) {
      this._renderLayer = value;
      this._i32[RTRenderStruct2DSlot.renderLayer] = value;
   }
   get renderLayer(): number {
      return this._renderLayer;
   }

   private _subStruct: RTRenderStruct2D;

   public get subStruct(): RTRenderStruct2D {
      return this._subStruct;
   }

   public set subStruct(value: RTRenderStruct2D) {
      if (value) {
         value._parent = this._parent;
         value._blendMode = this._blendMode;
      }

      this._subStruct = value;
      this._nativeObj.setSubStruct(value ? value._nativeObj : null);
   }

   private _parent: RTRenderStruct2D = null;
   set parent(value: RTRenderStruct2D) {
      this._parent = value;
      if (this._subStruct) {
         this._subStruct._parent = value;
      }
      this._nativeObj.setParent(value ? (value as unknown as RTRenderStruct2D)._nativeObj : null);
   }
   get parent(): RTRenderStruct2D | null {
      return this._parent;
   }
   private _children: RTRenderStruct2D[] = [];
   public get children(): RTRenderStruct2D[] {
      return this._children;
   }
   public set children(value: RTRenderStruct2D[]) {
      this._children = value;
      let nativeArray = [];
      for (var i = 0; i < value.length; i++) {
         nativeArray.push(value[i]._nativeObj);
      }
      this._nativeObj.setChildren(nativeArray);
   }

   private _renderType: number = -1;
   set renderType(value: number) {
      this._renderType = value;
      this._i32[RTRenderStruct2DSlot.renderType] = value;
   }
   get renderType(): number {
      return this._renderType;
   }

   private _renderUpdateMask: number;
   set renderUpdateMask(value: number) {
      this._renderUpdateMask = value;
      this._i32[RTRenderStruct2DSlot.renderUpdateMask] = value;
   }
   get renderUpdateMask(): number {
      return this._renderUpdateMask;
   }

   /** @zh Transform2DStore slot；下推 native，渲染结构据此按 slot 直读 world/alpha。 */
   private _transSlot: number = -1;
   get transSlot(): number {
      return this._transSlot;
   }
   set transSlot(value: number) {
      this._transSlot = value;
      this._nativeObj.setTransSlot(value);
   }

   private _renderMatrix: Matrix = new Matrix();
   private _rmFrame: number = -1;
   set renderMatrix(value: Matrix) {
   }
   get renderMatrix(): Matrix {
      if (this._transSlot >= 0) {
         const store = Transform2DStore.instance;
         if (store.dirtyM) {
            store.computeWorldMatrix(this._transSlot, _wm6);
            this._rmFrame = -1;
         } else {
            const matFrame = store.getMatrixFrame(this._transSlot);
            if (this._rmFrame === matFrame)
               return this._renderMatrix;
            this._rmFrame = matFrame;
            store.readWorldMatrix(this._transSlot, _wm6);
         }
         const m = this._renderMatrix;
         m.a = _wm6[0]; m.b = _wm6[1]; m.c = _wm6[2]; m.d = _wm6[3]; m.tx = _wm6[4]; m.ty = _wm6[5];
         m._checkTransform();
      }
      return this._renderMatrix;
   }

   private _alpha: number;
   public get alpha(): number {
      return this._alpha;
   }

   public set alpha(value: number) {
      this._alpha = value;
      this._nativeObj.setAlpha(value);
   }

   private _blendMode: BlendMode;
   public get blendMode(): BlendMode {
      if (this._subStruct && this._subStruct.enabled) {
         return BlendMode.normal;
      }
      return this._blendMode || this._parent?.blendMode || BlendMode.normal;
   }

   public set blendMode(value: BlendMode) {
      if (this._subStruct && this._subStruct.enabled) {
         this._subStruct._blendMode = value;
      }
      this._blendMode = value;
      this._nativeObj.rt_setBlendMode(this._blendMode);
   }

   private _enabled: boolean = true;
   public get enabled(): boolean {
      return this._enabled;
   }

   public set enabled(value: boolean) {
      this._enabled = value;
      this._i32[RTRenderStruct2DSlot.enable] = value ? 1 : 0;
   }

   private _isRenderStruct: boolean;
   public get isRenderStruct(): boolean {
      return this._isRenderStruct;
   }
   public set isRenderStruct(value: boolean) {
      this._isRenderStruct = value;
      this._i32[RTRenderStruct2DSlot.isRenderStruct] = value ? 1 : 0;
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

   public get pass(): RTRender2DPass {
      return this._pass || this._parent?.pass;
   }

   public set pass(value: RTRender2DPass) {
      this._pass = value;
      this._nativeObj.setPass(value ? value._nativeObj : null);
   }

   constructor() {
      this._nativeObj = new (window as any).conchRTRenderStruct2D();
      // Allocate + bind the property block before any slot is written below.
      this._buf = new ArrayBuffer(RTRenderStruct2DSlot.Count * 4);
      this._i32 = new Int32Array(this._buf);
      this._f32 = new Float32Array(this._buf);
      this._nativeObj.bindPropertyBuffer(this._buf);
      this.zIndex = 0;
      this.rect = new Rectangle(0, 0, 0, 0);
      this.renderLayer = 1;
      this.renderType = -1;
      this.renderUpdateMask = 0;
      this.alpha = 1.0;
      this.blendMode = BlendMode.invalid;
      this.enabled = true;
      this.isRenderStruct = false;
   }

   setRenderUpdateCallback(func: Function): void {
      if (func)
         this._nativeObj.setRenderUpdate(func);
      else
         this._nativeObj.setRenderUpdate(null);
   }

   setClipRect(rect: Rectangle): void {
      if (rect) {
         rect.cloneTo(this._clipRect);
         this._clipRect.width = Math.max(this._clipRect.width, 0.0001);
         this._clipRect.height = Math.max(this._clipRect.height, 0.0001);
         this._nativeObj.setClipRect(this._clipRect);
      } else {
         this._nativeObj.setClipRect(null);
      }
   }

   setRepaint(): void {
      this.pass && (this.pass.repaint = true);
      // this._nativeObj.setRepaint();
   }

   addChild(child: RTRenderStruct2D, index: number) {
      child.parent = this;
      this._children.splice(index, 0, child);

      this._nativeObj.addChild((child as unknown as RTRenderStruct2D)._nativeObj, index);
      return;
   }

   updateChildIndex(child: RTRenderStruct2D, oldIndex: number, index: number): void {
      if (oldIndex === index)
         return;

      this.children.splice(oldIndex, 1);
      if (index >= this.children.length) {
         this.children.push(child);
      } else {
         this.children.splice(index, 0, child);
      }
      this._nativeObj.updateChildIndex(child._nativeObj, oldIndex, index);
   }

   removeChild(child: RTRenderStruct2D): void {
      const index = this.children.indexOf(child);
      if (index !== -1) {
         child.parent = null;
         this.children.splice(index, 1);
         this._nativeObj.removeChild(child._nativeObj);
      }
   }

   // renderUpdate(context: GLESRenderContext2D): void {
   //    this._nativeObj.renderUpdate(context);
   // }

   destroy(): void {
      this._nativeObj.destroy();

      this._renderElements.length = 0;
      this._renderElements = null;
      this._spriteShaderData = null;
      this._parent = null;
      this._children.length = 0;
      this._children = null;
      this._pass = null;
   }
}
