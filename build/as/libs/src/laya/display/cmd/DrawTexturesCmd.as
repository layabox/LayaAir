/*[IF-FLASH]*/
package laya.display.cmd {
	improt laya.resource.Context;
	improt laya.resource.Texture;
	public class DrawTexturesCmd {
		public static var ID:String;
		public var texture:Texture;
		public var pos:Array;
		public static function create(texture:Texture,pos:Array):DrawTexturesCmd{}
		public function recover():void{}
		public function run(context:Context,gx:Number,gy:Number):void{}
		public function get cmdID():String{};
	}

}
