import { Laya } from "Laya";
import { BaseCamera } from "laya/d3/core/BaseCamera";
import { Camera } from "laya/d3/core/Camera";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { RenderTexture } from "laya/d3/resource/RenderTexture";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Loader } from "laya/net/Loader";
import { Texture2D } from "laya/resource/Texture2D";
import { Button } from "laya/ui/Button";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
	
	export class RenderTargetCamera {
		private pbrTexture:Texture2D;
		constructor(){
			//初始化引擎
			Laya3D.init(0, 0);
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			//显示性能面板
			Stat.show();
			
			//预加载资源
			Laya.loader.create(["res/threeDimen/scene/CourtyardScene/Courtyard.ls","res/threeDimen/texture/earth.png"], Handler.create(this, this.onComplete));
		}
		
		private onComplete():void {
			//加载场景
			var scene:Scene3D = (<Scene3D>Laya.stage.addChild(Loader.getRes("res/threeDimen/scene/CourtyardScene/Courtyard.ls")) );
			//添加相机
			var camera:Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 1000)) );
			camera.transform.translate(new Vector3(57, 2.5, 58));
			camera.transform.rotate(new Vector3(-10, 150, 0), true, false);
			//设置相机清除标识
			camera.clearFlag = BaseCamera.CLEARFLAG_SKY;
			//相机添加视角控制组件(脚本)
			camera.addComponent(CameraMoveScript);
			
			//渲染到纹理的相机
			var renderTargetCamera:Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 1000)) );
			renderTargetCamera.transform.translate(new Vector3(57, 2.5, 58));
			renderTargetCamera.transform.rotate(new Vector3(-10, 150, 0), true, false);
			//选择渲染目标为纹理
			renderTargetCamera.renderTarget = new RenderTexture(2048, 2048);
			//渲染顺序
			renderTargetCamera.renderingOrder = -1;
			//相机添加视角控制组件(脚本)
			renderTargetCamera.addComponent(CameraMoveScript);
			
			//创建网格精灵
			var renderTargetObj:MeshSprite3D = (<MeshSprite3D>scene.getChildAt(0).getChildByName("RenderTarget") );
			
			Laya.loader.load(["res/threeDimen/ui/button.png"], Handler.create(this, function():void {
				var changeActionButton:Button = (<Button>Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "渲染目标")) );
				changeActionButton.size(160, 40);
				changeActionButton.labelBold = true;
				changeActionButton.labelSize = 30;
				changeActionButton.sizeGrid = "4,4,4,4";
				changeActionButton.scale(Browser.pixelRatio, Browser.pixelRatio);
				changeActionButton.pos(Laya.stage.width / 2 - changeActionButton.width * Browser.pixelRatio / 2, Laya.stage.height - 100 * Browser.pixelRatio);
				changeActionButton.on(Event.CLICK, this, function():void {
					//设置网格精灵的纹理
					((<BlinnPhongMaterial>renderTargetObj.meshRenderer.material )).albedoTexture = renderTargetCamera.renderTarget;
				});
			}));
		}
	}

