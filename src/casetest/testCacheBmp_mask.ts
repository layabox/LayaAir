import { Laya } from 'Laya.js';
import { Sprite } from 'laya/display/Sprite.js';
import { Box } from 'laya/ui/Box.js';
import { List } from 'laya/ui/List.js';
import { Handler } from 'laya/utils/Handler.js';
import { delay } from './delay.js';

class MoreGameItem extends Box{
    iconImg:Sprite;
    constructor(){
        super();
    }

    init(src:string){
        if(!this.iconImg){
            //var img =  new Image();
            //img.skin = iconpath+src;
            var img = new Sprite();
            img.graphics.drawRect(0,0,100,100,'red');
            this.addChild(img);
            var mask = new Sprite();
            mask.graphics.drawCircle(71,74,68,'#ff0000');
            img.mask=mask;

            this.iconImg =img;
        }
        this.width=287;
        this.height=457;
    }
}

/**
 * cacheas bitmap 内部又有 mask 的错误
 */
class Main {
    iconarr=[
        {
            "icon":"15052995/V0.0.1/icon.png"
        }
    ];

	constructor() {
        Laya.init(800,600);
		//Laya.stage.scaleMode = 'fixedwidth';
		Laya.stage.screenMode = 'none';
        //Laya.Stat.show();
        this.test1();
    }
    
    /**
     */
    async test2(){
        //await loadRes(iconpath+'15052995/V0.0.1/icon.png');
        var box = new Box();
        box.pos(400,10);
        //Laya.stage.addChild(box);

        var gamelist = new List();
        gamelist.pos(200,10);
        //box.addChild(gamelist);
        Laya.stage.addChild(gamelist);
        gamelist.cacheAs='bitmap';
        gamelist.itemRender=MoreGameItem;
        gamelist.renderHandler = new Handler(this,this.onGameListRender);
        gamelist.array=this.iconarr;
        gamelist.size(960,453);
        gamelist.centerX = -119;
        gamelist.centerY = 53;
        gamelist.spaceX = 25;
        box.cacheAs='bitmap';

        await delay(10);  // 等待渲染结果
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }

    onGameListRender(item:MoreGameItem, index:number){
        item.init(this.iconarr[index].icon);
        item.iconImg.pos(71,-44);
    }

    async test1(){
        var sp1 = new Sprite();
        sp1.pos(10,10);
        Laya.stage.addChild(sp1);

        var sp2 = new Sprite();
        sp2.graphics.drawRect(0,0,100,100,'red');
        sp2.rotation=10;
        //sp2.cacheAs='bitmap'
        var mask = new Sprite();
        mask.graphics.drawCircle(50,50,50,'#ff0000');
        sp2.mask=mask;

        sp1.addChild(sp2);

        sp1.graphics.drawRect(-10,0,100,100,'green');
        sp1.cacheAs='bitmap';

        await delay(10);  // 等待渲染结果
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
