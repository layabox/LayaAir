/*[IF-FLASH]*/
package laya.display.cmd {
	improt laya.maths.Matrix;
	improt laya.resource.Context;
	public class TransformCmd {
		public static var ID:String;
		public var matrix:Matrix;
		public var pivotX:Number;
		public var pivotY:Number;
		public static function create(matrix:Matrix,pivotX:Number,pivotY:Number):TransformCmd{}
		public function recover():void{}
		public function run(context:Context,gx:Number,gy:Number):void{}
		public function get cmdID():String{};
	}

}
