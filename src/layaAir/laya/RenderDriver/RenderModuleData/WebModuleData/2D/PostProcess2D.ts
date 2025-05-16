import { SUBPASSFLAG } from "../../../../Const";
import { CommandBuffer2D } from "../../../../display/Scene2DSpecial/RenderCMD2D/CommandBuffer2D";
import { Sprite } from "../../../../display/Sprite";
import { EventDispatcher } from "../../../../events/EventDispatcher";
import { LayaGL } from "../../../../layagl/LayaGL";
import { Vector2 } from "../../../../maths/Vector2";
import { RenderTexture2D } from "../../../../resource/RenderTexture2D";
import { ShaderData } from "../../../DriverDesign/RenderDevice/ShaderData";
import { IRenderStruct2D } from "../../Design/2D/IRenderStruct2D";
import { Effect2DShaderInit } from "./Effect2D/Shader/Effect2DShaderInit";
import { PostProcess2DEffect } from "./PostProcess2DEffect";

export class PostProcess2D extends EventDispatcher {
   static POSTRENDERCHANGE: string = "post_render_change";//渲染改动
   static POSTCMDCHANGE: string = "post_cmd_change";
   /**@internal */
   _effects: PostProcess2DEffect[] = [];
   /**@internal */
   _enabled: boolean = true;
   /**@internal */
   _context: PostProcessRenderContext2D;
   /**@internal */
   private _compositeShaderData: ShaderData = LayaGL.renderDeviceFactory.createShaderData(null);

   static init() {
      Effect2DShaderInit.colorEffect2DShaderInit();
      Effect2DShaderInit.blurEffect2DShaderInit();
      Effect2DShaderInit.glow2DShaderInit();
   }

   get enabled(): boolean {
      return this._enabled;
   }

   set enabled(value: boolean) {
      this._enabled = value;
   }

   constructor(sprite: Sprite) {
      super();
      this._context = new PostProcessRenderContext2D();
      this._context.compositeShaderData = this._compositeShaderData;
      this._context.command = new CommandBuffer2D();
      this.on(PostProcess2D.POSTCMDCHANGE, sprite, sprite.setSubpassFlag, [SUBPASSFLAG.PostProcess]);
   }

   _onChangeRender() {
      //this.event(PostProcess2D.POSTRENDERCHANGE);//TODO
      this.event(PostProcess2D.POSTCMDCHANGE);//TODO
   }

   _onChangeRenderCmd() {
      this.event(PostProcess2D.POSTCMDCHANGE);
   }

   /**
     * @en Get a post-processing instance based on its type.
     * @param classReg The registered post-processing class type.
     * @returns The post-processing effect instance, or null if not found.
     * @zh 根据类型获取后期处理实例。
     * @param classReg 注册的后期处理类型
     * @returns 后期处理效果实例，如果没有找到则返回null
     */
   private getEffect(classReg: any): any {
      let size: number = this._effects.length;
      for (let i = 0; i < size; i++) {
         let element = this._effects[i];
         if (element instanceof classReg) {
            return element;
         }
      }
      return null
   }

   setResource(value: RenderTexture2D) {
      this._context.source = value;
   }

   getDestRT() {
      return this._context.destination;
   }

   addEffect(effect: PostProcess2DEffect) {
      if (effect.singleton && this.getEffect((effect as any).constructor)) {
         console.error("无法增加已经存在的Effect");
         return;
      }
      this._effects.push(effect);
      effect.effectInit(this);
   }

   render(): void {
      this._context.command.clear(true);
      this._context.indirectTarget = this._context.source;
      for (var i: number = 0, n: number = this._effects.length; i < n; i++) {
         let effect = this._effects[i];
         if (effect.active) {
            effect.render(this._context);
            this._context.indirectTarget = this._context.destination;
         }
      }
   }

   clear() {
      this._effects.length = 0;
   }

   clearCMD() {
      this._context.command.clear();
   }

   destroy(): void {
      this._context.compositeShaderData.destroy();
      this._context.compositeShaderData = null;
      //todo
      this._effects.length = 0;
   }
}

export class PostProcessRenderContext2D {
   /**
    * @en The original RenderTexture that is rendered to initially. Do not modify this RT.
    * @zh 原始渲染 RenderTexture (RT)，禁止改变此 RT。
    */
   source: RenderTexture2D | null = null;
   /** 
    * @en forward effect target 
    * @zh 上个后期处理的结果
    */
   indirectTarget: RenderTexture2D | null = null;
   /**
    * @en The RenderTexture where the processed result should be drawn to.
    * @zh 需要将处理后的结果画入此 RenderTexture。
    */
   destination: RenderTexture2D | null = null;//扩张的图
   /**
    * @en The composite shader data.
    * @zh 合成着色器数据。
    */
   compositeShaderData: ShaderData | null = null;
   /**
    * @en The post-processing command buffer.
    * @zh 后期处理指令流。
    */
   command: CommandBuffer2D | null = null;
   /**
    * @en Temporary texture array. You can put created textures here or select an RT to use from here to save memory.
    * @zh 临时纹理数组。可以将创建的纹理放入此数组，也可以从这里选取要用的 RT 来节省显存。
    */
   deferredReleaseTextures: RenderTexture2D[] = [];
   /**
    * 顶点偏移值，在后处理中扩张rt的时候会累加
    */
   OriOffset: Vector2 = new Vector2();
}