import { Rect } from "./Rect";
import { Laya } from "Laya";
///////////////////////////////////////////////////////////
//  ArrowLine.as
//  Macromedia ActionScript Implementation of the Class ArrowLine
//  Created on:      2015-12-30 下午2:03:32
//  Original author: ww
///////////////////////////////////////////////////////////

import { Graphics } from "laya/display/Graphics"
	import { Sprite } from "laya/display/Sprite"
	import { Event } from "laya/events/Event"
	
	import { ValueChanger } from "../ValueChanger"
	
	
	/**
	 * 
	 * @author ww
	 * @version 1.0
	 * 
	 * @created  2015-12-30 下午2:03:32
	 */
	export class ArrowLine extends Sprite
	{
		constructor(sign:string="X"){
			super();
			this.sign = sign;
			this.addChild(this.lenControl);
			this.addChild(this.rotationControl);
			this.lenControl.on(Event.MOUSE_DOWN,this,this.controlMouseDown);
			this.drawMe();
			
		}
		 lineLen:number=160;
		 arrowLen:number=10;
		 lenControl:Rect=new Rect();
		 rotationControl:Rect = new Rect();
		 sign:string = "Y";
		 drawMe():void
		{
			var g:Graphics;
			g=this.graphics;
			g.clear();
			g.drawLine(0,0,this.lineLen,0,"#ffff00");
			g.drawLine(this.lineLen,0,this.lineLen-this.arrowLen,-this.arrowLen,"#ff0000");
			g.drawLine(this.lineLen, 0, this.lineLen - this.arrowLen, this.arrowLen, "#ff0000");
			g.fillText(this.sign, 50, -5,"","#ff0000","left");
			
			if(this._isMoving&&this._targetChanger)
			{
				g.fillText(this._targetChanger.key+":"+this._targetChanger.value.toFixed(2), this.lineLen-15, -25,"","#ffff00","center");
			}
			this.lenControl.posTo(this.lineLen-15,0);
			this.rotationControl.posTo(this.lineLen+10,0);
			this.size(this.arrowLen,this.lineLen);
		}

		private lenChanger:ValueChanger=ValueChanger.create(this,"lineLen");
		private lenControlXChanger:ValueChanger=ValueChanger.create(this.lenControl,"x");
		 _targetChanger:ValueChanger;
		 set targetChanger(changer:ValueChanger)
		{
			if(this._targetChanger)
			{
				this._targetChanger.dispose();
			}
			this._targetChanger=changer;
		}
		 get targetChanger():ValueChanger
		{
			return this._targetChanger;
		}
		private clearMoveEvents():void
		{
			Laya.stage.off(Event.MOUSE_MOVE,this,this.stageMouseMove);
			Laya.stage.off(Event.MOUSE_UP,this,this.stageMouseUp);
		}
		private _isMoving:boolean=false;
		private controlMouseDown(e:Event):void
		{
			this.clearMoveEvents();

			this.lenControlXChanger.record();
			this.lenChanger.record();
			if(this.targetChanger)
			{
				this.targetChanger.record();
			}

			this._isMoving=true;
			Laya.stage.on(Event.MOUSE_MOVE,this,this.stageMouseMove);
			Laya.stage.on(Event.MOUSE_UP,this,this.stageMouseUp);
		}
		private stageMouseMove(e:Event):void
		{
			this.lenControlXChanger.value=this.mouseX;
			//lenChanger.showValueByAdd(lenControlXChanger.dValue);
			//if(targetChanger)
			//{
				//targetChanger.showValueByAdd(lenControlXChanger.dValue);
			//}
			
			this.lenChanger.showValueByScale(this.lenControlXChanger.scaleValue);
			if(this.targetChanger)
			{
				this.targetChanger.showValueByScale(this.lenControlXChanger.scaleValue);
			}
			this.drawMe();
		}
		private stageMouseUp(e:Event):void
		{
			this._isMoving=false;
			this.noticeChange();
			this.clearMoveEvents();
			this.lenControlXChanger.recover();
			this.lenChanger.recover();
//			lenControl.x=preX;
//			lineLen=preLen;
			this.drawMe();
		}
		private noticeChange():void
		{
			var dLen:number;
			dLen=this.lenChanger.dValue;
			console.log("lenChange:",dLen);
		}
	}

