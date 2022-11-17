import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { PBRStandardMaterial } from "laya/d3/core/material/PBRStandardMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D, AmbientMode } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Color } from "laya/d3/math/Color";
import { Vector3 } from "laya/d3/math/Vector3";
import { Vector4 } from "laya/d3/math/Vector4";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { Button } from "laya/ui/Button";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";

/**
 * ...
 * @author
 */
export class GriendSkyAmbientDemo {
    private sprite3D: Sprite3D;
	private lineSprite3D: Sprite3D;

	/**实例类型*/
	private btype:any = "CustomMesh";
	/**场景内按钮类型*/
	private stype:any = 0;
	private changeActionButton:Button; 
    private curStateIndex: number = 0;
    constructor() {
        /**实例类型*/
        this.btype = "GriendSkyAmbientDemo";
        /**场景内按钮类型*/
        this.stype = 0;
        this.curStateIndex = 0;
        Laya3D.init(0, 0);
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        Stat.show();
        var scene = Laya.stage.addChild(new Scene3D()) as Scene3D;
        var camera = scene.addChild(new Camera(0, 0.1, 100)) as Camera;
        camera.transform.translate(new Vector3(0, 2, 5));
        camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
        camera.addComponent(CameraMoveScript);
        camera.clearColor = new Color(0.2, 0.2, 0.2, 1.0);
        camera.msaa = true;
        scene.ambientColor =new Color(1.0, 0.2, 0.2, 1.0);
        scene.ambientMode = AmbientMode.SolidColor;
        //天空颜色
        let skyAmbientColor = new Vector3(0.56, 0.89, 1);
        //地平线颜色
        let equatorAmbientColor = new Vector3(0.4, 0.2, 0.2);
        //地板颜色
        let groundAmbientColor = new Vector3(0.09, 0.08, 0.5);
        scene.sceneReflectionProb.setGradientAmbient(skyAmbientColor, equatorAmbientColor, groundAmbientColor);
        // var directionLight: DirectionLight = (<DirectionLight>scene.addChild(new DirectionLight()));
        // //设置平行光的方向
        // var mat: Matrix4x4 = directionLight.transform.worldMatrix;
        // mat.setForward(new Vector3(-1.0, -1.0, -1.0));
        // directionLight.transform.worldMatrix = mat;
        this.sprite3D = scene.addChild(new Sprite3D()) as Sprite3D;
        this.lineSprite3D = scene.addChild(new Sprite3D()) as Sprite3D;
        //正方体
        var box = this.sprite3D.addChild(new MeshSprite3D(PrimitiveMesh.createBox(0.5, 0.5, 0.5))) as MeshSprite3D;
        box.transform.position = new Vector3(2.0, 0.25, 0.6);
        box.meshRenderer.sharedMaterial = new PBRStandardMaterial();
        box.transform.rotate(new Vector3(0, 45, 0), false, false);
        // //球体
        // var sphere = this.sprite3D.addChild(new MeshSprite3D(PrimitiveMesh.createSphere(0.25, 20, 20))) as MeshSprite3D;
        // sphere.transform.position = new Vector3(1.0, 0.25, 0.6);
        // //圆柱体
        // var cylinder = this.sprite3D.addChild(new MeshSprite3D(PrimitiveMesh.createCylinder(0.25, 1, 20))) as MeshSprite3D;
        // cylinder.transform.position = new Vector3(0, 0.5, 0.6);
        // //胶囊体
        // var capsule = this.sprite3D.addChild(new MeshSprite3D(PrimitiveMesh.createCapsule(0.25, 1, 10, 20))) as MeshSprite3D;
        // capsule.transform.position = new Vector3(-1.0, 0.5, 0.6);
        
        // //圆锥体
        // var cone = this.sprite3D.addChild(new MeshSprite3D(PrimitiveMesh.createCone(0.25, 0.75))) as MeshSprite3D;
        // cone.transform.position = new Vector3(-2.0, 0.375, 0.6);
        
        // //平面
        // var plane = this.sprite3D.addChild(new MeshSprite3D(PrimitiveMesh.createPlane(6, 6, 10, 10)));
        
    }
   
}
