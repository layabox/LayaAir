/**
 * @en The `Ease` class defines easing functions for Tween animations to achieve various transition effects.
 * @zh `Ease` 类定义了缓动函数，用于实现 Tween 动画的缓动效果，以便于创建各种转换效果。
 */
export var Ease = {
    /**
     * @en Define continuous motion without acceleration.
     * @zh 定义无加速持续运动。
     */
    linear,

    /**
     * @deprecated Use linear instead
     */
    linearNone: linear,

    /**
     * @en Define continuous motion without acceleration.
     * @zh 定义无加速持续运动。
     */
    linearIn,

    /**
     * @en Define continuous motion without acceleration.
     * @zh 定义无加速持续运动。
     */
    linearInOut,

    /**
     * @en Define continuous motion without acceleration.
     * @zh 定义无加速持续运动。
     */
    linearOut,

    /**
     * @en Starts the motion with zero velocity, then accelerates the motion.
     * The motion is similar to a ball falling towards the floor and bouncing back with decreasing rebounds.
     * @zh 方法以零速率开始运动，然后在执行时加快运动速度。
     * 它的运动是类似一个球落向地板又弹起后，几次逐渐减小的回弹运动。
     */
    bounceIn,

    /**
     * @en Starts the motion with zero velocity, accelerates, and then decelerates to zero velocity.
     * The motion is similar to a ball falling towards the floor and bouncing back with decreasing rebounds.
     * @zh 开始运动时速率为零，先对运动进行加速，再减速直到速率为零。
     * 它的运动是类似一个球落向地板又弹起后，几次逐渐减小的回弹运动。
     */
    bounceInOut,

    /**
     * @en Begins the motion at a faster velocity, then decelerates until the velocity is zero.
     * The motion is similar to a ball falling towards the floor and bouncing back with decreasing rebounds.
     * @zh 以较快速度开始运动，然后在执行时减慢运动速度，直至速率为零。
     * 它的运动是类似一个球落向地板又弹起后，几次逐渐减小的回弹运动。
     */
    bounceOut,

    /**
     * @en Starts the motion with a backward movement, then moves towards the target in the opposite direction, overshoots, and then returns.
     * @zh 开始时往后运动，然后反向朝目标移动。
     */
    backIn,

    /**
     * @en Starts the motion with a backward movement, then moves towards the target, overshoots slightly, reverses direction again, and finally moves towards the target.
     * @zh 开始运动时是向后跟踪，再倒转方向并朝目标移动，稍微过冲目标，然后再次倒转方向，回来朝目标移动。
     */
    backInOut,

    /**
     * @en Starts the motion towards the target, overshoots slightly, then reverses direction and moves back towards the target.
     * @zh 开始运动时是朝目标移动，稍微过冲，再倒转方向回来朝着目标。
     */
    backOut,

    /**
     * @en Starts the motion from zero velocity, then accelerates. 
     * The motion is defined by a sine wave that elastically decays in an exponential manner.
     * @zh 方法以零速率开始运动，然后在执行时加快运动速度。
     * 其中的运动由按照指数方式衰减的正弦波来定义。
     */
    elasticIn,

    /**
     * @en Starts the motion with zero velocity, accelerates, and then decelerates to zero velocity. 
     * The motion is defined by a sine wave that elastically decays in an exponential manner.
     * @zh 开始运动时速率为零，先对运动进行加速，再减速直到速率为零。
     * 其中的运动由按照指数方式衰减的正弦波来定义。
     */
    elasticInOut,

    /**
     * @en Starts the motion at a faster velocity, then decelerates until the velocity reaches zero. 
     * The motion is defined by a sine wave that decays in an exponential manner.
     * @zh 以较快速度开始运动，然后在执行时减慢运动速度，直至速率为零。
     * 其中的运动由按照指数方式衰减的正弦波来定义。
     */
    elasticOut,

    /**
     * @en Starts the motion from zero velocity and then accelerates rapidly.
     * @zh 以零速率开始运动，然后在执行时加快运动速度。
     */
    strongIn,

    /**
     * @en At the beginning of the motion, the velocity is zero. Accelerate the motion first, then decelerate until the velocity is zero.
     * @zh 开始运动时速率为零，先对运动进行加速，再减速直到速率为零。
     */
    strongInOut,

    /**
     * @en Start moving at a faster speed, then slow down the motion speed during execution until the speed reaches zero.
     * @zh 以较快速度开始运动，然后在执行时减慢运动速度，直至速率为零。
     */
    strongOut,

    /**
     * @en Starts the motion with zero velocity, accelerates the motion, and then decelerates to zero velocity.
     * The motion acceleration in the Sine slow motion equation is smaller than that in the Quad equation.
     * @zh 开始运动时速率为零，先对运动进行加速，再减速直到速率为零。
     * Sine 缓动方程中的运动加速度小于 Quad 方程中的运动加速度。
     */
    sineInOut,

    /**
     * @en Starts the motion from zero velocity, then accelerates the motion.
     * The motion acceleration in the Sine slow motion equation is smaller than that in the Quad equation.
     * @zh 以零速率开始运动，然后在执行时加快运动速度。
     * Sine 缓动方程中的运动加速度小于 Quad 方程中的运动加速度。
     */
    sineIn,

    /**
     * @en Starts the motion at a faster pace, then decelerates until the velocity reaches zero.
     * The motion acceleration in the Sine slow motion equation is smaller than that in the Quad equation.
     * @zh 以较快速度开始运动，然后在执行时减慢运动速度，直至速率为零。
     * Sine 缓动方程中的运动加速度小于 Quad 方程中的运动加速度。
     */
    sineOut,

    /**
     * @en Start moving at zero speed and then accelerate the motion speed during execution.
     * The motion acceleration of the Quint slow motion equation is greater than that of the Quart slow motion equation.
     * @zh 以零速率开始运动，然后在执行时加快运动速度。
     * Quint 缓动方程的运动加速大于 Quart 缓动方程。
     */
    quintIn,

    /**
     * @en At the beginning of the motion, the velocity is zero. Accelerate the motion first, then decelerate until the velocity is zero.
     * The motion acceleration of the Quint slow motion equation is greater than that of the Quart slow motion equation.
     * @zh 开始运动时速率为零，先对运动进行加速，再减速直到速率为零。
     * Quint 缓动方程的运动加速大于 Quart 缓动方程。
     */
    quintInOut,

    /**
     * @en Start moving at a faster speed, then slow down the motion speed during execution until the speed reaches zero.
     * The motion acceleration of the Quint slow motion equation is greater than that of the Quart slow motion equation.
     * @zh 以较快速度开始运动，然后在执行时减慢运动速度，直至速率为零。
     * Quint 缓动方程的运动加速大于 Quart 缓动方程。
     */
    quintOut,

    /**
     * @en The method starts at zero speed and then accelerates the motion speed during execution.
     * The motion acceleration of the Quart slow motion equation is greater than that of the Cubic slow motion equation.
     * @zh 方法以零速率开始运动，然后在执行时加快运动速度。
     * Quart 缓动方程的运动加速大于 Cubic 缓动方程。
     */
    quartIn,

    /**
     * @en At the beginning of the motion, the velocity is zero. Accelerate the motion first, then decelerate until the velocity is zero.
     * The motion acceleration of the Quart slow motion equation is greater than that of the Cubic slow motion equation.
     * @zh 开始运动时速率为零，先对运动进行加速，再减速直到速率为零。
     * Quart 缓动方程的运动加速大于 Cubic 缓动方程。
     */
    quartInOut,

    /**
     * @en Start moving at a faster speed, then slow down the motion speed during execution until the speed reaches zero.
     * The motion acceleration of the Quart slow motion equation is greater than that of the Cubic slow motion equation.
     * @zh 以较快速度开始运动，然后在执行时减慢运动速度，直至速率为零。
     * Quart 缓动方程的运动加速大于 Cubic 缓动方程。
     */
    quartOut,

    /**
     * @en The method starts at zero speed and then accelerates the motion speed during execution.
     * The motion acceleration of the Quart slow motion equation is greater than that of the Cubic slow motion equation.
     * @zh 方法以零速率开始运动，然后在执行时加快运动速度。
     * Cubic 缓动方程的运动加速大于 Quad 缓动方程。
     */
    cubicIn,

    /**
     * @en At the beginning of the motion, the velocity is zero. Accelerate the motion first, then decelerate until the velocity is zero.
     * The motion acceleration of the Quart slow motion equation is greater than that of the Cubic slow motion equation.
     * @zh 开始运动时速率为零，先对运动进行加速，再减速直到速率为零。
     * Cubic 缓动方程的运动加速大于 Quad 缓动方程。
     */
    cubicInOut,

    /**
     * @en Start moving at a faster speed, then slow down the motion speed during execution until the speed reaches zero.
     * The motion acceleration of the Quart slow motion equation is greater than that of the Cubic slow motion equation.
     * @zh 以较快速度开始运动，然后在执行时减慢运动速度，直至速率为零。
     * Cubic 缓动方程的运动加速大于 Quad 缓动方程。
     */
    cubicOut,

    /**
     * @en The method starts at zero speed and then accelerates the motion speed during execution.
     * The motion acceleration in the Quad deceleration equation is equal to the motion acceleration between the 100% deceleration time axis and is significantly smaller than the motion acceleration in the Cubic deceleration equation.
     * @zh 方法以零速率开始运动，然后在执行时加快运动速度。
     * Quad 缓动方程中的运动加速度等于 100% 缓动的时间轴补间的运动加速度，并且显著小于 Cubic 缓动方程中的运动加速度。
     */
    quadIn,

    /**
     * @en Starts the motion with zero velocity, accelerates the motion, and then decelerates to zero velocity. 
     * The motion acceleration in the Quad deceleration equation is equal to the motion acceleration between the 100% deceleration time axis and is significantly smaller than the motion acceleration in the Cubic deceleration equation.
     * @zh 开始运动时速率为零，先对运动进行加速，再减速直到速率为零。
     * Quad 缓动方程中的运动加速度等于 100% 缓动的时间轴补间的运动加速度，并且显著小于 Cubic 缓动方程中的运动加速度。
     */
    quadInOut,

    /**
     * @en Start moving at a faster speed, then slow down the motion speed during execution until the speed reaches zero.
     * The motion acceleration in the Quad deceleration equation is equal to the motion acceleration between the 100% deceleration time axis and is significantly smaller than the motion acceleration in the Cubic deceleration equation.
     * @zh 以较快速度开始运动，然后在执行时减慢运动速度，直至速率为零。
     * Quad 缓动方程中的运动加速度等于 100% 缓动的时间轴补间的运动加速度，并且显著小于 Cubic 缓动方程中的运动加速度。
     */
    quadOut,

    /**
     * @en Starts the motion with zero velocity, then accelerates the motion.
     * Each time interval is the remaining distance minus a fixed proportion.
     * @zh 方法以零速率开始运动，然后在执行时加快运动速度。
     * 其中每个时间间隔是剩余距离减去一个固定比例部分。
     */
    expoIn,

    /**
     * @en At the beginning of the motion, the velocity is zero. Accelerate the motion first, then decelerate until the velocity is zero.
     * Each time interval is the remaining distance minus a fixed proportion.
     * @zh 开始运动时速率为零，先对运动进行加速，再减速直到速率为零。
     * 其中每个时间间隔是剩余距离减去一个固定比例部分。
     */
    expoInOut,

    /**
     * @en Start moving at a faster speed, then slow down the motion speed during execution until the speed reaches zero.
     * Each time interval is the remaining distance minus a fixed proportion.
     * @zh 以较快速度开始运动，然后在执行时减慢运动速度，直至速率为零。
     * 其中每个时间间隔是剩余距离减去一个固定比例部分。
     */
    expoOut,

    /**
     * @en The method starts at zero speed and then accelerates the motion speed during execution.
     * The acceleration of the slow motion equation will result in a sudden change in velocity.
     * @zh 方法以零速率开始运动，然后在执行时加快运动速度。
     * 缓动方程的运动加速会产生突然的速率变化。
     */
    circIn,

    /**
     * @en At the beginning of the motion, the velocity is zero. Accelerate the motion first, then decelerate until the velocity is zero.
     * The acceleration of the slow motion equation will result in a sudden change in velocity.
     * @zh 开始运动时速率为零，先对运动进行加速，再减速直到速率为零。
     * 缓动方程的运动加速会产生突然的速率变化。
     */
    circInOut,

    /**
     * @en Start moving at a faster speed, then slow down the motion speed during execution until the speed reaches zero.
     * The acceleration of the slow motion equation will result in a sudden change in velocity.
     * @zh 以较快速度开始运动，然后在执行时减慢运动速度，直至速率为零。
     * 缓动方程的运动加速会产生突然的速率变化。
     */
    circOut,
};

