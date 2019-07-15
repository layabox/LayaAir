/*[IF-FLASH]*/
package laya.d3.component {
	improt laya.d3.core.render.PostProcessEffect;
	public class PostProcess {
		private var _compositeShader:*;
		private var _compositeShaderData:*;
		private var _effects:*;

		public function PostProcess(){}
		public function addEffect(effect:PostProcessEffect):void{}
		public function removeEffect(effect:PostProcessEffect):void{}
	}

}
