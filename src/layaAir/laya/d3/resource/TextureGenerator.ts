import { Texture2D } from "../../resource/Texture2D"
import { TextureFormat } from "../../resource/TextureFormat";

	
	/**
	 * 贴图生成器
	 * @internal
	 * @author
	 */
	export class TextureGenerator {
		
		constructor(){
		
		}
		
		 static lightAttenTexture(x:number, y:number, maxX:number, maxY:number, index:number, data:Uint8Array):void {
			
			var sqrRange:number = x / maxX;
			var atten:number = 1.0 / (1.0 + 25.0 * sqrRange);
			if (sqrRange >= 0.64) {
				if (sqrRange > 1.0) {
					atten = 0;
				} else {
					atten *= 1 - (sqrRange - 0.64) / (1 - 0.64);
				}
			}
			data[index] = Math.floor(atten * 255.0 + 0.5);
		}
		
		 static haloTexture(x:number, y:number, maxX:number, maxY:number, index:number, data:Uint8Array):void {
			
			maxX >>= 1;
			maxY >>= 1;
			var xFac:number = (x - maxX) / maxX;
			var yFac:number = (y - maxY) / maxY;
			var sqrRange:number = xFac * xFac + yFac * yFac;
			if (sqrRange > 1.0) {
				sqrRange = 1.0;
			}
			data[index] = Math.floor((1.0 - sqrRange) * 255.0 + 0.5);
		}
		
		 static _generateTexture2D(texture:Texture2D, textureWidth:number, textureHeight:number, func:Function):void {
			var index:number = 0;
			var size:number = 0;
			switch (texture.format) {
			case TextureFormat.R8G8B8: 
				size = 3;
				break;
			case TextureFormat.R8G8B8A8: 
				size = 4;
				break;
			case TextureFormat.Alpha8: 
				size = 1;
				break;
			default: 
				throw "GeneratedTexture._generateTexture: unkonw texture format.";
			}

			var data:Uint8Array = new Uint8Array(textureWidth * textureHeight * size);
			for (var y:number = 0; y < textureHeight; y++) {
				for (var x:number = 0; x < textureWidth; x++) {
					func(x, y, textureWidth, textureHeight, index, data);
					index += size;
				}
			}
			texture.setPixels(data);
		}
	
	}


