/*[IF-FLASH]*/
package laya.display.cmd {
	improt laya.maths.Point;
	improt laya.resource.Context;
	improt laya.resource.Texture;
	public class FillTextureCmd {
		public static var ID:String;
		public var texture:Texture;
		public var x:Number;
		public var y:Number;
		public var width:Number;
		public var height:Number;
		public var type:String;
		public var offset:Point;
		public var other:*;
		public static function create(texture:Texture,x:Number,y:Number,width:Number,height:Number,type:String,offset:Point,other:*):FillTextureCmd{}
		public function recover():void{}
		public function run(context:Context,gx:Number,gy:Number):void{}
		public function get cmdID():String{};
	}

}
