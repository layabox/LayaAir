import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Stage } from "laya/display/Stage";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { ChinarMirrorPlane } from "../common/ChinarMirrorPlane";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { UnlitMaterial } from "laya/d3/core/material/UnlitMaterial";
import { VideoTexture } from "laya/media/VideoTexture";
import { Event } from "laya/events/Event";
import { URL } from "laya/net/URL";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { MeshRenderer } from "laya/d3/core/MeshRenderer";

export class VideoPlayIn3DWorld {
    private videoPlane: Sprite3D;
    private isoneVideo: boolean = false
    constructor() {
        //初始化引擎
        Laya.init(0, 0).then(() => {
            Stat.show();
            Laya.stage.scaleMode = Stage.SCALE_FULL;
            Laya.stage.screenMode = Stage.SCREEN_NONE;
            //加载场景
            Scene3D.load("res/threeDimen/moveClipSample/moveclip/Conventional/moveclip.ls", Handler.create(this, function (this: VideoPlayIn3DWorld, scene: Scene3D): void {
                (<Scene3D>Laya.stage.addChild(scene));

                //获取场景中的相机
                var camera: Camera = (<Camera>scene.getChildByName("Main Camera"));
                camera.enableHDR = false;
                camera.addComponent(CameraMoveScript);
                var mirrorFloor: ChinarMirrorPlane = camera.addComponent(ChinarMirrorPlane) as ChinarMirrorPlane;
                mirrorFloor.onlyMainCamera = camera;
                mirrorFloor.mirrorPlane = scene.getChildByName("reflectionPlan") as MeshSprite3D;
                //camera.active = false;    

                //增加视频
                this.videoPlane = scene.getChildByName("moveclip") as MeshSprite3D;
                Laya.stage.on(Event.MOUSE_DOWN, this, this.createVideo, ["res/av/mov_bbb.mp4"]);
                // this.createVideo("res/av/mov_bbb.mp4");
            }));
        });
    }

    private createVideo(url: string): void {
        if (!this.isoneVideo) {
            var videoTexture = new VideoTexture();
            videoTexture.source = url;
            videoTexture.play();
            videoTexture.loop = true;

            let mat = new UnlitMaterial();
            mat.albedoTexture = videoTexture;
            let render = this.videoPlane.getComponent(MeshRenderer);
            render.sharedMaterial = mat;
            this.isoneVideo = true;
        }

    }
}