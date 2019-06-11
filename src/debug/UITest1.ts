
import { Laya } from "Laya" 
import { Button } from "laya/ui/Button";
import { Handler } from "laya/utils/Handler";
import { Event } from "laya/events/Event";
import { CheckBox } from "laya/ui/CheckBox";
import { List } from "laya/ui/List";
import { Box } from "laya/ui/Box";
import { Label } from "laya/ui/Label";



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

class Item extends Box{
    constructor(){
        super();
        this.graphics.drawRect(0,0,100,20,null, 'red');
        var l = new Label();
        l.text = '100000';
        l.name='lable';
        l.size(100,20);
        this.addChild(l);
    }
}

function drawList(){
    let arr:Object[]=[];
    for(var i=0; i<20; i++){
        arr.push({label:'item'+i});
    }
    var list = new List();
    list.itemRender = Item;
    list.repeatX=1;
    list.repeatY=10;
    list.vScrollBarSkin='comp/vscroll.png';
    list.array = arr;
    list.pos(100,100);
    list.selectEnable=true;
    list.selectHandler = new Handler(null,(index:number)=>{

    });
    Laya.stage.addChild(list);
}

function onLoaded(){
    //drawButton();
    //drawCheckbox();
    drawList();
}

