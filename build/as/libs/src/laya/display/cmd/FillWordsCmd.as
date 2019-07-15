/*[IF-FLASH]*/
package laya.display.cmd {
	improt laya.resource.Context;
	public class FillWordsCmd {
		public static var ID:String;
		public var words:Array;
		public var x:Number;
		public var y:Number;
		public var font:String;
		public var color:String;
		public static function create(words:Array,x:Number,y:Number,font:String,color:String):FillWordsCmd{}
		public function recover():void{}
		public function run(context:Context,gx:Number,gy:Number):void{}
		public function get cmdID():String{};
	}

}
