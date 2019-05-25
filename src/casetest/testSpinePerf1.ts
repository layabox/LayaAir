import {delay,loadRes} from './delay.js'

class Main {
    rolsInfo = [
        { tex:'res/spine/ymlm.png', sk:'res/spine/ymlm.sk', act:0 },		// dragone bone
        {tex:'res/spine/hero_006.png', sk:'res/spine/hero_006.sk', act:'sk_2' }	// spine
    ];
    roleid = 0;
    templetCache:Laya.Templet = null;

	constructor() {
        Laya3D.init(800,1600);
		//Laya.stage.scaleMode = 'fixedwidth';
        Laya.stage.bgColor = "#ffffff";
        Laya.stage.screenMode = 'none';
        Laya.Stat.show();
        var res = [
            { "type": Laya.Loader.BUFFER, "url": this.rolsInfo[this.roleid].sk },
            { "type": Laya.Loader.IMAGE, "url": this.rolsInfo[this.roleid].tex}
        ];
        Laya.loader.load(res,  Laya.Handler.create(this,this.test1), null, null);
    }
    
    getRole(aniType:number, parent:Laya.Sprite) {
        var skeleton:Laya.Skeleton = null;
        var _x = Math.random() * 640;
        var _y = Math.random() * 1136;
            //role = DisplayUtils_1.displayUtils.createSkeleton(_x, _y, 'res/ani/SwordsMan', 0);
        var templet:Laya.Templet ;
        if ( !this.templetCache) {
            templet = new Laya.Templet();
            var pngData:Laya.Texture = Laya.loader.getRes(this.rolsInfo[this.roleid].tex);
            var skData:ArrayBuffer = Laya.loader.getRes(this.rolsInfo[this.roleid].sk);
            if (pngData && skData) {
                templet.parseData(pngData, skData);
                this.templetCache = templet;
            }
        }else {
            templet = this.templetCache;
        }
        if (templet) {
            skeleton = templet.buildArmature(aniType);
            skeleton.pos(_x, _y);
            skeleton.scale(0.3,0.3);
            parent && parent.addChild(skeleton);
        }
        skeleton.play(this.rolsInfo[this.roleid].act, true);
    }    

    /**
     * spine动画
     */
    async test1(){
        let num = 800;
        for (let i = 0; i < num; i++) {
            this.getRole(0, Laya.stage);
        }

        await delay(10);  // 等待渲染结果
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
