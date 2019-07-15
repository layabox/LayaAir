/*[IF-FLASH]*/
package laya.utils {
	public class VectorGraphManager {
		public static var instance:VectorGraphManager;
		public var useDic:*;
		public var shapeDic:*;
		public var shapeLineDic:*;
		private var _id:*;
		private var _checkKey:*;
		private var _freeIdArray:*;

		public function VectorGraphManager(){}
		public static function getInstance():VectorGraphManager{}
		public function getId():Number{}
		public function addShape(id:Number,shape:*):void{}
		public function addLine(id:Number,Line:*):void{}
		public function getShape(id:Number):void{}
		public function deleteShape(id:Number):void{}
		public function getCacheList():Array{}
		public function startDispose(key:Boolean):void{}
		public function endDispose():void{}
	}

}
