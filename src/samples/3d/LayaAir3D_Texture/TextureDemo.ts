import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { Material, MaterialRenderMode } from "laya/d3/core/material/Material";
import { UnlitMaterial } from "laya/d3/core/material/UnlitMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Command } from "laya/d3/core/render/command/Command";
import { CommandBuffer } from "laya/d3/core/render/command/CommandBuffer";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Color } from "laya/d3/math/Color";
import { Matrix4x4 } from "laya/d3/math/Matrix4x4";
import { Vector3 } from "laya/d3/math/Vector3";
import { Vector4 } from "laya/d3/math/Vector4";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { RenderTexture } from "laya/d3/resource/RenderTexture";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Loader } from "laya/net/Loader";
import { FilterMode } from "laya/RenderEngine/RenderEnum/FilterMode";
import { RenderTargetFormat } from "laya/RenderEngine/RenderEnum/RenderTargetFormat";
import { WrapMode } from "laya/RenderEngine/RenderEnum/WrapMode";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { BaseTexture } from "laya/resource/BaseTexture";
import { RenderTexture2D } from "laya/resource/RenderTexture2D";
import { Texture } from "laya/resource/Texture";
import { Texture2D } from "laya/resource/Texture2D";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";

/**
 * ...
 * @author ...
 */
export class TextureDemo {
	private sprite3D: Sprite3D;

	constructor() {
		Laya3D.init(0, 0);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		Stat.show();
		Shader3D.debugMode = true;
		this.loadResource();
	}

	loadResource(){
		var resource: any[] = ["res/picture.shader",
		"res/apes/monkey3.png",
		"res/apes/monkey2.png"];
		Laya.loader.load(resource, Handler.create(this, this.createScene));
	}

	createScene(){
		var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));

		var camera: Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 100)));
		camera.transform.translate(new Vector3(0, 2, 5));
		camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
		camera.addComponent(CameraMoveScript);
		camera.clearColor = new Color(0.2, 0.2, 0.2, 1.0);

		var directionLight: DirectionLight = (<DirectionLight>scene.addChild(new DirectionLight()));
		//设置平行光的方向
		var mat: Matrix4x4 = directionLight.transform.worldMatrix;
		mat.setForward(new Vector3(-1.0, -1.0, -1.0));
		directionLight.transform.worldMatrix = mat;

		this.sprite3D = (<Sprite3D>scene.addChild(new Sprite3D()));

		//正方体
		var box: MeshSprite3D = (<MeshSprite3D>this.sprite3D.addChild(new MeshSprite3D(PrimitiveMesh.createBox(0.5, 0.5, 0.5))));
		box.transform.position = new Vector3(0.0, 1.0, 2.5);
		box.transform.rotate(new Vector3(0, 0, 0), false, false);
		box.transform.localScale = new Vector3(3,3,3);
		//var mat1: BlinnPhongMaterial = new BlinnPhongMaterial();
		var mat1 =new UnlitMaterial();
		var ape: Sprite = new Sprite();
        ape.loadImage("res/apes/monkey3.png");
		var t: Texture = Laya.loader.getRes("res/apes/monkey2.png");
		var ape2: Sprite = new Sprite();
		ape2.graphics.drawTexture(t, 0, 0);
		ape2.pos(200, 0);
		ape.addChild(ape2);
		let rt = new RenderTexture2D(500,500,RenderTargetFormat.R8G8B8A8,RenderTargetFormat.None);
		rt.clear(0,0,0,0);
		ape.drawToTexture(ape.width,ape.height,0,0,rt,true);
		Laya.stage.addChild(ape);
		mat1.albedoTexture = rt;
		//mat1.addDefine(Shader3D.getDefineByName("RGBM"));
		box.meshRenderer.sharedMaterial = mat1;
		mat1.materialRenderMode = MaterialRenderMode.RENDERMODE_TRANSPARENT;
		// //漫反射贴图
		// Texture2D.load("res/threeDimen/texture/layabox.png", Handler.create(this, function (texture: Texture2D): void {
		// 	//在U方向上使用WRAPMODE_CLAMP
		// 	texture.wrapModeU = WrapMode.Repeat;
		// 	//在V方向使用WRAPMODE_REPEAT
		// 	texture.wrapModeV = WrapMode.Repeat;
		// 	//设置过滤方式
		// 	texture.filterMode = FilterMode.Bilinear;
		// 	//设置各向异性等级
		// 	texture.anisoLevel = 2;

		// 	mat1.albedoTexture = texture;
		// 	//修改材质贴图的平铺和偏移
		// 	var tilingOffset: Vector4 = mat1.tilingOffset;
		// 	tilingOffset.setValue(1, 1, 0.0, 0.0);
		// 	mat1.tilingOffset = tilingOffset;

		// 	box.meshRenderer.material = mat1 as Material;
		// }));
	}


	// clipTexture(tex:BaseTexture){
	// 	let com = new CommandBuffer();
	// 	let rt = new RenderTexture(tex.width,tex.height,RenderTargetFormat)
	// 	com.blitScreenQuad(tex,)
	// }
}


