package laya.d3.physics {
	import laya.d3.math.Vector3;
	import laya.d3.physics.PhysicsComponent;

	/**
	 * <code>CharacterController</code> 类用于创建角色控制器。
	 */
	public class CharacterController extends PhysicsComponent {
		public static var UPAXIS_X:Number;
		public static var UPAXIS_Y:Number;
		public static var UPAXIS_Z:Number;

		/**
		 * 获取角色降落速度。
		 * @return 角色降落速度。
		 */

		/**
		 * 设置角色降落速度。
		 * @param value 角色降落速度。
		 */
		public var fallSpeed:Number;

		/**
		 * 获取角色跳跃速度。
		 * @return 角色跳跃速度。
		 */

		/**
		 * 设置角色跳跃速度。
		 * @param value 角色跳跃速度。
		 */
		public var jumpSpeed:Number;

		/**
		 * 获取重力。
		 * @return 重力。
		 */

		/**
		 * 设置重力。
		 * @param value 重力。
		 */
		public var gravity:Vector3;

		/**
		 * 获取最大坡度。
		 * @return 最大坡度。
		 */

		/**
		 * 设置最大坡度。
		 * @param value 最大坡度。
		 */
		public var maxSlope:Number;

		/**
		 * 获取角色是否在地表。
		 */
		public function get isGrounded():Boolean{
				return null;
		}

		/**
		 * 获取角色行走的脚步高度，表示可跨越的最大高度。
		 * @return 脚步高度。
		 */

		/**
		 * 设置角色行走的脚步高度，表示可跨越的最大高度。
		 * @param value 脚步高度。
		 */
		public var stepHeight:Number;

		/**
		 * 获取角色的Up轴。
		 * @return 角色的Up轴。
		 */

		/**
		 * 设置角色的Up轴。
		 * @return 角色的Up轴。
		 */
		public var upAxis:Vector3;

		/**
		 * 创建一个 <code>CharacterController</code> 实例。
		 * @param stepheight 角色脚步高度。
		 * @param upAxis 角色Up轴
		 * @param collisionGroup 所属碰撞组。
		 * @param canCollideWith 可产生碰撞的碰撞组。
		 */

		public function CharacterController(stepheight:Number = undefined,upAxis:Vector3 = undefined,collisionGroup:Number = undefined,canCollideWith:Number = undefined){}

		/**
		 * 通过指定移动向量移动角色。
		 * @param movement 移动向量。
		 */
		public function move(movement:Vector3):void{}

		/**
		 * 跳跃。
		 * @param velocity 跳跃速度。
		 */
		public function jump(velocity:Vector3 = null):void{}
	}

}
