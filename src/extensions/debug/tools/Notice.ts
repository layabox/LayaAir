import { EventDispatcher } from "laya/events/EventDispatcher"
	/**
	 * 本类用于模块间消息传递
	 * @author ww
	 */
	export class Notice extends EventDispatcher
	{
		
		constructor(){super();}

		private static _instance:Notice;
		static get I():Notice{
			if(!Notice._instance){
				Notice._instance = new Notice();
			}
			return Notice._instance;
		}
		static set I(value){
			Notice._instance = value;
		}
		
		/**
		 * 发送一个消息 
		 * @param type
		 * @param data
		 * 
		 */
		 static notify(type:string,data:any=null):void
		{
			Notice.I.event(type,data);
		}
		/**
		 * 监听一个消息 
		 * @param type
		 * @param _scope
		 * @param fun
		 * @param args
		 * 
		 */
		 static listen(type:string,_scope:any,fun:Function,args:any[]=null,cancelBefore:boolean=false):void
		{
			if(cancelBefore) Notice.cancel(type,_scope,fun);
			Notice.I.on(type,_scope,fun,args);
		}
		/**
		 * 取消监听消息 
		 * @param type
		 * @param _scope
		 * @param fun
		 * 
		 */
		 static cancel(type:string,_scope:any,fun:Function):void
		{
			Notice.I.off(type,_scope,fun);
		}
	}


