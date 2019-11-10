package laya.webgl.text {
	import laya.webgl.text.TextTexture;
	import laya.maths.Point;

	/**
	 * 文字贴图的大图集。
	 */
	public class TextAtlas {
		public var texWidth:Number;
		public var texHeight:Number;
		private var atlasgrid:*;
		public var texture:TextTexture;
		public var charMaps:*;
		public static var atlasGridW:Number;

		public function TextAtlas(){}
		public function setProtecteDist(d:Number):void{}

		/**
		 * 如果返回null，则表示无法加入了
		 * 分配的时候优先选择最接近自己高度的节点
		 * @param w 
		 * @param h 
		 * @return 
		 */
		public function getAEmpty(w:Number,h:Number,pt:Point):Boolean{
			return null;
		}

		/**
		 * 大图集格子单元的占用率，老的也算上了。只是表示这个大图集还能插入多少东西。
		 */
		public function get usedRate():Number{
				return null;
		}
		public function destroy():void{}
		public function printDebugInfo():void{}
	}

}
