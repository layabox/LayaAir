
import { Laya } from "Laya" 
import { Button } from "laya/ui/Button";
import { Handler } from "laya/utils/Handler";
import { Event } from "laya/events/Event";
import { CheckBox } from "laya/ui/CheckBox";



Laya.init(1280,720);
Laya.stage.bgColor='gray';

Laya.loader.load("res/atlas/comp.atlas", Handler.create(null,onLoaded));

function drawButton(){
    var bt = new Button();
    bt.width = 100;
    bt.height = 50;
    Laya.stage.addChild(bt);
    bt.pos(100, 100);
    bt.label = '打开文件'
    bt.labelSize = 20;
    bt.skin = "comp/button.png";
    bt.on(Event.CLICK, this, function(){
        console.log('kk');
    })
}

function drawCheckbox(){
    var c = new CheckBox();
    c.label='check1';
    c.skin = 'comp/checkbox.png';
    Laya.stage.addChild(c);
    c.pos(100,100);
}

function onLoaded(){
    //drawButton();
    drawCheckbox();
}

