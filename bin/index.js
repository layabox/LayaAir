/**
 * 设置LayaNative屏幕方向，可设置以下值
 * landscape           横屏
 * portrait            竖屏
 * sensor_landscape    横屏(双方向)
 * sensor_portrait     竖屏(双方向)
 */
window.screenOrientation = "sensor_landscape";
loadLib("jsLibs/bullet.js")
loadLib("jsLibs/laya.Box2d.js")
loadLib("jsLibs/spine-core-3.8.js")
loadLib("3rd/astar.js")
// loadLib("3rd/webxr-polyfill.module.js")

loadLib("webgl/laya.js");
loadLib("webgl/bundle.js");
