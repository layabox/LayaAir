///////////////////////////////////////////////////////////
//  LayoutTools.as
//  Macromedia ActionScript Implementation of the Class LayoutTools
//  Created on:      2015-11-9 下午3:26:01
//  Original author: ww
///////////////////////////////////////////////////////////

import { Sprite } from "laya/display/Sprite"
	
	/**
	 * 
	 * @author ww
	 * @version 1.0
	 * 
	 * @created  2015-11-9 下午3:26:01
	 */
	export class LayoutTools
	{
		constructor(){
		}
		 static layoutToXCount(items:any[], xCount:number=1, dx:number=0, dY:number=0, sx:number=0, sy:number=0):void
		{
			var tX:number, tY:number;
			var tItem:Sprite;
			var i:number, len:number;
			var tCount:number;
			var maxHeight:number;
			tCount = 0;
			maxHeight = 0;
			tX = sx;
			tY = sy;
			len = items.length;
			for (i = 0; i < len; i++)
			{
				tItem = items[i];
				tItem.x = tX;
				tItem.y = tY;
				if (tItem.height > maxHeight)
				{
					maxHeight = tItem.height;
				}
				tCount++;
				if (tCount >= xCount)
				{
					tCount = tCount % xCount;
					tItem.y += maxHeight + dY;
					maxHeight = 0;
				}else
				{
					tX += tItem.width + dx;
				}
			}
		}
		 static layoutToWidth(items:any[],width:number,dX:number,dY:number,sx:number,sy:number):void
		{
			var tX:number,tY:number;
			var tItem:Sprite;
			var i:number,len:number;
			tX=sx;
			tY=sy;
			len=items.length;
			for(i=0;i<len;i++)
			{
				tItem=items[i];
				if(tX+tItem.width+dX>width)
				{
					tX=sx;
					tY+=dY+tItem.height;
				}else
				{
					
				}
				tItem.x=tX;
				tItem.y=tY;
				tX+=dX+tItem.width;
				
			}
		}
	}

