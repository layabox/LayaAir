import { MeshSprite3D } from "laya/d3/core/MeshSprite3D"
	import { Sprite3D } from "laya/d3/core/Sprite3D"
	import { UnlitMaterial } from "laya/d3/core/material/UnlitMaterial"
	import { Color } from "laya/d3/math/Color"
	import { Vector3 } from "laya/d3/math/Vector3"
	import { Mesh } from "laya/d3/resource/models/Mesh"
	import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh"
	import { LayaGL } from "laya/layagl/LayaGL"
	import { WebGLContext } from "laya/webgl/WebGLContext"
	import { BaseTexture } from "laya/resource/BaseTexture"
	import { Texture2D } from "laya/resource/Texture2D"
	export class PixGridSprite extends Sprite3D{
		private _meshSprite3D:MeshSprite3D;
		private _texture2D:Texture2D;
		private _unlitMaterial:UnlitMaterial;
		private _long:number;
		private _width:number;
		private _textWidth:number;
		private _textHeight:number;
		private _divide:number;
		private _color:Color;
		private _backPixs:Uint8Array;
		private _newPixs:Uint8Array;
		private _transVector:Vector3;
		/** @private */
		protected _gridWidth:number;
		/**
		 * 网格的宽度
		 */
		 get gridWidth():number {
			return this._gridWidth;
		}
	
		
		constructor(long:number = 10, width:number = 10,color:Color = Color.RED, divide:number = 10){
			super();
this._long = long;
			this._width = width;
			//控制纹理的像素大小
			if(divide >= 40){
				this._textWidth = 1024;
				this._textHeight = 1024;
			}
			else{
				this._textWidth = 512;
				this._textHeight = 512;
			}	
			this._color = color;
			this._divide = divide;
			var row:number = this._divide + 1;//行
			var column:number = this._divide + 1;//列
			//每一个格子的宽度
			this._gridWidth = Math.floor((this._textHeight - row) / this._divide);
			//实际使用的宽度
			var actualWidth:number = this._gridWidth * this._divide + row;
			var tmplong = this._long * (this._textWidth / actualWidth);
			var tmpwidth = this._width * (this._textWidth / actualWidth);
			this._newPixs = new Uint8Array(this._gridWidth * this._gridWidth * 4);
			//创建mesh
			this._meshSprite3D = new MeshSprite3D(PrimitiveMesh.createPlane(tmplong, tmpwidth, 10, 10));
			this.addChild(this._meshSprite3D);
			var tranX:number = (tmplong - this._long) / 2;
			var tranZ:number = (tmpwidth - this._width) / 2;
			this._long = tmplong;
			this._width = tmpwidth;
			this._unlitMaterial = new UnlitMaterial(); 
			this._generateTexture();
			this._divideTexture(color, this._divide);
			
			this._unlitMaterial.albedoTexture = this._texture2D;
			//设置为透明渲染模式
			this._unlitMaterial.renderMode = UnlitMaterial.RENDERMODE_TRANSPARENT;
			//关闭背面剔除
			//_unlitMaterial.getRenderState(0).cull = 0;
			this._meshSprite3D.meshRenderer.material = this._unlitMaterial;
			this._transVector = new Vector3(tranX, 0, tranZ);
			this._meshSprite3D.transform.translate(this._transVector);
		}
		
		/**
		 * 生成纹理，默认状态，未进行绘制网格线
		 */
		private _generateTexture(){
			this._texture2D = new Texture2D(this._textWidth, this._textHeight, BaseTexture.FORMAT_R8G8B8A8, true, true);
			this._texture2D.filterMode = BaseTexture.FILTERMODE_POINT;
			this._texture2D.anisoLevel = 16;
			this._texture2D.wrapModeU = BaseTexture.WARPMODE_CLAMP;
			this._texture2D.wrapModeV = BaseTexture.WARPMODE_CLAMP;
			//初始化颜色，使用默认的颜色(透明的)
			var colorR:number = this._color.r * 255;
			var colorG:number = this._color.g * 255;
			var colorB:number = this._color.b * 255;
			var colorA:number = this._color.a * 255;
			this._backPixs = new Uint8Array(this._textWidth * this._textHeight * 4);
			var pixIndex:number = 0;
			for (var i:number = 0; i < this._textWidth; i++){
				for (var j:number = 0; j < this._textHeight; j++ ){
					pixIndex = (i * this._textWidth + j) * 4;
					this._backPixs[pixIndex++]  = colorR;
					this._backPixs[pixIndex++]  = colorG;
					this._backPixs[pixIndex++]  = colorB;
					this._backPixs[pixIndex++]  = 0;
				}
			}	
			this._texture2D.setPixels(this._backPixs);
			this._texture2D.generateMipmap();
		}
		
		/**
		 * 按照切分次数绘制纹理
		 * @param	color 网格纹理颜色
		 * @param	divide 面板切分的次数
		 */
		private _divideTexture(color:Color, divide:number){
			var pixels:Uint8Array = this._texture2D.getPixels();
			var row:number = divide + 1;//行
			var column:number = divide + 1;//列
			//一个格子的宽度
			this._gridWidth = Math.floor((this._textHeight - row) / divide);
			//重新分配每个格子像素数组
			this._newPixs = new Uint8Array(this._gridWidth * this._gridWidth * 4);
			//实际使用的宽度
			var actualWidth:number = this._gridWidth * divide + row;
			//剩余的宽度
			var remainingWidth:number = this._textHeight - actualWidth;
			
			//重新构建mesh
			if (divide != this._divide){
				var tmplong = this._long * (this._textWidth / actualWidth);
				var tmpwidth = this._width * (this._textWidth / actualWidth);
				this._meshSprite3D.meshFilter.sharedMesh = PrimitiveMesh.createPlane(tmplong, tmpwidth, 10, 10);
				var tranX:number = (tmplong - this._long) / 2;
				var tranZ:number = (tmpwidth - this._width) / 2;
				this._meshSprite3D.transform.translate(new Vector3(tranX, 0.0, tranZ));
				this._long = tmplong;
				this._width = tmpwidth;
				this._divide = divide;
			}
			
			var tmpWidth:number = this._gridWidth + 1;
			var colorR:number = color.r * 255;
			var colorG:number = color.g * 255;
			var colorB:number = color.b * 255;
			var colorA:number = color.a * 255;
			var pixIndex:number = 0;
			for (var i:number = 0; i < actualWidth; ){
				//横线
				for (var j:number = 0; j < actualWidth; j++ ){
					pixIndex = (i * this._textHeight + j) * 4;
					pixels[pixIndex++]  = colorR;
					pixels[pixIndex++]  = colorG;
					pixels[pixIndex++]  = colorB;
					pixels[pixIndex++]  = colorA;
				}
				i += tmpWidth;	
			}	
			for (var m:number = 0; m < actualWidth; ){
				//竖线
				for (var n:number = 0; n < actualWidth; n++ ){
					pixIndex = (n * this._textHeight + m) * 4;
					pixels[pixIndex++]  = colorR;
					pixels[pixIndex++]  = colorG;
					pixels[pixIndex++]  = colorB;
					pixels[pixIndex++]  = colorA;
				}
				m += tmpWidth;
				
			}	
			this._texture2D.setPixels(pixels);
			this._texture2D.generateMipmap();
		}
		
		/**
		 * 设置面板切分的次数
		 * @param	divide 面板切分的次数
		 */
		 setDivide(divide:number){
			var pixs:Uint8Array = this._texture2D.getPixels();
			var colorR:number = this._color.r * 255;
			var colorG:number = this._color.g * 255;
			var colorB:number = this._color.b * 255;
			var colorA:number = this._color.a * 255;
			var pixIndex:number = 0;
			//重置整个纹理的颜色
			for (var i:number = 0; i < this._textWidth; i++){
				for (var j:number = 0; j < this._textHeight; j++ ){
					pixIndex = (i * this._textWidth + j) * 4;
					pixs[pixIndex++]  = colorR;
					pixs[pixIndex++]  = colorG;
					pixs[pixIndex++]  = colorB;
					pixs[pixIndex++]  = 0;
				}
			}	
			this._texture2D.setPixels(pixs);
			this._divideTexture(this._color, divide);
		}
		
		/**
		 * 重新构建面板包括面板的长和宽，划分数量
		 * @param	row 重置面板的长度
		 * @param	column 重置面板的宽度
		 * @param	divide 重置面板切分的次数
		 */
		 resetPlane(long:number, width:number, divide:number):void {
			this._long = long;
			this._width = width;
			this.setDivide(divide);		
		}
		
		/**
		 * 绘制网格,使用颜色绘制一个网格块
		 * @param	row 绘制网格的行数
		 * @param	column 绘制网格的列数
		 * @param	color 网格线的颜色
		 */
		 paintGrid(row:number, column:number, color:Color){
			var x:number = (row - 1) * this._gridWidth + row;
			var y:number = (column - 1) * this._gridWidth + column;
			var sqrtGridWidth:number = this._gridWidth * this._gridWidth;
			var colorR:number = color.r * 255;
			var colorG:number = color.g * 255;
			var colorB:number = color.b * 255;
			var colorA:number = color.a * 255;
			var pixIndex:number = 0;
			var xgridWidth:number = x + this._gridWidth;
			var ygridWidth:number = y + this._gridWidth;
			for (var i:number = y; i < ygridWidth; i++ ){
				var ymWidth:number = i * this._textWidth;
				for (var j:number = x;  j < xgridWidth; j++ ){
					pixIndex = (ymWidth + j ) * 4;
					this._backPixs[pixIndex++]  = colorR;
					this._backPixs[pixIndex++]  = colorG;
					this._backPixs[pixIndex++]  = colorB;
					this._backPixs[pixIndex++]  = colorA;
				}
			}
		}
		
		/**
		 * 绘制网格,使用颜色绘制一个带有边框的网格块
		 * @param	row 绘制网格的行数
		 * @param	column 绘制网格的列数
		 * @param	color 网格线的颜色
		 */
		 paintGridB(row:number, column:number, color:Color, colorBorder:Color):void{
			var x:number = (row - 1) * this._gridWidth + row;
			var y:number = (column - 1) * this._gridWidth + column;
			var sqrtGridWidth:number = this._gridWidth * this._gridWidth;
			var colorR:number = color.r * 255;
			var colorG:number = color.g * 255;
			var colorB:number = color.b * 255;
			var colorA:number = color.a * 255;
			
			var colorBR:number = colorBorder.r * 255;
			var colorBG:number = colorBorder.g * 255;
			var colorBB:number = colorBorder.b * 255;
			var colorBA:number = colorBorder.a * 255;
			
			var pixIndex:number = 0;
			var xgridWidth:number = x + this._gridWidth;
			var ygridWidth:number = y + this._gridWidth;
			for (var i:number = y; i < ygridWidth; i++ ){
				var ymWidth:number = i * this._textWidth;
				for (var j:number = x;  j < xgridWidth; j++ ){
					pixIndex = (ymWidth + j ) * 4;
					if(i == y || i == (ygridWidth-1) || j == x || j == (xgridWidth-1)){
						this._backPixs[pixIndex++]  = colorBR;
						this._backPixs[pixIndex++]  = colorBG;
						this._backPixs[pixIndex++]  = colorBB;
						this._backPixs[pixIndex++]  = colorBA;
					}
					else{
						this._backPixs[pixIndex++]  = colorR;
						this._backPixs[pixIndex++]  = colorG;
						this._backPixs[pixIndex++]  = colorB;
						this._backPixs[pixIndex++]  = colorA;
					}
					
				}
			}
		}
		
		/**
		 * 提交所有绘制
		 */
		 apply():void {
			this._texture2D.setPixels(this._backPixs);
		}
		
		/**
		 * 在网格中绘制一块新的像素块
		 * @param	row 绘制网格的行
		 * @param	column 绘制网格的列
		 * @param	image 使用的像素块
		 */
		 paintGridFigurePixs(row:number, column:number, figurePixs:Uint8Array):void {
			//提供的像素数组长度
			var figurePixsLength:number = figurePixs.length;
			//需求像素数组长度
			var needPixsLength:number = this._gridWidth * this._gridWidth * 4;	
			if(figurePixsLength != needPixsLength){
				console.log("提供的像素图不符合要求！");
				return;
			}
			
			//起始坐标
			var x:number = (row - 1) * this._gridWidth + row;
			var y:number = (column - 1) * this._gridWidth + column;
			var endX:number = this._gridWidth + x;
			var endY:number = this._gridWidth + y;
			var pixIndex:number = 0;
			var figurePixsIndex:number = 0;
			for (var i:number = y;  i < endY;  i++ ){
				var ymWidth:number = i * this._textWidth;
				for (var j:number = x; j < endX; j++ ){
					pixIndex = (ymWidth + j ) * 4;
					this._backPixs[pixIndex++]  = figurePixs[figurePixsIndex++];
					this._backPixs[pixIndex++]  = figurePixs[figurePixsIndex++];
					this._backPixs[pixIndex++]  = figurePixs[figurePixsIndex++];
					this._backPixs[pixIndex++]  = figurePixs[figurePixsIndex++];
				}
			}
		}
		
		/**
		 * 清除所有的绘制，保留网格线
		 */
		 clearAll(){
			this.setDivide(this._divide);
		}
		
		/**
		 * 在网格中绘制一个图片
		 * @param	row 绘制网格的行
		 * @param	column 绘制网格的列
		 * @param	image 使用的图片
		 */
		private paintGridFigureImage(row:number, column:number, image:any){
			//获取image的大小
			var imageHeight:number = image.height;
			var imageWidth:number = image.width;
			//起始坐标
			var x:number = (row - 1) * this._gridWidth + row;
			var y:number = (column - 1) * this._gridWidth + column;
			
			if(imageHeight != this._gridWidth || imageWidth != this._gridWidth){
				console.log("提供的像素图不符合要求！");
				return;
			}
			
			//设置新的局部的像素值
			this.setSubPixsByImage(x, y, image);
			this._texture2D.generateMipmap();
		}
		
		/**
		 * 在这里重新实现了Texture2D的setSubPixels,使用html原生的image作为更改像素的来源
		 * @param	x 更改起始坐标
		 * @param	y 更改起始坐标
		 * @param	image 使用的图片
		 * @param	miplevel 层级
		 */
		private setSubPixsByImage(x:number, y:number, image:any, miplevel:number = 0):void {
			var gl:WebGLContext = LayaGL.instance;
			var textureType:number = ((<any>this._texture2D ))._glTextureType;
			WebGLContext.bindTexture(gl, textureType, ((<any>this._texture2D ))._glTexture);
			var glFormat:number =  ((<any>this._texture2D ))._getGLFormat();
			var format:number = this._texture2D.format;
			if (format === BaseTexture.FORMAT_R8G8B8) {
				gl.pixelStorei(WebGL2RenderingContext.UNPACK_ALIGNMENT, 1);//字节对齐
				gl.texSubImage2D(textureType, miplevel, x, y, glFormat, WebGL2RenderingContext.UNSIGNED_BYTE, image);
				gl.pixelStorei(WebGL2RenderingContext.UNPACK_ALIGNMENT, 4);
			} else {
				gl.texSubImage2D(textureType, miplevel, x, y, glFormat, WebGL2RenderingContext.UNSIGNED_BYTE, image);
			}
			
			((<any>this._texture2D ))._readyed = true;
			((<any>this._texture2D ))._activeResource();
		}
		
		/**
		 * <p>销毁此对象。</p>
		 * @param	destroyChild 是否同时销毁子节点，若值为true,则销毁子节点，否则不销毁子节点。
		 */
		/*override*/  destroy(destroyChild:boolean = true):void {
			if (this.destroyed)
				return;
			this._meshSprite3D.meshFilter.sharedMesh.destroy();
			super.destroy(destroyChild);
			this._meshSprite3D = null;
			this._texture2D.destroy();
			this._texture2D = null;
		}
			
			
	}


