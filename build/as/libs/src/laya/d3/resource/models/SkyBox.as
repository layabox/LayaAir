/*[IF-FLASH]*/
package laya.d3.resource.models {
	improt laya.d3.core.render.RenderContext3D;
	improt laya.d3.resource.models.SkyMesh;
	public class SkyBox extends laya.d3.resource.models.SkyMesh {
		public static var instance:SkyBox;

		public function SkyBox(){}
		public function _render(state:RenderContext3D):void{}
	}

}
