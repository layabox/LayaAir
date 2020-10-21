import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Matrix4x4 } from "laya/d3/math/Matrix4x4";
import { Vector3 } from "laya/d3/math/Vector3";
import { Vector4 } from "laya/d3/math/Vector4";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { HalfFloatUtils } from "laya/utils/HalfFloatUtils";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { FilterMode } from "laya/resource/FilterMode";
import { Texture2D } from "laya/resource/Texture2D";
import { TextureFormat } from "laya/resource/TextureFormat";
import { CameraMoveScript } from "../common/CameraMoveScript";

export class HalfFloatTexture{
    private sprite3D: Sprite3D;
    constructor(){
        Laya3D.init(0, 0);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		Stat.show();
		var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));

		var camera: Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 100)));
		camera.transform.translate(new Vector3(0, 2, 5));
		camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
		camera.addComponent(CameraMoveScript);
		camera.clearColor = new Vector4(0.2, 0.2, 0.2, 1.0);

		var directionLight: DirectionLight = (<DirectionLight>scene.addChild(new DirectionLight()));
		//设置平行光的方向
		var mat: Matrix4x4 = directionLight.transform.worldMatrix;
		mat.setForward(new Vector3(-1.0, -1.0, -1.0));
		directionLight.transform.worldMatrix = mat;

		this.sprite3D = (<Sprite3D>scene.addChild(new Sprite3D()));

		//正方体
		var box: MeshSprite3D = (<MeshSprite3D>this.sprite3D.addChild(new MeshSprite3D(PrimitiveMesh.createPlane(1,1))));
		box.transform.position = new Vector3(0.0, 1.0, 2.5);
		box.transform.rotate(new Vector3(90, 0, 0), false, false);
        var material: BlinnPhongMaterial = new BlinnPhongMaterial();
        material.albedoTexture = this.createHalfFloatTexture();
        box.meshRenderer.sharedMaterial = material;
    }

    //创建半浮点数纹理
    createHalfFloatTexture():Texture2D{
        var texture:Texture2D = new Texture2D(50,50,TextureFormat.R16G16B16A16,false,true);
        var pixelData:Uint16Array = new Uint16Array(50*50*4);
        var pixelIndex:number;
        var step:number = 1.0/50;
        for(var x:number = 0,n = 50;x<n;x++){
            for(var y:number = 0,m = 50;y<m;y++){
                pixelIndex = (x+y*50)*4;
                pixelData[pixelIndex] =HalfFloatUtils.roundToFloat16Bits(1.0);
                pixelData[pixelIndex+1] =HalfFloatUtils.roundToFloat16Bits(x*step);
                pixelData[pixelIndex+2] =HalfFloatUtils.roundToFloat16Bits(y*step);
                pixelData[pixelIndex+3] =HalfFloatUtils.roundToFloat16Bits(1.0);
            }
        }
        texture.setPixels(pixelData,0);
        texture.filterMode = FilterMode.Bilinear;
        return texture;
    }
} 