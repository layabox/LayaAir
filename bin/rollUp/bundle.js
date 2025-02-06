window.Laya=window.Laya||{};

(function (Laya) {
    'use strict';

    var __defProp = Object.defineProperty;
    var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __publicField = (obj, key, value) => {
      __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
      return value;
    };
    class Entrance {
      constructor() {
        __publicField(this, "skeleton");
        __publicField(this, "index", -1);
        Laya.LayaGL.renderOBJCreate = new Laya.WebGLRenderEngineFactory();
        Laya.LayaGL.unitRenderModuleDataFactory = new Laya.WebUnitRenderModuleDataFactory();
        Laya.LayaGL.renderDeviceFactory = new Laya.WebGLRenderDeviceFactory();
        Laya.Laya3DRender.renderOBJCreate = new Laya.LengencyRenderEngine3DFactory();
        Laya.Laya3DRender.Render3DModuleDataFactory = new Laya.Web3DRenderModuleFactory();
        Laya.Laya3DRender.Render3DPassFactory = new Laya.WebGL3DRenderPassFactory();
        Laya.LayaGL.renderOBJCreate = new Laya.WebGLRenderEngineFactory();
        Laya.LayaGL.render2DRenderPassFactory = new Laya.WebGLRender2DProcess();
        Laya.SpineTemplet.RuntimeVersion = "3.8";
        Laya.Laya.init(Laya.Browser.width, Laya.Browser.height).then(async () => {
          Laya.Laya.stage.scaleMode = "full";
          let sizeString = Laya.Browser.getQueryString("size") || "1";
          let size = parseInt(sizeString);
          let loop = Laya.Browser.getQueryString("loop") || "true";
          let enableLoop = loop == "true";
          let ani = Laya.Browser.getQueryString("ani") || "0";
          let aniNum = parseInt(ani);
          let enableCache = Laya.Browser.getQueryString("cache") || "false";
          let enableCacheBool = enableCache == "true";
          let closeRender2D = Laya.Browser.getQueryString("closeRender2D") || "false";
          let closeRender2DBool = closeRender2D == "true";
          window.closeRender2D = closeRender2DBool;
          let renderNormal = Laya.Browser.getQueryString("renderNormal") || "false";
          let renderNormalBool = renderNormal == "true";
          Laya.SketonOptimise.normalRenderSwitch = renderNormalBool;
          Laya.Laya.stage.bgColor = "#565656";
          Laya.Laya.loader.load("res/spine/saw/saw.json", Laya.Loader.SPINE).then(async (templet) => {
            let col = 8;
            for (let i = 0; i < size; i++) {
              let s = new Laya.Sprite();
              let renderNode = s.addComponent(Laya.Spine2DRenderNode);
              this.skeleton = renderNode;
              window.jj = s;
              renderNode.templet = templet;
              renderNode.skinName = "Lv1";
              s.on(Laya.Event.STOPPED, this, () => {
                this.play();
              });
              Laya.Laya.stage.addChild(s);
              let y = 1e3 + (i / col | 0) * 150;
              let x = 300 + i % col * 200;
              s.pos(x, y);
              s.scale(4, 4);
              let n = renderNode.getAnimNum();
              if (size >= 15) {
                renderNode.play(0, true, true);
                let item = renderNode.spineItem;
                for (let j = 0; j < i; j++)
                  renderNode._update();
                renderNode.paused();
              } else {
                renderNode.play(aniNum, enableLoop, true);
              }
            }
          });
        });
      }
      //Main: typeof Main = null;
      play() {
        if (++this.index >= this.skeleton.getAnimNum()) {
          this.index = 0;
        }
        this.skeleton.play(this.index, false, true);
      }
    }

    Laya.physics2DwasmFactory;
    Laya.Resource.DEBUG = true;
    Laya.LayaGL.unitRenderModuleDataFactory = new Laya.WebUnitRenderModuleDataFactory();
    Laya.LayaGL.renderDeviceFactory = new Laya.WebGLRenderDeviceFactory();
    Laya.Laya3DRender.renderOBJCreate = new Laya.LengencyRenderEngine3DFactory();
    Laya.Laya3DRender.Render3DModuleDataFactory = new Laya.Web3DRenderModuleFactory();
    Laya.Laya3DRender.Render3DPassFactory = new Laya.WebGL3DRenderPassFactory();
    Laya.LayaGL.renderOBJCreate = new Laya.WebGLRenderEngineFactory();
    Laya.LayaGL.render2DRenderPassFactory = new Laya.WebGLRender2DProcess();
    new Entrance();

})(Laya);
