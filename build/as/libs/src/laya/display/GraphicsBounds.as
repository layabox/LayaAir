/*[IF-FLASH]*/
package laya.display {
	improt laya.maths.Rectangle;
	public class GraphicsBounds {
		private static var _tempMatrix:*;
		private static var _initMatrix:*;
		private static var _tempPoints:*;
		private static var _tempMatrixArrays:*;
		private static var _tempCmds:*;
		private var _temp:*;
		private var _bounds:*;
		private var _rstBoundPoints:*;
		private var _cacheBoundsType:*;
		public function destroy():void{}
		public static function create():GraphicsBounds{}
		public function reset():void{}
		public function getBounds(realSize:Boolean = null):Rectangle{}
		public function getBoundPoints(realSize:Boolean = null):Array{}
		private var _getCmdPoints:*;
		private var _switchMatrix:*;
		private static var _addPointArrToRst:*;
		private static var _addPointToRst:*;
		private var _getPiePoints:*;
		private var _getTriAngBBXPoints:*;
		private var _getDraw9GridBBXPoints:*;
		private var _getPathPoints:*;
	}

}
