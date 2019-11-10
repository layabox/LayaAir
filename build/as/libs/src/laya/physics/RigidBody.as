package laya.physics {
	import laya.components.Component;

	/**
	 * 2D刚体，显示对象通过RigidBody和物理世界进行绑定，保持物理和显示对象之间的位置同步
	 * 物理世界的位置变化会自动同步到显示对象，显示对象本身的位移，旋转（父对象位移无效）也会自动同步到物理世界
	 * 由于引擎限制，暂时不支持以下情形：
	 * 1.不支持绑定节点缩放
	 * 2.不支持绑定节点的父节点缩放和旋转
	 * 3.不支持实时控制父对象位移，IDE内父对象位移是可以的
	 * 如果想整体位移物理世界，可以Physics.I.worldRoot=场景，然后移动场景即可
	 * 可以通过IDE-"项目设置" 开启物理辅助线显示，或者通过代码PhysicsDebugDraw.enable();
	 */
	public class RigidBody extends Component {

		/**
		 * 刚体类型，支持三种类型static，dynamic和kinematic类型，默认为dynamic类型
		 * static为静态类型，静止不动，不受重力影响，质量无限大，可以通过节点移动，旋转，缩放进行控制
		 * dynamic为动态类型，受重力影响
		 * kinematic为运动类型，不受重力影响，可以通过施加速度或者力的方式使其运动
		 */
		protected var _type:String;

		/**
		 * 是否允许休眠，允许休眠能提高性能
		 */
		protected var _allowSleep:Boolean;

		/**
		 * 角速度，设置会导致旋转
		 */
		protected var _angularVelocity:Number;

		/**
		 * 旋转速度阻尼系数，范围可以在0到无穷大之间，0表示没有阻尼，无穷大表示满阻尼，通常阻尼的值应该在0到0.1之间
		 */
		protected var _angularDamping:Number;

		/**
		 * 线性运动速度，比如{x:10,y:10}
		 */
		protected var _linearVelocity:*;

		/**
		 * 线性速度阻尼系数，范围可以在0到无穷大之间，0表示没有阻尼，无穷大表示满阻尼，通常阻尼的值应该在0到0.1之间
		 */
		protected var _linearDamping:Number;

		/**
		 * 是否高速移动的物体，设置为true，可以防止高速穿透
		 */
		protected var _bullet:Boolean;

		/**
		 * 是否允许旋转，如果不希望刚体旋转，这设置为false
		 */
		protected var _allowRotation:Boolean;

		/**
		 * 重力缩放系数，设置为0为没有重力
		 */
		protected var _gravityScale:Number;

		/**
		 * [只读] 指定了该主体所属的碰撞组，默认为0，碰撞规则如下：
		 * 1.如果两个对象group相等
		 * group值大于零，它们将始终发生碰撞
		 * group值小于零，它们将永远不会发生碰撞
		 * group值等于0，则使用规则3
		 * 2.如果group值不相等，则使用规则3
		 * 3.每个刚体都有一个category类别，此属性接收位字段，范围为[1,2^31]范围内的2的幂
		 * 每个刚体也都有一个mask类别，指定与其碰撞的类别值之和（值是所有category按位AND的值）
		 */
		public var group:Number;

		/**
		 * [只读]碰撞类别，使用2的幂次方值指定，有32种不同的碰撞类别可用
		 */
		public var category:Number;

		/**
		 * [只读]指定冲突位掩码碰撞的类别，category位操作的结果
		 */
		public var mask:Number;

		/**
		 * [只读]自定义标签
		 */
		public var label:String;

		/**
		 * [只读]原始刚体
		 */
		protected var _body:*;
		private var _createBody:*;

		/**
		 * 获取对象某属性的get set方法
		 * 通过其本身无法获取该方法，只能从原型上获取
		 * @param obj 
		 * @param prop 
		 * @param accessor 
		 */
		private var accessGetSetFunc:*;

		/**
		 * 重置Collider
		 * @param resetShape 是否先重置形状，比如缩放导致碰撞体变化
		 */
		private var resetCollider:*;

		/**
		 * @private 同步物理坐标到游戏坐标
		 */
		private var _sysPhysicToNode:*;

		/**
		 * @private 同步节点坐标及旋转到物理世界
		 */
		private var _sysNodeToPhysic:*;

		/**
		 * @private 同步节点坐标到物理世界
		 */
		private var _sysPosToPhysic:*;

		/**
		 * @private 
		 */
		private var _overSet:*;

		/**
		 * 获得原始body对象
		 */
		public function getBody():*{}

		/**
		 * [只读]获得原始body对象
		 */
		public function get body():*{
				return null;
		}

		/**
		 * 对刚体施加力
		 * @param position 施加力的点，如{x:100,y:100}，全局坐标
		 * @param force 施加的力，如{x:0.1,y:0.1}
		 */
		public function applyForce(position:*,force:*):void{}

		/**
		 * 从中心点对刚体施加力，防止对象旋转
		 * @param force 施加的力，如{x:0.1,y:0.1}
		 */
		public function applyForceToCenter(force:*):void{}

		/**
		 * 施加速度冲量，添加的速度冲量会与刚体原有的速度叠加，产生新的速度
		 * @param position 施加力的点，如{x:100,y:100}，全局坐标
		 * @param impulse 施加的速度冲量，如{x:0.1,y:0.1}
		 */
		public function applyLinearImpulse(position:*,impulse:*):void{}

		/**
		 * 施加速度冲量，添加的速度冲量会与刚体原有的速度叠加，产生新的速度
		 * @param impulse 施加的速度冲量，如{x:0.1,y:0.1}
		 */
		public function applyLinearImpulseToCenter(impulse:*):void{}

		/**
		 * 对刚体施加扭矩，使其旋转
		 * @param torque 施加的扭矩
		 */
		public function applyTorque(torque:Number):void{}

		/**
		 * 设置速度，比如{x:10,y:10}
		 * @param velocity 
		 */
		public function setVelocity(velocity:*):void{}

		/**
		 * 设置角度
		 * @param value 单位为弧度
		 */
		public function setAngle(value:*):void{}

		/**
		 * 获得刚体质量
		 */
		public function getMass():Number{
			return null;
		}

		/**
		 * 获得质心的相对节点0,0点的位置偏移
		 */
		public function getCenter():*{}

		/**
		 * 获得质心的世界坐标，相对于Physics.I.worldRoot节点
		 */
		public function getWorldCenter():*{}

		/**
		 * 刚体类型，支持三种类型static，dynamic和kinematic类型
		 * static为静态类型，静止不动，不受重力影响，质量无限大，可以通过节点移动，旋转，缩放进行控制
		 * dynamic为动态类型，接受重力影响
		 * kinematic为运动类型，不受重力影响，可以通过施加速度或者力的方式使其运动
		 */
		public var type:String;

		/**
		 * 重力缩放系数，设置为0为没有重力
		 */
		public var gravityScale:Number;

		/**
		 * 是否允许旋转，如果不希望刚体旋转，这设置为false
		 */
		public var allowRotation:Boolean;

		/**
		 * 是否允许休眠，允许休眠能提高性能
		 */
		public var allowSleep:Boolean;

		/**
		 * 旋转速度阻尼系数，范围可以在0到无穷大之间，0表示没有阻尼，无穷大表示满阻尼，通常阻尼的值应该在0到0.1之间
		 */
		public var angularDamping:Number;

		/**
		 * 角速度，设置会导致旋转
		 */
		public var angularVelocity:Number;

		/**
		 * 线性速度阻尼系数，范围可以在0到无穷大之间，0表示没有阻尼，无穷大表示满阻尼，通常阻尼的值应该在0到0.1之间
		 */
		public var linearDamping:Number;

		/**
		 * 线性运动速度，比如{x:5,y:5}
		 */
		public var linearVelocity:*;

		/**
		 * 是否高速移动的物体，设置为true，可以防止高速穿透
		 */
		public var bullet:Boolean;
	}

}
