package  {

	/**
	 * Config 用于配置一些全局参数。如需更改，请在初始化引擎之前设置。
	 */
	public class Config {

		/**
		 * 动画 Animation 的默认播放时间间隔，单位为毫秒。
		 */
		public static var animationInterval:Number;

		/**
		 * 设置是否抗锯齿，只对2D(WebGL)、3D有效。
		 */
		public static var isAntialias:Boolean;

		/**
		 * 设置画布是否透明，只对2D(WebGL)、3D有效。
		 */
		public static var isAlpha:Boolean;

		/**
		 * 设置画布是否预乘，只对2D(WebGL)、3D有效。
		 */
		public static var premultipliedAlpha:Boolean;

		/**
		 * 设置画布的是否开启模板缓冲，只对2D(WebGL)、3D有效。
		 */
		public static var isStencil:Boolean;

		/**
		 * 是否保留渲染缓冲区。
		 */
		public static var preserveDrawingBuffer:Boolean;

		/**
		 * 当使用webGL渲染2d的时候，每次创建vb是否直接分配足够64k个顶点的缓存。这样可以提高效率。
		 */
		public static var webGL2D_MeshAllocMaxMem:Boolean;

		/**
		 * 是否强制使用像素采样。适用于像素风格游戏
		 */
		public static var is2DPixelArtGame:Boolean;

		/**
		 * 是否使用webgl2
		 */
		public static var useWebGL2:Boolean;

		/**
		 * 是否允许GPUInstance动态合并,仅对3D有效。
		 */
		public static var allowGPUInstanceDynamicBatch:Boolean;
		public static var useRetinalCanvas:Boolean;
	}

}
