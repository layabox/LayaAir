/*[IF-FLASH]*/
package laya.d3.resource.models {
	improt laya.d3.resource.models.SkyMesh;
	public class SkyDome extends laya.d3.resource.models.SkyMesh {
		public static var instance:SkyDome;
		public function get stacks():Number{};
		public function get slices():Number{};

		public function SkyDome(stacks:Number = null,slices:Number = null){}
	}

}
