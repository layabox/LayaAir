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
import { Stat } from "../../../../utils/Stat";
import { Sprite } from "../../../../display/Sprite";


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

   private _renderLayerMask: number;
   get renderLayerMask(): number {
      return this._renderLayerMask;
   }
   set renderLayerMask(value: number) {
      this._renderLayerMask = value;
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

   owner: Sprite;

   globalAlpha: number = 1.0;

   private _dcOptimize: boolean = false;
   public get dcOptimize(): boolean {
      return this._dcOptimize;
   }
   public set dcOptimize(value: boolean) {
      this._dcOptimize = value;
      this._nativeObj.setDcOptimize(value);
   }

   public get inheritedDcOptimize(): boolean {
      if (this._nativeObj.getInheritedDcOptimize) {
         return this._nativeObj.getInheritedDcOptimize();
      }
      return this._dcOptimize || this._parent?.dcOptimize;
   }

   private _zIndex: number = 0;
   set zIndex(value: number) {
      this._zIndex = value;
      this._nativeObj.zIndex = value;
   }
   get zIndex(): number {
      return this._zIndex;
   }

   private _stackingRoot: boolean = false;
   set stackingRoot(value: boolean) {
      this._stackingRoot = value;
      this._nativeObj.stackingRoot = value;
   }
   get stackingRoot(): boolean {
      return this._stackingRoot;
   }
   get enableCulling(): boolean {
      return this._nativeObj.getEnableCulling();
   }
   set enableCulling(value: boolean) {
      this._nativeObj.setEnableCulling(value);
   }

   get inheritedEnableCulling(): boolean {
      return this._nativeObj.getInheritedEnableCulling();
   }

   private _rect: Rectangle = new Rectangle(0, 0, 0, 0);
   set rect(value: Rectangle) {
      value.cloneTo(this._rect);
      this._nativeObj.rect = value;
   }
   get rect(): Rectangle {
      return this._rect;
   }

   private _renderLayer: number = 1;
   set renderLayer(value: number) {
      this._renderLayer = value;
      this._nativeObj.renderLayer = value;
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
      this._nativeObj.renderType = value;
   }
   get renderType(): number {
      return this._renderType;
   }

   private _renderUpdateMask: number;
   set renderUpdateMask(value: number) {
      this._renderUpdateMask = value;
      this._nativeObj.renderUpdateMask = value;
   }
   get renderUpdateMask(): number {
      return this._renderUpdateMask;
   }

   private _renderMatrix: Matrix = new Matrix();
   set renderMatrix(value: Matrix) {
      value.cloneTo(this._renderMatrix);
      this._nativeObj.setRenderMatrix(value, Stat.loopCount);
   }
   get renderMatrix(): Matrix {
      return this._renderMatrix;
   }

   private _alpha: number;
   public get alpha(): number {
      return this._alpha;
   }

   public set alpha(value: number) {
      this._alpha = value;
      this._nativeObj.alpha = value;
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
      this._nativeObj.blendMode = this._blendMode;
   }

   private _enabled: boolean = true;
   public get enabled(): boolean {
      return this._enabled;
   }

   public set enabled(value: boolean) {
      this._enabled = value;
      this._nativeObj.enable = value;
   }

   private _isRenderStruct: boolean;
   public get isRenderStruct(): boolean {
      return this._isRenderStruct;
   }
   public set isRenderStruct(value: boolean) {
      this._isRenderStruct = value;
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

   public get pass(): RTRender2DPass {
      return this._pass || this._parent?.pass;
   }

   public set pass(value: RTRender2DPass) {
      this._pass = value;
      this._nativeObj.setPass(value ? value._nativeObj : null);
   }

   constructor() {
      this._nativeObj = new (window as any).conchRTRenderStruct2D();
      this.zIndex = 0;
      this.rect = new Rectangle(0, 0, 0, 0);
      this.renderLayer = 1;
      this.renderType = -1;
      this.renderUpdateMask = 0;
      this.globalAlpha = 1.0;
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
      this._nativeObj.setClipRect(rect);
   }

   setRepaint(): void {
      this._nativeObj.setRepaint();
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