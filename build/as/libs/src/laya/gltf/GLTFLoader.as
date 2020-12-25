package laya.gltf {
	import laya.utils.Handler;
	import laya.d3.core.material.Material;

	/**
	 * <code>GLTFLoader</code> 类可用来加载 gltf 文件
	 * 支持 gltf 2.0 非二进制文件 非 相机， 灯光 节点解析
	 */
	public class GLTFLoader {
		public static var loadedMap:*;
		public static var textureMap:*;
		private var _onLoaded:*;

		/**
		 * 设置默认材质，节点材质会设置位此材质的克隆 支持解析 PBR 相关参数
		 */
		public static var defaultMatrial:Material;

		/**
		 * 扩展解析函数对象
		 */
		public var extraFunc:*;

		public function GLTFLoader(){}

		/**
		 * 加载 gltf 资源
		 * @param url 资源地址或数组 | {url: string, type: JSON}
		 * @param complate 加载回调函数
		 */
		public function loadGLTF(url:*,complate:Handler = null):void{}

		/**
		 * @intrenal 
		 * @param gltfContext 
		 * @param allScuess 
		 * @param succeed 
		 */
		public function collectionLoadItems(gltfContext:*,allScuess:Boolean,succeed:Boolean):void{}

		/**
		 * @intrenal 
		 */
		public function onLoaded(gltfContext:*,allScuess:Boolean,succeed:Boolean):void{}

		/**
		 * 获取指定资源地址的资源或纹理。
		 * @param url 资源地址。
		 * @return 返回资源。
		 */
		public static function getRes(url:String):*{}

		/**
		 * 清理指定资源地址的缓存。
		 * @param url 资源地址。
		 */
		public static function clearRes(url:String):void{}
	}

}
