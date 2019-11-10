package laya.webgl.utils {
	import laya.webgl.utils.IndexBuffer2D;
	import laya.webgl.utils.VertexBuffer2D;

	/**
	 * Mesh2d只是保存数据。描述attribute用的。本身不具有渲染功能。
	 */
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

		/**
		 * @param stride 
		 * @param vballoc vb预分配的大小。主要是用来提高效率。防止不断的resizebfufer
		 * @param iballoc 
		 */

		public function Mesh2D(stride:Number = undefined,vballoc:Number = undefined,iballoc:Number = undefined){}

		/**
		 * 重新创建一个mesh。复用这个对象的vertex结构，ib对象和attribinfo对象
		 */
		public function cloneWithNewVB():Mesh2D{
			return null;
		}

		/**
		 * 创建一个mesh，使用当前对象的vertex结构。vb和ib自己提供。
		 * @return 
		 */
		public function cloneWithNewVBIB():Mesh2D{
			return null;
		}

		/**
		 * 获得一个可以写的vb对象
		 */
		public function getVBW():VertexBuffer2D{
			return null;
		}

		/**
		 * 获得一个只读vb
		 */
		public function getVBR():VertexBuffer2D{
			return null;
		}
		public function getIBR():IndexBuffer2D{
			return null;
		}

		/**
		 * 获得一个可写的ib
		 */
		public function getIBW():IndexBuffer2D{
			return null;
		}

		/**
		 * 直接创建一个固定的ib。按照固定四边形的索引。
		 * @param var QuadNum
		 */
		public function createQuadIB(QuadNum:Number):void{}

		/**
		 * 设置mesh的属性。每3个一组，对应的location分别是0,1,2...
		 * 含义是：type,size,offset
		 * 不允许多流。因此stride是固定的，offset只是在一个vertex之内。
		 * @param attribs 
		 */
		public function setAttributes(attribs:Array):void{}

		/**
		 * 初始化VAO的配置，只需要执行一次。以后使用的时候直接bind就行
		 * @param gl 
		 */
		private var configVAO:*;

		/**
		 * 应用这个mesh
		 * @param gl 
		 */
		public function useMesh(gl:*):void{}
		public function getEleNum():Number{
			return null;
		}

		/**
		 * 子类实现。用来把自己放到对应的回收池中，以便复用。
		 */
		public function releaseMesh():void{}

		/**
		 * 释放资源。
		 */
		public function destroy():void{}

		/**
		 * 清理vb数据
		 */
		public function clearVB():void{}
	}

}
