import "laya/d3/core/scene/Scene3D";
import "laya/ModuleDef";
import "laya/d3/ModuleDef";
import "laya/d3/physics/ModuleDef";
import "laya/ui/ModuleDef";
import "laya/ani/ModuleDef";
import "laya/spine/ModuleDef";
import "laya/gltf/glTFLoader";


import { Laya } from "Laya";

import { Event } from "laya/events/Event";
import { LayaGL } from "laya/layagl/LayaGL";
import { Loader } from "laya/net/Loader";
import { SpineSkeleton } from "laya/spine/SpineSkeleton";

import { SpineTemplet } from "laya/spine/SpineTemplet";
import { Browser } from "laya/utils/Browser";
import { Stat } from "laya/utils/Stat";
import { Sprite } from "laya/display/Sprite";
import { Image } from "laya/ui/Image";
import { Sprite3DLoad } from "./3d/LayaAir3D_Sprite3D/Sprite3DLoad";
import { WebGLRenderEngineFactory } from "laya/RenderDriver/WebGLDriver/RenderDevice/WebGLRenderEngineFactory";
import { WebUnitRenderModuleDataFactory } from "laya/RenderDriver/RenderModuleData/WebModuleData/WebUnitRenderModuleDataFactory";
import { LengencyRenderEngine3DFactory } from "laya/RenderDriver/DriverDesign/3DRenderPass/LengencyRenderEngine3DFactory";
import { Web3DRenderModuleFactory } from "laya/RenderDriver/RenderModuleData/WebModuleData/3D/Web3DRenderModuleFactory";
import { WebGL3DRenderPassFactory } from "laya/RenderDriver/WebGLDriver/3DRenderPass/WebGL3DRenderPassFactory";
import { WebGLRenderDeviceFactory } from "laya/RenderDriver/WebGLDriver/RenderDevice/WebGLRenderDeviceFactory";
import { Laya3DRender } from "laya/d3/RenderObjs/Laya3DRender";
import { WebGLRender2DProcess } from "laya/RenderDriver/WebGLDriver/2DRenderPass/WebGLRender2DProcess";
import { Scene } from "laya/display/Scene";
import { HttpRequest } from "laya/net/HttpRequest";
import { Script } from "laya/components/Script";
import { Vector3 } from "laya/maths/Vector3";
import { Vector2 } from "laya/maths/Vector2";
import { Color } from "laya/maths/Color";
import { Matrix } from "laya/maths/Matrix";
import { Point } from "laya/maths/Point";
import { Vector4 } from "laya/maths/Vector4";
import { Panel } from "laya/ui/Panel";
import { Mouse } from "laya/utils/Mouse";
import { Handler } from "laya/utils/Handler";
import { LocalStorage } from "laya/net/LocalStorage";
import { Ease } from "laya/utils/Ease";
import { Tween } from "laya/utils/Tween";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { EventDispatcher } from "laya/events/EventDispatcher";
import { ScrollType } from "laya/ui/Styles";
import { SoundManager } from "laya/media/SoundManager";
import { property, regClass } from "Decorators";
import { Config3D } from "Config3D";
import { Config } from "Config";
import { ClassUtils } from "laya/utils/ClassUtils";
import { WorkerLoader } from "laya/net/WorkerLoader";
import { BatchProgress } from "laya/net/BatchProgress";
import { SoundChannel } from "laya/media/SoundChannel";
import { URL } from "laya/net/URL";
import { Utils } from "laya/utils/Utils";
import { SketonOptimise } from "laya/spine/optimize/SketonOptimise";
import { Spine2DRenderNode } from "laya/spine/Spine2DRenderNode";
import { SpineBakeScript } from "laya/spine/optimize/SpineBakeScript";


export class Entrance {

    private skeleton: any;
    private index: number = -1;

    //Main: typeof Main = null;
    
