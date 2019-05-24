package laya.ani.bone {
	
	/**
	 * @private
	 */
	public class TfConstraint {
		
		private var _data:TfConstraintData;
		private var _bones:Vector.<Bone>;
		public var target:Bone;
		public var rotateMix:Number;
		public var translateMix:Number;
		public var scaleMix:Number;
		public var shearMix:Number;
		private var _temp:Vector.<Number> = new Vector.<Number>(2);
		
		//TODO:coverage
		public function TfConstraint(data:TfConstraintData, bones:Vector.<Bone>) {
			_data = data;
			if (_bones == null) {
				_bones = new Vector.<Bone>();
			}
			target = bones[data.targetIndex];
			var j:int, n:int;
			for (j = 0, n = data.boneIndexs.length; j < n; j++) {
				_bones.push(bones[data.boneIndexs[j]]);
			}
			rotateMix = data.rotateMix;
			translateMix = data.translateMix;
			scaleMix = data.scaleMix;
			shearMix = data.shearMix;
		}
		
		//TODO:coverage
		public function apply():void {
			var tTfBone:Bone;
			var ta:Number = target.resultMatrix.a, tb:Number = target.resultMatrix.b, tc:Number = target.resultMatrix.c, td:Number = target.resultMatrix.d;
			for (var j:int = 0, n:int = _bones.length; j < n; j++) {
				tTfBone = _bones[j];
				if (rotateMix > 0) {
					var a:Number = tTfBone.resultMatrix.a, b:Number = tTfBone.resultMatrix.b, c:Number = tTfBone.resultMatrix.c, d:Number = tTfBone.resultMatrix.d;
					var r:Number = Math.atan2(tc, ta) - Math.atan2(c, a) + _data.offsetRotation * Math.PI / 180;
					if (r > Math.PI)
						r -= Math.PI * 2;
					else if (r < -Math.PI) r += Math.PI * 2;
					r *= rotateMix;
					var cos:Number = Math.cos(r), sin:Number = Math.sin(r);
					tTfBone.resultMatrix.a = cos * a - sin * c;
					tTfBone.resultMatrix.b = cos * b - sin * d;
					tTfBone.resultMatrix.c = sin * a + cos * c;
					tTfBone.resultMatrix.d = sin * b + cos * d;
				}
				if (translateMix) {
					_temp[0] = _data.offsetX;
					_temp[1] = _data.offsetY;
					target.localToWorld(_temp);
					tTfBone.resultMatrix.tx += (_temp[0] - tTfBone.resultMatrix.tx) * translateMix;
					tTfBone.resultMatrix.ty += (_temp[1] - tTfBone.resultMatrix.ty) * translateMix;
					tTfBone.updateChild();
				}
				if (scaleMix > 0) {
					var bs:Number = Math.sqrt(tTfBone.resultMatrix.a * tTfBone.resultMatrix.a + tTfBone.resultMatrix.c * tTfBone.resultMatrix.c);
					var ts:Number = Math.sqrt(ta * ta + tc * tc);
					var s:Number = bs > 0.00001 ? (bs + (ts - bs + _data.offsetScaleX) * scaleMix) / bs : 0;
					tTfBone.resultMatrix.a *= s;
					tTfBone.resultMatrix.c *= s;
					bs = Math.sqrt(tTfBone.resultMatrix.b * tTfBone.resultMatrix.b + tTfBone.resultMatrix.d * tTfBone.resultMatrix.d);
					ts = Math.sqrt(tb * tb + td * td);
					s = bs > 0.00001 ? (bs + (ts - bs + _data.offsetScaleY) * scaleMix) / bs : 0;
					tTfBone.resultMatrix.b *= s;
					tTfBone.resultMatrix.d *= s;
				}
				
				if (shearMix > 0) {
					b = tTfBone.resultMatrix.b, d = tTfBone.resultMatrix.d;
					var by:Number = Math.atan2(d, b);
					r = Math.atan2(td, tb) - Math.atan2(tc, ta) - (by - Math.atan2(tTfBone.resultMatrix.c, tTfBone.resultMatrix.a));
					if (r > Math.PI)
						r -= Math.PI * 2;
					else if (r < -Math.PI) r += Math.PI * 2;
					r = by + (r + _data.offsetShearY * Math.PI / 180) * shearMix;
					s = Math.sqrt(b * b + d * d);
					tTfBone.resultMatrix.b = Math.cos(r) * s;
					tTfBone.resultMatrix.d = Math.sin(r) * s;
				}
			}
		}
	
	}

}