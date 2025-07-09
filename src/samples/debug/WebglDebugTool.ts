import { Browser } from "laya/utils/Browser";
import { PixelLineSprite3D } from "laya/d3/core/pixelLine/PixelLineSprite3D";
import { Color } from "laya/maths/Color";
import { Vector3 } from "laya/maths/Vector3";
import { LayaGL } from "laya/layagl/LayaGL";

// import WebGL = Laya.WebGL;
// import Browser = Laya.Browser;
var originalfun;
var steps = [];
var sp;
var gl:WebGLRenderingContext;
// @ts-ignore 
sp = window.spector;
/**
 * 注意需要有spector.js的插件，并且移动。否则只是简单的逐步调试
 */
export function startDebug(){
    originalfun = requestAnimationFrame;
    window.requestAnimationFrame = (callback: any) => {
        if (typeof callback !== 'function') {
        throw new TypeError(`${callback}is not a function`);
        }
    
        if (steps.indexOf(callback) === -1) {
            steps.push(callback);
        }
    
        return steps.indexOf(callback);
    };

    // @ts-ignore 
    window.run = run;
}

function handler() {
    steps.forEach(item => {
        if (item) {
            item(performance.now());
        }
    });
}
export function startCapture() {
    if (!gl&&Browser.mainCanvas && Browser.mainCanvas.source) {
        gl = LayaGL.renderEngine._context;
    }
    if(gl && sp){
        sp.startCapture(gl,9999)
    }
}

export function stopCapture() {
    if (!gl&&Browser.mainCanvas && Browser.mainCanvas.source) {
        gl = LayaGL.renderEngine._context;

    }
    if(gl && sp){
        let ca = sp.stopCapture();
    }
}

export function run(startTime?:number) {
    if (!gl&&Browser.mainCanvas && Browser.mainCanvas.source) {
        gl = LayaGL.renderEngine._context;
    }
    if(gl && sp){
        sp.startCapture(gl,9999)
    }
    handler();
    if(gl && sp){
        let ca = sp.stopCapture();
        // sp.spyCanvases()
    }
};

export function exitDebug(){
    window.requestAnimationFrame = originalfun;
    steps.forEach(_fun => {
        window.requestAnimationFrame(_fun);
    });
    steps.length = 0;
}

var line:PixelLineSprite3D;

// export function AddAxis(){
//     if (!line) {
//         line = new PixelLineSprite3D(200);
//         let red = Color.RED;
//         let blue = Color.BLUE;
//         let green = Color.GREEN;
//         line.addLine(new Vector3,new Vector3(0,100,0),green,green);
//         line.addLine(new Vector3,new Vector3(0,0,100),blue,blue);
//         line.addLine(new Vector3,new Vector3(100,0,0),red,red);
//     }
//     let editor = (window as any).LayaMeEditor as Editor;
//     let scene3d = editor.context.fastScene.scene;
//     scene3d.addChild(line);
//     // LayaMe
//     let ori = editor.curChoice.getWorldMatrix();
//     let out = line.transform.worldMatrix;
//     ori.cloneTo(out);
//     line.transform.worldMatrix = out;
// }

// export var initDeug = ()=>{
//     //@ts-ignore
//     window.startDebug = startDebug;
//     //@ts-ignore
//     window.exitDebug = exitDebug;
//     //@ts-ignore
// 	window.run = run;
//     //@ts-ignore
//     window.startCapture = startCapture;
//     //@ts-ignore
//     window.stopCapture = stopCapture;
// }