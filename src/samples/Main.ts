import { ILaya } from "ILaya";
import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Loader } from "laya/net/Loader";
import { URL } from "laya/net/URL";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { IndexView2D } from "./view/IndexView2D";
import { IndexView3D } from "./view/IndexView3D";
import { Texture } from "laya/resource/Texture";

export class Main {
    private static _box3D: Sprite;
    public static get box3D(): Sprite {
        return Main._box3D || Laya.stage;
    }
    public static set box3D(value: Sprite) {
        Main._box3D = value;
    }

    private static _box2D: Sprite;
    public static get box2D(): Sprite {
        return Main._box2D || Laya.stage;
    }
    public static set box2D(value: Sprite) {
        Main._box2D = value;
    }
    static _indexView: any;
    /**false 2d；true 3d**/
    private _isType: boolean = false;
    static isWXAPP: boolean = false;
    private _isReadNetWorkRes: boolean = true;
    constructor() {
        //false为2D true为3D
        this._isType = (window as any).isType || true;
        if (!this._isType) {
            Laya.init(1280, 720);
            Laya.stage.scaleMode = Stage.SCALE_FIXED_AUTO;
        } else {
            Laya3D.init(0, 0);
            Laya.stage.scaleMode = Stage.SCALE_FULL;
            Laya.stage.screenMode = Stage.SCREEN_NONE;
        }
        Laya.stage.bgColor = "#ffffff";
        Stat.show();

        //这里改成true就会从外部加载资源
        this._isReadNetWorkRes = (window as any).isReadNetWorkRes || false;
        if (this._isReadNetWorkRes || ILaya.Browser.onVVMiniGame || ILaya.Browser.onBDMiniGame || ILaya.Browser.onMiniGame) {
            URL.rootPath = URL.basePath ="https://layaair2.ldc2.layabox.com/demo2/h5/";/*"http://10.10.20.55:8000/";*///"https://star.layabox.com/Laya1.0.0/";//"http://10.10.20.55:8000/";"https://layaair.ldc.layabox.com/demo2/h5/";
        }
        //加载引擎需要的资源
        Laya.loader.load([{ url: "res/atlas/comp.json", type: Loader.ATLAS }], Handler.create(this, this.onLoaded));
    }

    private onLoaded(): void {
        let txture: Texture = Laya.loader.getRes("comp/button.png");
        if (!this._isType) {
            //Layaair1.0-2d
            Main.box2D = new Sprite();
            Laya.stage.addChild(Main.box2D);
            Main._indexView = new IndexView2D(Main.box2D, Main);
        } else {
            //Layaair1.0-3d
            Main.box3D = new Sprite();
            Laya.stage.addChild(Main.box3D);
            Main._indexView = new IndexView3D();
        }

        Laya.stage.addChild(Main._indexView);
        Main._indexView.left = 20;
        Main._indexView.top = (window as any).viewtop || 350;
        Main._indexView.mouseEnabled = Main._indexView.mouseThrough = true;
        Main._indexView.switchFunc(0, 0);//切换到指定case
    }
}
