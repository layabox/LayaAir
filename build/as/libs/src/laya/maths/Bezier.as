/*[IF-FLASH]*/
package laya.maths {
	public class Bezier {
		public static var I:Bezier;
		private var _controlPoints:*;
		private var _calFun:*;
		private var _switchPoint:*;
		public function getPoint2(t:Number,rst:Array):void{}
		public function getPoint3(t:Number,rst:Array):void{}
		public function insertPoints(count:Number,rst:Array):void{}
		public function getBezierPoints(pList:Array,inSertCount:Number = null,count:Number = null):Array{}
	}

}
