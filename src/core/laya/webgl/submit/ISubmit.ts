import { Context } from "../../resource/Context"
	export interface ISubmit {
		renderSubmit():number;
		getRenderType():number;
		releaseRender():void;
		reUse(context:Context, pos:number):number;
	}
