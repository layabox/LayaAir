import { Laya3D } from "Laya3D"
import { Laya } from "Laya";
import { CameraMoveScript } from "../common/CameraMoveScript"
	import { Camera } from "laya/d3/core/Camera"
	import { MeshSprite3D } from "laya/d3/core/MeshSprite3D"
	import { Sprite3D } from "laya/d3/core/Sprite3D"
	import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial"
	import { Scene3D } from "laya/d3/core/scene/Scene3D"
	import { Stage } from "laya/display/Stage"
	import { Handler } from "laya/utils/Handler"
	import { Stat } from "laya/utils/Stat"
	
	export class RigidbodyAnimationDemo {
		constructor(){
			Laya3D.init(0, 0);
			Stat.show();
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
		
			Scene3D.load("res/threeDimen/scene/LayaScene_RigidbodyAnimation/Conventional/scene.ls", Handler.create(this, function(scene:Scene3D):void {
				(<Scene3D>Laya.stage.addChild(scene) );
				var camera:Camera = (<Camera>scene.getChildByName("Main Camera") );
				camera.addComponent(CameraMoveScript);
			}));
		
		}
	
	}

