/*[IF-FLASH]*/
package laya.d3.core.render {
	improt laya.d3.core.render.PostProcessEffect;
	improt laya.d3.core.render.PostProcessRenderContext;
	improt laya.d3.math.Color;
	improt laya.resource.Texture2D;
	public class BloomEffect extends laya.d3.core.render.PostProcessEffect {
		public var clamp:Number;
		public var color:Color;
		public var fastMode:Boolean;
		public var dirtTexture:Texture2D;
		public var intensity:Number;
		public var threshold:Number;
		public var softKnee:Number;
		public var diffusion:Number;
		public var anamorphicRatio:Number;
		public var dirtIntensity:Number;

		public function BloomEffect(){}
		public function render(context:PostProcessRenderContext):void{}
	}

}
