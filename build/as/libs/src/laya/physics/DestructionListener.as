package laya.physics {

	/**
	 * JS实现Box2D SayGoodbyeParticle
	 * 相关类型对象被隐性移除时触发对应的SayGoodBye方法
	 */
	public class DestructionListener {

		/**
		 * Joint被隐性移除时触发
		 * @param params box2d的Joint相关对象
		 */
		public function SayGoodbyeJoint(params:*):void{}

		/**
		 * Fixtures被隐性移除时触发
		 * @param params box2d的Fixtures相关对象
		 */
		public function SayGoodbyeFixture(params:*):void{}

		/**
		 * ParticleGroup被隐性移除时触发
		 * @param params box2d的ParticleGroup相关对象
		 */
		public function SayGoodbyeParticleGroup(params:*):void{}

		/**
		 * Particle被隐性移除时触发
		 * @param params box2d的Particle相关对象
		 */
		public function SayGoodbyeParticle(params:*):void{}
	}

}
