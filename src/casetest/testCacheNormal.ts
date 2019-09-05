import { delay, loadRes } from './delay.js'
import { Button } from 'laya/ui/Button.js';
import { List } from 'laya/ui/List.js';
import { View } from 'laya/ui/View.js';
import { ComboBox } from 'laya/ui/ComboBox.js';
import { Tab } from 'laya/ui/Tab.js';
import { Box } from 'laya/ui/Box.js';
import { CheckBox } from 'laya/ui/CheckBox.js';
import { RadioGroup } from 'laya/ui/RadioGroup.js';
import { Clip } from 'laya/ui/Clip.js';
import { Laya } from 'Laya.js';
import { getResPath } from './resPath.js';

var uiView: Object = {
    "type": "View",
    "child": [
        {
            "type": "List",
            "child": [
                {
                    "type": "Box",
                    "child": [
                        {
                            "props": {
                                "cacheAs": "normal",        //这里设置了normal
                                "text": "this is a list",
                                "x": 26,
                                "y": 5,
                                "width": 78,
                                "height": 20,
                                "fontSize": 14,
                                "name": "label"
                            },
                            "type": "Label"
                        }
                    ],
                    "props": {
                        "name": "render",
                        "x": 0,
                        "y": 0,
                        "width": 112,
                        "height": 30
                    }
                }
            ],
            "props": {
                "x": 452,
                "y": 68,
                "width": 128,
                "height": 60,
                "vScrollBarSkin": "comp/vscroll.png",
                "repeatX": 1,
                "var": "list"
            }
        }

    ],
    "props": {
        "width": 600,
        "height": 400
    }
};


class TestPageUI extends View {
    btn: Button;
    clip: Clip;
    combobox: ComboBox;
    tab: Tab;
    list: List;
    btn2: Button;
    check: CheckBox;
    radio: RadioGroup;
    box: Box;

    TestPageUI() { }
    createChildren(): void {
        super.createChildren();
        this.createView(uiView);
    }
}


class Main {
    constructor() {
        Laya.init(800, 600);
        //Laya.stage.scaleMode = 'fixedwidth';
        Laya.stage.screenMode = 'none';
        //Laya.Stat.show();
        this.test1();
    }

    /**
     */
    async test1() {
        await loadRes(getResPath('atlas/comp.atlas'));
        
        var Sprite = Sprite;
        var sp1 = new Sprite();
        sp1.pos(100, 100);
        //sp1.graphics.drawRect(0,0,100,100,'red');
        Laya.stage.addChild(sp1);
        sp1.graphics.clipRect(10, 10, 20, 20);
        //sp1.cacheAs='normal';

        var sp2 = new Sprite();
        //sp2.graphics.clipRect(10,10,20,20);
        sp2.pos(10, 10);
        sp2.graphics.drawRect(0, 0, 100, 100, 'green');
        //Laya.stage.addChild(sp2);
        sp2.cacheAs = 'normal';
        sp1.addChild(sp2);


        await delay(10);  // 等待渲染结果
        (window as any).testEnd = true;   // 告诉测试程序可以停止了
    }
}

//激活启动类
new Main();
