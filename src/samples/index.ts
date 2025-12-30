import "./engine";

import { Resource } from "laya/resource/Resource";
import { Main } from "./Main";
import { Laya3D } from "Laya3D";
import { btPhysicsCreateUtil } from "laya/Physics3D/Bullet/btPhysicsCreateUtil";
import { Physics2D } from "laya/physics/Physics2D";
import { physics2DwasmFactory } from "laya/physics/factory/physics2DwasmFactory"
import "laya/platform/BrowserAdapter";
import "laya/platform/DeviceAdapter";
import "laya/platform/FontAdapter";
import "laya/platform/MediaAdapter";
import "laya/platform/PlatformAdapters";
import "laya/platform/StorageAdapter";
import "laya/platform/TextInputAdapter";

Resource.DEBUG = true;
Physics2D.I._factory = new physics2DwasmFactory();
Laya3D.PhysicsCreateUtil = new btPhysicsCreateUtil();
/** 是否使用 WebGPU，使用的话需要设置为true */
var useWebGPU = false;
async function start(){
    if (useWebGPU) {
        var webGPUFile = './importWebGPU';//使用变量，避免tsc检查，因为有时候没有webgpu源码
        await import(webGPUFile)
    } else {
        await import ("./importWebGL")
    }
    //初始化入口，如果需要默认访问某个指定DEMO，填入第三个参数
    new Main(false, false);
}

start();
//启动后，可以在bin目录下启动anywhere等web服务访问
//
