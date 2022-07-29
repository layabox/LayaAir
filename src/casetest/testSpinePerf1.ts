import { delay, loadRes } from './delay.js'
import { Laya } from 'Laya.js';
import { Sprite } from 'laya/display/Sprite.js';
import { Texture } from 'laya/resource/Texture.js';
import { Loader } from 'laya/net/Loader.js';
import { Handler } from 'laya/utils/Handler.js';
import { Skeleton } from 'laya/ani/bone/Skeleton.js'
import { Templet } from 'laya/ani/bone/Templet.js'
import { getResPath } from './resPath.js';

class Main {
    rolsInfo = [
        { sk: getResPath('spine/ymlm.sk'), act: 0 },		// dragone bone
        { sk: getResPath('spine/hero_006.sk'), act: 'sk_2' }	// spine
    ];
    roleid = 0;
    templetCache: Templet = null;

    constructor() {
        Laya.init(800, 1600);
        //Laya.stage.scaleMode = 'fixedwidth';
        Laya.stage.bgColor = "#ffffff";
        Laya.stage.screenMode = 'none';
        //Laya.Stat.show();

        Laya.loader.load(this.rolsInfo[this.roleid].sk, null, () => this.test1());
    }

    getRole(aniType: number, parent: Sprite) {
        var skeleton: Skeleton = null;
        var _x = Math.random() * 640;
        var _y = Math.random() * 1136;
        //role = DisplayUtils_1.displayUtils.createSkeleton(_x, _y, 'res/ani/SwordsMan', 0);
        var templet: Templet = Laya.loader.getRes(this.rolsInfo[this.roleid].sk);

        if (templet) {
            skeleton = templet.buildArmature(aniType);
            skeleton.pos(_x, _y);
            skeleton.scale(0.3, 0.3);
            parent && parent.addChild(skeleton);
        }
        skeleton.play(this.rolsInfo[this.roleid].act, true);
    }

    /**
     * spine动画
     */
    async test1() {
        let num = 800;
        for (let i = 0; i < num; i++) {
            this.getRole(0, Laya.stage);
        }

        await delay(10);  // 等待渲染结果
        (window as any).testEnd = true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
