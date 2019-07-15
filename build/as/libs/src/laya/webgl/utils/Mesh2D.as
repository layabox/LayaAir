/*[IF-FLASH]*/
package laya.webgl.utils {
	improt laya.webgl.utils.VertexBuffer2D;
	improt laya.webgl.utils.IndexBuffer2D;
	public class Mesh2D {
		public var _stride:Number;
		public var vertNum:Number;
		public var indexNum:Number;
		protected var _applied:Boolean;
		public var _vb:VertexBuffer2D;
		public var _ib:IndexBuffer2D;
		private var _vao:*;
		private static var _gvaoid:*;
		private var _attribInfo:*;
		protected var _quadNum:Number;
		public var canReuse:Boolean;

		public function Mesh2D(stride:Number,vballoc:Number,iballoc:Number){}
		public function cloneWithNewVB():Mesh2D{}
		public function cloneWithNewVBIB():Mesh2D{}
		public function getVBW():VertexBuffer2D{}
		public function getVBR():VertexBuffer2D{}
		public function getIBR():IndexBuffer2D{}
		public function getIBW():IndexBuffer2D{}
		public function createQuadIB(QuadNum:Number):void{}
		public function setAttributes(attribs:Array):void{}
		private var configVAO:*;
		public function useMesh(gl:WebGLRenderingContext):void{}
		public function getEleNum():Number{}
		public function releaseMesh():void{}
		public function destroy():void{}
		public function clearVB():void{}
	}

}
