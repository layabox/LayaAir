/*[IF-FLASH]*/
package laya.webgl.text {
	improt laya.webgl.text.TextTexture;
	improt laya.maths.Point;
	public class TextAtlas {
		public var texWidth:Number;
		public var texHeight:Number;
		private var atlasgrid:*;
		private var protectDist:*;
		public var texture:TextTexture;
		public var charMaps:*;
		public static var atlasGridW:Number;

		public function TextAtlas(){}
		public function setProtecteDist(d:Number):void{}
		public function getAEmpty(w:Number,h:Number,pt:Point):Boolean{}
		public function get usedRate():Number{};
		public function destroy():void{}
		public function printDebugInfo():void{}
	}

}
