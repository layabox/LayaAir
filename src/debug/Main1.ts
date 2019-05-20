

import {Sprite} from '../core/laya/display/Sprite';
import { Stage } from '../core/laya/display/Stage';

import {Laya} from "../core/Laya"

Laya.init(1280,720);

var sp = new Sprite();
Laya.stage.addChild(sp);
sp.graphics.drawRect(0,0,100,100,'red');
