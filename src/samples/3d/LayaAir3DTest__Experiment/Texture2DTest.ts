import { Laya3D } from "Laya3D";
import { Laya } from "Laya"
import { CameraMoveScript } from "../common/CameraMoveScript"
	import { Camera } from "laya/d3/core/Camera"
	import { MeshSprite3D } from "laya/d3/core/MeshSprite3D"
	import { Sprite3D } from "laya/d3/core/Sprite3D"
	import { UnlitMaterial } from "laya/d3/core/material/UnlitMaterial"
	import { Scene3D } from "laya/d3/core/scene/Scene3D"
	import { Vector3 } from "laya/d3/math/Vector3"
	import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh"
	import { Stage } from "laya/display/Stage"
	import { Handler } from "laya/utils/Handler"
	import { Stat } from "laya/utils/Stat"
	import { BaseTexture } from "laya/resource/BaseTexture"
	import { Texture2D } from "laya/resource/Texture2D"
	
	export class Texture2DTest {
		
		constructor(){
			Laya3D.init(1280, 720);
			Laya.stage.scaleMode = Stage.SCALE_FIXED_WIDTH;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			Stat.show();
			
			var scene:Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()) );
			
			var camera:Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 10000)) );
			camera.transform.translate(new Vector3(0, 3.5, 7));
			camera.transform.rotate(new Vector3(-30, 0, 0), true, false);
			camera.addComponent(CameraMoveScript);
			
			//平面
			var plane:MeshSprite3D = (<MeshSprite3D>scene.addChild(new MeshSprite3D(PrimitiveMesh.createPlane(6, 6, 10, 10))) );
			var mat:UnlitMaterial = new UnlitMaterial();
			mat.renderMode = UnlitMaterial.RENDERMODE_TRANSPARENT;
			
			Texture2D.load("../../../../res/threeDimen/texture/1.png", Handler.create(null, function(texture:Texture2D):void {
				var pixels:Uint8Array = new Uint8Array(16);
				pixels[0] = 0;
				pixels[1] = 255;
				pixels[2] = 0;
				pixels[3] = 255;
				
				pixels[4] = 255;
				pixels[5] = 0;
				pixels[6] = 0;
				pixels[7] = 255;
				
				pixels[8] = 0;
				pixels[9] = 0;
				pixels[10] = 255;
				pixels[11] = 255;
				
				pixels[12] = 255;
				pixels[13] = 255;
				pixels[14] = 255;
				pixels[15] = 255;
				
				texture = new Texture2D(2, 2, BaseTexture.FORMAT_R8G8B8A8, true, false);
				texture.setPixels(pixels);
				//texture.setPixels(pixels,1);
				texture.generateMipmap();
				
				texture.wrapModeU = BaseTexture.WARPMODE_CLAMP;
				texture.wrapModeV = BaseTexture.WARPMODE_CLAMP;
				//设置反照率贴图
				mat.albedoTexture = texture;
			}));
			
			plane.meshRenderer.material = mat;
		
		}
	
	}


