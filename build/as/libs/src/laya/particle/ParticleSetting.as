package laya.particle {

	/**
	 * <code>ParticleSettings</code> 类是粒子配置数据类
	 */
	public class ParticleSetting {

		/**
		 * 贴图
		 */
		public var textureName:String;

		/**
		 * 贴图个数,默认为1可不设置
		 */
		public var textureCount:Number;

		/**
		 * 由于循环队列判断算法，最大饱和粒子数为maxPartices-1
		 */
		public var maxPartices:Number;

		/**
		 * 粒子持续时间(单位:秒）
		 */
		public var duration:Number;

		/**
		 * 如果大于0，某些粒子的持续时间会小于其他粒子,并具有随机性(单位:无）
		 */
		public var ageAddScale:Number;

		/**
		 * 粒子受发射器速度的敏感度（需在自定义发射器中编码设置）
		 */
		public var emitterVelocitySensitivity:Number;

		/**
		 * 最小开始尺寸（单位：2D像素、3D坐标）
		 */
		public var minStartSize:Number;

		/**
		 * 最大开始尺寸（单位：2D像素、3D坐标）
		 */
		public var maxStartSize:Number;

		/**
		 * 最小结束尺寸（单位：2D像素、3D坐标）
		 */
		public var minEndSize:Number;

		/**
		 * 最大结束尺寸（单位：2D像素、3D坐标）
		 */
		public var maxEndSize:Number;

		/**
		 * 最小水平速度（单位：2D像素、3D坐标）
		 */
		public var minHorizontalVelocity:Number;

		/**
		 * 最大水平速度（单位：2D像素、3D坐标）
		 */
		public var maxHorizontalVelocity:Number;

		/**
		 * 最小垂直速度（单位：2D像素、3D坐标）
		 */
		public var minVerticalVelocity:Number;

		/**
		 * 最大垂直速度（单位：2D像素、3D坐标）
		 */
		public var maxVerticalVelocity:Number;

		/**
		 * 等于1时粒子从出生到消亡保持一致的速度，等于0时粒子消亡时速度为0，大于1时粒子会保持加速（单位：无）
		 */
		public var endVelocity:Number;

		/**
		 * （单位：2D像素、3D坐标）
		 */
		public var gravity:Float32Array;

		/**
		 * 最小旋转速度（单位：2D弧度/秒、3D弧度/秒）
		 */
		public var minRotateSpeed:Number;

		/**
		 * 最大旋转速度（单位：2D弧度/秒、3D弧度/秒）
		 */
		public var maxRotateSpeed:Number;

		/**
		 * 最小开始半径（单位：2D像素、3D坐标）
		 */
		public var minStartRadius:Number;

		/**
		 * 最大开始半径（单位：2D像素、3D坐标）
		 */
		public var maxStartRadius:Number;

		/**
		 * 最小结束半径（单位：2D像素、3D坐标）
		 */
		public var minEndRadius:Number;

		/**
		 * 最大结束半径（单位：2D像素、3D坐标）
		 */
		public var maxEndRadius:Number;

		/**
		 * 最小水平开始弧度（单位：2D弧度、3D弧度）
		 */
		public var minHorizontalStartRadian:Number;

		/**
		 * 最大水平开始弧度（单位：2D弧度、3D弧度）
		 */
		public var maxHorizontalStartRadian:Number;

		/**
		 * 最小垂直开始弧度（单位：2D弧度、3D弧度）
		 */
		public var minVerticalStartRadian:Number;

		/**
		 * 最大垂直开始弧度（单位：2D弧度、3D弧度）
		 */
		public var maxVerticalStartRadian:Number;

		/**
		 * 是否使用结束弧度,false为结束时与起始弧度保持一致,true为根据minHorizontalEndRadian、maxHorizontalEndRadian、minVerticalEndRadian、maxVerticalEndRadian计算结束弧度。
		 */
		public var useEndRadian:Boolean;

		/**
		 * 最小水平结束弧度（单位：2D弧度、3D弧度）
		 */
		public var minHorizontalEndRadian:Number;

		/**
		 * 最大水平结束弧度（单位：2D弧度、3D弧度）
		 */
		public var maxHorizontalEndRadian:Number;

		/**
		 * 最小垂直结束弧度（单位：2D弧度、3D弧度）
		 */
		public var minVerticalEndRadian:Number;

		/**
		 * 最大垂直结束弧度（单位：2D弧度、3D弧度）
		 */
		public var maxVerticalEndRadian:Number;

		/**
		 * 最小开始颜色
		 */
		public var minStartColor:Float32Array;

		/**
		 * 最大开始颜色
		 */
		public var maxStartColor:Float32Array;

		/**
		 * 最小结束颜色
		 */
		public var minEndColor:Float32Array;

		/**
		 * 最大结束颜色
		 */
		public var maxEndColor:Float32Array;

		/**
		 * false代表RGBA整体插值，true代表RGBA逐分量插值
		 */
		public var colorComponentInter:Boolean;

		/**
		 * false代表使用参数颜色数据，true代表使用原图颜色数据
		 */
		public var disableColor:Boolean;

		/**
		 * 混合模式，待调整，引擎中暂无BlendState抽象
		 */
		public var blendState:Number;

		/**
		 * 发射器类型,"point","box","sphere","ring"
		 */
		public var emitterType:String;

		/**
		 * 发射器发射速率
		 */
		public var emissionRate:Number;

		/**
		 * 点发射器位置
		 */
		public var pointEmitterPosition:Float32Array;

		/**
		 * 点发射器位置随机值
		 */
		public var pointEmitterPositionVariance:Float32Array;

		/**
		 * 点发射器速度
		 */
		public var pointEmitterVelocity:Float32Array;

		/**
		 * 点发射器速度随机值
		 */
		public var pointEmitterVelocityAddVariance:Float32Array;

		/**
		 * 盒发射器中心位置
		 */
		public var boxEmitterCenterPosition:Float32Array;

		/**
		 * 盒发射器尺寸
		 */
		public var boxEmitterSize:Float32Array;

		/**
		 * 盒发射器速度
		 */
		public var boxEmitterVelocity:Float32Array;

		/**
		 * 盒发射器速度随机值
		 */
		public var boxEmitterVelocityAddVariance:Float32Array;

		/**
		 * 球发射器中心位置
		 */
		public var sphereEmitterCenterPosition:Float32Array;

		/**
		 * 球发射器半径
		 */
		public var sphereEmitterRadius:Number;

		/**
		 * 球发射器速度
		 */
		public var sphereEmitterVelocity:Number;

		/**
		 * 球发射器速度随机值
		 */
		public var sphereEmitterVelocityAddVariance:Number;

		/**
		 * 环发射器中心位置
		 */
		public var ringEmitterCenterPosition:Float32Array;

		/**
		 * 环发射器半径
		 */
		public var ringEmitterRadius:Number;

		/**
		 * 环发射器速度
		 */
		public var ringEmitterVelocity:Number;

		/**
		 * 环发射器速度随机值
		 */
		public var ringEmitterVelocityAddVariance:Number;

		/**
		 * 环发射器up向量，0代表X轴,1代表Y轴,2代表Z轴
		 */
		public var ringEmitterUp:Number;

		/**
		 * 发射器位置随机值,2D使用
		 */
		public var positionVariance:Float32Array;

		/**
		 * 创建一个新的 <code>ParticleSettings</code> 类实例。
		 */

		public function ParticleSetting(){}
		private static var _defaultSetting:*;
		public static function checkSetting(setting:*):void{}
	}

}
