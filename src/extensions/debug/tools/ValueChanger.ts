///////////////////////////////////////////////////////////
//  ValueChanger.as
//  Macromedia ActionScript Implementation of the Class ValueChanger
//  Created on:      2015-12-30 下午5:12:53
//  Original author: ww
///////////////////////////////////////////////////////////

	/**
	 * 
	 * @author ww
	 * @version 1.0
	 * 
	 * @created  2015-12-30 下午5:12:53
	 */
	export class ValueChanger
	{
		constructor(){
		}
		 target:any;
		 key:string;
		
		private _tValue:number;
		 get value():number
		{
			if(this.target)
			{
				this._tValue=this.target[this.key];
			}
			
			return this._tValue;
		}
		 set value(nValue:number)
		{
			this._tValue=nValue;
			if(this.target)
			{
				this.target[this.key]=nValue;
			}
			
		}
		 get dValue():number
		{
			return this.value-this.preValue;
		}
		 get scaleValue():number
		{
			return this.value/this.preValue;
		}
		 preValue:number=0;
		 record():void
		{
			this.preValue=this.value;
		}
		 showValueByAdd(addValue:number):void
		{
			this.value=this.preValue+addValue;
		}
		 showValueByScale(scale:number):void
		{
			this.value = this.preValue * scale;
		}
		 recover():void
		{
			this.value=this.preValue;
		}
		 dispose():void
		{
			this.target=null;
		}
		
		 static create(target:any,key:string):ValueChanger
		{
			var rst:ValueChanger;
			rst=new ValueChanger();
			rst.target=target;
			rst.key=key;
			return rst;
		}
	}

