import { FORMAT_R8G8B8A8 } from "./FORMAT_R8G8B8A8";
import { Color } from "laya/d3/math/Color"
	import { WebGLContext } from "laya/webgl/WebGLContext"
	import { BaseTexture } from "laya/resource/BaseTexture"
	import { Texture2D } from "laya/resource/Texture2D"
	export class PixelTexture extends Texture2D {
		private pixels:Uint8Array;
		private _color:Color;
		constructor(color:Color, divide:number = 10, format:number = FORMAT_R8G8B8A8, mipmap:boolean = true, canRead:boolean = true){
			super(512, 512, FORMAT_R8G8B8A8, mipmap, canRead);
			this._color = color;
			this._setFilterMode(BaseTexture.FILTERMODE_TRILINEAR);
			this._setAnisotropy(16);
			this._setWarpMode(WebGLContext.TEXTURE_WRAP_S, BaseTexture.WARPMODE_CLAMP);
			this._setWarpMode(WebGLContext.TEXTURE_WRAP_T,BaseTexture.WARPMODE_CLAMP);
			//初始化颜色，使用默认的颜色(透明的)
			this.pixels = new Uint8Array(this.width * this.height * 4);
			var pixIndex:number = 0;
			for (var i:number = 0; i < this.width; i++){
				for (var j:number = 0; j < this.height; j++ ){
					pixIndex = (i * this.width + j) * 4;
					this.pixels[pixIndex++]  = 255;
					this.pixels[pixIndex++]  = 255;
					this.pixels[pixIndex++]  = 255;
					this.pixels[pixIndex++]  = 255;
				}
			}	
			this.setPixels(this.pixels);
			//绘制线条
			//divideTexture(divide);
		}
		private divideTexture(divide:number = 10){
			var pixels:Uint8Array = this.getPixels();
			var row:number = divide + 1;//行
			var column:number = divide + 1;//列
			//每一个格子的宽度
			var gridWidth:number = Math.floor((this.width - row) / divide);
			//实际使用的宽度
			var actualWidth:number = gridWidth * divide + row;
			var remainingWidth:number = this.width - actualWidth;
			
			var tmpWidth:number = gridWidth + 1;

			var colorR:number = this._color.r * 255;
			var colorG:number = this._color.g * 255;
			var colorB:number = this._color.b * 255;
			var colorA:number = this._color.a * 255;
			var pixIndex:number = 0;
			for (var i:number = 0; i < actualWidth; ){
				//横线
				for (var j:number = 0; j < actualWidth; j++ ){
					pixIndex = (i * this.width + j) * 4;
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
					pixIndex = (n * this.width + m) * 4;
					pixels[pixIndex++]  = colorR;
					pixels[pixIndex++]  = colorG;
					pixels[pixIndex++]  = colorB;
					pixels[pixIndex++]  = colorA;
				}
				m += tmpWidth;
				
			}	
			this.setPixels(pixels);
		}	
	}


