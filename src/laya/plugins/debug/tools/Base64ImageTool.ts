import { Loader } from "../../../../../../core/src/laya/net/Loader"
	import { Texture } from "../../../../../../core/src/laya/resource/Texture"
	import { Browser } from "../../../../../../core/src/laya/utils/Browser"
	/**
	 * ...
	 * @author ww
	 */
	export class Base64ImageTool 
	{
		
		constructor(){
			
		}
		 static getCanvasPic(img:Texture):any
		{
			img=img.bitmap;
			//var canvas:*= Browser.createElement("syscanvas");
			var canvas:any=Browser.createElement("canvas");
			var ctx:any=canvas.getContext('2d');
			
			canvas.height=img.height;
			canvas.width=img.width;
			ctx.drawImage(img.bitmap,0,0);
			return canvas;
		}
		 static getBase64Pic(img:Texture):string
		{
			return Base64ImageTool.getCanvasPic(img).toDataURL("image/png");
		}
		
		 static getPreloads(base64Data:any):any[]
		{
			var rst:any[];
			rst = [];
			var key:string;
			for (key in base64Data)
			{
				rst.push( { url: base64Data[key], type: Loader.IMAGE } );
			}
			return rst;
		}
	}


