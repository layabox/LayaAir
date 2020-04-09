package laya.d3.core.particleShuriKen.module.shape {
	import laya.d3.math.Rand;
	import laya.d3.math.Vector2;
	import laya.d3.math.Vector3;

	/**
	 * ...
	 * @author ...
	 */
	public class ShapeUtils {
		public static function _randomPointUnitArcCircle(arc:Number,out:Vector2,rand:Rand = null):void{}
		public static function _randomPointInsideUnitArcCircle(arc:Number,out:Vector2,rand:Rand = null):void{}
		public static function _randomPointUnitCircle(out:Vector2,rand:Rand = null):void{}
		public static function _randomPointInsideUnitCircle(out:Vector2,rand:Rand = null):void{}
		public static function _randomPointUnitSphere(out:Vector3,rand:Rand = null):void{}
		public static function _randomPointInsideUnitSphere(out:Vector3,rand:Rand = null):void{}
		public static function _randomPointInsideHalfUnitBox(out:Vector3,rand:Rand = null):void{}

		public function ShapeUtils(){}
	}

}
