import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { UnlitMaterial } from "laya/d3/core/material/UnlitMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { Color } from "laya/maths/Color";
import { Vector3 } from "laya/maths/Vector3";
import { TextureFormat } from "laya/RenderEngine/RenderEnum/TextureFormat";
import { Texture2D } from "laya/resource/Texture2D";
import { Browser } from "laya/utils/Browser";
import { Stat } from "laya/utils/Stat";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { RenderState } from "laya/RenderDriver/RenderModuleData/Design/RenderState";


export class DrawTextTexture {
    private cav: HTMLCanvasElement;
    private plane: MeshSprite3D;
    private mat: UnlitMaterial;
    private texture2D: Texture2D;
    constructor() {
        //(Laya3D as any).aa = 10;
        Laya.init(0, 0).then(() => {
            Laya.stage.scaleMode = Stage.SCALE_FULL;
            Laya.stage.screenMode = Stage.SCREEN_NONE;
            Stat.show();
            var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));
            var camera: Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 100)));
            camera.transform.translate(new Vector3(0, 0, 15));
            camera.transform.rotate(new Vector3(0, 0, 0), true, false);
            camera.clearColor = new Color(0.2, 0.2, 0.2, 1.0);
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
            cxt.textBaseline = "middle";//文本相对于起点的位置
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
            cxt.strokeText("LayaBox", 100, 150,);//只有边框
            this.texture2D = new Texture2D(256, 256, TextureFormat.R8G8B8A8, true, false, false);
            this.texture2D.setImageData(this.cav, false, false);
            this.mat.renderMode = UnlitMaterial.RENDERMODE_TRANSPARENT;

            //给材质贴图
            this.mat.albedoTexture = this.texture2D;
            (<BlinnPhongMaterial>this.plane.meshRenderer.sharedMaterial).cull = RenderState.CULL_NONE;
            var rotate: Vector3 = new Vector3(0, 0, 1);
            Laya.timer.frameLoop(1, this, function (): void {
                this.plane.transform.rotate(rotate, true, false);
            });
        });

    }

}