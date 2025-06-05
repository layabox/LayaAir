/**
 * @description
 * 性能测试：模拟大量文本渲染的Laya引擎示例
 */
import { Laya } from "Laya";
import { Text } from "laya/display/Text";
import { Rectangle } from "laya/maths/Rectangle";
import { Browser } from "laya/utils/Browser";
import { Stat } from "laya/utils/Stat";
import { Main } from "./../Main";
import { PseudoRandom } from "../3d/common/PseudoRandom";

export class PerformanceTest_Text {
    private padding: number = 100;
    private textAmount: number = 3000; // 文本数量
    private seed: number = 1; // 固定种子值

    private texts: any[] = [];
    private wrapBounds: Rectangle;
    private random: PseudoRandom;

    Main: typeof Main = null;
    constructor(maincls: typeof Main) {
        this.Main = maincls;
        this.random = new PseudoRandom(this.seed);

        Laya.init(Browser.width, Browser.height).then(() => {
            Laya.stage.bgColor = "#000001";
            Stat.show(0, 0);

            this.wrapBounds = new Rectangle(-this.padding, -this.padding, Laya.stage.width + this.padding * 2, Laya.stage.height + this.padding * 2);

            this.initTexts();
            Laya.timer.frameLoop(1, this, this.animate);
        });
    }

    private textContainer: Text;

    private initTexts(): void {
        this.textContainer = this.createNewContainer();
        for (var i: number = 0; i < this.textAmount; i++) {
            var text: MovingText = this.newText();
            this.textContainer.addChild(text);
            this.texts.push(text);
        }
    }

    private createNewContainer(): Text {
        var container: Text = new Text();
        container.size(Laya.stage.width, Laya.stage.height);
        this.Main.box2D.addChild(container);
        return container;
    }

    private newText(): MovingText {
        var text: MovingText = new MovingText();
        
        // 使用种子随机数生成器生成较小的随机数
        var randomNum: number = this.random.int(1000); // 生成0-99之间的数字
        text.text = randomNum.toString();
        text.singleCharRender = true;
        text.fontSize = this.random.intRange(12, 28);
        text.color = this.getRandomColor();
        
        text.x = this.random.range(0, Laya.stage.width);
        text.y = this.random.range(0, Laya.stage.height);
        text.alpha = this.random.range(0.5, 1.0);

        // 随机速度
        text.vx = this.random.range(-2, 2);
        text.vy = this.random.range(-2, 2);
        text.rotationSpeed = this.random.range(-2.5, 2.5);

        return text;
    }

    private getRandomColor(): string {
        var r: number = this.random.intRange(0, 255);
        var g: number = this.random.intRange(0, 255);
        var b: number = this.random.intRange(0, 255);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    private animate(): void {
        var text: MovingText;
        var wb: Rectangle = this.wrapBounds;
        
        for (var i: number = 0; i < this.textAmount; i++) {
            text = this.texts[i];
            
            // 更新位置
            text.x += text.vx;
            text.y += text.vy;
            text.rotation += text.rotationSpeed;

            // 边界检查
            if (text.x < wb.x) {
                text.x = wb.x;
                text.vx = -text.vx;
            } else if (text.x > wb.x + wb.width) {
                text.x = wb.x + wb.width;
                text.vx = -text.vx;
            }
            if (text.y < wb.y) {
                text.y = wb.y;
                text.vy = -text.vy;
            } else if (text.y > wb.y + wb.height) {
                text.y = wb.y + wb.height;
                text.vy = -text.vy;
            }
        }
    }

    dispose(): void {
        Laya.timer.clear(this, this.animate);
    }
}

class MovingText extends Text {
    vx: number;
    vy: number;
    rotationSpeed: number;
} 
