/*[IF-FLASH]*/
package laya.particle {
	improt laya.particle.ParticleTemplateBase;
	improt laya.particle.ParticleSetting;
	improt laya.webgl.utils.MeshParticle2D;
	improt laya.resource.Context;
	public class ParticleTemplateWebGL extends laya.particle.ParticleTemplateBase {
		protected var _vertices:Float32Array;
		protected var _mesh:MeshParticle2D;
		protected var _conchMesh:*;
		protected var _floatCountPerVertex:Number;
		protected var _firstActiveElement:Number;
		protected var _firstNewElement:Number;
		protected var _firstFreeElement:Number;
		protected var _firstRetiredElement:Number;
		protected var _drawCounter:Number;

		public function ParticleTemplateWebGL(parSetting:ParticleSetting){}
		public function reUse(context:Context,pos:Number):Number{}
		protected function initialize():void{}
		public function update(elapsedTime:Number):void{}
		private var retireActiveParticles:*;
		private var freeRetiredParticles:*;
		public function addNewParticlesToVertexBuffer():void{}
		public function addParticleArray(position:Float32Array,velocity:Float32Array):void{}
	}

}