const HALF_PI = Math.PI * 0.5;
const PI2 = Math.PI * 2;

function linear(t: number, b: number, c: number, d: number): number {
    return c * t / d + b;
}

function linearIn(t: number, b: number, c: number, d: number): number {
    return c * t / d + b;
}

function linearInOut(t: number, b: number, c: number, d: number): number {
    return c * t / d + b;
}

function linearOut(t: number, b: number, c: number, d: number): number {
    return c * t / d + b;
}

function bounceIn(t: number, b: number, c: number, d: number): number {
    return c - Ease.bounceOut(d - t, 0, c, d) + b;
}

function bounceInOut(t: number, b: number, c: number, d: number): number {
    if (t < d * 0.5) return Ease.bounceIn(t * 2, 0, c, d) * .5 + b;
    else return Ease.bounceOut(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
}

function bounceOut(t: number, b: number, c: number, d: number): number {
    if ((t /= d) < (1 / 2.75)) return c * (7.5625 * t * t) + b;
    else if (t < (2 / 2.75)) return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
    else if (t < (2.5 / 2.75)) return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
    else return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
}

function backIn(t: number, b: number, c: number, d: number, s: number = 1.70158): number {
    return c * (t /= d) * t * ((s + 1) * t - s) + b;
}

function backInOut(t: number, b: number, c: number, d: number, s: number = 1.70158): number {
    if ((t /= d * 0.5) < 1) return c * 0.5 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
    return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
}

function backOut(t: number, b: number, c: number, d: number, s: number = 1.70158): number {
    return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
}

function elasticIn(t: number, b: number, c: number, d: number, a: number = 0, p: number = 0): number {
    var s: number;
    if (t == 0) return b;
    if ((t /= d) == 1) return b + c;
    if (!p) p = d * .3;
    if (!a || (c > 0 && a < c) || (c < 0 && a < -c)) {
        a = c;
        s = p / 4;
    } else s = p / PI2 * Math.asin(c / a);
    return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * PI2 / p)) + b;
}

