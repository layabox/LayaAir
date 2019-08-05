import {delay} from './delay.js'
import { Laya } from 'Laya.js';
import { Sprite } from 'laya/display/Sprite.js';
import {RigidBody} from 'laya/physics/RigidBody'
import {Physics} from 'laya/physics/Physics'

class phystate{
    dt=0;
    curtm=0;
    posx=0;
    posy=0;
    stx=0;
    sty=0;
    vx=0;
    vy=0;
}
/**
 * 检查文字渲染正确
 */
class Main {
    sp2state = new phystate();
    sp2:Sprite=null;
    sp1:Sprite=null;
	constructor() {
        Laya.init(800,600);
		Laya.stage.screenMode = 'none';
        this.test1();
    }

    async test1(){
        Physics.enable(); 
        var sp1 =this.sp1= new Sprite();
        sp1.graphics.drawRect(0,0,10,10,'red','green');
        sp1.pos(100,100);
        Laya.stage.addChild(sp1);

        sp1.addComponent(RigidBody);
        var rig = sp1.getComponent(RigidBody) as RigidBody;
        rig.setVelocity({x:4,y:-10});
        rig.gravityScale=1;

        var sp2 = this.sp2 = new Sprite();
        Laya.stage.addChild(sp2);
        sp2.graphics.drawRect(0,0,10,10,'green','red');
        sp2.frameLoop(1,this,this.sp2loop);
        sp2.pos(100,100);
        this.sp2state.stx=100;
        this.sp2state.sty=100;
        this.sp2state.vx=4;
        this.sp2state.vy=-10;


        await delay(10);  // 等待渲染结果
        (window as any).testEnd=true;   // 告诉测试程序可以停止了
    }

    sp2loop(){
        var sp2 = this.sp2;
        var vx=4;
        var vy=-10;
        var g = 500;
        var dt = 16.6667;
        this.sp2state.curtm+=dt;
        var ct = this.sp2state.curtm/1000;
        sp2.pos(this.sp2state.stx+vx*ct, 
            this.sp2state.sty+vy*ct+0.5*g*ct*ct);

            //if(ct>=10)debugger;
    }
}

//激活启动类
new Main();
