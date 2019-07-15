/*[IF-FLASH]*/
package laya.d3.core.trail {
	improt laya.d3.core.GeometryElement;
	improt laya.d3.core.render.RenderContext3D;
	improt laya.d3.core.trail.TrailFilter;
	public class TrailGeometry extends laya.d3.core.GeometryElement {
		public static var ALIGNMENT_VIEW:Number;
		public static var ALIGNMENT_TRANSFORM_Z:Number;
		private var tmpColor:*;
		private var _disappearBoundsMode:*;

		public function TrailGeometry(owner:TrailFilter){}
		public function _getType():Number{}
		public function _prepareRender(state:RenderContext3D):Boolean{}
		public function _render(state:RenderContext3D):void{}
		public function destroy():void{}
	}

}
