# LayaAir is an open-source HTML5 engine

It provides WebGL for rendering.
LayaAir Engine is designed for high performance games and support TypeScript, JavaScript programming language.
Develop once, publish for multi target platform

## LayaAir features

- High performance

Display render is set priority to WebGL mode.
LayaAir is design to be run without Plugin and on embedded system.

- Light weight and easy to use

LayaAir API architecture aim to be simple, easy to handle, concepted to require small size installation. It can run basic and complete need for HTML5 engine.

- Multi-language development support

Build your HTML5 application from ActionScript 3.0、TypeScript、JavaScript project.

- Complete feature

functionality for 2D, 3D, VR, Timeline animation controls, slow motion, UI system, particle animation, skeletal animation, physical systems, etc.

- Provide a visual assistance in the development and tool flow

[LayaAirIDE](http://ldc.layabox.com/index.php?m=content&c=index&a=lists&catid=27) offer code development tools and visual editor. Clear workflow make, ergonomic, designed development efficiency.

- Open-source and free

our official Layabox Github with complete engine source version, free of charge, including commercial usage.

## general features overview
- WebGL rendering
- Canvas rendering
- Vector renderer
- Atlas texture support
- Load Manager
- HTML text
- Bitmap fonts
- Mask
- Filter
- Animation timeline
- UI
- Particle system
- Bones animation
- Physical systems
- IDE viewer
- 3D (FBX Autodesk and Unity3D assets are supported)
- VR

## Beginner usage
#### JS version
```js
    Laya.init(550, 400);
    Laya.stage.scaleMode = "showall";

    var ape = new Laya.Sprite();
    //Loading our monkey
    ape.loadImage("res/apes/monkey2.png");

    Laya.stage.addChild(ape);
```

#### AS version
```as3
    package
    {
        import laya.display.Sprite;
        import laya.display.Stage;

        public class Sprite_DisplayImage
        {
            public function Sprite_DisplayImage()
            {
                Laya.init(550, 400);
      		    Laya.stage.scaleMode = "showall";

                var ape:Sprite = new Sprite();
                //Loading our monkey
                ape.loadImage("res/apes/monkey2.png");

                Laya.stage.addChild(ape);
            }
        }
    }
```

#### TS version
```ts
    /// <reference path="../../libs/LayaAir.d.ts" />
    class Sprite_DisplayImage{

        constructor(){
            Laya.init(550, 400);
            Laya.stage.scaleMode = "showall";

            var ape = new Laya.Sprite();
            //Loading our monkey
            ape.loadImage("res/apes/monkey2.png");

            Laya.stage.addChild(ape);
        }
    }
    new Sprite_DisplayImage();
```

## Samples Demo

- http://layaair.ldc.layabox.com/demo/
- http://layabox.github.io/layaair-examples/

## Games Demo

- http://game.layabox.com/265 (2D)
- http://layaair.ldc.layabox.com/test/ZhanPaiKeJi/ (3D)

## API Help

http://layaair.ldc.layabox.com/api/

## Documentation Tutorial

- http://ldc.layabox.com/index.php?m=content&c=index&a=show&catid=8&id=10
- https://github.com/layabox/layaair/wiki

## Developer Center

http://ldc.layabox.com/

## Community

http://ask.layabox.com/

## QQ Group

104144216

## Folder structure
TODO
- bin [Compiled librairy，divided for as，js，ts]
- samples [Example project]
- src [Source Code Library]
- utils [Automated compilation and other tools]


