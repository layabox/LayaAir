/*[IF-FLASH]*/
package laya.display.cmd {
	improt laya.resource.Context;
	public class DrawParticleCmd {
		public static var ID:String;
		private var _templ:*;
		public static function create(_temp:*):DrawParticleCmd{}
		public function recover():void{}
		public function run(context:Context,gx:Number,gy:Number):void{}
		public function get cmdID():String{};
	}

}
