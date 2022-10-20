import { Laya } from "Laya";
import { Camera, CameraClearFlags } from "laya/d3/core/Camera";
import { SkyBoxMaterial } from "laya/d3/core/material/SkyBoxMaterial";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { SkyBox } from "laya/d3/resource/models/SkyBox";
import { SkyRenderer } from "laya/d3/resource/models/SkyRenderer";
import { Stage } from "laya/display/Stage";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { Material } from "laya/d3/core/material/Material";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Event } from "laya/events/Event";
import { SkyDome } from "laya/d3/resource/models/SkyDome";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { PixelLineRenderer } from "laya/d3/core/pixelLine/PixelLineRenderer";
import { UnlitMaterial } from "laya/d3/core/material/UnlitMaterial";
import { PixelLineData } from "laya/d3/core/pixelLine/PixelLineData";
import { Color } from "laya/d3/math/Color";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { ShaderDefine } from "laya/RenderEngine/RenderShader/ShaderDefine";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";

export class Sky_SkyBox {
	public ren:SkyRenderer;
	constructor() {
		//初始化引擎
		Laya3D.init(0, 0);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		//显示性能面板
		Stat.show();
		//创建场景
		var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));

		//创建相机
		var camera: Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 1000)));
		//camera.transform.rotate(new Vector3(10, 0, 0), true, false);
		camera.addComponent(CameraMoveScript);
		//设置相机的清除标识为天空盒(这个参数必须设置为CLEARFLAG_SKY，否则无法使用天空盒)
		camera.clearFlag = CameraClearFlags.SolidColor;
		//camera.enableHDR = true;
		scene.addChild(new MeshSprite3D(PrimitiveMesh.createBox()));
		//@ts-ignore
		camera.staticMask = 0xffffffff-2;
		let ob = scene.addChild(new MeshSprite3D(PrimitiveMesh.createSphere()));
		(ob as Sprite3D).transform.position = new Vector3(3,0,0);
		//@ts-ignore
		ob.isStatic = true;
		//天空盒
		Material.load("res/threeDimen/skyBox/DawnDusk/SkyBox.lmat", Handler.create(this, function (mat: SkyBoxMaterial): void {
			//获取相机的天空渲染器
			var skyRenderer: SkyRenderer = camera.skyRenderer;
			//创建天空盒的mesh
			skyRenderer.mesh = SkyDome.instance;
			//设置天空盒材质
			skyRenderer.material = mat;
			var exposureNumber: number = 0;
			// Laya.timer.frameLoop(1, this, function (): void {
			// 	//设置曝光强度
			// 	mat.exposure = Math.sin(exposureNumber += 0.01) + 1;
			// 	mat.rotation += 0.01;
			// });
			this.ren = skyRenderer;
		}));
		let sprite = new Sprite3D();
		scene.addChild(sprite);
		let pix = sprite.addComponent(PixelLineRenderer)
		let mat = new Material();
		mat.setShaderName("Unlit");
		mat.addDefine(Shader3D.getDefineByName("ENABLEVERTEXCOLOR"))
		pix.material = mat;
		let pixelLineData = new PixelLineData();
		pixelLineData.startPosition = new Vector3();
		pixelLineData.endPosition = new Vector3(10,0,0);
		pixelLineData.startColor = new Color(1,1,1,1);
		pixelLineData.endColor = new Color(1,0,0,0);
		pix.pixelLinesDatas = [pixelLineData];
		//pix.addLine(pixelLineData.startPosition ,pixelLineData.endPosition,pixelLineData.startColor,pixelLineData.endColor );
	}

	
}

