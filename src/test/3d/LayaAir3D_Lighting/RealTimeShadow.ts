import { Laya3D } from "Laya3D"
import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera"
	import { MeshSprite3D } from "laya/d3/core/MeshSprite3D"
	import { SkinnedMeshSprite3D } from "laya/d3/core/SkinnedMeshSprite3D"
	import { Sprite3D } from "laya/d3/core/Sprite3D"
	import { DirectionLight } from "laya/d3/core/light/DirectionLight"
	import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial"
	import { Scene3D } from "laya/d3/core/scene/Scene3D"
	import { Quaternion } from "laya/d3/math/Quaternion"
	import { Vector3 } from "laya/d3/math/Vector3"
	import { Matrix4x4 } from "laya/d3/math/Matrix4x4"
	import { Mesh } from "laya/d3/resource/models/Mesh"
	import { Stage } from "laya/display/Stage"
	import { Loader } from "laya/net/Loader"
	import { Handler } from "laya/utils/Handler"
	import { Stat } from "laya/utils/Stat"
    
    /**
     * ...
     * @author ...
     */
    export class RealTimeShadow {
        
        private _quaternion:Quaternion = new Quaternion();
		private _direction:Vector3 = new Vector3();
        private scene:Scene3D;
        
        constructor(){
			//初始化引擎
			Laya3D.init(0, 0);
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			//显示性能面板
			Stat.show();
            
            this.scene = (<Scene3D>Laya.stage.addChild(new Scene3D()) );
            
            var camera:Camera = (<Camera>(this.scene.addChild(new Camera(0, 0.1, 100))) );
            camera.transform.translate(new Vector3(0, 0.7, 1.2));
            camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
            
            var directionLight:DirectionLight = (<DirectionLight>this.scene.addChild(new DirectionLight()) );
            directionLight.color = new Vector3(1, 1, 1);
            directionLight.transform.rotate(new Vector3(-3.14/3, 0,0));
			
			//灯光开启阴影
            directionLight.shadow = true;
			//可见阴影距离
			directionLight.shadowDistance = 3;
			//生成阴影贴图尺寸
			directionLight.shadowResolution = 2048;
			//生成阴影贴图数量
			directionLight.shadowPSSMCount = 1;
			//模糊等级,越大越高,更耗性能
			directionLight.shadowPCFType = 3;
            
            Laya.loader.create(["res/threeDimen/staticModel/grid/plane.lh", 
				"res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh"], Handler.create(this, this.onComplete));
			
			//设置时钟定时执行
            Laya.timer.frameLoop(1, this, function():void {
				//从欧拉角生成四元数（顺序为Yaw、Pitch、Roll）
                Quaternion.createFromYawPitchRoll(0.025, 0, 0, this._quaternion);
				directionLight.transform.worldMatrix.getForward(this._direction);
				//根据四元数旋转三维向量
                Vector3.transformQuat(this._direction, this._quaternion, this._direction);
				//设置平行光的方向
				var mat:Matrix4x4 = directionLight.transform.worldMatrix;
				mat.setForward(this._direction);
				directionLight.transform.worldMatrix=mat;
            });
        }
        
        private onComplete():void {
            
            var grid:Sprite3D = (<Sprite3D>this.scene.addChild(Loader.getRes("res/threeDimen/staticModel/grid/plane.lh")) );
			//地面接收阴影
			((<MeshSprite3D>grid.getChildAt(0) )).meshRenderer.receiveShadow = true;
			
			var staticLayaMonkey:MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(Loader.getRes("res/threeDimen/skinModel/LayaMonkey/Assets/LayaMonkey/LayaMonkey-LayaMonkey.lm"))) );
			staticLayaMonkey.meshRenderer.material = Loader.getRes("res/threeDimen/skinModel/LayaMonkey/Assets/LayaMonkey/Materials/T_Diffuse.lmat");
			staticLayaMonkey.transform.position = new Vector3(0, 0, -0.5);
            staticLayaMonkey.transform.localScale = new Vector3(0.3, 0.3, 0.3);
            staticLayaMonkey.transform.rotation = new Quaternion(0.7071068, 0, 0, -0.7071067);
			//产生阴影
			staticLayaMonkey.meshRenderer.castShadow = true;
            
            var layaMonkey:Sprite3D = (<Sprite3D>this.scene.addChild(Loader.getRes("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh")) );
			//产生阴影
			((<SkinnedMeshSprite3D>layaMonkey.getChildAt(0).getChildAt(0) )).skinnedMeshRenderer.castShadow = true;
        }
    }

