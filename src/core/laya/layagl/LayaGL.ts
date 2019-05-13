import { CommandEncoder } from "././CommandEncoder";

	/**
	 * @private
	 * 封装GL命令
	 */
	export class LayaGL {
		//-------------------------------------------------------------------------------------
		 static EXECUTE_JS_THREAD_BUFFER:number = 0;			//直接执行JS线程中的buffer
		 static EXECUTE_RENDER_THREAD_BUFFER:number = 1;		//直接执行渲染线程的buffer
		 static EXECUTE_COPY_TO_RENDER:number = 2;				//拷贝buffer到渲染线程
		 static EXECUTE_COPY_TO_RENDER3D:number = 3;			//拷贝3Dbuffer到渲染线程
		
		//-------------------------------------------------------------------------------------
		 static ARRAY_BUFFER_TYPE_DATA:number = 0;           	//创建ArrayBuffer时的类型为Data
		 static ARRAY_BUFFER_TYPE_CMD:number = 1;            	//创建ArrayBuffer时的类型为Command
		
		 static ARRAY_BUFFER_REF_REFERENCE:number = 0;			//创建ArrayBuffer时的类型为引用
		 static ARRAY_BUFFER_REF_COPY:number = 1;				//创建ArrayBuffer时的类型为拷贝
		
		 static UPLOAD_SHADER_UNIFORM_TYPE_ID:number = 0;      //data按照ID传入
		 static UPLOAD_SHADER_UNIFORM_TYPE_DATA:number = 1;    //data按照数据传入
	
		
		 static instance:any;
		
		//TODO:coverage
		 createCommandEncoder(reserveSize:number = 128, adjustSize:number = 64, isSyncToRenderThread:boolean = false):CommandEncoder {
			return new CommandEncoder(this, reserveSize, adjustSize, isSyncToRenderThread);
		}
		
		 beginCommandEncoding(commandEncoder:CommandEncoder):void {
		
		}
		
		 endCommandEncoding():void {
		
		}
		
		//TODO:coverage
		 static getFrameCount():number {
			return 0;
		}
		
		 static syncBufferToRenderThread(value:any,index:number=0):void 
		{
		
		}
		 static createArrayBufferRef(arrayBuffer:any, type:number, syncRender:boolean):void 
		{
		
		}
		 static createArrayBufferRefs(arrayBuffer:any, type:number, syncRender:boolean,refType:number):void 
		{
		
		}
		 matrix4x4Multiply(m1:any,m2:any,out:any):void
		{
			
		}
		 evaluateClipDatasRealTime(nodes:any, playCurTime:number, realTimeCurrentFrameIndexs:any, addtive:boolean):void
		{
			
		}
		
	}



