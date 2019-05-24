package laya.ani.math 
{
	import laya.maths.Bezier;
	/**
	 * @private
	 * ...
	 * @author ww
	 */
	public class BezierLerp 
	{
		
		public function BezierLerp() 
		{
			
		}
		private static var _bezierResultCache:Object = { };
		private static var _bezierPointsCache:Object = { };
		
		//TODO:coverage
		public static function getBezierRate(t:Number, px0:Number, py0:Number, px1:Number, py1:Number):Number
		{
			var key:Number = _getBezierParamKey(px0, py0, px1, py1);
			var vKey:Number = key * 100 + t;
			if (_bezierResultCache[vKey]) return _bezierResultCache[vKey];
			var points:Array = _getBezierPoints(px0, py0, px1, py1,key);
			var i:int, len:int;
			len = points.length;
			for (i = 0; i < len; i += 2)
			{
				if (t <= points[i])
				{
					_bezierResultCache[vKey] = points[i + 1];
					return points[i + 1];
				} 
			}
			_bezierResultCache[vKey] = 1;
			return 1;
		}
		
		//TODO:coverage
		private static function _getBezierParamKey(px0:Number, py0:Number, px1:Number, py1:Number):Number
		{
			return (((px0 * 100 + py0) * 100 + px1) * 100 + py1) * 100;
		}	
		
		//TODO:coverage
		private static function _getBezierPoints(px0:Number, py0:Number, px1:Number, py1:Number,key:Number):Array
		{
			if (_bezierPointsCache[key]) return _bezierPointsCache[key];
			var controlPoints:Array;
			controlPoints = [0, 0, px0, py0, px1,  py1, 1, 1];
		    var bz:Bezier;
			bz = new Bezier();
			var points:Array;
			points = bz.getBezierPoints(controlPoints, 100, 3);
			_bezierPointsCache[key] = points;
			return points;
		}
	}

}