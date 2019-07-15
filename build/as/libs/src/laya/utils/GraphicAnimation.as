/*[IF-FLASH]*/
package laya.utils {
	improt laya.display.FrameAnimation;
	improt laya.display.Graphics;
	improt laya.maths.Matrix;
	public class GraphicAnimation extends laya.display.FrameAnimation {
		public var animationList:Array;
		public var animationDic:*;
		protected var _nodeList:Array;
		protected var _nodeDefaultProps:*;
		protected var _gList:Array;
		protected var _nodeIDAniDic:*;
		protected static var _drawTextureCmd:Array;
		protected static var _temParam:Array;
		private static var _I:*;
		private static var _rootMatrix:*;
		private var _rootNode:*;
		protected var _nodeGDic:*;
		private var _parseNodeList:*;
		private var _calGraphicData:*;
		private var _createGraphicData:*;
		protected function _createFrameGraphic(frame:Number):*{}
		protected function _updateNodeGraphic(node:*,frame:Number,parentTransfrom:Matrix,g:Graphics,alpha:Number = null):void{}
		protected function _updateNoChilds(tNodeG:GraphicNode,g:Graphics):void{}
		protected function _updateNodeGraphic2(node:*,frame:Number,g:Graphics):void{}
		protected function _calculateKeyFrames(node:*):void{}
		protected function getNodeDataByID(nodeID:Number):*{}
		protected function _getParams(obj:*,params:Array,frame:Number,obj2:*):Array{}
		private var _getObjVar:*;
		protected function _getNodeGraphicData(nodeID:Number,frame:Number,rst:GraphicNode):GraphicNode{}
		private static var _tempMt:*;
		protected function _getTextureByUrl(url:String):*{}
		public function setAniData(uiView:*,aniName:String = null):void{}
		public function parseByData(aniData:*):*{}
		public function setUpAniData(uiView:*):void{}
		protected function _clear():void{}
		public static function parseAnimationByData(animationObject:*):*{}
		public static function parseAnimationData(aniData:*):*{}
	}

}
	public class GraphicNode {
		public var skin:String;
		public var transform:Matrix;
		public var resultTransform:Matrix;
		public var width:Number;
		public var height:Number;
		public var alpha:Number;
	}