function elasticInOut(t: number, b: number, c: number, d: number, a: number = 0, p: number = 0): number {

    var s: number;
    if (t == 0) return b;
    if ((t /= d * 0.5) == 2) return b + c;
    if (!p) p = d * (.3 * 1.5);
    if (!a || (c > 0 && a < c) || (c < 0 && a < -c)) {
        a = c;
        s = p / 4;
    } else s = p / PI2 * Math.asin(c / a);
    if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * PI2 / p)) + b;
    return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * PI2 / p) * .5 + c + b;
}

function elasticOut(t: number, b: number, c: number, d: number, a: number = 0, p: number = 0): number {

    var s: number;
    if (t == 0) return b;
    if ((t /= d) == 1) return b + c;
    if (!p) p = d * .3;
    if (!a || (c > 0 && a < c) || (c < 0 && a < -c)) {
        a = c;
        s = p / 4;
    } else s = p / PI2 * Math.asin(c / a);
    return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * PI2 / p) + c + b);
}

function strongIn(t: number, b: number, c: number, d: number): number {
    return c * (t /= d) * t * t * t * t + b;
}

function strongInOut(t: number, b: number, c: number, d: number): number {
    if ((t /= d * 0.5) < 1) return c * 0.5 * t * t * t * t * t + b;
    return c * 0.5 * ((t -= 2) * t * t * t * t + 2) + b;
}

