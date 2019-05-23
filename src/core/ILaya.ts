import { WorkerLoader  } from "../../bin/core/laya/net/WorkerLoader";
import { Dragging } from "./laya/utils/Dragging";
import { GraphicsBounds } from "./laya/display/GraphicsBounds";
import { Sprite } from "./laya/display/Sprite";
import { TextRender } from "./laya/webgl/text/TextRender";
import { Timer } from "./laya/utils/Timer";
import { Loader } from "./laya/net/Loader";
import { TTFLoader } from "./laya/net/TTFLoader";
import { SoundManager } from "./laya/media/SoundManager";
import { WebAudioSound } from "./laya/media/webaudio/WebAudioSound";
import { ShaderCompile } from "./laya/webgl/utils/ShaderCompile";
import { TextAtlas } from "./laya/webgl/text/TextAtlas";
import { ClassUtils } from "./laya/utils/ClassUtils";

/**
 * 使用全局类的时候，避免引用其他模块
 */
 export class ILaya{
     static Timer:typeof Timer = null;
     static WorkerLoader:typeof WorkerLoader=null;
     static Dragging:typeof Dragging =null;
     static GraphicsBounds:typeof GraphicsBounds =null;
     static Sprite:typeof Sprite = null;
     static TextRender:typeof TextRender = null;
     static TextAtlas:typeof TextAtlas = null;
     static systemTimer:Timer=null;
     static Loader:typeof Loader=null;
     static TTFLoader:typeof TTFLoader = null;
     static SoundManager:typeof SoundManager=null;
     static WebAudioSound:typeof WebAudioSound=null;
     static ShaderCompile: typeof ShaderCompile=null;
     static ClassUtils:typeof ClassUtils=null;
 }
 