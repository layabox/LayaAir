package laya.utils {
	import laya.display.FrameAnimation;
	import laya.display.Graphics;
	import laya.maths.Matrix;

	/**
	 * Graphics动画解析器
	 * @private 
	 */
	public class GraphicAnimation extends FrameAnimation {

		/**
		 * @private 
		 */
		public var animationList:Array;

		/**
		 * @private 
		 */
		public var animationDic:*;

		/**
		 * @private 
		 */
		protected var _nodeList:Array;

		/**
		 * @private 
		 */
		protected var _nodeDefaultProps:*;

		/**
		 * @private 
		 */
		protected var _gList:Array;

		/**
		 * @private 
		 */
		protected var _nodeIDAniDic:*;

		/**
		 * @private 
		 */
		protected static var _drawTextureCmd:Array;

		/**
		 * @private 
		 */
		protected static var _temParam:Array;

		/**
		 * @private 
		 */
		private static var _I:*;

		/**
		 * @private 
		 */
		private static var _rootMatrix:*;

		/**
		 * @private 
		 */
		private var _rootNode:*;

		/**
		 * @private 
		 */
		protected var _nodeGDic:*;

		/**
		 * @private 
		 */
		private var _parseNodeList:*;

		/**
		 * @private 
		 */
		private var _calGraphicData:*;

		/**
		 * @private 
		 */
		private var _createGraphicData:*;

		/**
		 * @private 
		 */
		protected function _createFrameGraphic(frame:Number):*{}
		protected function _updateNodeGraphic(node:*,frame:Number,parentTransfrom:Matrix,g:Graphics,alpha:Number = null):void{}
		protected function _updateNoChilds(tNodeG:GraphicNode,g:Graphics):void{}
		protected function _updateNodeGraphic2(node:*,frame:Number,g:Graphics):void{}

		/**
		 * @private 
		 * @override 
		 */
		override protected function _calculateKeyFrames(node:*):void{}

		/**
		 * @private 
		 */
		protected function getNodeDataByID(nodeID:Number):*{}

		/**
		 * @private 
		 */
		protected function _getParams(obj:*,params:Array,frame:Number,obj2:*):Array{
			return null;
		}

		/**
		 * @private 
		 */
		private var _getObjVar:*;
		protected function _getNodeGraphicData(nodeID:Number,frame:Number,rst:GraphicNode):GraphicNode{
			return null;
		}
		private static var _tempMt:*;

		/**
		 * @private 
		 */
		protected function _getTextureByUrl(url:String):*{}

		/**
		 * @private 
		 */
		public function setAniData(uiView:*,aniName:String = null):void{}
		public function parseByData(aniData:*):*{}

		/**
		 * @private 
		 */
		public function setUpAniData(uiView:*):void{}

		/**
		 * @private 
		 */
		protected function _clear():void{}
		public static function parseAnimationByData(animationObject:*):*{}
		public static function parseAnimationData(aniData:*):*{}
	}

}
