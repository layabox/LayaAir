import { Laya3D } from "./Laya3D";
import { Laya } from "./Laya";
import { AnimationTemplet } from "../laya/ani/AnimationTemplet"
	import { Animator } from "../laya/d3/component/Animator"
	import { SkinAnimations } from "../laya/d3/component/animation/SkinAnimations"
	import { Camera } from "../laya/d3/core/Camera"
	import { MeshSprite3D } from "../laya/d3/core/MeshSprite3D"
	import { Sprite3D } from "../laya/d3/core/Sprite3D"
	import { DirectionLight } from "../laya/d3/core/light/DirectionLight"
	import { Scene } from "../laya/d3/core/scene/Scene"
	import { Quaternion } from "../laya/d3/math/Quaternion"
	import { Vector3 } from "../laya/d3/math/Vector3"
	import { Vector4 } from "../laya/d3/math/Vector4"
	import { Mesh } from "../laya/d3/resource/models/Mesh"
	import { Stage } from "../laya/display/Stage"
	import { Event } from "../laya/events/Event"
	import { Button } from "../laya/ui/Button"
	import { Browser } from "../laya/utils/Browser"
	import { Handler } from "../laya/utils/Handler"
	import { Stat } from "../laya/utils/Stat"
	import { CameraMoveScript } from "../3d/common/CameraMoveScript"
	/**
	 * ...
	 * @author 
	 */
	export class SkinAnimation_Old 
	{
		private zombie:Sprite3D;
		private changeActionButton:Button;
		private curStateIndex:number = 0;
		private skinAniUrl:any[] = ["res/threeDimen/skinModel/Zombie/old/Assets/Zombie/Model/z@walk-walk.lsani",
			"res/threeDimen/skinModel/Zombie/old/Assets/Zombie/Model/z@attack-attack.lsani",
			"res/threeDimen/skinModel/Zombie/old/Assets/Zombie/Model/z@left_fall-left_fall.lsani",
			"res/threeDimen/skinModel/Zombie/old/Assets/Zombie/Model/z@right_fall-right_fall.lsani",
			"res/threeDimen/skinModel/Zombie/old/Assets/Zombie/Model/z@back_fall-back_fall.lsani"];
		
		constructor(){
			Laya3D.init(0, 0, true);
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			Stat.show();
			
			var scene:Scene = (<Scene>Laya.stage.addChild(new Scene()) );
			
			var camera:Camera = (<Camera>(scene.addChild(new Camera(0, 0.01, 1000))) );
			camera.transform.translate(new Vector3(0, 1.5, 3));
			camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
			
			var directionLight:DirectionLight = (<DirectionLight>scene.addChild(new DirectionLight()) );
			directionLight.direction = new Vector3(0, -0.8, -1);
			directionLight.color = new Vector3(1, 1, 1);
			
			var plane:Sprite3D = (<Sprite3D>scene.addChild(Sprite3D.load("res/threeDimen/skinModel/Zombie/old/Plane.lh")) );
			
			this.zombie = (<Sprite3D>scene.addChild(Sprite3D.load("res/threeDimen/skinModel/Zombie/old/Zombie.lh")) );
			this.zombie.once(Event.HIERARCHY_LOADED, this, function():void{
				this.zombie.transform.rotation = new Quaternion( -0.7071068, 0, 0, -0.7071068);
				this.zombie.transform.position = new Vector3(0.3, 0, 0);
				this.addSkinComponent(this.zombie);
				this.loadUI();
			});
		}
		
		//遍历节点,添加SkinAnimation动画组件
		 addSkinComponent(spirit3D:Sprite3D):void{
			
			if (spirit3D instanceof MeshSprite3D) {
				var meshSprite3D:MeshSprite3D = (<MeshSprite3D>spirit3D );
				var skinAni:SkinAnimations = (<SkinAnimations>meshSprite3D.addComponent(SkinAnimations) );
				skinAni.templet = AnimationTemplet.load(this.skinAniUrl[0]);
				skinAni.player.play();
			}
			for (var i:number = 0, n:number = spirit3D._childs.length; i < n; i++)
				this.addSkinComponent(spirit3D._childs[i]);
		}
		
		//遍历节点,播放动画
		 playSkinAnimation(spirit3D:Sprite3D, index:number):void{
			
			if (spirit3D instanceof MeshSprite3D) {
				var meshSprite3D:MeshSprite3D = (<MeshSprite3D>spirit3D );
				var skinAni:SkinAnimations = (<SkinAnimations>meshSprite3D.getComponentByType(SkinAnimations) );
				skinAni.templet = AnimationTemplet.load(this.skinAniUrl[index]);
				skinAni.player.play();
			}
			for (var i:number = 0, n:number = spirit3D._childs.length; i < n; i++)
				this.playSkinAnimation(spirit3D._childs[i], index);
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
					this.playSkinAnimation(this.zombie, ++this.curStateIndex % this.skinAniUrl.length);
				});
			}));
		}
		
	}

