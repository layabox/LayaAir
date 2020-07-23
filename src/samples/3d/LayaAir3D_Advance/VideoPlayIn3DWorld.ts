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
import { VideoTexture } from "laya/resource/videoTexture";
import { UnlitMaterial } from "laya/d3/core/material/UnlitMaterial";

export class VideoPlayIn3DWorld {
    private static video:any;
	private static videoPlane:MeshSprite3D;
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
            camera.addComponent(CameraMoveScript);
            var mirrorFloor:ChinarMirrorPlane = camera.addComponent(ChinarMirrorPlane) as ChinarMirrorPlane;
            mirrorFloor.onlyMainCamera = camera;
            mirrorFloor.mirrorPlane = scene.getChildByName("reflectionPlan") as MeshSprite3D;
            //camera.active = false;    
            
            //增加视频
            VideoPlayIn3DWorld.videoPlane = scene.getChildByName("moveclip") as MeshSprite3D;
            this.createVideo("res/av/mov_bbb.mp4");
        }));
      
    }
    private createVideo(url:string):void{
        var htmlVideo:HtmlVideo = new HtmlVideo();
        htmlVideo.setSource(url,VIDEOTYPE.MP4);
        VideoPlayIn3DWorld.video = htmlVideo.video;
        htmlVideo.video.addEventListener('loadedmetadata',this.onVideoReady,true);
    }
    private onVideoReady(){
        VideoPlayIn3DWorld.video.playsInline = true;
        VideoPlayIn3DWorld.video.muted = true;
        VideoPlayIn3DWorld.video.loop = true;
        VideoPlayIn3DWorld.video.play();
        var videoTexture:VideoTexture = new VideoTexture();
        videoTexture.video = VideoPlayIn3DWorld.video;
        videoTexture.videoPlay();
        VideoPlayIn3DWorld.videoPlane.meshRenderer.sharedMaterial = new UnlitMaterial();
        (VideoPlayIn3DWorld.videoPlane.meshRenderer.sharedMaterial as UnlitMaterial).albedoTexture = videoTexture;
    }
}

