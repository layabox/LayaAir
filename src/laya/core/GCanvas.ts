import { HTMLCanvas } from "./laya/resource/HTMLCanvas";
import { Context } from "./laya/resource/Context";

/**
 * 全局canvas对象
 * 为了解除互相引用而加
 * 
 */

 /**@private */
 export class GCanvas{
     static MainCanvas:HTMLCanvas=null;
     static MainCtx:Context=null;
     static canvas:HTMLCanvas=null;
     static context:Context=null;
 }