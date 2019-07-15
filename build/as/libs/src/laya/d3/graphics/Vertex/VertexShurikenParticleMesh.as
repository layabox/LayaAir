/*[IF-FLASH]*/
package laya.d3.graphics.Vertex {
	improt laya.d3.graphics.Vertex.VertexShuriKenParticle;
	improt laya.d3.graphics.VertexDeclaration;
	improt laya.d3.math.Vector3;
	improt laya.d3.math.Vector4;
	public class VertexShurikenParticleMesh extends laya.d3.graphics.Vertex.VertexShuriKenParticle {
		public static function get vertexDeclaration():VertexDeclaration{};
		public function get cornerTextureCoordinate():Vector4{};
		public function get position():Vector4{};
		public function get velocity():Vector3{};
		public function get startColor():Vector4{};
		public function get startSize():Vector3{};
		public function get startRotation0():Vector3{};
		public function get startRotation1():Vector3{};
		public function get startRotation2():Vector3{};
		public function get startLifeTime():Number{};
		public function get time():Number{};
		public function get startSpeed():Number{};
		public function get random0():Vector4{};
		public function get random1():Vector4{};
		public function get simulationWorldPostion():Vector3{};

		public function VertexShurikenParticleMesh(cornerTextureCoordinate:Vector4,positionStartLifeTime:Vector4,velocity:Vector3,startColor:Vector4,startSize:Vector3,startRotation0:Vector3,startRotation1:Vector3,startRotation2:Vector3,ageAddScale:Number,time:Number,startSpeed:Number,randoms0:Vector4,randoms1:Vector4,simulationWorldPostion:Vector3){}
	}

}
