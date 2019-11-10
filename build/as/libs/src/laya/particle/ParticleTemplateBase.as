package laya.particle {
	import laya.particle.ParticleSetting;
	import laya.resource.Texture;

	/**
	 * <code>ParticleTemplateBase</code> 类是粒子模板基类
	 */
	public class ParticleTemplateBase {

		/**
		 * 粒子配置数据
		 */
		public var settings:ParticleSetting;

		/**
		 * 粒子贴图
		 */
		protected var texture:Texture;

		/**
		 * 创建一个新的 <code>ParticleTemplateBase</code> 类实例。
		 */

		public function ParticleTemplateBase(){}

		/**
		 * 添加一个粒子
		 * @param position 粒子位置
		 * @param velocity 粒子速度
		 */
		public function addParticleArray(position:Float32Array,velocity:Float32Array):void{}
	}

}
