
import {delay, loadRes} from './delay'
import { Sprite } from 'laya/display/Sprite';
import { Laya } from 'Laya';
import { Texture } from 'laya/resource/Texture';
import { Context } from 'laya/resource/Context';
import { Handler } from 'laya/utils/Handler';
import { getResPath } from './resPath';

const min = Math.min;

/**
 * 用户提供的一个例子
 */
class TimeSprite extends Sprite {
    __texture:Texture=null;
    _width=0;
    _height=0;
    _vertices:number[]=null;
    _uvs:number[]=null;
    _indices:number[]=null;

    vertices:Float32Array=null;
    uvs:Float32Array=null;
    indices:Uint16Array=null;
    _dirty=true;
    constructor(texture:string, width:number, height:number) {
        super();

        this.__texture = Laya.loader.getRes(texture);
        this._width = width || 0;
        this._height = height || 0;

        this.customRenderEnable = true;
    }

    repaint() {
        Sprite.prototype.repaint.call(this);
        this._dirty = true;
    }

    customRender(context:Context, x:number, y:number) {
        if (this.__texture) {
            this._draw(context);
        }
    }

    _draw(ctx:Context) {
        if (this._dirty) {
            this._generateVertices();
        }

        ctx.drawTriangles(this.__texture,0,0,this.vertices,this.uvs,this.indices,null,1,null,null);

        this._dirty = false;
    }

    _generateVertices() {
        this._vertices = [];
        this._uvs = [];
        this._indices = [];

        var w = 0;
        var h = 0;
        var W = this.width;
        var H = this.height;
        var tw = this.__texture.width;
        var th = this.__texture.height;
        var uvrect = this.__texture.uvrect;

        for (var y = 0; y < H; y += h) {
            for (var x = 0; x < W; x += w) {
                w = min(W - x, tw);
                h = min(H - y, th);
                this._addRect(x, y, w, h, tw, th, uvrect);
            }
        }

        this.vertices = Float32Array.from(this._vertices);
        this.uvs = Float32Array.from(this._uvs);
        this.indices = Uint16Array.from(this._indices);
    }

    _addRect(x, y, w, h, tw, th, uvrect) {
        var i = this._vertices.length / 2;

        var x1 = x + w;
        var y1 = y + h;
        this._vertices.push(x, y, x1, y, x1, y1, x, y1);

        x = uvrect[0];
        y = uvrect[1];
        x1 = uvrect[0] + uvrect[2] * w / tw;
        y1 = uvrect[1] + uvrect[3] * h / th;
        this._uvs.push(x, y, x1, y, x1, y1, x, y1);

        this._indices.push(i, i + 1, i + 3, i + 1, i + 2, i + 3);
    }
}

class Main {
	constructor() {
        Laya.init(1024,1024);
        Laya.stage.screenMode = 'none';
        Laya.loader.load(getResPath('atlas/tiles.atlas'), Handler.create(this, this.test1));        
    }
    
    /**
     * drawTriangle的mask的问题
     * 1. 没有正确计算大小
     * 2. 没有加载texture的情况下，一旦加载了要能更新
     */
    async test1(){
        var fSp = new Sprite();
        var tex = new Texture();
        tex.load(getResPath('monkey0.png'));
        fSp.graphics.drawTriangles(tex,0,0,
            new Float32Array([0,0, 200, 0, 200, 200, 0, 200]), 
            new Float32Array([0,0,1,0,1,1,0,1]), 
            new Uint16Array([0,1,2,0,2,3]));
        var maskSp= new Sprite();
        maskSp.graphics.drawPie(100,100, 100, 0,190, 'green');
        Laya.stage.addChild(fSp);
        fSp.mask = maskSp;
 
        var sp1 = new TimeSprite('tiles/bg.png',1000,300);
        sp1.pos(0,300);
		var mask = new Sprite();
		mask.size(300, 300);
        mask.graphics.drawCircle(150, 150, 150, '#00ff00');        
        Laya.stage.addChild(sp1);
        sp1.cacheAs='bitmap'
        sp1.mask=mask;

        delay(100);
        
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
