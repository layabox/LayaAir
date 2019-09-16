import { Rectangle } from "laya/maths/Rectangle"
import { Texture } from "laya/resource/Texture"

	/**
	 * ...
	 * @author ww
	 */
	export class UVTools 
	{
		
		constructor(){
			
		}
		
		/**
		 * 矩形区域转UV
		 * @param x
		 * @param y
		 * @param width
		 * @param height
		 * @return 
		 */
		 static getUVByRec(x:number,y:number,width:number,height:number):any[]
		{
			return  [x, y, x + width, y, x + width, y + height, x, y + height];
		}
		
		/**
		 * uv转矩形区域
		 * @param uv
		 * @return 
		 */
		 static getRecFromUV(uv:any[]):Rectangle
		{
			var rst:Rectangle;
			rst=new Rectangle(uv[0],uv[1],uv[2]-uv[0],uv[5]-uv[1]);
			return rst;
		}
		/*
		[
		x, //0
		y, //1
		x + width, //2
		y, //3
		x + width, //4
		y + height, //5
		x, //6
		y + height//7
		]
		*/
		/**
		 * 验证uv数据是否正确 
		 * @param uv
		 * @return 
		 */
		 static isUVRight(uv:any[]):boolean
		{
			if(uv[0]!=uv[6]) return false;
			if(uv[1]!=uv[3]) return false;
			if(uv[2]!=uv[4]) return false;
			if(uv[5]!=uv[7]) return false;
			return true;
		}
		
		/**
		 * 获取Texture的裁剪矩形 
		 * @param texture
		 * @return 
		 */
		 static getTextureRec(texture:Texture):Rectangle
		{
			var rst:Rectangle;
			rst=UVTools.getRecFromUV((texture.uv) as any);
			rst.x*=texture.bitmap.width;
			rst.y*=texture.bitmap.height;
			rst.width*=texture.bitmap.width;
			rst.height*=texture.bitmap.height;
			return rst;
		}
		
	}


