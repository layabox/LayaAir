import { Pool } from "../../utils/Pool"
	
	/**
	 * 绘制Canvas贴图
	 * @private
	 */
	export class DrawCanvasCmd {
		 static ID:string = "DrawCanvasCmd";
		/**@private */
		 static _DRAW_IMAGE_CMD_ENCODER_:any = null;
		/**@private */
		 static _PARAM_TEXTURE_POS_:number = 2;
		/**@private */
		 static _PARAM_VB_POS_:number = 5;
		
		private _graphicsCmdEncoder:any;
		private _index:number;
		private _paramData:any = null;
		/**
		 * 绘图数据
		 */
		 texture:any/*RenderTexture2D*/;
		/**
		 * 绘制区域起始位置x
		 */
		 x:number;
		/**
		 * 绘制区域起始位置y
		 */
		 y:number;
		/**
		 * 绘制区域宽
		 */
		 width:number;
		/**
		 * 绘制区域高
		 */
		 height:number;
		
		/**@private */
		 static create(texture:any/*RenderTexture2D*/, x:number, y:number, width:number, height:number):DrawCanvasCmd {
			return null;
		}
		
		/**
		 * 回收到对象池
		 */
		 recover():void {
			this._graphicsCmdEncoder = null;
			Pool.recover("DrawCanvasCmd", this);
		}
		
		/**@private */
		 get cmdID():string {
			return DrawCanvasCmd.ID;
		}
	
	}

