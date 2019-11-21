import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Stage } from "laya/display/Stage";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { PBRStandardMaterial } from "laya/d3/core/material/PBRStandardMaterial";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { Matrix4x4 } from "laya/d3/math/Matrix4x4";
import { Scene } from "laya/display/Scene";
import { Texture2D } from "laya/resource/Texture2D";
import { TextureFormat } from "laya/resource/TextureFormat";
import { Loader } from "laya/net/Loader";
import { TextureCube } from "laya/d3/resource/TextureCube";

export class PBR_TEST {
	reflectCubeMap:TextureCube;
	constructor() {
		Laya3D.init(0, 0);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		Stat.show();
		
		this.LoadReflectMap("res/threeDimen/texture/");
		// Scene3D.load("res/threeDimen/LayaScene_boneTest/Conventional/boneTest.ls", Handler.create(this, function (sprite: Scene3D): void {
		// 	var scene: Scene3D = (<Scene3D>Laya.stage.addChild(sprite));
		// 	PBRMaterial.__init__();
		// 	scene.ambientColor = new Vector3(0, 0, 0);
		// 	scene.getChildAt(0).addComponent(CameraMoveScript);
		// 	scene.getChildAt(1).active = false;				
		// 	scene.getChildAt(2).active = false;

		Scene3D.load("res/threeDimen/LayaScene_boneTest/Conventional/boneTest.ls", Handler.create(this, function (sprite: Scene3D): void {
			var scene: Scene3D = (<Scene3D>Laya.stage.addChild(sprite));
			PBRStandardMaterial.__init__();
			scene.ambientColor = new Vector3(0, 0, 0);
			scene.getChildAt(0).addComponent(CameraMoveScript);
			scene.getChildAt(1).active = false;				
			scene.getChildAt(2).active = false;

			var sphere:MeshSprite3D = new MeshSprite3D(PrimitiveMesh.createSphere(1));
			scene.addChild(sphere);
			var PBR02:PBRStandardMaterial = new PBRStandardMaterial();
			PBR02.metallic = 0.0;
			PBR02.smoothness = 0.0;
			sphere.meshRenderer.sharedMaterial = PBR02;
			// var SHAr: Vector4  = new Vector4(-0.04560062,0.03957067,0.1411899,0.5705163);
			// var SHAg:Vector4 = new Vector4(-0.04186664,0.05843516,0.1915448,0.2173594);
			// var SHAb:Vector4 = new Vector4(0.1074025,-0.005364253,-0.02622023,0.1743392);
			// var SHBr: Vector4  = new Vector4(4.062612E-10,4.996603E-09,0.07702158,1.100793E-09);
			// var SHBg:Vector4 = new Vector4(1.033786E-09,2.861993E-09,0.139336,-1.315754E-10);
			// var SHBb:Vector4 = new Vector4(2.462286E-09,6.675703E-11,-0.05573735,-7.070138E-11);
			// var SHC: Vector4  = new Vector4(-0.1337408,0.003887157,0.06891572,1.0);
			// PBR02.SetGIDiffuse(SHAr,SHAg,SHAb,SHBr,SHBg,SHBb,SHC);
			
		// 	scene.ambientProbe.setCoefficients(0,0.5961902,0.03957067,0.1411899,-0.04560062,4.062612E-10, 4.996603E-09, 0.02567386,1.100793E-09,-0.1337408);
		// 	scene.ambientProbe.setCoefficients(1,0.2638047,0.05843516,0.1915448,-0.04186664,1.033786E-09,2.861993E-09,0.04644532,-1.315754E-10,0.003887157);
		// 	scene.ambientProbe.setCoefficients(2,0.1557601, -0.005364253, -0.02622023, 0.1074025,2.462286E-09, 6.675703E-11, -0.01857912, -7.070138E-11,0.06891572);
		// 	PBR02.diffuseDefined();
		// 	var sphere2:MeshSprite3D = new MeshSprite3D(PrimitiveMesh.createSphere(1));
		// 	sphere2.transform.position = new Vector3(0,0,0);
		// 	scene.addChild(sphere2);
		// 	var PBR:PBRStandardMaterial = new PBRStandardMaterial();
		// 	PBR.metallic = 0.5;
		// 	PBR.smoothness = 0.5;
		// 	sphere2.meshRenderer.sharedMaterial = PBR;

		// 	sphere.active = true;
		// 	sphere2.active = false;

			
		// 	// sphere.active = false;
		// 	// sphere2.active = true;
		// }));

		
	
	}
	LoadReflectMap(loadpath:string):void
	{
		debugger;
		var loadpaths:Array<string> = new Array<string>(36);
		var texlen:Array<number> = new Array<number>(36);
		for(var i = 0,n = 6;i<n;i++)
		{
			for(var j=0;j<6;j++)
			{
				texlen[i*n+j] = 128*Math.pow(0.5,i);
			}
			loadpaths[i*n] = loadpath + "_PositiveX"+ i.toString() + ".png";
			loadpaths[i*n+1] = loadpath + "_NegativeX"+ i.toString() + ".png";
			loadpaths[i*n+2] = loadpath + "_PositiveY"+ i.toString() + ".png";
			loadpaths[i*n+3] = loadpath + "_NegativeY"+ i.toString() + ".png";
			loadpaths[i*n+4] = loadpath + "_PositiveZ"+ i.toString() + ".png";
			loadpaths[i*n+5] = loadpath + "_NegativeZ"+ i.toString() + ".png";
			
		}
		//Laya.loader.create(loadpath + "_NegativeX"+ i.toString() + ".png",null,null,Loader.TEXTURE2D,);
		//,null,null,Loader.Texture2D,[texlen[0],texlen[0],TextureFormat.R8G8B8A8,false,true]}
		var resource: any[] = [];
		for(var k = 0;k<36;k++)
			resource[k]={url:loadpaths[k],type:Loader.TEXTURE2D,constructParams:[texlen[k],texlen[k],TextureFormat.R8G8B8A8,false,true]};
		Laya.loader.create(resource,Handler.create(this,this.creatCubeMap,[loadpaths]));
	}
	creatCubeMap(loadpaths:Array<string>):void
	{
		var cubemap:TextureCube = new TextureCube(128,TextureFormat.R8G8B8A8,true);
		//×éÖ¯Áù×écubemap
		var cubemapArray: Array<Array<Uint8Array>> = new Array<Array<Uint8Array>>();
		for(var i = 0,n = 6;i<n;i++)
		{
			cubemapArray.push(new Array<Uint8Array>());
			for(var j = 0,m = 6;j<m;j++)
			{
				 cubemapArray[i][j] = (Loader.getRes(loadpaths[i*6+j]) as Texture2D).getPixels() as Uint8Array ;
			}
		}
		for(var k = 0,p = 6;k<p;k++)
		{
			cubemap.setSixSidePixels(cubemapArray[k],k);
		}
		this.reflectCubeMap = cubemap;
	}

}

