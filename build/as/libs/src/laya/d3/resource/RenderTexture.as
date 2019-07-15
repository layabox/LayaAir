/*[IF-FLASH]*/
package laya.d3.resource {
	improt laya.resource.BaseTexture;
	public class RenderTexture extends laya.resource.BaseTexture {
		public static function get currentActive():RenderTexture{};
		public static function createFromPool(width:Number,height:Number,format:Number = null,depthStencilFormat:Number = null,filterMode:Number = null):RenderTexture{}
		public static function recoverToPool(renderTexture:RenderTexture):void{}
		public function get depthStencilFormat():Number{};
		public function get defaulteTexture():BaseTexture{};

		public function RenderTexture(width:Number,height:Number,format:Number = null,depthStencilFormat:Number = null){}
		public function getData(x:Number,y:Number,width:Number,height:Number,out:Uint8Array):Uint8Array{}
		protected function _disposeResource():void{}
	}

}
