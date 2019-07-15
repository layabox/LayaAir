/*[IF-FLASH]*/
package  {
	improt laya.d3.core.IClone;
	improt laya.d3.math.Vector3;
	public class Config3D implements laya.d3.core.IClone {
		public static var _default:Config3D;
		private var _defaultPhysicsMemory:*;
		public var _editerEnvironment:Boolean;
		public var isAntialias:Boolean;
		public var isAlpha:Boolean;
		public var premultipliedAlpha:Boolean;
		public var isStencil:Boolean;
		public var octreeCulling:Boolean;
		public var octreeInitialSize:Number;
		public var octreeInitialCenter:Vector3;
		public var octreeMinNodeSize:Number;
		public var octreeLooseness:Number;
		public var debugFrustumCulling:Boolean;
		public var defaultPhysicsMemory:Number;

		public function Config3D(){}
		public function cloneTo(dest:*):void{}
		public function clone():*{}
	}

}
