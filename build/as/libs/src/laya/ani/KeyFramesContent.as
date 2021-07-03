package laya.ani {

	/**
	 * 关键帧
	 */
	public class KeyFramesContent {

		/**
		 * 开始时间
		 */
		public var startTime:Number;

		/**
		 * 持续时间
		 */
		public var duration:Number;

		/**
		 * 私有插值方式
		 */
		public var interpolationData:Array;

		/**
		 * 数据
		 */
		public var data:Float32Array;

		/**
		 * 数据变化量
		 */
		public var dData:Float32Array;

		/**
		 * 下一次的数据
		 */
		public var nextData:Float32Array;
	}

}
