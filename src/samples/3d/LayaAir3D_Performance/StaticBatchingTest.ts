import { Laya3D } from "Laya3D";
import { Laya } from "Laya";
import { CameraMoveScript } from "../common/CameraMoveScript"
	import { Camera } from "laya/d3/core/Camera"
	import { RenderableSprite3D } from "laya/d3/core/RenderableSprite3D"
	import { Scene3D } from "laya/d3/core/scene/Scene3D"
	import { StaticBatchManager } from "laya/d3/graphics/StaticBatchManager"
	import { Stage } from "laya/display/Stage"
	import { Event } from "laya/events/Event"
	import { Button } from "laya/ui/Button"
	import { Browser } from "laya/utils/Browser"
	import { Handler } from "laya/utils/Handler"
	import { Stat } from "laya/utils/Stat"
	
	/**
	 * ...
	 * @author ...
	 */
	export class StaticBatchingTest {
		private curStateIndex:number = 0;
		private changeActionButton:Button;
		private planeSprite:RenderableSprite3D;
		private cubeSprite:RenderableSprite3D;
		private sphereSprite:RenderableSprite3D;
		private capsuleSprite:RenderableSprite3D;
		private cylinderSprite:RenderableSprite3D;
		private renderableSprite3Ds:RenderableSprite3D[] = [];
		
		constructor(){
			Laya3D.init(0, 0);
			Stat.show();
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			
			Scene3D.load("res/threeDimen/scene/StaticBatching/staticBatching.ls", Handler.create(this, function(scene:Scene3D):void {
				(<Scene3D>Laya.stage.addChild(scene) );
				var camera:Camera = (<Camera>scene.getChildByName("Main Camera") );
				camera.addComponent(CameraMoveScript);
				
				//获取相同材质的精灵
				this.planeSprite = (<RenderableSprite3D>scene.getChildByName("Plane") );
				this.cubeSprite = (<RenderableSprite3D>scene.getChildByName("Cube") );
				this.sphereSprite = (<RenderableSprite3D>scene.getChildByName("Sphere") );
				this.capsuleSprite = (<RenderableSprite3D>scene.getChildByName("Capsule") );
				this.cylinderSprite = (<RenderableSprite3D>scene.getChildByName("Cylinder") );
				
				//精灵设置不开启合并
				this.planeSprite._isStatic = false;
				this.cubeSprite._isStatic = false;
				this.sphereSprite._isStatic = false;
				this.capsuleSprite._isStatic = false;
				this.cylinderSprite._isStatic = false;
				
				//加入到合并数组
				this.renderableSprite3Ds.push(this.planeSprite);
				this.renderableSprite3Ds.push(this.cubeSprite);
				this.renderableSprite3Ds.push(this.sphereSprite);
				this.renderableSprite3Ds.push(this.capsuleSprite);
				this.renderableSprite3Ds.push(this.cylinderSprite);
				
				//生成按钮
				this.loadUI();
			
			}));
		
		}
		
		private loadUI():void {
			Laya.loader.load(["res/threeDimen/ui/button.png"], Handler.create(this, function():void {
				
				this.changeActionButton = (<Button>Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "静态合并")) );
				this.changeActionButton.size(160, 40);
				this.changeActionButton.labelBold = true;
				this.changeActionButton.labelSize = 30;
				this.changeActionButton.sizeGrid = "4,4,4,4";
				this.changeActionButton.scale(Browser.pixelRatio, Browser.pixelRatio);
				this.changeActionButton.pos(Laya.stage.width / 2 - this.changeActionButton.width * Browser.pixelRatio / 2, Laya.stage.height - 100 * Browser.pixelRatio);
				
				this.changeActionButton.on(Event.CLICK, this, function():void {
					//精灵设置开启静态合并
					this.planeSprite._isStatic = true;
					this.cubeSprite._isStatic = true;
					this.sphereSprite._isStatic = true;
					this.capsuleSprite._isStatic = true;
					this.cylinderSprite._isStatic = true;
					//进行静态合并
					StaticBatchManager.combine(null, this.renderableSprite3Ds);
				});
			}));
		}
	
	}


