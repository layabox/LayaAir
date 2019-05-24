package laya.ani.bone {
	import laya.display.Graphics;
	import laya.maths.Matrix;
	
	/**
	 * @private
	 * 路径作用器
	 * 1，生成根据骨骼计算控制点
	 * 2，根据控制点生成路径，并计算路径上的节点
	 * 3，根据节点，重新调整骨骼位置
	 */
	public class PathConstraint {
		
		private static const NONE:int = -1;
		private static const BEFORE:int = -2;
		private static const AFTER:int = -3;
		
		public var target:BoneSlot;
		public var data:PathConstraintData;
		public var bones:Vector.<Bone>;
		public var position:Number;
		public var spacing:Number;
		public var rotateMix:Number;
		public var translateMix:Number;
		
		private var _debugKey:Boolean = false;
		private var _segments:Vector.<Number> = new Vector.<Number>();
		private var _curves:Vector.<Number> = new Vector.<Number>();
		private var _spaces:Vector.<Number>;
		
		public function PathConstraint(data:PathConstraintData, bones:Vector.<Bone>) {
			this.data = data;
			this.position = data.position;
			this.spacing = data.spacing;
			this.rotateMix = data.rotateMix;
			this.translateMix = data.translateMix;
			this.bones = new Vector.<Bone>();
			var tBoneIds:Vector.<int> = this.data.bones;
			for (var i:int = 0, n:int = tBoneIds.length; i < n; i++) {
				this.bones.push(bones[tBoneIds[i]]);
			}
		}
		
		/**
		 * 计算骨骼在路径上的节点
		 * @param	boneSlot
		 * @param	boneMatrixArray
		 * @param	graphics
		 */
		//TODO:coverage
		public function apply(boneList:Vector.<Bone>, graphics:Graphics):void {
			if (!target)
				return;
			var tTranslateMix:Number = this.translateMix;
			var tRotateMix:Number = this.translateMix;
			var tTranslate:Boolean = tTranslateMix > 0;
			var tRotate:Boolean = tRotateMix > 0;
			var tSpacingMode:String = data.spacingMode;
			var tLengthSpacing:Boolean = tSpacingMode == "length";
			var tRotateMode:String = data.rotateMode;
			var tTangents:Boolean = tRotateMode == "tangent";
			var tScale:Boolean = tRotateMode == "chainScale";
			
			var lengths:Vector.<Number> = new Vector.<Number>();
			var boneCount:int = bones.length;
			var spacesCount:int = tTangents ? boneCount : boneCount + 1;
			
			var spaces:Vector.<Number> = new Vector.<Number>();
			_spaces = spaces;
			spaces[0] = position;
			var spacing:Number = this.spacing;
			if (tScale || tLengthSpacing) {
				for (var i:int = 0, n:int = spacesCount - 1; i < n; ) {
					var bone:Bone = bones[i];
					var length:Number = bone.length;
					//var x:Number = length * bone.transform.getMatrix().a;
					//var y:Number = length * bone.transform.getMatrix().c;
					var x:Number = length * bone.resultMatrix.a;
					var y:Number = length * bone.resultMatrix.b;
					length = Math.sqrt(x * x + y * y);
					if (tScale)
						lengths[i] = length;
					spaces[++i] = tLengthSpacing ? Math.max(0, length + spacing) : spacing;
				}
			}
			else {
				for (i = 1; i < spacesCount; i++) {
					spaces[i] = spacing;
				}
			}
			var positions:Vector.<Number> = computeWorldPositions(target, boneList, graphics, spacesCount, tTangents, data.positionMode == "percent", tSpacingMode == "percent");
			if (_debugKey) {
				for (i = 0; i < positions.length; i++) {
					graphics.drawCircle(positions[i++], positions[i++], 5, "#00ff00");
				}
				var tLinePos:Array = [];
				for (i = 0; i < positions.length; i++) {
					tLinePos.push(positions[i++], positions[i++]);
				}
				graphics.drawLines(0, 0, tLinePos, "#ff0000");
			}
			var skeletonX:Number;
			var skeletonY:Number;
			var boneX:Number = positions[0];
			var boneY:Number = positions[1];
			var offsetRotation:Number = data.offsetRotation;
			var tip:Boolean = tRotateMode == "chain" && offsetRotation == 0;
			var p:Number;
			for (i = 0, p = 3; i < boneCount; i++, p += 3) {
				bone = bones[i];
				bone.resultMatrix.tx += (boneX - bone.resultMatrix.tx) * tTranslateMix;
				bone.resultMatrix.ty += (boneY - bone.resultMatrix.ty) * tTranslateMix;
				
				x = positions[p];
				y = positions[p + 1];
				var dx:Number = x - boneX, dy:Number = y - boneY;
				if (tScale) {
					length = lengths[i];
					if (length != 0) {
						var s:Number = (Math.sqrt(dx * dx + dy * dy) / length - 1) * tRotateMix + 1;
						bone.resultMatrix.a *= s;
						bone.resultMatrix.c *= s;
					}
				}
				boneX = x;
				boneY = y;
				if (tRotate) {
					var a:Number = bone.resultMatrix.a;
					//var b:Number = bone.resultMatrix.b;
					//var c:Number = bone.resultMatrix.c;
					var b:Number = bone.resultMatrix.c;
					var c:Number = bone.resultMatrix.b;
					var d:Number = bone.resultMatrix.d;
					var r:Number;
					var cos:Number;
					var sin:Number;
					if (tTangents) {
						r = positions[p - 1];
					}
					else if (spaces[i + 1] == 0) {
						r = positions[p + 2];
					}
					else {
						r = Math.atan2(dy, dx);
					}
					r -= Math.atan2(c, a) - offsetRotation / 180 * Math.PI;
					if (tip) {
						cos = Math.cos(r);
						sin = Math.sin(r);
						length = bone.length;
						boneX += (length * (cos * a - sin * c) - dx) * tRotateMix;
						boneY += (length * (sin * a + cos * c) - dy) * tRotateMix;
					}
					if (r > Math.PI) {
						r -= (Math.PI * 2);
					}
					else if (r < -Math.PI) {
						r += (Math.PI * 2);
					}
					r *= tRotateMix;
					cos = Math.cos(r);
					sin = Math.sin(r);
					bone.resultMatrix.a = cos * a - sin * c;
					bone.resultMatrix.c = cos * b - sin * d;
					bone.resultMatrix.b = sin * a + cos * c;
					bone.resultMatrix.d = sin * b + cos * d;
				}
			}
		}
		private static var _tempMt:Matrix = new Matrix();
		/**
		 * 计算顶点的世界坐标
		 * @param	boneSlot
		 * @param	boneList
		 * @param	start
		 * @param	count
		 * @param	worldVertices
		 * @param	offset
		 */
		//TODO:coverage
		public function computeWorldVertices2(boneSlot:BoneSlot, boneList:Vector.<Bone>, start:int, count:int, worldVertices:Vector.<Number>, offset:int):void {
			var tBones:Array = boneSlot.currDisplayData.bones;
			var tWeights:Array = boneSlot.currDisplayData.weights;
			var tTriangles:Array = boneSlot.currDisplayData.triangles;
			
			var tMatrix:Matrix;
			var i:int = 0;
			var v:int = 0;
			var skip:int = 0;
			var n:int = 0;
			var w:int = 0;
			var b:int = 0;
			var wx:Number = 0;
			var wy:Number = 0;
			var vx:Number = 0;
			var vy:Number = 0;
			var bone:Bone;
			var len:int;
			//if (!tTriangles) tTriangles = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
			
			if (tBones == null) {
				if (!tTriangles) tTriangles = tWeights;
				if (boneSlot.deformData)
					tTriangles = boneSlot.deformData;
				var parentName:String;
				parentName = boneSlot.parent;
				if (boneList)
				{
					len = boneList.length;
					for (i = 0; i < len; i++)
					{
						if (boneList[i].name == parentName)
						{
							bone = boneList[i];
							break;
						}
					}
				}
				var tBoneMt:Matrix;
				if (bone)
				{
					tBoneMt = bone.resultMatrix;
				}
				//bone = boneSlot.parent;
				
				
				if (!tBoneMt) tBoneMt = _tempMt;
				var x:Number = tBoneMt.tx;
				var y:Number = tBoneMt.ty;
				var a:Number = tBoneMt.a, bb:Number = tBoneMt.b, c:Number = tBoneMt.c, d:Number = tBoneMt.d;
				if(bone) d*=bone.d;
				for (v = start, w = offset; w < count; v += 2, w += 2) {
					vx = tTriangles[v], vy = tTriangles[v + 1];
					worldVertices[w] = vx * a + vy * bb + x;
					worldVertices[w + 1] =-( vx * c + vy * d + y);
				}
				return;
			}
			for (i = 0; i < start; i += 2) {
				n = tBones[v];
				v += n + 1;
				skip += n;
			}
			var skeletonBones:Vector.<Bone> = boneList;
			for (w = offset, b = skip * 3; w < count; w += 2) {
				wx = 0, wy = 0;
				n = tBones[v++];
				n += v;
				for (; v < n; v++, b += 3) {
					tMatrix = skeletonBones[tBones[v]].resultMatrix;
					vx = tWeights[b];
					vy = tWeights[b + 1];
					var weight:Number = tWeights[b + 2];
					wx += (vx * tMatrix.a + vy * tMatrix.c + tMatrix.tx) * weight;
					wy += (vx * tMatrix.b + vy * tMatrix.d + tMatrix.ty) * weight;
				}
				worldVertices[w] = wx;
				worldVertices[w + 1] = wy;
			}
		}
		
		/**
		 * 计算路径上的节点
		 * @param	boneSlot
		 * @param	boneList
		 * @param	graphics
		 * @param	spacesCount
		 * @param	tangents
		 * @param	percentPosition
		 * @param	percentSpacing
		 * @return
		 */
		//TODO:coverage
		private function computeWorldPositions(boneSlot:BoneSlot, boneList:Vector.<Bone>, graphics:Graphics, spacesCount:int, tangents:Boolean, percentPosition:Boolean, percentSpacing:Boolean):Vector.<Number> {
			var tBones:Array = boneSlot.currDisplayData.bones;
			var tWeights:Array = boneSlot.currDisplayData.weights;
			var tTriangles:Array = boneSlot.currDisplayData.triangles;
			
			var tRx:Number = 0;
			var tRy:Number = 0;
			var nn:int = 0;
			var tMatrix:Matrix;
			var tX:Number;
			var tY:Number;
			var tB:Number = 0;
			var tWeight:Number = 0;
			var tVertices:Vector.<Number> = new Vector.<Number>();
			var i:int = 0, j:int = 0, n:int = 0;
			var verticesLength:int = boneSlot.currDisplayData.verLen;
			var target:BoneSlot = boneSlot;
			var position:Number = this.position;
			var spaces:Vector.<Number> = this._spaces;
			var world:Vector.<Number> = new Vector.<Number>();
			var out:Vector.<Number> = new Vector.<Number>();
			var closed:Boolean = false;
			var curveCount:int = verticesLength / 6;
			var prevCurve:int = -1;
			var pathLength:Number;
			var o:int, curve:int;
			var p:Number;
			var space:Number;
			var prev:Number;
			var length:Number;
			if (!true) { //path.constantSpeed) {
				var lengths:Vector.<Number> = boneSlot.currDisplayData.lengths as Vector.<Number>;
				curveCount -= closed ? 1 : 2;
				pathLength = lengths[curveCount];
				if (percentPosition)
					position *= pathLength;
				if (percentSpacing) {
					for (i = 0; i < spacesCount; i++)
						spaces[i] *= pathLength;
				}
				world.length = 8;
				//world = this._world;
				
				for (i = 0, o = 0, curve = 0; i < spacesCount; i++, o += 3) {
					space = spaces[i];
					position += space;
					p = position;
					
					if (closed) {
						p %= pathLength;
						if (p < 0)
							p += pathLength;
						curve = 0;
					}
					else if (p < 0) {
						if (prevCurve != BEFORE) {
							prevCurve = BEFORE;
							computeWorldVertices2(target, boneList, 2, 4, world, 0);
						}
						addBeforePosition(p, world, 0, out, o);
						continue;
					}
					else if (p > pathLength) {
						if (prevCurve != AFTER) {
							prevCurve = AFTER;
							computeWorldVertices2(target, boneList, verticesLength - 6, 4, world, 0);
						}
						addAfterPosition(p - pathLength, world, 0, out, o);
						continue;
					}
					
					// Determine curve containing position.
					for (; ; curve++) {
						length = lengths[curve];
						if (p > length)
							continue;
						if (curve == 0)
							p /= length;
						else {
							prev = lengths[curve - 1];
							p = (p - prev) / (length - prev);
						}
						break;
					}
					if (curve != prevCurve) {
						prevCurve = curve;
						if (closed && curve == curveCount) {
							computeWorldVertices2(target, boneList, verticesLength - 4, 4, world, 0);
							computeWorldVertices2(target, boneList, 0, 4, world, 4);
						}
						else
							computeWorldVertices2(target, boneList, curve * 6 + 2, 8, world, 0);
					}
					addCurvePosition(p, world[0], world[1], world[2], world[3], world[4], world[5], world[6], world[7], out, o, tangents || (i > 0 && space == 0));
				}
				return out;
			}
			
			// World vertices.
			if (closed) {
				verticesLength += 2;
				world[verticesLength - 2] = world[0];
				world[verticesLength - 1] = world[1];
			}
			else {
				curveCount--;
				verticesLength -= 4;
				computeWorldVertices2(boneSlot, boneList, 2, verticesLength, tVertices, 0);
				if (_debugKey) {
					for (i = 0; i < tVertices.length; ) {
						graphics.drawCircle(tVertices[i++], tVertices[i++], 10, "#ff0000");
					}
				}
				world = tVertices;
			}
			
			// Curve lengths.
			this._curves.length = curveCount;
			var curves:Vector.<Number> = this._curves;
			pathLength = 0;
			var x1:Number = world[0], y1:Number = world[1], cx1:Number = 0, cy1:Number = 0, cx2:Number = 0, cy2:Number = 0, x2:Number = 0, y2:Number = 0;
			var tmpx:Number, tmpy:Number, dddfx:Number, dddfy:Number, ddfx:Number, ddfy:Number, dfx:Number, dfy:Number;
			var w:int;
			for (i = 0, w = 2; i < curveCount; i++, w += 6) {
				cx1 = world[w];
				cy1 = world[w + 1];
				cx2 = world[w + 2];
				cy2 = world[w + 3];
				x2 = world[w + 4];
				y2 = world[w + 5];
				tmpx = (x1 - cx1 * 2 + cx2) * 0.1875;
				tmpy = (y1 - cy1 * 2 + cy2) * 0.1875;
				dddfx = ((cx1 - cx2) * 3 - x1 + x2) * 0.09375;
				dddfy = ((cy1 - cy2) * 3 - y1 + y2) * 0.09375;
				ddfx = tmpx * 2 + dddfx;
				ddfy = tmpy * 2 + dddfy;
				dfx = (cx1 - x1) * 0.75 + tmpx + dddfx * 0.16666667;
				dfy = (cy1 - y1) * 0.75 + tmpy + dddfy * 0.16666667;
				pathLength += Math.sqrt(dfx * dfx + dfy * dfy);
				dfx += ddfx;
				dfy += ddfy;
				ddfx += dddfx;
				ddfy += dddfy;
				pathLength += Math.sqrt(dfx * dfx + dfy * dfy);
				dfx += ddfx;
				dfy += ddfy;
				pathLength += Math.sqrt(dfx * dfx + dfy * dfy);
				dfx += ddfx + dddfx;
				dfy += ddfy + dddfy;
				pathLength += Math.sqrt(dfx * dfx + dfy * dfy);
				curves[i] = pathLength;
				x1 = x2;
				y1 = y2;
			}
			if (percentPosition)
				position *= pathLength;
			if (percentSpacing) {
				for (i = 0; i < spacesCount; i++)
					spaces[i] *= pathLength;
			}
			
			var segments:Vector.<Number> = this._segments;
			var curveLength:Number = 0;
			var segment:int;
			for (i = 0, o = 0, curve = 0, segment = 0; i < spacesCount; i++, o += 3) {
				space = spaces[i];
				position += space;
				p = position;
				
				if (closed) {
					p %= pathLength;
					if (p < 0)
						p += pathLength;
					curve = 0;
				}
				else if (p < 0) {
					addBeforePosition(p, world, 0, out, o);
					continue;
				}
				else if (p > pathLength) {
					addAfterPosition(p - pathLength, world, verticesLength - 4, out, o);
					continue;
				}
				
				// Determine curve containing position.
				for (; ; curve++) {
					length = curves[curve];
					if (p > length)
						continue;
					if (curve == 0)
						p /= length;
					else {
						prev = curves[curve - 1];
						p = (p - prev) / (length - prev);
					}
					break;
				}
				
				// Curve segment lengths.
				if (curve != prevCurve) {
					prevCurve = curve;
					var ii:int = curve * 6;
					x1 = world[ii];
					y1 = world[ii + 1];
					cx1 = world[ii + 2];
					cy1 = world[ii + 3];
					cx2 = world[ii + 4];
					cy2 = world[ii + 5];
					x2 = world[ii + 6];
					y2 = world[ii + 7];
					tmpx = (x1 - cx1 * 2 + cx2) * 0.03;
					tmpy = (y1 - cy1 * 2 + cy2) * 0.03;
					dddfx = ((cx1 - cx2) * 3 - x1 + x2) * 0.006;
					dddfy = ((cy1 - cy2) * 3 - y1 + y2) * 0.006;
					ddfx = tmpx * 2 + dddfx;
					ddfy = tmpy * 2 + dddfy;
					dfx = (cx1 - x1) * 0.3 + tmpx + dddfx * 0.16666667;
					dfy = (cy1 - y1) * 0.3 + tmpy + dddfy * 0.16666667;
					curveLength = Math.sqrt(dfx * dfx + dfy * dfy);
					segments[0] = curveLength;
					for (ii = 1; ii < 8; ii++) {
						dfx += ddfx;
						dfy += ddfy;
						ddfx += dddfx;
						ddfy += dddfy;
						curveLength += Math.sqrt(dfx * dfx + dfy * dfy);
						segments[ii] = curveLength;
					}
					dfx += ddfx;
					dfy += ddfy;
					curveLength += Math.sqrt(dfx * dfx + dfy * dfy);
					segments[8] = curveLength;
					dfx += ddfx + dddfx;
					dfy += ddfy + dddfy;
					curveLength += Math.sqrt(dfx * dfx + dfy * dfy);
					segments[9] = curveLength;
					segment = 0;
				}
				
				// Weight by segment length.
				p *= curveLength;
				for (; ; segment++) {
					length = segments[segment];
					if (p > length)
						continue;
					if (segment == 0)
						p /= length;
					else {
						prev = segments[segment - 1];
						p = segment + (p - prev) / (length - prev);
					}
					break;
				}
				addCurvePosition(p * 0.1, x1, y1, cx1, cy1, cx2, cy2, x2, y2, out, o, tangents || (i > 0 && space == 0));
			}
			return out;
		}
		
		//TODO:coverage
		private function addBeforePosition(p:Number, temp:Vector.<Number>, i:int, out:Vector.<Number>, o:int):void {
			var x1:Number = temp[i], y1:Number = temp[i + 1], dx:Number = temp[i + 2] - x1, dy:Number = temp[i + 3] - y1, r:Number = Math.atan2(dy, dx);
			out[o] = x1 + p * Math.cos(r);
			out[o + 1] = y1 + p * Math.sin(r);
			out[o + 2] = r;
		}
		
		//TODO:coverage
		private function addAfterPosition(p:Number, temp:Vector.<Number>, i:int, out:Vector.<Number>, o:int):void {
			var x1:Number = temp[i + 2], y1:Number = temp[i + 3], dx:Number = x1 - temp[i], dy:Number = y1 - temp[i + 1], r:Number = Math.atan2(dy, dx);
			out[o] = x1 + p * Math.cos(r);
			out[o + 1] = y1 + p * Math.sin(r);
			out[o + 2] = r;
		}
		
		//TODO:coverage
		private function addCurvePosition(p:Number, x1:Number, y1:Number, cx1:Number, cy1:Number, cx2:Number, cy2:Number, x2:Number, y2:Number, out:Vector.<Number>, o:int, tangents:Boolean):void {
			if (p == 0)
				p = 0.0001;
			var tt:Number = p * p, ttt:Number = tt * p, u:Number = 1 - p, uu:Number = u * u, uuu:Number = uu * u;
			var ut:Number = u * p, ut3:Number = ut * 3, uut3:Number = u * ut3, utt3:Number = ut3 * p;
			var x:Number = x1 * uuu + cx1 * uut3 + cx2 * utt3 + x2 * ttt, y:Number = y1 * uuu + cy1 * uut3 + cy2 * utt3 + y2 * ttt;
			out[o] = x;
			out[o + 1] = y;
			if (tangents) {
				out[o + 2] = Math.atan2(y - (y1 * uu + cy1 * ut * 2 + cy2 * tt), x - (x1 * uu + cx1 * ut * 2 + cx2 * tt));
			}
			else {
				out[o + 2] = 0;
			}
		}
	
	}

}