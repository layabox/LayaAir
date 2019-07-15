/*[IF-FLASH]*/
package laya.d3.utils {
	improt laya.d3.math.Vector3;
	improt laya.d3.physics.PhysicsComponent;
	public class Physics3DUtils {
		public static var COLLISIONFILTERGROUP_DEFAULTFILTER:Number;
		public static var COLLISIONFILTERGROUP_STATICFILTER:Number;
		public static var COLLISIONFILTERGROUP_KINEMATICFILTER:Number;
		public static var COLLISIONFILTERGROUP_DEBRISFILTER:Number;
		public static var COLLISIONFILTERGROUP_SENSORTRIGGER:Number;
		public static var COLLISIONFILTERGROUP_CHARACTERFILTER:Number;
		public static var COLLISIONFILTERGROUP_CUSTOMFILTER1:Number;
		public static var COLLISIONFILTERGROUP_CUSTOMFILTER2:Number;
		public static var COLLISIONFILTERGROUP_CUSTOMFILTER3:Number;
		public static var COLLISIONFILTERGROUP_CUSTOMFILTER4:Number;
		public static var COLLISIONFILTERGROUP_CUSTOMFILTER5:Number;
		public static var COLLISIONFILTERGROUP_CUSTOMFILTER6:Number;
		public static var COLLISIONFILTERGROUP_CUSTOMFILTER7:Number;
		public static var COLLISIONFILTERGROUP_CUSTOMFILTER8:Number;
		public static var COLLISIONFILTERGROUP_CUSTOMFILTER9:Number;
		public static var COLLISIONFILTERGROUP_CUSTOMFILTER10:Number;
		public static var COLLISIONFILTERGROUP_ALLFILTER:Number;
		public static var gravity:Vector3;

		public function Physics3DUtils(){}
		public static function setColliderCollision(collider1:PhysicsComponent,collider2:PhysicsComponent,collsion:Boolean):void{}
		public static function getIColliderCollision(collider1:PhysicsComponent,collider2:PhysicsComponent):Boolean{}
	}

}
