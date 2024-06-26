import { Laya } from "Laya";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Scene } from "laya/display/Scene";
import { Stage } from "laya/display/Stage";
import { Stat } from "laya/utils/Stat";

export class VolumetricGIDemo {
    private GIScenePath: string = "res/VolumeGI/volumeGIScene.ls";
    private scene3D: Scene3D;

    constructor(){
        Laya.init(0, 0).then(()=>{
            Laya.stage.scaleMode = Stage.SCALE_FULL;
            Laya.stage.screenMode = Stage.SCREEN_NONE;
            Stat.show();
            Scene.open(this.GIScenePath).then((res: Scene)=>{
                this.scene3D = res.scene3D as Scene3D;
            });
        });
    }
}