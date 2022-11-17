import { Laya } from "Laya";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Stage } from "laya/display/Stage";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { SimpleSkinnedMeshSprite3D } from "laya/d3/core/SimpleSkinnedMeshSprite3D";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { Color } from "laya/d3/math/Color";
import { Animator } from "laya/d3/component/Animator/Animator";

export class SimpleSkinAnimationInstance {
	private animatorName:string[] = ["run","chongci","dead","xuli","stand"];
	private oriSprite3D:Sprite3D;
	private scene:Scene3D;
	private widthNums:number = 30;
	private step:number = 10;
	constructor() {
		Laya3D.init(0, 0);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		Stat.show();
		Shader3D.debugMode = true;
		this.scene = (<Scene3D>Laya.stage.addChild(new Scene3D()));
		this.scene.ambientColor = new Color(0.5, 0.5, 0.5);

		Sprite3D.load("res/threeDimen/texAnimation/Conventional/LayaMonkey.lh", Handler.create(this, function (sprite: Sprite3D): void {
			this.scene.addChild(sprite);
			this.oriSprite3D = this.scene.getChildAt(0).getChildAt(2) as Sprite3D;
			let simple = (this.oriSprite3D as Sprite3D).getChildAt(1);
			(simple as SimpleSkinnedMeshSprite3D).simpleSkinnedMeshRenderer.rootBone = this.oriSprite3D;
			this.sceneBuild();
			var animate:Animator = this.oriSprite3D.getComponent(Animator);
			animate.play("chongci");
			this.cloneSprite(new Vector3(5,0,0),new Vector3());
			//this.oriSprite3D.active = false;
		}));
	}
	cloneSprite(pos:Vector3,quaterial:Vector3){
		var clonesprite:Sprite3D = this.oriSprite3D.clone() as Sprite3D;
		this.scene.addChild(clonesprite);
		var animate:Animator = clonesprite.getComponent(Animator);
		var nums:number = Math.round( Math.random()*4);
		animate.play(this.animatorName[nums],0,Math.random());
        clonesprite.transform.position = pos;
        clonesprite.transform.rotationEuler = quaterial;
	}

	sceneBuild(){
		var left:number = -0.5*this.step*(this.widthNums);
		var right:number = -1*left;
		for(var i:number = left;i<right;i+=this.step)
			for(var j:number = left;j<right;j+=this.step){
                var xchange:number = (Math.random()-0.5)*10;
                var zchange:number = (Math.random()-0.5)*10;
                var quaterial:Vector3 = new Vector3(0,Math.random()*180,0);
				this.cloneSprite(new Vector3(i+xchange,0,j+zchange),quaterial);
			}
	}
}

