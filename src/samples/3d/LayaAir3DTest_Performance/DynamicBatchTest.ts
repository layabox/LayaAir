import { Laya3D } from "Laya3D";
import { Laya } from "Laya";
import { CameraMoveScript } from "../common/CameraMoveScript"
	import { Camera } from "laya/d3/core/Camera"
	import { MeshSprite3D } from "laya/d3/core/MeshSprite3D"
	import { Sprite3D } from "laya/d3/core/Sprite3D"
	import { BaseMaterial } from "laya/d3/core/material/BaseMaterial"
	import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial"
	import { Scene3D } from "laya/d3/core/scene/Scene3D"
	import { Vector3 } from "laya/d3/math/Vector3"
	import { Mesh } from "laya/d3/resource/models/Mesh"
	import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh"
	import { Shader3D } from "laya/d3/shader/Shader3D"
	import { Stage } from "laya/display/Stage"
	import { Handler } from "laya/utils/Handler"
	import { Stat } from "laya/utils/Stat"
	
	export class DynamicBatchTest {
		constructor(){
			Shader3D.debugMode = true;
			Laya3D.init(0, 0);
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			Stat.show();
			
			var scene:Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()) );
			scene.ambientColor = new Vector3(1, 1, 1);
			
			var camera:Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 1000)) );
			camera.transform.translate(new Vector3(0, 50, 100));
			camera.transform.rotate(new Vector3(-30, 0, 0), true, false);
			camera.addComponent(CameraMoveScript);
			
			var boxMesh:Mesh = PrimitiveMesh.createBox(0.5, 0.5, 0.5);
			var mat:BlinnPhongMaterial = new BlinnPhongMaterial();
			
			Sprite3D.load("Test/Plane/plane.lh", Handler.create(null, function(sprite:Sprite3D):void {
				//Sprite3D.load("../../../../res/threeDimen/staticModel/lizard/lizard.lh", Handler.create(null, function(sprite:Sprite3D):void {
				for (var i:number = 0; i < 30000; i++) {
					//var x:Sprite3D = sprite.clone();
					var x:MeshSprite3D = new MeshSprite3D(boxMesh);
					x.meshRenderer.sharedMaterial = mat;
					//(((x.getChildAt(0) as MeshSprite3D).meshRenderer as MeshRenderer).sharedMaterial as BlinnPhongMaterial).renderQueue = BaseMaterial.RENDERQUEUE_TRANSPARENT;
					x.transform.localPosition = new Vector3(i * 0.001 - 500 * 0.001, 0, 0);
					scene.addChild(x);
				}
			}));
		
		}
	
	}

