import { ArrowLine } from "./ArrowLine";
import { Rect } from "./Rect";
import { Laya } from "Laya";
///////////////////////////////////////////////////////////
//  Axis.as
//  Macromedia ActionScript Implementation of the Class Axis
//  Created on:      2015-12-30 下午2:37:05
//  Original author: ww
///////////////////////////////////////////////////////////

import { Sprite } from "laya/display/Sprite"
import { Event } from "laya/events/Event"
import { MathUtil } from "laya/maths/MathUtil"
import { Point } from "laya/maths/Point"
import { DisControlTool } from "../DisControlTool"
import { ValueChanger } from "../ValueChanger"
	
	
	/**
	 * 
	 * @author ww
	 * @version 1.0
	 * 
	 * @created  2015-12-30 下午2:37:05
	 */
	export class Axis extends Sprite
	{
		constructor(){
			super();
			this.mouseEnabled=true;
			this.size(1,1);
			this.initMe();
			this.xAxis.rotationControl.on(Event.MOUSE_DOWN,this,this.controlMouseDown);
			this.yAxis.rotationControl.on(Event.MOUSE_DOWN, this, this.controlMouseDown);
			this.controlBox.on(Event.MOUSE_DOWN, this, this.controlBoxMouseDown);
			this.on(Event.DRAG_MOVE, this, this.dragging);
		}
		 xAxis:ArrowLine=new ArrowLine("X");
		 yAxis:ArrowLine=new ArrowLine("Y");
		 controlBox:Rect=new Rect();
		 _target:Sprite;
		
		private _lenType:any[] = 
		[["width","height"],
		  ["scaleX","scaleY"]];
		private _type:number=1;
		 set target(tar:Sprite)
		{
			this._target=tar;
			this.updateChanges();
		}
		private updateChanges():void
		{
			if(this._target)
			{
				var params:any[];
				params=this._lenType[this._type];
				this.xAxis.targetChanger=ValueChanger.create(this._target,params[0]);
				this.yAxis.targetChanger=ValueChanger.create(this._target,params[1]);
			}
		}
		 set type(lenType:number)
		{
		      this._type=lenType;
			  this.updateChanges();
		}
		 get type():number
		{
			return this._type;
		}
		 switchType():void
		{
			this._type++;
			this._type=this._type%this._lenType.length;
			this.type=this._type;
		}
		private controlBoxMouseDown(e:Event):void
		{
			this.startDrag();
			
		}
		private _point:Point = new Point();
		private dragging():void
		{
			if (this._target)
			{
				this._point.setTo(this.x, this.y);
				DisControlTool.transPoint((<Sprite>this.parent ), (<Sprite>this._target.parent ),this._point);
				//trace("point:",);
				this._target.pos(this._point.x,this._point.y);
			}
		}
		 get target():Sprite
		{
			return this._target;
		}
		 initMe():void
		{
			this.addChild(this.xAxis);
			this.addChild(this.yAxis);
			this.yAxis.rotation=90;
			this.addChild(this.controlBox);
			this.controlBox.posTo(0,0);
		}
		
		private clearMoveEvents():void
		{
			Laya.stage.off(Event.MOUSE_MOVE,this,this.stageMouseMove);
			Laya.stage.off(Event.MOUSE_UP,this,this.stageMouseUp);
		}

		private oPoint:Point=new Point();
		
		private myRotationChanger:ValueChanger=ValueChanger.create(this,"rotation");
		
		private targetRotationChanger:ValueChanger=ValueChanger.create(null,"rotation");
		
		private stageMouseRotationChanger:ValueChanger=new ValueChanger();
		
		private controlMouseDown(e:Event):void
		{
			this.targetRotationChanger.target=this.target;
			this.clearMoveEvents();
			this.oPoint.setTo(0,0);
			this.myRotationChanger.record();
			this.oPoint=this.localToGlobal(this.oPoint);
			
			
			this.stageMouseRotationChanger.value=this.getStageMouseRatation();
			this.stageMouseRotationChanger.record();
			this.targetRotationChanger.record();


			Laya.stage.on(Event.MOUSE_MOVE,this,this.stageMouseMove);
			Laya.stage.on(Event.MOUSE_UP,this,this.stageMouseUp);
		}
		private getStageMouseRatation():number
		{
			return MathUtil.getRotation(this.oPoint.x,this.oPoint.y,Laya.stage.mouseX,Laya.stage.mouseY);
		}
		private stageMouseMove(e:Event):void
		{

			this.stageMouseRotationChanger.value=this.getStageMouseRatation();
			var dRotation:number;
			dRotation=-this.stageMouseRotationChanger.dValue;
			
			if(this.target)
			{
				this.targetRotationChanger.showValueByAdd(dRotation);
			}else
			{
				this.myRotationChanger.showValueByAdd(dRotation);
			}
			
		}
		private stageMouseUp(e:Event):void
		{
			this.noticeChange();
			this.clearMoveEvents();

		}
		private noticeChange():void
		{
	         console.log("rotate:",-this.stageMouseRotationChanger.dValue);
		}
	}

