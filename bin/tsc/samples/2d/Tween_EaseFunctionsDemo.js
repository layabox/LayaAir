import { Laya } from "Laya";
import { Input } from "laya/display/Input";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Text } from "laya/display/Text";
import { Event } from "laya/events/Event";
import { List } from "laya/ui/List";
import { Ease } from "laya/utils/Ease";
import { Handler } from "laya/utils/Handler";
import { Tween } from "laya/utils/Tween";
export class Tween_EaseFunctionsDemo {
    constructor(maincls) {
        this.duration = 2000;
        this.Main = null;
        this.Main = maincls;
        // 不支持WebGL时自动切换至Canvas
        //			Laya.init(550, 400, WebGL);
        //
        Laya.stage.alignV = Stage.ALIGN_MIDDLE;
        Laya.stage.alignH = Stage.ALIGN_CENTER;
        //
        //			Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
        Laya.stage.bgColor = "#232628";
        this.setup();
    }
    setup() {
        this.createCharacter();
        this.createEaseFunctionList();
        this.createDurationCrontroller();
    }
    createCharacter() {
        this.character = new Sprite();
        this.character.loadImage("res/cartoonCharacters/1.png");
        this.character.pos(100, 50);
        this.Main.box2D.addChild(this.character);
    }
    createEaseFunctionList() {
        var easeFunctionsList = new List();
        easeFunctionsList.itemRender = ListItemRender;
        easeFunctionsList.pos(5, 5);
        easeFunctionsList.repeatX = 1;
        easeFunctionsList.repeatY = 20;
        easeFunctionsList.vScrollBarSkin = '';
        easeFunctionsList.selectEnable = true;
        easeFunctionsList.selectHandler = new Handler(this, this.onEaseFunctionChange, [easeFunctionsList]);
        easeFunctionsList.renderHandler = new Handler(this, this.renderList);
        this.Main.box2D.addChild(easeFunctionsList);
        var data = [];
        data.push('backIn', 'backOut', 'backInOut');
        data.push('bounceIn', 'bounceOut', 'bounceInOut');
        data.push('circIn', 'circOut', 'circInOut');
        data.push('cubicIn', 'cubicOut', 'cubicInOut');
        data.push('elasticIn', 'elasticOut', 'elasticInOut');
        data.push('expoIn', 'expoOut', 'expoInOut');
        data.push('linearIn', 'linearOut', 'linearInOut');
        data.push('linearNone');
        data.push('QuadIn', 'QuadOut', 'QuadInOut');
        data.push('quartIn', 'quartOut', 'quartInOut');
        data.push('quintIn', 'quintOut', 'quintInOut');
        data.push('sineIn', 'sineOut', 'sineInOut');
        data.push('strongIn', 'strongOut', 'strongInOut');
        easeFunctionsList.array = data;
    }
    renderList(item, e = null) {
        item.setLabel(item.dataSource);
    }
    onEaseFunctionChange(list, e = null) {
        this.character.pos(100, 50);
        this.tween && this.tween.clear();
        this.tween = Tween.to(this.character, { x: 350, y: 250 }, this.duration, Ease[list.selectedItem]);
    }
    createDurationCrontroller() {
        var durationInput = this.createInputWidthLabel("Duration:", '2000', 400, 10);
        durationInput.on(Event.INPUT, this, function () {
            this.duration = parseInt(durationInput.text);
        });
    }
    createInputWidthLabel(label, prompt, x, y) {
        var text = new Text();
        text.text = label;
        text.color = "white";
        this.Main.box2D.addChild(text);
        text.pos(x, y);
        var input = new Input();
        input.size(50, 20);
        input.text = prompt;
        input.align = 'center';
        this.Main.box2D.addChild(input);
        input.color = "#FFFFFF";
        input.borderColor = "#FFFFFF";
        input.pos(text.x + text.width + 10, text.y - 3);
        return input;
    }
    dispose() {
        if (this.tween) {
            this.tween.clear();
        }
    }
}
import { Box } from "laya/ui/Box";
import { Label } from "laya/ui/Label";
class ListItemRender extends Box {
    constructor() {
        super();
        this.size(100, 20);
        this.label = new Label();
        this.label.fontSize = 12;
        this.label.color = "#FFFFFF";
        this.addChild(this.label);
    }
    setLabel(value) {
        this.label.text = value;
    }
}
