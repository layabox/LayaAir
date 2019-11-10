package laya.d3.graphics {
	import laya.webgl.utils.Buffer;
	import laya.d3.graphics.IndexFormat;

	/**
	 * <code>IndexBuffer3D</code> 类用于创建索引缓冲。
	 */
	public class IndexBuffer3D extends Buffer {

		/**
		 * 索引类型。
		 */
		public function get indexType():IndexFormat{
				return null;
		}

		/**
		 * 索引类型字节数量。
		 */
		public function get indexTypeByteCount():Number{
				return null;
		}

		/**
		 * 索引个数。
		 */
		public function get indexCount():Number{
				return null;
		}

		/**
		 * 是否可读。
		 */
		public function get canRead():Boolean{
				return null;
		}

		/**
		 * 创建一个 <code>IndexBuffer3D,不建议开发者使用并用IndexBuffer3D.create()代替</code> 实例。
		 * @param indexType 索引类型。
		 * @param indexCount 索引个数。
		 * @param bufferUsage IndexBuffer3D用途类型。
		 * @param canRead 是否可读。
		 */

		public function IndexBuffer3D(indexType:IndexFormat = undefined,indexCount:Number = undefined,bufferUsage:Number = undefined,canRead:Boolean = undefined){}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function _bindForVAO():void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function bind():Boolean{
			return null;
		}

		/**
		 * 设置数据。
		 * @param data 索引数据。
		 * @param bufferOffset 索引缓冲中的偏移。
		 * @param dataStartIndex 索引数据的偏移。
		 * @param dataCount 索引数据的数量。
		 */
		public function setData(data:*,bufferOffset:Number = null,dataStartIndex:Number = null,dataCount:Number = null):void{}

		/**
		 * 获取索引数据。
		 * @return 索引数据。
		 */
		public function getData():Uint16Array{
			return null;
		}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function destroy():void{}
	}

}
