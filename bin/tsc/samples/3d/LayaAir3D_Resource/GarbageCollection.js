import { Laya3D } from "Laya3D";
import { Laya } from "Laya";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Camera } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Resource } from "laya/resource/Resource";
import { Button } from "laya/ui/Button";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
/**
 * ...
 * @author LayaAir3D Team
 */
export class GarbageCollection {
    /**
     * @private
     */
    constructor() {
        /**@private */
        this._castType = 0;
        Laya3D.init(0, 0);
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        Stat.show();
        this.loadScene();
        this.addButton(200, 200, 160, 40, "释放显存", function (e) {
            this._castType++;
            this._castType %= 2;
            switch (this._castType) {
                case 0:
                    e.target.label = "释放显存";
                    this.loadScene();
                    break;
                case 1:
                    e.target.label = "加载场景";
                    if (this._scene) //_scene不为空表示场景已加载完成
                        this.garbageCollection();
                    break;
            }
        });
    }
    /**
     * @private
     */
    addButton(x, y, width, height, text, clickFun) {
        Laya.loader.load(["res/threeDimen/ui/button.png"], Handler.create(this, function () {
            var changeActionButton = Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", text));
            changeActionButton.size(width, height);
            changeActionButton.labelBold = true;
            changeActionButton.labelSize = 30;
            changeActionButton.sizeGrid = "4,4,4,4";
            changeActionButton.scale(Browser.pixelRatio, Browser.pixelRatio);
            changeActionButton.pos(x, y);
            changeActionButton.on(Event.CLICK, this, clickFun);
        }));
    }
    /**
     * @private
     */
    loadScene() {
        Scene3D.load("res/threeDimen/scene/ParticleScene/Example_01.ls", Handler.create(this, function (scene) {
            this._scene = Laya.stage.addChildAt(scene, 0);
            var camera = scene.addChild(new Camera(0, 0.1, 100));
            camera.transform.translate(new Vector3(0, 1, 0));
            camera.addComponent(CameraMoveScript);
        }));
    }
    /**
     * @private
     */
    garbageCollection() {
        this._scene.destroy(); //销毁场景
        this._scene = null;
        Resource.destroyUnusedResources(); //销毁无用资源(没有被场景树引用,并且没有加资源锁的)
    }
}
