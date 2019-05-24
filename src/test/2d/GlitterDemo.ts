import { Laya3D } from "./Laya3D";
import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera"
	import { Glitter } from "laya/d3/core/glitter/Glitter"
	import { GlitterMaterial } from "laya/d3/core/material/GlitterMaterial"
	import { Scene } from "laya/d3/core/scene/Scene"
	import { Matrix4x4 } from "laya/d3/math/Matrix4x4"
	import { Vector3 } from "laya/d3/math/Vector3"
	import { Vector4 } from "laya/d3/math/Vector4"
	import { Texture2D } from "laya/d3/resource/Texture2D"
	import { GlitterTemplet } from "laya/d3/resource/tempelet/GlitterTemplet"
	import { Stage } from "laya/display/Stage"
	import { Stat } from "laya/utils/Stat"
	import { CameraMoveScript } from "../3d/common/CameraMoveScript"
	
	/** @private */
	export class GlitterDemo {
		
		private glitter:Glitter;
		private pos1:Vector3 = new Vector3(0, 0, -0.5);
		private pos2:Vector3 = new Vector3(0, 0, 0.5);
		private scaleDelta:number = 0;
		private scaleValue:number = 0;
		
		constructor(){
			
			Laya3D.init(0, 0, true);
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			Stat.show();
			
			var scene:Scene = (<Scene>Laya.stage.addChild(new Scene()) );
			
			var camera:Camera = (<Camera>scene.addChild(new Camera(0, 1, 1000)) );
			camera.transform.translate(new Vector3(0, 6, 10));
			camera.transform.rotate(new Vector3( -30, 0, 0), true, false);
			camera.addComponent(CameraMoveScript)
			
			this.glitter = (<Glitter>scene.addChild(new Glitter()) );
			var glitterTemplet:GlitterTemplet = this.glitter.templet;
			var glitterMaterial:GlitterMaterial = (<GlitterMaterial>this.glitter.glitterRender.sharedMaterial );
			glitterMaterial.diffuseTexture = Texture2D.load("res/threeDimen/layabox.png");
			glitterMaterial.albedo = new Vector4(1.3, 1.3, 1.3, 1);
			glitterTemplet.lifeTime = 1.3;
			glitterTemplet.minSegmentDistance = 0.1;
			glitterTemplet.minInterpDistance = 0.6;
			glitterTemplet.maxSlerpCount = 128;
			glitterTemplet.maxSegments = 600;
			
			Laya.timer.frameLoop(1, this, this.loop);
		}
		
		private loop():void {
			this.scaleValue = Math.sin(this.scaleDelta += 0.01);
			this.pos1.elements[0] = this.pos2.elements[0] = this.scaleValue * 13;  
			this.pos1.elements[1] = Math.sin(this.scaleValue * 20) * 2;
			this.pos2.elements[1] = Math.sin(this.scaleValue * 20) * 2;
			this.glitter.addGlitterByPositions(this.pos1, this.pos2);
		}
	}

