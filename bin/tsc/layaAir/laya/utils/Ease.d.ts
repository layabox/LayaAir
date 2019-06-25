/**
     * <code>Ease</code> 类定义了缓动函数，以便实现 <code>Tween</code> 动画的缓动效果。
     */
export declare class Ease {
    /**@private */
    private static HALF_PI;
    /**@private */
    private static PI2;
    /**
     * 定义无加速持续运动。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static linearNone(t: number, b: number, c: number, d: number): number;
    /**
     * 定义无加速持续运动。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static linearIn(t: number, b: number, c: number, d: number): number;
    /**
     * 定义无加速持续运动。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static linearInOut(t: number, b: number, c: number, d: number): number;
    /**
     * 定义无加速持续运动。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static linearOut(t: number, b: number, c: number, d: number): number;
    /**
     * 方法以零速率开始运动，然后在执行时加快运动速度。
     * 它的运动是类似一个球落向地板又弹起后，几次逐渐减小的回弹运动。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static bounceIn(t: number, b: number, c: number, d: number): number;
    /**
     * 开始运动时速率为零，先对运动进行加速，再减速直到速率为零。
     * 它的运动是类似一个球落向地板又弹起后，几次逐渐减小的回弹运动。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static bounceInOut(t: number, b: number, c: number, d: number): number;
    /**
     * 以较快速度开始运动，然后在执行时减慢运动速度，直至速率为零。
     * 它的运动是类似一个球落向地板又弹起后，几次逐渐减小的回弹运动。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static bounceOut(t: number, b: number, c: number, d: number): number;
    /**
     * 开始时往后运动，然后反向朝目标移动。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @param	s 指定过冲量，此处数值越大，过冲越大。
     * @return 指定时间的插补属性的值。
     */
    static backIn(t: number, b: number, c: number, d: number, s?: number): number;
    /**
     * 开始运动时是向后跟踪，再倒转方向并朝目标移动，稍微过冲目标，然后再次倒转方向，回来朝目标移动。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @param	s 指定过冲量，此处数值越大，过冲越大。
     * @return 指定时间的插补属性的值。
     */
    static backInOut(t: number, b: number, c: number, d: number, s?: number): number;
    /**
     * 开始运动时是朝目标移动，稍微过冲，再倒转方向回来朝着目标。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @param	s 指定过冲量，此处数值越大，过冲越大。
     * @return 指定时间的插补属性的值。
     */
    static backOut(t: number, b: number, c: number, d: number, s?: number): number;
    /**
     * 方法以零速率开始运动，然后在执行时加快运动速度。
     * 其中的运动由按照指数方式衰减的正弦波来定义。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @param	a 指定正弦波的幅度。
     * @param	p 指定正弦波的周期。
     * @return 指定时间的插补属性的值。
     */
    static elasticIn(t: number, b: number, c: number, d: number, a?: number, p?: number): number;
    /**
     * 开始运动时速率为零，先对运动进行加速，再减速直到速率为零。
     * 其中的运动由按照指数方式衰减的正弦波来定义。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @param	a 指定正弦波的幅度。
     * @param	p 指定正弦波的周期。
     * @return 指定时间的插补属性的值。
     */
    static elasticInOut(t: number, b: number, c: number, d: number, a?: number, p?: number): number;
    /**
     * 以较快速度开始运动，然后在执行时减慢运动速度，直至速率为零。
     * 其中的运动由按照指数方式衰减的正弦波来定义。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @param	a 指定正弦波的幅度。
     * @param	p 指定正弦波的周期。
     * @return 指定时间的插补属性的值。
     */
    static elasticOut(t: number, b: number, c: number, d: number, a?: number, p?: number): number;
    /**
     * 以零速率开始运动，然后在执行时加快运动速度。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static strongIn(t: number, b: number, c: number, d: number): number;
    /**
     * 开始运动时速率为零，先对运动进行加速，再减速直到速率为零。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static strongInOut(t: number, b: number, c: number, d: number): number;
    /**
     * 以较快速度开始运动，然后在执行时减慢运动速度，直至速率为零。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static strongOut(t: number, b: number, c: number, d: number): number;
    /**
     * 开始运动时速率为零，先对运动进行加速，再减速直到速率为零。
     * Sine 缓动方程中的运动加速度小于 Quad 方程中的运动加速度。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static sineInOut(t: number, b: number, c: number, d: number): number;
    /**
     * 以零速率开始运动，然后在执行时加快运动速度。
     * Sine 缓动方程中的运动加速度小于 Quad 方程中的运动加速度。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static sineIn(t: number, b: number, c: number, d: number): number;
    /**
     * 以较快速度开始运动，然后在执行时减慢运动速度，直至速率为零。
     * Sine 缓动方程中的运动加速度小于 Quad 方程中的运动加速度。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static sineOut(t: number, b: number, c: number, d: number): number;
    /**
     * 以零速率开始运动，然后在执行时加快运动速度。
     * Quint 缓动方程的运动加速大于 Quart 缓动方程。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static quintIn(t: number, b: number, c: number, d: number): number;
    /**
     * 开始运动时速率为零，先对运动进行加速，再减速直到速率为零。
     * Quint 缓动方程的运动加速大于 Quart 缓动方程。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static quintInOut(t: number, b: number, c: number, d: number): number;
    /**
     * 以较快速度开始运动，然后在执行时减慢运动速度，直至速率为零。
     * Quint 缓动方程的运动加速大于 Quart 缓动方程。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static quintOut(t: number, b: number, c: number, d: number): number;
    /**
     * 方法以零速率开始运动，然后在执行时加快运动速度。
     * Quart 缓动方程的运动加速大于 Cubic 缓动方程。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static quartIn(t: number, b: number, c: number, d: number): number;
    /**
     * 开始运动时速率为零，先对运动进行加速，再减速直到速率为零。
     * Quart 缓动方程的运动加速大于 Cubic 缓动方程。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static quartInOut(t: number, b: number, c: number, d: number): number;
    /**
     * 以较快速度开始运动，然后在执行时减慢运动速度，直至速率为零。
     * Quart 缓动方程的运动加速大于 Cubic 缓动方程。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static quartOut(t: number, b: number, c: number, d: number): number;
    /**
     * 方法以零速率开始运动，然后在执行时加快运动速度。
     * Cubic 缓动方程的运动加速大于 Quad 缓动方程。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static cubicIn(t: number, b: number, c: number, d: number): number;
    /**
     * 开始运动时速率为零，先对运动进行加速，再减速直到速率为零。
     * Cubic 缓动方程的运动加速大于 Quad 缓动方程。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static cubicInOut(t: number, b: number, c: number, d: number): number;
    /**
     * 以较快速度开始运动，然后在执行时减慢运动速度，直至速率为零。
     * Cubic 缓动方程的运动加速大于 Quad 缓动方程。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static cubicOut(t: number, b: number, c: number, d: number): number;
    /**
     * 方法以零速率开始运动，然后在执行时加快运动速度。
     * Quad 缓动方程中的运动加速度等于 100% 缓动的时间轴补间的运动加速度，并且显著小于 Cubic 缓动方程中的运动加速度。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static quadIn(t: number, b: number, c: number, d: number): number;
    /**
     * 开始运动时速率为零，先对运动进行加速，再减速直到速率为零。
     * Quad 缓动方程中的运动加速度等于 100% 缓动的时间轴补间的运动加速度，并且显著小于 Cubic 缓动方程中的运动加速度。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static quadInOut(t: number, b: number, c: number, d: number): number;
    /**
     * 以较快速度开始运动，然后在执行时减慢运动速度，直至速率为零。
     * Quad 缓动方程中的运动加速度等于 100% 缓动的时间轴补间的运动加速度，并且显著小于 Cubic 缓动方程中的运动加速度。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static quadOut(t: number, b: number, c: number, d: number): number;
    /**
     * 方法以零速率开始运动，然后在执行时加快运动速度。
     * 其中每个时间间隔是剩余距离减去一个固定比例部分。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static expoIn(t: number, b: number, c: number, d: number): number;
    /**
     * 开始运动时速率为零，先对运动进行加速，再减速直到速率为零。
     * 其中每个时间间隔是剩余距离减去一个固定比例部分。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static expoInOut(t: number, b: number, c: number, d: number): number;
    /**
     * 以较快速度开始运动，然后在执行时减慢运动速度，直至速率为零。
     * 其中每个时间间隔是剩余距离减去一个固定比例部分。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static expoOut(t: number, b: number, c: number, d: number): number;
    /**
     * 方法以零速率开始运动，然后在执行时加快运动速度。
     * 缓动方程的运动加速会产生突然的速率变化。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static circIn(t: number, b: number, c: number, d: number): number;
    /**
     * 开始运动时速率为零，先对运动进行加速，再减速直到速率为零。
     * 缓动方程的运动加速会产生突然的速率变化。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static circInOut(t: number, b: number, c: number, d: number): number;
    /**
     * 以较快速度开始运动，然后在执行时减慢运动速度，直至速率为零。
     * 缓动方程的运动加速会产生突然的速率变化。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static circOut(t: number, b: number, c: number, d: number): number;
}
