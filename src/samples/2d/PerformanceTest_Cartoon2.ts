import { Laya } from "Laya";
import { Animation } from "laya/display/Animation";
import { Sprite } from "laya/display/Sprite";
import { Text } from "laya/display/Text";
import { Stat } from "laya/utils/Stat";
import { Main } from "./../Main";
import { Image } from "laya/ui/Image";

export class PerformanceTest_Cartoon2 {
	private amount: number = 500;

	private character1: any[] = ["res/cartoon2/yd-6_01.png",
		"res/cartoon2/yd-6_02.png",
		"res/cartoon2/yd-6_03.png",
		"res/cartoon2/yd-6_04.png",
		"res/cartoon2/yd-6_05.png",
		"res/cartoon2/yd-6_06.png",
		"res/cartoon2/yd-6_07.png",
		"res/cartoon2/yd-6_08.png"];
	private character2: any[] = ["res/cartoon2/yd-3_01.png",
		"res/cartoon2/yd-3_02.png",
		"res/cartoon2/yd-3_03.png",
		"res/cartoon2/yd-3_04.png",
		"res/cartoon2/yd-3_05.png",
		"res/cartoon2/yd-3_06.png",
		"res/cartoon2/yd-3_07.png",
		"res/cartoon2/yd-3_08.png"];
	private character3: any[] = ["res/cartoon2/yd-2_01.png",
		"res/cartoon2/yd-2_02.png",
		"res/cartoon2/yd-2_03.png",
		"res/cartoon2/yd-2_04.png",
		"res/cartoon2/yd-2_05.png",
		"res/cartoon2/yd-2_06.png",
		"res/cartoon2/yd-2_07.png",
		"res/cartoon2/yd-2_08.png"];
	private character4: any[] = ["res/cartoon2/wyd-1_01.png",
		"res/cartoon2/wyd-1_02.png",
		"res/cartoon2/wyd-1_03.png",
		"res/cartoon2/wyd-1_04.png",
		"res/cartoon2/wyd-1_05.png",
		"res/cartoon2/wyd-1_06.png",
		"res/cartoon2/wyd-1_07.png",
		"res/cartoon2/wyd-1_08.png"];

	private characterSkins: any[] = [this.character1, this.character2, this.character3, this.character4];

	private characters: any[] = [];
	private text: Text;
	private image: Image;
	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;
		Laya.init(1280, 720).then(() => {
			Stat.enable();

			this.image = new Image();
			this.image.skin = "res/cartoon2/background.jpg";
			this.Main.box2D.addChild(this.image);

			this.createCharacters();

			this.text = new Text();
			this.text.zOrder = 10000;
			this.text.fontSize = 60;
			this.text.color = "#ff0000"
			this.Main.box2D.addChild(this.text);

			Laya.timer.frameLoop(1, this, this.gameLoop);
		});
	}

	private createCharacters(): void {
		var char: Character;
		var charSkin: any[];
		for (var i: number = 0; i < this.amount; i++) {
			charSkin = this.characterSkins[Math.floor(Math.random() * this.characterSkins.length)];
			char = new Character(charSkin);

			char.x = Math.random() * (Laya.stage.width + Character.WIDTH * 2);
			char.y = Math.random() * (Laya.stage.height - Character.HEIGHT);
			char.zOrder = char.y;

			char.setSpeed(Math.floor(Math.random() * 2 + 3));
			char.setName(i.toString());

			this.Main.box2D.addChild(char);
			this.characters.push(char);
		}
	}

	private gameLoop(): void {
		for (var i: number = this.characters.length - 1; i >= 0; i--) {
			this.characters[i].update();
		}
		if (Laya.timer.currFrame % 60 === 0) {
			this.text.text = Stat.FPS.toString();
		}
	}

	dispose(): void {
		Laya.timer.clear(this, this.gameLoop);
		this.image.dispose();
		this.image = null;
	}
}





class Character extends Sprite {
	static WIDTH: number = 110;
	static HEIGHT: number = 110;

	private speed: number = 5;

	private bloodBar: Sprite;
	private animation: Animation;
	private nameLabel: Text;

	constructor(images: any[]) {
		super();
		this.createAnimation(images);
		this.createBloodBar();
		this.createNameLabel();
	}

	private createAnimation(images: any[]): void {
		this.animation = new Animation();
		this.animation.loadImages(images);
		this.animation.interval = 70;
		this.animation.play(0);
		this.addChild(this.animation);
	}

	private createBloodBar(): void {
		this.bloodBar = new Sprite();
		this.bloodBar.loadImage("res/cartoon2/blood_1_r.png");
		this.bloodBar.x = 20;
		this.addChild(this.bloodBar);
	}

	private createNameLabel(): void {
		this.nameLabel = new Text();
		this.nameLabel.color = "#FFFFFF";
		this.nameLabel.text = "Default";
		this.nameLabel.fontSize = 13;
		this.nameLabel.width = Character.WIDTH;
		this.nameLabel.align = "center";
		this.addChild(this.nameLabel);
	}

	setSpeed(value: number): void {
		this.speed = value;
	}

	setName(value: string): void {
		this.nameLabel.text = value;
	}

	update(): void {
		this.x += this.speed;
		if (this.x >= Laya.stage.width + Character.WIDTH)
			this.x = -Character.WIDTH;
	}
}
