import { ISubmit } from "././ISubmit";
import { SubmitKey } from "././SubmitKey";
import { Context } from "../../resource/Context"
	import { Handler } from "../../utils/Handler"
	import { Value2D } from "../shader/d2/value/Value2D"
	import { Buffer2D } from "../utils/Buffer2D"
	import { IndexBuffer2D } from "../utils/IndexBuffer2D"
	import { Mesh2D } from "../utils/Mesh2D"
	import { VertexBuffer2D } from "../utils/VertexBuffer2D"

	export class SubmitCMD implements ISubmit
	{
		 static POOL:any =[];/*[STATIC SAFE]*/ fun:Function;
		 _this:any;	
		 args:any[];
		 _ref:number = 1;
		 _key:SubmitKey=new SubmitKey();
		
		constructor(){
		}
		
		 renderSubmit():number
		{
			this.fun.apply(this._this,this.args);
			return 1;
		}
		
		//TODO:coverage
		 getRenderType():number
		{
			return 0;
		}
		
		//TODO:coverage
		 reUse(context:Context, pos:number):number
		{
			this._ref++;
			return pos;
		}
		
		 releaseRender():void
		{
			if( (--this._ref) <1)
			{
				var pool:any = SubmitCMD.POOL;
				pool[pool._length++] = this;
			}
		}
		
		//TODO:coverage
		 clone(context:Context,mesh:Mesh2D,pos:number):ISubmit
		{
			return null;
		}
		
		 static create(args:any[],fun:Function,thisobj:any):SubmitCMD
		{
			var o:SubmitCMD=SubmitCMD.POOL._length?SubmitCMD.POOL[--SubmitCMD.POOL._length]:new SubmitCMD();
			o.fun=fun;
			o.args = args;
			o._this = thisobj;
			o._ref = 1;
			o._key.clear();
			return o;
		}
	}
{	SubmitCMD.POOL._length=0	}
		
		