    private play(): void {
        if (++this.index >= this.skeleton.getAnimNum()) {
            this.index = 0
        }
        this.skeleton.play(this.index, false, true)
    }
    constructor() {
        //this.Main = maincls;
        LayaGL.renderOBJCreate = new WebGLRenderEngineFactory();
        LayaGL.unitRenderModuleDataFactory = new WebUnitRenderModuleDataFactory();
        LayaGL.renderDeviceFactory = new WebGLRenderDeviceFactory();
        Laya3DRender.renderOBJCreate = new LengencyRenderEngine3DFactory();
        Laya3DRender.Render3DModuleDataFactory = new Web3DRenderModuleFactory();
        Laya3DRender.Render3DPassFactory = new WebGL3DRenderPassFactory();
        LayaGL.renderOBJCreate = new WebGLRenderEngineFactory();
        LayaGL.render2DRenderPassFactory = new WebGLRender2DProcess()
        SpineTemplet.RuntimeVersion = "4.1";
        // new Sprite3DLoad();
        // return;
        // new Sprite3DLoad();
        // return;

        // new Sprite3DLoad();
        // return;
        Laya.init(Browser.width, Browser.height).then(async () => {
            let sizeString=Browser.getQueryString("size")||"1";
            let size:number=parseInt(sizeString);

            let enableCache=Browser.getQueryString("cache")||"false";
            let enableCacheBool=enableCache=="true";
            SketonOptimise.cacheSwitch=true;

            let closeRender2D=Browser.getQueryString("closeRender2D")||"false";
            let closeRender2DBool=closeRender2D=="true";
            //@ts-ignore
            window.closeRender2D=closeRender2DBool;

            let renderNormal=Browser.getQueryString("renderNormal")||"false";
            let renderNormalBool=renderNormal=="true";
            SketonOptimise.normalRenderSwitch=renderNormalBool;

        //     let abc=await Laya.loader.load("https://static.xingzheai.cn/aigg/avgres/web/1714036708961/1714036708961.mp4", Loader.VIDEO);
        //    debugger;
        //     return;
            Laya.stage.bgColor = "#000000";
            // let a = new Image();
            Stat.show();
            // //  a.skin="res/xx.png";
            // //  Laya.stage.addChild(a);
            // let texture = await Laya.loader.load("res/xx.png", Loader.IMAGE);
            //a.graphics.drawTriangles(
            //a.graphics.drawTriangles(texture, 0, 0 , new Float32Array([0, 0, 100,0, 100, 100, 0,100]),new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),new Uint16Array([0, 1, 2, 0, 2, 3]));
            // a.graphics.drawSpineTriangles(texture, 0, 0, new Float32Array([0, 0,0,0,0,0,0,0, 50, 0,0,0,0,0,0.5,0, 100, 100,0,0,0,0,1,1, 0, 100,0,0,0,0,0,1]),new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),new Uint16Array([0, 1, 2, 0, 2, 3]));

            //a.graphics.drawSpineTriangles(texture, 100, 200, new Float32Array([0, 0,0,0,0,0,0,0, 50, 0,0,0,0,0,0.5,0, 100, 100,0,0,0,0,1,1, 0, 100,0,0,0,0,0,1]),new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),new Uint16Array([0, 1, 2, 0, 2, 3]));
            //Laya.stage.addChild(a);
      // Laya.loader.load("res/spine/Sp_staff.json", Loader.SPINE).then((templet: SpineTemplet) => {
        Laya.loader.load("res/spine/07.json", Loader.SPINE).then(async (templet: SpineTemplet) => {
         //  let a= Laya.loader.getRes("res/spine/spineboy-pma.skel");
           //debugger;
        // Laya.loader.load("res/spine/mesh.json", Loader.SPINE).then((templet: SpineTemplet) => {
        //Laya.loader.load("res/spine/Customer/Sp_customer.skel", Loader.SPINE).then((templet: SpineTemplet) => {
               //templet.renderType=ERenderType.boneGPU;
                for (let i = 0; i < size; i++) {
                    let s = new Sprite()
                    let renderNode=  s.addComponent(Spine2DRenderNode)
        
                    this.skeleton = renderNode;
                        //@ts-ignore
                    window.jj=s;
                    // s.skinName="playerskin_1";
                    renderNode.templet = templet;

                    let a = new Sprite();
                    let renderNode2 =  a.addComponent(Spine2DRenderNode);
                    renderNode2.templet = templet;
                    
                    let sb= s.addComponent(SpineBakeScript)
                    sb.url="res/spine/test.ktx";
                    await sb.attach(renderNode.spineItem);

                    Laya.stage.addChild(s);
                    Laya.stage.addChild(a);
                    s.pos(100+i*3, 700);
                    a.pos(400+i*300, 700);
                    s.scale(1, 1);
                    s.on(Event.STOPPED, this, this.play);
                  //  let n = s.getAnimNum();
                    //s.play(i%n, true, true);
                    //this.play();
                    renderNode.play(0, true, true);
                    renderNode2.play(i, true, true);
                
                
                
                
                
                
                    //     let s = new SpineSkeleton();
        
                //     //let dd=s.addComponent(SpineSkeletonScipt);
                //     this.skeleton = s;
                //     //@ts-ignore
                //    window.jj=s;
                //   // s.skinName="playerskin_1";
                //    s.templet = templet;
                //    Laya.stage.addChild(s);
                //     s.pos(100+i*3, 700);
                //     s.scale(1, 1);
                //     s.on(Event.STOPPED, this, this.play);
                //   //  let n = s.getAnimNum();
                //     //s.play(i%n, true, true);
                //     //this.play();
                //     s.play("portal", true, true);
                }

            });
        });
        //});
    }
}
// SketonOptimise.cacheSwitch=true;
// //@ts-ignore
// let sb:any=window.Laya=Object.create(Laya);
// sb.Scene=Scene;
// sb.HttpRequest=HttpRequest;
// sb.Event=Event;
// sb.Browser=Browser;
// sb.Script=Script;
// sb.Vector3=Vector3;
// sb.Vector2=Vector2;
// sb.Vector4=Vector4;
// sb.Color=Color;
// sb.Point=Point;
// sb.Matrix=Matrix;
// sb.Mouse=Mouse;
// sb.Panel=Panel;
// sb.Handler=Handler;
// sb.LocalStorage=LocalStorage;
// sb.Ease=Ease;
// sb.Tween=Tween;
// sb.Sprite3D=Sprite3D;
// sb.ScrollType=ScrollType;
// sb.SoundManager=SoundManager;
// sb.EventDispatcher=EventDispatcher;
// sb.Config=Config;
// sb.Config3D=Config3D;
// sb.Stat=Stat;
// sb.URL=URL;
// sb.ClassUtils=ClassUtils;
// sb.SpineTemplet=SpineTemplet;
// sb.WorkerLoader=WorkerLoader;
// sb.BatchProgress=BatchProgress;
// sb.Loader=Loader;
// sb.SoundChannel=SoundChannel;


// //sb.Physics=Physics;
// sb.regClass=regClass;
// sb.property=property;
// LayaGL.renderOBJCreate = new WebGLRenderEngineFactory();
// LayaGL.unitRenderModuleDataFactory = new WebUnitRenderModuleDataFactory();
// LayaGL.renderDeviceFactory = new WebGLRenderDeviceFactory();
// Laya3DRender.renderOBJCreate = new LengencyRenderEngine3DFactory();
// Laya3DRender.Render3DModuleDataFactory = new Web3DRenderModuleFactory();
// Laya3DRender.Render3DPassFactory = new WebGL3DRenderPassFactory();
// LayaGL.renderOBJCreate = new WebGLRenderEngineFactory();
// LayaGL.render2DRenderPassFactory = new WebGLRender2DProcess()





