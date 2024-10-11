import "laya/ModuleDef";

import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Sprite } from "laya/display/Sprite";
import { Text } from "laya/display/Text";

//HierarchyLoader和MaterialLoader等是通过前面的import完成的

function appendH5Canvas() {
    const layaCanvas = document.getElementById('layaCanvas') as HTMLCanvasElement;
    // 创建新的canvas元素
    const overlayCanvas = document.createElement('canvas');
    overlayCanvas.width = layaCanvas.width;
    overlayCanvas.height = layaCanvas.height;

    // 设置新canvas的样式，使其覆盖在原有canvas上
    overlayCanvas.style.position = 'absolute';
    overlayCanvas.style.left = layaCanvas.offsetLeft + 'px';
    overlayCanvas.style.top = layaCanvas.offsetTop + 'px';
    overlayCanvas.style.pointerEvents = 'none'; // 允许点击穿透

    // 将新canvas添加到DOM中
    layaCanvas.parentNode.appendChild(overlayCanvas);

    // 获取新canvas的上下文
    const ctx = overlayCanvas.getContext('2d');

    // 设置整体半透明
    ctx.globalAlpha = 0.5;

    // 设置文字样式
    ctx.font = '96px Microsoft YaHei'; // 使用隶书字体，32号大小
    ctx.fillStyle = 'white';
    //ctx.textBaseline = 'middle';
    ctx.textBaseline = 'top';

    ctx.strokeStyle = 'red';
    // 在指定位置绘制文字
    ctx.fillText('这是顶级', 100, 0);
    ctx.strokeText('这是顶级',100,0)

}

async function test() {
    //初始化引擎
    await Laya.init(0, 0);
    Laya.stage.scaleMode = Stage.SCALE_FULL;
    Laya.stage.screenMode = Stage.SCREEN_NONE;

    let sp = new Text()
    sp.color = 'white'
    sp.font = 'Microsoft YaHei'
    sp.fontSize = 96
    sp.text = '这是顶级'
    sp.pos(100, 0)

    Laya.stage.addChild(sp);

    setTimeout(() => {
        appendH5Canvas();//一上来就做会canvas为0
    }, 3000);

}


test();