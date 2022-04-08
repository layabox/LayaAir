import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Vector4 } from "laya/d3/math/Vector4";
import { Stage } from "laya/display/Stage";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { ChinarMirrorPlane } from "../common/ChinarMirrorPlane";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { HtmlVideo } from "laya/device/media/HtmlVideo";
import { VIDEOTYPE } from "laya/device/media/Video";
import { VideoTexture } from "laya/resource/VideoTexture";
import { UnlitMaterial } from "laya/d3/core/material/UnlitMaterial";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Color } from "laya/d3/math/Color";
import { CullMode } from "laya/RenderEngine/RenderEnum/CullMode";

export class VideoPlayIn3DWorld {
    private static video: any;
    private static videoPlane: MeshSprite3D;
    constructor() {
        //初始化引擎
        Laya3D.init(0, 0);
        Stat.show();
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        //加载场景
        Scene3D.load("res/threeDimen/moveClipSample/moveclip/Conventional/moveclip.ls", Handler.create(this, function (scene: Scene3D): void {
            (<Scene3D>Laya.stage.addChild(scene));

            //获取场景中的相机
            var camera: Camera = (<Camera>scene.getChildByName("Main Camera"));
            camera.enableHDR = false;
            camera.addComponent(CameraMoveScript);
            var mirrorFloor: ChinarMirrorPlane = camera.addComponent(ChinarMirrorPlane) as ChinarMirrorPlane;
            mirrorFloor.onlyMainCamera = camera;
            mirrorFloor.mirrorPlane = scene.getChildByName("reflectionPlan") as MeshSprite3D;
            let testBox = new MeshSprite3D(PrimitiveMesh.createBox(1,1,1));
            let mat:UnlitMaterial= testBox.meshRenderer.sharedMaterial = new UnlitMaterial();
            mat.albedoColor = new Vector4(1,1,1,1);
            mat.cull = CullMode.Off;
            testBox.transform.position = new Vector3(0,3,50);
            scene.addChild(testBox);
            //camera.active = false;    

            //增加视频
            //VideoPlayIn3DWorld.videoPlane = scene.getChildByName("moveclip") as MeshSprite3D;
            //this.createVideo("res/av/mov_bbb.mp4");
        }));

    }
    private createVideo(url: string): void {
        var htmlVideo: HtmlVideo = new HtmlVideo();
        htmlVideo.setSource(url, VIDEOTYPE.MP4);
        VideoPlayIn3DWorld.video = htmlVideo.video;
        htmlVideo.video.addEventListener('loadedmetadata', this.onVideoReady, true);
    }
    private onVideoReady() {
        VideoPlayIn3DWorld.video.playsInline = true;
        VideoPlayIn3DWorld.video.muted = true;
        VideoPlayIn3DWorld.video.loop = true;
        var videoTexture: VideoTexture = new VideoTexture(VideoPlayIn3DWorld.video);
        VideoPlayIn3DWorld.videoPlane.meshRenderer.sharedMaterial = new UnlitMaterial();
        (VideoPlayIn3DWorld.videoPlane.meshRenderer.sharedMaterial as UnlitMaterial).albedoTexture = videoTexture;
        videoTexture.videoPlay();
    }
}

