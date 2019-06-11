import { Laya3D } from "Laya3D";
import { Laya } from "Laya";
import { CameraMoveScript } from "../common/CameraMoveScript"
	import { Camera } from "laya/d3/core/Camera"
	import { Sprite3D } from "laya/d3/core/Sprite3D"
	import { Scene3D } from "laya/d3/core/scene/Scene3D"
	import { Stage } from "laya/display/Stage"
	import { Event } from "laya/events/Event"
	import { Handler } from "laya/utils/Handler"
	import { Stat } from "laya/utils/Stat"
	
	/**
	 * ...
	 * @author ...
	 */
	export class PBRDemo {
		
		constructor(){
			Laya3D.init(0, 0);
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			Stat.show();
			
			Scene3D.load("res/threeDimen/scene/PBRScene/Demo.ls", Handler.create(null, function(scene:Scene3D):void {
				Laya.stage.addChild(scene);
				var camera:Camera = (<Camera>scene.getChildByName("Camera") );
				camera.addComponent(CameraMoveScript);
			}));
		}
	}

