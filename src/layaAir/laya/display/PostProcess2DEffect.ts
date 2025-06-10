import { Color } from "../maths/Color";
import { PostProcess2D, PostProcessRenderContext2D } from "./PostProcess2D";

export abstract class PostProcess2DEffect {
   static nullColor = new Color(0, 0, 0, 0);
   protected _active: boolean = true;
   protected _owner: PostProcess2D;

   protected _singleton: boolean = false;

   /**
    * @internal
    * @en Whether only one instance of the effect can be added.
    * @zh 是否只能添加一个效果实例。
    */
   get singleton() {
      return this._singleton;
   }
   set singleton(value: boolean) {
      this._singleton = value;
   }

   /**
    * @en Whether the effect is enabled.
    * @zh 效果是否开启。
    */
   get active() {
      return this._active;
   }

   set active(value: boolean) {
      this._active = value;
   }

   /**
    * @en Called when added to the post-processing stack.
    * @param postprocess The post-processing component.
    * @zh 在添加到后期处理栈时调用。
    * @param postprocess 后期处理组件。
    */
   abstract effectInit(postprocess: PostProcess2D): void;

   /**
    * @en Renders the effect.
    * @param context The post-processing rendering context.
    * @zh 渲染效果。
    * @param context 后期处理渲染上下文。
    */
   abstract render(context: PostProcessRenderContext2D): void;

   /**
    * @en Destroys the effect.
    * @zh 销毁效果。
    */
   abstract destroy(): void;
}