import { SubPassFlag } from "../Const";
import { EventDispatcher } from "../events/EventDispatcher";
import { LayaGL } from "../layagl/LayaGL";
import { Vector2 } from "../maths/Vector2";
import { ShaderData } from "../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { RenderTexture2D } from "../resource/RenderTexture2D";
import { Effect2DShaderInit } from "./effect2d/shader/Effect2DShaderInit";
import { PostProcess2DEffect } from "./PostProcess2DEffect";
import { CommandBuffer2D } from "./Scene2DSpecial/RenderCMD2D/CommandBuffer2D";
import { Sprite } from "./Sprite";
import { SpriteConst } from "./SpriteConst";

/**
 * @en Post-process effects for 2D rendering.
 * @zh 2D 渲染的后期处理效果。
 */
export class PostProcess2D extends EventDispatcher {

   private _effects: PostProcess2DEffect[] = [];
   private _enabled: boolean = true;
   /**@internal */
   _context: PostProcessRenderContext2D;

   /**@internal */
   static init() {
      Effect2DShaderInit.colorEffect2DShaderInit();
      Effect2DShaderInit.blurEffect2DShaderInit();
      Effect2DShaderInit.glow2DShaderInit();
   }

   get enabled(): boolean {
      return this._enabled;
   }

   set enabled(value: boolean) {
      if (this._enabled != value) {
         this._enabled = value;
         this._context.command.clear(true);
         this._onChangeRender();
      }
   }

   constructor() {
      super();
      this._context = { deferredReleaseTextures: [], OriOffset: new Vector2() } as PostProcessRenderContext2D;
      this._context.compositeShaderData = LayaGL.renderDeviceFactory.createShaderData(null);
      this._context.command = new CommandBuffer2D();
   }

   private _owner: Sprite;
   /**
    * @en The owner of the post-processing effect.
    * @zh 后期处理效果的拥有者。
    */
   get owner(): Sprite {
      return this._owner;
   }
   set owner(value: Sprite) {
      if (this._owner) {
         this._owner._renderType &= ~SpriteConst.POSTPROCESS;
      }
      this._owner = value;
      if (this._owner) {
         if (this._effects.length > 0)
            this._owner._renderType |= SpriteConst.POSTPROCESS;
      }
   }

   /**
    * @en Refresh render
    * @zh 刷新渲染
    */
   _onChangeRender() {
      // this.event(PostProcess2D.POSTRENDERCHANGE);
      if (this._owner) {
         if (this._effects.length === 0 || !this._enabled)
            this._owner._renderType &= ~SpriteConst.POSTPROCESS;
         else
            this._owner._renderType |= SpriteConst.POSTPROCESS;
         this._owner.setSubpassFlag(SubPassFlag.PostProcess);
         this._owner.repaint();
      }
   }

   /**
     * @en Get a post-processing instance based on its type.
     * @param classReg The registered post-processing class type.
     * @returns The post-processing effect instance, or null if not found.
     * @zh 根据类型获取后期处理实例。
     * @param classReg 注册的后期处理类型
     * @returns 后期处理效果实例，如果没有找到则返回null
     */
   getEffect<T extends PostProcess2DEffect>(classReg: new () => T): T {
      return this._effects.find(effect => effect instanceof classReg) as T || null;
   }

   setResource(value: RenderTexture2D) {
      this._context.source = value;
   }

   getDestRT() {
      return this._context.destination;
   }

   /**
     * @en Set the array of post-process effects.IDE main
     * @zh 设置后期处理效果数组。
     */
   get effects(): PostProcess2DEffect[] {
      return this._effects;
   }

   set effects(value: PostProcess2DEffect[]) {
      this._effects.filter(e => !value.includes(e)).forEach(effect => effect.destroy());
      this._effects.length = 0;
      for (let i = 0, n = value.length; i < n; i++) {
         if (value[i])
            this.addEffect(value[i]);
      }
      this._onChangeRender();
   }

   /**
    * @en Add a post-processing effect.
    * @param effect The post-processing effect to add.
    * @zh 添加一个后期处理效果。
    * @param effect 要添加的后期处理效果。
    */
   addEffect<T extends PostProcess2DEffect>(effect: T): T | null {
      if (effect.singleton && this.getEffect((effect as any).constructor)) {
         console.error("the target effect is a singleton", effect);
         return null;
      }
      this._effects.push(effect);
      effect.effectInit(this);
      this._onChangeRender();

      return effect;
   }

   /**
    * @en Remove a post-processing effect.
    * @param effect The post-processing effect to remove.
    * @zh 移除一个后期处理效果。
    * @param effect 要移除的后期处理效果。
    */
   removeEffect(effect: PostProcess2DEffect) {
      effect.destroy();

      let index = this._effects.indexOf(effect);
      if (index !== -1) {
         this._effects.splice(index, 1);
         this._onChangeRender();
      }
   }

   /**
    * @en Render the post-processing effects.
    * @zh 渲染后期处理效果。
    */
   _render(): void {
      this._context.command.clear(true);
      this._context.indirectTarget = this._context.source;
      this._context.destination = this._context.source;
      for (var i: number = 0, n: number = this._effects.length; i < n; i++) {
         let effect = this._effects[i];
         if (effect.active) {
            effect.render(this._context);
            this._context.indirectTarget = this._context.destination;
         }
      }
   }

   /**
    * @en Clear all post-processing effects.
    * @zh 清除所有后期处理效果。
    */
   clear() {
      this._effects.length = 0;
      this._onChangeRender();
   }

   /**
    * @en Clear the post-processing command buffer.
    * @zh 清除后期处理指令流。
    */
   clearCMD() {
      this._context.command.clear();
   }

   /**
    * @en Destroy the post-processing instance.
    * @zh 销毁后期处理实例。
    */
   destroy(): void {
      this.owner = null;
      this._context.compositeShaderData.destroy();
      this._context.compositeShaderData = null;
      this._effects.forEach(effect => effect.destroy());
      this._effects.length = 0;
   }
}

/** @ignore @blueprintIgnore */
export interface PostProcessRenderContext2D {
   /**
    * @en The original RenderTexture that is rendered to initially. Do not modify this RT.
    * @zh 原始渲染 RenderTexture (RT)，禁止改变此 RT。
    */
   source: RenderTexture2D;
   /** 
    * @en forward effect target 
    * @zh 上个后期处理的结果
    */
   indirectTarget: RenderTexture2D;
   /**
    * @en The RenderTexture where the processed result should be drawn to.
    * @zh 需要将处理后的结果画入此 RenderTexture。
    */
   destination: RenderTexture2D;//扩张的图
   /**
    * @en The composite shader data.
    * @zh 合成着色器数据。
    */
   compositeShaderData: ShaderData;
   /**
    * @en The post-processing command buffer.
    * @zh 后期处理指令流。
    */
   command: CommandBuffer2D;
   /**
    * @en Temporary texture array. You can put created textures here or select an RT to use from here to save memory.
    * @zh 临时纹理数组。可以将创建的纹理放入此数组，也可以从这里选取要用的 RT 来节省显存。
    */
   deferredReleaseTextures: RenderTexture2D[];
   /**
    * 顶点偏移值，在后处理中扩张rt的时候会累加
    */
   OriOffset: Vector2;
}