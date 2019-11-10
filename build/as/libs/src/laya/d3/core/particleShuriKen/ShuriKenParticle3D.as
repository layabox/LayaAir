package laya.d3.core.particleShuriKen {
	import laya.d3.core.RenderableSprite3D;
	import laya.d3.core.particleShuriKen.ShurikenParticleRenderer;
	import laya.d3.core.particleShuriKen.ShurikenParticleSystem;

	/**
	 * <code>ShuriKenParticle3D</code> 3D粒子。
	 */
	public class ShuriKenParticle3D extends RenderableSprite3D {

		/**
		 * 粒子系统。
		 */
		public function get particleSystem():ShurikenParticleSystem{
				return null;
		}

		/**
		 * 粒子渲染器。
		 */
		public function get particleRenderer():ShurikenParticleRenderer{
				return null;
		}

		/**
		 * 创建一个 <code>Particle3D</code> 实例。
		 */

		public function ShuriKenParticle3D(){}

		/**
		 * <p>销毁此对象。</p>
		 * @param destroyChild 是否同时销毁子节点，若值为true,则销毁子节点，否则不销毁子节点。
		 * @override 
		 */
		override public function destroy(destroyChild:Boolean = null):void{}
	}

}
