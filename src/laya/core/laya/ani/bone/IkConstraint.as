package laya.ani.bone {
	import laya.display.Sprite;
	import laya.maths.Matrix;
	
	/**
	 * @private
	 */
	public class IkConstraint {
		
		private var _targetBone:Bone;
		private var _bones:Vector.<Bone>;
		private var _data:IkConstraintData;
		public var name:String;
		public var mix:Number;
		public var bendDirection:Number;
		public var isSpine:Boolean = true;
		static public var radDeg:Number = 180 / Math.PI;
		static public var degRad:Number = Math.PI / 180;
		private static var _tempMatrix:Matrix = new Matrix();
		
		//TODO:coverage
		public function IkConstraint(data:IkConstraintData, bones:Vector.<Bone>) {
			_data = data;
			_targetBone = bones[data.targetBoneIndex];
			isSpine = data.isSpine;
			if (_bones == null) _bones = new Vector.<Bone>();
			_bones.length = 0;
			for (var i:int = 0, n:int = data.boneIndexs.length; i < n; i++) {
				_bones.push(bones[data.boneIndexs[i]]);
			}
			name = data.name;
			mix = data.mix;
			bendDirection = data.bendDirection;
		}
		
		public function apply():void {
			switch (_bones.length) {
			case 1: 
				_applyIk1(_bones[0], _targetBone.resultMatrix.tx, _targetBone.resultMatrix.ty, mix);
				break;
			case 2: 
				if (isSpine)
				{
					_applyIk2(_bones[0], _bones[1], _targetBone.resultMatrix.tx, _targetBone.resultMatrix.ty, bendDirection, mix);// tIkConstraintData.mix);
				}else
				{
					_applyIk3(_bones[0], _bones[1], _targetBone.resultMatrix.tx, _targetBone.resultMatrix.ty, bendDirection, mix);// tIkConstraintData.mix);
				}	
				break;
			}
		}
		
		//TODO:coverage
		private function _applyIk1(bone:Bone, targetX:Number, targetY:Number, alpha:Number):void {
			var pp:Bone = bone.parentBone;
			var id:Number = 1 / (pp.resultMatrix.a * pp.resultMatrix.d - pp.resultMatrix.b * pp.resultMatrix.c);
			var x:Number = targetX - pp.resultMatrix.tx;
			var y:Number = targetY - pp.resultMatrix.ty;
			var tx:Number = (x * pp.resultMatrix.d - y * pp.resultMatrix.c) * id - bone.transform.x;
			var ty:Number = (y * pp.resultMatrix.a - x * pp.resultMatrix.b) * id - bone.transform.y;
			var rotationIK:Number = Math.atan2(ty, tx) * radDeg - 0 - bone.transform.skX;
			if (bone.transform.scX < 0) rotationIK += 180;
			if (rotationIK > 180)
				rotationIK -= 360;
			else if (rotationIK < -180) rotationIK += 360;
			bone.transform.skX = bone.transform.skY = bone.transform.skX + rotationIK * alpha;
			bone.update();
		}
		
		//debug相关代码
		private var _sp:Sprite;
		private const isDebug:Boolean = false;
		
		//TODO:coverage
		public function updatePos(x:Number, y:Number):void
		{
			if (_sp)
			{
				_sp.pos(x, y);
			}
		}
		
		//TODO:coverage
		private function _applyIk2(parent:Bone, child:Bone, targetX:Number, targetY:Number, bendDir:int, alpha:Number):void {
			if (alpha == 0) {
				return;
			}
			//spine 双骨骼ik计算
			var px:Number = parent.resultTransform.x, py:Number = parent.resultTransform.y;
			var psx:Number = parent.transform.scX, psy:Number = parent.transform.scY;
			var csx:Number = child.transform.scX;
			var os1:int, os2:int, s2:int;
			if (psx < 0) {
				psx = -psx;
				os1 = 180;
				s2 = -1;
			} else {
				os1 = 0;
				s2 = 1;
			}
			if (psy < 0) {
				psy = -psy;
				s2 = -s2;
			}
			if (csx < 0) {
				csx = -csx;
				os2 = 180;
			} else {
				os2 = 0
			}
			
			var cx:Number = child.resultTransform.x, cy:Number, cwx:Number, cwy:Number;
			var a:Number = parent.resultMatrix.a, b:Number = parent.resultMatrix.c;
			var c:Number = parent.resultMatrix.b, d:Number = parent.resultMatrix.d;
			var u:Boolean = Math.abs(psx - psy) <= 0.0001;
			//求子骨骼的世界坐标点
			if (!u) {
				cy = 0;
				cwx = a * cx + parent.resultMatrix.tx;
				cwy = c * cx + parent.resultMatrix.ty;
			} else {
				cy = child.resultTransform.y;
				cwx = a * cx + b * cy + parent.resultMatrix.tx;
				cwy = c * cx + d * cy + parent.resultMatrix.ty;
			}
			//cwx,cwy为子骨骼应该在的世界坐标
			
			if (isDebug)
			{
				if (!_sp)
				{
					_sp = new Sprite();
					Laya.stage.addChild(_sp);
				} 
				_sp.graphics.clear();
				_sp.graphics.drawCircle(targetX, targetY, 15, "#ffff00");
				
				_sp.graphics.drawCircle(cwx, cwy, 15,"#ff00ff");
			}
			parent.setRotation(Math.atan2(cwy - parent.resultMatrix.ty, cwx - parent.resultMatrix.tx));
			var pp:Bone = parent.parentBone;
			a = pp.resultMatrix.a;
			b = pp.resultMatrix.c;
			c = pp.resultMatrix.b;
			d = pp.resultMatrix.d;
			//逆因子
			var id:Number = 1 / (a * d - b * c);
			//求得IK中的子骨骼角度向量
			var x:Number = targetX - pp.resultMatrix.tx, y:Number = targetY - pp.resultMatrix.ty;
			var tx:Number = (x * d - y * b) * id - px;
			var ty:Number = (y * a - x * c) * id - py;
			
			//求得子骨骼的角度向量
			x = cwx - pp.resultMatrix.tx;
			y = cwy - pp.resultMatrix.ty;
			var dx:Number = (x * d - y * b) * id - px;
			var dy:Number = (y * a - x * c) * id - py;
			//子骨骼的实际长度
			var l1:Number = Math.sqrt(dx * dx + dy * dy);
			//子骨骼的长度
			var l2:Number = child.length * csx;
			var a1:Number, a2:Number;
			if (u) {
				l2 *= psx;
				//求IK的角度
				var cos:Number = (tx * tx + ty * ty - l1 * l1 - l2 * l2) / (2 * l1 * l2);
				if (cos < -1)
					cos = -1;
				else if (cos > 1) cos = 1;
				a2 = Math.acos(cos) * bendDir;
				a = l1 + l2 * cos;
				b = l2 * Math.sin(a2);
				a1 = Math.atan2(ty * a - tx * b, tx * a + ty * b);
			} else {
				a = psx * l2;
				b = psy * l2;
				var aa:Number = a * a, bb:Number = b * b, dd:Number = tx * tx + ty * ty, ta:Number = Math.atan2(ty, tx);
				c = bb * l1 * l1 + aa * dd - aa * bb;
				var c1:Number = -2 * bb * l1, c2:Number = bb - aa;
				d = c1 * c1 - 4 * c2 * c;
				if (d > 0) {
					var q:Number = Math.sqrt(d);
					if (c1 < 0) q = -q;
					q = -(c1 + q) / 2;
					var r0:Number = q / c2, r1:Number = c / q;
					var r:Number = Math.abs(r0) < Math.abs(r1) ? r0 : r1;
					if (r * r <= dd) {
						y = Math.sqrt(dd - r * r) * bendDir;
						a1 = ta - Math.atan2(y, r);
						a2 = Math.atan2(y / psy, (r - l1) / psx);
					}
				}
				var minAngle:Number = 0, minDist:Number = Number.MAX_VALUE, minX:Number = 0, minY:Number = 0;
				var maxAngle:Number = 0, maxDist:Number = 0, maxX:Number = 0, maxY:Number = 0;
				x = l1 + a;
				d = x * x;
				if (d > maxDist) {
					maxAngle = 0;
					maxDist = d;
					maxX = x;
				}
				x = l1 - a;
				d = x * x;
				if (d < minDist) {
					minAngle = Math.PI;
					minDist = d;
					minX = x;
				}
				var angle:Number = Math.acos(-a * l1 / (aa - bb));
				x = a * Math.cos(angle) + l1;
				y = b * Math.sin(angle);
				d = x * x + y * y;
				if (d < minDist) {
					minAngle = angle;
					minDist = d;
					minX = x;
					minY = y;
				}
				if (d > maxDist) {
					maxAngle = angle;
					maxDist = d;
					maxX = x;
					maxY = y;
				}
				if (dd <= (minDist + maxDist) / 2) {
					a1 = ta - Math.atan2(minY * bendDir, minX);
					a2 = minAngle * bendDir;
				} else {
					a1 = ta - Math.atan2(maxY * bendDir, maxX);
					a2 = maxAngle * bendDir;
				}
			}
			var os:Number = Math.atan2(cy, cx) * s2;
			var rotation:Number = parent.resultTransform.skX;
			a1 = (a1 - os) * radDeg + os1 - rotation;
			if (a1 > 180)
				a1 -= 360;
			else if (a1 < -180) a1 += 360;
			parent.resultTransform.x = px;
			parent.resultTransform.y = py;
			parent.resultTransform.skX = parent.resultTransform.skY = rotation + a1 * alpha;
			rotation = child.resultTransform.skX;
			rotation = rotation % 360;
			a2 = ((a2 + os) * radDeg - 0) * s2 + os2 - rotation;
			if (a2 > 180)
				a2 -= 360;
			else if (a2 < -180) a2 += 360;
			child.resultTransform.x = cx;
			child.resultTransform.y = cy;
			child.resultTransform.skX = child.resultTransform.skY = child.resultTransform.skY + a2 * alpha;
			parent.update();
		}
	
		//TODO:coverage
		private function _applyIk3(parent:Bone, child:Bone, targetX:Number, targetY:Number, bendDir:int, alpha:Number):void {
			if (alpha == 0) {
				return;
			}
			var cwx:Number, cwy:Number;
			
			// 龙骨双骨骼ik计算
			
			const x:Number = child.resultMatrix.a * child.length;
			const y:Number = child.resultMatrix.b * child.length;
			
			const lLL:Number = x * x + y * y;
			//child骨骼长度
			const lL:Number = Math.sqrt(lLL);
			
			
			var parentX:Number = parent.resultMatrix.tx;
			var parentY:Number = parent.resultMatrix.ty;
			
			var childX:Number = child.resultMatrix.tx;
			var childY:Number = child.resultMatrix.ty;
			var dX:Number = childX - parentX;
			var dY:Number = childY -  parentY;
			
			const lPP:Number = dX * dX + dY * dY;
			//parent骨骼长度
			const lP:Number = Math.sqrt(lPP);
			
			dX = targetX -parent.resultMatrix.tx;
			dY = targetY - parent.resultMatrix.ty;
			const lTT:Number = dX * dX + dY * dY;
			//parent到ik的长度
			const lT:Number = Math.sqrt(lTT);
			
			var ikRadianA:Number = 0;
			if (lL + lP <= lT || lT + lL <= lP || lT + lP <= lL)//构不成三角形,被拉成直线
			{
				var rate:Number;
				if (lL + lP <= lT)
				{
					rate = 1;
				}else
				{
					rate = -1;
				}
				childX = parentX + rate*(targetX - parentX) * lP / lT;
				childY = parentY + rate*(targetY - parentY) * lP / lT;
			}
			else
			{
				const h:Number = (lPP - lLL + lTT) / (2 * lTT);
				const r:Number = Math.sqrt(lPP - h * h * lTT) / lT;
				const hX:Number = parentX + (dX * h);
				const hY:Number = parentY + (dY * h);
				const rX:Number = -dY * r;
				const rY:Number = dX * r;
				
				if (bendDir>0)
				{
					childX = hX - rX;
					childY = hY - rY;
				}
				else
				{
					childX = hX + rX;
					childY = hY + rY;
				}
				
			}
			cwx = childX;
			cwy = childY;
		
			//cwx,cwy为子骨骼应该在的世界坐标
			
			if (isDebug)
			{
				if (!_sp)
				{
					_sp = new Sprite();
					Laya.stage.addChild(_sp);
				} 
				_sp.graphics.clear();
				_sp.graphics.drawCircle(parentX, parentY, 15,"#ff00ff");
				_sp.graphics.drawCircle(targetX, targetY, 15, "#ffff00");
				
				_sp.graphics.drawCircle(cwx, cwy, 15,"#ff00ff");
			}
			
			
			//根据当前计算出的世界坐标更新骨骼
			
			//更新parent
			var pRotation:Number;
			pRotation = Math.atan2(cwy - parent.resultMatrix.ty, cwx - parent.resultMatrix.tx);
			parent.setRotation(pRotation);
			
			var pTarMatrix:Matrix;
			pTarMatrix = _tempMatrix;
			pTarMatrix.identity();
			pTarMatrix.rotate(pRotation);
			pTarMatrix.scale(parent.resultMatrix.getScaleX(), parent.resultMatrix.getScaleY());
			pTarMatrix.translate(parent.resultMatrix.tx, parent.resultMatrix.ty);
			
			pTarMatrix.copyTo(parent.resultMatrix);
			parent.updateChild();

			
			//更新child
			var childRotation:Number;
			childRotation = Math.atan2(targetY - cwy, targetX - cwx);
			child.setRotation(childRotation);
			
			var childTarMatrix:Matrix;
			childTarMatrix = _tempMatrix;
			childTarMatrix.identity();
			childTarMatrix.rotate(childRotation);
			childTarMatrix.scale(child.resultMatrix.getScaleX(), child.resultMatrix.getScaleY());
			childTarMatrix.translate(cwx, cwy);

			pTarMatrix.copyTo(child.resultMatrix);
			child.updateChild();
		}
	}

}