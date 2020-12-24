package laya.webgl.text {

	/**
	 * TODO如果占用内存较大,这个结构有很多成员可以临时计算
	 */
	public class CharRenderInfo {
		public var char:String;
		public var tex:*;
		public var deleted:Boolean;
		public var uv:Array;
		public var pos:Number;
		public var width:Number;
		public var height:Number;
		public var bmpWidth:Number;
		public var bmpHeight:Number;
		public var orix:Number;
		public var oriy:Number;
		public var touchTick:Number;
		public var isSpace:Boolean;
		public function touch():void{}
	}

}
