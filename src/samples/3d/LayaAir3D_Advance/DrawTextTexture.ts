import { Laya, timer } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { UnlitMaterial } from "laya/d3/core/material/UnlitMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Vector4 } from "laya/d3/math/Vector4";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { Texture2D } from "laya/resource/Texture2D";
import { Browser } from "laya/utils/Browser";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { transcode } from "buffer";
import { Quaternion } from "laya/d3/math/Quaternion";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { RenderState } from "laya/d3/core/material/RenderState";


export class DrawTextTexture {
    private cav: any;
    private plane: MeshSprite3D;
    private mat: UnlitMaterial;
    private texture2D: Texture2D;
    constructor() {
        Laya3D.init(0, 0);
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        Stat.show();

        var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));
        var camera: Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 100)));
        camera.transform.translate(new Vector3(0, 0, 15));
        camera.transform.rotate(new Vector3(0, 0, 0), true, false);
        camera.clearColor = new Vector4(0.2, 0.2, 0.2, 1.0);
        camera.addComponent(CameraMoveScript);

        //设置一个面板用来渲染
        this.plane = new MeshSprite3D(PrimitiveMesh.createPlane(10, 10));
        this.plane.transform.rotate(new Vector3(90, 0, 0), true, true);
        scene.addChild(this.plane);
        //材质
        this.mat = new UnlitMaterial();
        this.plane.meshRenderer.sharedMaterial = this.mat;

        //画布cavans
        this.cav = Browser.createElement("canvas");
        var cxt = this.cav.getContext("2d");
        this.cav.width = 256;
        this.cav.height = 256;
        cxt.fillStyle = 'rgb(' + '132' + ',' + '240' + ',109)';
        cxt.font = "bold 50px 宋体";
        cxt.textAlign = "center";//文本的对齐方式
        cxt.textBaseline = "center";//文本相对于起点的位置
        //设置文字,位置
        cxt.fillText("LayaAir", 100, 50, 200);//有填充cxt.font="bold 60px 宋体";

        cxt.strokeStyle = 'rgb(' + '200' + ',' + '125' + ',0)';
        cxt.font = "bold 40px 黑体";
        cxt.strokeText("runtime", 100, 100, 200);//只有边框

        //文字边框结合
        cxt.strokeStyle = 'rgb(' + '255' + ',' + '240' + ',109)';
        cxt.font = "bold 30px 黑体";
        cxt.fillText("LayaBox", 100, 150, 200);

        cxt.strokeStyle = "yellow";
        cxt.font = "bold 30px 黑体";
        cxt.strokeText("LayaBox", 100, 150, 200);//只有边框
        this.texture2D = new Texture2D(256, 256);
        this.texture2D.loadImageSource(this.cav);
        this.mat.renderMode = UnlitMaterial.RENDERMODE_TRANSPARENT;

        //给材质贴图
        this.mat.albedoTexture = this.texture2D;
        (<BlinnPhongMaterial>this.plane.meshRenderer.sharedMaterial).cull = RenderState.CULL_NONE;
        var rotate:Vector3 = new Vector3(0,0,1);
        Laya.timer.frameLoop(1, this, function(): void {
            this.plane.transform.rotate(rotate, true, false);
            
        });
    }

}