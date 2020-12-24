package laya.webgl.shapes {
	public class Earcut {
		public static function earcut(data:*,holeIndices:*,dim:*):*{}
		public static function linkedList(data:*,start:*,end:*,dim:*,clockwise:*):*{}
		public static function filterPoints(start:*,end:*):*{}
		public static function earcutLinked(ear:*,triangles:*,dim:*,minX:*,minY:*,invSize:*,pass:* = null):*{}
		public static function isEar(ear:*):*{}
		public static function isEarHashed(ear:*,minX:*,minY:*,invSize:*):Boolean{
			return null;
		}
		public static function cureLocalIntersections(start:*,triangles:*,dim:*):*{}
		public static function splitEarcut(start:*,triangles:*,dim:*,minX:*,minY:*,invSize:*):void{}
		public static function eliminateHoles(data:*,holeIndices:*,outerNode:*,dim:*):*{}
		public static function compareX(a:*,b:*):*{}
		public static function eliminateHole(hole:*,outerNode:*):void{}
		public static function findHoleBridge(hole:*,outerNode:*):*{}
		public static function indexCurve(start:*,minX:*,minY:*,invSize:*):void{}
		public static function sortLinked(list:*):*{}
		public static function zOrder(x:*,y:*,minX:*,minY:*,invSize:*):*{}
		public static function getLeftmost(start:*):*{}
		public static function pointInTriangle(ax:*,ay:*,bx:*,by:*,cx:*,cy:*,px:*,py:*):Boolean{
			return null;
		}
		public static function isValidDiagonal(a:*,b:*):Boolean{
			return null;
		}
		public static function area(p:*,q:*,r:*):*{}
		public static function equals(p1:*,p2:*):Boolean{
			return null;
		}
		public static function intersects(p1:*,q1:*,p2:*,q2:*):Boolean{
			return null;
		}
		public static function intersectsPolygon(a:*,b:*):Boolean{
			return null;
		}
		public static function locallyInside(a:*,b:*):Boolean{
			return null;
		}
		public static function middleInside(a:*,b:*):Boolean{
			return null;
		}
		public static function splitPolygon(a:*,b:*):*{}
		public static function insertNode(i:*,x:*,y:*,last:*):*{}
		public static function removeNode(p:*):void{}
		public static function signedArea(data:*,start:*,end:*,dim:*):*{}
	}

}
