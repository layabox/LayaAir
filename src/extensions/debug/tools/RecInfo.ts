///////////////////////////////////////////////////////////
//  RecInfo.as
//  Macromedia ActionScript Implementation of the Class RecInfo
//  Created on:      2015-12-23 下午12:00:48
//  Original author: ww
///////////////////////////////////////////////////////////

import { Sprite } from "laya/display/Sprite"
import { Point } from "laya/maths/Point"
	
	/**
	 * 
	 * @author ww
	 * @version 1.0
	 * 
	 * @created  2015-12-23 下午12:00:48
	 */
	export class RecInfo
	{
		constructor(){
		}
		 oX:number=0;
		 oY:number=0;
		 hX:number=1;
		 hY:number = 0;
		 vX:number = 0;
		 vY:number = 1;
		
		 get x():number
		{
			return this.oX;
		}
		 get y():number
		{
			return this.oY;
		}
		 get width():number
		{
			return Math.sqrt((this.hX-this.oX)*(this.hX-this.oX)+(this.hY-this.oY)*(this.hY-this.oY));
		}
		 get height():number
		{
			return Math.sqrt((this.vX-this.oX)*(this.vX-this.oX)+(this.vY-this.oY)*(this.vY-this.oY));
		}
		
		 get rotation():number
		{
			return this.rotationRad/Math.PI*180;
		}
		 get rotationRad():number
		{
			var dx:number=this.hX-this.oX;
			var dy:number=this.hY-this.oY;
			return Math.atan2(dy,dx);
		}
		
		 get rotationV():number
		{
			return this.rotationRadV/Math.PI*180;
		}
		 get rotationRadV():number
		{
			var dx:number=this.vX-this.oX;
			var dy:number=this.vY-this.oY;
			return Math.atan2(dy,dx);
		}
		 initByPoints(oPoint:Point,ePoint:Point,vPoint:Point):void
		{
			this.oX=oPoint.x;
			this.oY=oPoint.y;
			this.hX=ePoint.x;
			this.hY = ePoint.y;
			this.vX = vPoint.x;
			this.vY = vPoint.y;
		}
		
		 static createByPoints(oPoint:Point,ePoint:Point,vPoint:Point):RecInfo
		{
			var rst:RecInfo;
			rst=new RecInfo();
			rst.initByPoints(oPoint,ePoint,vPoint);
			return rst;
		}
		
		 static getGlobalPoints(sprite:Sprite, x:number, y:number):Point
		{
			return sprite.localToGlobal(new Point(x,y));
		}
		
		 static getGlobalRecInfo(sprite:Sprite, x0:number=0, y0:number=0, x1:number=1, y1:number=0, x2:number=0, y2:number=1):RecInfo
		{
			return RecInfo.createByPoints(RecInfo.getGlobalPoints(sprite,x0,y0),RecInfo.getGlobalPoints(sprite,x1,y1),RecInfo.getGlobalPoints(sprite,x2,y2));
		}
	}

