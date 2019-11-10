package laya.device.motion {

	/**
	 * 加速度x/y/z的单位均为m/s²。
	 * 在硬件（陀螺仪）不支持的情况下，alpha、beta和gamma值为null。
	 * @author Survivor
	 */
	public class AccelerationInfo {

		/**
		 * x轴上的加速度值。
		 */
		public var x:Number;

		/**
		 * y轴上的加速度值。
		 */
		public var y:Number;

		/**
		 * z轴上的加速度值。
		 */
		public var z:Number;

		public function AccelerationInfo(){}
	}

}
