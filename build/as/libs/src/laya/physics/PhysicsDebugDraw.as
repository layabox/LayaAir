/*[IF-FLASH]*/
package laya.physics {
	improt laya.display.Sprite;
	improt laya.resource.Context;
	public class PhysicsDebugDraw extends laya.display.Sprite {
		public var m_drawFlags:Number;
		public static var box2d:*;
		public static var DrawString_s_color:*;
		public static var DrawStringWorld_s_p:*;
		public static var DrawStringWorld_s_cc:*;
		public static var DrawStringWorld_s_color:*;
		public var world:*;
		private var _camera:*;
		private static var _canvas:*;
		private static var _inited:*;
		private var _mG:*;
		private var _textSp:*;
		private var _textG:*;
		public static function init():void{}

		public function PhysicsDebugDraw(){}
		public function render(ctx:Context,x:Number,y:Number):void{}
		private var lineWidth:*;
		private var _renderToGraphic:*;
		public function SetFlags(flags:Number):void{}
		public function GetFlags():Number{}
		public function AppendFlags(flags:Number):void{}
		public function ClearFlags(flags:*):void{}
		public function PushTransform(xf:*):void{}
		public function PopTransform(xf:*):void{}
		public function DrawPolygon(vertices:*,vertexCount:*,color:*):void{}
		public function DrawSolidPolygon(vertices:*,vertexCount:*,color:*):void{}
		public function DrawCircle(center:*,radius:*,color:*):void{}
		public function DrawSolidCircle(center:*,radius:*,axis:*,color:*):void{}
		public function DrawParticles(centers:*,radius:*,colors:*,count:*):void{}
		public function DrawSegment(p1:*,p2:*,color:*):void{}
		public function DrawTransform(xf:*):void{}
		public function DrawPoint(p:*,size:*,color:*):void{}
		public function DrawString(x:*,y:*,message:*):void{}
		public function DrawStringWorld(x:*,y:*,message:*):void{}
		public function DrawAABB(aabb:*,color:*):void{}
		public static var I:PhysicsDebugDraw;
		public static function enable(flags:Number = null):PhysicsDebugDraw{}
	}

}