function strongOut(t: number, b: number, c: number, d: number): number {
    return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
}

function sineInOut(t: number, b: number, c: number, d: number): number {
    return -c * 0.5 * (Math.cos(Math.PI * t / d) - 1) + b;
}

function sineIn(t: number, b: number, c: number, d: number): number {
    return -c * Math.cos(t / d * HALF_PI) + c + b;
}

function sineOut(t: number, b: number, c: number, d: number): number {
    return c * Math.sin(t / d * HALF_PI) + b;
}

function quintIn(t: number, b: number, c: number, d: number): number {
    return c * (t /= d) * t * t * t * t + b;
}

function quintInOut(t: number, b: number, c: number, d: number): number {
    if ((t /= d * 0.5) < 1) return c * 0.5 * t * t * t * t * t + b;
    return c * 0.5 * ((t -= 2) * t * t * t * t + 2) + b;
}

function quintOut(t: number, b: number, c: number, d: number): number {
    return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
}

function quartIn(t: number, b: number, c: number, d: number): number {
    return c * (t /= d) * t * t * t + b;
}

function quartInOut(t: number, b: number, c: number, d: number): number {
    if ((t /= d * 0.5) < 1) return c * 0.5 * t * t * t * t + b;
    return -c * 0.5 * ((t -= 2) * t * t * t - 2) + b;
}

