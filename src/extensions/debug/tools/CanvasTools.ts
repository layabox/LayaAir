import { Sprite } from "laya/display/Sprite"
	import { Rectangle } from "laya/maths/Rectangle"
	import { RenderSprite } from "laya/renders/RenderSprite"
	import { HTMLCanvas } from "laya/resource/HTMLCanvas"
	import { Texture } from "laya/resource/Texture"
	
	/**
	 * ...
	 * @author ww
	 */
	export class CanvasTools
	{
		
		constructor(){
		
		}
		
		static createCanvas(width:number, height:number):HTMLCanvas
		{
			return null;
			// var rst:HTMLCanvas = new HTMLCanvas("2D");
			// rst.getContext('2d');
			// rst.size(width, height);
			// return rst;
		}
		
		 static renderSpriteToCanvas(sprite:Sprite, canvas:HTMLCanvas, offsetX:number, offsetY:number):void
		{
			(RenderSprite.renders[(sprite as any)._renderType] as any)._fun(sprite, canvas.context, offsetX, offsetY);
		}
		
		 static getImageDataFromCanvas(canvas:HTMLCanvas, x:number = 0, y:number = 0, width:number = 0, height:number = 0):any
		{
			if (width <= 0)
				width = canvas.width;
			if (height <= 0)
				height = canvas.height;
			var imgdata:any = null;//canvas.context.getImageData(x, y, width, height);
			return imgdata;
		}
		 static getImageDataFromCanvasByRec(canvas:HTMLCanvas, rec:Rectangle):any
		{
			var imgdata:any = null;// canvas.context.getImageData(rec.x, rec.y, rec.width, rec.height);
			return imgdata;
		}
		 static getDifferCount(imageData1:any, imageData2:any):number
		{
			var data1:any[] = imageData1.data;
			var data2:any[]  = imageData2.data;
			var differCount:number;
			differCount = 0;
			CanvasTools.walkImageData(imageData1, myWalkFun);
			return differCount;
			function myWalkFun(i:number, j:number, tarPos:number, data:any[]):void
			{
				if (!CanvasTools.isPoinSame(tarPos, data1, data2)) differCount++;
			}
		}
		 static getDifferRate(imageData1:any, imageData2:any):number
		{
			return CanvasTools.getDifferCount(imageData1,imageData2)/(imageData1.width * imageData1.height);
		}
		 static getCanvasDisRec(canvas:HTMLCanvas):Rectangle
		{
			var rst:Rectangle;
			rst = new Rectangle;
			var imgdata:any;
			imgdata = CanvasTools.getImageDataFromCanvas(canvas, 0, 0);
			
			var maxX:number;
			var minX:number;
			var maxY:number;
			var minY:number;
			maxX = maxY = 0;
			minX = imgdata.width;
			minY = imgdata.height;
			var i:number, iLen:number;
			var j:number, jLen:number;
			iLen = imgdata.width;
			jLen = imgdata.height;
			var data:any[];
			data = imgdata.data;
			var tarPos:number = 0;
			
			for (j = 0; j < jLen; j++)
			{
				for (i = 0; i < iLen; i++)
				{
					if (!CanvasTools.isEmptyPoint(data, tarPos))
					{
						if (minX > i)
							minX = i;
						if (maxX < i)
							maxX = i;
						if (minY > j)
							minY = j;
						if (maxY < j)
							maxY = j;
					}
					tarPos += 4;
				}
			}
			rst.setTo(minX, minY, maxX - minX+1, maxY - minY+1);
			return rst;
		}

		static fillCanvasRec(canvas:HTMLCanvas, rec:Rectangle, color:string):void
		{
			var ctx:any= canvas.context;
			ctx.fillStyle=color;
            ctx.fillRect(rec.x,rec.y,rec.width,rec.height);
		}

		static isEmptyPoint(data:any[], pos:number):boolean
		{
			if (data[pos] == 0 && data[pos + 1] == 0 && data[pos + 2] == 0 && data[pos + 3] == 0)
			{
				return true;
			}
			else
			{
				return false;
			}
		}
		
		static isPoinSame(pos:number, data1:any[], data2:any[]):boolean
		{
			if (data1[pos] == data2[pos] && data1[pos + 1] == data2[pos + 1] && data1[pos + 2] == data2[pos + 2] && data1[pos + 3] == data2[pos + 3])
			{
				return true;
			}
			else
			{
				return false;
			}
		}
		
		static walkImageData(imgdata:any, walkFun:Function):void
		{
			var i:number, iLen:number;
			var j:number, jLen:number;
			iLen = imgdata.width;
			jLen = imgdata.height;
			var tarPos:number = 0;
			var data:any[] = imgdata.data;
			for (i = 0; i < iLen; i++)
			{
				for (j = 0; j < jLen; j++)
				{
					walkFun(i, j, tarPos, data);
					tarPos += 4;
				}
			}
		}
		

		
		static renderSpritesToCanvas(canvas:HTMLCanvas, sprites:any[], offx:number = 0, offy:number = 0, startIndex:number = 0):void
		{
			var i:number, len:number;
			len = sprites.length;
			for (i = startIndex; i < len; i++)
			{
				CanvasTools.renderSpriteToCanvas(sprites[i], canvas, offx, offy);
			}
		}
		
		 static clearCanvas(canvas:HTMLCanvas):void
		{
			var preWidth:number;
			var preHeight:number;
			preWidth = canvas.width;
			preHeight = canvas.height;
			canvas.size(preWidth + 1, preHeight);
			canvas.size(preWidth, preHeight);
		}
		
		 static getImagePixels(x:number, y:number, width:number, data:any[],colorLen:number=4):any[]
		{
			var pos:number;
			pos = (x * width + y)*colorLen;
			var i:number, len:number;
			var rst:any[];
			rst = [];
			len = colorLen;
			for (i = 0; i < len; i++)
			{
				rst.push(data[pos+i]);
			}
			return rst;
		}
	}


