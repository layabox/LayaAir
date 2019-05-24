import { Laya3D } from "./Laya3D";
import { Laya } from "Laya";
import { Animator } from "laya/d3/component/Animator"
	import { Camera } from "laya/d3/core/Camera"
	import { Sprite3D } from "laya/d3/core/Sprite3D"
	import { DirectionLight } from "laya/d3/core/light/DirectionLight"
	import { Scene } from "laya/d3/core/scene/Scene"
	import { Vector3 } from "laya/d3/math/Vector3"
	import { Stage } from "laya/display/Stage"
	import { Event } from "laya/events/Event"
	import { Button } from "laya/ui/Button"
	import { Browser } from "laya/utils/Browser"
	import { Handler } from "laya/utils/Handler"
	import { Stat } from "laya/utils/Stat"
	import { CameraMoveScript } from "../3d/common/CameraMoveScript"
	/**
	 * ...
	 * @author 
	 */
	export class SkinAnimation_New
	{
		private changeActionButton:Button;
		private zombieAnimator:Animator;
		private curStateIndex:number = 0;
		private clipName:any[] = ["walk","attack","left_fall","right_fall","back_fall"];
		
		constructor(){
			Laya3D.init(0, 0, true);
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			Stat.show();
			
			var scene:Scene = (<Scene>Laya.stage.addChild(new Scene()) );
			
			var camera:Camera = (<Camera>(scene.addChild(new Camera(0, 0.1, 1000))) );
			camera.transform.translate(new Vector3(0, 1.5, 4));
			camera.transform.rotate(new Vector3( -15, 0, 0), true, false);
			camera.addComponent(CameraMoveScript);
			
			var directionLight:DirectionLight = (<DirectionLight>scene.addChild(new DirectionLight()) );
			directionLight.direction = new Vector3(0, -0.8, -1);
			directionLight.color = new Vector3(1, 1, 1);
			
			var plane:Sprite3D = (<Sprite3D>scene.addChild(Sprite3D.load("res/threeDimen/skinModel/Zombie/new/Plane.lh")) );
			
			var zombie:Sprite3D = (<Sprite3D>scene.addChild(Sprite3D.load("res/threeDimen/skinModel/Zombie/new/Zombie.lh")) );
			zombie.once(Event.HIERARCHY_LOADED, this, function():void{
				//获取Animator动画组件
				this.zombieAnimator = (<Animator>((<Sprite3D>zombie.getChildAt(0) )).getComponentByType(Animator) );
				this.zombieAnimator.clip.islooping = true;
				this.loadUI();
			});
		}
		
		private loadUI():void {
			
			Laya.loader.load(["res/threeDimen/ui/button.png"], Handler.create(null, function():void {
				
				this.changeActionButton = (<Button>Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "切换动作")) );
				this.changeActionButton.size(160, 40);
				this.changeActionButton.labelBold = true;
				this.changeActionButton.labelSize = 30;
				this.changeActionButton.sizeGrid = "4,4,4,4";
				this.changeActionButton.scale(Browser.pixelRatio, Browser.pixelRatio);
				this.changeActionButton.pos(Laya.stage.width / 2 - this.changeActionButton.width * Browser.pixelRatio / 2, Laya.stage.height - 100 * Browser.pixelRatio);
				this.changeActionButton.on(Event.CLICK, this, function():void{
					//根据名称播放动画
					this.zombieAnimator.play(this.clipName[++this.curStateIndex % this.clipName.length]);
				});
				
				var aaa:Button = (<Button>Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "aaaa")) );
				aaa.on(Event.CLICK, this, function():void{
					this.zombieAnimator.stop();
				});
			}));
		}
		
	}

