import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Matrix4x4 } from "laya/d3/math/Matrix4x4";
import { Vector3 } from "laya/d3/math/Vector3";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { Texture2D } from "laya/resource/Texture2D";
import { Handler } from "laya/utils/Handler";
import { PerformancePlugin } from "laya/utils/Performance";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
import {PerformanceDataTool} from "../../../extensions/performanceTool/PerformanceDataTool";
import { Button } from "laya/ui/Button";
import { Event } from "laya/events/Event";
import { Browser } from "laya/utils/Browser";
import { Utils } from "laya/utils/Utils";
import Client from "../../Client";

export class PerformancePluginDemo {

	/**实例类型*/
	private btype:any = "PerformancePluginDemo";
	/**场景内按钮类型*/
	private stype:any = 0;
	private changeActionButton:Button;
	constructor() {
		Laya3D.init(0, 0);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		Stat.show();

        PerformancePlugin.setPerformanceDataTool(PerformanceDataTool.instance);
        PerformancePlugin.enable = true; 
        PerformancePlugin.enableDataExport = true;
		PerformanceDataTool.instance.samplerFramStep = 1;
        
		var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));
		scene.ambientColor = new Vector3(1, 1, 1);

		var camera: Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 1000)));
		camera.transform.translate(new Vector3(0, 6.2, 10.5));
		camera.transform.rotate(new Vector3(-40, 0, 0), true, false);
		camera.addComponent(CameraMoveScript);
        this.loadUI();
		Texture2D.load("res/threeDimen/layabox.png", Handler.create(null, function (tex: Texture2D): void {
			var radius: Vector3 = new Vector3(0, 0, 1);
			var radMatrix: Matrix4x4 = new Matrix4x4();
			var circleCount: number = 50;

			var boxMesh: Mesh = PrimitiveMesh.createBox(0.02, 0.02, 0.02);
			var boxMat: BlinnPhongMaterial = new BlinnPhongMaterial();
			boxMat.albedoTexture = tex;
			for (var i: number = 0; i < circleCount; i++) {
				radius.z = 1.0 + i * 0.15;
				radius.y = i * 0.03;
				var oneCircleCount: number = 100 + i * 15;
				for (var j: number = 0; j < oneCircleCount; j++) {
					var boxSprite: MeshSprite3D = new MeshSprite3D(boxMesh);
					boxSprite.meshRenderer.sharedMaterial = boxMat;
					var localPos: Vector3 = boxSprite.transform.localPosition;
					var rad: number = ((Math.PI * 2) / oneCircleCount) * j;
					Matrix4x4.createRotationY(rad, radMatrix);
					Vector3.transformCoordinate(radius, radMatrix, localPos);
					boxSprite.transform.localPosition = localPos;
					scene.addChild(boxSprite);
                    PerformancePlugin.showFunSampleFun(PerformancePlugin.PERFORMANCE_LAYA_3D);
                    
				}
			}
		}));
	}

	private curStateIndex = 0
    private loadUI(): void {

		Laya.loader.load(["res/threeDimen/ui/button.png"], Handler.create(this, function (): void {

			this.changeActionButton = (<Button>Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "Laya3D性能曲线")));
			this.changeActionButton.size(250, 40);
			this.changeActionButton.labelBold = true;
			this.changeActionButton.labelSize = 30;
			this.changeActionButton.sizeGrid = "4,4,4,4";
			this.changeActionButton.scale(Browser.pixelRatio, Browser.pixelRatio);
			this.changeActionButton.pos(Laya.stage.width / 2 - this.changeActionButton.width * Browser.pixelRatio / 2, Laya.stage.height - 100 * Browser.pixelRatio);
			this.changeActionButton.on(Event.CLICK, this, this.stypeFun0);
		}));

	}

	stypeFun0(label:string = "Laya3D性能曲线"): void {
		if (this.curStateIndex % 4 == 0) {
			this.changeActionButton.label = "Laya3D渲染非透明物体曲线";
			PerformancePlugin.showFunSampleFun(PerformancePlugin.PERFORMANCE_LAYA_3D_RENDER_RENDEROPAQUE);
		} else if(this.curStateIndex % 4 == 1){
			this.changeActionButton.label = "Laya3D渲染裁剪曲线";
			PerformancePlugin.showFunSampleFun(PerformancePlugin.PERFORMANCE_LAYA_3D_RENDER_CULLING);
		}else if(this.curStateIndex % 4 == 2){
			this.changeActionButton.label = "Laya3D渲染渲染总体曲线";
			PerformancePlugin.showFunSampleFun(PerformancePlugin.PERFORMANCE_LAYA_3D_RENDER);
		}else if(this.curStateIndex % 4 == 3){
			this.changeActionButton.label = "Laya3D性能曲线";
			PerformancePlugin.showFunSampleFun(PerformancePlugin.PERFORMANCE_LAYA_3D);
		}
		
		this.curStateIndex++;
		label = this.changeActionButton.label;
		Client.instance.send({type:"next",btype:this.btype,stype:0,value:label});	
	}
}

