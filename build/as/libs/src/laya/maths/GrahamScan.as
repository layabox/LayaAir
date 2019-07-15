/*[IF-FLASH]*/
package laya.maths {
	improt laya.maths.Point;
	public class GrahamScan {
		private static var _mPointList:*;
		private static var _tempPointList:*;
		private static var _temPList:*;
		private static var _temArr:*;
		public static function multiply(p1:Point,p2:Point,p0:Point):Number{}
		public static function dis(p1:Point,p2:Point):Number{}
		private static var _getPoints:*;
		public static function getFrom(rst:Array,src:Array,count:Number):Array{}
		public static function getFromR(rst:Array,src:Array,count:Number):Array{}
		public static function pListToPointList(pList:Array,tempUse:Boolean = null):Array{}
		public static function pointListToPlist(pointList:Array):Array{}
		public static function scanPList(pList:Array):Array{}
		public static function scan(PointSet:Array):Array{}
	}

}
