package laya.d3.graphics.Vertex {
	import laya.d3.graphics.Vertex.VertexShuriKenParticle;
	import laya.d3.graphics.VertexDeclaration;
	import laya.d3.math.Vector3;
	import laya.d3.math.Vector4;

	/**
	 * /**
	 *    <code>VertexShurikenParticle</code> 类用于创建粒子顶点结构。
	 */
	public class VertexShurikenParticleMesh extends VertexShuriKenParticle {
		public static function get vertexDeclaration():VertexDeclaration{
				return null;
		}
		public function get cornerTextureCoordinate():Vector4{
				return null;
		}
		public function get position():Vector4{
				return null;
		}
		public function get velocity():Vector3{
				return null;
		}
		public function get startColor():Vector4{
				return null;
		}
		public function get startSize():Vector3{
				return null;
		}
		public function get startRotation0():Vector3{
				return null;
		}
		public function get startRotation1():Vector3{
				return null;
		}
		public function get startRotation2():Vector3{
				return null;
		}
		public function get startLifeTime():Number{
				return null;
		}
		public function get time():Number{
				return null;
		}
		public function get startSpeed():Number{
				return null;
		}
		public function get random0():Vector4{
				return null;
		}
		public function get random1():Vector4{
				return null;
		}
		public function get simulationWorldPostion():Vector3{
				return null;
		}

		public function VertexShurikenParticleMesh(cornerTextureCoordinate:Vector4 = undefined,positionStartLifeTime:Vector4 = undefined,velocity:Vector3 = undefined,startColor:Vector4 = undefined,startSize:Vector3 = undefined,startRotation0:Vector3 = undefined,startRotation1:Vector3 = undefined,startRotation2:Vector3 = undefined,ageAddScale:Number = undefined,time:Number = undefined,startSpeed:Number = undefined,randoms0:Vector4 = undefined,randoms1:Vector4 = undefined,simulationWorldPostion:Vector3 = undefined){}
	}

}
