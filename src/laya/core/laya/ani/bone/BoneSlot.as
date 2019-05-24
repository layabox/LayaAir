package laya.ani.bone {
	
	import laya.ani.bone.canvasmesh.SkinMeshForGraphic;
	import laya.ani.GraphicsAni;
	import laya.display.Graphics;
	import laya.maths.Matrix;
	import laya.renders.Render;
	import laya.resource.Texture;
	import laya.display.Sprite;
	import laya.utils.Utils;
	
	/**
	 * @private
	 */
	public class BoneSlot {
		
		/** 插槽名称 */
		public var name:String;
		/** 插槽绑定的骨骼名称 */
		public var parent:String;
		/** 插糟显示数据数据的名称 */
		public var attachmentName:String;
		/** 原始数据的索引 */
		public var srcDisplayIndex:int = -1;
		/** 判断对象是否是原对象 */
		public var type:String = "src";
		/** 模板的指针 */
		public var templet:Templet;
		/** 当前插槽对应的数据 */
		public var currSlotData:SlotData;
		/** 当前插槽显示的纹理 */
		public var currTexture:Texture;
		/** 显示对象对应的数据 */
		public var currDisplayData:SkinSlotDisplayData;
		
		/** 显示皮肤的索引 */
		public var displayIndex:int = -1;
		/** @private */
		public var originalIndex:int = -1;
		
		/** 用户自定义的皮肤 */
		private var _diyTexture:Texture;
		private var _parentMatrix:Matrix;	// 指向了骨骼的resultMatrix
		private var _resultMatrix:Matrix;	// 只有不使用缓冲时才使用
		/** 索引替换表 */
		private var _replaceDic:Object = { };
		/** 当前diyTexture的动画纹理 */
		private var _curDiyUV:Array;
		private var _curDiyVS:Array;
		
		/** 实时模式下，复用使用 */
		private var _skinSprite:*;
		/** @private 变形动画数据 */
		public var deformData:Array;
		
		/**
		 * 设置要显示的插槽数据
		 * @param	slotData
		 * @param	disIndex
		 * @param	freshIndex 是否重置纹理
		 */
		public function showSlotData(slotData:SlotData,freshIndex:Boolean=true):void {
			currSlotData = slotData;
			if(freshIndex)
			displayIndex = srcDisplayIndex;
			currDisplayData = null;
			currTexture = null;
		}
		
		/**
		 * 通过名字显示指定对象
		 * @param	name
		 */
		public function showDisplayByName(name:String):void
		{
			if (currSlotData) {	
				showDisplayByIndex(currSlotData.getDisplayByName(name));
			}
		}
		
		/**
		 * 替换贴图名
		 * @param	tarName 要替换的贴图名
		 * @param	newName 替换后的贴图名
		 */
		public function replaceDisplayByName(tarName:String, newName:String):void
		{
			if (!currSlotData) return;
			var preIndex:int;
			preIndex = currSlotData.getDisplayByName(tarName);
			var newIndex:int;
			newIndex = currSlotData.getDisplayByName(newName);
			replaceDisplayByIndex(preIndex, newIndex);
		}
		
		/**
		 * 替换贴图索引
		 * @param	tarIndex 要替换的索引
		 * @param	newIndex 替换后的索引
		 */
		public function replaceDisplayByIndex(tarIndex:int, newIndex:int):void
		{
			if (!currSlotData) return;
			_replaceDic[tarIndex] = newIndex;
			if (originalIndex == tarIndex)
			{
				showDisplayByIndex(tarIndex);
			}
		}
		
		/**
		 * 指定显示对象
		 * @param	index
		 */
		public function showDisplayByIndex(index:int):void {
			originalIndex = index;
			if (_replaceDic[index]!=null) index = _replaceDic[index];
			if (currSlotData && index > -1 && index < currSlotData.displayArr.length) {
				displayIndex = index;
				currDisplayData = currSlotData.displayArr[index];
				if (currDisplayData) {
					var tName:String = currDisplayData.name;
					currTexture = templet.getTexture(tName);
					if (currTexture && currDisplayData.type == 0 && currDisplayData.uvs)
					{
						currTexture = currDisplayData.createTexture(currTexture);
					}
				}
			} else {
				displayIndex = -1;
				currDisplayData = null;
				currTexture = null;
			}
		}
		
		
		/**
		 * 替换皮肤
		 * @param	_texture
		 */
		public function replaceSkin(_texture:Texture):void {
			_diyTexture = _texture;
			if (_curDiyUV) _curDiyUV.length = 0;
			if (currDisplayData&&_diyTexture == currDisplayData.texture)
			{
				_diyTexture = null;
			}
		}
		
		/**
		 * 保存父矩阵的索引
		 * @param	parentMatrix
		 */
		//TODO:coverage
		public function setParentMatrix(parentMatrix:Matrix):void {
			_parentMatrix = parentMatrix;
		}
		
		private var _mVerticleArr:Array;
		private static var _tempMatrix:Matrix = new Matrix();
		
		//TODO:coverage
		public static function createSkinMesh():*
		{
			return new SkinMeshForGraphic();
		}
		
		//TODO:coverage
		private static function isSameArr(arrA:Array, arrB:Array):Boolean
		{
			if (arrA.length != arrB.length) return false;
			var i:int, len:int;
			len = arrA.length;
			for (i = 0; i < len; i++)
			{
				if (arrA[i] != arrB[i]) return false;
			}
			return true;
		}
		private static var _tempResultMatrix:Matrix = new Matrix();
		
		private var _preGraphicVerticle:Array;
		
		//TODO:coverage
		private function getSaveVerticle(tArr:Array):Array
		{
			if (useSameMatrixAndVerticle&&_preGraphicVerticle && isSameArr(tArr,_preGraphicVerticle))
			{
				tArr = _preGraphicVerticle;
			}else
			{
				tArr=Utils.copyArray([], tArr);
				_preGraphicVerticle = tArr;
			}
			return tArr;
		}
	
		//TODO:coverage
		public static function isSameMatrix(mtA:Matrix, mtB:Matrix):Boolean
		{
			return mtA.a == mtB.a && mtA.b == mtB.b && mtA.c == mtB.c && mtA.d == mtB.d && Math.abs(mtA.tx -mtB.tx)<0.00001 && Math.abs(mtA.ty -mtB.ty)<0.00001;
		}
		
		private var _preGraphicMatrix:Matrix;
		
		private static var useSameMatrixAndVerticle:Boolean=true;
		
		//TODO:coverage
		private function getSaveMatrix(tResultMatrix:Matrix):Matrix
		{
			if (useSameMatrixAndVerticle&&_preGraphicMatrix && isSameMatrix(tResultMatrix, _preGraphicMatrix))
			{
				tResultMatrix = _preGraphicMatrix;
			}else
			{
				var newMatrix:Matrix = tResultMatrix.clone();
				tResultMatrix = newMatrix;
				_preGraphicMatrix = tResultMatrix;
			}
			return tResultMatrix;
		}
		/**
		 * 把纹理画到Graphics上
		 * @param	graphics
		 * @param	noUseSave   不使用共享的矩阵对象 _tempResultMatrix，只有实时计算的时候才设置为true
		 */
		public function draw(graphics:GraphicsAni, boneMatrixArray:Array, noUseSave:Boolean = false, alpha:Number = 1):void {
			if ((_diyTexture == null && currTexture == null) || currDisplayData == null) {
				if (!(currDisplayData && currDisplayData.type == 3))
				{
					return;
				}
			}
			var tTexture:Texture = currTexture;
			if (_diyTexture) tTexture = _diyTexture;
			var tSkinSprite:*;
			switch (currDisplayData.type) {
				case 0: 
					if (graphics) {
						var tCurrentMatrix:Matrix = getDisplayMatrix();
						if (_parentMatrix) {
							var tRotateKey:Boolean = false;		// 是否有旋转
							if (tCurrentMatrix) {
								Matrix.mul(tCurrentMatrix, _parentMatrix, Matrix.TEMP);
								var tResultMatrix:Matrix;
								if (noUseSave) {
									if (_resultMatrix == null) _resultMatrix = new Matrix();
									tResultMatrix = _resultMatrix;
								} else {
									//tResultMatrix = new Matrix();
									tResultMatrix = _tempResultMatrix;
								}
								if (  _diyTexture && currDisplayData.uvs)
								{
									var tTestMatrix:Matrix = _tempMatrix;
									tTestMatrix.identity();
									//判断是否上下反转。
									if (currDisplayData.uvs[1] > currDisplayData.uvs[5])
									{
										tTestMatrix.d = -1;
									}
									//判断是否旋转
									if (currDisplayData.uvs[0] > currDisplayData.uvs[4]
										&& currDisplayData.uvs[1] > currDisplayData.uvs[5])	
									{
										tRotateKey = true;
										tTestMatrix.rotate(-Math.PI/2);
									}
									Matrix.mul(tTestMatrix,Matrix.TEMP,tResultMatrix);
								}else {
									Matrix.TEMP.copyTo(tResultMatrix);
								}
								
								if (!noUseSave)
								{
									tResultMatrix = getSaveMatrix(tResultMatrix);
								}
								tResultMatrix._checkTransform();
								if (tRotateKey)
								{
									graphics.drawTexture(tTexture, -currDisplayData.height / 2, -currDisplayData.width / 2, currDisplayData.height, currDisplayData.width, tResultMatrix,alpha);
								}else {
									graphics.drawTexture(tTexture, -currDisplayData.width / 2, -currDisplayData.height / 2, currDisplayData.width, currDisplayData.height, tResultMatrix,alpha);
								}
							}
						}
					}
					break;
				case 1:
					if (noUseSave) {	
						if (_skinSprite == null) {	
							_skinSprite = createSkinMesh();
						}
						tSkinSprite = _skinSprite;
					}else {
						tSkinSprite = createSkinMesh();
					}
					if (tSkinSprite == null)
					{
						return;
					}
					var tIBArray:Array ;
					var tRed:Number = 1;
					var tGreed:Number = 1;
					var tBlue:Number = 1;
					var tAlpha:Number = 1;
					if (currDisplayData.bones == null)
					{
						var tVertices:Array = currDisplayData.weights;
						if (deformData)
						{
							tVertices = deformData;
						}
						var tUVs:Array;				
						if (_diyTexture)
						{
							if (!_curDiyUV)
							{
								_curDiyUV = [];
							}
							if (_curDiyUV.length == 0)
							{
								_curDiyUV = UVTools.getRelativeUV(this.currTexture.uv, currDisplayData.uvs,_curDiyUV);
								_curDiyUV = UVTools.getAbsoluteUV(this._diyTexture.uv, _curDiyUV, _curDiyUV);
							}
							tUVs = _curDiyUV;
						}else
						{
							tUVs = currDisplayData.uvs;
						}
						
						_mVerticleArr = tVertices;
						var tTriangleNum:int = currDisplayData.triangles.length / 3;
	
						tIBArray = currDisplayData.triangles;
						
						
						if (deformData)
						{
							if (!noUseSave)
							{
								_mVerticleArr = getSaveVerticle(_mVerticleArr);
							}
						}
						tSkinSprite.init2(tTexture, tIBArray,_mVerticleArr,tUVs);
						
						var tCurrentMatrix2:Matrix = getDisplayMatrix();
						if (_parentMatrix) {
							if (tCurrentMatrix2) {
								Matrix.mul(tCurrentMatrix2, _parentMatrix, Matrix.TEMP);
								var tResultMatrix2:Matrix;
								if (noUseSave) {
									if (_resultMatrix == null) _resultMatrix = new Matrix();
									tResultMatrix2 = _resultMatrix;
								} else {
									tResultMatrix2 = _tempResultMatrix;
								}
								Matrix.TEMP.copyTo(tResultMatrix2);
								
								if (!noUseSave)
								{
									tResultMatrix2 = getSaveMatrix(tResultMatrix2);
								}
								tSkinSprite.transform = tResultMatrix2;		
							}
						}
					}else {
						skinMesh(boneMatrixArray,tSkinSprite);
					}
					
					graphics.drawSkin(tSkinSprite,alpha);
					break;
				case 2:
					if (noUseSave) {	
						if (_skinSprite == null) {	
							_skinSprite = createSkinMesh();
						}
						tSkinSprite = _skinSprite;
					}else {
						tSkinSprite = createSkinMesh();
					}
					if (tSkinSprite == null)
					{
						return;
					}
					skinMesh(boneMatrixArray, tSkinSprite);
					graphics.drawSkin(tSkinSprite,alpha);
					break;
				case 3:
					break;
			}
		}
		
		private static var _tempVerticleArr:Array = [];
		/**
		 * 显示蒙皮动画
		 * @param	boneMatrixArray 当前帧的骨骼矩阵
		 */
		private function skinMesh(boneMatrixArray:Array,skinSprite:*):void
		{
			var tTexture:Texture = currTexture;
			var tBones:Array = currDisplayData.bones;
			var tUvs:Array;				
			if (_diyTexture)
			{
				tTexture = _diyTexture;
				if (!_curDiyUV)
				{
					_curDiyUV = [];
				}
				if (_curDiyUV.length == 0)
				{
					_curDiyUV = UVTools.getRelativeUV(this.currTexture.uv, currDisplayData.uvs,_curDiyUV);
					_curDiyUV = UVTools.getAbsoluteUV(this._diyTexture.uv, _curDiyUV, _curDiyUV);
				}
				tUvs = _curDiyUV;
			}else
			{
				tUvs = currDisplayData.uvs;
			}
			
			var tWeights:Array = currDisplayData.weights;
			var tTriangles:Array = currDisplayData.triangles;
			var tIBArray:Array ;
			var tRx:Number = 0;
			var tRy:Number = 0;
			var nn:int = 0;
			var tMatrix:Matrix;
			var tX:Number;
			var tY:Number;
			var tB:Number = 0;
			var tWeight:Number = 0;
			var tVertices:Array;
			var i:int = 0, j:int = 0, n:int = 0;
			var tRed:Number = 1;
			var tGreed:Number = 1;
			var tBlue:Number = 1;
			_tempVerticleArr.length = 0;
			tVertices = _tempVerticleArr;
			if (deformData && deformData.length > 0) {
				var f:Number = 0;
				for (i = 0, n = tBones.length; i < n;)
				{
					nn = tBones[i++] + i;
					tRx = 0, tRy = 0;
					for (; i < nn; i++)
					{
						tMatrix = boneMatrixArray[tBones[i]]
						tX = tWeights[tB] + deformData[f++];
						tY = tWeights[tB + 1] + deformData[f++];
						tWeight = tWeights[tB + 2];
						tRx += (tX * tMatrix.a + tY * tMatrix.c + tMatrix.tx) * tWeight;
						tRy += (tX * tMatrix.b + tY * tMatrix.d + tMatrix.ty) * tWeight;
						tB += 3;
					}
					tVertices.push(tRx, tRy);
				}
			}else {
				for (i = 0, n = tBones.length; i < n;)
				{
					nn = tBones[i++] + i;
					tRx = 0, tRy = 0;
					for (; i < nn; i++)
					{
						tMatrix = boneMatrixArray[tBones[i]]
						tX = tWeights[tB];
						tY = tWeights[tB + 1];
						tWeight = tWeights[tB + 2];
						tRx += (tX * tMatrix.a + tY * tMatrix.c + tMatrix.tx) * tWeight;
						tRy += (tX * tMatrix.b + tY * tMatrix.d + tMatrix.ty) * tWeight;
						tB += 3;
					}
					tVertices.push(tRx, tRy);
				}
			}
			_mVerticleArr = tVertices;
			tIBArray = tTriangles;
			_mVerticleArr = getSaveVerticle(_mVerticleArr);
			skinSprite.init2(tTexture, tIBArray, _mVerticleArr,tUvs);
		}
		
		/**
		 * 画骨骼的起始点，方便调试
		 * @param	graphics
		 */
		public function drawBonePoint(graphics:Graphics):void {
			if (graphics && _parentMatrix) {
				graphics.drawCircle(_parentMatrix.tx, _parentMatrix.ty, 5, "#ff0000");
			}
		}
		
		/**
		 * 得到显示对象的矩阵
		 * @return
		 */
		//TODO:coverage
		private function getDisplayMatrix():Matrix {
			if (currDisplayData) {
				return currDisplayData.transform.getMatrix();
			}
			return null;
		}
		
		/**
		 * 得到插糟的矩阵
		 * @return
		 */
		public function getMatrix():Matrix {
			return _resultMatrix;
		}
		
		/**
		 * 用原始数据拷贝出一个
		 * @return
		 */
		public function copy():BoneSlot {
			var tBoneSlot:BoneSlot = new BoneSlot();
			tBoneSlot.type = "copy";
			tBoneSlot.name = name;
			tBoneSlot.attachmentName = attachmentName;
			tBoneSlot.srcDisplayIndex = srcDisplayIndex;
			tBoneSlot.parent = parent;
			tBoneSlot.displayIndex = displayIndex;
			tBoneSlot.templet = templet;
			tBoneSlot.currSlotData = currSlotData;
			tBoneSlot.currTexture = currTexture;
			tBoneSlot.currDisplayData = currDisplayData;
			return tBoneSlot;
		}
	}
}