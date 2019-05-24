package laya.ani.bone {
	
	import laya.display.Sprite;
	import laya.maths.Matrix;
	
	/**
	 * @private
	 */
	public class Bone {
		public static const ShowBones:Object = {};
		public var name:String;
		public var root:Bone;
		public var parentBone:Bone;
		public var length:Number = 10;
		public var transform:Transform;
		public var resultTransform:Transform = new Transform();
		public var resultMatrix:Matrix = new Matrix();
		public var inheritScale:Boolean = true;
		public var inheritRotation:Boolean = true;
		
		public var rotation:Number;
		public var resultRotation:Number;
		public var d:int = -1;
		
		private var _tempMatrix:Matrix;
		private var _children:Vector.<Bone> = new Vector.<Bone>();
		private var _sprite:Sprite;
		
		public function Bone() {
		}
		
		public function setTempMatrix(matrix:Matrix):void {
			_tempMatrix = matrix;
			var i:int = 0, n:int = 0;
			var tBone:Bone;
			for (i = 0, n = _children.length; i < n; i++) {
				tBone = _children[i];
				tBone.setTempMatrix(_tempMatrix);
			}
		}
		
		//TODO:coverage
		public function update(pMatrix:Matrix = null):void {
			rotation = transform.skX;
			var tResultMatrix:Matrix;
			if (pMatrix) {
				tResultMatrix = resultTransform.getMatrix();
				Matrix.mul(tResultMatrix, pMatrix, resultMatrix);
				resultRotation = rotation;
			}
			else {
				resultRotation = rotation + parentBone.resultRotation;
				if (parentBone) {
					if (inheritRotation && inheritScale) {
						tResultMatrix = resultTransform.getMatrix();
						Matrix.mul(tResultMatrix, parentBone.resultMatrix, resultMatrix);
					}
					else {
						var temp:Number = 0;
						var parent:Bone = parentBone;
						var tAngle:Number;
						var cos:Number;
						var sin:Number;
						var tParentMatrix:Matrix = parentBone.resultMatrix;
						
						//var worldX:Number = tParentMatrix.a * transform.x + tParentMatrix.c * transform.y + tParentMatrix.tx;
						//var worldY:Number = tParentMatrix.b * transform.x + tParentMatrix.d * transform.y + tParentMatrix.ty;
						
						//out.tx = ba * atx + bc * aty + btx;
						//out.ty = bb * atx + bd * aty + bty;
						tResultMatrix = resultTransform.getMatrix();
						var worldX:Number = tParentMatrix.a * tResultMatrix.tx + tParentMatrix.c * tResultMatrix.ty + tParentMatrix.tx;
						var worldY:Number = tParentMatrix.b * tResultMatrix.tx + tParentMatrix.d * tResultMatrix.ty + tParentMatrix.ty;
						
						var tTestMatrix:Matrix = new Matrix();
						if (inheritRotation) {
							tAngle = Math.atan2(parent.resultMatrix.b, parent.resultMatrix.a);
							cos = Math.cos(tAngle), sin = Math.sin(tAngle);
							tTestMatrix.setTo(cos, sin, -sin, cos, 0, 0);
							Matrix.mul(_tempMatrix, tTestMatrix, Matrix.TEMP);
							Matrix.TEMP.copyTo(tTestMatrix);
							tResultMatrix = resultTransform.getMatrix();
							Matrix.mul(tResultMatrix, tTestMatrix, resultMatrix);
							if (resultTransform.scX * resultTransform.scY < 0)
							{
								resultMatrix.rotate(Math.PI*0.5);
							}
							resultMatrix.tx = worldX;
							resultMatrix.ty = worldY;
						}
						else if (inheritScale) {
							tResultMatrix = resultTransform.getMatrix();
							Matrix.TEMP.identity();
							Matrix.TEMP.d = d;
							Matrix.mul(tResultMatrix, Matrix.TEMP, resultMatrix);
							resultMatrix.tx = worldX;
							resultMatrix.ty = worldY;
						}
						else {
							tResultMatrix = resultTransform.getMatrix();
							Matrix.TEMP.identity();
							Matrix.TEMP.d = d;
							Matrix.mul(tResultMatrix, Matrix.TEMP, resultMatrix);
							resultMatrix.tx = worldX;
							resultMatrix.ty = worldY;
						}
					}
					
				}
				else {
					tResultMatrix = resultTransform.getMatrix();
					tResultMatrix.copyTo(resultMatrix);
				}
			}
			var i:int = 0, n:int = 0;
			var tBone:Bone;
			for (i = 0, n = _children.length; i < n; i++) {
				tBone = _children[i];
				tBone.update();
			}
		}
		
		//TODO:coverage
		public function updateChild():void {
			var i:int = 0, n:int = 0;
			var tBone:Bone;
			for (i = 0, n = _children.length; i < n; i++) {
				tBone = _children[i];
				tBone.update();
			}
		}
		
		//TODO:coverage
		public function setRotation(rd:Number):void {
			if (_sprite) {
				_sprite.rotation = rd * 180 / Math.PI;
			}
		}
		
		//TODO:coverage
		public function updateDraw(x:Number, y:Number):void {
			if (!ShowBones || ShowBones[this.name]) {
				if (_sprite) {
					_sprite.x = x + resultMatrix.tx;
					_sprite.y = y + resultMatrix.ty;
				}
				else {
					_sprite = new Sprite();
					_sprite.graphics.drawCircle(0, 0, 5, "#ff0000");
					_sprite.graphics.drawLine(0, 0, length, 0, "#00ff00");
					_sprite.graphics.fillText(name, 0, 0, "20px Arial", "#00ff00", "center");
					Laya.stage.addChild(_sprite);
					_sprite.x = x + resultMatrix.tx;
					_sprite.y = y + resultMatrix.ty;
				}
				
			}
			var i:int = 0, n:int = 0;
			var tBone:Bone;
			for (i = 0, n = _children.length; i < n; i++) {
				tBone = _children[i];
				tBone.updateDraw(x, y);
			}
		}
		
		public function addChild(bone:Bone):void {
			_children.push(bone);
			bone.parentBone = this;
		}
		
		//TODO:coverage
		public function findBone(boneName:String):Bone {
			if (this.name == boneName) {
				return this;
			}
			else {
				var i:int, n:int;
				var tBone:Bone;
				var tResult:Bone;
				for (i = 0, n = _children.length; i < n; i++) {
					tBone = _children[i];
					tResult = tBone.findBone(boneName);
					if (tResult) {
						return tResult;
					}
				}
			}
			return null;
		}
		
		//TODO:coverage
		public function localToWorld(local:Vector.<Number>):void {
			var localX:Number = local[0];
			var localY:Number = local[1];
			local[0] = localX * resultMatrix.a + localY * resultMatrix.c + resultMatrix.tx;
			local[1] = localX * resultMatrix.b + localY * resultMatrix.d + resultMatrix.ty;
		}
	
	}

}