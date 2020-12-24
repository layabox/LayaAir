package laya.physics {
	import laya.display.Sprite;
	import laya.resource.Context;

	/**
	 * 物理辅助线，调用PhysicsDebugDraw.enable()开启，或者通过IDE设置打开
	 */
	public class PhysicsDebugDraw extends Sprite {

		/**
		 * @private 
		 */
		public var m_drawFlags:Number;

		/**
		 * @private 
		 */
		public static var box2d:*;

		/**
		 * @private 
		 */
		public static var DrawString_s_color:*;

		/**
		 * @private 
		 */
		public static var DrawStringWorld_s_p:*;

		/**
		 * @private 
		 */
		public static var DrawStringWorld_s_cc:*;

		/**
		 * @private 
		 */
		public static var DrawStringWorld_s_color:*;

		/**
		 * @private 
		 */
		public var world:*;

		/**
		 * @private 
		 */
		private var _camera:*;

		/**
		 * @private 
		 */
		private static var _canvas:*;

		/**
		 * @private 
		 */
		private static var _inited:*;

		/**
		 * @private 
		 */
		private var _mG:*;

		/**
		 * @private 
		 */
		private var _textSp:*;

		/**
		 * @private 
		 */
		private var _textG:*;

		/**
		 * @private 
		 */
		public static function init():void{}

		public function PhysicsDebugDraw(){}

		/**
		 * @private 
		 * @override 
		 */
		override public function render(ctx:Context,x:Number,y:Number):void{}

		/**
		 * @private 
		 */
		private var lineWidth:*;

		/**
		 * @private 
		 */
		private var _renderToGraphic:*;

		/**
		 * @private 
		 */
		public function SetFlags(flags:Number):void{}

		/**
		 * @private 
		 */
		public function GetFlags():Number{
			return null;
		}

		/**
		 * @private 
		 */
		public function AppendFlags(flags:Number):void{}

		/**
		 * @private 
		 */
		public function ClearFlags(flags:*):void{}

		/**
		 * @private 
		 */
		public function PushTransform(xf:*):void{}

		/**
		 * @private 
		 */
		public function PopTransform(xf:*):void{}

		/**
		 * @private 
		 */
		public function DrawPolygon(vertices:*,vertexCount:*,color:*):void{}

		/**
		 * @private 
		 */
		public function DrawSolidPolygon(vertices:*,vertexCount:*,color:*):void{}

		/**
		 * @private 
		 */
		public function DrawCircle(center:*,radius:*,color:*):void{}

		/**
		 * @private 
		 */
		public function DrawSolidCircle(center:*,radius:*,axis:*,color:*):void{}

		/**
		 * @private 
		 */
		public function DrawParticles(centers:*,radius:*,colors:*,count:*):void{}

		/**
		 * @private 
		 */
		public function DrawSegment(p1:*,p2:*,color:*):void{}

		/**
		 * @private 
		 */
		public function DrawTransform(xf:*):void{}

		/**
		 * @private 
		 */
		public function DrawPoint(p:*,size:*,color:*):void{}

		/**
		 * @private 
		 */
		public function DrawString(x:*,y:*,message:*):void{}

		/**
		 * @private 
		 */
		public function DrawStringWorld(x:*,y:*,message:*):void{}

		/**
		 * @private 
		 */
		public function DrawAABB(aabb:*,color:*):void{}

		/**
		 * @private 
		 */
		public static var I:PhysicsDebugDraw;

		/**
		 * 激活物理辅助线
		 * @param flags 位标记值，其值是AND的结果，其值有-1:显示形状，2:显示关节，4:显示AABB包围盒,8:显示broad-phase pairs,16:显示质心
		 * @return 返回一个Sprite对象，本对象用来显示物理辅助线
		 */
		public static function enable(flags:Number = null):PhysicsDebugDraw{
			return null;
		}
	}

}
