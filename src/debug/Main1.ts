

import {Sprite} from '../core/laya/display/Sprite';

import {Laya} from "../core/Laya"
import { Text } from '../core/laya/display/Text';
import { Handler } from '../core/laya/utils/Handler';

Laya.init(1280,720);
Laya.stage.bgColor='gray';

function testDrawRect(){
    var sp = new Sprite();
    Laya.stage.addChild(sp);
    sp.graphics.drawRect(0,0,100,100,'red');
}
function drawText(){
    var t1 = new Text();
    t1.fontSize=30;
    t1.text='g';
    t1.color='red';
    t1.pos(100,100);
    Laya.stage.addChild(t1);
}

function onLoaded1(){
    var s1 = new Sprite();
    s1.graphics.drawTexture(Laya.loader.getRes('./res/monkey.png'),100,100);
    Laya.stage.addChild(s1);
}
function drawImg(){
    Laya.loader.load('./res/monkey.png', Handler.create(null, onLoaded1));
}

drawImg();