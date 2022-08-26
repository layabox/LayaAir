/**
 * 设置LayaNative屏幕方向，可设置以下值
 * landscape           横屏
 * portrait            竖屏
 * sensor_landscape    横屏(双方向)
 * sensor_portrait     竖屏(双方向)
 */
window.screenOrientation = "sensor_landscape";
loadLib("spine-core-3.8.js")
loadLib("box2d.js")
loadLib("cannon.js")
//-----libs-begin-----
loadLib("astar.js")
loadLib("laya.physics3D.js")
//-----libs-end-------
loadLib("rollUp/bundle.js");
