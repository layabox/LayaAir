package laya.device.motion {

	/**
	 * 保存旋转信息的类。请勿修改本类的属性。
	 * @author Survivor
	 */
	public class RotationInfo {

		/**
		 * <p>
		 * 指示设备是否可以提供绝对方位数据（指向地球坐标系），或者设备决定的任意坐标系。
		 * 关于坐标系参见<i>https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Orientation_and_motion_data_explained</i>。
		 * </p>
		 * 需要注意的是，IOS环境下，该值始终为false。即使如此，你依旧可以从<code>alpha</code>中取得正确的值。
		 */
		public var absolute:Boolean;

		/**
		 * Z轴旋转角度，其值范围从0至360。
		 * 若<code>absolute</code>为true或者在IOS中，alpha值是从北方到当前设备方向的角度值。
		 */
		public var alpha:Number;

		/**
		 * X轴旋转角度, 其值范围从-180至180。代表设备从前至后的运动。
		 */
		public var beta:Number;

		/**
		 * Y轴旋转角度，其值范围从-90至90。代表设备从左至右的运动。
		 */
		public var gamma:Number;

		/**
		 * 罗盘数据的精确度（角度）。仅IOS可用。
		 */
		public var compassAccuracy:Number;

		public function RotationInfo(){}
	}

}
