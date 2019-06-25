import { Laya } from "Laya";
import { Loader } from "laya/net/Loader";
import { Handler } from "laya/utils/Handler";
export class Loader_MultipleType {
    constructor() {
        this.ROBOT_DATA_PATH = "res/skeleton/robot/robot.bin";
        this.ROBOT_TEXTURE_PATH = "res/skeleton/robot/texture.png";
        Laya.init(100, 100);
        var assets = [];
        assets.push({ url: this.ROBOT_DATA_PATH, type: Loader.BUFFER });
        assets.push({ url: this.ROBOT_TEXTURE_PATH, type: Loader.IMAGE });
        Laya.loader.load(assets, Handler.create(this, this.onAssetsLoaded));
    }
    onAssetsLoaded(e = null) {
        var robotData = Loader.getRes(this.ROBOT_DATA_PATH);
        var robotTexture = Loader.getRes(this.ROBOT_TEXTURE_PATH);
        // 使用资源
    }
}
