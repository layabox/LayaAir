package laya.particle {
	import laya.particle.ParticleTemplateBase;
	import laya.particle.ParticleSetting;
	import laya.webgl.utils.MeshParticle2D;
	import laya.resource.Context;

	/**
	 * @private 
	 */
	public class ParticleTemplateWebGL extends ParticleTemplateBase {
		protected var _vertices:Float32Array;
		protected var _mesh:MeshParticle2D;
		protected var _conchMesh:*;
		protected var _floatCountPerVertex:Number;
		protected var _firstActiveElement:Number;
		protected var _firstNewElement:Number;
		protected var _firstFreeElement:Number;
		protected var _firstRetiredElement:Number;
		protected var _drawCounter:Number;

		public function ParticleTemplateWebGL(parSetting:ParticleSetting = undefined){}
		public function reUse(context:Context,pos:Number):Number{
			return null;
		}
		protected function initialize():void{}
		public function update(elapsedTime:Number):void{}
		private var retireActiveParticles:*;
		private var freeRetiredParticles:*;
		public function addNewParticlesToVertexBuffer():void{}

		/**
		 * @param position 
		 * @param velocity 
		 * @override 
		 */
		override public function addParticleArray(position:Float32Array,velocity:Float32Array):void{}
	}

}
