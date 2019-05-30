import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Matrix4x4 } from "laya/d3/math/Matrix4x4";
import { Vector3 } from "laya/d3/math/Vector3";
import { Stage } from "laya/display/Stage";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
	
	export class Sprite3DLoad {
		constructor(){
			Laya3D.init(0, 0);
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			Stat.show();
			
			var scene:Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()) );
			scene.ambientColor = new Vector3(1, 1, 1);
			
			var camera:Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 100)) );
			camera.transform.translate(new Vector3(0, 0.5, 1));
			camera.transform.rotate(new Vector3(-15, 0, 2), true, false);
			camera.addComponent(CameraMoveScript);
			
			Sprite3D.load("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh", Handler.create(null, function(sprite:Sprite3D):void {
				scene.addChild(sprite);
				var cameraTransform = camera.transform;
				var cameraPosition:Vector3 = new Vector3();
				var cameraRight:Vector3 = new Vector3();
				var cameraUp:Vector3 = new Vector3();
				var cameraForward:Vector3 = new Vector3();
				var transformMat:Matrix4x4 = new Matrix4x4();
				//设置时钟定时执行
				Laya.timer.frameLoop(1, this, function():void {
				var objectPosition:Vector3 = sprite.transform.position;
				var cameraPosition:Vector3 = cameraTransform.position;
				cameraTransform.getRight(cameraRight);
				cameraTransform.getUp(cameraUp);
				cameraTransform.getForward(cameraForward);
				Matrix4x4.billboard(objectPosition, cameraPosition, cameraRight, cameraUp, cameraForward, transformMat);
				//sprite.transform.worldMatrix = transformMat;
			});
		}));
		}
	}

