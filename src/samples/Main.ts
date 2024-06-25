
import { Laya } from "Laya";
import { Stat } from "laya/utils/Stat";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Loader } from "laya/net/Loader";
import { URL } from "laya/net/URL";
import { Handler } from "laya/utils/Handler";
import { IndexView2D } from "./view/IndexView2D";
import { IndexView3D } from "./view/IndexView3D";
import { Texture } from "laya/resource/Texture";
import Client from "./Client";
import { LayaEnv } from "LayaEnv";
import { LengencyRenderEngine3DFactory } from "laya/RenderDriver/DriverDesign/3DRenderPass/LengencyRenderEngine3DFactory";
import { GLESRender2DProcess } from "laya/RenderDriver/OpenGLESDriver/2DRenderPass/GLESRender2DProcess";
import { GLES3DRenderPassFactory } from "laya/RenderDriver/OpenGLESDriver/3DRenderPass/GLES3DRenderPassFactory";
import { GLESRenderDeviceFactory } from "laya/RenderDriver/OpenGLESDriver/RenderDevice/GLESRenderDeviceFactory";
import { GLESRenderEngineFactory } from "laya/RenderDriver/OpenGLESDriver/RenderDevice/GLESRenderEngineFactory";
import { RT3DRenderModuleFactory } from "laya/RenderDriver/RenderModuleData/RuntimeModuleData/3D/RT3DRenderModuleFactory";
import { RTUintRenderModuleDataFactory } from "laya/RenderDriver/RenderModuleData/RuntimeModuleData/RTUintRenderModuleDataFactory";
import { Web3DRenderModuleFactory } from "laya/RenderDriver/RenderModuleData/WebModuleData/3D/Web3DRenderModuleFactory";
import { WebUnitRenderModuleDataFactory } from "laya/RenderDriver/RenderModuleData/WebModuleData/WebUnitRenderModuleDataFactory";
import { WebGLRender2DProcess } from "laya/RenderDriver/WebGLDriver/2DRenderPass/WebGLRender2DProcess";
import { WebGL3DRenderPassFactory } from "laya/RenderDriver/WebGLDriver/3DRenderPass/WebGL3DRenderPassFactory";
import { WebGLRenderDeviceFactory } from "laya/RenderDriver/WebGLDriver/RenderDevice/WebGLRenderDeviceFactory";
import { WebGLRenderEngineFactory } from "laya/RenderDriver/WebGLDriver/RenderDevice/WebGLRenderEngineFactory";
import { Laya3DRender } from "laya/d3/RenderObjs/Laya3DRender";
import { LayaGL } from "laya/layagl/LayaGL";

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
    private _is3D: boolean = false;
    static isWXAPP: boolean = false;
    private _isReadNetWorkRes: boolean = true;
    static isOpenSocket: boolean = false;
    private _singleDemo: any;
    /**
     * @param is3D true为3d, false为2d
     * @param isReadNetWorkRes true从网络读取资源，false从本地目录读取资源(bin/res)。
     * @param singleDemo  单个Demo入口
     */
    constructor(is3D: boolean = true, isReadNetWorkRes: boolean = false, singleDemo?: any) {
        this._singleDemo = singleDemo;
        if (!LayaEnv.isConch || (LayaEnv.isConch && (window as any).conchConfig.getGraphicsAPI() == 2)) {
            LayaGL.unitRenderModuleDataFactory = new WebUnitRenderModuleDataFactory();
            LayaGL.renderDeviceFactory = new WebGLRenderDeviceFactory();
            Laya3DRender.renderOBJCreate = new LengencyRenderEngine3DFactory();
            Laya3DRender.Render3DModuleDataFactory = new Web3DRenderModuleFactory();
            Laya3DRender.Render3DPassFactory = new WebGL3DRenderPassFactory();
            LayaGL.renderOBJCreate = new WebGLRenderEngineFactory();
            LayaGL.render2DRenderPassFactory = new WebGLRender2DProcess()
        } else {
            LayaGL.unitRenderModuleDataFactory = new RTUintRenderModuleDataFactory();
            LayaGL.renderDeviceFactory = new GLESRenderDeviceFactory();
            Laya3DRender.renderOBJCreate = new LengencyRenderEngine3DFactory();
            Laya3DRender.Render3DModuleDataFactory = new RT3DRenderModuleFactory();
            Laya3DRender.Render3DPassFactory = new GLES3DRenderPassFactory();
            LayaGL.renderOBJCreate = new GLESRenderEngineFactory();
            LayaGL.render2DRenderPassFactory = new GLESRender2DProcess()
        }
        Laya.init(this._is3D ? 0 : 1280, this._is3D ? 0 : 720).then(() => {
            if (!this._is3D) {
                Laya.stage.scaleMode = Stage.SCALE_FIXED_AUTO;
            } else {
                Laya.stage.scaleMode = Stage.SCALE_FULL;
                Laya.stage.screenMode = Stage.SCREEN_NONE;
            }//false为2D true为3D
            this._is3D = is3D;
            if (!this._is3D) {
                Laya.init(1280, 720);
                Laya.stage.scaleMode = Stage.SCALE_FIXED_AUTO;
            } else {
                Laya.init(0, 0);
                Laya.stage.scaleMode = Stage.SCALE_FULL;
                Laya.stage.screenMode = Stage.SCREEN_NONE;
            }
            Laya.stage.bgColor = "#ffffff";
            Stat.show();

            //初始化socket连接
            if (Main.isOpenSocket)
                Client.init();

            //这里改成true就会从外部加载资源
            this._isReadNetWorkRes = isReadNetWorkRes;
            if (this._isReadNetWorkRes) {
                URL.rootPath = URL.basePath = "https://layaair.layabox.com/3.x/api/EngineDemoResource/";/*"http://10.10.20.55:8000/";*///"https://star.layabox.com/Laya1.0.0/";//"http://10.10.20.55:8000/";"https://layaair.ldc.layabox.com/demo2/h5/";
            } else {
                URL.basePath += "sample-resource/";
            }
            // 加载fileConfig.json配置内容
            Laya.loader.loadPackage("", null, null).then(() => {
                //加载引擎需要的资源
                Laya.loader.load([{ url: "res/atlas/comp.json", type: Loader.ATLAS }], Handler.create(this, this.onLoaded));
            });
        })
    }

    private onLoaded(): void {
        if (Main.isOpenSocket)
            Client.instance.send({ type: "login" });

        let texture: Texture = Laya.loader.getRes("comp/button.png");
        texture.bitmap.lock = true;
        if (!this._is3D) {
            //Layaair1.0-2d
            Main.box2D = new Sprite();
            Laya.stage.addChild(Main.box2D);
            if (this._singleDemo) {
                new this._singleDemo(Main);
                return;
            } else {
                Main._indexView = new IndexView2D(Main.box2D, Main);
            }
        } else {
            //Layaair1.0-3d
            Main.box3D = new Sprite();
            Laya.stage.addChild(Main.box3D);
            if (this._singleDemo) {
                new this._singleDemo();
                return;
            } else {
                Main._indexView = new IndexView3D();
            }
        }
        Laya.stage.addChild(Main._indexView);
        Main._indexView.left = 10;
        Main._indexView.bottom = (window as any).viewtop || 50;
        Main._indexView.mouseEnabled = Main._indexView.mouseThrough = true;
        Main._indexView.switchFunc(0, 0);//切换到指定case

    }
}