function quartOut(t: number, b: number, c: number, d: number): number {
    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
}

function cubicIn(t: number, b: number, c: number, d: number): number {
    return c * (t /= d) * t * t + b;
}

function cubicInOut(t: number, b: number, c: number, d: number): number {
    if ((t /= d * 0.5) < 1) return c * 0.5 * t * t * t + b;
    return c * 0.5 * ((t -= 2) * t * t + 2) + b;
}

function cubicOut(t: number, b: number, c: number, d: number): number {
    return c * ((t = t / d - 1) * t * t + 1) + b;
}

function quadIn(t: number, b: number, c: number, d: number): number {
    return c * (t /= d) * t + b;
}

function quadInOut(t: number, b: number, c: number, d: number): number {
    if ((t /= d * 0.5) < 1) return c * 0.5 * t * t + b;
    return -c * 0.5 * ((--t) * (t - 2) - 1) + b;
}

function quadOut(t: number, b: number, c: number, d: number): number {
    return -c * (t /= d) * (t - 2) + b;
}

function expoIn(t: number, b: number, c: number, d: number): number {
    return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b - c * 0.001;
}

function expoInOut(t: number, b: number, c: number, d: number): number {
    if (t == 0) return b;
    if (t == d) return b + c;
    if ((t /= d * 0.5) < 1) return c * 0.5 * Math.pow(2, 10 * (t - 1)) + b;
    return c * 0.5 * (-Math.pow(2, -10 * --t) + 2) + b;
}

function expoOut(t: number, b: number, c: number, d: number): number {
    return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
}

function circIn(t: number, b: number, c: number, d: number): number {
    return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
}

function circInOut(t: number, b: number, c: number, d: number): number {
    if ((t /= d * 0.5) < 1) return -c * 0.5 * (Math.sqrt(1 - t * t) - 1) + b;
    return c * 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
}

function circOut(t: number, b: number, c: number, d: number): number {
    return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
}