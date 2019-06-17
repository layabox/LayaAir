import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { UnlitMaterial } from "laya/d3/core/material/UnlitMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { BaseTexture } from "laya/resource/BaseTexture";
import { Texture2D } from "laya/resource/Texture2D";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { Config3D } from "Config3D";
//import CameraMoveScript;
export class CanvasBugTest {
    constructor() {
        var c = new Config3D();
        //关闭抗锯齿
        c.isAntialias = true;
        Laya3D.init(0, 0, c);
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        Stat.show();
        //this.test("hahah", "yyyyy");
        debugger;
        //创建场景
        this.scene = Laya.stage.addChild(new Scene3D());
        //创建相机
        this.camera = this.scene.addChild(new Camera(0, 0.1, 100));
        this.camera.transform.translate(new Vector3(0, 3.5, 7));
        this.camera.transform.rotate(new Vector3(-30, 0, 0), true, false);
        //创建一个地面
        var plane = this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createPlane(20, 20, 10, 10)));
        //创建一个texture
        var texture2D = new Texture2D(512, 512, BaseTexture.FORMAT_R8G8B8A8, true, true);
        texture2D.filterMode = BaseTexture.FILTERMODE_POINT;
        texture2D.anisoLevel = 16;
        texture2D.wrapModeU = BaseTexture.WARPMODE_CLAMP;
        texture2D.wrapModeV = BaseTexture.WARPMODE_CLAMP;
        //创建一个像素数组
        var count = 512 * 512;
        var pixs = new Uint8Array(count * 4);
        for (var i = 0; i < count; i++) {
            pixs[i * 4 + 0] = 255;
            pixs[i * 4 + 1] = 0;
            pixs[i * 4 + 2] = 0;
            pixs[i * 4 + 3] = 255;
        }
        texture2D.setPixels(pixs);
        texture2D.generateMipmap();
        //创建材质
        var unlitMaterial = new UnlitMaterial();
        unlitMaterial.albedoTexture = texture2D;
        plane.meshRenderer.material = unlitMaterial;
        /*//加载image
        var url:String = "res/shuzi1.png";
        image = new Browser.window.Image();
        image.crossOrigin = "";
        image.onload = onload;
        image.src = url;
        
        //loadUI();*/
    }
    test() {
        console.log(arguments.length);
        console.log(arguments[0]);
        console.log(arguments[1]);
    }
}
