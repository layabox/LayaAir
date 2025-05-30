var spine;
(function (spine) {
    class IntSet {
        constructor() {
            this.array = new Array();
        }
        add(value) {
            let contains = this.contains(value);
            this.array[value | 0] = value | 0;
            return !contains;
        }
        contains(value) {
            return this.array[value | 0] != undefined;
        }
        remove(value) {
            this.array[value | 0] = undefined;
        }
        clear() {
            this.array.length = 0;
        }
    }
    spine.IntSet = IntSet;
    class StringSet {
        constructor() {
            this.entries = {};
            this.size = 0;
        }
        add(value) {
            let contains = this.entries[value];
            this.entries[value] = true;
            if (!contains) {
                this.size++;
                return true;
            }
            return false;
        }
        addAll(values) {
            let oldSize = this.size;
            for (var i = 0, n = values.length; i < n; i++)
                this.add(values[i]);
            return oldSize != this.size;
        }
        contains(value) {
            return this.entries[value];
        }
        clear() {
            this.entries = {};
            this.size = 0;
        }
    }
    spine.StringSet = StringSet;
    class Color {
        constructor(r = 0, g = 0, b = 0, a = 0) {
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
        }
        set(r, g, b, a) {
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
            return this.clamp();
        }
        setFromColor(c) {
            this.r = c.r;
            this.g = c.g;
            this.b = c.b;
            this.a = c.a;
            return this;
        }
        setFromString(hex) {
            hex = hex.charAt(0) == '#' ? hex.substr(1) : hex;
            this.r = parseInt(hex.substr(0, 2), 16) / 255;
            this.g = parseInt(hex.substr(2, 2), 16) / 255;
            this.b = parseInt(hex.substr(4, 2), 16) / 255;
            this.a = hex.length != 8 ? 1 : parseInt(hex.substr(6, 2), 16) / 255;
            return this;
        }
        add(r, g, b, a) {
            this.r += r;
            this.g += g;
            this.b += b;
            this.a += a;
            return this.clamp();
        }
        clamp() {
            if (this.r < 0)
                this.r = 0;
            else if (this.r > 1)
                this.r = 1;
            if (this.g < 0)
                this.g = 0;
            else if (this.g > 1)
                this.g = 1;
            if (this.b < 0)
                this.b = 0;
            else if (this.b > 1)
                this.b = 1;
            if (this.a < 0)
                this.a = 0;
            else if (this.a > 1)
                this.a = 1;
            return this;
        }
        static rgba8888ToColor(color, value) {
            color.r = ((value & 0xff000000) >>> 24) / 255;
            color.g = ((value & 0x00ff0000) >>> 16) / 255;
            color.b = ((value & 0x0000ff00) >>> 8) / 255;
            color.a = ((value & 0x000000ff)) / 255;
        }
        static rgb888ToColor(color, value) {
            color.r = ((value & 0x00ff0000) >>> 16) / 255;
            color.g = ((value & 0x0000ff00) >>> 8) / 255;
            color.b = ((value & 0x000000ff)) / 255;
        }
        toRgb888() {
            const hex = (x) => ("0" + (x * 255).toString(16)).slice(-2);
            return Number("0x" + hex(this.r) + hex(this.g) + hex(this.b));
        }
        static fromString(hex) {
            return new Color().setFromString(hex);
        }
    }
    Color.WHITE = new Color(1, 1, 1, 1);
    Color.RED = new Color(1, 0, 0, 1);
    Color.GREEN = new Color(0, 1, 0, 1);
    Color.BLUE = new Color(0, 0, 1, 1);
    Color.MAGENTA = new Color(1, 0, 1, 1);
    spine.Color = Color;
    class MathUtils {
        static clamp(value, min, max) {
            if (value < min)
                return min;
            if (value > max)
                return max;
            return value;
        }
        static cosDeg(degrees) {
            return Math.cos(degrees * MathUtils.degRad);
        }
        static sinDeg(degrees) {
            return Math.sin(degrees * MathUtils.degRad);
        }
        static atan2Deg(y, x) {
            return Math.atan2(y, x) * MathUtils.degRad;
        }
        static signum(value) {
            return value > 0 ? 1 : value < 0 ? -1 : 0;
        }
        static toInt(x) {
            return x > 0 ? Math.floor(x) : Math.ceil(x);
        }
        static cbrt(x) {
            let y = Math.pow(Math.abs(x), 1 / 3);
            return x < 0 ? -y : y;
        }
        static randomTriangular(min, max) {
            return MathUtils.randomTriangularWith(min, max, (min + max) * 0.5);
        }
        static randomTriangularWith(min, max, mode) {
            let u = Math.random();
            let d = max - min;
            if (u <= (mode - min) / d)
                return min + Math.sqrt(u * d * (mode - min));
            return max - Math.sqrt((1 - u) * d * (max - mode));
        }
        static isPowerOfTwo(value) {
            return value && (value & (value - 1)) === 0;
        }
    }
    MathUtils.PI = 3.1415927;
    MathUtils.PI2 = MathUtils.PI * 2;
    MathUtils.invPI2 = 1 / MathUtils.PI2;
    MathUtils.radiansToDegrees = 180 / MathUtils.PI;
    MathUtils.radDeg = MathUtils.radiansToDegrees;
    MathUtils.degreesToRadians = MathUtils.PI / 180;
    MathUtils.degRad = MathUtils.degreesToRadians;
    spine.MathUtils = MathUtils;
    class Interpolation {
        apply(start, end, a) {
            return start + (end - start) * this.applyInternal(a);
        }
    }
    spine.Interpolation = Interpolation;
    class Pow extends Interpolation {
        constructor(power) {
            super();
            this.power = 2;
            this.power = power;
        }
        applyInternal(a) {
            if (a <= 0.5)
                return Math.pow(a * 2, this.power) / 2;
            return Math.pow((a - 1) * 2, this.power) / (this.power % 2 == 0 ? -2 : 2) + 1;
        }
    }
    spine.Pow = Pow;
    class PowOut extends Pow {
        constructor(power) {
            super(power);
        }
        applyInternal(a) {
            return Math.pow(a - 1, this.power) * (this.power % 2 == 0 ? -1 : 1) + 1;
        }
    }
    spine.PowOut = PowOut;
    class Utils {
        static arrayCopy(source, sourceStart, dest, destStart, numElements) {
            for (let i = sourceStart, j = destStart; i < sourceStart + numElements; i++, j++) {
                dest[j] = source[i];
            }
        }
        static arrayFill(array, fromIndex, toIndex, value) {
            for (let i = fromIndex; i < toIndex; i++)
                array[i] = value;
        }
        static setArraySize(array, size, value = 0) {
            let oldSize = array.length;
            if (oldSize == size)
                return array;
            array.length = size;
            if (oldSize < size) {
                for (let i = oldSize; i < size; i++)
                    array[i] = value;
            }
            return array;
        }
        static ensureArrayCapacity(array, size, value = 0) {
            if (array.length >= size)
                return array;
            return Utils.setArraySize(array, size, value);
        }
        static newArray(size, defaultValue) {
            let array = new Array(size);
            for (let i = 0; i < size; i++)
                array[i] = defaultValue;
            return array;
        }
        static newFloatArray(size) {
            if (Utils.SUPPORTS_TYPED_ARRAYS)
                return new Float32Array(size);
            else {
                let array = new Array(size);
                for (let i = 0; i < array.length; i++)
                    array[i] = 0;
                return array;
            }
        }
        static newShortArray(size) {
            if (Utils.SUPPORTS_TYPED_ARRAYS)
                return new Int16Array(size);
            else {
                let array = new Array(size);
                for (let i = 0; i < array.length; i++)
                    array[i] = 0;
                return array;
            }
        }
        static toFloatArray(array) {
            return Utils.SUPPORTS_TYPED_ARRAYS ? new Float32Array(array) : array;
        }
        static toSinglePrecision(value) {
            return Utils.SUPPORTS_TYPED_ARRAYS ? Math.fround(value) : value;
        }
        static webkit602BugfixHelper(alpha, blend) {
        }
        static contains(array, element, identity = true) {
            for (var i = 0; i < array.length; i++)
                if (array[i] == element)
                    return true;
            return false;
        }
        static enumValue(type, name) {
            return type[name[0].toUpperCase() + name.slice(1)];
        }
    }
    Utils.SUPPORTS_TYPED_ARRAYS = typeof (Float32Array) !== "undefined";
    spine.Utils = Utils;
    class DebugUtils {
        static logBones(skeleton) {
            for (let i = 0; i < skeleton.bones.length; i++) {
                let bone = skeleton.bones[i];
                console.log(bone.data.name + ", " + bone.a + ", " + bone.b + ", " + bone.c + ", " + bone.d + ", " + bone.worldX + ", " + bone.worldY);
            }
        }
    }
    spine.DebugUtils = DebugUtils;
    class Pool {
        constructor(instantiator) {
            this.items = new Array();
            this.instantiator = instantiator;
        }
        obtain() {
            return this.items.length > 0 ? this.items.pop() : this.instantiator();
        }
        free(item) {
            if (item.reset)
                item.reset();
            this.items.push(item);
        }
        freeAll(items) {
            for (let i = 0; i < items.length; i++)
                this.free(items[i]);
        }
        clear() {
            this.items.length = 0;
        }
    }
    spine.Pool = Pool;
    class Vector2 {
        constructor(x = 0, y = 0) {
            this.x = x;
            this.y = y;
        }
        set(x, y) {
            this.x = x;
            this.y = y;
            return this;
        }
        length() {
            let x = this.x;
            let y = this.y;
            return Math.sqrt(x * x + y * y);
        }
        normalize() {
            let len = this.length();
            if (len != 0) {
                this.x /= len;
                this.y /= len;
            }
            return this;
        }
    }
    spine.Vector2 = Vector2;
    class TimeKeeper {
        constructor() {
            this.maxDelta = 0.064;
            this.framesPerSecond = 0;
            this.delta = 0;
            this.totalTime = 0;
            this.lastTime = Date.now() / 1000;
            this.frameCount = 0;
            this.frameTime = 0;
        }
        update() {
            let now = Date.now() / 1000;
            this.delta = now - this.lastTime;
            this.frameTime += this.delta;
            this.totalTime += this.delta;
            if (this.delta > this.maxDelta)
                this.delta = this.maxDelta;
            this.lastTime = now;
            this.frameCount++;
            if (this.frameTime > 1) {
                this.framesPerSecond = this.frameCount / this.frameTime;
                this.frameTime = 0;
                this.frameCount = 0;
            }
        }
    }
    spine.TimeKeeper = TimeKeeper;
    class WindowedMean {
        constructor(windowSize = 32) {
            this.addedValues = 0;
            this.lastValue = 0;
            this.mean = 0;
            this.dirty = true;
            this.values = new Array(windowSize);
        }
        hasEnoughData() {
            return this.addedValues >= this.values.length;
        }
        addValue(value) {
            if (this.addedValues < this.values.length)
                this.addedValues++;
            this.values[this.lastValue++] = value;
            if (this.lastValue > this.values.length - 1)
                this.lastValue = 0;
            this.dirty = true;
        }
        getMean() {
            if (this.hasEnoughData()) {
                if (this.dirty) {
                    let mean = 0;
                    for (let i = 0; i < this.values.length; i++)
                        mean += this.values[i];
                    this.mean = mean / this.values.length;
                    this.dirty = false;
                }
                return this.mean;
            }
            return 0;
        }
    }
    spine.WindowedMean = WindowedMean;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class Animation {
        constructor(name, timelines, duration) {
            this.timelines = [];
            this.timelineIds = new spine.StringSet();
            if (!name)
                throw new Error("name cannot be null.");
            this.name = name;
            this.setTimelines(timelines);
            this.duration = duration;
        }
        setTimelines(timelines) {
            if (!timelines)
                throw new Error("timelines cannot be null.");
            this.timelines = timelines;
            this.timelineIds.clear();
            for (var i = 0; i < timelines.length; i++)
                this.timelineIds.addAll(timelines[i].getPropertyIds());
        }
        hasTimeline(ids) {
            for (let i = 0; i < ids.length; i++)
                if (this.timelineIds.contains(ids[i]))
                    return true;
            return false;
        }
        apply(skeleton, lastTime, time, loop, events, alpha, blend, direction) {
            if (!skeleton)
                throw new Error("skeleton cannot be null.");
            if (loop && this.duration != 0) {
                time %= this.duration;
                if (lastTime > 0)
                    lastTime %= this.duration;
            }
            let timelines = this.timelines;
            for (let i = 0, n = timelines.length; i < n; i++)
                timelines[i].apply(skeleton, lastTime, time, events, alpha, blend, direction);
        }
    }
    spine.Animation = Animation;
    let MixBlend;
    (function (MixBlend) {
        MixBlend[MixBlend["setup"] = 0] = "setup";
        MixBlend[MixBlend["first"] = 1] = "first";
        MixBlend[MixBlend["replace"] = 2] = "replace";
        MixBlend[MixBlend["add"] = 3] = "add";
    })(MixBlend = spine.MixBlend || (spine.MixBlend = {}));
    let MixDirection;
    (function (MixDirection) {
        MixDirection[MixDirection["mixIn"] = 0] = "mixIn";
        MixDirection[MixDirection["mixOut"] = 1] = "mixOut";
    })(MixDirection = spine.MixDirection || (spine.MixDirection = {}));
    const Property = {
        rotate: 0,
        x: 1,
        y: 2,
        scaleX: 3,
        scaleY: 4,
        shearX: 5,
        shearY: 6,
        inherit: 7,
        rgb: 8,
        alpha: 9,
        rgb2: 10,
        attachment: 11,
        deform: 12,
        event: 13,
        drawOrder: 14,
        ikConstraint: 15,
        transformConstraint: 16,
        pathConstraintPosition: 17,
        pathConstraintSpacing: 18,
        pathConstraintMix: 19,
        physicsConstraintInertia: 20,
        physicsConstraintStrength: 21,
        physicsConstraintDamping: 22,
        physicsConstraintMass: 23,
        physicsConstraintWind: 24,
        physicsConstraintGravity: 25,
        physicsConstraintMix: 26,
        physicsConstraintReset: 27,
        sequence: 28,
    };
    class Timeline {
        constructor(frameCount, propertyIds) {
            this.propertyIds = propertyIds;
            this.frames = spine.Utils.newFloatArray(frameCount * this.getFrameEntries());
        }
        getPropertyIds() {
            return this.propertyIds;
        }
        getFrameEntries() {
            return 1;
        }
        getFrameCount() {
            return this.frames.length / this.getFrameEntries();
        }
        getDuration() {
            return this.frames[this.frames.length - this.getFrameEntries()];
        }
        static search1(frames, time) {
            let n = frames.length;
            for (let i = 1; i < n; i++)
                if (frames[i] > time)
                    return i - 1;
            return n - 1;
        }
        static search(frames, time, step) {
            let n = frames.length;
            for (let i = step; i < n; i += step)
                if (frames[i] > time)
                    return i - step;
            return n - step;
        }
    }
    spine.Timeline = Timeline;
    class CurveTimeline extends Timeline {
        constructor(frameCount, bezierCount, propertyIds) {
            super(frameCount, propertyIds);
            this.curves = spine.Utils.newFloatArray(frameCount + bezierCount * 18);
            this.curves[frameCount - 1] = 1;
        }
        setLinear(frame) {
            this.curves[frame] = 0;
        }
        setStepped(frame) {
            this.curves[frame] = 1;
        }
        shrink(bezierCount) {
            let size = this.getFrameCount() + bezierCount * 18;
            if (this.curves.length > size) {
                let newCurves = spine.Utils.newFloatArray(size);
                spine.Utils.arrayCopy(this.curves, 0, newCurves, 0, size);
                this.curves = newCurves;
            }
        }
        setBezier(bezier, frame, value, time1, value1, cx1, cy1, cx2, cy2, time2, value2) {
            let curves = this.curves;
            let i = this.getFrameCount() + bezier * 18;
            if (value == 0)
                curves[frame] = 2 + i;
            let tmpx = (time1 - cx1 * 2 + cx2) * 0.03, tmpy = (value1 - cy1 * 2 + cy2) * 0.03;
            let dddx = ((cx1 - cx2) * 3 - time1 + time2) * 0.006, dddy = ((cy1 - cy2) * 3 - value1 + value2) * 0.006;
            let ddx = tmpx * 2 + dddx, ddy = tmpy * 2 + dddy;
            let dx = (cx1 - time1) * 0.3 + tmpx + dddx * 0.16666667, dy = (cy1 - value1) * 0.3 + tmpy + dddy * 0.16666667;
            let x = time1 + dx, y = value1 + dy;
            for (let n = i + 18; i < n; i += 2) {
                curves[i] = x;
                curves[i + 1] = y;
                dx += ddx;
                dy += ddy;
                ddx += dddx;
                ddy += dddy;
                x += dx;
                y += dy;
            }
        }
        getBezierValue(time, frameIndex, valueOffset, i) {
            let curves = this.curves;
            if (curves[i] > time) {
                let x = this.frames[frameIndex], y = this.frames[frameIndex + valueOffset];
                return y + (time - x) / (curves[i] - x) * (curves[i + 1] - y);
            }
            let n = i + 18;
            for (i += 2; i < n; i += 2) {
                if (curves[i] >= time) {
                    let x = curves[i - 2], y = curves[i - 1];
                    return y + (time - x) / (curves[i] - x) * (curves[i + 1] - y);
                }
            }
            frameIndex += this.getFrameEntries();
            let x = curves[n - 2], y = curves[n - 1];
            return y + (time - x) / (this.frames[frameIndex] - x) * (this.frames[frameIndex + valueOffset] - y);
        }
    }
    spine.CurveTimeline = CurveTimeline;
    class CurveTimeline1 extends CurveTimeline {
        constructor(frameCount, bezierCount, propertyId) {
            super(frameCount, bezierCount, [propertyId]);
        }
        getFrameEntries() {
            return 2;
        }
        setFrame(frame, time, value) {
            frame <<= 1;
            this.frames[frame] = time;
            this.frames[frame + 1] = value;
        }
        getCurveValue(time) {
            let frames = this.frames;
            let i = frames.length - 2;
            for (let ii = 2; ii <= i; ii += 2) {
                if (frames[ii] > time) {
                    i = ii - 2;
                    break;
                }
            }
            let curveType = this.curves[i >> 1];
            switch (curveType) {
                case 0:
                    let before = frames[i], value = frames[i + 1];
                    return value + (time - before) / (frames[i + 2] - before) * (frames[i + 2 + 1] - value);
                case 1:
                    return frames[i + 1];
            }
            return this.getBezierValue(time, i, 1, curveType - 2);
        }
        getRelativeValue(time, alpha, blend, current, setup) {
            if (time < this.frames[0]) {
                switch (blend) {
                    case MixBlend.setup:
                        return setup;
                    case MixBlend.first:
                        return current + (setup - current) * alpha;
                }
                return current;
            }
            let value = this.getCurveValue(time);
            switch (blend) {
                case MixBlend.setup:
                    return setup + value * alpha;
                case MixBlend.first:
                case MixBlend.replace:
                    value += setup - current;
            }
            return current + value * alpha;
        }
        getAbsoluteValue(time, alpha, blend, current, setup) {
            if (time < this.frames[0]) {
                switch (blend) {
                    case MixBlend.setup:
                        return setup;
                    case MixBlend.first:
                        return current + (setup - current) * alpha;
                }
                return current;
            }
            let value = this.getCurveValue(time);
            if (blend == MixBlend.setup)
                return setup + (value - setup) * alpha;
            return current + (value - current) * alpha;
        }
        getAbsoluteValue2(time, alpha, blend, current, setup, value) {
            if (time < this.frames[0]) {
                switch (blend) {
                    case MixBlend.setup:
                        return setup;
                    case MixBlend.first:
                        return current + (setup - current) * alpha;
                }
                return current;
            }
            if (blend == MixBlend.setup)
                return setup + (value - setup) * alpha;
            return current + (value - current) * alpha;
        }
        getScaleValue(time, alpha, blend, direction, current, setup) {
            const frames = this.frames;
            if (time < frames[0]) {
                switch (blend) {
                    case MixBlend.setup:
                        return setup;
                    case MixBlend.first:
                        return current + (setup - current) * alpha;
                }
                return current;
            }
            let value = this.getCurveValue(time) * setup;
            if (alpha == 1) {
                if (blend == MixBlend.add)
                    return current + value - setup;
                return value;
            }
            if (direction == MixDirection.mixOut) {
                switch (blend) {
                    case MixBlend.setup:
                        return setup + (Math.abs(value) * spine.MathUtils.signum(setup) - setup) * alpha;
                    case MixBlend.first:
                    case MixBlend.replace:
                        return current + (Math.abs(value) * spine.MathUtils.signum(current) - current) * alpha;
                }
            }
            else {
                let s = 0;
                switch (blend) {
                    case MixBlend.setup:
                        s = Math.abs(setup) * spine.MathUtils.signum(value);
                        return s + (value - s) * alpha;
                    case MixBlend.first:
                    case MixBlend.replace:
                        s = Math.abs(current) * spine.MathUtils.signum(value);
                        return s + (value - s) * alpha;
                }
            }
            return current + (value - setup) * alpha;
        }
    }
    spine.CurveTimeline1 = CurveTimeline1;
    class CurveTimeline2 extends CurveTimeline {
        constructor(frameCount, bezierCount, propertyId1, propertyId2) {
            super(frameCount, bezierCount, [propertyId1, propertyId2]);
        }
        getFrameEntries() {
            return 3;
        }
        setFrame(frame, time, value1, value2) {
            frame *= 3;
            this.frames[frame] = time;
            this.frames[frame + 1] = value1;
            this.frames[frame + 2] = value2;
        }
    }
    spine.CurveTimeline2 = CurveTimeline2;
    class RotateTimeline extends CurveTimeline1 {
        constructor(frameCount, bezierCount, boneIndex) {
            super(frameCount, bezierCount, Property.rotate + "|" + boneIndex);
            this.boneIndex = 0;
            this.boneIndex = boneIndex;
        }
        apply(skeleton, lastTime, time, events, alpha, blend, direction) {
            let bone = skeleton.bones[this.boneIndex];
            if (bone.active)
                bone.rotation = this.getRelativeValue(time, alpha, blend, bone.rotation, bone.data.rotation);
        }
    }
    spine.RotateTimeline = RotateTimeline;
    class TranslateTimeline extends CurveTimeline2 {
        constructor(frameCount, bezierCount, boneIndex) {
            super(frameCount, bezierCount, Property.x + "|" + boneIndex, Property.y + "|" + boneIndex);
            this.boneIndex = 0;
            this.boneIndex = boneIndex;
        }
        apply(skeleton, lastTime, time, events, alpha, blend, direction) {
            let bone = skeleton.bones[this.boneIndex];
            if (!bone.active)
                return;
            let frames = this.frames;
            if (time < frames[0]) {
                switch (blend) {
                    case MixBlend.setup:
                        bone.x = bone.data.x;
                        bone.y = bone.data.y;
                        return;
                    case MixBlend.first:
                        bone.x += (bone.data.x - bone.x) * alpha;
                        bone.y += (bone.data.y - bone.y) * alpha;
                }
                return;
            }
            let x = 0, y = 0;
            let i = Timeline.search(frames, time, 3);
            let curveType = this.curves[i / 3];
            switch (curveType) {
                case 0:
                    let before = frames[i];
                    x = frames[i + 1];
                    y = frames[i + 2];
                    let t = (time - before) / (frames[i + 3] - before);
                    x += (frames[i + 3 + 1] - x) * t;
                    y += (frames[i + 3 + 2] - y) * t;
                    break;
                case 1:
                    x = frames[i + 1];
                    y = frames[i + 2];
                    break;
                default:
                    x = this.getBezierValue(time, i, 1, curveType - 2);
                    y = this.getBezierValue(time, i, 2, curveType + 18 - 2);
            }
            switch (blend) {
                case MixBlend.setup:
                    bone.x = bone.data.x + x * alpha;
                    bone.y = bone.data.y + y * alpha;
                    break;
                case MixBlend.first:
                case MixBlend.replace:
                    bone.x += (bone.data.x + x - bone.x) * alpha;
                    bone.y += (bone.data.y + y - bone.y) * alpha;
                    break;
                case MixBlend.add:
                    bone.x += x * alpha;
                    bone.y += y * alpha;
            }
        }
    }
    spine.TranslateTimeline = TranslateTimeline;
    class TranslateXTimeline extends CurveTimeline1 {
        constructor(frameCount, bezierCount, boneIndex) {
            super(frameCount, bezierCount, Property.x + "|" + boneIndex);
            this.boneIndex = 0;
            this.boneIndex = boneIndex;
        }
        apply(skeleton, lastTime, time, events, alpha, blend, direction) {
            let bone = skeleton.bones[this.boneIndex];
            if (bone.active)
                bone.x = this.getRelativeValue(time, alpha, blend, bone.x, bone.data.x);
        }
    }
    spine.TranslateXTimeline = TranslateXTimeline;
    class TranslateYTimeline extends CurveTimeline1 {
        constructor(frameCount, bezierCount, boneIndex) {
            super(frameCount, bezierCount, Property.y + "|" + boneIndex);
            this.boneIndex = 0;
            this.boneIndex = boneIndex;
        }
        apply(skeleton, lastTime, time, events, alpha, blend, direction) {
            let bone = skeleton.bones[this.boneIndex];
            if (bone.active)
                bone.y = this.getRelativeValue(time, alpha, blend, bone.y, bone.data.y);
        }
    }
    spine.TranslateYTimeline = TranslateYTimeline;
    class ScaleTimeline extends CurveTimeline2 {
        constructor(frameCount, bezierCount, boneIndex) {
            super(frameCount, bezierCount, Property.scaleX + "|" + boneIndex, Property.scaleY + "|" + boneIndex);
            this.boneIndex = 0;
            this.boneIndex = boneIndex;
        }
        apply(skeleton, lastTime, time, events, alpha, blend, direction) {
            let bone = skeleton.bones[this.boneIndex];
            if (!bone.active)
                return;
            let frames = this.frames;
            if (time < frames[0]) {
                switch (blend) {
                    case MixBlend.setup:
                        bone.scaleX = bone.data.scaleX;
                        bone.scaleY = bone.data.scaleY;
                        return;
                    case MixBlend.first:
                        bone.scaleX += (bone.data.scaleX - bone.scaleX) * alpha;
                        bone.scaleY += (bone.data.scaleY - bone.scaleY) * alpha;
                }
                return;
            }
            let x, y;
            let i = Timeline.search(frames, time, 3);
            let curveType = this.curves[i / 3];
            switch (curveType) {
                case 0:
                    let before = frames[i];
                    x = frames[i + 1];
                    y = frames[i + 2];
                    let t = (time - before) / (frames[i + 3] - before);
                    x += (frames[i + 3 + 1] - x) * t;
                    y += (frames[i + 3 + 2] - y) * t;
                    break;
                case 1:
                    x = frames[i + 1];
                    y = frames[i + 2];
                    break;
                default:
                    x = this.getBezierValue(time, i, 1, curveType - 2);
                    y = this.getBezierValue(time, i, 2, curveType + 18 - 2);
            }
            x *= bone.data.scaleX;
            y *= bone.data.scaleY;
            if (alpha == 1) {
                if (blend == MixBlend.add) {
                    bone.scaleX += x - bone.data.scaleX;
                    bone.scaleY += y - bone.data.scaleY;
                }
                else {
                    bone.scaleX = x;
                    bone.scaleY = y;
                }
            }
            else {
                let bx = 0, by = 0;
                if (direction == MixDirection.mixOut) {
                    switch (blend) {
                        case MixBlend.setup:
                            bx = bone.data.scaleX;
                            by = bone.data.scaleY;
                            bone.scaleX = bx + (Math.abs(x) * spine.MathUtils.signum(bx) - bx) * alpha;
                            bone.scaleY = by + (Math.abs(y) * spine.MathUtils.signum(by) - by) * alpha;
                            break;
                        case MixBlend.first:
                        case MixBlend.replace:
                            bx = bone.scaleX;
                            by = bone.scaleY;
                            bone.scaleX = bx + (Math.abs(x) * spine.MathUtils.signum(bx) - bx) * alpha;
                            bone.scaleY = by + (Math.abs(y) * spine.MathUtils.signum(by) - by) * alpha;
                            break;
                        case MixBlend.add:
                            bone.scaleX += (x - bone.data.scaleX) * alpha;
                            bone.scaleY += (y - bone.data.scaleY) * alpha;
                    }
                }
                else {
                    switch (blend) {
                        case MixBlend.setup:
                            bx = Math.abs(bone.data.scaleX) * spine.MathUtils.signum(x);
                            by = Math.abs(bone.data.scaleY) * spine.MathUtils.signum(y);
                            bone.scaleX = bx + (x - bx) * alpha;
                            bone.scaleY = by + (y - by) * alpha;
                            break;
                        case MixBlend.first:
                        case MixBlend.replace:
                            bx = Math.abs(bone.scaleX) * spine.MathUtils.signum(x);
                            by = Math.abs(bone.scaleY) * spine.MathUtils.signum(y);
                            bone.scaleX = bx + (x - bx) * alpha;
                            bone.scaleY = by + (y - by) * alpha;
                            break;
                        case MixBlend.add:
                            bone.scaleX += (x - bone.data.scaleX) * alpha;
                            bone.scaleY += (y - bone.data.scaleY) * alpha;
                    }
                }
            }
        }
    }
    spine.ScaleTimeline = ScaleTimeline;
    class ScaleXTimeline extends CurveTimeline1 {
        constructor(frameCount, bezierCount, boneIndex) {
            super(frameCount, bezierCount, Property.scaleX + "|" + boneIndex);
            this.boneIndex = 0;
            this.boneIndex = boneIndex;
        }
        apply(skeleton, lastTime, time, events, alpha, blend, direction) {
            let bone = skeleton.bones[this.boneIndex];
            if (bone.active)
                bone.scaleX = this.getScaleValue(time, alpha, blend, direction, bone.scaleX, bone.data.scaleX);
        }
    }
    spine.ScaleXTimeline = ScaleXTimeline;
    class ScaleYTimeline extends CurveTimeline1 {
        constructor(frameCount, bezierCount, boneIndex) {
            super(frameCount, bezierCount, Property.scaleY + "|" + boneIndex);
            this.boneIndex = 0;
            this.boneIndex = boneIndex;
        }
        apply(skeleton, lastTime, time, events, alpha, blend, direction) {
            let bone = skeleton.bones[this.boneIndex];
            if (bone.active)
                bone.scaleY = this.getScaleValue(time, alpha, blend, direction, bone.scaleY, bone.data.scaleY);
        }
    }
    spine.ScaleYTimeline = ScaleYTimeline;
    class ShearTimeline extends CurveTimeline2 {
        constructor(frameCount, bezierCount, boneIndex) {
            super(frameCount, bezierCount, Property.shearX + "|" + boneIndex, Property.shearY + "|" + boneIndex);
            this.boneIndex = 0;
            this.boneIndex = boneIndex;
        }
        apply(skeleton, lastTime, time, events, alpha, blend, direction) {
            let bone = skeleton.bones[this.boneIndex];
            if (!bone.active)
                return;
            let frames = this.frames;
            if (time < frames[0]) {
                switch (blend) {
                    case MixBlend.setup:
                        bone.shearX = bone.data.shearX;
                        bone.shearY = bone.data.shearY;
                        return;
                    case MixBlend.first:
                        bone.shearX += (bone.data.shearX - bone.shearX) * alpha;
                        bone.shearY += (bone.data.shearY - bone.shearY) * alpha;
                }
                return;
            }
            let x = 0, y = 0;
            let i = Timeline.search(frames, time, 3);
            let curveType = this.curves[i / 3];
            switch (curveType) {
                case 0:
                    let before = frames[i];
                    x = frames[i + 1];
                    y = frames[i + 2];
                    let t = (time - before) / (frames[i + 3] - before);
                    x += (frames[i + 3 + 1] - x) * t;
                    y += (frames[i + 3 + 2] - y) * t;
                    break;
                case 1:
                    x = frames[i + 1];
                    y = frames[i + 2];
                    break;
                default:
                    x = this.getBezierValue(time, i, 1, curveType - 2);
                    y = this.getBezierValue(time, i, 2, curveType + 18 - 2);
            }
            switch (blend) {
                case MixBlend.setup:
                    bone.shearX = bone.data.shearX + x * alpha;
                    bone.shearY = bone.data.shearY + y * alpha;
                    break;
                case MixBlend.first:
                case MixBlend.replace:
                    bone.shearX += (bone.data.shearX + x - bone.shearX) * alpha;
                    bone.shearY += (bone.data.shearY + y - bone.shearY) * alpha;
                    break;
                case MixBlend.add:
                    bone.shearX += x * alpha;
                    bone.shearY += y * alpha;
            }
        }
    }
    spine.ShearTimeline = ShearTimeline;
    class ShearXTimeline extends CurveTimeline1 {
        constructor(frameCount, bezierCount, boneIndex) {
            super(frameCount, bezierCount, Property.shearX + "|" + boneIndex);
            this.boneIndex = 0;
            this.boneIndex = boneIndex;
        }
        apply(skeleton, lastTime, time, events, alpha, blend, direction) {
            let bone = skeleton.bones[this.boneIndex];
            if (bone.active)
                bone.shearX = this.getRelativeValue(time, alpha, blend, bone.shearX, bone.data.shearX);
        }
    }
    spine.ShearXTimeline = ShearXTimeline;
    class ShearYTimeline extends CurveTimeline1 {
        constructor(frameCount, bezierCount, boneIndex) {
            super(frameCount, bezierCount, Property.shearY + "|" + boneIndex);
            this.boneIndex = 0;
            this.boneIndex = boneIndex;
        }
        apply(skeleton, lastTime, time, events, alpha, blend, direction) {
            let bone = skeleton.bones[this.boneIndex];
            if (bone.active)
                bone.shearY = this.getRelativeValue(time, alpha, blend, bone.shearY, bone.data.shearY);
        }
    }
    spine.ShearYTimeline = ShearYTimeline;
    class InheritTimeline extends Timeline {
        constructor(frameCount, boneIndex) {
            super(frameCount, [Property.inherit + "|" + boneIndex]);
            this.boneIndex = 0;
            this.boneIndex = boneIndex;
        }
        getFrameEntries() {
            return 2;
        }
        setFrame(frame, time, inherit) {
            frame *= 2;
            this.frames[frame] = time;
            this.frames[frame + 1] = inherit;
        }
        apply(skeleton, lastTime, time, events, alpha, blend, direction) {
            let bone = skeleton.bones[this.boneIndex];
            if (!bone.active)
                return;
            if (direction == MixDirection.mixOut) {
                if (blend == MixBlend.setup)
                    bone.inherit = bone.data.inherit;
                return;
            }
            let frames = this.frames;
            if (time < frames[0]) {
                if (blend == MixBlend.setup || blend == MixBlend.first)
                    bone.inherit = bone.data.inherit;
                return;
            }
            bone.inherit = this.frames[Timeline.search(frames, time, 2) + 1];
        }
    }
    spine.InheritTimeline = InheritTimeline;
    class RGBATimeline extends CurveTimeline {
        constructor(frameCount, bezierCount, slotIndex) {
            super(frameCount, bezierCount, [
                Property.rgb + "|" + slotIndex,
                Property.alpha + "|" + slotIndex
            ]);
            this.slotIndex = 0;
            this.slotIndex = slotIndex;
        }
        getFrameEntries() {
            return 5;
        }
        setFrame(frame, time, r, g, b, a) {
            frame *= 5;
            this.frames[frame] = time;
            this.frames[frame + 1] = r;
            this.frames[frame + 2] = g;
            this.frames[frame + 3] = b;
            this.frames[frame + 4] = a;
        }
        apply(skeleton, lastTime, time, events, alpha, blend, direction) {
            let slot = skeleton.slots[this.slotIndex];
            if (!slot.bone.active)
                return;
            let frames = this.frames;
            let color = slot.color;
            if (time < frames[0]) {
                let setup = slot.data.color;
                switch (blend) {
                    case MixBlend.setup:
                        color.setFromColor(setup);
                        return;
                    case MixBlend.first:
                        color.add((setup.r - color.r) * alpha, (setup.g - color.g) * alpha, (setup.b - color.b) * alpha, (setup.a - color.a) * alpha);
                }
                return;
            }
            let r = 0, g = 0, b = 0, a = 0;
            let i = Timeline.search(frames, time, 5);
            let curveType = this.curves[i / 5];
            switch (curveType) {
                case 0:
                    let before = frames[i];
                    r = frames[i + 1];
                    g = frames[i + 2];
                    b = frames[i + 3];
                    a = frames[i + 4];
                    let t = (time - before) / (frames[i + 5] - before);
                    r += (frames[i + 5 + 1] - r) * t;
                    g += (frames[i + 5 + 2] - g) * t;
                    b += (frames[i + 5 + 3] - b) * t;
                    a += (frames[i + 5 + 4] - a) * t;
                    break;
                case 1:
                    r = frames[i + 1];
                    g = frames[i + 2];
                    b = frames[i + 3];
                    a = frames[i + 4];
                    break;
                default:
                    r = this.getBezierValue(time, i, 1, curveType - 2);
                    g = this.getBezierValue(time, i, 2, curveType + 18 - 2);
                    b = this.getBezierValue(time, i, 3, curveType + 18 * 2 - 2);
                    a = this.getBezierValue(time, i, 4, curveType + 18 * 3 - 2);
            }
            if (alpha == 1)
                color.set(r, g, b, a);
            else {
                if (blend == MixBlend.setup)
                    color.setFromColor(slot.data.color);
                color.add((r - color.r) * alpha, (g - color.g) * alpha, (b - color.b) * alpha, (a - color.a) * alpha);
            }
        }
    }
    spine.RGBATimeline = RGBATimeline;
    class RGBTimeline extends CurveTimeline {
        constructor(frameCount, bezierCount, slotIndex) {
            super(frameCount, bezierCount, [
                Property.rgb + "|" + slotIndex
            ]);
            this.slotIndex = 0;
            this.slotIndex = slotIndex;
        }
        getFrameEntries() {
            return 4;
        }
        setFrame(frame, time, r, g, b) {
            frame <<= 2;
            this.frames[frame] = time;
            this.frames[frame + 1] = r;
            this.frames[frame + 2] = g;
            this.frames[frame + 3] = b;
        }
        apply(skeleton, lastTime, time, events, alpha, blend, direction) {
            let slot = skeleton.slots[this.slotIndex];
            if (!slot.bone.active)
                return;
            let frames = this.frames;
            let color = slot.color;
            if (time < frames[0]) {
                let setup = slot.data.color;
                switch (blend) {
                    case MixBlend.setup:
                        color.r = setup.r;
                        color.g = setup.g;
                        color.b = setup.b;
                        return;
                    case MixBlend.first:
                        color.r += (setup.r - color.r) * alpha;
                        color.g += (setup.g - color.g) * alpha;
                        color.b += (setup.b - color.b) * alpha;
                }
                return;
            }
            let r = 0, g = 0, b = 0;
            let i = Timeline.search(frames, time, 4);
            let curveType = this.curves[i >> 2];
            switch (curveType) {
                case 0:
                    let before = frames[i];
                    r = frames[i + 1];
                    g = frames[i + 2];
                    b = frames[i + 3];
                    let t = (time - before) / (frames[i + 4] - before);
                    r += (frames[i + 4 + 1] - r) * t;
                    g += (frames[i + 4 + 2] - g) * t;
                    b += (frames[i + 4 + 3] - b) * t;
                    break;
                case 1:
                    r = frames[i + 1];
                    g = frames[i + 2];
                    b = frames[i + 3];
                    break;
                default:
                    r = this.getBezierValue(time, i, 1, curveType - 2);
                    g = this.getBezierValue(time, i, 2, curveType + 18 - 2);
                    b = this.getBezierValue(time, i, 3, curveType + 18 * 2 - 2);
            }
            if (alpha == 1) {
                color.r = r;
                color.g = g;
                color.b = b;
            }
            else {
                if (blend == MixBlend.setup) {
                    let setup = slot.data.color;
                    color.r = setup.r;
                    color.g = setup.g;
                    color.b = setup.b;
                }
                color.r += (r - color.r) * alpha;
                color.g += (g - color.g) * alpha;
                color.b += (b - color.b) * alpha;
            }
        }
    }
    spine.RGBTimeline = RGBTimeline;
    class AlphaTimeline extends CurveTimeline1 {
        constructor(frameCount, bezierCount, slotIndex) {
            super(frameCount, bezierCount, Property.alpha + "|" + slotIndex);
            this.slotIndex = 0;
            this.slotIndex = slotIndex;
        }
        apply(skeleton, lastTime, time, events, alpha, blend, direction) {
            let slot = skeleton.slots[this.slotIndex];
            if (!slot.bone.active)
                return;
            let color = slot.color;
            if (time < this.frames[0]) {
                let setup = slot.data.color;
                switch (blend) {
                    case MixBlend.setup:
                        color.a = setup.a;
                        return;
                    case MixBlend.first:
                        color.a += (setup.a - color.a) * alpha;
                }
                return;
            }
            let a = this.getCurveValue(time);
            if (alpha == 1)
                color.a = a;
            else {
                if (blend == MixBlend.setup)
                    color.a = slot.data.color.a;
                color.a += (a - color.a) * alpha;
            }
        }
    }
    spine.AlphaTimeline = AlphaTimeline;
    class RGBA2Timeline extends CurveTimeline {
        constructor(frameCount, bezierCount, slotIndex) {
            super(frameCount, bezierCount, [
                Property.rgb + "|" + slotIndex,
                Property.alpha + "|" + slotIndex,
                Property.rgb2 + "|" + slotIndex
            ]);
            this.slotIndex = 0;
            this.slotIndex = slotIndex;
        }
        getFrameEntries() {
            return 8;
        }
        setFrame(frame, time, r, g, b, a, r2, g2, b2) {
            frame <<= 3;
            this.frames[frame] = time;
            this.frames[frame + 1] = r;
            this.frames[frame + 2] = g;
            this.frames[frame + 3] = b;
            this.frames[frame + 4] = a;
            this.frames[frame + 5] = r2;
            this.frames[frame + 6] = g2;
            this.frames[frame + 7] = b2;
        }
        apply(skeleton, lastTime, time, events, alpha, blend, direction) {
            let slot = skeleton.slots[this.slotIndex];
            if (!slot.bone.active)
                return;
            let frames = this.frames;
            let light = slot.color, dark = slot.darkColor;
            if (time < frames[0]) {
                let setupLight = slot.data.color, setupDark = slot.data.darkColor;
                switch (blend) {
                    case MixBlend.setup:
                        light.setFromColor(setupLight);
                        dark.r = setupDark.r;
                        dark.g = setupDark.g;
                        dark.b = setupDark.b;
                        return;
                    case MixBlend.first:
                        light.add((setupLight.r - light.r) * alpha, (setupLight.g - light.g) * alpha, (setupLight.b - light.b) * alpha, (setupLight.a - light.a) * alpha);
                        dark.r += (setupDark.r - dark.r) * alpha;
                        dark.g += (setupDark.g - dark.g) * alpha;
                        dark.b += (setupDark.b - dark.b) * alpha;
                }
                return;
            }
            let r = 0, g = 0, b = 0, a = 0, r2 = 0, g2 = 0, b2 = 0;
            let i = Timeline.search(frames, time, 8);
            let curveType = this.curves[i >> 3];
            switch (curveType) {
                case 0:
                    let before = frames[i];
                    r = frames[i + 1];
                    g = frames[i + 2];
                    b = frames[i + 3];
                    a = frames[i + 4];
                    r2 = frames[i + 5];
                    g2 = frames[i + 6];
                    b2 = frames[i + 7];
                    let t = (time - before) / (frames[i + 8] - before);
                    r += (frames[i + 8 + 1] - r) * t;
                    g += (frames[i + 8 + 2] - g) * t;
                    b += (frames[i + 8 + 3] - b) * t;
                    a += (frames[i + 8 + 4] - a) * t;
                    r2 += (frames[i + 8 + 5] - r2) * t;
                    g2 += (frames[i + 8 + 6] - g2) * t;
                    b2 += (frames[i + 8 + 7] - b2) * t;
                    break;
                case 1:
                    r = frames[i + 1];
                    g = frames[i + 2];
                    b = frames[i + 3];
                    a = frames[i + 4];
                    r2 = frames[i + 5];
                    g2 = frames[i + 6];
                    b2 = frames[i + 7];
                    break;
                default:
                    r = this.getBezierValue(time, i, 1, curveType - 2);
                    g = this.getBezierValue(time, i, 2, curveType + 18 - 2);
                    b = this.getBezierValue(time, i, 3, curveType + 18 * 2 - 2);
                    a = this.getBezierValue(time, i, 4, curveType + 18 * 3 - 2);
                    r2 = this.getBezierValue(time, i, 5, curveType + 18 * 4 - 2);
                    g2 = this.getBezierValue(time, i, 6, curveType + 18 * 5 - 2);
                    b2 = this.getBezierValue(time, i, 7, curveType + 18 * 6 - 2);
            }
            if (alpha == 1) {
                light.set(r, g, b, a);
                dark.r = r2;
                dark.g = g2;
                dark.b = b2;
            }
            else {
                if (blend == MixBlend.setup) {
                    light.setFromColor(slot.data.color);
                    let setupDark = slot.data.darkColor;
                    dark.r = setupDark.r;
                    dark.g = setupDark.g;
                    dark.b = setupDark.b;
                }
                light.add((r - light.r) * alpha, (g - light.g) * alpha, (b - light.b) * alpha, (a - light.a) * alpha);
                dark.r += (r2 - dark.r) * alpha;
                dark.g += (g2 - dark.g) * alpha;
                dark.b += (b2 - dark.b) * alpha;
            }
        }
    }
    spine.RGBA2Timeline = RGBA2Timeline;
    class RGB2Timeline extends CurveTimeline {
        constructor(frameCount, bezierCount, slotIndex) {
            super(frameCount, bezierCount, [
                Property.rgb + "|" + slotIndex,
                Property.rgb2 + "|" + slotIndex
            ]);
            this.slotIndex = 0;
            this.slotIndex = slotIndex;
        }
        getFrameEntries() {
            return 7;
        }
        setFrame(frame, time, r, g, b, r2, g2, b2) {
            frame *= 7;
            this.frames[frame] = time;
            this.frames[frame + 1] = r;
            this.frames[frame + 2] = g;
            this.frames[frame + 3] = b;
            this.frames[frame + 4] = r2;
            this.frames[frame + 5] = g2;
            this.frames[frame + 6] = b2;
        }
        apply(skeleton, lastTime, time, events, alpha, blend, direction) {
            let slot = skeleton.slots[this.slotIndex];
            if (!slot.bone.active)
                return;
            let frames = this.frames;
            let light = slot.color, dark = slot.darkColor;
            if (time < frames[0]) {
                let setupLight = slot.data.color, setupDark = slot.data.darkColor;
                switch (blend) {
                    case MixBlend.setup:
                        light.r = setupLight.r;
                        light.g = setupLight.g;
                        light.b = setupLight.b;
                        dark.r = setupDark.r;
                        dark.g = setupDark.g;
                        dark.b = setupDark.b;
                        return;
                    case MixBlend.first:
                        light.r += (setupLight.r - light.r) * alpha;
                        light.g += (setupLight.g - light.g) * alpha;
                        light.b += (setupLight.b - light.b) * alpha;
                        dark.r += (setupDark.r - dark.r) * alpha;
                        dark.g += (setupDark.g - dark.g) * alpha;
                        dark.b += (setupDark.b - dark.b) * alpha;
                }
                return;
            }
            let r = 0, g = 0, b = 0, a = 0, r2 = 0, g2 = 0, b2 = 0;
            let i = Timeline.search(frames, time, 7);
            let curveType = this.curves[i / 7];
            switch (curveType) {
                case 0:
                    let before = frames[i];
                    r = frames[i + 1];
                    g = frames[i + 2];
                    b = frames[i + 3];
                    r2 = frames[i + 4];
                    g2 = frames[i + 5];
                    b2 = frames[i + 6];
                    let t = (time - before) / (frames[i + 7] - before);
                    r += (frames[i + 7 + 1] - r) * t;
                    g += (frames[i + 7 + 2] - g) * t;
                    b += (frames[i + 7 + 3] - b) * t;
                    r2 += (frames[i + 7 + 4] - r2) * t;
                    g2 += (frames[i + 7 + 5] - g2) * t;
                    b2 += (frames[i + 7 + 6] - b2) * t;
                    break;
                case 1:
                    r = frames[i + 1];
                    g = frames[i + 2];
                    b = frames[i + 3];
                    r2 = frames[i + 4];
                    g2 = frames[i + 5];
                    b2 = frames[i + 6];
                    break;
                default:
                    r = this.getBezierValue(time, i, 1, curveType - 2);
                    g = this.getBezierValue(time, i, 2, curveType + 18 - 2);
                    b = this.getBezierValue(time, i, 3, curveType + 18 * 2 - 2);
                    r2 = this.getBezierValue(time, i, 4, curveType + 18 * 3 - 2);
                    g2 = this.getBezierValue(time, i, 5, curveType + 18 * 4 - 2);
                    b2 = this.getBezierValue(time, i, 6, curveType + 18 * 5 - 2);
            }
            if (alpha == 1) {
                light.r = r;
                light.g = g;
                light.b = b;
                dark.r = r2;
                dark.g = g2;
                dark.b = b2;
            }
            else {
                if (blend == MixBlend.setup) {
                    let setupLight = slot.data.color, setupDark = slot.data.darkColor;
                    light.r = setupLight.r;
                    light.g = setupLight.g;
                    light.b = setupLight.b;
                    dark.r = setupDark.r;
                    dark.g = setupDark.g;
                    dark.b = setupDark.b;
                }
                light.r += (r - light.r) * alpha;
                light.g += (g - light.g) * alpha;
                light.b += (b - light.b) * alpha;
                dark.r += (r2 - dark.r) * alpha;
                dark.g += (g2 - dark.g) * alpha;
                dark.b += (b2 - dark.b) * alpha;
            }
        }
    }
    spine.RGB2Timeline = RGB2Timeline;
    class AttachmentTimeline extends Timeline {
        constructor(frameCount, slotIndex) {
            super(frameCount, [
                Property.attachment + "|" + slotIndex
            ]);
            this.slotIndex = 0;
            this.slotIndex = slotIndex;
            this.attachmentNames = new Array(frameCount);
        }
        getFrameCount() {
            return this.frames.length;
        }
        setFrame(frame, time, attachmentName) {
            this.frames[frame] = time;
            this.attachmentNames[frame] = attachmentName;
        }
        apply(skeleton, lastTime, time, events, alpha, blend, direction) {
            let slot = skeleton.slots[this.slotIndex];
            if (!slot.bone.active)
                return;
            if (direction == MixDirection.mixOut) {
                if (blend == MixBlend.setup)
                    this.setAttachment(skeleton, slot, slot.data.attachmentName);
                return;
            }
            if (time < this.frames[0]) {
                if (blend == MixBlend.setup || blend == MixBlend.first)
                    this.setAttachment(skeleton, slot, slot.data.attachmentName);
                return;
            }
            this.setAttachment(skeleton, slot, this.attachmentNames[Timeline.search1(this.frames, time)]);
        }
        setAttachment(skeleton, slot, attachmentName) {
            slot.setAttachment(!attachmentName ? null : skeleton.getAttachment(this.slotIndex, attachmentName));
        }
    }
    spine.AttachmentTimeline = AttachmentTimeline;
    class DeformTimeline extends CurveTimeline {
        constructor(frameCount, bezierCount, slotIndex, attachment) {
            super(frameCount, bezierCount, [
                Property.deform + "|" + slotIndex + "|" + attachment.id
            ]);
            this.slotIndex = 0;
            this.slotIndex = slotIndex;
            this.attachment = attachment;
            this.vertices = new Array(frameCount);
        }
        getFrameCount() {
            return this.frames.length;
        }
        setFrame(frame, time, vertices) {
            this.frames[frame] = time;
            this.vertices[frame] = vertices;
        }
        setBezier(bezier, frame, value, time1, value1, cx1, cy1, cx2, cy2, time2, value2) {
            let curves = this.curves;
            let i = this.getFrameCount() + bezier * 18;
            if (value == 0)
                curves[frame] = 2 + i;
            let tmpx = (time1 - cx1 * 2 + cx2) * 0.03, tmpy = cy2 * 0.03 - cy1 * 0.06;
            let dddx = ((cx1 - cx2) * 3 - time1 + time2) * 0.006, dddy = (cy1 - cy2 + 0.33333333) * 0.018;
            let ddx = tmpx * 2 + dddx, ddy = tmpy * 2 + dddy;
            let dx = (cx1 - time1) * 0.3 + tmpx + dddx * 0.16666667, dy = cy1 * 0.3 + tmpy + dddy * 0.16666667;
            let x = time1 + dx, y = dy;
            for (let n = i + 18; i < n; i += 2) {
                curves[i] = x;
                curves[i + 1] = y;
                dx += ddx;
                dy += ddy;
                ddx += dddx;
                ddy += dddy;
                x += dx;
                y += dy;
            }
        }
        getCurvePercent(time, frame) {
            let curves = this.curves;
            let i = curves[frame];
            switch (i) {
                case 0:
                    let x = this.frames[frame];
                    return (time - x) / (this.frames[frame + this.getFrameEntries()] - x);
                case 1:
                    return 0;
            }
            i -= 2;
            if (curves[i] > time) {
                let x = this.frames[frame];
                return curves[i + 1] * (time - x) / (curves[i] - x);
            }
            let n = i + 18;
            for (i += 2; i < n; i += 2) {
                if (curves[i] >= time) {
                    let x = curves[i - 2], y = curves[i - 1];
                    return y + (time - x) / (curves[i] - x) * (curves[i + 1] - y);
                }
            }
            let x = curves[n - 2], y = curves[n - 1];
            return y + (1 - y) * (time - x) / (this.frames[frame + this.getFrameEntries()] - x);
        }
        apply(skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
            let slot = skeleton.slots[this.slotIndex];
            if (!slot.bone.active)
                return;
            let slotAttachment = slot.getAttachment();
            if (!slotAttachment)
                return;
            if (!(slotAttachment instanceof spine.VertexAttachment) || slotAttachment.timelineAttachment != this.attachment)
                return;
            let deform = slot.deform;
            if (deform.length == 0)
                blend = MixBlend.setup;
            let vertices = this.vertices;
            let vertexCount = vertices[0].length;
            let frames = this.frames;
            if (time < frames[0]) {
                switch (blend) {
                    case MixBlend.setup:
                        deform.length = 0;
                        return;
                    case MixBlend.first:
                        if (alpha == 1) {
                            deform.length = 0;
                            return;
                        }
                        deform.length = vertexCount;
                        let vertexAttachment = slotAttachment;
                        if (!vertexAttachment.bones) {
                            let setupVertices = vertexAttachment.vertices;
                            for (var i = 0; i < vertexCount; i++)
                                deform[i] += (setupVertices[i] - deform[i]) * alpha;
                        }
                        else {
                            alpha = 1 - alpha;
                            for (var i = 0; i < vertexCount; i++)
                                deform[i] *= alpha;
                        }
                }
                return;
            }
            deform.length = vertexCount;
            if (time >= frames[frames.length - 1]) {
                let lastVertices = vertices[frames.length - 1];
                if (alpha == 1) {
                    if (blend == MixBlend.add) {
                        let vertexAttachment = slotAttachment;
                        if (!vertexAttachment.bones) {
                            let setupVertices = vertexAttachment.vertices;
                            for (let i = 0; i < vertexCount; i++)
                                deform[i] += lastVertices[i] - setupVertices[i];
                        }
                        else {
                            for (let i = 0; i < vertexCount; i++)
                                deform[i] += lastVertices[i];
                        }
                    }
                    else
                        spine.Utils.arrayCopy(lastVertices, 0, deform, 0, vertexCount);
                }
                else {
                    switch (blend) {
                        case MixBlend.setup: {
                            let vertexAttachment = slotAttachment;
                            if (!vertexAttachment.bones) {
                                let setupVertices = vertexAttachment.vertices;
                                for (let i = 0; i < vertexCount; i++) {
                                    let setup = setupVertices[i];
                                    deform[i] = setup + (lastVertices[i] - setup) * alpha;
                                }
                            }
                            else {
                                for (let i = 0; i < vertexCount; i++)
                                    deform[i] = lastVertices[i] * alpha;
                            }
                            break;
                        }
                        case MixBlend.first:
                        case MixBlend.replace:
                            for (let i = 0; i < vertexCount; i++)
                                deform[i] += (lastVertices[i] - deform[i]) * alpha;
                            break;
                        case MixBlend.add:
                            let vertexAttachment = slotAttachment;
                            if (!vertexAttachment.bones) {
                                let setupVertices = vertexAttachment.vertices;
                                for (let i = 0; i < vertexCount; i++)
                                    deform[i] += (lastVertices[i] - setupVertices[i]) * alpha;
                            }
                            else {
                                for (let i = 0; i < vertexCount; i++)
                                    deform[i] += lastVertices[i] * alpha;
                            }
                    }
                }
                return;
            }
            let frame = Timeline.search1(frames, time);
            let percent = this.getCurvePercent(time, frame);
            let prevVertices = vertices[frame];
            let nextVertices = vertices[frame + 1];
            if (alpha == 1) {
                if (blend == MixBlend.add) {
                    let vertexAttachment = slotAttachment;
                    if (!vertexAttachment.bones) {
                        let setupVertices = vertexAttachment.vertices;
                        for (let i = 0; i < vertexCount; i++) {
                            let prev = prevVertices[i];
                            deform[i] += prev + (nextVertices[i] - prev) * percent - setupVertices[i];
                        }
                    }
                    else {
                        for (let i = 0; i < vertexCount; i++) {
                            let prev = prevVertices[i];
                            deform[i] += prev + (nextVertices[i] - prev) * percent;
                        }
                    }
                }
                else {
                    for (let i = 0; i < vertexCount; i++) {
                        let prev = prevVertices[i];
                        deform[i] = prev + (nextVertices[i] - prev) * percent;
                    }
                }
            }
            else {
                switch (blend) {
                    case MixBlend.setup: {
                        let vertexAttachment = slotAttachment;
                        if (!vertexAttachment.bones) {
                            let setupVertices = vertexAttachment.vertices;
                            for (let i = 0; i < vertexCount; i++) {
                                let prev = prevVertices[i], setup = setupVertices[i];
                                deform[i] = setup + (prev + (nextVertices[i] - prev) * percent - setup) * alpha;
                            }
                        }
                        else {
                            for (let i = 0; i < vertexCount; i++) {
                                let prev = prevVertices[i];
                                deform[i] = (prev + (nextVertices[i] - prev) * percent) * alpha;
                            }
                        }
                        break;
                    }
                    case MixBlend.first:
                    case MixBlend.replace:
                        for (let i = 0; i < vertexCount; i++) {
                            let prev = prevVertices[i];
                            deform[i] += (prev + (nextVertices[i] - prev) * percent - deform[i]) * alpha;
                        }
                        break;
                    case MixBlend.add:
                        let vertexAttachment = slotAttachment;
                        if (!vertexAttachment.bones) {
                            let setupVertices = vertexAttachment.vertices;
                            for (let i = 0; i < vertexCount; i++) {
                                let prev = prevVertices[i];
                                deform[i] += (prev + (nextVertices[i] - prev) * percent - setupVertices[i]) * alpha;
                            }
                        }
                        else {
                            for (let i = 0; i < vertexCount; i++) {
                                let prev = prevVertices[i];
                                deform[i] += (prev + (nextVertices[i] - prev) * percent) * alpha;
                            }
                        }
                }
            }
        }
    }
    spine.DeformTimeline = DeformTimeline;
    class EventTimeline extends Timeline {
        constructor(frameCount) {
            super(frameCount, EventTimeline.propertyIds);
            this.events = new Array(frameCount);
        }
        getFrameCount() {
            return this.frames.length;
        }
        setFrame(frame, event) {
            this.frames[frame] = event.time;
            this.events[frame] = event;
        }
        apply(skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
            if (!firedEvents)
                return;
            let frames = this.frames;
            let frameCount = this.frames.length;
            if (lastTime > time) {
                this.apply(skeleton, lastTime, Number.MAX_VALUE, firedEvents, alpha, blend, direction);
                lastTime = -1;
            }
            else if (lastTime >= frames[frameCount - 1])
                return;
            if (time < frames[0])
                return;
            let i = 0;
            if (lastTime < frames[0])
                i = 0;
            else {
                i = Timeline.search1(frames, lastTime) + 1;
                let frameTime = frames[i];
                while (i > 0) {
                    if (frames[i - 1] != frameTime)
                        break;
                    i--;
                }
            }
            for (; i < frameCount && time >= frames[i]; i++)
                firedEvents.push(this.events[i]);
        }
    }
    EventTimeline.propertyIds = ["" + Property.event];
    spine.EventTimeline = EventTimeline;
    class DrawOrderTimeline extends Timeline {
        constructor(frameCount) {
            super(frameCount, DrawOrderTimeline.propertyIds);
            this.drawOrders = new Array(frameCount);
        }
        getFrameCount() {
            return this.frames.length;
        }
        setFrame(frame, time, drawOrder) {
            this.frames[frame] = time;
            this.drawOrders[frame] = drawOrder;
        }
        apply(skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
            if (direction == MixDirection.mixOut) {
                if (blend == MixBlend.setup)
                    spine.Utils.arrayCopy(skeleton.slots, 0, skeleton.drawOrder, 0, skeleton.slots.length);
                return;
            }
            if (time < this.frames[0]) {
                if (blend == MixBlend.setup || blend == MixBlend.first)
                    spine.Utils.arrayCopy(skeleton.slots, 0, skeleton.drawOrder, 0, skeleton.slots.length);
                return;
            }
            let idx = Timeline.search1(this.frames, time);
            let drawOrderToSetupIndex = this.drawOrders[idx];
            if (!drawOrderToSetupIndex)
                spine.Utils.arrayCopy(skeleton.slots, 0, skeleton.drawOrder, 0, skeleton.slots.length);
            else {
                let drawOrder = skeleton.drawOrder;
                let slots = skeleton.slots;
                for (let i = 0, n = drawOrderToSetupIndex.length; i < n; i++)
                    drawOrder[i] = slots[drawOrderToSetupIndex[i]];
            }
        }
    }
    DrawOrderTimeline.propertyIds = ["" + Property.drawOrder];
    spine.DrawOrderTimeline = DrawOrderTimeline;
    class IkConstraintTimeline extends CurveTimeline {
        constructor(frameCount, bezierCount, ikConstraintIndex) {
            super(frameCount, bezierCount, [
                Property.ikConstraint + "|" + ikConstraintIndex
            ]);
            this.constraintIndex = 0;
            this.constraintIndex = ikConstraintIndex;
        }
        getFrameEntries() {
            return 6;
        }
        setFrame(frame, time, mix, softness, bendDirection, compress, stretch) {
            frame *= 6;
            this.frames[frame] = time;
            this.frames[frame + 1] = mix;
            this.frames[frame + 2] = softness;
            this.frames[frame + 3] = bendDirection;
            this.frames[frame + 4] = compress ? 1 : 0;
            this.frames[frame + 5] = stretch ? 1 : 0;
        }
        apply(skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
            let constraint = skeleton.ikConstraints[this.constraintIndex];
            if (!constraint.active)
                return;
            let frames = this.frames;
            if (time < frames[0]) {
                switch (blend) {
                    case MixBlend.setup:
                        constraint.mix = constraint.data.mix;
                        constraint.softness = constraint.data.softness;
                        constraint.bendDirection = constraint.data.bendDirection;
                        constraint.compress = constraint.data.compress;
                        constraint.stretch = constraint.data.stretch;
                        return;
                    case MixBlend.first:
                        constraint.mix += (constraint.data.mix - constraint.mix) * alpha;
                        constraint.softness += (constraint.data.softness - constraint.softness) * alpha;
                        constraint.bendDirection = constraint.data.bendDirection;
                        constraint.compress = constraint.data.compress;
                        constraint.stretch = constraint.data.stretch;
                }
                return;
            }
            let mix = 0, softness = 0;
            let i = Timeline.search(frames, time, 6);
            let curveType = this.curves[i / 6];
            switch (curveType) {
                case 0:
                    let before = frames[i];
                    mix = frames[i + 1];
                    softness = frames[i + 2];
                    let t = (time - before) / (frames[i + 6] - before);
                    mix += (frames[i + 6 + 1] - mix) * t;
                    softness += (frames[i + 6 + 2] - softness) * t;
                    break;
                case 1:
                    mix = frames[i + 1];
                    softness = frames[i + 2];
                    break;
                default:
                    mix = this.getBezierValue(time, i, 1, curveType - 2);
                    softness = this.getBezierValue(time, i, 2, curveType + 18 - 2);
            }
            if (blend == MixBlend.setup) {
                constraint.mix = constraint.data.mix + (mix - constraint.data.mix) * alpha;
                constraint.softness = constraint.data.softness + (softness - constraint.data.softness) * alpha;
                if (direction == MixDirection.mixOut) {
                    constraint.bendDirection = constraint.data.bendDirection;
                    constraint.compress = constraint.data.compress;
                    constraint.stretch = constraint.data.stretch;
                }
                else {
                    constraint.bendDirection = frames[i + 3];
                    constraint.compress = frames[i + 4] != 0;
                    constraint.stretch = frames[i + 5] != 0;
                }
            }
            else {
                constraint.mix += (mix - constraint.mix) * alpha;
                constraint.softness += (softness - constraint.softness) * alpha;
                if (direction == MixDirection.mixIn) {
                    constraint.bendDirection = frames[i + 3];
                    constraint.compress = frames[i + 4] != 0;
                    constraint.stretch = frames[i + 5] != 0;
                }
            }
        }
    }
    spine.IkConstraintTimeline = IkConstraintTimeline;
    class TransformConstraintTimeline extends CurveTimeline {
        constructor(frameCount, bezierCount, transformConstraintIndex) {
            super(frameCount, bezierCount, [
                Property.transformConstraint + "|" + transformConstraintIndex
            ]);
            this.constraintIndex = 0;
            this.constraintIndex = transformConstraintIndex;
        }
        getFrameEntries() {
            return 7;
        }
        setFrame(frame, time, mixRotate, mixX, mixY, mixScaleX, mixScaleY, mixShearY) {
            let frames = this.frames;
            frame *= 7;
            frames[frame] = time;
            frames[frame + 1] = mixRotate;
            frames[frame + 2] = mixX;
            frames[frame + 3] = mixY;
            frames[frame + 4] = mixScaleX;
            frames[frame + 5] = mixScaleY;
            frames[frame + 6] = mixShearY;
        }
        apply(skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
            let constraint = skeleton.transformConstraints[this.constraintIndex];
            if (!constraint.active)
                return;
            let frames = this.frames;
            if (time < frames[0]) {
                let data = constraint.data;
                switch (blend) {
                    case MixBlend.setup:
                        constraint.mixRotate = data.mixRotate;
                        constraint.mixX = data.mixX;
                        constraint.mixY = data.mixY;
                        constraint.mixScaleX = data.mixScaleX;
                        constraint.mixScaleY = data.mixScaleY;
                        constraint.mixShearY = data.mixShearY;
                        return;
                    case MixBlend.first:
                        constraint.mixRotate += (data.mixRotate - constraint.mixRotate) * alpha;
                        constraint.mixX += (data.mixX - constraint.mixX) * alpha;
                        constraint.mixY += (data.mixY - constraint.mixY) * alpha;
                        constraint.mixScaleX += (data.mixScaleX - constraint.mixScaleX) * alpha;
                        constraint.mixScaleY += (data.mixScaleY - constraint.mixScaleY) * alpha;
                        constraint.mixShearY += (data.mixShearY - constraint.mixShearY) * alpha;
                }
                return;
            }
            let rotate, x, y, scaleX, scaleY, shearY;
            let i = Timeline.search(frames, time, 7);
            let curveType = this.curves[i / 7];
            switch (curveType) {
                case 0:
                    let before = frames[i];
                    rotate = frames[i + 1];
                    x = frames[i + 2];
                    y = frames[i + 3];
                    scaleX = frames[i + 4];
                    scaleY = frames[i + 5];
                    shearY = frames[i + 6];
                    let t = (time - before) / (frames[i + 7] - before);
                    rotate += (frames[i + 7 + 1] - rotate) * t;
                    x += (frames[i + 7 + 2] - x) * t;
                    y += (frames[i + 7 + 3] - y) * t;
                    scaleX += (frames[i + 7 + 4] - scaleX) * t;
                    scaleY += (frames[i + 7 + 5] - scaleY) * t;
                    shearY += (frames[i + 7 + 6] - shearY) * t;
                    break;
                case 1:
                    rotate = frames[i + 1];
                    x = frames[i + 2];
                    y = frames[i + 3];
                    scaleX = frames[i + 4];
                    scaleY = frames[i + 5];
                    shearY = frames[i + 6];
                    break;
                default:
                    rotate = this.getBezierValue(time, i, 1, curveType - 2);
                    x = this.getBezierValue(time, i, 2, curveType + 18 - 2);
                    y = this.getBezierValue(time, i, 3, curveType + 18 * 2 - 2);
                    scaleX = this.getBezierValue(time, i, 4, curveType + 18 * 3 - 2);
                    scaleY = this.getBezierValue(time, i, 5, curveType + 18 * 4 - 2);
                    shearY = this.getBezierValue(time, i, 6, curveType + 18 * 5 - 2);
            }
            if (blend == MixBlend.setup) {
                let data = constraint.data;
                constraint.mixRotate = data.mixRotate + (rotate - data.mixRotate) * alpha;
                constraint.mixX = data.mixX + (x - data.mixX) * alpha;
                constraint.mixY = data.mixY + (y - data.mixY) * alpha;
                constraint.mixScaleX = data.mixScaleX + (scaleX - data.mixScaleX) * alpha;
                constraint.mixScaleY = data.mixScaleY + (scaleY - data.mixScaleY) * alpha;
                constraint.mixShearY = data.mixShearY + (shearY - data.mixShearY) * alpha;
            }
            else {
                constraint.mixRotate += (rotate - constraint.mixRotate) * alpha;
                constraint.mixX += (x - constraint.mixX) * alpha;
                constraint.mixY += (y - constraint.mixY) * alpha;
                constraint.mixScaleX += (scaleX - constraint.mixScaleX) * alpha;
                constraint.mixScaleY += (scaleY - constraint.mixScaleY) * alpha;
                constraint.mixShearY += (shearY - constraint.mixShearY) * alpha;
            }
        }
    }
    spine.TransformConstraintTimeline = TransformConstraintTimeline;
    class PathConstraintPositionTimeline extends CurveTimeline1 {
        constructor(frameCount, bezierCount, pathConstraintIndex) {
            super(frameCount, bezierCount, Property.pathConstraintPosition + "|" + pathConstraintIndex);
            this.constraintIndex = 0;
            this.constraintIndex = pathConstraintIndex;
        }
        apply(skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
            let constraint = skeleton.pathConstraints[this.constraintIndex];
            if (constraint.active)
                constraint.position = this.getAbsoluteValue(time, alpha, blend, constraint.position, constraint.data.position);
        }
    }
    spine.PathConstraintPositionTimeline = PathConstraintPositionTimeline;
    class PathConstraintSpacingTimeline extends CurveTimeline1 {
        constructor(frameCount, bezierCount, pathConstraintIndex) {
            super(frameCount, bezierCount, Property.pathConstraintSpacing + "|" + pathConstraintIndex);
            this.constraintIndex = 0;
            this.constraintIndex = pathConstraintIndex;
        }
        apply(skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
            let constraint = skeleton.pathConstraints[this.constraintIndex];
            if (constraint.active)
                constraint.spacing = this.getAbsoluteValue(time, alpha, blend, constraint.spacing, constraint.data.spacing);
        }
    }
    spine.PathConstraintSpacingTimeline = PathConstraintSpacingTimeline;
    class PathConstraintMixTimeline extends CurveTimeline {
        constructor(frameCount, bezierCount, pathConstraintIndex) {
            super(frameCount, bezierCount, [
                Property.pathConstraintMix + "|" + pathConstraintIndex
            ]);
            this.constraintIndex = 0;
            this.constraintIndex = pathConstraintIndex;
        }
        getFrameEntries() {
            return 4;
        }
        setFrame(frame, time, mixRotate, mixX, mixY) {
            let frames = this.frames;
            frame <<= 2;
            frames[frame] = time;
            frames[frame + 1] = mixRotate;
            frames[frame + 2] = mixX;
            frames[frame + 3] = mixY;
        }
        apply(skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
            let constraint = skeleton.pathConstraints[this.constraintIndex];
            if (!constraint.active)
                return;
            let frames = this.frames;
            if (time < frames[0]) {
                switch (blend) {
                    case MixBlend.setup:
                        constraint.mixRotate = constraint.data.mixRotate;
                        constraint.mixX = constraint.data.mixX;
                        constraint.mixY = constraint.data.mixY;
                        return;
                    case MixBlend.first:
                        constraint.mixRotate += (constraint.data.mixRotate - constraint.mixRotate) * alpha;
                        constraint.mixX += (constraint.data.mixX - constraint.mixX) * alpha;
                        constraint.mixY += (constraint.data.mixY - constraint.mixY) * alpha;
                }
                return;
            }
            let rotate, x, y;
            let i = Timeline.search(frames, time, 4);
            let curveType = this.curves[i >> 2];
            switch (curveType) {
                case 0:
                    let before = frames[i];
                    rotate = frames[i + 1];
                    x = frames[i + 2];
                    y = frames[i + 3];
                    let t = (time - before) / (frames[i + 4] - before);
                    rotate += (frames[i + 4 + 1] - rotate) * t;
                    x += (frames[i + 4 + 2] - x) * t;
                    y += (frames[i + 4 + 3] - y) * t;
                    break;
                case 1:
                    rotate = frames[i + 1];
                    x = frames[i + 2];
                    y = frames[i + 3];
                    break;
                default:
                    rotate = this.getBezierValue(time, i, 1, curveType - 2);
                    x = this.getBezierValue(time, i, 2, curveType + 18 - 2);
                    y = this.getBezierValue(time, i, 3, curveType + 18 * 2 - 2);
            }
            if (blend == MixBlend.setup) {
                let data = constraint.data;
                constraint.mixRotate = data.mixRotate + (rotate - data.mixRotate) * alpha;
                constraint.mixX = data.mixX + (x - data.mixX) * alpha;
                constraint.mixY = data.mixY + (y - data.mixY) * alpha;
            }
            else {
                constraint.mixRotate += (rotate - constraint.mixRotate) * alpha;
                constraint.mixX += (x - constraint.mixX) * alpha;
                constraint.mixY += (y - constraint.mixY) * alpha;
            }
        }
    }
    spine.PathConstraintMixTimeline = PathConstraintMixTimeline;
    class PhysicsConstraintTimeline extends CurveTimeline1 {
        constructor(frameCount, bezierCount, physicsConstraintIndex, property) {
            super(frameCount, bezierCount, property + "|" + physicsConstraintIndex);
            this.constraintIndex = 0;
            this.constraintIndex = physicsConstraintIndex;
        }
        apply(skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
            let constraint;
            if (this.constraintIndex == -1) {
                const value = time >= this.frames[0] ? this.getCurveValue(time) : 0;
                for (const constraint of skeleton.physicsConstraints) {
                    if (constraint.active && this.global(constraint.data))
                        this.set(constraint, this.getAbsoluteValue2(time, alpha, blend, this.get(constraint), this.setup(constraint), value));
                }
            }
            else {
                constraint = skeleton.physicsConstraints[this.constraintIndex];
                if (constraint.active)
                    this.set(constraint, this.getAbsoluteValue(time, alpha, blend, this.get(constraint), this.setup(constraint)));
            }
        }
    }
    spine.PhysicsConstraintTimeline = PhysicsConstraintTimeline;
    class PhysicsConstraintInertiaTimeline extends PhysicsConstraintTimeline {
        constructor(frameCount, bezierCount, physicsConstraintIndex) {
            super(frameCount, bezierCount, physicsConstraintIndex, Property.physicsConstraintInertia);
        }
        setup(constraint) {
            return constraint.data.inertia;
        }
        get(constraint) {
            return constraint.inertia;
        }
        set(constraint, value) {
            constraint.inertia = value;
        }
        global(constraint) {
            return constraint.inertiaGlobal;
        }
    }
    spine.PhysicsConstraintInertiaTimeline = PhysicsConstraintInertiaTimeline;
    class PhysicsConstraintStrengthTimeline extends PhysicsConstraintTimeline {
        constructor(frameCount, bezierCount, physicsConstraintIndex) {
            super(frameCount, bezierCount, physicsConstraintIndex, Property.physicsConstraintStrength);
        }
        setup(constraint) {
            return constraint.data.strength;
        }
        get(constraint) {
            return constraint.strength;
        }
        set(constraint, value) {
            constraint.strength = value;
        }
        global(constraint) {
            return constraint.strengthGlobal;
        }
    }
    spine.PhysicsConstraintStrengthTimeline = PhysicsConstraintStrengthTimeline;
    class PhysicsConstraintDampingTimeline extends PhysicsConstraintTimeline {
        constructor(frameCount, bezierCount, physicsConstraintIndex) {
            super(frameCount, bezierCount, physicsConstraintIndex, Property.physicsConstraintDamping);
        }
        setup(constraint) {
            return constraint.data.damping;
        }
        get(constraint) {
            return constraint.damping;
        }
        set(constraint, value) {
            constraint.damping = value;
        }
        global(constraint) {
            return constraint.dampingGlobal;
        }
    }
    spine.PhysicsConstraintDampingTimeline = PhysicsConstraintDampingTimeline;
    class PhysicsConstraintMassTimeline extends PhysicsConstraintTimeline {
        constructor(frameCount, bezierCount, physicsConstraintIndex) {
            super(frameCount, bezierCount, physicsConstraintIndex, Property.physicsConstraintMass);
        }
        setup(constraint) {
            return 1 / constraint.data.massInverse;
        }
        get(constraint) {
            return 1 / constraint.massInverse;
        }
        set(constraint, value) {
            constraint.massInverse = 1 / value;
        }
        global(constraint) {
            return constraint.massGlobal;
        }
    }
    spine.PhysicsConstraintMassTimeline = PhysicsConstraintMassTimeline;
    class PhysicsConstraintWindTimeline extends PhysicsConstraintTimeline {
        constructor(frameCount, bezierCount, physicsConstraintIndex) {
            super(frameCount, bezierCount, physicsConstraintIndex, Property.physicsConstraintWind);
        }
        setup(constraint) {
            return constraint.data.wind;
        }
        get(constraint) {
            return constraint.wind;
        }
        set(constraint, value) {
            constraint.wind = value;
        }
        global(constraint) {
            return constraint.windGlobal;
        }
    }
    spine.PhysicsConstraintWindTimeline = PhysicsConstraintWindTimeline;
    class PhysicsConstraintGravityTimeline extends PhysicsConstraintTimeline {
        constructor(frameCount, bezierCount, physicsConstraintIndex) {
            super(frameCount, bezierCount, physicsConstraintIndex, Property.physicsConstraintGravity);
        }
        setup(constraint) {
            return constraint.data.gravity;
        }
        get(constraint) {
            return constraint.gravity;
        }
        set(constraint, value) {
            constraint.gravity = value;
        }
        global(constraint) {
            return constraint.gravityGlobal;
        }
    }
    spine.PhysicsConstraintGravityTimeline = PhysicsConstraintGravityTimeline;
    class PhysicsConstraintMixTimeline extends PhysicsConstraintTimeline {
        constructor(frameCount, bezierCount, physicsConstraintIndex) {
            super(frameCount, bezierCount, physicsConstraintIndex, Property.physicsConstraintMix);
        }
        setup(constraint) {
            return constraint.data.mix;
        }
        get(constraint) {
            return constraint.mix;
        }
        set(constraint, value) {
            constraint.mix = value;
        }
        global(constraint) {
            return constraint.mixGlobal;
        }
    }
    spine.PhysicsConstraintMixTimeline = PhysicsConstraintMixTimeline;
    class PhysicsConstraintResetTimeline extends Timeline {
        constructor(frameCount, physicsConstraintIndex) {
            super(frameCount, PhysicsConstraintResetTimeline.propertyIds);
            this.constraintIndex = physicsConstraintIndex;
        }
        getFrameCount() {
            return this.frames.length;
        }
        setFrame(frame, time) {
            this.frames[frame] = time;
        }
        apply(skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
            let constraint;
            if (this.constraintIndex != -1) {
                constraint = skeleton.physicsConstraints[this.constraintIndex];
                if (!constraint.active)
                    return;
            }
            const frames = this.frames;
            if (lastTime > time) {
                this.apply(skeleton, lastTime, Number.MAX_VALUE, [], alpha, blend, direction);
                lastTime = -1;
            }
            else if (lastTime >= frames[frames.length - 1])
                return;
            if (time < frames[0])
                return;
            if (lastTime < frames[0] || time >= frames[Timeline.search1(frames, lastTime) + 1]) {
                if (constraint != null)
                    constraint.reset();
                else {
                    for (const constraint of skeleton.physicsConstraints) {
                        if (constraint.active)
                            constraint.reset();
                    }
                }
            }
        }
    }
    PhysicsConstraintResetTimeline.propertyIds = [Property.physicsConstraintReset.toString()];
    spine.PhysicsConstraintResetTimeline = PhysicsConstraintResetTimeline;
    class SequenceTimeline extends Timeline {
        constructor(frameCount, slotIndex, attachment) {
            super(frameCount, [
                Property.sequence + "|" + slotIndex + "|" + attachment.sequence.id
            ]);
            this.slotIndex = slotIndex;
            this.attachment = attachment;
        }
        getFrameEntries() {
            return SequenceTimeline.ENTRIES;
        }
        getSlotIndex() {
            return this.slotIndex;
        }
        getAttachment() {
            return this.attachment;
        }
        setFrame(frame, time, mode, index, delay) {
            let frames = this.frames;
            frame *= SequenceTimeline.ENTRIES;
            frames[frame] = time;
            frames[frame + SequenceTimeline.MODE] = mode | (index << 4);
            frames[frame + SequenceTimeline.DELAY] = delay;
        }
        apply(skeleton, lastTime, time, events, alpha, blend, direction) {
            let slot = skeleton.slots[this.slotIndex];
            if (!slot.bone.active)
                return;
            let slotAttachment = slot.attachment;
            let attachment = this.attachment;
            if (slotAttachment != attachment) {
                if (!(slotAttachment instanceof spine.VertexAttachment)
                    || slotAttachment.timelineAttachment != attachment)
                    return;
            }
            let frames = this.frames;
            if (time < frames[0]) {
                if (blend == MixBlend.setup || blend == MixBlend.first)
                    slot.sequenceIndex = -1;
                return;
            }
            let i = Timeline.search(frames, time, SequenceTimeline.ENTRIES);
            let before = frames[i];
            let modeAndIndex = frames[i + SequenceTimeline.MODE];
            let delay = frames[i + SequenceTimeline.DELAY];
            if (!this.attachment.sequence)
                return;
            let index = modeAndIndex >> 4, count = this.attachment.sequence.regions.length;
            let mode = spine.SequenceModeValues[modeAndIndex & 0xf];
            if (mode != spine.SequenceMode.hold) {
                index += (((time - before) / delay + 0.00001) | 0);
                switch (mode) {
                    case spine.SequenceMode.once:
                        index = Math.min(count - 1, index);
                        break;
                    case spine.SequenceMode.loop:
                        index %= count;
                        break;
                    case spine.SequenceMode.pingpong: {
                        let n = (count << 1) - 2;
                        index = n == 0 ? 0 : index % n;
                        if (index >= count)
                            index = n - index;
                        break;
                    }
                    case spine.SequenceMode.onceReverse:
                        index = Math.max(count - 1 - index, 0);
                        break;
                    case spine.SequenceMode.loopReverse:
                        index = count - 1 - (index % count);
                        break;
                    case spine.SequenceMode.pingpongReverse: {
                        let n = (count << 1) - 2;
                        index = n == 0 ? 0 : (index + count - 1) % n;
                        if (index >= count)
                            index = n - index;
                    }
                }
            }
            slot.sequenceIndex = index;
        }
    }
    SequenceTimeline.ENTRIES = 3;
    SequenceTimeline.MODE = 1;
    SequenceTimeline.DELAY = 2;
    spine.SequenceTimeline = SequenceTimeline;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class AnimationState {
        constructor(data) {
            this.tracks = new Array();
            this.timeScale = 1;
            this.unkeyedState = 0;
            this.events = new Array();
            this.listeners = new Array();
            this.queue = new EventQueue(this);
            this.propertyIDs = new spine.StringSet();
            this.animationsChanged = false;
            this.trackEntryPool = new spine.Pool(() => new TrackEntry());
            this.data = data;
        }
        static emptyAnimation() {
            return AnimationState._emptyAnimation;
        }
        update(delta) {
            delta *= this.timeScale;
            let tracks = this.tracks;
            for (let i = 0, n = tracks.length; i < n; i++) {
                let current = tracks[i];
                if (!current)
                    continue;
                current.animationLast = current.nextAnimationLast;
                current.trackLast = current.nextTrackLast;
                let currentDelta = delta * current.timeScale;
                if (current.delay > 0) {
                    current.delay -= currentDelta;
                    if (current.delay > 0)
                        continue;
                    currentDelta = -current.delay;
                    current.delay = 0;
                }
                let next = current.next;
                if (next) {
                    let nextTime = current.trackLast - next.delay;
                    if (nextTime >= 0) {
                        next.delay = 0;
                        next.trackTime += current.timeScale == 0 ? 0 : (nextTime / current.timeScale + delta) * next.timeScale;
                        current.trackTime += currentDelta;
                        this.setCurrent(i, next, true);
                        while (next.mixingFrom) {
                            next.mixTime += delta;
                            next = next.mixingFrom;
                        }
                        continue;
                    }
                }
                else if (current.trackLast >= current.trackEnd && !current.mixingFrom) {
                    tracks[i] = null;
                    this.queue.end(current);
                    this.clearNext(current);
                    continue;
                }
                if (current.mixingFrom && this.updateMixingFrom(current, delta)) {
                    let from = current.mixingFrom;
                    current.mixingFrom = null;
                    if (from)
                        from.mixingTo = null;
                    while (from) {
                        this.queue.end(from);
                        from = from.mixingFrom;
                    }
                }
                current.trackTime += currentDelta;
            }
            this.queue.drain();
        }
        updateMixingFrom(to, delta) {
            let from = to.mixingFrom;
            if (!from)
                return true;
            let finished = this.updateMixingFrom(from, delta);
            from.animationLast = from.nextAnimationLast;
            from.trackLast = from.nextTrackLast;
            if (to.mixTime > 0 && to.mixTime >= to.mixDuration) {
                if (from.totalAlpha == 0 || to.mixDuration == 0) {
                    to.mixingFrom = from.mixingFrom;
                    if (from.mixingFrom)
                        from.mixingFrom.mixingTo = to;
                    to.interruptAlpha = from.interruptAlpha;
                    this.queue.end(from);
                }
                return finished;
            }
            from.trackTime += delta * from.timeScale;
            to.mixTime += delta;
            return false;
        }
        apply(skeleton) {
            if (!skeleton)
                throw new Error("skeleton cannot be null.");
            if (this.animationsChanged)
                this._animationsChanged();
            let events = this.events;
            let tracks = this.tracks;
            let applied = false;
            for (let i = 0, n = tracks.length; i < n; i++) {
                let current = tracks[i];
                if (!current || current.delay > 0)
                    continue;
                applied = true;
                let blend = i == 0 ? spine.MixBlend.first : current.mixBlend;
                let alpha = current.alpha;
                if (current.mixingFrom)
                    alpha *= this.applyMixingFrom(current, skeleton, blend);
                else if (current.trackTime >= current.trackEnd && !current.next)
                    alpha = 0;
                let attachments = alpha >= current.alphaAttachmentThreshold;
                let animationLast = current.animationLast, animationTime = current.getAnimationTime(), applyTime = animationTime;
                let applyEvents = events;
                if (current.reverse) {
                    applyTime = current.animation.duration - applyTime;
                    applyEvents = null;
                }
                let timelines = current.animation.timelines;
                let timelineCount = timelines.length;
                if ((i == 0 && alpha == 1) || blend == spine.MixBlend.add) {
                    if (i == 0)
                        attachments = true;
                    for (let ii = 0; ii < timelineCount; ii++) {
                        spine.Utils.webkit602BugfixHelper(alpha, blend);
                        var timeline = timelines[ii];
                        if (timeline instanceof spine.AttachmentTimeline)
                            this.applyAttachmentTimeline(timeline, skeleton, applyTime, blend, attachments);
                        else
                            timeline.apply(skeleton, animationLast, applyTime, applyEvents, alpha, blend, spine.MixDirection.mixIn);
                    }
                }
                else {
                    let timelineMode = current.timelineMode;
                    let shortestRotation = current.shortestRotation;
                    let firstFrame = !shortestRotation && current.timelinesRotation.length != timelineCount << 1;
                    if (firstFrame)
                        current.timelinesRotation.length = timelineCount << 1;
                    for (let ii = 0; ii < timelineCount; ii++) {
                        let timeline = timelines[ii];
                        let timelineBlend = timelineMode[ii] == spine.SUBSEQUENT ? blend : spine.MixBlend.setup;
                        if (!shortestRotation && timeline instanceof spine.RotateTimeline) {
                            this.applyRotateTimeline(timeline, skeleton, applyTime, alpha, timelineBlend, current.timelinesRotation, ii << 1, firstFrame);
                        }
                        else if (timeline instanceof spine.AttachmentTimeline) {
                            this.applyAttachmentTimeline(timeline, skeleton, applyTime, blend, attachments);
                        }
                        else {
                            spine.Utils.webkit602BugfixHelper(alpha, blend);
                            timeline.apply(skeleton, animationLast, applyTime, applyEvents, alpha, timelineBlend, spine.MixDirection.mixIn);
                        }
                    }
                }
                this.queueEvents(current, animationTime);
                events.length = 0;
                current.nextAnimationLast = animationTime;
                current.nextTrackLast = current.trackTime;
            }
            var setupState = this.unkeyedState + spine.SETUP;
            var slots = skeleton.slots;
            for (var i = 0, n = skeleton.slots.length; i < n; i++) {
                var slot = slots[i];
                if (slot.attachmentState == setupState) {
                    var attachmentName = slot.data.attachmentName;
                    slot.setAttachment(!attachmentName ? null : skeleton.getAttachment(slot.data.index, attachmentName));
                }
            }
            this.unkeyedState += 2;
            this.queue.drain();
            return applied;
        }
        applyMixingFrom(to, skeleton, blend) {
            let from = to.mixingFrom;
            if (from.mixingFrom)
                this.applyMixingFrom(from, skeleton, blend);
            let mix = 0;
            if (to.mixDuration == 0) {
                mix = 1;
                if (blend == spine.MixBlend.first)
                    blend = spine.MixBlend.setup;
            }
            else {
                mix = to.mixTime / to.mixDuration;
                if (mix > 1)
                    mix = 1;
                if (blend != spine.MixBlend.first)
                    blend = from.mixBlend;
            }
            let attachments = mix < from.mixAttachmentThreshold, drawOrder = mix < from.mixDrawOrderThreshold;
            let timelines = from.animation.timelines;
            let timelineCount = timelines.length;
            let alphaHold = from.alpha * to.interruptAlpha, alphaMix = alphaHold * (1 - mix);
            let animationLast = from.animationLast, animationTime = from.getAnimationTime(), applyTime = animationTime;
            let events = null;
            if (from.reverse)
                applyTime = from.animation.duration - applyTime;
            else if (mix < from.eventThreshold)
                events = this.events;
            if (blend == spine.MixBlend.add) {
                for (let i = 0; i < timelineCount; i++)
                    timelines[i].apply(skeleton, animationLast, applyTime, events, alphaMix, blend, spine.MixDirection.mixOut);
            }
            else {
                let timelineMode = from.timelineMode;
                let timelineHoldMix = from.timelineHoldMix;
                let shortestRotation = from.shortestRotation;
                let firstFrame = !shortestRotation && from.timelinesRotation.length != timelineCount << 1;
                if (firstFrame)
                    from.timelinesRotation.length = timelineCount << 1;
                from.totalAlpha = 0;
                for (let i = 0; i < timelineCount; i++) {
                    let timeline = timelines[i];
                    let direction = spine.MixDirection.mixOut;
                    let timelineBlend;
                    let alpha = 0;
                    switch (timelineMode[i]) {
                        case spine.SUBSEQUENT:
                            if (!drawOrder && timeline instanceof spine.DrawOrderTimeline)
                                continue;
                            timelineBlend = blend;
                            alpha = alphaMix;
                            break;
                        case spine.FIRST:
                            timelineBlend = spine.MixBlend.setup;
                            alpha = alphaMix;
                            break;
                        case spine.HOLD_SUBSEQUENT:
                            timelineBlend = blend;
                            alpha = alphaHold;
                            break;
                        case spine.HOLD_FIRST:
                            timelineBlend = spine.MixBlend.setup;
                            alpha = alphaHold;
                            break;
                        default:
                            timelineBlend = spine.MixBlend.setup;
                            let holdMix = timelineHoldMix[i];
                            alpha = alphaHold * Math.max(0, 1 - holdMix.mixTime / holdMix.mixDuration);
                            break;
                    }
                    from.totalAlpha += alpha;
                    if (!shortestRotation && timeline instanceof spine.RotateTimeline)
                        this.applyRotateTimeline(timeline, skeleton, applyTime, alpha, timelineBlend, from.timelinesRotation, i << 1, firstFrame);
                    else if (timeline instanceof spine.AttachmentTimeline)
                        this.applyAttachmentTimeline(timeline, skeleton, applyTime, timelineBlend, attachments && alpha >= from.alphaAttachmentThreshold);
                    else {
                        spine.Utils.webkit602BugfixHelper(alpha, blend);
                        if (drawOrder && timeline instanceof spine.DrawOrderTimeline && timelineBlend == spine.MixBlend.setup)
                            direction = spine.MixDirection.mixIn;
                        timeline.apply(skeleton, animationLast, applyTime, events, alpha, timelineBlend, direction);
                    }
                }
            }
            if (to.mixDuration > 0)
                this.queueEvents(from, animationTime);
            this.events.length = 0;
            from.nextAnimationLast = animationTime;
            from.nextTrackLast = from.trackTime;
            return mix;
        }
        applyAttachmentTimeline(timeline, skeleton, time, blend, attachments) {
            var slot = skeleton.slots[timeline.slotIndex];
            if (!slot.bone.active)
                return;
            if (time < timeline.frames[0]) {
                if (blend == spine.MixBlend.setup || blend == spine.MixBlend.first)
                    this.setAttachment(skeleton, slot, slot.data.attachmentName, attachments);
            }
            else
                this.setAttachment(skeleton, slot, timeline.attachmentNames[spine.Timeline.search1(timeline.frames, time)], attachments);
            if (slot.attachmentState <= this.unkeyedState)
                slot.attachmentState = this.unkeyedState + spine.SETUP;
        }
        setAttachment(skeleton, slot, attachmentName, attachments) {
            slot.setAttachment(!attachmentName ? null : skeleton.getAttachment(slot.data.index, attachmentName));
            if (attachments)
                slot.attachmentState = this.unkeyedState + spine.CURRENT;
        }
        applyRotateTimeline(timeline, skeleton, time, alpha, blend, timelinesRotation, i, firstFrame) {
            if (firstFrame)
                timelinesRotation[i] = 0;
            if (alpha == 1) {
                timeline.apply(skeleton, 0, time, null, 1, blend, spine.MixDirection.mixIn);
                return;
            }
            let bone = skeleton.bones[timeline.boneIndex];
            if (!bone.active)
                return;
            let frames = timeline.frames;
            let r1 = 0, r2 = 0;
            if (time < frames[0]) {
                switch (blend) {
                    case spine.MixBlend.setup:
                        bone.rotation = bone.data.rotation;
                    default:
                        return;
                    case spine.MixBlend.first:
                        r1 = bone.rotation;
                        r2 = bone.data.rotation;
                }
            }
            else {
                r1 = blend == spine.MixBlend.setup ? bone.data.rotation : bone.rotation;
                r2 = bone.data.rotation + timeline.getCurveValue(time);
            }
            let total = 0, diff = r2 - r1;
            diff -= Math.ceil(diff / 360 - 0.5) * 360;
            if (diff == 0) {
                total = timelinesRotation[i];
            }
            else {
                let lastTotal = 0, lastDiff = 0;
                if (firstFrame) {
                    lastTotal = 0;
                    lastDiff = diff;
                }
                else {
                    lastTotal = timelinesRotation[i];
                    lastDiff = timelinesRotation[i + 1];
                }
                let loops = lastTotal - lastTotal % 360;
                total = diff + loops;
                let current = diff >= 0, dir = lastTotal >= 0;
                if (Math.abs(lastDiff) <= 90 && spine.MathUtils.signum(lastDiff) != spine.MathUtils.signum(diff)) {
                    if (Math.abs(lastTotal - loops) > 180) {
                        total += 360 * spine.MathUtils.signum(lastTotal);
                        dir = current;
                    }
                    else if (loops != 0)
                        total -= 360 * spine.MathUtils.signum(lastTotal);
                    else
                        dir = current;
                }
                if (dir != current)
                    total += 360 * spine.MathUtils.signum(lastTotal);
                timelinesRotation[i] = total;
            }
            timelinesRotation[i + 1] = diff;
            bone.rotation = r1 + total * alpha;
        }
        queueEvents(entry, animationTime) {
            let animationStart = entry.animationStart, animationEnd = entry.animationEnd;
            let duration = animationEnd - animationStart;
            let trackLastWrapped = entry.trackLast % duration;
            let events = this.events;
            let i = 0, n = events.length;
            for (; i < n; i++) {
                let event = events[i];
                if (event.time < trackLastWrapped)
                    break;
                if (event.time > animationEnd)
                    continue;
                this.queue.event(entry, event);
            }
            let complete = false;
            if (entry.loop) {
                if (duration == 0)
                    complete = true;
                else {
                    const cycles = Math.floor(entry.trackTime / duration);
                    complete = cycles > 0 && cycles > Math.floor(entry.trackLast / duration);
                }
            }
            else
                complete = animationTime >= animationEnd && entry.animationLast < animationEnd;
            if (complete)
                this.queue.complete(entry);
            for (; i < n; i++) {
                let event = events[i];
                if (event.time < animationStart)
                    continue;
                this.queue.event(entry, event);
            }
        }
        clearTracks() {
            let oldDrainDisabled = this.queue.drainDisabled;
            this.queue.drainDisabled = true;
            for (let i = 0, n = this.tracks.length; i < n; i++)
                this.clearTrack(i);
            this.tracks.length = 0;
            this.queue.drainDisabled = oldDrainDisabled;
            this.queue.drain();
        }
        clearTrack(trackIndex) {
            if (trackIndex >= this.tracks.length)
                return;
            let current = this.tracks[trackIndex];
            if (!current)
                return;
            this.queue.end(current);
            this.clearNext(current);
            let entry = current;
            while (true) {
                let from = entry.mixingFrom;
                if (!from)
                    break;
                this.queue.end(from);
                entry.mixingFrom = null;
                entry.mixingTo = null;
                entry = from;
            }
            this.tracks[current.trackIndex] = null;
            this.queue.drain();
        }
        setCurrent(index, current, interrupt) {
            let from = this.expandToIndex(index);
            this.tracks[index] = current;
            current.previous = null;
            if (from) {
                if (interrupt)
                    this.queue.interrupt(from);
                current.mixingFrom = from;
                from.mixingTo = current;
                current.mixTime = 0;
                if (from.mixingFrom && from.mixDuration > 0)
                    current.interruptAlpha *= Math.min(1, from.mixTime / from.mixDuration);
                from.timelinesRotation.length = 0;
            }
            this.queue.start(current);
        }
        setAnimation(trackIndex, animationName, loop = false) {
            let animation = this.data.skeletonData.findAnimation(animationName);
            if (!animation)
                throw new Error("Animation not found: " + animationName);
            return this.setAnimationWith(trackIndex, animation, loop);
        }
        setAnimationWith(trackIndex, animation, loop = false) {
            if (!animation)
                throw new Error("animation cannot be null.");
            let interrupt = true;
            let current = this.expandToIndex(trackIndex);
            if (current) {
                if (current.nextTrackLast == -1) {
                    this.tracks[trackIndex] = current.mixingFrom;
                    this.queue.interrupt(current);
                    this.queue.end(current);
                    this.clearNext(current);
                    current = current.mixingFrom;
                    interrupt = false;
                }
                else
                    this.clearNext(current);
            }
            let entry = this.trackEntry(trackIndex, animation, loop, current);
            this.setCurrent(trackIndex, entry, interrupt);
            this.queue.drain();
            return entry;
        }
        addAnimation(trackIndex, animationName, loop = false, delay = 0) {
            let animation = this.data.skeletonData.findAnimation(animationName);
            if (!animation)
                throw new Error("Animation not found: " + animationName);
            return this.addAnimationWith(trackIndex, animation, loop, delay);
        }
        addAnimationWith(trackIndex, animation, loop = false, delay = 0) {
            if (!animation)
                throw new Error("animation cannot be null.");
            let last = this.expandToIndex(trackIndex);
            if (last) {
                while (last.next)
                    last = last.next;
            }
            let entry = this.trackEntry(trackIndex, animation, loop, last);
            if (!last) {
                this.setCurrent(trackIndex, entry, true);
                this.queue.drain();
            }
            else {
                last.next = entry;
                entry.previous = last;
                if (delay <= 0)
                    delay += last.getTrackComplete() - entry.mixDuration;
            }
            entry.delay = delay;
            return entry;
        }
        setEmptyAnimation(trackIndex, mixDuration = 0) {
            let entry = this.setAnimationWith(trackIndex, AnimationState.emptyAnimation(), false);
            entry.mixDuration = mixDuration;
            entry.trackEnd = mixDuration;
            return entry;
        }
        addEmptyAnimation(trackIndex, mixDuration = 0, delay = 0) {
            let entry = this.addAnimationWith(trackIndex, AnimationState.emptyAnimation(), false, delay);
            if (delay <= 0)
                entry.delay += entry.mixDuration - mixDuration;
            entry.mixDuration = mixDuration;
            entry.trackEnd = mixDuration;
            return entry;
        }
        setEmptyAnimations(mixDuration = 0) {
            let oldDrainDisabled = this.queue.drainDisabled;
            this.queue.drainDisabled = true;
            for (let i = 0, n = this.tracks.length; i < n; i++) {
                let current = this.tracks[i];
                if (current)
                    this.setEmptyAnimation(current.trackIndex, mixDuration);
            }
            this.queue.drainDisabled = oldDrainDisabled;
            this.queue.drain();
        }
        expandToIndex(index) {
            if (index < this.tracks.length)
                return this.tracks[index];
            spine.Utils.ensureArrayCapacity(this.tracks, index + 1, null);
            this.tracks.length = index + 1;
            return null;
        }
        trackEntry(trackIndex, animation, loop, last) {
            let entry = this.trackEntryPool.obtain();
            entry.reset();
            entry.trackIndex = trackIndex;
            entry.animation = animation;
            entry.loop = loop;
            entry.holdPrevious = false;
            entry.reverse = false;
            entry.shortestRotation = false;
            entry.eventThreshold = 0;
            entry.alphaAttachmentThreshold = 0;
            entry.mixAttachmentThreshold = 0;
            entry.mixDrawOrderThreshold = 0;
            entry.animationStart = 0;
            entry.animationEnd = animation.duration;
            entry.animationLast = -1;
            entry.nextAnimationLast = -1;
            entry.delay = 0;
            entry.trackTime = 0;
            entry.trackLast = -1;
            entry.nextTrackLast = -1;
            entry.trackEnd = Number.MAX_VALUE;
            entry.timeScale = 1;
            entry.alpha = 1;
            entry.mixTime = 0;
            entry.mixDuration = !last ? 0 : this.data.getMix(last.animation, animation);
            entry.interruptAlpha = 1;
            entry.totalAlpha = 0;
            entry.mixBlend = spine.MixBlend.replace;
            return entry;
        }
        clearNext(entry) {
            let next = entry.next;
            while (next) {
                this.queue.dispose(next);
                next = next.next;
            }
            entry.next = null;
        }
        _animationsChanged() {
            this.animationsChanged = false;
            this.propertyIDs.clear();
            let tracks = this.tracks;
            for (let i = 0, n = tracks.length; i < n; i++) {
                let entry = tracks[i];
                if (!entry)
                    continue;
                while (entry.mixingFrom)
                    entry = entry.mixingFrom;
                do {
                    if (!entry.mixingTo || entry.mixBlend != spine.MixBlend.add)
                        this.computeHold(entry);
                    entry = entry.mixingTo;
                } while (entry);
            }
        }
        computeHold(entry) {
            let to = entry.mixingTo;
            let timelines = entry.animation.timelines;
            let timelinesCount = entry.animation.timelines.length;
            let timelineMode = entry.timelineMode;
            timelineMode.length = timelinesCount;
            let timelineHoldMix = entry.timelineHoldMix;
            timelineHoldMix.length = 0;
            let propertyIDs = this.propertyIDs;
            if (to && to.holdPrevious) {
                for (let i = 0; i < timelinesCount; i++)
                    timelineMode[i] = propertyIDs.addAll(timelines[i].getPropertyIds()) ? spine.HOLD_FIRST : spine.HOLD_SUBSEQUENT;
                return;
            }
            outer: for (let i = 0; i < timelinesCount; i++) {
                let timeline = timelines[i];
                let ids = timeline.getPropertyIds();
                if (!propertyIDs.addAll(ids))
                    timelineMode[i] = spine.SUBSEQUENT;
                else if (!to || timeline instanceof spine.AttachmentTimeline || timeline instanceof spine.DrawOrderTimeline
                    || timeline instanceof spine.EventTimeline || !to.animation.hasTimeline(ids)) {
                    timelineMode[i] = spine.FIRST;
                }
                else {
                    for (let next = to.mixingTo; next; next = next.mixingTo) {
                        if (next.animation.hasTimeline(ids))
                            continue;
                        if (entry.mixDuration > 0) {
                            timelineMode[i] = spine.HOLD_MIX;
                            timelineHoldMix[i] = next;
                            continue outer;
                        }
                        break;
                    }
                    timelineMode[i] = spine.HOLD_FIRST;
                }
            }
        }
        getCurrent(trackIndex) {
            if (trackIndex >= this.tracks.length)
                return null;
            return this.tracks[trackIndex];
        }
        addListener(listener) {
            if (!listener)
                throw new Error("listener cannot be null.");
            this.listeners.push(listener);
        }
        removeListener(listener) {
            let index = this.listeners.indexOf(listener);
            if (index >= 0)
                this.listeners.splice(index, 1);
        }
        clearListeners() {
            this.listeners.length = 0;
        }
        clearListenerNotifications() {
            this.queue.clear();
        }
    }
    AnimationState._emptyAnimation = new spine.Animation("<empty>", [], 0);
    spine.AnimationState = AnimationState;
    class TrackEntry {
        constructor() {
            this.animation = null;
            this.previous = null;
            this.next = null;
            this.mixingFrom = null;
            this.mixingTo = null;
            this.listener = null;
            this.trackIndex = 0;
            this.loop = false;
            this.holdPrevious = false;
            this.reverse = false;
            this.shortestRotation = false;
            this.eventThreshold = 0;
            this.mixAttachmentThreshold = 0;
            this.alphaAttachmentThreshold = 0;
            this.mixDrawOrderThreshold = 0;
            this.animationStart = 0;
            this.animationEnd = 0;
            this.animationLast = 0;
            this.nextAnimationLast = 0;
            this.delay = 0;
            this.trackTime = 0;
            this.trackLast = 0;
            this.nextTrackLast = 0;
            this.trackEnd = 0;
            this.timeScale = 0;
            this.alpha = 0;
            this.mixTime = 0;
            this._mixDuration = 0;
            this.interruptAlpha = 0;
            this.totalAlpha = 0;
            this.mixBlend = spine.MixBlend.replace;
            this.timelineMode = new Array();
            this.timelineHoldMix = new Array();
            this.timelinesRotation = new Array();
        }
        get mixDuration() {
            return this._mixDuration;
        }
        set mixDuration(mixDuration) {
            this._mixDuration = mixDuration;
        }
        setMixDurationWithDelay(mixDuration, delay) {
            this._mixDuration = mixDuration;
            if (this.previous != null && delay <= 0)
                delay += this.previous.getTrackComplete() - mixDuration;
            this.delay = delay;
        }
        reset() {
            this.next = null;
            this.previous = null;
            this.mixingFrom = null;
            this.mixingTo = null;
            this.animation = null;
            this.listener = null;
            this.timelineMode.length = 0;
            this.timelineHoldMix.length = 0;
            this.timelinesRotation.length = 0;
        }
        getAnimationTime() {
            if (this.loop) {
                let duration = this.animationEnd - this.animationStart;
                if (duration == 0)
                    return this.animationStart;
                return (this.trackTime % duration) + this.animationStart;
            }
            return Math.min(this.trackTime + this.animationStart, this.animationEnd);
        }
        setAnimationLast(animationLast) {
            this.animationLast = animationLast;
            this.nextAnimationLast = animationLast;
        }
        isComplete() {
            return this.trackTime >= this.animationEnd - this.animationStart;
        }
        resetRotationDirections() {
            this.timelinesRotation.length = 0;
        }
        getTrackComplete() {
            let duration = this.animationEnd - this.animationStart;
            if (duration != 0) {
                if (this.loop)
                    return duration * (1 + ((this.trackTime / duration) | 0));
                if (this.trackTime < duration)
                    return duration;
            }
            return this.trackTime;
        }
        wasApplied() {
            return this.nextTrackLast != -1;
        }
        isNextReady() {
            return this.next != null && this.nextTrackLast - this.next.delay >= 0;
        }
    }
    spine.TrackEntry = TrackEntry;
    class EventQueue {
        constructor(animState) {
            this.objects = [];
            this.drainDisabled = false;
            this.animState = animState;
        }
        start(entry) {
            this.objects.push(EventType.start);
            this.objects.push(entry);
            this.animState.animationsChanged = true;
        }
        interrupt(entry) {
            this.objects.push(EventType.interrupt);
            this.objects.push(entry);
        }
        end(entry) {
            this.objects.push(EventType.end);
            this.objects.push(entry);
            this.animState.animationsChanged = true;
        }
        dispose(entry) {
            this.objects.push(EventType.dispose);
            this.objects.push(entry);
        }
        complete(entry) {
            this.objects.push(EventType.complete);
            this.objects.push(entry);
        }
        event(entry, event) {
            this.objects.push(EventType.event);
            this.objects.push(entry);
            this.objects.push(event);
        }
        drain() {
            if (this.drainDisabled)
                return;
            this.drainDisabled = true;
            let objects = this.objects;
            let listeners = this.animState.listeners;
            for (let i = 0; i < objects.length; i += 2) {
                let type = objects[i];
                let entry = objects[i + 1];
                switch (type) {
                    case EventType.start:
                        if (entry.listener && entry.listener.start)
                            entry.listener.start(entry);
                        for (let ii = 0; ii < listeners.length; ii++) {
                            let listener = listeners[ii];
                            if (listener.start)
                                listener.start(entry);
                        }
                        break;
                    case EventType.interrupt:
                        if (entry.listener && entry.listener.interrupt)
                            entry.listener.interrupt(entry);
                        for (let ii = 0; ii < listeners.length; ii++) {
                            let listener = listeners[ii];
                            if (listener.interrupt)
                                listener.interrupt(entry);
                        }
                        break;
                    case EventType.end:
                        if (entry.listener && entry.listener.end)
                            entry.listener.end(entry);
                        for (let ii = 0; ii < listeners.length; ii++) {
                            let listener = listeners[ii];
                            if (listener.end)
                                listener.end(entry);
                        }
                    case EventType.dispose:
                        if (entry.listener && entry.listener.dispose)
                            entry.listener.dispose(entry);
                        for (let ii = 0; ii < listeners.length; ii++) {
                            let listener = listeners[ii];
                            if (listener.dispose)
                                listener.dispose(entry);
                        }
                        this.animState.trackEntryPool.free(entry);
                        break;
                    case EventType.complete:
                        if (entry.listener && entry.listener.complete)
                            entry.listener.complete(entry);
                        for (let ii = 0; ii < listeners.length; ii++) {
                            let listener = listeners[ii];
                            if (listener.complete)
                                listener.complete(entry);
                        }
                        break;
                    case EventType.event:
                        let event = objects[i++ + 2];
                        if (entry.listener && entry.listener.event)
                            entry.listener.event(entry, event);
                        for (let ii = 0; ii < listeners.length; ii++) {
                            let listener = listeners[ii];
                            if (listener.event)
                                listener.event(entry, event);
                        }
                        break;
                }
            }
            this.clear();
            this.drainDisabled = false;
        }
        clear() {
            this.objects.length = 0;
        }
    }
    spine.EventQueue = EventQueue;
    let EventType;
    (function (EventType) {
        EventType[EventType["start"] = 0] = "start";
        EventType[EventType["interrupt"] = 1] = "interrupt";
        EventType[EventType["end"] = 2] = "end";
        EventType[EventType["dispose"] = 3] = "dispose";
        EventType[EventType["complete"] = 4] = "complete";
        EventType[EventType["event"] = 5] = "event";
    })(EventType = spine.EventType || (spine.EventType = {}));
    class AnimationStateAdapter {
        start(entry) {
        }
        interrupt(entry) {
        }
        end(entry) {
        }
        dispose(entry) {
        }
        complete(entry) {
        }
        event(entry, event) {
        }
    }
    spine.AnimationStateAdapter = AnimationStateAdapter;
    spine.SUBSEQUENT = 0;
    spine.FIRST = 1;
    spine.HOLD_SUBSEQUENT = 2;
    spine.HOLD_FIRST = 3;
    spine.HOLD_MIX = 4;
    spine.SETUP = 1;
    spine.CURRENT = 2;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class AnimationStateData {
        constructor(skeletonData) {
            this.animationToMixTime = {};
            this.defaultMix = 0;
            if (!skeletonData)
                throw new Error("skeletonData cannot be null.");
            this.skeletonData = skeletonData;
        }
        setMix(fromName, toName, duration) {
            let from = this.skeletonData.findAnimation(fromName);
            if (!from)
                throw new Error("Animation not found: " + fromName);
            let to = this.skeletonData.findAnimation(toName);
            if (!to)
                throw new Error("Animation not found: " + toName);
            this.setMixWith(from, to, duration);
        }
        setMixWith(from, to, duration) {
            if (!from)
                throw new Error("from cannot be null.");
            if (!to)
                throw new Error("to cannot be null.");
            let key = from.name + "." + to.name;
            this.animationToMixTime[key] = duration;
        }
        getMix(from, to) {
            let key = from.name + "." + to.name;
            let value = this.animationToMixTime[key];
            return value === undefined ? this.defaultMix : value;
        }
    }
    spine.AnimationStateData = AnimationStateData;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class AssetManagerBase {
        constructor(textureLoader, pathPrefix = "", downloader = new Downloader()) {
            this.pathPrefix = "";
            this.assets = {};
            this.errors = {};
            this.toLoad = 0;
            this.loaded = 0;
            this.textureLoader = textureLoader;
            this.pathPrefix = pathPrefix;
            this.downloader = downloader;
        }
        start(path) {
            this.toLoad++;
            return this.pathPrefix + path;
        }
        success(callback, path, asset) {
            this.toLoad--;
            this.loaded++;
            this.assets[path] = asset;
            if (callback)
                callback(path, asset);
        }
        error(callback, path, message) {
            this.toLoad--;
            this.loaded++;
            this.errors[path] = message;
            if (callback)
                callback(path, message);
        }
        loadAll() {
            let promise = new Promise((resolve, reject) => {
                let check = () => {
                    if (this.isLoadingComplete()) {
                        if (this.hasErrors())
                            reject(this.errors);
                        else
                            resolve(this);
                        return;
                    }
                    requestAnimationFrame(check);
                };
                requestAnimationFrame(check);
            });
            return promise;
        }
        setRawDataURI(path, data) {
            this.downloader.rawDataUris[this.pathPrefix + path] = data;
        }
        loadBinary(path, success = () => { }, error = () => { }) {
            path = this.start(path);
            this.downloader.downloadBinary(path, (data) => {
                this.success(success, path, data);
            }, (status, responseText) => {
                this.error(error, path, `Couldn't load binary ${path}: status ${status}, ${responseText}`);
            });
        }
        loadText(path, success = () => { }, error = () => { }) {
            path = this.start(path);
            this.downloader.downloadText(path, (data) => {
                this.success(success, path, data);
            }, (status, responseText) => {
                this.error(error, path, `Couldn't load text ${path}: status ${status}, ${responseText}`);
            });
        }
        loadJson(path, success = () => { }, error = () => { }) {
            path = this.start(path);
            this.downloader.downloadJson(path, (data) => {
                this.success(success, path, data);
            }, (status, responseText) => {
                this.error(error, path, `Couldn't load JSON ${path}: status ${status}, ${responseText}`);
            });
        }
        loadTexture(path, success = () => { }, error = () => { }) {
            path = this.start(path);
            let isBrowser = !!(typeof window !== 'undefined' && typeof navigator !== 'undefined' && window.document);
            let isWebWorker = !isBrowser;
            if (isWebWorker) {
                fetch(path, { mode: "cors" }).then((response) => {
                    if (response.ok)
                        return response.blob();
                    this.error(error, path, `Couldn't load image: ${path}`);
                    return null;
                }).then((blob) => {
                    return blob ? createImageBitmap(blob, { premultiplyAlpha: "none", colorSpaceConversion: "none" }) : null;
                }).then((bitmap) => {
                    if (bitmap)
                        this.success(success, path, this.textureLoader(bitmap));
                });
            }
            else {
                let image = new Image();
                image.crossOrigin = "anonymous";
                image.onload = () => {
                    this.success(success, path, this.textureLoader(image));
                };
                image.onerror = () => {
                    this.error(error, path, `Couldn't load image: ${path}`);
                };
                if (this.downloader.rawDataUris[path])
                    path = this.downloader.rawDataUris[path];
                image.src = path;
            }
        }
        loadTextureAtlas(path, success = () => { }, error = () => { }, fileAlias) {
            let index = path.lastIndexOf("/");
            let parent = index >= 0 ? path.substring(0, index + 1) : "";
            path = this.start(path);
            this.downloader.downloadText(path, (atlasText) => {
                try {
                    let atlas = new spine.TextureAtlas(atlasText);
                    let toLoad = atlas.pages.length, abort = false;
                    for (let page of atlas.pages) {
                        this.loadTexture(!fileAlias ? parent + page.name : fileAlias[page.name], (imagePath, texture) => {
                            if (!abort) {
                                page.setTexture(texture);
                                if (--toLoad == 0)
                                    this.success(success, path, atlas);
                            }
                        }, (imagePath, message) => {
                            if (!abort)
                                this.error(error, path, `Couldn't load texture atlas ${path} page image: ${imagePath}`);
                            abort = true;
                        });
                    }
                }
                catch (e) {
                    this.error(error, path, `Couldn't parse texture atlas ${path}: ${e.message}`);
                }
            }, (status, responseText) => {
                this.error(error, path, `Couldn't load texture atlas ${path}: status ${status}, ${responseText}`);
            });
        }
        get(path) {
            return this.assets[this.pathPrefix + path];
        }
        require(path) {
            path = this.pathPrefix + path;
            let asset = this.assets[path];
            if (asset)
                return asset;
            let error = this.errors[path];
            throw Error("Asset not found: " + path + (error ? "\n" + error : ""));
        }
        remove(path) {
            path = this.pathPrefix + path;
            let asset = this.assets[path];
            if (asset.dispose)
                asset.dispose();
            delete this.assets[path];
            return asset;
        }
        removeAll() {
            for (let key in this.assets) {
                let asset = this.assets[key];
                if (asset.dispose)
                    asset.dispose();
            }
            this.assets = {};
        }
        isLoadingComplete() {
            return this.toLoad == 0;
        }
        getToLoad() {
            return this.toLoad;
        }
        getLoaded() {
            return this.loaded;
        }
        dispose() {
            this.removeAll();
        }
        hasErrors() {
            return Object.keys(this.errors).length > 0;
        }
        getErrors() {
            return this.errors;
        }
    }
    spine.AssetManagerBase = AssetManagerBase;
    class Downloader {
        constructor() {
            this.callbacks = {};
            this.rawDataUris = {};
        }
        dataUriToString(dataUri) {
            if (!dataUri.startsWith("data:")) {
                throw new Error("Not a data URI.");
            }
            let base64Idx = dataUri.indexOf("base64,");
            if (base64Idx != -1) {
                base64Idx += "base64,".length;
                return atob(dataUri.substr(base64Idx));
            }
            else {
                return dataUri.substr(dataUri.indexOf(",") + 1);
            }
        }
        base64ToUint8Array(base64) {
            var binary_string = window.atob(base64);
            var len = binary_string.length;
            var bytes = new Uint8Array(len);
            for (var i = 0; i < len; i++) {
                bytes[i] = binary_string.charCodeAt(i);
            }
            return bytes;
        }
        dataUriToUint8Array(dataUri) {
            if (!dataUri.startsWith("data:")) {
                throw new Error("Not a data URI.");
            }
            let base64Idx = dataUri.indexOf("base64,");
            if (base64Idx == -1)
                throw new Error("Not a binary data URI.");
            base64Idx += "base64,".length;
            return this.base64ToUint8Array(dataUri.substr(base64Idx));
        }
        downloadText(url, success, error) {
            if (this.start(url, success, error))
                return;
            if (this.rawDataUris[url]) {
                try {
                    let dataUri = this.rawDataUris[url];
                    this.finish(url, 200, this.dataUriToString(dataUri));
                }
                catch (e) {
                    this.finish(url, 400, JSON.stringify(e));
                }
                return;
            }
            let request = new XMLHttpRequest();
            request.overrideMimeType("text/html");
            request.open("GET", url, true);
            let done = () => {
                this.finish(url, request.status, request.responseText);
            };
            request.onload = done;
            request.onerror = done;
            request.send();
        }
        downloadJson(url, success, error) {
            this.downloadText(url, (data) => {
                success(JSON.parse(data));
            }, error);
        }
        downloadBinary(url, success, error) {
            if (this.start(url, success, error))
                return;
            if (this.rawDataUris[url]) {
                try {
                    let dataUri = this.rawDataUris[url];
                    this.finish(url, 200, this.dataUriToUint8Array(dataUri));
                }
                catch (e) {
                    this.finish(url, 400, JSON.stringify(e));
                }
                return;
            }
            let request = new XMLHttpRequest();
            request.open("GET", url, true);
            request.responseType = "arraybuffer";
            let onerror = () => {
                this.finish(url, request.status, request.response);
            };
            request.onload = () => {
                if (request.status == 200 || request.status == 0)
                    this.finish(url, 200, new Uint8Array(request.response));
                else
                    onerror();
            };
            request.onerror = onerror;
            request.send();
        }
        start(url, success, error) {
            let callbacks = this.callbacks[url];
            try {
                if (callbacks)
                    return true;
                this.callbacks[url] = callbacks = [];
            }
            finally {
                callbacks.push(success, error);
            }
        }
        finish(url, status, data) {
            let callbacks = this.callbacks[url];
            delete this.callbacks[url];
            let args = status == 200 || status == 0 ? [data] : [status, data];
            for (let i = args.length - 1, n = callbacks.length; i < n; i += 2)
                callbacks[i].apply(null, args);
        }
    }
    spine.Downloader = Downloader;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class AtlasAttachmentLoader {
        constructor(atlas) {
            this.atlas = atlas;
        }
        loadSequence(name, basePath, sequence) {
            let regions = sequence.regions;
            for (let i = 0, n = regions.length; i < n; i++) {
                let path = sequence.getPath(basePath, i);
                let region = this.atlas.findRegion(path);
                if (region == null)
                    throw new Error("Region not found in atlas: " + path + " (sequence: " + name + ")");
                regions[i] = region;
            }
        }
        newRegionAttachment(skin, name, path, sequence) {
            let attachment = new spine.RegionAttachment(name, path);
            if (sequence != null) {
                this.loadSequence(name, path, sequence);
            }
            else {
                let region = this.atlas.findRegion(path);
                if (!region)
                    throw new Error("Region not found in atlas: " + path + " (region attachment: " + name + ")");
                attachment.region = region;
            }
            return attachment;
        }
        newMeshAttachment(skin, name, path, sequence) {
            let attachment = new spine.MeshAttachment(name, path);
            if (sequence != null) {
                this.loadSequence(name, path, sequence);
            }
            else {
                let region = this.atlas.findRegion(path);
                if (!region)
                    throw new Error("Region not found in atlas: " + path + " (mesh attachment: " + name + ")");
                attachment.region = region;
            }
            return attachment;
        }
        newBoundingBoxAttachment(skin, name) {
            return new spine.BoundingBoxAttachment(name);
        }
        newPathAttachment(skin, name) {
            return new spine.PathAttachment(name);
        }
        newPointAttachment(skin, name) {
            return new spine.PointAttachment(name);
        }
        newClippingAttachment(skin, name) {
            return new spine.ClippingAttachment(name);
        }
    }
    spine.AtlasAttachmentLoader = AtlasAttachmentLoader;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class Attachment {
        constructor(name) {
            if (!name)
                throw new Error("name cannot be null.");
            this.name = name;
        }
    }
    spine.Attachment = Attachment;
    class VertexAttachment extends Attachment {
        constructor(name) {
            super(name);
            this.id = VertexAttachment.nextID++;
            this.bones = null;
            this.vertices = [];
            this.worldVerticesLength = 0;
            this.timelineAttachment = this;
        }
        computeWorldVertices(slot, start, count, worldVertices, offset, stride) {
            count = offset + (count >> 1) * stride;
            let skeleton = slot.bone.skeleton;
            let deformArray = slot.deform;
            let vertices = this.vertices;
            let bones = this.bones;
            if (!bones) {
                if (deformArray.length > 0)
                    vertices = deformArray;
                let bone = slot.bone;
                let x = bone.worldX;
                let y = bone.worldY;
                let a = bone.a, b = bone.b, c = bone.c, d = bone.d;
                for (let v = start, w = offset; w < count; v += 2, w += stride) {
                    let vx = vertices[v], vy = vertices[v + 1];
                    worldVertices[w] = vx * a + vy * b + x;
                    worldVertices[w + 1] = vx * c + vy * d + y;
                }
                return;
            }
            let v = 0, skip = 0;
            for (let i = 0; i < start; i += 2) {
                let n = bones[v];
                v += n + 1;
                skip += n;
            }
            let skeletonBones = skeleton.bones;
            if (deformArray.length == 0) {
                for (let w = offset, b = skip * 3; w < count; w += stride) {
                    let wx = 0, wy = 0;
                    let n = bones[v++];
                    n += v;
                    for (; v < n; v++, b += 3) {
                        let bone = skeletonBones[bones[v]];
                        let vx = vertices[b], vy = vertices[b + 1], weight = vertices[b + 2];
                        wx += (vx * bone.a + vy * bone.b + bone.worldX) * weight;
                        wy += (vx * bone.c + vy * bone.d + bone.worldY) * weight;
                    }
                    worldVertices[w] = wx;
                    worldVertices[w + 1] = wy;
                }
            }
            else {
                let deform = deformArray;
                for (let w = offset, b = skip * 3, f = skip << 1; w < count; w += stride) {
                    let wx = 0, wy = 0;
                    let n = bones[v++];
                    n += v;
                    for (; v < n; v++, b += 3, f += 2) {
                        let bone = skeletonBones[bones[v]];
                        let vx = vertices[b] + deform[f], vy = vertices[b + 1] + deform[f + 1], weight = vertices[b + 2];
                        wx += (vx * bone.a + vy * bone.b + bone.worldX) * weight;
                        wy += (vx * bone.c + vy * bone.d + bone.worldY) * weight;
                    }
                    worldVertices[w] = wx;
                    worldVertices[w + 1] = wy;
                }
            }
        }
        copyTo(attachment) {
            if (this.bones) {
                attachment.bones = new Array(this.bones.length);
                spine.Utils.arrayCopy(this.bones, 0, attachment.bones, 0, this.bones.length);
            }
            else
                attachment.bones = null;
            if (this.vertices) {
                attachment.vertices = spine.Utils.newFloatArray(this.vertices.length);
                spine.Utils.arrayCopy(this.vertices, 0, attachment.vertices, 0, this.vertices.length);
            }
            attachment.worldVerticesLength = this.worldVerticesLength;
            attachment.timelineAttachment = this.timelineAttachment;
        }
    }
    VertexAttachment.nextID = 0;
    spine.VertexAttachment = VertexAttachment;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class BoundingBoxAttachment extends spine.VertexAttachment {
        constructor(name) {
            super(name);
            this.color = new spine.Color(1, 1, 1, 1);
        }
        copy() {
            let copy = new BoundingBoxAttachment(this.name);
            this.copyTo(copy);
            copy.color.setFromColor(this.color);
            return copy;
        }
    }
    spine.BoundingBoxAttachment = BoundingBoxAttachment;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class ClippingAttachment extends spine.VertexAttachment {
        constructor(name) {
            super(name);
            this.endSlot = null;
            this.color = new spine.Color(0.2275, 0.2275, 0.8078, 1);
        }
        copy() {
            let copy = new ClippingAttachment(this.name);
            this.copyTo(copy);
            copy.endSlot = this.endSlot;
            copy.color.setFromColor(this.color);
            return copy;
        }
    }
    spine.ClippingAttachment = ClippingAttachment;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class MeshAttachment extends spine.VertexAttachment {
        constructor(name, path) {
            super(name);
            this.region = null;
            this.regionUVs = [];
            this.uvs = [];
            this.triangles = [];
            this.color = new spine.Color(1, 1, 1, 1);
            this.width = 0;
            this.height = 0;
            this.hullLength = 0;
            this.edges = [];
            this.parentMesh = null;
            this.sequence = null;
            this.tempColor = new spine.Color(0, 0, 0, 0);
            this.path = path;
        }
        updateRegion() {
            if (!this.region)
                throw new Error("Region not set.");
            let regionUVs = this.regionUVs;
            if (!this.uvs || this.uvs.length != regionUVs.length)
                this.uvs = spine.Utils.newFloatArray(regionUVs.length);
            let uvs = this.uvs;
            let n = this.uvs.length;
            let u = this.region.u, v = this.region.v, width = 0, height = 0;
            if (this.region instanceof spine.TextureAtlasRegion) {
                let region = this.region, page = region.page;
                let textureWidth = page.width, textureHeight = page.height;
                switch (region.degrees) {
                    case 90:
                        u -= (region.originalHeight - region.offsetY - region.height) / textureWidth;
                        v -= (region.originalWidth - region.offsetX - region.width) / textureHeight;
                        width = region.originalHeight / textureWidth;
                        height = region.originalWidth / textureHeight;
                        for (let i = 0; i < n; i += 2) {
                            uvs[i] = u + regionUVs[i + 1] * width;
                            uvs[i + 1] = v + (1 - regionUVs[i]) * height;
                        }
                        return;
                    case 180:
                        u -= (region.originalWidth - region.offsetX - region.width) / textureWidth;
                        v -= region.offsetY / textureHeight;
                        width = region.originalWidth / textureWidth;
                        height = region.originalHeight / textureHeight;
                        for (let i = 0; i < n; i += 2) {
                            uvs[i] = u + (1 - regionUVs[i]) * width;
                            uvs[i + 1] = v + (1 - regionUVs[i + 1]) * height;
                        }
                        return;
                    case 270:
                        u -= region.offsetY / textureWidth;
                        v -= region.offsetX / textureHeight;
                        width = region.originalHeight / textureWidth;
                        height = region.originalWidth / textureHeight;
                        for (let i = 0; i < n; i += 2) {
                            uvs[i] = u + (1 - regionUVs[i + 1]) * width;
                            uvs[i + 1] = v + regionUVs[i] * height;
                        }
                        return;
                }
                u -= region.offsetX / textureWidth;
                v -= (region.originalHeight - region.offsetY - region.height) / textureHeight;
                width = region.originalWidth / textureWidth;
                height = region.originalHeight / textureHeight;
            }
            else if (!this.region) {
                u = v = 0;
                width = height = 1;
            }
            else {
                width = this.region.u2 - u;
                height = this.region.v2 - v;
            }
            for (let i = 0; i < n; i += 2) {
                uvs[i] = u + regionUVs[i] * width;
                uvs[i + 1] = v + regionUVs[i + 1] * height;
            }
        }
        getParentMesh() {
            return this.parentMesh;
        }
        setParentMesh(parentMesh) {
            this.parentMesh = parentMesh;
            if (parentMesh) {
                this.bones = parentMesh.bones;
                this.vertices = parentMesh.vertices;
                this.worldVerticesLength = parentMesh.worldVerticesLength;
                this.regionUVs = parentMesh.regionUVs;
                this.triangles = parentMesh.triangles;
                this.hullLength = parentMesh.hullLength;
                this.worldVerticesLength = parentMesh.worldVerticesLength;
            }
        }
        copy() {
            if (this.parentMesh)
                return this.newLinkedMesh();
            let copy = new MeshAttachment(this.name, this.path);
            copy.region = this.region;
            copy.color.setFromColor(this.color);
            this.copyTo(copy);
            copy.regionUVs = new Array(this.regionUVs.length);
            spine.Utils.arrayCopy(this.regionUVs, 0, copy.regionUVs, 0, this.regionUVs.length);
            copy.uvs = new Array(this.uvs.length);
            spine.Utils.arrayCopy(this.uvs, 0, copy.uvs, 0, this.uvs.length);
            copy.triangles = new Array(this.triangles.length);
            spine.Utils.arrayCopy(this.triangles, 0, copy.triangles, 0, this.triangles.length);
            copy.hullLength = this.hullLength;
            copy.sequence = this.sequence != null ? this.sequence.copy() : null;
            if (this.edges) {
                copy.edges = new Array(this.edges.length);
                spine.Utils.arrayCopy(this.edges, 0, copy.edges, 0, this.edges.length);
            }
            copy.width = this.width;
            copy.height = this.height;
            return copy;
        }
        computeWorldVertices(slot, start, count, worldVertices, offset, stride) {
            if (this.sequence != null)
                this.sequence.apply(slot, this);
            super.computeWorldVertices(slot, start, count, worldVertices, offset, stride);
        }
        newLinkedMesh() {
            let copy = new MeshAttachment(this.name, this.path);
            copy.region = this.region;
            copy.color.setFromColor(this.color);
            copy.timelineAttachment = this.timelineAttachment;
            copy.setParentMesh(this.parentMesh ? this.parentMesh : this);
            if (copy.region != null)
                copy.updateRegion();
            return copy;
        }
    }
    spine.MeshAttachment = MeshAttachment;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class PathAttachment extends spine.VertexAttachment {
        constructor(name) {
            super(name);
            this.lengths = [];
            this.closed = false;
            this.constantSpeed = false;
            this.color = new spine.Color(1, 1, 1, 1);
        }
        copy() {
            let copy = new PathAttachment(this.name);
            this.copyTo(copy);
            copy.lengths = new Array(this.lengths.length);
            spine.Utils.arrayCopy(this.lengths, 0, copy.lengths, 0, this.lengths.length);
            copy.closed = closed;
            copy.constantSpeed = this.constantSpeed;
            copy.color.setFromColor(this.color);
            return copy;
        }
    }
    spine.PathAttachment = PathAttachment;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class PointAttachment extends spine.VertexAttachment {
        constructor(name) {
            super(name);
            this.x = 0;
            this.y = 0;
            this.rotation = 0;
            this.color = new spine.Color(0.38, 0.94, 0, 1);
        }
        computeWorldPosition(bone, point) {
            point.x = this.x * bone.a + this.y * bone.b + bone.worldX;
            point.y = this.x * bone.c + this.y * bone.d + bone.worldY;
            return point;
        }
        computeWorldRotation(bone) {
            const r = this.rotation * spine.MathUtils.degRad, cos = Math.cos(r), sin = Math.sin(r);
            const x = cos * bone.a + sin * bone.b;
            const y = cos * bone.c + sin * bone.d;
            return spine.MathUtils.atan2Deg(y, x);
        }
        copy() {
            let copy = new PointAttachment(this.name);
            copy.x = this.x;
            copy.y = this.y;
            copy.rotation = this.rotation;
            copy.color.setFromColor(this.color);
            return copy;
        }
    }
    spine.PointAttachment = PointAttachment;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class RegionAttachment extends spine.Attachment {
        constructor(name, path) {
            super(name);
            this.x = 0;
            this.y = 0;
            this.scaleX = 1;
            this.scaleY = 1;
            this.rotation = 0;
            this.width = 0;
            this.height = 0;
            this.color = new spine.Color(1, 1, 1, 1);
            this.region = null;
            this.sequence = null;
            this.offset = spine.Utils.newFloatArray(8);
            this.uvs = spine.Utils.newFloatArray(8);
            this.tempColor = new spine.Color(1, 1, 1, 1);
            this.path = path;
        }
        updateRegion() {
            if (!this.region)
                throw new Error("Region not set.");
            let region = this.region;
            let uvs = this.uvs;
            if (region == null) {
                uvs[0] = 0;
                uvs[1] = 0;
                uvs[2] = 0;
                uvs[3] = 1;
                uvs[4] = 1;
                uvs[5] = 1;
                uvs[6] = 1;
                uvs[7] = 0;
                return;
            }
            let regionScaleX = this.width / this.region.originalWidth * this.scaleX;
            let regionScaleY = this.height / this.region.originalHeight * this.scaleY;
            let localX = -this.width / 2 * this.scaleX + this.region.offsetX * regionScaleX;
            let localY = -this.height / 2 * this.scaleY + this.region.offsetY * regionScaleY;
            let localX2 = localX + this.region.width * regionScaleX;
            let localY2 = localY + this.region.height * regionScaleY;
            let radians = this.rotation * spine.MathUtils.degRad;
            let cos = Math.cos(radians);
            let sin = Math.sin(radians);
            let x = this.x, y = this.y;
            let localXCos = localX * cos + x;
            let localXSin = localX * sin;
            let localYCos = localY * cos + y;
            let localYSin = localY * sin;
            let localX2Cos = localX2 * cos + x;
            let localX2Sin = localX2 * sin;
            let localY2Cos = localY2 * cos + y;
            let localY2Sin = localY2 * sin;
            let offset = this.offset;
            offset[0] = localXCos - localYSin;
            offset[1] = localYCos + localXSin;
            offset[2] = localXCos - localY2Sin;
            offset[3] = localY2Cos + localXSin;
            offset[4] = localX2Cos - localY2Sin;
            offset[5] = localY2Cos + localX2Sin;
            offset[6] = localX2Cos - localYSin;
            offset[7] = localYCos + localX2Sin;
            if (region.degrees == 90) {
                uvs[0] = region.u2;
                uvs[1] = region.v2;
                uvs[2] = region.u;
                uvs[3] = region.v2;
                uvs[4] = region.u;
                uvs[5] = region.v;
                uvs[6] = region.u2;
                uvs[7] = region.v;
            }
            else {
                uvs[0] = region.u;
                uvs[1] = region.v2;
                uvs[2] = region.u;
                uvs[3] = region.v;
                uvs[4] = region.u2;
                uvs[5] = region.v;
                uvs[6] = region.u2;
                uvs[7] = region.v2;
            }
        }
        computeWorldVertices(slot, worldVertices, offset, stride) {
            if (this.sequence != null)
                this.sequence.apply(slot, this);
            let bone = slot.bone;
            let vertexOffset = this.offset;
            let x = bone.worldX, y = bone.worldY;
            let a = bone.a, b = bone.b, c = bone.c, d = bone.d;
            let offsetX = 0, offsetY = 0;
            offsetX = vertexOffset[0];
            offsetY = vertexOffset[1];
            worldVertices[offset] = offsetX * a + offsetY * b + x;
            worldVertices[offset + 1] = offsetX * c + offsetY * d + y;
            offset += stride;
            offsetX = vertexOffset[2];
            offsetY = vertexOffset[3];
            worldVertices[offset] = offsetX * a + offsetY * b + x;
            worldVertices[offset + 1] = offsetX * c + offsetY * d + y;
            offset += stride;
            offsetX = vertexOffset[4];
            offsetY = vertexOffset[5];
            worldVertices[offset] = offsetX * a + offsetY * b + x;
            worldVertices[offset + 1] = offsetX * c + offsetY * d + y;
            offset += stride;
            offsetX = vertexOffset[6];
            offsetY = vertexOffset[7];
            worldVertices[offset] = offsetX * a + offsetY * b + x;
            worldVertices[offset + 1] = offsetX * c + offsetY * d + y;
        }
        copy() {
            let copy = new RegionAttachment(this.name, this.path);
            copy.region = this.region;
            copy.x = this.x;
            copy.y = this.y;
            copy.scaleX = this.scaleX;
            copy.scaleY = this.scaleY;
            copy.rotation = this.rotation;
            copy.width = this.width;
            copy.height = this.height;
            spine.Utils.arrayCopy(this.uvs, 0, copy.uvs, 0, 8);
            spine.Utils.arrayCopy(this.offset, 0, copy.offset, 0, 8);
            copy.color.setFromColor(this.color);
            copy.sequence = this.sequence != null ? this.sequence.copy() : null;
            return copy;
        }
    }
    RegionAttachment.X1 = 0;
    RegionAttachment.Y1 = 1;
    RegionAttachment.C1R = 2;
    RegionAttachment.C1G = 3;
    RegionAttachment.C1B = 4;
    RegionAttachment.C1A = 5;
    RegionAttachment.U1 = 6;
    RegionAttachment.V1 = 7;
    RegionAttachment.X2 = 8;
    RegionAttachment.Y2 = 9;
    RegionAttachment.C2R = 10;
    RegionAttachment.C2G = 11;
    RegionAttachment.C2B = 12;
    RegionAttachment.C2A = 13;
    RegionAttachment.U2 = 14;
    RegionAttachment.V2 = 15;
    RegionAttachment.X3 = 16;
    RegionAttachment.Y3 = 17;
    RegionAttachment.C3R = 18;
    RegionAttachment.C3G = 19;
    RegionAttachment.C3B = 20;
    RegionAttachment.C3A = 21;
    RegionAttachment.U3 = 22;
    RegionAttachment.V3 = 23;
    RegionAttachment.X4 = 24;
    RegionAttachment.Y4 = 25;
    RegionAttachment.C4R = 26;
    RegionAttachment.C4G = 27;
    RegionAttachment.C4B = 28;
    RegionAttachment.C4A = 29;
    RegionAttachment.U4 = 30;
    RegionAttachment.V4 = 31;
    spine.RegionAttachment = RegionAttachment;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class Sequence {
        constructor(count) {
            this.id = Sequence.nextID();
            this.start = 0;
            this.digits = 0;
            this.setupIndex = 0;
            this.regions = new Array(count);
        }
        copy() {
            let copy = new Sequence(this.regions.length);
            spine.Utils.arrayCopy(this.regions, 0, copy.regions, 0, this.regions.length);
            copy.start = this.start;
            copy.digits = this.digits;
            copy.setupIndex = this.setupIndex;
            return copy;
        }
        apply(slot, attachment) {
            let index = slot.sequenceIndex;
            if (index == -1)
                index = this.setupIndex;
            if (index >= this.regions.length)
                index = this.regions.length - 1;
            let region = this.regions[index];
            if (attachment.region != region) {
                attachment.region = region;
                attachment.updateRegion();
            }
        }
        getPath(basePath, index) {
            let result = basePath;
            let frame = (this.start + index).toString();
            for (let i = this.digits - frame.length; i > 0; i--)
                result += "0";
            result += frame;
            return result;
        }
        static nextID() {
            return Sequence._nextID++;
        }
    }
    Sequence._nextID = 0;
    spine.Sequence = Sequence;
    let SequenceMode;
    (function (SequenceMode) {
        SequenceMode[SequenceMode["hold"] = 0] = "hold";
        SequenceMode[SequenceMode["once"] = 1] = "once";
        SequenceMode[SequenceMode["loop"] = 2] = "loop";
        SequenceMode[SequenceMode["pingpong"] = 3] = "pingpong";
        SequenceMode[SequenceMode["onceReverse"] = 4] = "onceReverse";
        SequenceMode[SequenceMode["loopReverse"] = 5] = "loopReverse";
        SequenceMode[SequenceMode["pingpongReverse"] = 6] = "pingpongReverse";
    })(SequenceMode = spine.SequenceMode || (spine.SequenceMode = {}));
    spine.SequenceModeValues = [
        SequenceMode.hold,
        SequenceMode.once,
        SequenceMode.loop,
        SequenceMode.pingpong,
        SequenceMode.onceReverse,
        SequenceMode.loopReverse,
        SequenceMode.pingpongReverse
    ];
})(spine || (spine = {}));
var spine;
(function (spine) {
    class Bone {
        constructor(data, skeleton, parent) {
            this.parent = null;
            this.children = new Array();
            this.x = 0;
            this.y = 0;
            this.rotation = 0;
            this.scaleX = 0;
            this.scaleY = 0;
            this.shearX = 0;
            this.shearY = 0;
            this.ax = 0;
            this.ay = 0;
            this.arotation = 0;
            this.ascaleX = 0;
            this.ascaleY = 0;
            this.ashearX = 0;
            this.ashearY = 0;
            this.a = 0;
            this.b = 0;
            this.c = 0;
            this.d = 0;
            this.worldY = 0;
            this.worldX = 0;
            this.inherit = spine.Inherit.Normal;
            this.sorted = false;
            this.active = false;
            if (!data)
                throw new Error("data cannot be null.");
            if (!skeleton)
                throw new Error("skeleton cannot be null.");
            this.data = data;
            this.skeleton = skeleton;
            this.parent = parent;
            this.setToSetupPose();
        }
        isActive() {
            return this.active;
        }
        update(physics) {
            this.updateWorldTransformWith(this.ax, this.ay, this.arotation, this.ascaleX, this.ascaleY, this.ashearX, this.ashearY);
        }
        updateWorldTransform() {
            this.updateWorldTransformWith(this.x, this.y, this.rotation, this.scaleX, this.scaleY, this.shearX, this.shearY);
        }
        updateWorldTransformWith(x, y, rotation, scaleX, scaleY, shearX, shearY) {
            this.ax = x;
            this.ay = y;
            this.arotation = rotation;
            this.ascaleX = scaleX;
            this.ascaleY = scaleY;
            this.ashearX = shearX;
            this.ashearY = shearY;
            let parent = this.parent;
            if (!parent) {
                let skeleton = this.skeleton;
                const sx = skeleton.scaleX, sy = skeleton.scaleY;
                const rx = (rotation + shearX) * spine.MathUtils.degRad;
                const ry = (rotation + 90 + shearY) * spine.MathUtils.degRad;
                this.a = Math.cos(rx) * scaleX * sx;
                this.b = Math.cos(ry) * scaleY * sx;
                this.c = Math.sin(rx) * scaleX * sy;
                this.d = Math.sin(ry) * scaleY * sy;
                this.worldX = x * sx + skeleton.x;
                this.worldY = y * sy + skeleton.y;
                return;
            }
            let pa = parent.a, pb = parent.b, pc = parent.c, pd = parent.d;
            this.worldX = pa * x + pb * y + parent.worldX;
            this.worldY = pc * x + pd * y + parent.worldY;
            switch (this.inherit) {
                case spine.Inherit.Normal: {
                    const rx = (rotation + shearX) * spine.MathUtils.degRad;
                    const ry = (rotation + 90 + shearY) * spine.MathUtils.degRad;
                    const la = Math.cos(rx) * scaleX;
                    const lb = Math.cos(ry) * scaleY;
                    const lc = Math.sin(rx) * scaleX;
                    const ld = Math.sin(ry) * scaleY;
                    this.a = pa * la + pb * lc;
                    this.b = pa * lb + pb * ld;
                    this.c = pc * la + pd * lc;
                    this.d = pc * lb + pd * ld;
                    return;
                }
                case spine.Inherit.OnlyTranslation: {
                    const rx = (rotation + shearX) * spine.MathUtils.degRad;
                    const ry = (rotation + 90 + shearY) * spine.MathUtils.degRad;
                    this.a = Math.cos(rx) * scaleX;
                    this.b = Math.cos(ry) * scaleY;
                    this.c = Math.sin(rx) * scaleX;
                    this.d = Math.sin(ry) * scaleY;
                    break;
                }
                case spine.Inherit.NoRotationOrReflection: {
                    let s = pa * pa + pc * pc;
                    let prx = 0;
                    if (s > 0.0001) {
                        s = Math.abs(pa * pd - pb * pc) / s;
                        pa /= this.skeleton.scaleX;
                        pc /= this.skeleton.scaleY;
                        pb = pc * s;
                        pd = pa * s;
                        prx = Math.atan2(pc, pa) * spine.MathUtils.radDeg;
                    }
                    else {
                        pa = 0;
                        pc = 0;
                        prx = 90 - Math.atan2(pd, pb) * spine.MathUtils.radDeg;
                    }
                    const rx = (rotation + shearX - prx) * spine.MathUtils.degRad;
                    const ry = (rotation + shearY - prx + 90) * spine.MathUtils.degRad;
                    const la = Math.cos(rx) * scaleX;
                    const lb = Math.cos(ry) * scaleY;
                    const lc = Math.sin(rx) * scaleX;
                    const ld = Math.sin(ry) * scaleY;
                    this.a = pa * la - pb * lc;
                    this.b = pa * lb - pb * ld;
                    this.c = pc * la + pd * lc;
                    this.d = pc * lb + pd * ld;
                    break;
                }
                case spine.Inherit.NoScale:
                case spine.Inherit.NoScaleOrReflection: {
                    rotation *= spine.MathUtils.degRad;
                    const cos = Math.cos(rotation), sin = Math.sin(rotation);
                    let za = (pa * cos + pb * sin) / this.skeleton.scaleX;
                    let zc = (pc * cos + pd * sin) / this.skeleton.scaleY;
                    let s = Math.sqrt(za * za + zc * zc);
                    if (s > 0.00001)
                        s = 1 / s;
                    za *= s;
                    zc *= s;
                    s = Math.sqrt(za * za + zc * zc);
                    if (this.inherit == spine.Inherit.NoScale
                        && (pa * pd - pb * pc < 0) != (this.skeleton.scaleX < 0 != this.skeleton.scaleY < 0))
                        s = -s;
                    rotation = Math.PI / 2 + Math.atan2(zc, za);
                    const zb = Math.cos(rotation) * s;
                    const zd = Math.sin(rotation) * s;
                    shearX *= spine.MathUtils.degRad;
                    shearY = (90 + shearY) * spine.MathUtils.degRad;
                    const la = Math.cos(shearX) * scaleX;
                    const lb = Math.cos(shearY) * scaleY;
                    const lc = Math.sin(shearX) * scaleX;
                    const ld = Math.sin(shearY) * scaleY;
                    this.a = za * la + zb * lc;
                    this.b = za * lb + zb * ld;
                    this.c = zc * la + zd * lc;
                    this.d = zc * lb + zd * ld;
                    break;
                }
            }
            this.a *= this.skeleton.scaleX;
            this.b *= this.skeleton.scaleX;
            this.c *= this.skeleton.scaleY;
            this.d *= this.skeleton.scaleY;
        }
        setToSetupPose() {
            let data = this.data;
            this.x = data.x;
            this.y = data.y;
            this.rotation = data.rotation;
            this.scaleX = data.scaleX;
            this.scaleY = data.scaleY;
            this.shearX = data.shearX;
            this.shearY = data.shearY;
            this.inherit = data.inherit;
        }
        updateAppliedTransform() {
            let parent = this.parent;
            if (!parent) {
                this.ax = this.worldX - this.skeleton.x;
                this.ay = this.worldY - this.skeleton.y;
                this.arotation = Math.atan2(this.c, this.a) * spine.MathUtils.radDeg;
                this.ascaleX = Math.sqrt(this.a * this.a + this.c * this.c);
                this.ascaleY = Math.sqrt(this.b * this.b + this.d * this.d);
                this.ashearX = 0;
                this.ashearY = Math.atan2(this.a * this.b + this.c * this.d, this.a * this.d - this.b * this.c) * spine.MathUtils.radDeg;
                return;
            }
            let pa = parent.a, pb = parent.b, pc = parent.c, pd = parent.d;
            let pid = 1 / (pa * pd - pb * pc);
            let ia = pd * pid, ib = pb * pid, ic = pc * pid, id = pa * pid;
            let dx = this.worldX - parent.worldX, dy = this.worldY - parent.worldY;
            this.ax = (dx * ia - dy * ib);
            this.ay = (dy * id - dx * ic);
            let ra, rb, rc, rd;
            if (this.inherit == spine.Inherit.OnlyTranslation) {
                ra = this.a;
                rb = this.b;
                rc = this.c;
                rd = this.d;
            }
            else {
                switch (this.inherit) {
                    case spine.Inherit.NoRotationOrReflection: {
                        let s = Math.abs(pa * pd - pb * pc) / (pa * pa + pc * pc);
                        let sa = pa / this.skeleton.scaleX;
                        let sc = pc / this.skeleton.scaleY;
                        pb = -sc * s * this.skeleton.scaleX;
                        pd = sa * s * this.skeleton.scaleY;
                        pid = 1 / (pa * pd - pb * pc);
                        ia = pd * pid;
                        ib = pb * pid;
                        break;
                    }
                    case spine.Inherit.NoScale:
                    case spine.Inherit.NoScaleOrReflection:
                        let cos = spine.MathUtils.cosDeg(this.rotation), sin = spine.MathUtils.sinDeg(this.rotation);
                        pa = (pa * cos + pb * sin) / this.skeleton.scaleX;
                        pc = (pc * cos + pd * sin) / this.skeleton.scaleY;
                        let s = Math.sqrt(pa * pa + pc * pc);
                        if (s > 0.00001)
                            s = 1 / s;
                        pa *= s;
                        pc *= s;
                        s = Math.sqrt(pa * pa + pc * pc);
                        if (this.inherit == spine.Inherit.NoScale && pid < 0 != (this.skeleton.scaleX < 0 != this.skeleton.scaleY < 0))
                            s = -s;
                        let r = spine.MathUtils.PI / 2 + Math.atan2(pc, pa);
                        pb = Math.cos(r) * s;
                        pd = Math.sin(r) * s;
                        pid = 1 / (pa * pd - pb * pc);
                        ia = pd * pid;
                        ib = pb * pid;
                        ic = pc * pid;
                        id = pa * pid;
                }
                ra = ia * this.a - ib * this.c;
                rb = ia * this.b - ib * this.d;
                rc = id * this.c - ic * this.a;
                rd = id * this.d - ic * this.b;
            }
            this.ashearX = 0;
            this.ascaleX = Math.sqrt(ra * ra + rc * rc);
            if (this.ascaleX > 0.0001) {
                let det = ra * rd - rb * rc;
                this.ascaleY = det / this.ascaleX;
                this.ashearY = -Math.atan2(ra * rb + rc * rd, det) * spine.MathUtils.radDeg;
                this.arotation = Math.atan2(rc, ra) * spine.MathUtils.radDeg;
            }
            else {
                this.ascaleX = 0;
                this.ascaleY = Math.sqrt(rb * rb + rd * rd);
                this.ashearY = 0;
                this.arotation = 90 - Math.atan2(rd, rb) * spine.MathUtils.radDeg;
            }
        }
        getWorldRotationX() {
            return Math.atan2(this.c, this.a) * spine.MathUtils.radDeg;
        }
        getWorldRotationY() {
            return Math.atan2(this.d, this.b) * spine.MathUtils.radDeg;
        }
        getWorldScaleX() {
            return Math.sqrt(this.a * this.a + this.c * this.c);
        }
        getWorldScaleY() {
            return Math.sqrt(this.b * this.b + this.d * this.d);
        }
        worldToLocal(world) {
            let invDet = 1 / (this.a * this.d - this.b * this.c);
            let x = world.x - this.worldX, y = world.y - this.worldY;
            world.x = x * this.d * invDet - y * this.b * invDet;
            world.y = y * this.a * invDet - x * this.c * invDet;
            return world;
        }
        localToWorld(local) {
            let x = local.x, y = local.y;
            local.x = x * this.a + y * this.b + this.worldX;
            local.y = x * this.c + y * this.d + this.worldY;
            return local;
        }
        worldToParent(world) {
            if (world == null)
                throw new Error("world cannot be null.");
            return this.parent == null ? world : this.parent.worldToLocal(world);
        }
        parentToWorld(world) {
            if (world == null)
                throw new Error("world cannot be null.");
            return this.parent == null ? world : this.parent.localToWorld(world);
        }
        worldToLocalRotation(worldRotation) {
            let sin = spine.MathUtils.sinDeg(worldRotation), cos = spine.MathUtils.cosDeg(worldRotation);
            return Math.atan2(this.a * sin - this.c * cos, this.d * cos - this.b * sin) * spine.MathUtils.radDeg + this.rotation - this.shearX;
        }
        localToWorldRotation(localRotation) {
            localRotation -= this.rotation - this.shearX;
            let sin = spine.MathUtils.sinDeg(localRotation), cos = spine.MathUtils.cosDeg(localRotation);
            return Math.atan2(cos * this.c + sin * this.d, cos * this.a + sin * this.b) * spine.MathUtils.radDeg;
        }
        rotateWorld(degrees) {
            degrees *= spine.MathUtils.degRad;
            const sin = Math.sin(degrees), cos = Math.cos(degrees);
            const ra = this.a, rb = this.b;
            this.a = cos * ra - sin * this.c;
            this.b = cos * rb - sin * this.d;
            this.c = sin * ra + cos * this.c;
            this.d = sin * rb + cos * this.d;
        }
    }
    spine.Bone = Bone;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class BoneData {
        constructor(index, name, parent) {
            this.index = 0;
            this.parent = null;
            this.length = 0;
            this.x = 0;
            this.y = 0;
            this.rotation = 0;
            this.scaleX = 1;
            this.scaleY = 1;
            this.shearX = 0;
            this.shearY = 0;
            this.inherit = Inherit.Normal;
            this.skinRequired = false;
            this.color = new spine.Color();
            this.visible = false;
            if (index < 0)
                throw new Error("index must be >= 0.");
            if (!name)
                throw new Error("name cannot be null.");
            this.index = index;
            this.name = name;
            this.parent = parent;
        }
    }
    spine.BoneData = BoneData;
    let Inherit;
    (function (Inherit) {
        Inherit[Inherit["Normal"] = 0] = "Normal";
        Inherit[Inherit["OnlyTranslation"] = 1] = "OnlyTranslation";
        Inherit[Inherit["NoRotationOrReflection"] = 2] = "NoRotationOrReflection";
        Inherit[Inherit["NoScale"] = 3] = "NoScale";
        Inherit[Inherit["NoScaleOrReflection"] = 4] = "NoScaleOrReflection";
    })(Inherit = spine.Inherit || (spine.Inherit = {}));
})(spine || (spine = {}));
var spine;
(function (spine) {
    class ConstraintData {
        constructor(name, order, skinRequired) {
            this.name = name;
            this.order = order;
            this.skinRequired = skinRequired;
        }
    }
    spine.ConstraintData = ConstraintData;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class Event {
        constructor(time, data) {
            this.intValue = 0;
            this.floatValue = 0;
            this.stringValue = null;
            this.time = 0;
            this.volume = 0;
            this.balance = 0;
            if (!data)
                throw new Error("data cannot be null.");
            this.time = time;
            this.data = data;
        }
    }
    spine.Event = Event;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class EventData {
        constructor(name) {
            this.intValue = 0;
            this.floatValue = 0;
            this.stringValue = null;
            this.audioPath = null;
            this.volume = 0;
            this.balance = 0;
            this.name = name;
        }
    }
    spine.EventData = EventData;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class IkConstraint {
        constructor(data, skeleton) {
            this.bendDirection = 0;
            this.compress = false;
            this.stretch = false;
            this.mix = 1;
            this.softness = 0;
            this.active = false;
            if (!data)
                throw new Error("data cannot be null.");
            if (!skeleton)
                throw new Error("skeleton cannot be null.");
            this.data = data;
            this.bones = new Array();
            for (let i = 0; i < data.bones.length; i++) {
                let bone = skeleton.findBone(data.bones[i].name);
                if (!bone)
                    throw new Error(`Couldn't find bone ${data.bones[i].name}`);
                this.bones.push(bone);
            }
            let target = skeleton.findBone(data.target.name);
            if (!target)
                throw new Error(`Couldn't find bone ${data.target.name}`);
            this.target = target;
            this.mix = data.mix;
            this.softness = data.softness;
            this.bendDirection = data.bendDirection;
            this.compress = data.compress;
            this.stretch = data.stretch;
        }
        isActive() {
            return this.active;
        }
        setToSetupPose() {
            const data = this.data;
            this.mix = data.mix;
            this.softness = data.softness;
            this.bendDirection = data.bendDirection;
            this.compress = data.compress;
            this.stretch = data.stretch;
        }
        update(physics) {
            if (this.mix == 0)
                return;
            let target = this.target;
            let bones = this.bones;
            switch (bones.length) {
                case 1:
                    this.apply1(bones[0], target.worldX, target.worldY, this.compress, this.stretch, this.data.uniform, this.mix);
                    break;
                case 2:
                    this.apply2(bones[0], bones[1], target.worldX, target.worldY, this.bendDirection, this.stretch, this.data.uniform, this.softness, this.mix);
                    break;
            }
        }
        apply1(bone, targetX, targetY, compress, stretch, uniform, alpha) {
            let p = bone.parent;
            if (!p)
                throw new Error("IK bone must have parent.");
            let pa = p.a, pb = p.b, pc = p.c, pd = p.d;
            let rotationIK = -bone.ashearX - bone.arotation, tx = 0, ty = 0;
            switch (bone.inherit) {
                case spine.Inherit.OnlyTranslation:
                    tx = (targetX - bone.worldX) * spine.MathUtils.signum(bone.skeleton.scaleX);
                    ty = (targetY - bone.worldY) * spine.MathUtils.signum(bone.skeleton.scaleY);
                    break;
                case spine.Inherit.NoRotationOrReflection:
                    let s = Math.abs(pa * pd - pb * pc) / Math.max(0.0001, pa * pa + pc * pc);
                    let sa = pa / bone.skeleton.scaleX;
                    let sc = pc / bone.skeleton.scaleY;
                    pb = -sc * s * bone.skeleton.scaleX;
                    pd = sa * s * bone.skeleton.scaleY;
                    rotationIK += Math.atan2(sc, sa) * spine.MathUtils.radDeg;
                default:
                    let x = targetX - p.worldX, y = targetY - p.worldY;
                    let d = pa * pd - pb * pc;
                    if (Math.abs(d) <= 0.0001) {
                        tx = 0;
                        ty = 0;
                    }
                    else {
                        tx = (x * pd - y * pb) / d - bone.ax;
                        ty = (y * pa - x * pc) / d - bone.ay;
                    }
            }
            rotationIK += Math.atan2(ty, tx) * spine.MathUtils.radDeg;
            if (bone.ascaleX < 0)
                rotationIK += 180;
            if (rotationIK > 180)
                rotationIK -= 360;
            else if (rotationIK < -180)
                rotationIK += 360;
            let sx = bone.ascaleX, sy = bone.ascaleY;
            if (compress || stretch) {
                switch (bone.inherit) {
                    case spine.Inherit.NoScale:
                    case spine.Inherit.NoScaleOrReflection:
                        tx = targetX - bone.worldX;
                        ty = targetY - bone.worldY;
                }
                const b = bone.data.length * sx;
                if (b > 0.0001) {
                    const dd = tx * tx + ty * ty;
                    if ((compress && dd < b * b) || (stretch && dd > b * b)) {
                        const s = (Math.sqrt(dd) / b - 1) * alpha + 1;
                        sx *= s;
                        if (uniform)
                            sy *= s;
                    }
                }
            }
            bone.updateWorldTransformWith(bone.ax, bone.ay, bone.arotation + rotationIK * alpha, sx, sy, bone.ashearX, bone.ashearY);
        }
        apply2(parent, child, targetX, targetY, bendDir, stretch, uniform, softness, alpha) {
            if (parent.inherit != spine.Inherit.Normal || child.inherit != spine.Inherit.Normal)
                return;
            let px = parent.ax, py = parent.ay, psx = parent.ascaleX, psy = parent.ascaleY, sx = psx, sy = psy, csx = child.ascaleX;
            let os1 = 0, os2 = 0, s2 = 0;
            if (psx < 0) {
                psx = -psx;
                os1 = 180;
                s2 = -1;
            }
            else {
                os1 = 0;
                s2 = 1;
            }
            if (psy < 0) {
                psy = -psy;
                s2 = -s2;
            }
            if (csx < 0) {
                csx = -csx;
                os2 = 180;
            }
            else
                os2 = 0;
            let cx = child.ax, cy = 0, cwx = 0, cwy = 0, a = parent.a, b = parent.b, c = parent.c, d = parent.d;
            let u = Math.abs(psx - psy) <= 0.0001;
            if (!u || stretch) {
                cy = 0;
                cwx = a * cx + parent.worldX;
                cwy = c * cx + parent.worldY;
            }
            else {
                cy = child.ay;
                cwx = a * cx + b * cy + parent.worldX;
                cwy = c * cx + d * cy + parent.worldY;
            }
            let pp = parent.parent;
            if (!pp)
                throw new Error("IK parent must itself have a parent.");
            a = pp.a;
            b = pp.b;
            c = pp.c;
            d = pp.d;
            let id = a * d - b * c, x = cwx - pp.worldX, y = cwy - pp.worldY;
            id = Math.abs(id) <= 0.0001 ? 0 : 1 / id;
            let dx = (x * d - y * b) * id - px, dy = (y * a - x * c) * id - py;
            let l1 = Math.sqrt(dx * dx + dy * dy), l2 = child.data.length * csx, a1, a2;
            if (l1 < 0.0001) {
                this.apply1(parent, targetX, targetY, false, stretch, false, alpha);
                child.updateWorldTransformWith(cx, cy, 0, child.ascaleX, child.ascaleY, child.ashearX, child.ashearY);
                return;
            }
            x = targetX - pp.worldX;
            y = targetY - pp.worldY;
            let tx = (x * d - y * b) * id - px, ty = (y * a - x * c) * id - py;
            let dd = tx * tx + ty * ty;
            if (softness != 0) {
                softness *= psx * (csx + 1) * 0.5;
                let td = Math.sqrt(dd), sd = td - l1 - l2 * psx + softness;
                if (sd > 0) {
                    let p = Math.min(1, sd / (softness * 2)) - 1;
                    p = (sd - softness * (1 - p * p)) / td;
                    tx -= p * tx;
                    ty -= p * ty;
                    dd = tx * tx + ty * ty;
                }
            }
            outer: if (u) {
                l2 *= psx;
                let cos = (dd - l1 * l1 - l2 * l2) / (2 * l1 * l2);
                if (cos < -1) {
                    cos = -1;
                    a2 = Math.PI * bendDir;
                }
                else if (cos > 1) {
                    cos = 1;
                    a2 = 0;
                    if (stretch) {
                        a = (Math.sqrt(dd) / (l1 + l2) - 1) * alpha + 1;
                        sx *= a;
                        if (uniform)
                            sy *= a;
                    }
                }
                else
                    a2 = Math.acos(cos) * bendDir;
                a = l1 + l2 * cos;
                b = l2 * Math.sin(a2);
                a1 = Math.atan2(ty * a - tx * b, tx * a + ty * b);
            }
            else {
                a = psx * l2;
                b = psy * l2;
                let aa = a * a, bb = b * b, ta = Math.atan2(ty, tx);
                c = bb * l1 * l1 + aa * dd - aa * bb;
                let c1 = -2 * bb * l1, c2 = bb - aa;
                d = c1 * c1 - 4 * c2 * c;
                if (d >= 0) {
                    let q = Math.sqrt(d);
                    if (c1 < 0)
                        q = -q;
                    q = -(c1 + q) * 0.5;
                    let r0 = q / c2, r1 = c / q;
                    let r = Math.abs(r0) < Math.abs(r1) ? r0 : r1;
                    r0 = dd - r * r;
                    if (r0 >= 0) {
                        y = Math.sqrt(r0) * bendDir;
                        a1 = ta - Math.atan2(y, r);
                        a2 = Math.atan2(y / psy, (r - l1) / psx);
                        break outer;
                    }
                }
                let minAngle = spine.MathUtils.PI, minX = l1 - a, minDist = minX * minX, minY = 0;
                let maxAngle = 0, maxX = l1 + a, maxDist = maxX * maxX, maxY = 0;
                c = -a * l1 / (aa - bb);
                if (c >= -1 && c <= 1) {
                    c = Math.acos(c);
                    x = a * Math.cos(c) + l1;
                    y = b * Math.sin(c);
                    d = x * x + y * y;
                    if (d < minDist) {
                        minAngle = c;
                        minDist = d;
                        minX = x;
                        minY = y;
                    }
                    if (d > maxDist) {
                        maxAngle = c;
                        maxDist = d;
                        maxX = x;
                        maxY = y;
                    }
                }
                if (dd <= (minDist + maxDist) * 0.5) {
                    a1 = ta - Math.atan2(minY * bendDir, minX);
                    a2 = minAngle * bendDir;
                }
                else {
                    a1 = ta - Math.atan2(maxY * bendDir, maxX);
                    a2 = maxAngle * bendDir;
                }
            }
            let os = Math.atan2(cy, cx) * s2;
            let rotation = parent.arotation;
            a1 = (a1 - os) * spine.MathUtils.radDeg + os1 - rotation;
            if (a1 > 180)
                a1 -= 360;
            else if (a1 < -180)
                a1 += 360;
            parent.updateWorldTransformWith(px, py, rotation + a1 * alpha, sx, sy, 0, 0);
            rotation = child.arotation;
            a2 = ((a2 + os) * spine.MathUtils.radDeg - child.ashearX) * s2 + os2 - rotation;
            if (a2 > 180)
                a2 -= 360;
            else if (a2 < -180)
                a2 += 360;
            child.updateWorldTransformWith(cx, cy, rotation + a2 * alpha, child.ascaleX, child.ascaleY, child.ashearX, child.ashearY);
        }
    }
    spine.IkConstraint = IkConstraint;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class IkConstraintData extends spine.ConstraintData {
        constructor(name) {
            super(name, 0, false);
            this.bones = new Array();
            this._target = null;
            this.bendDirection = 0;
            this.compress = false;
            this.stretch = false;
            this.uniform = false;
            this.mix = 0;
            this.softness = 0;
        }
        set target(boneData) { this._target = boneData; }
        get target() {
            if (!this._target)
                throw new Error("BoneData not set.");
            else
                return this._target;
        }
    }
    spine.IkConstraintData = IkConstraintData;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class PathConstraint {
        constructor(data, skeleton) {
            this.position = 0;
            this.spacing = 0;
            this.mixRotate = 0;
            this.mixX = 0;
            this.mixY = 0;
            this.spaces = new Array();
            this.positions = new Array();
            this.world = new Array();
            this.curves = new Array();
            this.lengths = new Array();
            this.segments = new Array();
            this.active = false;
            if (!data)
                throw new Error("data cannot be null.");
            if (!skeleton)
                throw new Error("skeleton cannot be null.");
            this.data = data;
            this.bones = new Array();
            for (let i = 0, n = data.bones.length; i < n; i++) {
                let bone = skeleton.findBone(data.bones[i].name);
                if (!bone)
                    throw new Error(`Couldn't find bone ${data.bones[i].name}.`);
                this.bones.push(bone);
            }
            let target = skeleton.findSlot(data.target.name);
            if (!target)
                throw new Error(`Couldn't find target bone ${data.target.name}`);
            this.target = target;
            this.position = data.position;
            this.spacing = data.spacing;
            this.mixRotate = data.mixRotate;
            this.mixX = data.mixX;
            this.mixY = data.mixY;
        }
        isActive() {
            return this.active;
        }
        setToSetupPose() {
            const data = this.data;
            this.position = data.position;
            this.spacing = data.spacing;
            this.mixRotate = data.mixRotate;
            this.mixX = data.mixX;
            this.mixY = data.mixY;
        }
        update(physics) {
            let attachment = this.target.getAttachment();
            if (!(attachment instanceof spine.PathAttachment))
                return;
            let mixRotate = this.mixRotate, mixX = this.mixX, mixY = this.mixY;
            if (mixRotate == 0 && mixX == 0 && mixY == 0)
                return;
            let data = this.data;
            let tangents = data.rotateMode == spine.RotateMode.Tangent, scale = data.rotateMode == spine.RotateMode.ChainScale;
            let bones = this.bones;
            let boneCount = bones.length, spacesCount = tangents ? boneCount : boneCount + 1;
            let spaces = spine.Utils.setArraySize(this.spaces, spacesCount), lengths = scale ? this.lengths = spine.Utils.setArraySize(this.lengths, boneCount) : [];
            let spacing = this.spacing;
            switch (data.spacingMode) {
                case spine.SpacingMode.Percent:
                    if (scale) {
                        for (let i = 0, n = spacesCount - 1; i < n; i++) {
                            let bone = bones[i];
                            let setupLength = bone.data.length;
                            let x = setupLength * bone.a, y = setupLength * bone.c;
                            lengths[i] = Math.sqrt(x * x + y * y);
                        }
                    }
                    spine.Utils.arrayFill(spaces, 1, spacesCount, spacing);
                    break;
                case spine.SpacingMode.Proportional:
                    let sum = 0;
                    for (let i = 0, n = spacesCount - 1; i < n;) {
                        let bone = bones[i];
                        let setupLength = bone.data.length;
                        if (setupLength < PathConstraint.epsilon) {
                            if (scale)
                                lengths[i] = 0;
                            spaces[++i] = spacing;
                        }
                        else {
                            let x = setupLength * bone.a, y = setupLength * bone.c;
                            let length = Math.sqrt(x * x + y * y);
                            if (scale)
                                lengths[i] = length;
                            spaces[++i] = length;
                            sum += length;
                        }
                    }
                    if (sum > 0) {
                        sum = spacesCount / sum * spacing;
                        for (let i = 1; i < spacesCount; i++)
                            spaces[i] *= sum;
                    }
                    break;
                default:
                    let lengthSpacing = data.spacingMode == spine.SpacingMode.Length;
                    for (let i = 0, n = spacesCount - 1; i < n;) {
                        let bone = bones[i];
                        let setupLength = bone.data.length;
                        if (setupLength < PathConstraint.epsilon) {
                            if (scale)
                                lengths[i] = 0;
                            spaces[++i] = spacing;
                        }
                        else {
                            let x = setupLength * bone.a, y = setupLength * bone.c;
                            let length = Math.sqrt(x * x + y * y);
                            if (scale)
                                lengths[i] = length;
                            spaces[++i] = (lengthSpacing ? setupLength + spacing : spacing) * length / setupLength;
                        }
                    }
            }
            let positions = this.computeWorldPositions(attachment, spacesCount, tangents);
            let boneX = positions[0], boneY = positions[1], offsetRotation = data.offsetRotation;
            let tip = false;
            if (offsetRotation == 0)
                tip = data.rotateMode == spine.RotateMode.Chain;
            else {
                tip = false;
                let p = this.target.bone;
                offsetRotation *= p.a * p.d - p.b * p.c > 0 ? spine.MathUtils.degRad : -spine.MathUtils.degRad;
            }
            for (let i = 0, p = 3; i < boneCount; i++, p += 3) {
                let bone = bones[i];
                bone.worldX += (boneX - bone.worldX) * mixX;
                bone.worldY += (boneY - bone.worldY) * mixY;
                let x = positions[p], y = positions[p + 1], dx = x - boneX, dy = y - boneY;
                if (scale) {
                    let length = lengths[i];
                    if (length != 0) {
                        let s = (Math.sqrt(dx * dx + dy * dy) / length - 1) * mixRotate + 1;
                        bone.a *= s;
                        bone.c *= s;
                    }
                }
                boneX = x;
                boneY = y;
                if (mixRotate > 0) {
                    let a = bone.a, b = bone.b, c = bone.c, d = bone.d, r = 0, cos = 0, sin = 0;
                    if (tangents)
                        r = positions[p - 1];
                    else if (spaces[i + 1] == 0)
                        r = positions[p + 2];
                    else
                        r = Math.atan2(dy, dx);
                    r -= Math.atan2(c, a);
                    if (tip) {
                        cos = Math.cos(r);
                        sin = Math.sin(r);
                        let length = bone.data.length;
                        boneX += (length * (cos * a - sin * c) - dx) * mixRotate;
                        boneY += (length * (sin * a + cos * c) - dy) * mixRotate;
                    }
                    else {
                        r += offsetRotation;
                    }
                    if (r > spine.MathUtils.PI)
                        r -= spine.MathUtils.PI2;
                    else if (r < -spine.MathUtils.PI)
                        r += spine.MathUtils.PI2;
                    r *= mixRotate;
                    cos = Math.cos(r);
                    sin = Math.sin(r);
                    bone.a = cos * a - sin * c;
                    bone.b = cos * b - sin * d;
                    bone.c = sin * a + cos * c;
                    bone.d = sin * b + cos * d;
                }
                bone.updateAppliedTransform();
            }
        }
        computeWorldPositions(path, spacesCount, tangents) {
            let target = this.target;
            let position = this.position;
            let spaces = this.spaces, out = spine.Utils.setArraySize(this.positions, spacesCount * 3 + 2), world = this.world;
            let closed = path.closed;
            let verticesLength = path.worldVerticesLength, curveCount = verticesLength / 6, prevCurve = PathConstraint.NONE;
            if (!path.constantSpeed) {
                let lengths = path.lengths;
                curveCount -= closed ? 1 : 2;
                let pathLength = lengths[curveCount];
                if (this.data.positionMode == spine.PositionMode.Percent)
                    position *= pathLength;
                let multiplier;
                switch (this.data.spacingMode) {
                    case spine.SpacingMode.Percent:
                        multiplier = pathLength;
                        break;
                    case spine.SpacingMode.Proportional:
                        multiplier = pathLength / spacesCount;
                        break;
                    default:
                        multiplier = 1;
                }
                world = spine.Utils.setArraySize(this.world, 8);
                for (let i = 0, o = 0, curve = 0; i < spacesCount; i++, o += 3) {
                    let space = spaces[i] * multiplier;
                    position += space;
                    let p = position;
                    if (closed) {
                        p %= pathLength;
                        if (p < 0)
                            p += pathLength;
                        curve = 0;
                    }
                    else if (p < 0) {
                        if (prevCurve != PathConstraint.BEFORE) {
                            prevCurve = PathConstraint.BEFORE;
                            path.computeWorldVertices(target, 2, 4, world, 0, 2);
                        }
                        this.addBeforePosition(p, world, 0, out, o);
                        continue;
                    }
                    else if (p > pathLength) {
                        if (prevCurve != PathConstraint.AFTER) {
                            prevCurve = PathConstraint.AFTER;
                            path.computeWorldVertices(target, verticesLength - 6, 4, world, 0, 2);
                        }
                        this.addAfterPosition(p - pathLength, world, 0, out, o);
                        continue;
                    }
                    for (;; curve++) {
                        let length = lengths[curve];
                        if (p > length)
                            continue;
                        if (curve == 0)
                            p /= length;
                        else {
                            let prev = lengths[curve - 1];
                            p = (p - prev) / (length - prev);
                        }
                        break;
                    }
                    if (curve != prevCurve) {
                        prevCurve = curve;
                        if (closed && curve == curveCount) {
                            path.computeWorldVertices(target, verticesLength - 4, 4, world, 0, 2);
                            path.computeWorldVertices(target, 0, 4, world, 4, 2);
                        }
                        else
                            path.computeWorldVertices(target, curve * 6 + 2, 8, world, 0, 2);
                    }
                    this.addCurvePosition(p, world[0], world[1], world[2], world[3], world[4], world[5], world[6], world[7], out, o, tangents || (i > 0 && space == 0));
                }
                return out;
            }
            if (closed) {
                verticesLength += 2;
                world = spine.Utils.setArraySize(this.world, verticesLength);
                path.computeWorldVertices(target, 2, verticesLength - 4, world, 0, 2);
                path.computeWorldVertices(target, 0, 2, world, verticesLength - 4, 2);
                world[verticesLength - 2] = world[0];
                world[verticesLength - 1] = world[1];
            }
            else {
                curveCount--;
                verticesLength -= 4;
                world = spine.Utils.setArraySize(this.world, verticesLength);
                path.computeWorldVertices(target, 2, verticesLength, world, 0, 2);
            }
            let curves = spine.Utils.setArraySize(this.curves, curveCount);
            let pathLength = 0;
            let x1 = world[0], y1 = world[1], cx1 = 0, cy1 = 0, cx2 = 0, cy2 = 0, x2 = 0, y2 = 0;
            let tmpx = 0, tmpy = 0, dddfx = 0, dddfy = 0, ddfx = 0, ddfy = 0, dfx = 0, dfy = 0;
            for (let i = 0, w = 2; i < curveCount; i++, w += 6) {
                cx1 = world[w];
                cy1 = world[w + 1];
                cx2 = world[w + 2];
                cy2 = world[w + 3];
                x2 = world[w + 4];
                y2 = world[w + 5];
                tmpx = (x1 - cx1 * 2 + cx2) * 0.1875;
                tmpy = (y1 - cy1 * 2 + cy2) * 0.1875;
                dddfx = ((cx1 - cx2) * 3 - x1 + x2) * 0.09375;
                dddfy = ((cy1 - cy2) * 3 - y1 + y2) * 0.09375;
                ddfx = tmpx * 2 + dddfx;
                ddfy = tmpy * 2 + dddfy;
                dfx = (cx1 - x1) * 0.75 + tmpx + dddfx * 0.16666667;
                dfy = (cy1 - y1) * 0.75 + tmpy + dddfy * 0.16666667;
                pathLength += Math.sqrt(dfx * dfx + dfy * dfy);
                dfx += ddfx;
                dfy += ddfy;
                ddfx += dddfx;
                ddfy += dddfy;
                pathLength += Math.sqrt(dfx * dfx + dfy * dfy);
                dfx += ddfx;
                dfy += ddfy;
                pathLength += Math.sqrt(dfx * dfx + dfy * dfy);
                dfx += ddfx + dddfx;
                dfy += ddfy + dddfy;
                pathLength += Math.sqrt(dfx * dfx + dfy * dfy);
                curves[i] = pathLength;
                x1 = x2;
                y1 = y2;
            }
            if (this.data.positionMode == spine.PositionMode.Percent)
                position *= pathLength;
            let multiplier;
            switch (this.data.spacingMode) {
                case spine.SpacingMode.Percent:
                    multiplier = pathLength;
                    break;
                case spine.SpacingMode.Proportional:
                    multiplier = pathLength / spacesCount;
                    break;
                default:
                    multiplier = 1;
            }
            let segments = this.segments;
            let curveLength = 0;
            for (let i = 0, o = 0, curve = 0, segment = 0; i < spacesCount; i++, o += 3) {
                let space = spaces[i] * multiplier;
                position += space;
                let p = position;
                if (closed) {
                    p %= pathLength;
                    if (p < 0)
                        p += pathLength;
                    curve = 0;
                }
                else if (p < 0) {
                    this.addBeforePosition(p, world, 0, out, o);
                    continue;
                }
                else if (p > pathLength) {
                    this.addAfterPosition(p - pathLength, world, verticesLength - 4, out, o);
                    continue;
                }
                for (;; curve++) {
                    let length = curves[curve];
                    if (p > length)
                        continue;
                    if (curve == 0)
                        p /= length;
                    else {
                        let prev = curves[curve - 1];
                        p = (p - prev) / (length - prev);
                    }
                    break;
                }
                if (curve != prevCurve) {
                    prevCurve = curve;
                    let ii = curve * 6;
                    x1 = world[ii];
                    y1 = world[ii + 1];
                    cx1 = world[ii + 2];
                    cy1 = world[ii + 3];
                    cx2 = world[ii + 4];
                    cy2 = world[ii + 5];
                    x2 = world[ii + 6];
                    y2 = world[ii + 7];
                    tmpx = (x1 - cx1 * 2 + cx2) * 0.03;
                    tmpy = (y1 - cy1 * 2 + cy2) * 0.03;
                    dddfx = ((cx1 - cx2) * 3 - x1 + x2) * 0.006;
                    dddfy = ((cy1 - cy2) * 3 - y1 + y2) * 0.006;
                    ddfx = tmpx * 2 + dddfx;
                    ddfy = tmpy * 2 + dddfy;
                    dfx = (cx1 - x1) * 0.3 + tmpx + dddfx * 0.16666667;
                    dfy = (cy1 - y1) * 0.3 + tmpy + dddfy * 0.16666667;
                    curveLength = Math.sqrt(dfx * dfx + dfy * dfy);
                    segments[0] = curveLength;
                    for (ii = 1; ii < 8; ii++) {
                        dfx += ddfx;
                        dfy += ddfy;
                        ddfx += dddfx;
                        ddfy += dddfy;
                        curveLength += Math.sqrt(dfx * dfx + dfy * dfy);
                        segments[ii] = curveLength;
                    }
                    dfx += ddfx;
                    dfy += ddfy;
                    curveLength += Math.sqrt(dfx * dfx + dfy * dfy);
                    segments[8] = curveLength;
                    dfx += ddfx + dddfx;
                    dfy += ddfy + dddfy;
                    curveLength += Math.sqrt(dfx * dfx + dfy * dfy);
                    segments[9] = curveLength;
                    segment = 0;
                }
                p *= curveLength;
                for (;; segment++) {
                    let length = segments[segment];
                    if (p > length)
                        continue;
                    if (segment == 0)
                        p /= length;
                    else {
                        let prev = segments[segment - 1];
                        p = segment + (p - prev) / (length - prev);
                    }
                    break;
                }
                this.addCurvePosition(p * 0.1, x1, y1, cx1, cy1, cx2, cy2, x2, y2, out, o, tangents || (i > 0 && space == 0));
            }
            return out;
        }
        addBeforePosition(p, temp, i, out, o) {
            let x1 = temp[i], y1 = temp[i + 1], dx = temp[i + 2] - x1, dy = temp[i + 3] - y1, r = Math.atan2(dy, dx);
            out[o] = x1 + p * Math.cos(r);
            out[o + 1] = y1 + p * Math.sin(r);
            out[o + 2] = r;
        }
        addAfterPosition(p, temp, i, out, o) {
            let x1 = temp[i + 2], y1 = temp[i + 3], dx = x1 - temp[i], dy = y1 - temp[i + 1], r = Math.atan2(dy, dx);
            out[o] = x1 + p * Math.cos(r);
            out[o + 1] = y1 + p * Math.sin(r);
            out[o + 2] = r;
        }
        addCurvePosition(p, x1, y1, cx1, cy1, cx2, cy2, x2, y2, out, o, tangents) {
            if (p == 0 || isNaN(p)) {
                out[o] = x1;
                out[o + 1] = y1;
                out[o + 2] = Math.atan2(cy1 - y1, cx1 - x1);
                return;
            }
            let tt = p * p, ttt = tt * p, u = 1 - p, uu = u * u, uuu = uu * u;
            let ut = u * p, ut3 = ut * 3, uut3 = u * ut3, utt3 = ut3 * p;
            let x = x1 * uuu + cx1 * uut3 + cx2 * utt3 + x2 * ttt, y = y1 * uuu + cy1 * uut3 + cy2 * utt3 + y2 * ttt;
            out[o] = x;
            out[o + 1] = y;
            if (tangents) {
                if (p < 0.001)
                    out[o + 2] = Math.atan2(cy1 - y1, cx1 - x1);
                else
                    out[o + 2] = Math.atan2(y - (y1 * uu + cy1 * ut * 2 + cy2 * tt), x - (x1 * uu + cx1 * ut * 2 + cx2 * tt));
            }
        }
    }
    PathConstraint.NONE = -1;
    PathConstraint.BEFORE = -2;
    PathConstraint.AFTER = -3;
    PathConstraint.epsilon = 0.00001;
    spine.PathConstraint = PathConstraint;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class PathConstraintData extends spine.ConstraintData {
        constructor(name) {
            super(name, 0, false);
            this.bones = new Array();
            this._target = null;
            this.positionMode = PositionMode.Fixed;
            this.spacingMode = SpacingMode.Fixed;
            this.rotateMode = RotateMode.Chain;
            this.offsetRotation = 0;
            this.position = 0;
            this.spacing = 0;
            this.mixRotate = 0;
            this.mixX = 0;
            this.mixY = 0;
        }
        set target(slotData) { this._target = slotData; }
        get target() {
            if (!this._target)
                throw new Error("SlotData not set.");
            else
                return this._target;
        }
    }
    spine.PathConstraintData = PathConstraintData;
    let PositionMode;
    (function (PositionMode) {
        PositionMode[PositionMode["Fixed"] = 0] = "Fixed";
        PositionMode[PositionMode["Percent"] = 1] = "Percent";
    })(PositionMode = spine.PositionMode || (spine.PositionMode = {}));
    let SpacingMode;
    (function (SpacingMode) {
        SpacingMode[SpacingMode["Length"] = 0] = "Length";
        SpacingMode[SpacingMode["Fixed"] = 1] = "Fixed";
        SpacingMode[SpacingMode["Percent"] = 2] = "Percent";
        SpacingMode[SpacingMode["Proportional"] = 3] = "Proportional";
    })(SpacingMode = spine.SpacingMode || (spine.SpacingMode = {}));
    let RotateMode;
    (function (RotateMode) {
        RotateMode[RotateMode["Tangent"] = 0] = "Tangent";
        RotateMode[RotateMode["Chain"] = 1] = "Chain";
        RotateMode[RotateMode["ChainScale"] = 2] = "ChainScale";
    })(RotateMode = spine.RotateMode || (spine.RotateMode = {}));
})(spine || (spine = {}));
var spine;
(function (spine) {
    class PhysicsConstraint {
        constructor(data, skeleton) {
            this._bone = null;
            this.inertia = 0;
            this.strength = 0;
            this.damping = 0;
            this.massInverse = 0;
            this.wind = 0;
            this.gravity = 0;
            this.mix = 0;
            this._reset = true;
            this.ux = 0;
            this.uy = 0;
            this.cx = 0;
            this.cy = 0;
            this.tx = 0;
            this.ty = 0;
            this.xOffset = 0;
            this.xVelocity = 0;
            this.yOffset = 0;
            this.yVelocity = 0;
            this.rotateOffset = 0;
            this.rotateVelocity = 0;
            this.scaleOffset = 0;
            this.scaleVelocity = 0;
            this.active = false;
            this.remaining = 0;
            this.lastTime = 0;
            this.data = data;
            this.skeleton = skeleton;
            this.bone = skeleton.bones[data.bone.index];
            this.inertia = data.inertia;
            this.strength = data.strength;
            this.damping = data.damping;
            this.massInverse = data.massInverse;
            this.wind = data.wind;
            this.gravity = data.gravity;
            this.mix = data.mix;
        }
        set bone(bone) { this._bone = bone; }
        get bone() {
            if (!this._bone)
                throw new Error("Bone not set.");
            else
                return this._bone;
        }
        reset() {
            this.remaining = 0;
            this.lastTime = this.skeleton.time;
            this._reset = true;
            this.xOffset = 0;
            this.xVelocity = 0;
            this.yOffset = 0;
            this.yVelocity = 0;
            this.rotateOffset = 0;
            this.rotateVelocity = 0;
            this.scaleOffset = 0;
            this.scaleVelocity = 0;
        }
        setToSetupPose() {
            const data = this.data;
            this.inertia = data.inertia;
            this.strength = data.strength;
            this.damping = data.damping;
            this.massInverse = data.massInverse;
            this.wind = data.wind;
            this.gravity = data.gravity;
            this.mix = data.mix;
        }
        isActive() {
            return this.active;
        }
        update(physics) {
            const mix = this.mix;
            if (mix == 0)
                return;
            const x = this.data.x > 0, y = this.data.y > 0, rotateOrShearX = this.data.rotate > 0 || this.data.shearX > 0, scaleX = this.data.scaleX > 0;
            const bone = this.bone;
            const l = bone.data.length;
            switch (physics) {
                case spine.Physics.none:
                    return;
                case spine.Physics.reset:
                    this.reset();
                case spine.Physics.update:
                    const skeleton = this.skeleton;
                    const delta = Math.max(this.skeleton.time - this.lastTime, 0);
                    this.remaining += delta;
                    this.lastTime = skeleton.time;
                    const bx = bone.worldX, by = bone.worldY;
                    if (this._reset) {
                        this._reset = false;
                        this.ux = bx;
                        this.uy = by;
                    }
                    else {
                        let a = this.remaining, i = this.inertia, t = this.data.step, f = this.skeleton.data.referenceScale, d = -1;
                        let qx = this.data.limit * delta, qy = qx * Math.abs(skeleton.scaleY);
                        qx *= Math.abs(skeleton.scaleX);
                        if (x || y) {
                            if (x) {
                                const u = (this.ux - bx) * i;
                                this.xOffset += u > qx ? qx : u < -qx ? -qx : u;
                                this.ux = bx;
                            }
                            if (y) {
                                const u = (this.uy - by) * i;
                                this.yOffset += u > qy ? qy : u < -qy ? -qy : u;
                                this.uy = by;
                            }
                            if (a >= t) {
                                d = Math.pow(this.damping, 60 * t);
                                const m = this.massInverse * t, e = this.strength, w = this.wind * f, g = (spine.Skeleton.yDown ? -this.gravity : this.gravity) * f;
                                do {
                                    if (x) {
                                        this.xVelocity += (w - this.xOffset * e) * m;
                                        this.xOffset += this.xVelocity * t;
                                        this.xVelocity *= d;
                                    }
                                    if (y) {
                                        this.yVelocity -= (g + this.yOffset * e) * m;
                                        this.yOffset += this.yVelocity * t;
                                        this.yVelocity *= d;
                                    }
                                    a -= t;
                                } while (a >= t);
                            }
                            if (x)
                                bone.worldX += this.xOffset * mix * this.data.x;
                            if (y)
                                bone.worldY += this.yOffset * mix * this.data.y;
                        }
                        if (rotateOrShearX || scaleX) {
                            let ca = Math.atan2(bone.c, bone.a), c = 0, s = 0, mr = 0;
                            let dx = this.cx - bone.worldX, dy = this.cy - bone.worldY;
                            if (dx > qx)
                                dx = qx;
                            else if (dx < -qx)
                                dx = -qx;
                            if (dy > qy)
                                dy = qy;
                            else if (dy < -qy)
                                dy = -qy;
                            if (rotateOrShearX) {
                                mr = (this.data.rotate + this.data.shearX) * mix;
                                let r = Math.atan2(dy + this.ty, dx + this.tx) - ca - this.rotateOffset * mr;
                                this.rotateOffset += (r - Math.ceil(r * spine.MathUtils.invPI2 - 0.5) * spine.MathUtils.PI2) * i;
                                r = this.rotateOffset * mr + ca;
                                c = Math.cos(r);
                                s = Math.sin(r);
                                if (scaleX) {
                                    r = l * bone.getWorldScaleX();
                                    if (r > 0)
                                        this.scaleOffset += (dx * c + dy * s) * i / r;
                                }
                            }
                            else {
                                c = Math.cos(ca);
                                s = Math.sin(ca);
                                const r = l * bone.getWorldScaleX();
                                if (r > 0)
                                    this.scaleOffset += (dx * c + dy * s) * i / r;
                            }
                            a = this.remaining;
                            if (a >= t) {
                                if (d == -1)
                                    d = Math.pow(this.damping, 60 * t);
                                const m = this.massInverse * t, e = this.strength, w = this.wind, g = (spine.Skeleton.yDown ? -this.gravity : this.gravity), h = l / f;
                                while (true) {
                                    a -= t;
                                    if (scaleX) {
                                        this.scaleVelocity += (w * c - g * s - this.scaleOffset * e) * m;
                                        this.scaleOffset += this.scaleVelocity * t;
                                        this.scaleVelocity *= d;
                                    }
                                    if (rotateOrShearX) {
                                        this.rotateVelocity -= ((w * s + g * c) * h + this.rotateOffset * e) * m;
                                        this.rotateOffset += this.rotateVelocity * t;
                                        this.rotateVelocity *= d;
                                        if (a < t)
                                            break;
                                        const r = this.rotateOffset * mr + ca;
                                        c = Math.cos(r);
                                        s = Math.sin(r);
                                    }
                                    else if (a < t)
                                        break;
                                }
                            }
                        }
                        this.remaining = a;
                    }
                    this.cx = bone.worldX;
                    this.cy = bone.worldY;
                    break;
                case spine.Physics.pose:
                    if (x)
                        bone.worldX += this.xOffset * mix * this.data.x;
                    if (y)
                        bone.worldY += this.yOffset * mix * this.data.y;
            }
            if (rotateOrShearX) {
                let o = this.rotateOffset * mix, s = 0, c = 0, a = 0;
                if (this.data.shearX > 0) {
                    let r = 0;
                    if (this.data.rotate > 0) {
                        r = o * this.data.rotate;
                        s = Math.sin(r);
                        c = Math.cos(r);
                        a = bone.b;
                        bone.b = c * a - s * bone.d;
                        bone.d = s * a + c * bone.d;
                    }
                    r += o * this.data.shearX;
                    s = Math.sin(r);
                    c = Math.cos(r);
                    a = bone.a;
                    bone.a = c * a - s * bone.c;
                    bone.c = s * a + c * bone.c;
                }
                else {
                    o *= this.data.rotate;
                    s = Math.sin(o);
                    c = Math.cos(o);
                    a = bone.a;
                    bone.a = c * a - s * bone.c;
                    bone.c = s * a + c * bone.c;
                    a = bone.b;
                    bone.b = c * a - s * bone.d;
                    bone.d = s * a + c * bone.d;
                }
            }
            if (scaleX) {
                const s = 1 + this.scaleOffset * mix * this.data.scaleX;
                bone.a *= s;
                bone.c *= s;
            }
            if (physics != spine.Physics.pose) {
                this.tx = l * bone.a;
                this.ty = l * bone.c;
            }
            bone.updateAppliedTransform();
        }
        translate(x, y) {
            this.ux -= x;
            this.uy -= y;
            this.cx -= x;
            this.cy -= y;
        }
        rotate(x, y, degrees) {
            const r = degrees * spine.MathUtils.degRad, cos = Math.cos(r), sin = Math.sin(r);
            const dx = this.cx - x, dy = this.cy - y;
            this.translate(dx * cos - dy * sin - dx, dx * sin + dy * cos - dy);
        }
    }
    spine.PhysicsConstraint = PhysicsConstraint;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class PhysicsConstraintData extends spine.ConstraintData {
        constructor(name) {
            super(name, 0, false);
            this._bone = null;
            this.x = 0;
            this.y = 0;
            this.rotate = 0;
            this.scaleX = 0;
            this.shearX = 0;
            this.limit = 0;
            this.step = 0;
            this.inertia = 0;
            this.strength = 0;
            this.damping = 0;
            this.massInverse = 0;
            this.wind = 0;
            this.gravity = 0;
            this.mix = 0;
            this.inertiaGlobal = false;
            this.strengthGlobal = false;
            this.dampingGlobal = false;
            this.massGlobal = false;
            this.windGlobal = false;
            this.gravityGlobal = false;
            this.mixGlobal = false;
        }
        set bone(boneData) { this._bone = boneData; }
        get bone() {
            if (!this._bone)
                throw new Error("BoneData not set.");
            else
                return this._bone;
        }
    }
    spine.PhysicsConstraintData = PhysicsConstraintData;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class Skeleton {
        constructor(data) {
            this._updateCache = new Array();
            this.skin = null;
            this.scaleX = 1;
            this._scaleY = 1;
            this.x = 0;
            this.y = 0;
            this.time = 0;
            if (!data)
                throw new Error("data cannot be null.");
            this.data = data;
            this.bones = new Array();
            for (let i = 0; i < data.bones.length; i++) {
                let boneData = data.bones[i];
                let bone;
                if (!boneData.parent)
                    bone = new spine.Bone(boneData, this, null);
                else {
                    let parent = this.bones[boneData.parent.index];
                    bone = new spine.Bone(boneData, this, parent);
                    parent.children.push(bone);
                }
                this.bones.push(bone);
            }
            this.slots = new Array();
            this.drawOrder = new Array();
            for (let i = 0; i < data.slots.length; i++) {
                let slotData = data.slots[i];
                let bone = this.bones[slotData.boneData.index];
                let slot = new spine.Slot(slotData, bone);
                this.slots.push(slot);
                this.drawOrder.push(slot);
            }
            this.ikConstraints = new Array();
            for (let i = 0; i < data.ikConstraints.length; i++) {
                let ikConstraintData = data.ikConstraints[i];
                this.ikConstraints.push(new spine.IkConstraint(ikConstraintData, this));
            }
            this.transformConstraints = new Array();
            for (let i = 0; i < data.transformConstraints.length; i++) {
                let transformConstraintData = data.transformConstraints[i];
                this.transformConstraints.push(new spine.TransformConstraint(transformConstraintData, this));
            }
            this.pathConstraints = new Array();
            for (let i = 0; i < data.pathConstraints.length; i++) {
                let pathConstraintData = data.pathConstraints[i];
                this.pathConstraints.push(new spine.PathConstraint(pathConstraintData, this));
            }
            this.physicsConstraints = new Array();
            for (let i = 0; i < data.physicsConstraints.length; i++) {
                let physicsConstraintData = data.physicsConstraints[i];
                this.physicsConstraints.push(new spine.PhysicsConstraint(physicsConstraintData, this));
            }
            this.color = new spine.Color(1, 1, 1, 1);
            this.updateCache();
        }
        get scaleY() {
            return Skeleton.yDown ? -this._scaleY : this._scaleY;
        }
        set scaleY(scaleY) {
            this._scaleY = scaleY;
        }
        updateCache() {
            let updateCache = this._updateCache;
            updateCache.length = 0;
            let bones = this.bones;
            for (let i = 0, n = bones.length; i < n; i++) {
                let bone = bones[i];
                bone.sorted = bone.data.skinRequired;
                bone.active = !bone.sorted;
            }
            if (this.skin) {
                let skinBones = this.skin.bones;
                for (let i = 0, n = this.skin.bones.length; i < n; i++) {
                    let bone = this.bones[skinBones[i].index];
                    do {
                        bone.sorted = false;
                        bone.active = true;
                        bone = bone.parent;
                    } while (bone);
                }
            }
            let ikConstraints = this.ikConstraints;
            let transformConstraints = this.transformConstraints;
            let pathConstraints = this.pathConstraints;
            let physicsConstraints = this.physicsConstraints;
            let ikCount = ikConstraints.length, transformCount = transformConstraints.length, pathCount = pathConstraints.length, physicsCount = this.physicsConstraints.length;
            let constraintCount = ikCount + transformCount + pathCount + physicsCount;
            outer: for (let i = 0; i < constraintCount; i++) {
                for (let ii = 0; ii < ikCount; ii++) {
                    let constraint = ikConstraints[ii];
                    if (constraint.data.order == i) {
                        this.sortIkConstraint(constraint);
                        continue outer;
                    }
                }
                for (let ii = 0; ii < transformCount; ii++) {
                    let constraint = transformConstraints[ii];
                    if (constraint.data.order == i) {
                        this.sortTransformConstraint(constraint);
                        continue outer;
                    }
                }
                for (let ii = 0; ii < pathCount; ii++) {
                    let constraint = pathConstraints[ii];
                    if (constraint.data.order == i) {
                        this.sortPathConstraint(constraint);
                        continue outer;
                    }
                }
                for (let ii = 0; ii < physicsCount; ii++) {
                    const constraint = physicsConstraints[ii];
                    if (constraint.data.order == i) {
                        this.sortPhysicsConstraint(constraint);
                        continue outer;
                    }
                }
            }
            for (let i = 0, n = bones.length; i < n; i++)
                this.sortBone(bones[i]);
        }
        sortIkConstraint(constraint) {
            constraint.active = constraint.target.isActive() && (!constraint.data.skinRequired || (this.skin && spine.Utils.contains(this.skin.constraints, constraint.data, true)));
            if (!constraint.active)
                return;
            let target = constraint.target;
            this.sortBone(target);
            let constrained = constraint.bones;
            let parent = constrained[0];
            this.sortBone(parent);
            if (constrained.length == 1) {
                this._updateCache.push(constraint);
                this.sortReset(parent.children);
            }
            else {
                let child = constrained[constrained.length - 1];
                this.sortBone(child);
                this._updateCache.push(constraint);
                this.sortReset(parent.children);
                child.sorted = true;
            }
        }
        sortPathConstraint(constraint) {
            constraint.active = constraint.target.bone.isActive() && (!constraint.data.skinRequired || (this.skin && spine.Utils.contains(this.skin.constraints, constraint.data, true)));
            if (!constraint.active)
                return;
            let slot = constraint.target;
            let slotIndex = slot.data.index;
            let slotBone = slot.bone;
            if (this.skin)
                this.sortPathConstraintAttachment(this.skin, slotIndex, slotBone);
            if (this.data.defaultSkin && this.data.defaultSkin != this.skin)
                this.sortPathConstraintAttachment(this.data.defaultSkin, slotIndex, slotBone);
            for (let i = 0, n = this.data.skins.length; i < n; i++)
                this.sortPathConstraintAttachment(this.data.skins[i], slotIndex, slotBone);
            let attachment = slot.getAttachment();
            if (attachment instanceof spine.PathAttachment)
                this.sortPathConstraintAttachmentWith(attachment, slotBone);
            let constrained = constraint.bones;
            let boneCount = constrained.length;
            for (let i = 0; i < boneCount; i++)
                this.sortBone(constrained[i]);
            this._updateCache.push(constraint);
            for (let i = 0; i < boneCount; i++)
                this.sortReset(constrained[i].children);
            for (let i = 0; i < boneCount; i++)
                constrained[i].sorted = true;
        }
        sortTransformConstraint(constraint) {
            constraint.active = constraint.target.isActive() && (!constraint.data.skinRequired || (this.skin && spine.Utils.contains(this.skin.constraints, constraint.data, true)));
            if (!constraint.active)
                return;
            this.sortBone(constraint.target);
            let constrained = constraint.bones;
            let boneCount = constrained.length;
            if (constraint.data.local) {
                for (let i = 0; i < boneCount; i++) {
                    let child = constrained[i];
                    this.sortBone(child.parent);
                    this.sortBone(child);
                }
            }
            else {
                for (let i = 0; i < boneCount; i++) {
                    this.sortBone(constrained[i]);
                }
            }
            this._updateCache.push(constraint);
            for (let i = 0; i < boneCount; i++)
                this.sortReset(constrained[i].children);
            for (let i = 0; i < boneCount; i++)
                constrained[i].sorted = true;
        }
        sortPathConstraintAttachment(skin, slotIndex, slotBone) {
            let attachments = skin.attachments[slotIndex];
            if (!attachments)
                return;
            for (let key in attachments) {
                this.sortPathConstraintAttachmentWith(attachments[key], slotBone);
            }
        }
        sortPathConstraintAttachmentWith(attachment, slotBone) {
            if (!(attachment instanceof spine.PathAttachment))
                return;
            let pathBones = attachment.bones;
            if (!pathBones)
                this.sortBone(slotBone);
            else {
                let bones = this.bones;
                for (let i = 0, n = pathBones.length; i < n;) {
                    let nn = pathBones[i++];
                    nn += i;
                    while (i < nn)
                        this.sortBone(bones[pathBones[i++]]);
                }
            }
        }
        sortPhysicsConstraint(constraint) {
            const bone = constraint.bone;
            constraint.active = bone.active && (!constraint.data.skinRequired || (this.skin != null && spine.Utils.contains(this.skin.constraints, constraint.data, true)));
            if (!constraint.active)
                return;
            this.sortBone(bone);
            this._updateCache.push(constraint);
            this.sortReset(bone.children);
            bone.sorted = true;
        }
        sortBone(bone) {
            if (!bone)
                return;
            if (bone.sorted)
                return;
            let parent = bone.parent;
            if (parent)
                this.sortBone(parent);
            bone.sorted = true;
            this._updateCache.push(bone);
        }
        sortReset(bones) {
            for (let i = 0, n = bones.length; i < n; i++) {
                let bone = bones[i];
                if (!bone.active)
                    continue;
                if (bone.sorted)
                    this.sortReset(bone.children);
                bone.sorted = false;
            }
        }
        updateWorldTransform(physics) {
            if (physics === undefined || physics === null)
                throw new Error("physics is undefined");
            let bones = this.bones;
            for (let i = 0, n = bones.length; i < n; i++) {
                let bone = bones[i];
                bone.ax = bone.x;
                bone.ay = bone.y;
                bone.arotation = bone.rotation;
                bone.ascaleX = bone.scaleX;
                bone.ascaleY = bone.scaleY;
                bone.ashearX = bone.shearX;
                bone.ashearY = bone.shearY;
            }
            let updateCache = this._updateCache;
            for (let i = 0, n = updateCache.length; i < n; i++)
                updateCache[i].update(physics);
        }
        updateWorldTransformWith(physics, parent) {
            let rootBone = this.getRootBone();
            if (!rootBone)
                throw new Error("Root bone must not be null.");
            let pa = parent.a, pb = parent.b, pc = parent.c, pd = parent.d;
            rootBone.worldX = pa * this.x + pb * this.y + parent.worldX;
            rootBone.worldY = pc * this.x + pd * this.y + parent.worldY;
            const rx = (rootBone.rotation + rootBone.shearX) * spine.MathUtils.degRad;
            const ry = (rootBone.rotation + 90 + rootBone.shearY) * spine.MathUtils.degRad;
            const la = Math.cos(rx) * rootBone.scaleX;
            const lb = Math.cos(ry) * rootBone.scaleY;
            const lc = Math.sin(rx) * rootBone.scaleX;
            const ld = Math.sin(ry) * rootBone.scaleY;
            rootBone.a = (pa * la + pb * lc) * this.scaleX;
            rootBone.b = (pa * lb + pb * ld) * this.scaleX;
            rootBone.c = (pc * la + pd * lc) * this.scaleY;
            rootBone.d = (pc * lb + pd * ld) * this.scaleY;
            let updateCache = this._updateCache;
            for (let i = 0, n = updateCache.length; i < n; i++) {
                let updatable = updateCache[i];
                if (updatable != rootBone)
                    updatable.update(physics);
            }
        }
        setToSetupPose() {
            this.setBonesToSetupPose();
            this.setSlotsToSetupPose();
        }
        setBonesToSetupPose() {
            for (const bone of this.bones)
                bone.setToSetupPose();
            for (const constraint of this.ikConstraints)
                constraint.setToSetupPose();
            for (const constraint of this.transformConstraints)
                constraint.setToSetupPose();
            for (const constraint of this.pathConstraints)
                constraint.setToSetupPose();
            for (const constraint of this.physicsConstraints)
                constraint.setToSetupPose();
        }
        setSlotsToSetupPose() {
            let slots = this.slots;
            spine.Utils.arrayCopy(slots, 0, this.drawOrder, 0, slots.length);
            for (let i = 0, n = slots.length; i < n; i++)
                slots[i].setToSetupPose();
        }
        getRootBone() {
            if (this.bones.length == 0)
                return null;
            return this.bones[0];
        }
        findBone(boneName) {
            if (!boneName)
                throw new Error("boneName cannot be null.");
            let bones = this.bones;
            for (let i = 0, n = bones.length; i < n; i++) {
                let bone = bones[i];
                if (bone.data.name == boneName)
                    return bone;
            }
            return null;
        }
        findSlot(slotName) {
            if (!slotName)
                throw new Error("slotName cannot be null.");
            let slots = this.slots;
            for (let i = 0, n = slots.length; i < n; i++) {
                let slot = slots[i];
                if (slot.data.name == slotName)
                    return slot;
            }
            return null;
        }
        setSkinByName(skinName) {
            let skin = this.data.findSkin(skinName);
            if (!skin)
                throw new Error("Skin not found: " + skinName);
            this.setSkin(skin);
        }
        setSkin(newSkin) {
            if (newSkin == this.skin)
                return;
            if (newSkin) {
                if (this.skin)
                    newSkin.attachAll(this, this.skin);
                else {
                    let slots = this.slots;
                    for (let i = 0, n = slots.length; i < n; i++) {
                        let slot = slots[i];
                        let name = slot.data.attachmentName;
                        if (name) {
                            let attachment = newSkin.getAttachment(i, name);
                            if (attachment)
                                slot.setAttachment(attachment);
                        }
                    }
                }
            }
            this.skin = newSkin;
            this.updateCache();
        }
        getAttachmentByName(slotName, attachmentName) {
            let slot = this.data.findSlot(slotName);
            if (!slot)
                throw new Error(`Can't find slot with name ${slotName}`);
            return this.getAttachment(slot.index, attachmentName);
        }
        getAttachment(slotIndex, attachmentName) {
            if (!attachmentName)
                throw new Error("attachmentName cannot be null.");
            if (this.skin) {
                let attachment = this.skin.getAttachment(slotIndex, attachmentName);
                if (attachment)
                    return attachment;
            }
            if (this.data.defaultSkin)
                return this.data.defaultSkin.getAttachment(slotIndex, attachmentName);
            return null;
        }
        setAttachment(slotName, attachmentName) {
            if (!slotName)
                throw new Error("slotName cannot be null.");
            let slots = this.slots;
            for (let i = 0, n = slots.length; i < n; i++) {
                let slot = slots[i];
                if (slot.data.name == slotName) {
                    let attachment = null;
                    if (attachmentName) {
                        attachment = this.getAttachment(i, attachmentName);
                        if (!attachment)
                            throw new Error("Attachment not found: " + attachmentName + ", for slot: " + slotName);
                    }
                    slot.setAttachment(attachment);
                    return;
                }
            }
            throw new Error("Slot not found: " + slotName);
        }
        findIkConstraint(constraintName) {
            var _a;
            if (!constraintName)
                throw new Error("constraintName cannot be null.");
            return (_a = this.ikConstraints.find((constraint) => constraint.data.name == constraintName)) !== null && _a !== void 0 ? _a : null;
        }
        findTransformConstraint(constraintName) {
            var _a;
            if (!constraintName)
                throw new Error("constraintName cannot be null.");
            return (_a = this.transformConstraints.find((constraint) => constraint.data.name == constraintName)) !== null && _a !== void 0 ? _a : null;
        }
        findPathConstraint(constraintName) {
            var _a;
            if (!constraintName)
                throw new Error("constraintName cannot be null.");
            return (_a = this.pathConstraints.find((constraint) => constraint.data.name == constraintName)) !== null && _a !== void 0 ? _a : null;
        }
        findPhysicsConstraint(constraintName) {
            var _a;
            if (constraintName == null)
                throw new Error("constraintName cannot be null.");
            return (_a = this.physicsConstraints.find((constraint) => constraint.data.name == constraintName)) !== null && _a !== void 0 ? _a : null;
        }
        getBoundsRect() {
            let offset = new spine.Vector2();
            let size = new spine.Vector2();
            this.getBounds(offset, size);
            return { x: offset.x, y: offset.y, width: size.x, height: size.y };
        }
        getBounds(offset, size, temp = new Array(2), clipper = null) {
            if (!offset)
                throw new Error("offset cannot be null.");
            if (!size)
                throw new Error("size cannot be null.");
            let drawOrder = this.drawOrder;
            let minX = Number.POSITIVE_INFINITY, minY = Number.POSITIVE_INFINITY, maxX = Number.NEGATIVE_INFINITY, maxY = Number.NEGATIVE_INFINITY;
            for (let i = 0, n = drawOrder.length; i < n; i++) {
                let slot = drawOrder[i];
                if (!slot.bone.active)
                    continue;
                let verticesLength = 0;
                let vertices = null;
                let triangles = null;
                let attachment = slot.getAttachment();
                if (attachment instanceof spine.RegionAttachment) {
                    verticesLength = 8;
                    vertices = spine.Utils.setArraySize(temp, verticesLength, 0);
                    attachment.computeWorldVertices(slot, vertices, 0, 2);
                    triangles = Skeleton.quadTriangles;
                }
                else if (attachment instanceof spine.MeshAttachment) {
                    let mesh = attachment;
                    verticesLength = mesh.worldVerticesLength;
                    vertices = spine.Utils.setArraySize(temp, verticesLength, 0);
                    mesh.computeWorldVertices(slot, 0, verticesLength, vertices, 0, 2);
                    triangles = mesh.triangles;
                }
                else if (attachment instanceof spine.ClippingAttachment && clipper != null) {
                    clipper.clipStart(slot, attachment);
                    continue;
                }
                if (vertices && triangles) {
                    if (clipper != null && clipper.isClipping()) {
                        clipper.clipTriangles(vertices, triangles, triangles.length);
                        vertices = clipper.clippedVertices;
                        verticesLength = clipper.clippedVertices.length;
                    }
                    for (let ii = 0, nn = vertices.length; ii < nn; ii += 2) {
                        let x = vertices[ii], y = vertices[ii + 1];
                        minX = Math.min(minX, x);
                        minY = Math.min(minY, y);
                        maxX = Math.max(maxX, x);
                        maxY = Math.max(maxY, y);
                    }
                }
                if (clipper != null)
                    clipper.clipEndWithSlot(slot);
            }
            if (clipper != null)
                clipper.clipEnd();
            offset.set(minX, minY);
            size.set(maxX - minX, maxY - minY);
        }
        update(delta) {
            this.time += delta;
        }
        physicsTranslate(x, y) {
            const physicsConstraints = this.physicsConstraints;
            for (let i = 0, n = physicsConstraints.length; i < n; i++)
                physicsConstraints[i].translate(x, y);
        }
        physicsRotate(x, y, degrees) {
            const physicsConstraints = this.physicsConstraints;
            for (let i = 0, n = physicsConstraints.length; i < n; i++)
                physicsConstraints[i].rotate(x, y, degrees);
        }
    }
    Skeleton.quadTriangles = [0, 1, 2, 2, 3, 0];
    Skeleton.yDown = false;
    spine.Skeleton = Skeleton;
    let Physics;
    (function (Physics) {
        Physics[Physics["none"] = 0] = "none";
        Physics[Physics["reset"] = 1] = "reset";
        Physics[Physics["update"] = 2] = "update";
        Physics[Physics["pose"] = 3] = "pose";
    })(Physics = spine.Physics || (spine.Physics = {}));
})(spine || (spine = {}));
var spine;
(function (spine) {
    class SkeletonBinary {
        constructor(attachmentLoader) {
            this.scale = 1;
            this.linkedMeshes = new Array();
            this.attachmentLoader = attachmentLoader;
        }
        readSkeletonData(binary) {
            var _a;
            let scale = this.scale;
            let skeletonData = new spine.SkeletonData();
            skeletonData.name = "";
            let input = new BinaryInput(binary);
            let lowHash = input.readInt32();
            let highHash = input.readInt32();
            skeletonData.hash = highHash == 0 && lowHash == 0 ? null : highHash.toString(16) + lowHash.toString(16);
            skeletonData.version = input.readString();
            skeletonData.x = input.readFloat();
            skeletonData.y = input.readFloat();
            skeletonData.width = input.readFloat();
            skeletonData.height = input.readFloat();
            skeletonData.referenceScale = input.readFloat() * scale;
            let nonessential = input.readBoolean();
            if (nonessential) {
                skeletonData.fps = input.readFloat();
                skeletonData.imagesPath = input.readString();
                skeletonData.audioPath = input.readString();
            }
            let n = 0;
            n = input.readInt(true);
            for (let i = 0; i < n; i++) {
                let str = input.readString();
                if (!str)
                    throw new Error("String in string table must not be null.");
                input.strings.push(str);
            }
            n = input.readInt(true);
            for (let i = 0; i < n; i++) {
                let name = input.readString();
                if (!name)
                    throw new Error("Bone name must not be null.");
                let parent = i == 0 ? null : skeletonData.bones[input.readInt(true)];
                let data = new spine.BoneData(i, name, parent);
                data.rotation = input.readFloat();
                data.x = input.readFloat() * scale;
                data.y = input.readFloat() * scale;
                data.scaleX = input.readFloat();
                data.scaleY = input.readFloat();
                data.shearX = input.readFloat();
                data.shearY = input.readFloat();
                data.length = input.readFloat() * scale;
                data.inherit = input.readByte();
                data.skinRequired = input.readBoolean();
                if (nonessential) {
                    spine.Color.rgba8888ToColor(data.color, input.readInt32());
                    data.icon = (_a = input.readString()) !== null && _a !== void 0 ? _a : undefined;
                    data.visible = input.readBoolean();
                }
                skeletonData.bones.push(data);
            }
            n = input.readInt(true);
            for (let i = 0; i < n; i++) {
                let slotName = input.readString();
                if (!slotName)
                    throw new Error("Slot name must not be null.");
                let boneData = skeletonData.bones[input.readInt(true)];
                let data = new spine.SlotData(i, slotName, boneData);
                spine.Color.rgba8888ToColor(data.color, input.readInt32());
                let darkColor = input.readInt32();
                if (darkColor != -1)
                    spine.Color.rgb888ToColor(data.darkColor = new spine.Color(), darkColor);
                data.attachmentName = input.readStringRef();
                data.blendMode = input.readInt(true);
                if (nonessential)
                    data.visible = input.readBoolean();
                skeletonData.slots.push(data);
            }
            n = input.readInt(true);
            for (let i = 0, nn; i < n; i++) {
                let name = input.readString();
                if (!name)
                    throw new Error("IK constraint data name must not be null.");
                let data = new spine.IkConstraintData(name);
                data.order = input.readInt(true);
                nn = input.readInt(true);
                for (let ii = 0; ii < nn; ii++)
                    data.bones.push(skeletonData.bones[input.readInt(true)]);
                data.target = skeletonData.bones[input.readInt(true)];
                let flags = input.readByte();
                data.skinRequired = (flags & 1) != 0;
                data.bendDirection = (flags & 2) != 0 ? 1 : -1;
                data.compress = (flags & 4) != 0;
                data.stretch = (flags & 8) != 0;
                data.uniform = (flags & 16) != 0;
                if ((flags & 32) != 0)
                    data.mix = (flags & 64) != 0 ? input.readFloat() : 1;
                if ((flags & 128) != 0)
                    data.softness = input.readFloat() * scale;
                skeletonData.ikConstraints.push(data);
            }
            n = input.readInt(true);
            for (let i = 0, nn; i < n; i++) {
                let name = input.readString();
                if (!name)
                    throw new Error("Transform constraint data name must not be null.");
                let data = new spine.TransformConstraintData(name);
                data.order = input.readInt(true);
                nn = input.readInt(true);
                for (let ii = 0; ii < nn; ii++)
                    data.bones.push(skeletonData.bones[input.readInt(true)]);
                data.target = skeletonData.bones[input.readInt(true)];
                let flags = input.readByte();
                data.skinRequired = (flags & 1) != 0;
                data.local = (flags & 2) != 0;
                data.relative = (flags & 4) != 0;
                if ((flags & 8) != 0)
                    data.offsetRotation = input.readFloat();
                if ((flags & 16) != 0)
                    data.offsetX = input.readFloat() * scale;
                if ((flags & 32) != 0)
                    data.offsetY = input.readFloat() * scale;
                if ((flags & 64) != 0)
                    data.offsetScaleX = input.readFloat();
                if ((flags & 128) != 0)
                    data.offsetScaleY = input.readFloat();
                flags = input.readByte();
                if ((flags & 1) != 0)
                    data.offsetShearY = input.readFloat();
                if ((flags & 2) != 0)
                    data.mixRotate = input.readFloat();
                if ((flags & 4) != 0)
                    data.mixX = input.readFloat();
                if ((flags & 8) != 0)
                    data.mixY = input.readFloat();
                if ((flags & 16) != 0)
                    data.mixScaleX = input.readFloat();
                if ((flags & 32) != 0)
                    data.mixScaleY = input.readFloat();
                if ((flags & 64) != 0)
                    data.mixShearY = input.readFloat();
                skeletonData.transformConstraints.push(data);
            }
            n = input.readInt(true);
            for (let i = 0, nn; i < n; i++) {
                let name = input.readString();
                if (!name)
                    throw new Error("Path constraint data name must not be null.");
                let data = new spine.PathConstraintData(name);
                data.order = input.readInt(true);
                data.skinRequired = input.readBoolean();
                nn = input.readInt(true);
                for (let ii = 0; ii < nn; ii++)
                    data.bones.push(skeletonData.bones[input.readInt(true)]);
                data.target = skeletonData.slots[input.readInt(true)];
                const flags = input.readByte();
                data.positionMode = flags & 1;
                data.spacingMode = (flags >> 1) & 3;
                data.rotateMode = (flags >> 3) & 3;
                if ((flags & 128) != 0)
                    data.offsetRotation = input.readFloat();
                data.position = input.readFloat();
                if (data.positionMode == spine.PositionMode.Fixed)
                    data.position *= scale;
                data.spacing = input.readFloat();
                if (data.spacingMode == spine.SpacingMode.Length || data.spacingMode == spine.SpacingMode.Fixed)
                    data.spacing *= scale;
                data.mixRotate = input.readFloat();
                data.mixX = input.readFloat();
                data.mixY = input.readFloat();
                skeletonData.pathConstraints.push(data);
            }
            n = input.readInt(true);
            for (let i = 0, nn; i < n; i++) {
                const name = input.readString();
                if (!name)
                    throw new Error("Physics constraint data name must not be null.");
                const data = new spine.PhysicsConstraintData(name);
                data.order = input.readInt(true);
                data.bone = skeletonData.bones[input.readInt(true)];
                let flags = input.readByte();
                data.skinRequired = (flags & 1) != 0;
                if ((flags & 2) != 0)
                    data.x = input.readFloat();
                if ((flags & 4) != 0)
                    data.y = input.readFloat();
                if ((flags & 8) != 0)
                    data.rotate = input.readFloat();
                if ((flags & 16) != 0)
                    data.scaleX = input.readFloat();
                if ((flags & 32) != 0)
                    data.shearX = input.readFloat();
                data.limit = ((flags & 64) != 0 ? input.readFloat() : 5000) * scale;
                data.step = 1 / input.readUnsignedByte();
                data.inertia = input.readFloat();
                data.strength = input.readFloat();
                data.damping = input.readFloat();
                data.massInverse = (flags & 128) != 0 ? input.readFloat() : 1;
                data.wind = input.readFloat();
                data.gravity = input.readFloat();
                flags = input.readByte();
                if ((flags & 1) != 0)
                    data.inertiaGlobal = true;
                if ((flags & 2) != 0)
                    data.strengthGlobal = true;
                if ((flags & 4) != 0)
                    data.dampingGlobal = true;
                if ((flags & 8) != 0)
                    data.massGlobal = true;
                if ((flags & 16) != 0)
                    data.windGlobal = true;
                if ((flags & 32) != 0)
                    data.gravityGlobal = true;
                if ((flags & 64) != 0)
                    data.mixGlobal = true;
                data.mix = (flags & 128) != 0 ? input.readFloat() : 1;
                skeletonData.physicsConstraints.push(data);
            }
            let defaultSkin = this.readSkin(input, skeletonData, true, nonessential);
            if (defaultSkin) {
                skeletonData.defaultSkin = defaultSkin;
                skeletonData.skins.push(defaultSkin);
            }
            {
                let i = skeletonData.skins.length;
                spine.Utils.setArraySize(skeletonData.skins, n = i + input.readInt(true));
                for (; i < n; i++) {
                    let skin = this.readSkin(input, skeletonData, false, nonessential);
                    if (!skin)
                        throw new Error("readSkin() should not have returned null.");
                    skeletonData.skins[i] = skin;
                }
            }
            n = this.linkedMeshes.length;
            for (let i = 0; i < n; i++) {
                let linkedMesh = this.linkedMeshes[i];
                const skin = skeletonData.skins[linkedMesh.skinIndex];
                if (!linkedMesh.parent)
                    throw new Error("Linked mesh parent must not be null");
                let parent = skin.getAttachment(linkedMesh.slotIndex, linkedMesh.parent);
                if (!parent)
                    throw new Error(`Parent mesh not found: ${linkedMesh.parent}`);
                linkedMesh.mesh.timelineAttachment = linkedMesh.inheritTimeline ? parent : linkedMesh.mesh;
                linkedMesh.mesh.setParentMesh(parent);
                if (linkedMesh.mesh.region != null)
                    linkedMesh.mesh.updateRegion();
            }
            this.linkedMeshes.length = 0;
            n = input.readInt(true);
            for (let i = 0; i < n; i++) {
                let eventName = input.readString();
                if (!eventName)
                    throw new Error("Event data name must not be null");
                let data = new spine.EventData(eventName);
                data.intValue = input.readInt(false);
                data.floatValue = input.readFloat();
                data.stringValue = input.readString();
                data.audioPath = input.readString();
                if (data.audioPath) {
                    data.volume = input.readFloat();
                    data.balance = input.readFloat();
                }
                skeletonData.events.push(data);
            }
            n = input.readInt(true);
            for (let i = 0; i < n; i++) {
                let animationName = input.readString();
                if (!animationName)
                    throw new Error("Animatio name must not be null.");
                skeletonData.animations.push(this.readAnimation(input, animationName, skeletonData));
            }
            return skeletonData;
        }
        readSkin(input, skeletonData, defaultSkin, nonessential) {
            let skin = null;
            let slotCount = 0;
            if (defaultSkin) {
                slotCount = input.readInt(true);
                if (slotCount == 0)
                    return null;
                skin = new spine.Skin("default");
            }
            else {
                let skinName = input.readString();
                if (!skinName)
                    throw new Error("Skin name must not be null.");
                skin = new spine.Skin(skinName);
                if (nonessential)
                    spine.Color.rgba8888ToColor(skin.color, input.readInt32());
                skin.bones.length = input.readInt(true);
                for (let i = 0, n = skin.bones.length; i < n; i++)
                    skin.bones[i] = skeletonData.bones[input.readInt(true)];
                for (let i = 0, n = input.readInt(true); i < n; i++)
                    skin.constraints.push(skeletonData.ikConstraints[input.readInt(true)]);
                for (let i = 0, n = input.readInt(true); i < n; i++)
                    skin.constraints.push(skeletonData.transformConstraints[input.readInt(true)]);
                for (let i = 0, n = input.readInt(true); i < n; i++)
                    skin.constraints.push(skeletonData.pathConstraints[input.readInt(true)]);
                for (let i = 0, n = input.readInt(true); i < n; i++)
                    skin.constraints.push(skeletonData.physicsConstraints[input.readInt(true)]);
                slotCount = input.readInt(true);
            }
            for (let i = 0; i < slotCount; i++) {
                let slotIndex = input.readInt(true);
                for (let ii = 0, nn = input.readInt(true); ii < nn; ii++) {
                    let name = input.readStringRef();
                    if (!name)
                        throw new Error("Attachment name must not be null");
                    let attachment = this.readAttachment(input, skeletonData, skin, slotIndex, name, nonessential);
                    if (attachment)
                        skin.setAttachment(slotIndex, name, attachment);
                }
            }
            return skin;
        }
        readAttachment(input, skeletonData, skin, slotIndex, attachmentName, nonessential) {
            let scale = this.scale;
            let flags = input.readByte();
            const name = (flags & 8) != 0 ? input.readStringRef() : attachmentName;
            if (!name)
                throw new Error("Attachment name must not be null");
            switch ((flags & 0b111)) {
                case AttachmentType.Region: {
                    let path = (flags & 16) != 0 ? input.readStringRef() : null;
                    const color = (flags & 32) != 0 ? input.readInt32() : 0xffffffff;
                    const sequence = (flags & 64) != 0 ? this.readSequence(input) : null;
                    let rotation = (flags & 128) != 0 ? input.readFloat() : 0;
                    let x = input.readFloat();
                    let y = input.readFloat();
                    let scaleX = input.readFloat();
                    let scaleY = input.readFloat();
                    let width = input.readFloat();
                    let height = input.readFloat();
                    if (!path)
                        path = name;
                    let region = this.attachmentLoader.newRegionAttachment(skin, name, path, sequence);
                    if (!region)
                        return null;
                    region.path = path;
                    region.x = x * scale;
                    region.y = y * scale;
                    region.scaleX = scaleX;
                    region.scaleY = scaleY;
                    region.rotation = rotation;
                    region.width = width * scale;
                    region.height = height * scale;
                    spine.Color.rgba8888ToColor(region.color, color);
                    region.sequence = sequence;
                    if (sequence == null)
                        region.updateRegion();
                    return region;
                }
                case AttachmentType.BoundingBox: {
                    let vertices = this.readVertices(input, (flags & 16) != 0);
                    let color = nonessential ? input.readInt32() : 0;
                    let box = this.attachmentLoader.newBoundingBoxAttachment(skin, name);
                    if (!box)
                        return null;
                    box.worldVerticesLength = vertices.length;
                    box.vertices = vertices.vertices;
                    box.bones = vertices.bones;
                    if (nonessential)
                        spine.Color.rgba8888ToColor(box.color, color);
                    return box;
                }
                case AttachmentType.Mesh: {
                    let path = (flags & 16) != 0 ? input.readStringRef() : name;
                    const color = (flags & 32) != 0 ? input.readInt32() : 0xffffffff;
                    const sequence = (flags & 64) != 0 ? this.readSequence(input) : null;
                    const hullLength = input.readInt(true);
                    const vertices = this.readVertices(input, (flags & 128) != 0);
                    const uvs = this.readFloatArray(input, vertices.length, 1);
                    const triangles = this.readShortArray(input, (vertices.length - hullLength - 2) * 3);
                    let edges = [];
                    let width = 0, height = 0;
                    if (nonessential) {
                        edges = this.readShortArray(input, input.readInt(true));
                        width = input.readFloat();
                        height = input.readFloat();
                    }
                    if (!path)
                        path = name;
                    let mesh = this.attachmentLoader.newMeshAttachment(skin, name, path, sequence);
                    if (!mesh)
                        return null;
                    mesh.path = path;
                    spine.Color.rgba8888ToColor(mesh.color, color);
                    mesh.bones = vertices.bones;
                    mesh.vertices = vertices.vertices;
                    mesh.worldVerticesLength = vertices.length;
                    mesh.triangles = triangles;
                    mesh.regionUVs = uvs;
                    if (sequence == null)
                        mesh.updateRegion();
                    mesh.hullLength = hullLength << 1;
                    mesh.sequence = sequence;
                    if (nonessential) {
                        mesh.edges = edges;
                        mesh.width = width * scale;
                        mesh.height = height * scale;
                    }
                    return mesh;
                }
                case AttachmentType.LinkedMesh: {
                    const path = (flags & 16) != 0 ? input.readStringRef() : name;
                    if (path == null)
                        throw new Error("Path of linked mesh must not be null");
                    const color = (flags & 32) != 0 ? input.readInt32() : 0xffffffff;
                    const sequence = (flags & 64) != 0 ? this.readSequence(input) : null;
                    const inheritTimelines = (flags & 128) != 0;
                    const skinIndex = input.readInt(true);
                    const parent = input.readStringRef();
                    let width = 0, height = 0;
                    if (nonessential) {
                        width = input.readFloat();
                        height = input.readFloat();
                    }
                    let mesh = this.attachmentLoader.newMeshAttachment(skin, name, path, sequence);
                    if (!mesh)
                        return null;
                    mesh.path = path;
                    spine.Color.rgba8888ToColor(mesh.color, color);
                    mesh.sequence = sequence;
                    if (nonessential) {
                        mesh.width = width * scale;
                        mesh.height = height * scale;
                    }
                    this.linkedMeshes.push(new LinkedMesh(mesh, skinIndex, slotIndex, parent, inheritTimelines));
                    return mesh;
                }
                case AttachmentType.Path: {
                    const closed = (flags & 16) != 0;
                    const constantSpeed = (flags & 32) != 0;
                    const vertices = this.readVertices(input, (flags & 64) != 0);
                    const lengths = spine.Utils.newArray(vertices.length / 6, 0);
                    for (let i = 0, n = lengths.length; i < n; i++)
                        lengths[i] = input.readFloat() * scale;
                    const color = nonessential ? input.readInt32() : 0;
                    const path = this.attachmentLoader.newPathAttachment(skin, name);
                    if (!path)
                        return null;
                    path.closed = closed;
                    path.constantSpeed = constantSpeed;
                    path.worldVerticesLength = vertices.length;
                    path.vertices = vertices.vertices;
                    path.bones = vertices.bones;
                    path.lengths = lengths;
                    if (nonessential)
                        spine.Color.rgba8888ToColor(path.color, color);
                    return path;
                }
                case AttachmentType.Point: {
                    const rotation = input.readFloat();
                    const x = input.readFloat();
                    const y = input.readFloat();
                    const color = nonessential ? input.readInt32() : 0;
                    const point = this.attachmentLoader.newPointAttachment(skin, name);
                    if (!point)
                        return null;
                    point.x = x * scale;
                    point.y = y * scale;
                    point.rotation = rotation;
                    if (nonessential)
                        spine.Color.rgba8888ToColor(point.color, color);
                    return point;
                }
                case AttachmentType.Clipping: {
                    const endSlotIndex = input.readInt(true);
                    const vertices = this.readVertices(input, (flags & 16) != 0);
                    let color = nonessential ? input.readInt32() : 0;
                    let clip = this.attachmentLoader.newClippingAttachment(skin, name);
                    if (!clip)
                        return null;
                    clip.endSlot = skeletonData.slots[endSlotIndex];
                    clip.worldVerticesLength = vertices.length;
                    clip.vertices = vertices.vertices;
                    clip.bones = vertices.bones;
                    if (nonessential)
                        spine.Color.rgba8888ToColor(clip.color, color);
                    return clip;
                }
            }
            return null;
        }
        readSequence(input) {
            let sequence = new spine.Sequence(input.readInt(true));
            sequence.start = input.readInt(true);
            sequence.digits = input.readInt(true);
            sequence.setupIndex = input.readInt(true);
            return sequence;
        }
        readVertices(input, weighted) {
            const scale = this.scale;
            const vertexCount = input.readInt(true);
            const vertices = new Vertices();
            vertices.length = vertexCount << 1;
            if (!weighted) {
                vertices.vertices = this.readFloatArray(input, vertices.length, scale);
                return vertices;
            }
            let weights = new Array();
            let bonesArray = new Array();
            for (let i = 0; i < vertexCount; i++) {
                let boneCount = input.readInt(true);
                bonesArray.push(boneCount);
                for (let ii = 0; ii < boneCount; ii++) {
                    bonesArray.push(input.readInt(true));
                    weights.push(input.readFloat() * scale);
                    weights.push(input.readFloat() * scale);
                    weights.push(input.readFloat());
                }
            }
            vertices.vertices = spine.Utils.toFloatArray(weights);
            vertices.bones = bonesArray;
            return vertices;
        }
        readFloatArray(input, n, scale) {
            let array = new Array(n);
            if (scale == 1) {
                for (let i = 0; i < n; i++)
                    array[i] = input.readFloat();
            }
            else {
                for (let i = 0; i < n; i++)
                    array[i] = input.readFloat() * scale;
            }
            return array;
        }
        readShortArray(input, n) {
            let array = new Array(n);
            for (let i = 0; i < n; i++)
                array[i] = input.readInt(true);
            return array;
        }
        readAnimation(input, name, skeletonData) {
            input.readInt(true);
            let timelines = new Array();
            let scale = this.scale;
            for (let i = 0, n = input.readInt(true); i < n; i++) {
                let slotIndex = input.readInt(true);
                for (let ii = 0, nn = input.readInt(true); ii < nn; ii++) {
                    let timelineType = input.readByte();
                    let frameCount = input.readInt(true);
                    let frameLast = frameCount - 1;
                    switch (timelineType) {
                        case SLOT_ATTACHMENT: {
                            let timeline = new spine.AttachmentTimeline(frameCount, slotIndex);
                            for (let frame = 0; frame < frameCount; frame++)
                                timeline.setFrame(frame, input.readFloat(), input.readStringRef());
                            timelines.push(timeline);
                            break;
                        }
                        case SLOT_RGBA: {
                            let bezierCount = input.readInt(true);
                            let timeline = new spine.RGBATimeline(frameCount, bezierCount, slotIndex);
                            let time = input.readFloat();
                            let r = input.readUnsignedByte() / 255.0;
                            let g = input.readUnsignedByte() / 255.0;
                            let b = input.readUnsignedByte() / 255.0;
                            let a = input.readUnsignedByte() / 255.0;
                            for (let frame = 0, bezier = 0;; frame++) {
                                timeline.setFrame(frame, time, r, g, b, a);
                                if (frame == frameLast)
                                    break;
                                let time2 = input.readFloat();
                                let r2 = input.readUnsignedByte() / 255.0;
                                let g2 = input.readUnsignedByte() / 255.0;
                                let b2 = input.readUnsignedByte() / 255.0;
                                let a2 = input.readUnsignedByte() / 255.0;
                                switch (input.readByte()) {
                                    case CURVE_STEPPED:
                                        timeline.setStepped(frame);
                                        break;
                                    case CURVE_BEZIER:
                                        setBezier(input, timeline, bezier++, frame, 0, time, time2, r, r2, 1);
                                        setBezier(input, timeline, bezier++, frame, 1, time, time2, g, g2, 1);
                                        setBezier(input, timeline, bezier++, frame, 2, time, time2, b, b2, 1);
                                        setBezier(input, timeline, bezier++, frame, 3, time, time2, a, a2, 1);
                                }
                                time = time2;
                                r = r2;
                                g = g2;
                                b = b2;
                                a = a2;
                            }
                            timelines.push(timeline);
                            break;
                        }
                        case SLOT_RGB: {
                            let bezierCount = input.readInt(true);
                            let timeline = new spine.RGBTimeline(frameCount, bezierCount, slotIndex);
                            let time = input.readFloat();
                            let r = input.readUnsignedByte() / 255.0;
                            let g = input.readUnsignedByte() / 255.0;
                            let b = input.readUnsignedByte() / 255.0;
                            for (let frame = 0, bezier = 0;; frame++) {
                                timeline.setFrame(frame, time, r, g, b);
                                if (frame == frameLast)
                                    break;
                                let time2 = input.readFloat();
                                let r2 = input.readUnsignedByte() / 255.0;
                                let g2 = input.readUnsignedByte() / 255.0;
                                let b2 = input.readUnsignedByte() / 255.0;
                                switch (input.readByte()) {
                                    case CURVE_STEPPED:
                                        timeline.setStepped(frame);
                                        break;
                                    case CURVE_BEZIER:
                                        setBezier(input, timeline, bezier++, frame, 0, time, time2, r, r2, 1);
                                        setBezier(input, timeline, bezier++, frame, 1, time, time2, g, g2, 1);
                                        setBezier(input, timeline, bezier++, frame, 2, time, time2, b, b2, 1);
                                }
                                time = time2;
                                r = r2;
                                g = g2;
                                b = b2;
                            }
                            timelines.push(timeline);
                            break;
                        }
                        case SLOT_RGBA2: {
                            let bezierCount = input.readInt(true);
                            let timeline = new spine.RGBA2Timeline(frameCount, bezierCount, slotIndex);
                            let time = input.readFloat();
                            let r = input.readUnsignedByte() / 255.0;
                            let g = input.readUnsignedByte() / 255.0;
                            let b = input.readUnsignedByte() / 255.0;
                            let a = input.readUnsignedByte() / 255.0;
                            let r2 = input.readUnsignedByte() / 255.0;
                            let g2 = input.readUnsignedByte() / 255.0;
                            let b2 = input.readUnsignedByte() / 255.0;
                            for (let frame = 0, bezier = 0;; frame++) {
                                timeline.setFrame(frame, time, r, g, b, a, r2, g2, b2);
                                if (frame == frameLast)
                                    break;
                                let time2 = input.readFloat();
                                let nr = input.readUnsignedByte() / 255.0;
                                let ng = input.readUnsignedByte() / 255.0;
                                let nb = input.readUnsignedByte() / 255.0;
                                let na = input.readUnsignedByte() / 255.0;
                                let nr2 = input.readUnsignedByte() / 255.0;
                                let ng2 = input.readUnsignedByte() / 255.0;
                                let nb2 = input.readUnsignedByte() / 255.0;
                                switch (input.readByte()) {
                                    case CURVE_STEPPED:
                                        timeline.setStepped(frame);
                                        break;
                                    case CURVE_BEZIER:
                                        setBezier(input, timeline, bezier++, frame, 0, time, time2, r, nr, 1);
                                        setBezier(input, timeline, bezier++, frame, 1, time, time2, g, ng, 1);
                                        setBezier(input, timeline, bezier++, frame, 2, time, time2, b, nb, 1);
                                        setBezier(input, timeline, bezier++, frame, 3, time, time2, a, na, 1);
                                        setBezier(input, timeline, bezier++, frame, 4, time, time2, r2, nr2, 1);
                                        setBezier(input, timeline, bezier++, frame, 5, time, time2, g2, ng2, 1);
                                        setBezier(input, timeline, bezier++, frame, 6, time, time2, b2, nb2, 1);
                                }
                                time = time2;
                                r = nr;
                                g = ng;
                                b = nb;
                                a = na;
                                r2 = nr2;
                                g2 = ng2;
                                b2 = nb2;
                            }
                            timelines.push(timeline);
                            break;
                        }
                        case SLOT_RGB2: {
                            let bezierCount = input.readInt(true);
                            let timeline = new spine.RGB2Timeline(frameCount, bezierCount, slotIndex);
                            let time = input.readFloat();
                            let r = input.readUnsignedByte() / 255.0;
                            let g = input.readUnsignedByte() / 255.0;
                            let b = input.readUnsignedByte() / 255.0;
                            let r2 = input.readUnsignedByte() / 255.0;
                            let g2 = input.readUnsignedByte() / 255.0;
                            let b2 = input.readUnsignedByte() / 255.0;
                            for (let frame = 0, bezier = 0;; frame++) {
                                timeline.setFrame(frame, time, r, g, b, r2, g2, b2);
                                if (frame == frameLast)
                                    break;
                                let time2 = input.readFloat();
                                let nr = input.readUnsignedByte() / 255.0;
                                let ng = input.readUnsignedByte() / 255.0;
                                let nb = input.readUnsignedByte() / 255.0;
                                let nr2 = input.readUnsignedByte() / 255.0;
                                let ng2 = input.readUnsignedByte() / 255.0;
                                let nb2 = input.readUnsignedByte() / 255.0;
                                switch (input.readByte()) {
                                    case CURVE_STEPPED:
                                        timeline.setStepped(frame);
                                        break;
                                    case CURVE_BEZIER:
                                        setBezier(input, timeline, bezier++, frame, 0, time, time2, r, nr, 1);
                                        setBezier(input, timeline, bezier++, frame, 1, time, time2, g, ng, 1);
                                        setBezier(input, timeline, bezier++, frame, 2, time, time2, b, nb, 1);
                                        setBezier(input, timeline, bezier++, frame, 3, time, time2, r2, nr2, 1);
                                        setBezier(input, timeline, bezier++, frame, 4, time, time2, g2, ng2, 1);
                                        setBezier(input, timeline, bezier++, frame, 5, time, time2, b2, nb2, 1);
                                }
                                time = time2;
                                r = nr;
                                g = ng;
                                b = nb;
                                r2 = nr2;
                                g2 = ng2;
                                b2 = nb2;
                            }
                            timelines.push(timeline);
                            break;
                        }
                        case SLOT_ALPHA: {
                            let timeline = new spine.AlphaTimeline(frameCount, input.readInt(true), slotIndex);
                            let time = input.readFloat(), a = input.readUnsignedByte() / 255;
                            for (let frame = 0, bezier = 0;; frame++) {
                                timeline.setFrame(frame, time, a);
                                if (frame == frameLast)
                                    break;
                                let time2 = input.readFloat();
                                let a2 = input.readUnsignedByte() / 255;
                                switch (input.readByte()) {
                                    case CURVE_STEPPED:
                                        timeline.setStepped(frame);
                                        break;
                                    case CURVE_BEZIER:
                                        setBezier(input, timeline, bezier++, frame, 0, time, time2, a, a2, 1);
                                }
                                time = time2;
                                a = a2;
                            }
                            timelines.push(timeline);
                        }
                    }
                }
            }
            for (let i = 0, n = input.readInt(true); i < n; i++) {
                let boneIndex = input.readInt(true);
                for (let ii = 0, nn = input.readInt(true); ii < nn; ii++) {
                    let type = input.readByte(), frameCount = input.readInt(true);
                    if (type == BONE_INHERIT) {
                        let timeline = new spine.InheritTimeline(frameCount, boneIndex);
                        for (let frame = 0; frame < frameCount; frame++) {
                            timeline.setFrame(frame, input.readFloat(), input.readByte());
                        }
                        timelines.push(timeline);
                        continue;
                    }
                    let bezierCount = input.readInt(true);
                    switch (type) {
                        case BONE_ROTATE:
                            timelines.push(readTimeline1(input, new spine.RotateTimeline(frameCount, bezierCount, boneIndex), 1));
                            break;
                        case BONE_TRANSLATE:
                            timelines.push(readTimeline2(input, new spine.TranslateTimeline(frameCount, bezierCount, boneIndex), scale));
                            break;
                        case BONE_TRANSLATEX:
                            timelines.push(readTimeline1(input, new spine.TranslateXTimeline(frameCount, bezierCount, boneIndex), scale));
                            break;
                        case BONE_TRANSLATEY:
                            timelines.push(readTimeline1(input, new spine.TranslateYTimeline(frameCount, bezierCount, boneIndex), scale));
                            break;
                        case BONE_SCALE:
                            timelines.push(readTimeline2(input, new spine.ScaleTimeline(frameCount, bezierCount, boneIndex), 1));
                            break;
                        case BONE_SCALEX:
                            timelines.push(readTimeline1(input, new spine.ScaleXTimeline(frameCount, bezierCount, boneIndex), 1));
                            break;
                        case BONE_SCALEY:
                            timelines.push(readTimeline1(input, new spine.ScaleYTimeline(frameCount, bezierCount, boneIndex), 1));
                            break;
                        case BONE_SHEAR:
                            timelines.push(readTimeline2(input, new spine.ShearTimeline(frameCount, bezierCount, boneIndex), 1));
                            break;
                        case BONE_SHEARX:
                            timelines.push(readTimeline1(input, new spine.ShearXTimeline(frameCount, bezierCount, boneIndex), 1));
                            break;
                        case BONE_SHEARY:
                            timelines.push(readTimeline1(input, new spine.ShearYTimeline(frameCount, bezierCount, boneIndex), 1));
                    }
                }
            }
            for (let i = 0, n = input.readInt(true); i < n; i++) {
                let index = input.readInt(true), frameCount = input.readInt(true), frameLast = frameCount - 1;
                let timeline = new spine.IkConstraintTimeline(frameCount, input.readInt(true), index);
                let flags = input.readByte();
                let time = input.readFloat(), mix = (flags & 1) != 0 ? ((flags & 2) != 0 ? input.readFloat() : 1) : 0;
                let softness = (flags & 4) != 0 ? input.readFloat() * scale : 0;
                for (let frame = 0, bezier = 0;; frame++) {
                    timeline.setFrame(frame, time, mix, softness, (flags & 8) != 0 ? 1 : -1, (flags & 16) != 0, (flags & 32) != 0);
                    if (frame == frameLast)
                        break;
                    flags = input.readByte();
                    const time2 = input.readFloat(), mix2 = (flags & 1) != 0 ? ((flags & 2) != 0 ? input.readFloat() : 1) : 0;
                    const softness2 = (flags & 4) != 0 ? input.readFloat() * scale : 0;
                    if ((flags & 64) != 0) {
                        timeline.setStepped(frame);
                    }
                    else if ((flags & 128) != 0) {
                        setBezier(input, timeline, bezier++, frame, 0, time, time2, mix, mix2, 1);
                        setBezier(input, timeline, bezier++, frame, 1, time, time2, softness, softness2, scale);
                    }
                    time = time2;
                    mix = mix2;
                    softness = softness2;
                }
                timelines.push(timeline);
            }
            for (let i = 0, n = input.readInt(true); i < n; i++) {
                let index = input.readInt(true), frameCount = input.readInt(true), frameLast = frameCount - 1;
                let timeline = new spine.TransformConstraintTimeline(frameCount, input.readInt(true), index);
                let time = input.readFloat(), mixRotate = input.readFloat(), mixX = input.readFloat(), mixY = input.readFloat(), mixScaleX = input.readFloat(), mixScaleY = input.readFloat(), mixShearY = input.readFloat();
                for (let frame = 0, bezier = 0;; frame++) {
                    timeline.setFrame(frame, time, mixRotate, mixX, mixY, mixScaleX, mixScaleY, mixShearY);
                    if (frame == frameLast)
                        break;
                    let time2 = input.readFloat(), mixRotate2 = input.readFloat(), mixX2 = input.readFloat(), mixY2 = input.readFloat(), mixScaleX2 = input.readFloat(), mixScaleY2 = input.readFloat(), mixShearY2 = input.readFloat();
                    switch (input.readByte()) {
                        case CURVE_STEPPED:
                            timeline.setStepped(frame);
                            break;
                        case CURVE_BEZIER:
                            setBezier(input, timeline, bezier++, frame, 0, time, time2, mixRotate, mixRotate2, 1);
                            setBezier(input, timeline, bezier++, frame, 1, time, time2, mixX, mixX2, 1);
                            setBezier(input, timeline, bezier++, frame, 2, time, time2, mixY, mixY2, 1);
                            setBezier(input, timeline, bezier++, frame, 3, time, time2, mixScaleX, mixScaleX2, 1);
                            setBezier(input, timeline, bezier++, frame, 4, time, time2, mixScaleY, mixScaleY2, 1);
                            setBezier(input, timeline, bezier++, frame, 5, time, time2, mixShearY, mixShearY2, 1);
                    }
                    time = time2;
                    mixRotate = mixRotate2;
                    mixX = mixX2;
                    mixY = mixY2;
                    mixScaleX = mixScaleX2;
                    mixScaleY = mixScaleY2;
                    mixShearY = mixShearY2;
                }
                timelines.push(timeline);
            }
            for (let i = 0, n = input.readInt(true); i < n; i++) {
                let index = input.readInt(true);
                let data = skeletonData.pathConstraints[index];
                for (let ii = 0, nn = input.readInt(true); ii < nn; ii++) {
                    const type = input.readByte(), frameCount = input.readInt(true), bezierCount = input.readInt(true);
                    switch (type) {
                        case PATH_POSITION:
                            timelines
                                .push(readTimeline1(input, new spine.PathConstraintPositionTimeline(frameCount, bezierCount, index), data.positionMode == spine.PositionMode.Fixed ? scale : 1));
                            break;
                        case PATH_SPACING:
                            timelines
                                .push(readTimeline1(input, new spine.PathConstraintSpacingTimeline(frameCount, bezierCount, index), data.spacingMode == spine.SpacingMode.Length || data.spacingMode == spine.SpacingMode.Fixed ? scale : 1));
                            break;
                        case PATH_MIX:
                            let timeline = new spine.PathConstraintMixTimeline(frameCount, bezierCount, index);
                            let time = input.readFloat(), mixRotate = input.readFloat(), mixX = input.readFloat(), mixY = input.readFloat();
                            for (let frame = 0, bezier = 0, frameLast = timeline.getFrameCount() - 1;; frame++) {
                                timeline.setFrame(frame, time, mixRotate, mixX, mixY);
                                if (frame == frameLast)
                                    break;
                                let time2 = input.readFloat(), mixRotate2 = input.readFloat(), mixX2 = input.readFloat(), mixY2 = input.readFloat();
                                switch (input.readByte()) {
                                    case CURVE_STEPPED:
                                        timeline.setStepped(frame);
                                        break;
                                    case CURVE_BEZIER:
                                        setBezier(input, timeline, bezier++, frame, 0, time, time2, mixRotate, mixRotate2, 1);
                                        setBezier(input, timeline, bezier++, frame, 1, time, time2, mixX, mixX2, 1);
                                        setBezier(input, timeline, bezier++, frame, 2, time, time2, mixY, mixY2, 1);
                                }
                                time = time2;
                                mixRotate = mixRotate2;
                                mixX = mixX2;
                                mixY = mixY2;
                            }
                            timelines.push(timeline);
                    }
                }
            }
            for (let i = 0, n = input.readInt(true); i < n; i++) {
                const index = input.readInt(true) - 1;
                for (let ii = 0, nn = input.readInt(true); ii < nn; ii++) {
                    const type = input.readByte(), frameCount = input.readInt(true);
                    if (type == PHYSICS_RESET) {
                        const timeline = new spine.PhysicsConstraintResetTimeline(frameCount, index);
                        for (let frame = 0; frame < frameCount; frame++)
                            timeline.setFrame(frame, input.readFloat());
                        timelines.push(timeline);
                        continue;
                    }
                    const bezierCount = input.readInt(true);
                    switch (type) {
                        case PHYSICS_INERTIA:
                            timelines.push(readTimeline1(input, new spine.PhysicsConstraintInertiaTimeline(frameCount, bezierCount, index), 1));
                            break;
                        case PHYSICS_STRENGTH:
                            timelines.push(readTimeline1(input, new spine.PhysicsConstraintStrengthTimeline(frameCount, bezierCount, index), 1));
                            break;
                        case PHYSICS_DAMPING:
                            timelines.push(readTimeline1(input, new spine.PhysicsConstraintDampingTimeline(frameCount, bezierCount, index), 1));
                            break;
                        case PHYSICS_MASS:
                            timelines.push(readTimeline1(input, new spine.PhysicsConstraintMassTimeline(frameCount, bezierCount, index), 1));
                            break;
                        case PHYSICS_WIND:
                            timelines.push(readTimeline1(input, new spine.PhysicsConstraintWindTimeline(frameCount, bezierCount, index), 1));
                            break;
                        case PHYSICS_GRAVITY:
                            timelines.push(readTimeline1(input, new spine.PhysicsConstraintGravityTimeline(frameCount, bezierCount, index), 1));
                            break;
                        case PHYSICS_MIX:
                            timelines.push(readTimeline1(input, new spine.PhysicsConstraintMixTimeline(frameCount, bezierCount, index), 1));
                    }
                }
            }
            for (let i = 0, n = input.readInt(true); i < n; i++) {
                let skin = skeletonData.skins[input.readInt(true)];
                for (let ii = 0, nn = input.readInt(true); ii < nn; ii++) {
                    let slotIndex = input.readInt(true);
                    for (let iii = 0, nnn = input.readInt(true); iii < nnn; iii++) {
                        let attachmentName = input.readStringRef();
                        if (!attachmentName)
                            throw new Error("attachmentName must not be null.");
                        let attachment = skin.getAttachment(slotIndex, attachmentName);
                        let timelineType = input.readByte();
                        let frameCount = input.readInt(true);
                        let frameLast = frameCount - 1;
                        switch (timelineType) {
                            case ATTACHMENT_DEFORM: {
                                let vertexAttachment = attachment;
                                let weighted = vertexAttachment.bones;
                                let vertices = vertexAttachment.vertices;
                                let deformLength = weighted ? vertices.length / 3 * 2 : vertices.length;
                                let bezierCount = input.readInt(true);
                                let timeline = new spine.DeformTimeline(frameCount, bezierCount, slotIndex, vertexAttachment);
                                let time = input.readFloat();
                                for (let frame = 0, bezier = 0;; frame++) {
                                    let deform;
                                    let end = input.readInt(true);
                                    if (end == 0)
                                        deform = weighted ? spine.Utils.newFloatArray(deformLength) : vertices;
                                    else {
                                        deform = spine.Utils.newFloatArray(deformLength);
                                        let start = input.readInt(true);
                                        end += start;
                                        if (scale == 1) {
                                            for (let v = start; v < end; v++)
                                                deform[v] = input.readFloat();
                                        }
                                        else {
                                            for (let v = start; v < end; v++)
                                                deform[v] = input.readFloat() * scale;
                                        }
                                        if (!weighted) {
                                            for (let v = 0, vn = deform.length; v < vn; v++)
                                                deform[v] += vertices[v];
                                        }
                                    }
                                    timeline.setFrame(frame, time, deform);
                                    if (frame == frameLast)
                                        break;
                                    let time2 = input.readFloat();
                                    switch (input.readByte()) {
                                        case CURVE_STEPPED:
                                            timeline.setStepped(frame);
                                            break;
                                        case CURVE_BEZIER:
                                            setBezier(input, timeline, bezier++, frame, 0, time, time2, 0, 1, 1);
                                    }
                                    time = time2;
                                }
                                timelines.push(timeline);
                                break;
                            }
                            case ATTACHMENT_SEQUENCE: {
                                let timeline = new spine.SequenceTimeline(frameCount, slotIndex, attachment);
                                for (let frame = 0; frame < frameCount; frame++) {
                                    let time = input.readFloat();
                                    let modeAndIndex = input.readInt32();
                                    timeline.setFrame(frame, time, spine.SequenceModeValues[modeAndIndex & 0xf], modeAndIndex >> 4, input.readFloat());
                                }
                                timelines.push(timeline);
                                break;
                            }
                        }
                    }
                }
            }
            let drawOrderCount = input.readInt(true);
            if (drawOrderCount > 0) {
                let timeline = new spine.DrawOrderTimeline(drawOrderCount);
                let slotCount = skeletonData.slots.length;
                for (let i = 0; i < drawOrderCount; i++) {
                    let time = input.readFloat();
                    let offsetCount = input.readInt(true);
                    let drawOrder = spine.Utils.newArray(slotCount, 0);
                    for (let ii = slotCount - 1; ii >= 0; ii--)
                        drawOrder[ii] = -1;
                    let unchanged = spine.Utils.newArray(slotCount - offsetCount, 0);
                    let originalIndex = 0, unchangedIndex = 0;
                    for (let ii = 0; ii < offsetCount; ii++) {
                        let slotIndex = input.readInt(true);
                        while (originalIndex != slotIndex)
                            unchanged[unchangedIndex++] = originalIndex++;
                        drawOrder[originalIndex + input.readInt(true)] = originalIndex++;
                    }
                    while (originalIndex < slotCount)
                        unchanged[unchangedIndex++] = originalIndex++;
                    for (let ii = slotCount - 1; ii >= 0; ii--)
                        if (drawOrder[ii] == -1)
                            drawOrder[ii] = unchanged[--unchangedIndex];
                    timeline.setFrame(i, time, drawOrder);
                }
                timelines.push(timeline);
            }
            let eventCount = input.readInt(true);
            if (eventCount > 0) {
                let timeline = new spine.EventTimeline(eventCount);
                for (let i = 0; i < eventCount; i++) {
                    let time = input.readFloat();
                    let eventData = skeletonData.events[input.readInt(true)];
                    let event = new spine.Event(time, eventData);
                    event.intValue = input.readInt(false);
                    event.floatValue = input.readFloat();
                    event.stringValue = input.readString();
                    if (event.stringValue == null)
                        event.stringValue = eventData.stringValue;
                    if (event.data.audioPath) {
                        event.volume = input.readFloat();
                        event.balance = input.readFloat();
                    }
                    timeline.setFrame(i, event);
                }
                timelines.push(timeline);
            }
            let duration = 0;
            for (let i = 0, n = timelines.length; i < n; i++)
                duration = Math.max(duration, timelines[i].getDuration());
            return new spine.Animation(name, timelines, duration);
        }
    }
    spine.SkeletonBinary = SkeletonBinary;
    class BinaryInput {
        constructor(data, strings = new Array(), index = 0, buffer = new DataView(data instanceof ArrayBuffer ? data : data.buffer)) {
            this.strings = strings;
            this.index = index;
            this.buffer = buffer;
        }
        readByte() {
            return this.buffer.getInt8(this.index++);
        }
        readUnsignedByte() {
            return this.buffer.getUint8(this.index++);
        }
        readShort() {
            let value = this.buffer.getInt16(this.index);
            this.index += 2;
            return value;
        }
        readInt32() {
            let value = this.buffer.getInt32(this.index);
            this.index += 4;
            return value;
        }
        readInt(optimizePositive) {
            let b = this.readByte();
            let result = b & 0x7F;
            if ((b & 0x80) != 0) {
                b = this.readByte();
                result |= (b & 0x7F) << 7;
                if ((b & 0x80) != 0) {
                    b = this.readByte();
                    result |= (b & 0x7F) << 14;
                    if ((b & 0x80) != 0) {
                        b = this.readByte();
                        result |= (b & 0x7F) << 21;
                        if ((b & 0x80) != 0) {
                            b = this.readByte();
                            result |= (b & 0x7F) << 28;
                        }
                    }
                }
            }
            return optimizePositive ? result : ((result >>> 1) ^ -(result & 1));
        }
        readStringRef() {
            let index = this.readInt(true);
            return index == 0 ? null : this.strings[index - 1];
        }
        readString() {
            let byteCount = this.readInt(true);
            switch (byteCount) {
                case 0:
                    return null;
                case 1:
                    return "";
            }
            byteCount--;
            let chars = "";
            let charCount = 0;
            for (let i = 0; i < byteCount;) {
                let b = this.readUnsignedByte();
                switch (b >> 4) {
                    case 12:
                    case 13:
                        chars += String.fromCharCode(((b & 0x1F) << 6 | this.readByte() & 0x3F));
                        i += 2;
                        break;
                    case 14:
                        chars += String.fromCharCode(((b & 0x0F) << 12 | (this.readByte() & 0x3F) << 6 | this.readByte() & 0x3F));
                        i += 3;
                        break;
                    default:
                        chars += String.fromCharCode(b);
                        i++;
                }
            }
            return chars;
        }
        readFloat() {
            let value = this.buffer.getFloat32(this.index);
            this.index += 4;
            return value;
        }
        readBoolean() {
            return this.readByte() != 0;
        }
    }
    spine.BinaryInput = BinaryInput;
    class LinkedMesh {
        constructor(mesh, skinIndex, slotIndex, parent, inheritDeform) {
            this.mesh = mesh;
            this.skinIndex = skinIndex;
            this.slotIndex = slotIndex;
            this.parent = parent;
            this.inheritTimeline = inheritDeform;
        }
    }
    class Vertices {
        constructor(bones = null, vertices = null, length = 0) {
            this.bones = bones;
            this.vertices = vertices;
            this.length = length;
        }
    }
    let AttachmentType;
    (function (AttachmentType) {
        AttachmentType[AttachmentType["Region"] = 0] = "Region";
        AttachmentType[AttachmentType["BoundingBox"] = 1] = "BoundingBox";
        AttachmentType[AttachmentType["Mesh"] = 2] = "Mesh";
        AttachmentType[AttachmentType["LinkedMesh"] = 3] = "LinkedMesh";
        AttachmentType[AttachmentType["Path"] = 4] = "Path";
        AttachmentType[AttachmentType["Point"] = 5] = "Point";
        AttachmentType[AttachmentType["Clipping"] = 6] = "Clipping";
    })(AttachmentType || (AttachmentType = {}));
    function readTimeline1(input, timeline, scale) {
        let time = input.readFloat(), value = input.readFloat() * scale;
        for (let frame = 0, bezier = 0, frameLast = timeline.getFrameCount() - 1;; frame++) {
            timeline.setFrame(frame, time, value);
            if (frame == frameLast)
                break;
            let time2 = input.readFloat(), value2 = input.readFloat() * scale;
            switch (input.readByte()) {
                case CURVE_STEPPED:
                    timeline.setStepped(frame);
                    break;
                case CURVE_BEZIER:
                    setBezier(input, timeline, bezier++, frame, 0, time, time2, value, value2, scale);
            }
            time = time2;
            value = value2;
        }
        return timeline;
    }
    function readTimeline2(input, timeline, scale) {
        let time = input.readFloat(), value1 = input.readFloat() * scale, value2 = input.readFloat() * scale;
        for (let frame = 0, bezier = 0, frameLast = timeline.getFrameCount() - 1;; frame++) {
            timeline.setFrame(frame, time, value1, value2);
            if (frame == frameLast)
                break;
            let time2 = input.readFloat(), nvalue1 = input.readFloat() * scale, nvalue2 = input.readFloat() * scale;
            switch (input.readByte()) {
                case CURVE_STEPPED:
                    timeline.setStepped(frame);
                    break;
                case CURVE_BEZIER:
                    setBezier(input, timeline, bezier++, frame, 0, time, time2, value1, nvalue1, scale);
                    setBezier(input, timeline, bezier++, frame, 1, time, time2, value2, nvalue2, scale);
            }
            time = time2;
            value1 = nvalue1;
            value2 = nvalue2;
        }
        return timeline;
    }
    function setBezier(input, timeline, bezier, frame, value, time1, time2, value1, value2, scale) {
        timeline.setBezier(bezier, frame, value, time1, value1, input.readFloat(), input.readFloat() * scale, input.readFloat(), input.readFloat() * scale, time2, value2);
    }
    const BONE_ROTATE = 0;
    const BONE_TRANSLATE = 1;
    const BONE_TRANSLATEX = 2;
    const BONE_TRANSLATEY = 3;
    const BONE_SCALE = 4;
    const BONE_SCALEX = 5;
    const BONE_SCALEY = 6;
    const BONE_SHEAR = 7;
    const BONE_SHEARX = 8;
    const BONE_SHEARY = 9;
    const BONE_INHERIT = 10;
    const SLOT_ATTACHMENT = 0;
    const SLOT_RGBA = 1;
    const SLOT_RGB = 2;
    const SLOT_RGBA2 = 3;
    const SLOT_RGB2 = 4;
    const SLOT_ALPHA = 5;
    const ATTACHMENT_DEFORM = 0;
    const ATTACHMENT_SEQUENCE = 1;
    const PATH_POSITION = 0;
    const PATH_SPACING = 1;
    const PATH_MIX = 2;
    const PHYSICS_INERTIA = 0;
    const PHYSICS_STRENGTH = 1;
    const PHYSICS_DAMPING = 2;
    const PHYSICS_MASS = 4;
    const PHYSICS_WIND = 5;
    const PHYSICS_GRAVITY = 6;
    const PHYSICS_MIX = 7;
    const PHYSICS_RESET = 8;
    const CURVE_LINEAR = 0;
    const CURVE_STEPPED = 1;
    const CURVE_BEZIER = 2;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class SkeletonBounds {
        constructor() {
            this.minX = 0;
            this.minY = 0;
            this.maxX = 0;
            this.maxY = 0;
            this.boundingBoxes = new Array();
            this.polygons = new Array();
            this.polygonPool = new spine.Pool(() => {
                return spine.Utils.newFloatArray(16);
            });
        }
        update(skeleton, updateAabb) {
            if (!skeleton)
                throw new Error("skeleton cannot be null.");
            let boundingBoxes = this.boundingBoxes;
            let polygons = this.polygons;
            let polygonPool = this.polygonPool;
            let slots = skeleton.slots;
            let slotCount = slots.length;
            boundingBoxes.length = 0;
            polygonPool.freeAll(polygons);
            polygons.length = 0;
            for (let i = 0; i < slotCount; i++) {
                let slot = slots[i];
                if (!slot.bone.active)
                    continue;
                let attachment = slot.getAttachment();
                if (attachment instanceof spine.BoundingBoxAttachment) {
                    let boundingBox = attachment;
                    boundingBoxes.push(boundingBox);
                    let polygon = polygonPool.obtain();
                    if (polygon.length != boundingBox.worldVerticesLength) {
                        polygon = spine.Utils.newFloatArray(boundingBox.worldVerticesLength);
                    }
                    polygons.push(polygon);
                    boundingBox.computeWorldVertices(slot, 0, boundingBox.worldVerticesLength, polygon, 0, 2);
                }
            }
            if (updateAabb) {
                this.aabbCompute();
            }
            else {
                this.minX = Number.POSITIVE_INFINITY;
                this.minY = Number.POSITIVE_INFINITY;
                this.maxX = Number.NEGATIVE_INFINITY;
                this.maxY = Number.NEGATIVE_INFINITY;
            }
        }
        aabbCompute() {
            let minX = Number.POSITIVE_INFINITY, minY = Number.POSITIVE_INFINITY, maxX = Number.NEGATIVE_INFINITY, maxY = Number.NEGATIVE_INFINITY;
            let polygons = this.polygons;
            for (let i = 0, n = polygons.length; i < n; i++) {
                let polygon = polygons[i];
                let vertices = polygon;
                for (let ii = 0, nn = polygon.length; ii < nn; ii += 2) {
                    let x = vertices[ii];
                    let y = vertices[ii + 1];
                    minX = Math.min(minX, x);
                    minY = Math.min(minY, y);
                    maxX = Math.max(maxX, x);
                    maxY = Math.max(maxY, y);
                }
            }
            this.minX = minX;
            this.minY = minY;
            this.maxX = maxX;
            this.maxY = maxY;
        }
        aabbContainsPoint(x, y) {
            return x >= this.minX && x <= this.maxX && y >= this.minY && y <= this.maxY;
        }
        aabbIntersectsSegment(x1, y1, x2, y2) {
            let minX = this.minX;
            let minY = this.minY;
            let maxX = this.maxX;
            let maxY = this.maxY;
            if ((x1 <= minX && x2 <= minX) || (y1 <= minY && y2 <= minY) || (x1 >= maxX && x2 >= maxX) || (y1 >= maxY && y2 >= maxY))
                return false;
            let m = (y2 - y1) / (x2 - x1);
            let y = m * (minX - x1) + y1;
            if (y > minY && y < maxY)
                return true;
            y = m * (maxX - x1) + y1;
            if (y > minY && y < maxY)
                return true;
            let x = (minY - y1) / m + x1;
            if (x > minX && x < maxX)
                return true;
            x = (maxY - y1) / m + x1;
            if (x > minX && x < maxX)
                return true;
            return false;
        }
        aabbIntersectsSkeleton(bounds) {
            return this.minX < bounds.maxX && this.maxX > bounds.minX && this.minY < bounds.maxY && this.maxY > bounds.minY;
        }
        containsPoint(x, y) {
            let polygons = this.polygons;
            for (let i = 0, n = polygons.length; i < n; i++)
                if (this.containsPointPolygon(polygons[i], x, y))
                    return this.boundingBoxes[i];
            return null;
        }
        containsPointPolygon(polygon, x, y) {
            let vertices = polygon;
            let nn = polygon.length;
            let prevIndex = nn - 2;
            let inside = false;
            for (let ii = 0; ii < nn; ii += 2) {
                let vertexY = vertices[ii + 1];
                let prevY = vertices[prevIndex + 1];
                if ((vertexY < y && prevY >= y) || (prevY < y && vertexY >= y)) {
                    let vertexX = vertices[ii];
                    if (vertexX + (y - vertexY) / (prevY - vertexY) * (vertices[prevIndex] - vertexX) < x)
                        inside = !inside;
                }
                prevIndex = ii;
            }
            return inside;
        }
        intersectsSegment(x1, y1, x2, y2) {
            let polygons = this.polygons;
            for (let i = 0, n = polygons.length; i < n; i++)
                if (this.intersectsSegmentPolygon(polygons[i], x1, y1, x2, y2))
                    return this.boundingBoxes[i];
            return null;
        }
        intersectsSegmentPolygon(polygon, x1, y1, x2, y2) {
            let vertices = polygon;
            let nn = polygon.length;
            let width12 = x1 - x2, height12 = y1 - y2;
            let det1 = x1 * y2 - y1 * x2;
            let x3 = vertices[nn - 2], y3 = vertices[nn - 1];
            for (let ii = 0; ii < nn; ii += 2) {
                let x4 = vertices[ii], y4 = vertices[ii + 1];
                let det2 = x3 * y4 - y3 * x4;
                let width34 = x3 - x4, height34 = y3 - y4;
                let det3 = width12 * height34 - height12 * width34;
                let x = (det1 * width34 - width12 * det2) / det3;
                if (((x >= x3 && x <= x4) || (x >= x4 && x <= x3)) && ((x >= x1 && x <= x2) || (x >= x2 && x <= x1))) {
                    let y = (det1 * height34 - height12 * det2) / det3;
                    if (((y >= y3 && y <= y4) || (y >= y4 && y <= y3)) && ((y >= y1 && y <= y2) || (y >= y2 && y <= y1)))
                        return true;
                }
                x3 = x4;
                y3 = y4;
            }
            return false;
        }
        getPolygon(boundingBox) {
            if (!boundingBox)
                throw new Error("boundingBox cannot be null.");
            let index = this.boundingBoxes.indexOf(boundingBox);
            return index == -1 ? null : this.polygons[index];
        }
        getWidth() {
            return this.maxX - this.minX;
        }
        getHeight() {
            return this.maxY - this.minY;
        }
    }
    spine.SkeletonBounds = SkeletonBounds;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class SkeletonClipping {
        constructor() {
            this.triangulator = new spine.Triangulator();
            this.clippingPolygon = new Array();
            this.clipOutput = new Array();
            this.clippedVertices = new Array();
            this.clippedUVs = new Array();
            this.clippedTriangles = new Array();
            this.scratch = new Array();
            this.clipAttachment = null;
            this.clippingPolygons = null;
        }
        clipStart(slot, clip) {
            if (this.clipAttachment)
                return 0;
            this.clipAttachment = clip;
            let n = clip.worldVerticesLength;
            let vertices = spine.Utils.setArraySize(this.clippingPolygon, n);
            clip.computeWorldVertices(slot, 0, n, vertices, 0, 2);
            let clippingPolygon = this.clippingPolygon;
            SkeletonClipping.makeClockwise(clippingPolygon);
            let clippingPolygons = this.clippingPolygons = this.triangulator.decompose(clippingPolygon, this.triangulator.triangulate(clippingPolygon));
            for (let i = 0, n = clippingPolygons.length; i < n; i++) {
                let polygon = clippingPolygons[i];
                SkeletonClipping.makeClockwise(polygon);
                polygon.push(polygon[0]);
                polygon.push(polygon[1]);
            }
            return clippingPolygons.length;
        }
        clipEndWithSlot(slot) {
            if (this.clipAttachment && this.clipAttachment.endSlot == slot.data)
                this.clipEnd();
        }
        clipEnd() {
            if (!this.clipAttachment)
                return;
            this.clipAttachment = null;
            this.clippingPolygons = null;
            this.clippedVertices.length = 0;
            this.clippedTriangles.length = 0;
            this.clippingPolygon.length = 0;
        }
        isClipping() {
            return this.clipAttachment != null;
        }
        clipTriangles(vertices, verticesLengthOrTriangles, trianglesOrTrianglesLength, trianglesLengthOrUvs, uvsOrLight, lightOrDark, darkOrTwoColor, twoColorParam) {
            let triangles;
            let trianglesLength;
            let uvs;
            let light;
            let dark;
            let twoColor;
            if (typeof verticesLengthOrTriangles === 'number') {
                triangles = trianglesOrTrianglesLength;
                trianglesLength = trianglesLengthOrUvs;
                uvs = uvsOrLight;
                light = lightOrDark;
                dark = darkOrTwoColor;
                twoColor = twoColorParam;
            }
            else {
                triangles = verticesLengthOrTriangles;
                trianglesLength = trianglesOrTrianglesLength;
                uvs = trianglesLengthOrUvs;
                light = uvsOrLight;
                dark = lightOrDark;
                twoColor = darkOrTwoColor;
            }
            if (uvs && light && dark && typeof twoColor === 'boolean')
                this.clipTrianglesRender(vertices, triangles, trianglesLength, uvs, light, dark, twoColor);
            else
                this.clipTrianglesNoRender(vertices, triangles, trianglesLength);
        }
        clipTrianglesNoRender(vertices, triangles, trianglesLength) {
            let clipOutput = this.clipOutput, clippedVertices = this.clippedVertices;
            let clippedTriangles = this.clippedTriangles;
            let polygons = this.clippingPolygons;
            let polygonsCount = polygons.length;
            let index = 0;
            clippedVertices.length = 0;
            clippedTriangles.length = 0;
            for (let i = 0; i < trianglesLength; i += 3) {
                let vertexOffset = triangles[i] << 1;
                let x1 = vertices[vertexOffset], y1 = vertices[vertexOffset + 1];
                vertexOffset = triangles[i + 1] << 1;
                let x2 = vertices[vertexOffset], y2 = vertices[vertexOffset + 1];
                vertexOffset = triangles[i + 2] << 1;
                let x3 = vertices[vertexOffset], y3 = vertices[vertexOffset + 1];
                for (let p = 0; p < polygonsCount; p++) {
                    let s = clippedVertices.length;
                    if (this.clip(x1, y1, x2, y2, x3, y3, polygons[p], clipOutput)) {
                        let clipOutputLength = clipOutput.length;
                        if (clipOutputLength == 0)
                            continue;
                        let clipOutputCount = clipOutputLength >> 1;
                        let clipOutputItems = this.clipOutput;
                        let clippedVerticesItems = spine.Utils.setArraySize(clippedVertices, s + clipOutputCount * 2);
                        for (let ii = 0; ii < clipOutputLength; ii += 2, s += 2) {
                            let x = clipOutputItems[ii], y = clipOutputItems[ii + 1];
                            clippedVerticesItems[s] = x;
                            clippedVerticesItems[s + 1] = y;
                        }
                        s = clippedTriangles.length;
                        let clippedTrianglesItems = spine.Utils.setArraySize(clippedTriangles, s + 3 * (clipOutputCount - 2));
                        clipOutputCount--;
                        for (let ii = 1; ii < clipOutputCount; ii++, s += 3) {
                            clippedTrianglesItems[s] = index;
                            clippedTrianglesItems[s + 1] = (index + ii);
                            clippedTrianglesItems[s + 2] = (index + ii + 1);
                        }
                        index += clipOutputCount + 1;
                    }
                    else {
                        let clippedVerticesItems = spine.Utils.setArraySize(clippedVertices, s + 3 * 2);
                        clippedVerticesItems[s] = x1;
                        clippedVerticesItems[s + 1] = y1;
                        clippedVerticesItems[s + 2] = x2;
                        clippedVerticesItems[s + 3] = y2;
                        clippedVerticesItems[s + 4] = x3;
                        clippedVerticesItems[s + 5] = y3;
                        s = clippedTriangles.length;
                        let clippedTrianglesItems = spine.Utils.setArraySize(clippedTriangles, s + 3);
                        clippedTrianglesItems[s] = index;
                        clippedTrianglesItems[s + 1] = (index + 1);
                        clippedTrianglesItems[s + 2] = (index + 2);
                        index += 3;
                        break;
                    }
                }
            }
        }
        clipTrianglesRender(vertices, triangles, trianglesLength, uvs, light, dark, twoColor) {
            let clipOutput = this.clipOutput, clippedVertices = this.clippedVertices;
            let clippedTriangles = this.clippedTriangles;
            let polygons = this.clippingPolygons;
            let polygonsCount = polygons.length;
            let vertexSize = twoColor ? 12 : 8;
            let index = 0;
            clippedVertices.length = 0;
            clippedTriangles.length = 0;
            for (let i = 0; i < trianglesLength; i += 3) {
                let vertexOffset = triangles[i] << 1;
                let x1 = vertices[vertexOffset], y1 = vertices[vertexOffset + 1];
                let u1 = uvs[vertexOffset], v1 = uvs[vertexOffset + 1];
                vertexOffset = triangles[i + 1] << 1;
                let x2 = vertices[vertexOffset], y2 = vertices[vertexOffset + 1];
                let u2 = uvs[vertexOffset], v2 = uvs[vertexOffset + 1];
                vertexOffset = triangles[i + 2] << 1;
                let x3 = vertices[vertexOffset], y3 = vertices[vertexOffset + 1];
                let u3 = uvs[vertexOffset], v3 = uvs[vertexOffset + 1];
                for (let p = 0; p < polygonsCount; p++) {
                    let s = clippedVertices.length;
                    if (this.clip(x1, y1, x2, y2, x3, y3, polygons[p], clipOutput)) {
                        let clipOutputLength = clipOutput.length;
                        if (clipOutputLength == 0)
                            continue;
                        let d0 = y2 - y3, d1 = x3 - x2, d2 = x1 - x3, d4 = y3 - y1;
                        let d = 1 / (d0 * d2 + d1 * (y1 - y3));
                        let clipOutputCount = clipOutputLength >> 1;
                        let clipOutputItems = this.clipOutput;
                        let clippedVerticesItems = spine.Utils.setArraySize(clippedVertices, s + clipOutputCount * vertexSize);
                        for (let ii = 0; ii < clipOutputLength; ii += 2, s += vertexSize) {
                            let x = clipOutputItems[ii], y = clipOutputItems[ii + 1];
                            clippedVerticesItems[s] = x;
                            clippedVerticesItems[s + 1] = y;
                            clippedVerticesItems[s + 2] = light.r;
                            clippedVerticesItems[s + 3] = light.g;
                            clippedVerticesItems[s + 4] = light.b;
                            clippedVerticesItems[s + 5] = light.a;
                            let c0 = x - x3, c1 = y - y3;
                            let a = (d0 * c0 + d1 * c1) * d;
                            let b = (d4 * c0 + d2 * c1) * d;
                            let c = 1 - a - b;
                            clippedVerticesItems[s + 6] = u1 * a + u2 * b + u3 * c;
                            clippedVerticesItems[s + 7] = v1 * a + v2 * b + v3 * c;
                            if (twoColor) {
                                clippedVerticesItems[s + 8] = dark.r;
                                clippedVerticesItems[s + 9] = dark.g;
                                clippedVerticesItems[s + 10] = dark.b;
                                clippedVerticesItems[s + 11] = dark.a;
                            }
                        }
                        s = clippedTriangles.length;
                        let clippedTrianglesItems = spine.Utils.setArraySize(clippedTriangles, s + 3 * (clipOutputCount - 2));
                        clipOutputCount--;
                        for (let ii = 1; ii < clipOutputCount; ii++, s += 3) {
                            clippedTrianglesItems[s] = index;
                            clippedTrianglesItems[s + 1] = (index + ii);
                            clippedTrianglesItems[s + 2] = (index + ii + 1);
                        }
                        index += clipOutputCount + 1;
                    }
                    else {
                        let clippedVerticesItems = spine.Utils.setArraySize(clippedVertices, s + 3 * vertexSize);
                        clippedVerticesItems[s] = x1;
                        clippedVerticesItems[s + 1] = y1;
                        clippedVerticesItems[s + 2] = light.r;
                        clippedVerticesItems[s + 3] = light.g;
                        clippedVerticesItems[s + 4] = light.b;
                        clippedVerticesItems[s + 5] = light.a;
                        if (!twoColor) {
                            clippedVerticesItems[s + 6] = u1;
                            clippedVerticesItems[s + 7] = v1;
                            clippedVerticesItems[s + 8] = x2;
                            clippedVerticesItems[s + 9] = y2;
                            clippedVerticesItems[s + 10] = light.r;
                            clippedVerticesItems[s + 11] = light.g;
                            clippedVerticesItems[s + 12] = light.b;
                            clippedVerticesItems[s + 13] = light.a;
                            clippedVerticesItems[s + 14] = u2;
                            clippedVerticesItems[s + 15] = v2;
                            clippedVerticesItems[s + 16] = x3;
                            clippedVerticesItems[s + 17] = y3;
                            clippedVerticesItems[s + 18] = light.r;
                            clippedVerticesItems[s + 19] = light.g;
                            clippedVerticesItems[s + 20] = light.b;
                            clippedVerticesItems[s + 21] = light.a;
                            clippedVerticesItems[s + 22] = u3;
                            clippedVerticesItems[s + 23] = v3;
                        }
                        else {
                            clippedVerticesItems[s + 6] = u1;
                            clippedVerticesItems[s + 7] = v1;
                            clippedVerticesItems[s + 8] = dark.r;
                            clippedVerticesItems[s + 9] = dark.g;
                            clippedVerticesItems[s + 10] = dark.b;
                            clippedVerticesItems[s + 11] = dark.a;
                            clippedVerticesItems[s + 12] = x2;
                            clippedVerticesItems[s + 13] = y2;
                            clippedVerticesItems[s + 14] = light.r;
                            clippedVerticesItems[s + 15] = light.g;
                            clippedVerticesItems[s + 16] = light.b;
                            clippedVerticesItems[s + 17] = light.a;
                            clippedVerticesItems[s + 18] = u2;
                            clippedVerticesItems[s + 19] = v2;
                            clippedVerticesItems[s + 20] = dark.r;
                            clippedVerticesItems[s + 21] = dark.g;
                            clippedVerticesItems[s + 22] = dark.b;
                            clippedVerticesItems[s + 23] = dark.a;
                            clippedVerticesItems[s + 24] = x3;
                            clippedVerticesItems[s + 25] = y3;
                            clippedVerticesItems[s + 26] = light.r;
                            clippedVerticesItems[s + 27] = light.g;
                            clippedVerticesItems[s + 28] = light.b;
                            clippedVerticesItems[s + 29] = light.a;
                            clippedVerticesItems[s + 30] = u3;
                            clippedVerticesItems[s + 31] = v3;
                            clippedVerticesItems[s + 32] = dark.r;
                            clippedVerticesItems[s + 33] = dark.g;
                            clippedVerticesItems[s + 34] = dark.b;
                            clippedVerticesItems[s + 35] = dark.a;
                        }
                        s = clippedTriangles.length;
                        let clippedTrianglesItems = spine.Utils.setArraySize(clippedTriangles, s + 3);
                        clippedTrianglesItems[s] = index;
                        clippedTrianglesItems[s + 1] = (index + 1);
                        clippedTrianglesItems[s + 2] = (index + 2);
                        index += 3;
                        break;
                    }
                }
            }
        }
        clipTrianglesUnpacked(vertices, triangles, trianglesLength, uvs) {
            let clipOutput = this.clipOutput, clippedVertices = this.clippedVertices, clippedUVs = this.clippedUVs;
            let clippedTriangles = this.clippedTriangles;
            let polygons = this.clippingPolygons;
            let polygonsCount = polygons.length;
            let index = 0;
            clippedVertices.length = 0;
            clippedUVs.length = 0;
            clippedTriangles.length = 0;
            for (let i = 0; i < trianglesLength; i += 3) {
                let vertexOffset = triangles[i] << 1;
                let x1 = vertices[vertexOffset], y1 = vertices[vertexOffset + 1];
                let u1 = uvs[vertexOffset], v1 = uvs[vertexOffset + 1];
                vertexOffset = triangles[i + 1] << 1;
                let x2 = vertices[vertexOffset], y2 = vertices[vertexOffset + 1];
                let u2 = uvs[vertexOffset], v2 = uvs[vertexOffset + 1];
                vertexOffset = triangles[i + 2] << 1;
                let x3 = vertices[vertexOffset], y3 = vertices[vertexOffset + 1];
                let u3 = uvs[vertexOffset], v3 = uvs[vertexOffset + 1];
                for (let p = 0; p < polygonsCount; p++) {
                    let s = clippedVertices.length;
                    if (this.clip(x1, y1, x2, y2, x3, y3, polygons[p], clipOutput)) {
                        let clipOutputLength = clipOutput.length;
                        if (clipOutputLength == 0)
                            continue;
                        let d0 = y2 - y3, d1 = x3 - x2, d2 = x1 - x3, d4 = y3 - y1;
                        let d = 1 / (d0 * d2 + d1 * (y1 - y3));
                        let clipOutputCount = clipOutputLength >> 1;
                        let clipOutputItems = this.clipOutput;
                        let clippedVerticesItems = spine.Utils.setArraySize(clippedVertices, s + clipOutputCount * 2);
                        let clippedUVsItems = spine.Utils.setArraySize(clippedUVs, s + clipOutputCount * 2);
                        for (let ii = 0; ii < clipOutputLength; ii += 2, s += 2) {
                            let x = clipOutputItems[ii], y = clipOutputItems[ii + 1];
                            clippedVerticesItems[s] = x;
                            clippedVerticesItems[s + 1] = y;
                            let c0 = x - x3, c1 = y - y3;
                            let a = (d0 * c0 + d1 * c1) * d;
                            let b = (d4 * c0 + d2 * c1) * d;
                            let c = 1 - a - b;
                            clippedUVsItems[s] = u1 * a + u2 * b + u3 * c;
                            clippedUVsItems[s + 1] = v1 * a + v2 * b + v3 * c;
                        }
                        s = clippedTriangles.length;
                        let clippedTrianglesItems = spine.Utils.setArraySize(clippedTriangles, s + 3 * (clipOutputCount - 2));
                        clipOutputCount--;
                        for (let ii = 1; ii < clipOutputCount; ii++, s += 3) {
                            clippedTrianglesItems[s] = index;
                            clippedTrianglesItems[s + 1] = (index + ii);
                            clippedTrianglesItems[s + 2] = (index + ii + 1);
                        }
                        index += clipOutputCount + 1;
                    }
                    else {
                        let clippedVerticesItems = spine.Utils.setArraySize(clippedVertices, s + 3 * 2);
                        clippedVerticesItems[s] = x1;
                        clippedVerticesItems[s + 1] = y1;
                        clippedVerticesItems[s + 2] = x2;
                        clippedVerticesItems[s + 3] = y2;
                        clippedVerticesItems[s + 4] = x3;
                        clippedVerticesItems[s + 5] = y3;
                        let clippedUVSItems = spine.Utils.setArraySize(clippedUVs, s + 3 * 2);
                        clippedUVSItems[s] = u1;
                        clippedUVSItems[s + 1] = v1;
                        clippedUVSItems[s + 2] = u2;
                        clippedUVSItems[s + 3] = v2;
                        clippedUVSItems[s + 4] = u3;
                        clippedUVSItems[s + 5] = v3;
                        s = clippedTriangles.length;
                        let clippedTrianglesItems = spine.Utils.setArraySize(clippedTriangles, s + 3);
                        clippedTrianglesItems[s] = index;
                        clippedTrianglesItems[s + 1] = (index + 1);
                        clippedTrianglesItems[s + 2] = (index + 2);
                        index += 3;
                        break;
                    }
                }
            }
        }
        clip(x1, y1, x2, y2, x3, y3, clippingArea, output) {
            let originalOutput = output;
            let clipped = false;
            let input;
            if (clippingArea.length % 4 >= 2) {
                input = output;
                output = this.scratch;
            }
            else
                input = this.scratch;
            input.length = 0;
            input.push(x1);
            input.push(y1);
            input.push(x2);
            input.push(y2);
            input.push(x3);
            input.push(y3);
            input.push(x1);
            input.push(y1);
            output.length = 0;
            let clippingVerticesLast = clippingArea.length - 4;
            let clippingVertices = clippingArea;
            for (let i = 0;; i += 2) {
                let edgeX = clippingVertices[i], edgeY = clippingVertices[i + 1];
                let ex = edgeX - clippingVertices[i + 2], ey = edgeY - clippingVertices[i + 3];
                let outputStart = output.length;
                let inputVertices = input;
                for (let ii = 0, nn = input.length - 2; ii < nn;) {
                    let inputX = inputVertices[ii], inputY = inputVertices[ii + 1];
                    ii += 2;
                    let inputX2 = inputVertices[ii], inputY2 = inputVertices[ii + 1];
                    let s2 = ey * (edgeX - inputX2) > ex * (edgeY - inputY2);
                    let s1 = ey * (edgeX - inputX) - ex * (edgeY - inputY);
                    if (s1 > 0) {
                        if (s2) {
                            output.push(inputX2);
                            output.push(inputY2);
                            continue;
                        }
                        let ix = inputX2 - inputX, iy = inputY2 - inputY, t = s1 / (ix * ey - iy * ex);
                        if (t >= 0 && t <= 1) {
                            output.push(inputX + ix * t);
                            output.push(inputY + iy * t);
                        }
                        else {
                            output.push(inputX2);
                            output.push(inputY2);
                            continue;
                        }
                    }
                    else if (s2) {
                        let ix = inputX2 - inputX, iy = inputY2 - inputY, t = s1 / (ix * ey - iy * ex);
                        if (t >= 0 && t <= 1) {
                            output.push(inputX + ix * t);
                            output.push(inputY + iy * t);
                            output.push(inputX2);
                            output.push(inputY2);
                        }
                        else {
                            output.push(inputX2);
                            output.push(inputY2);
                            continue;
                        }
                    }
                    clipped = true;
                }
                if (outputStart == output.length) {
                    originalOutput.length = 0;
                    return true;
                }
                output.push(output[0]);
                output.push(output[1]);
                if (i == clippingVerticesLast)
                    break;
                let temp = output;
                output = input;
                output.length = 0;
                input = temp;
            }
            if (originalOutput != output) {
                originalOutput.length = 0;
                for (let i = 0, n = output.length - 2; i < n; i++)
                    originalOutput[i] = output[i];
            }
            else
                originalOutput.length = originalOutput.length - 2;
            return clipped;
        }
        static makeClockwise(polygon) {
            let vertices = polygon;
            let verticeslength = polygon.length;
            let area = vertices[verticeslength - 2] * vertices[1] - vertices[0] * vertices[verticeslength - 1], p1x = 0, p1y = 0, p2x = 0, p2y = 0;
            for (let i = 0, n = verticeslength - 3; i < n; i += 2) {
                p1x = vertices[i];
                p1y = vertices[i + 1];
                p2x = vertices[i + 2];
                p2y = vertices[i + 3];
                area += p1x * p2y - p2x * p1y;
            }
            if (area < 0)
                return;
            for (let i = 0, lastX = verticeslength - 2, n = verticeslength >> 1; i < n; i += 2) {
                let x = vertices[i], y = vertices[i + 1];
                let other = lastX - i;
                vertices[i] = vertices[other];
                vertices[i + 1] = vertices[other + 1];
                vertices[other] = x;
                vertices[other + 1] = y;
            }
        }
    }
    spine.SkeletonClipping = SkeletonClipping;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class SkeletonData {
        constructor() {
            this.name = null;
            this.bones = new Array();
            this.slots = new Array();
            this.skins = new Array();
            this.defaultSkin = null;
            this.events = new Array();
            this.animations = new Array();
            this.ikConstraints = new Array();
            this.transformConstraints = new Array();
            this.pathConstraints = new Array();
            this.physicsConstraints = new Array();
            this.x = 0;
            this.y = 0;
            this.width = 0;
            this.height = 0;
            this.referenceScale = 100;
            this.version = null;
            this.hash = null;
            this.fps = 0;
            this.imagesPath = null;
            this.audioPath = null;
        }
        findBone(boneName) {
            if (!boneName)
                throw new Error("boneName cannot be null.");
            let bones = this.bones;
            for (let i = 0, n = bones.length; i < n; i++) {
                let bone = bones[i];
                if (bone.name == boneName)
                    return bone;
            }
            return null;
        }
        findSlot(slotName) {
            if (!slotName)
                throw new Error("slotName cannot be null.");
            let slots = this.slots;
            for (let i = 0, n = slots.length; i < n; i++) {
                let slot = slots[i];
                if (slot.name == slotName)
                    return slot;
            }
            return null;
        }
        findSkin(skinName) {
            if (!skinName)
                throw new Error("skinName cannot be null.");
            let skins = this.skins;
            for (let i = 0, n = skins.length; i < n; i++) {
                let skin = skins[i];
                if (skin.name == skinName)
                    return skin;
            }
            return null;
        }
        findEvent(eventDataName) {
            if (!eventDataName)
                throw new Error("eventDataName cannot be null.");
            let events = this.events;
            for (let i = 0, n = events.length; i < n; i++) {
                let event = events[i];
                if (event.name == eventDataName)
                    return event;
            }
            return null;
        }
        findAnimation(animationName) {
            if (!animationName)
                throw new Error("animationName cannot be null.");
            let animations = this.animations;
            for (let i = 0, n = animations.length; i < n; i++) {
                let animation = animations[i];
                if (animation.name == animationName)
                    return animation;
            }
            return null;
        }
        findIkConstraint(constraintName) {
            if (!constraintName)
                throw new Error("constraintName cannot be null.");
            const ikConstraints = this.ikConstraints;
            for (let i = 0, n = ikConstraints.length; i < n; i++) {
                const constraint = ikConstraints[i];
                if (constraint.name == constraintName)
                    return constraint;
            }
            return null;
        }
        findTransformConstraint(constraintName) {
            if (!constraintName)
                throw new Error("constraintName cannot be null.");
            const transformConstraints = this.transformConstraints;
            for (let i = 0, n = transformConstraints.length; i < n; i++) {
                const constraint = transformConstraints[i];
                if (constraint.name == constraintName)
                    return constraint;
            }
            return null;
        }
        findPathConstraint(constraintName) {
            if (!constraintName)
                throw new Error("constraintName cannot be null.");
            const pathConstraints = this.pathConstraints;
            for (let i = 0, n = pathConstraints.length; i < n; i++) {
                const constraint = pathConstraints[i];
                if (constraint.name == constraintName)
                    return constraint;
            }
            return null;
        }
        findPhysicsConstraint(constraintName) {
            if (!constraintName)
                throw new Error("constraintName cannot be null.");
            const physicsConstraints = this.physicsConstraints;
            for (let i = 0, n = physicsConstraints.length; i < n; i++) {
                const constraint = physicsConstraints[i];
                if (constraint.name == constraintName)
                    return constraint;
            }
            return null;
        }
    }
    spine.SkeletonData = SkeletonData;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class SkeletonJson {
        constructor(attachmentLoader) {
            this.scale = 1;
            this.linkedMeshes = new Array();
            this.attachmentLoader = attachmentLoader;
        }
        readSkeletonData(json) {
            var _a, _b;
            let scale = this.scale;
            let skeletonData = new spine.SkeletonData();
            let root = typeof (json) === "string" ? JSON.parse(json) : json;
            let skeletonMap = root.skeleton;
            if (skeletonMap) {
                skeletonData.hash = skeletonMap.hash;
                skeletonData.version = skeletonMap.spine;
                skeletonData.x = skeletonMap.x;
                skeletonData.y = skeletonMap.y;
                skeletonData.width = skeletonMap.width;
                skeletonData.height = skeletonMap.height;
                skeletonData.referenceScale = getValue(skeletonMap, "referenceScale", 100) * scale;
                skeletonData.fps = skeletonMap.fps;
                skeletonData.imagesPath = (_a = skeletonMap.images) !== null && _a !== void 0 ? _a : null;
                skeletonData.audioPath = (_b = skeletonMap.audio) !== null && _b !== void 0 ? _b : null;
            }
            if (root.bones) {
                for (let i = 0; i < root.bones.length; i++) {
                    let boneMap = root.bones[i];
                    let parent = null;
                    let parentName = getValue(boneMap, "parent", null);
                    if (parentName)
                        parent = skeletonData.findBone(parentName);
                    let data = new spine.BoneData(skeletonData.bones.length, boneMap.name, parent);
                    data.length = getValue(boneMap, "length", 0) * scale;
                    data.x = getValue(boneMap, "x", 0) * scale;
                    data.y = getValue(boneMap, "y", 0) * scale;
                    data.rotation = getValue(boneMap, "rotation", 0);
                    data.scaleX = getValue(boneMap, "scaleX", 1);
                    data.scaleY = getValue(boneMap, "scaleY", 1);
                    data.shearX = getValue(boneMap, "shearX", 0);
                    data.shearY = getValue(boneMap, "shearY", 0);
                    data.inherit = spine.Utils.enumValue(spine.Inherit, getValue(boneMap, "inherit", "Normal"));
                    data.skinRequired = getValue(boneMap, "skin", false);
                    let color = getValue(boneMap, "color", null);
                    if (color)
                        data.color.setFromString(color);
                    skeletonData.bones.push(data);
                }
            }
            if (root.slots) {
                for (let i = 0; i < root.slots.length; i++) {
                    let slotMap = root.slots[i];
                    let slotName = slotMap.name;
                    let boneData = skeletonData.findBone(slotMap.bone);
                    if (!boneData)
                        throw new Error(`Couldn't find bone ${slotMap.bone} for slot ${slotName}`);
                    let data = new spine.SlotData(skeletonData.slots.length, slotName, boneData);
                    let color = getValue(slotMap, "color", null);
                    if (color)
                        data.color.setFromString(color);
                    let dark = getValue(slotMap, "dark", null);
                    if (dark)
                        data.darkColor = spine.Color.fromString(dark);
                    data.attachmentName = getValue(slotMap, "attachment", null);
                    data.blendMode = spine.Utils.enumValue(spine.BlendMode, getValue(slotMap, "blend", "normal"));
                    data.visible = getValue(slotMap, "visible", true);
                    skeletonData.slots.push(data);
                }
            }
            if (root.ik) {
                for (let i = 0; i < root.ik.length; i++) {
                    let constraintMap = root.ik[i];
                    let data = new spine.IkConstraintData(constraintMap.name);
                    data.order = getValue(constraintMap, "order", 0);
                    data.skinRequired = getValue(constraintMap, "skin", false);
                    for (let ii = 0; ii < constraintMap.bones.length; ii++) {
                        let bone = skeletonData.findBone(constraintMap.bones[ii]);
                        if (!bone)
                            throw new Error(`Couldn't find bone ${constraintMap.bones[ii]} for IK constraint ${constraintMap.name}.`);
                        data.bones.push(bone);
                    }
                    let target = skeletonData.findBone(constraintMap.target);
                    ;
                    if (!target)
                        throw new Error(`Couldn't find target bone ${constraintMap.target} for IK constraint ${constraintMap.name}.`);
                    data.target = target;
                    data.mix = getValue(constraintMap, "mix", 1);
                    data.softness = getValue(constraintMap, "softness", 0) * scale;
                    data.bendDirection = getValue(constraintMap, "bendPositive", true) ? 1 : -1;
                    data.compress = getValue(constraintMap, "compress", false);
                    data.stretch = getValue(constraintMap, "stretch", false);
                    data.uniform = getValue(constraintMap, "uniform", false);
                    skeletonData.ikConstraints.push(data);
                }
            }
            if (root.transform) {
                for (let i = 0; i < root.transform.length; i++) {
                    let constraintMap = root.transform[i];
                    let data = new spine.TransformConstraintData(constraintMap.name);
                    data.order = getValue(constraintMap, "order", 0);
                    data.skinRequired = getValue(constraintMap, "skin", false);
                    for (let ii = 0; ii < constraintMap.bones.length; ii++) {
                        let boneName = constraintMap.bones[ii];
                        let bone = skeletonData.findBone(boneName);
                        if (!bone)
                            throw new Error(`Couldn't find bone ${boneName} for transform constraint ${constraintMap.name}.`);
                        data.bones.push(bone);
                    }
                    let targetName = constraintMap.target;
                    let target = skeletonData.findBone(targetName);
                    if (!target)
                        throw new Error(`Couldn't find target bone ${targetName} for transform constraint ${constraintMap.name}.`);
                    data.target = target;
                    data.local = getValue(constraintMap, "local", false);
                    data.relative = getValue(constraintMap, "relative", false);
                    data.offsetRotation = getValue(constraintMap, "rotation", 0);
                    data.offsetX = getValue(constraintMap, "x", 0) * scale;
                    data.offsetY = getValue(constraintMap, "y", 0) * scale;
                    data.offsetScaleX = getValue(constraintMap, "scaleX", 0);
                    data.offsetScaleY = getValue(constraintMap, "scaleY", 0);
                    data.offsetShearY = getValue(constraintMap, "shearY", 0);
                    data.mixRotate = getValue(constraintMap, "mixRotate", 1);
                    data.mixX = getValue(constraintMap, "mixX", 1);
                    data.mixY = getValue(constraintMap, "mixY", data.mixX);
                    data.mixScaleX = getValue(constraintMap, "mixScaleX", 1);
                    data.mixScaleY = getValue(constraintMap, "mixScaleY", data.mixScaleX);
                    data.mixShearY = getValue(constraintMap, "mixShearY", 1);
                    skeletonData.transformConstraints.push(data);
                }
            }
            if (root.path) {
                for (let i = 0; i < root.path.length; i++) {
                    let constraintMap = root.path[i];
                    let data = new spine.PathConstraintData(constraintMap.name);
                    data.order = getValue(constraintMap, "order", 0);
                    data.skinRequired = getValue(constraintMap, "skin", false);
                    for (let ii = 0; ii < constraintMap.bones.length; ii++) {
                        let boneName = constraintMap.bones[ii];
                        let bone = skeletonData.findBone(boneName);
                        if (!bone)
                            throw new Error(`Couldn't find bone ${boneName} for path constraint ${constraintMap.name}.`);
                        data.bones.push(bone);
                    }
                    let targetName = constraintMap.target;
                    let target = skeletonData.findSlot(targetName);
                    if (!target)
                        throw new Error(`Couldn't find target slot ${targetName} for path constraint ${constraintMap.name}.`);
                    data.target = target;
                    data.positionMode = spine.Utils.enumValue(spine.PositionMode, getValue(constraintMap, "positionMode", "Percent"));
                    data.spacingMode = spine.Utils.enumValue(spine.SpacingMode, getValue(constraintMap, "spacingMode", "Length"));
                    data.rotateMode = spine.Utils.enumValue(spine.RotateMode, getValue(constraintMap, "rotateMode", "Tangent"));
                    data.offsetRotation = getValue(constraintMap, "rotation", 0);
                    data.position = getValue(constraintMap, "position", 0);
                    if (data.positionMode == spine.PositionMode.Fixed)
                        data.position *= scale;
                    data.spacing = getValue(constraintMap, "spacing", 0);
                    if (data.spacingMode == spine.SpacingMode.Length || data.spacingMode == spine.SpacingMode.Fixed)
                        data.spacing *= scale;
                    data.mixRotate = getValue(constraintMap, "mixRotate", 1);
                    data.mixX = getValue(constraintMap, "mixX", 1);
                    data.mixY = getValue(constraintMap, "mixY", data.mixX);
                    skeletonData.pathConstraints.push(data);
                }
            }
            if (root.physics) {
                for (let i = 0; i < root.physics.length; i++) {
                    const constraintMap = root.physics[i];
                    const data = new spine.PhysicsConstraintData(constraintMap.name);
                    data.order = getValue(constraintMap, "order", 0);
                    data.skinRequired = getValue(constraintMap, "skin", false);
                    const boneName = constraintMap.bone;
                    const bone = skeletonData.findBone(boneName);
                    if (bone == null)
                        throw new Error("Physics bone not found: " + boneName);
                    data.bone = bone;
                    data.x = getValue(constraintMap, "x", 0);
                    data.y = getValue(constraintMap, "y", 0);
                    data.rotate = getValue(constraintMap, "rotate", 0);
                    data.scaleX = getValue(constraintMap, "scaleX", 0);
                    data.shearX = getValue(constraintMap, "shearX", 0);
                    data.limit = getValue(constraintMap, "limit", 5000) * scale;
                    data.step = 1 / getValue(constraintMap, "fps", 60);
                    data.inertia = getValue(constraintMap, "inertia", 1);
                    data.strength = getValue(constraintMap, "strength", 100);
                    data.damping = getValue(constraintMap, "damping", 1);
                    data.massInverse = 1 / getValue(constraintMap, "mass", 1);
                    data.wind = getValue(constraintMap, "wind", 0);
                    data.gravity = getValue(constraintMap, "gravity", 0);
                    data.mix = getValue(constraintMap, "mix", 1);
                    data.inertiaGlobal = getValue(constraintMap, "inertiaGlobal", false);
                    data.strengthGlobal = getValue(constraintMap, "strengthGlobal", false);
                    data.dampingGlobal = getValue(constraintMap, "dampingGlobal", false);
                    data.massGlobal = getValue(constraintMap, "massGlobal", false);
                    data.windGlobal = getValue(constraintMap, "windGlobal", false);
                    data.gravityGlobal = getValue(constraintMap, "gravityGlobal", false);
                    data.mixGlobal = getValue(constraintMap, "mixGlobal", false);
                    skeletonData.physicsConstraints.push(data);
                }
            }
            if (root.skins) {
                for (let i = 0; i < root.skins.length; i++) {
                    let skinMap = root.skins[i];
                    let skin = new spine.Skin(skinMap.name);
                    if (skinMap.bones) {
                        for (let ii = 0; ii < skinMap.bones.length; ii++) {
                            let boneName = skinMap.bones[ii];
                            let bone = skeletonData.findBone(boneName);
                            if (!bone)
                                throw new Error(`Couldn't find bone ${boneName} for skin ${skinMap.name}.`);
                            skin.bones.push(bone);
                        }
                    }
                    if (skinMap.ik) {
                        for (let ii = 0; ii < skinMap.ik.length; ii++) {
                            let constraintName = skinMap.ik[ii];
                            let constraint = skeletonData.findIkConstraint(constraintName);
                            if (!constraint)
                                throw new Error(`Couldn't find IK constraint ${constraintName} for skin ${skinMap.name}.`);
                            skin.constraints.push(constraint);
                        }
                    }
                    if (skinMap.transform) {
                        for (let ii = 0; ii < skinMap.transform.length; ii++) {
                            let constraintName = skinMap.transform[ii];
                            let constraint = skeletonData.findTransformConstraint(constraintName);
                            if (!constraint)
                                throw new Error(`Couldn't find transform constraint ${constraintName} for skin ${skinMap.name}.`);
                            skin.constraints.push(constraint);
                        }
                    }
                    if (skinMap.path) {
                        for (let ii = 0; ii < skinMap.path.length; ii++) {
                            let constraintName = skinMap.path[ii];
                            let constraint = skeletonData.findPathConstraint(constraintName);
                            if (!constraint)
                                throw new Error(`Couldn't find path constraint ${constraintName} for skin ${skinMap.name}.`);
                            skin.constraints.push(constraint);
                        }
                    }
                    if (skinMap.physics) {
                        for (let ii = 0; ii < skinMap.physics.length; ii++) {
                            let constraintName = skinMap.physics[ii];
                            let constraint = skeletonData.findPhysicsConstraint(constraintName);
                            if (!constraint)
                                throw new Error(`Couldn't find physics constraint ${constraintName} for skin ${skinMap.name}.`);
                            skin.constraints.push(constraint);
                        }
                    }
                    for (let slotName in skinMap.attachments) {
                        let slot = skeletonData.findSlot(slotName);
                        if (!slot)
                            throw new Error(`Couldn't find slot ${slotName} for skin ${skinMap.name}.`);
                        let slotMap = skinMap.attachments[slotName];
                        for (let entryName in slotMap) {
                            let attachment = this.readAttachment(slotMap[entryName], skin, slot.index, entryName, skeletonData);
                            if (attachment)
                                skin.setAttachment(slot.index, entryName, attachment);
                        }
                    }
                    skeletonData.skins.push(skin);
                    if (skin.name == "default")
                        skeletonData.defaultSkin = skin;
                }
            }
            for (let i = 0, n = this.linkedMeshes.length; i < n; i++) {
                let linkedMesh = this.linkedMeshes[i];
                let skin = !linkedMesh.skin ? skeletonData.defaultSkin : skeletonData.findSkin(linkedMesh.skin);
                if (!skin)
                    throw new Error(`Skin not found: ${linkedMesh.skin}`);
                let parent = skin.getAttachment(linkedMesh.slotIndex, linkedMesh.parent);
                if (!parent)
                    throw new Error(`Parent mesh not found: ${linkedMesh.parent}`);
                linkedMesh.mesh.timelineAttachment = linkedMesh.inheritTimeline ? parent : linkedMesh.mesh;
                linkedMesh.mesh.setParentMesh(parent);
                if (linkedMesh.mesh.region != null)
                    linkedMesh.mesh.updateRegion();
            }
            this.linkedMeshes.length = 0;
            if (root.events) {
                for (let eventName in root.events) {
                    let eventMap = root.events[eventName];
                    let data = new spine.EventData(eventName);
                    data.intValue = getValue(eventMap, "int", 0);
                    data.floatValue = getValue(eventMap, "float", 0);
                    data.stringValue = getValue(eventMap, "string", "");
                    data.audioPath = getValue(eventMap, "audio", null);
                    if (data.audioPath) {
                        data.volume = getValue(eventMap, "volume", 1);
                        data.balance = getValue(eventMap, "balance", 0);
                    }
                    skeletonData.events.push(data);
                }
            }
            if (root.animations) {
                for (let animationName in root.animations) {
                    let animationMap = root.animations[animationName];
                    this.readAnimation(animationMap, animationName, skeletonData);
                }
            }
            return skeletonData;
        }
        readAttachment(map, skin, slotIndex, name, skeletonData) {
            let scale = this.scale;
            name = getValue(map, "name", name);
            switch (getValue(map, "type", "region")) {
                case "region": {
                    let path = getValue(map, "path", name);
                    let sequence = this.readSequence(getValue(map, "sequence", null));
                    let region = this.attachmentLoader.newRegionAttachment(skin, name, path, sequence);
                    if (!region)
                        return null;
                    region.path = path;
                    region.x = getValue(map, "x", 0) * scale;
                    region.y = getValue(map, "y", 0) * scale;
                    region.scaleX = getValue(map, "scaleX", 1);
                    region.scaleY = getValue(map, "scaleY", 1);
                    region.rotation = getValue(map, "rotation", 0);
                    region.width = map.width * scale;
                    region.height = map.height * scale;
                    region.sequence = sequence;
                    let color = getValue(map, "color", null);
                    if (color)
                        region.color.setFromString(color);
                    if (region.region != null)
                        region.updateRegion();
                    return region;
                }
                case "boundingbox": {
                    let box = this.attachmentLoader.newBoundingBoxAttachment(skin, name);
                    if (!box)
                        return null;
                    this.readVertices(map, box, map.vertexCount << 1);
                    let color = getValue(map, "color", null);
                    if (color)
                        box.color.setFromString(color);
                    return box;
                }
                case "mesh":
                case "linkedmesh": {
                    let path = getValue(map, "path", name);
                    let sequence = this.readSequence(getValue(map, "sequence", null));
                    let mesh = this.attachmentLoader.newMeshAttachment(skin, name, path, sequence);
                    if (!mesh)
                        return null;
                    mesh.path = path;
                    let color = getValue(map, "color", null);
                    if (color)
                        mesh.color.setFromString(color);
                    mesh.width = getValue(map, "width", 0) * scale;
                    mesh.height = getValue(map, "height", 0) * scale;
                    mesh.sequence = sequence;
                    let parent = getValue(map, "parent", null);
                    if (parent) {
                        this.linkedMeshes.push(new LinkedMesh(mesh, getValue(map, "skin", null), slotIndex, parent, getValue(map, "timelines", true)));
                        return mesh;
                    }
                    let uvs = map.uvs;
                    this.readVertices(map, mesh, uvs.length);
                    mesh.triangles = map.triangles;
                    mesh.regionUVs = uvs;
                    if (mesh.region != null)
                        mesh.updateRegion();
                    mesh.edges = getValue(map, "edges", null);
                    mesh.hullLength = getValue(map, "hull", 0) * 2;
                    return mesh;
                }
                case "path": {
                    let path = this.attachmentLoader.newPathAttachment(skin, name);
                    if (!path)
                        return null;
                    path.closed = getValue(map, "closed", false);
                    path.constantSpeed = getValue(map, "constantSpeed", true);
                    let vertexCount = map.vertexCount;
                    this.readVertices(map, path, vertexCount << 1);
                    let lengths = spine.Utils.newArray(vertexCount / 3, 0);
                    for (let i = 0; i < map.lengths.length; i++)
                        lengths[i] = map.lengths[i] * scale;
                    path.lengths = lengths;
                    let color = getValue(map, "color", null);
                    if (color)
                        path.color.setFromString(color);
                    return path;
                }
                case "point": {
                    let point = this.attachmentLoader.newPointAttachment(skin, name);
                    if (!point)
                        return null;
                    point.x = getValue(map, "x", 0) * scale;
                    point.y = getValue(map, "y", 0) * scale;
                    point.rotation = getValue(map, "rotation", 0);
                    let color = getValue(map, "color", null);
                    if (color)
                        point.color.setFromString(color);
                    return point;
                }
                case "clipping": {
                    let clip = this.attachmentLoader.newClippingAttachment(skin, name);
                    if (!clip)
                        return null;
                    let end = getValue(map, "end", null);
                    if (end)
                        clip.endSlot = skeletonData.findSlot(end);
                    let vertexCount = map.vertexCount;
                    this.readVertices(map, clip, vertexCount << 1);
                    let color = getValue(map, "color", null);
                    if (color)
                        clip.color.setFromString(color);
                    return clip;
                }
            }
            return null;
        }
        readSequence(map) {
            if (map == null)
                return null;
            let sequence = new spine.Sequence(getValue(map, "count", 0));
            sequence.start = getValue(map, "start", 1);
            sequence.digits = getValue(map, "digits", 0);
            sequence.setupIndex = getValue(map, "setup", 0);
            return sequence;
        }
        readVertices(map, attachment, verticesLength) {
            let scale = this.scale;
            attachment.worldVerticesLength = verticesLength;
            let vertices = map.vertices;
            if (verticesLength == vertices.length) {
                let scaledVertices = spine.Utils.toFloatArray(vertices);
                if (scale != 1) {
                    for (let i = 0, n = vertices.length; i < n; i++)
                        scaledVertices[i] *= scale;
                }
                attachment.vertices = scaledVertices;
                return;
            }
            let weights = new Array();
            let bones = new Array();
            for (let i = 0, n = vertices.length; i < n;) {
                let boneCount = vertices[i++];
                bones.push(boneCount);
                for (let nn = i + boneCount * 4; i < nn; i += 4) {
                    bones.push(vertices[i]);
                    weights.push(vertices[i + 1] * scale);
                    weights.push(vertices[i + 2] * scale);
                    weights.push(vertices[i + 3]);
                }
            }
            attachment.bones = bones;
            attachment.vertices = spine.Utils.toFloatArray(weights);
        }
        readAnimation(map, name, skeletonData) {
            let scale = this.scale;
            let timelines = new Array();
            if (map.slots) {
                for (let slotName in map.slots) {
                    let slotMap = map.slots[slotName];
                    let slot = skeletonData.findSlot(slotName);
                    if (!slot)
                        throw new Error("Slot not found: " + slotName);
                    let slotIndex = slot.index;
                    for (let timelineName in slotMap) {
                        let timelineMap = slotMap[timelineName];
                        if (!timelineMap)
                            continue;
                        let frames = timelineMap.length;
                        if (timelineName == "attachment") {
                            let timeline = new spine.AttachmentTimeline(frames, slotIndex);
                            for (let frame = 0; frame < frames; frame++) {
                                let keyMap = timelineMap[frame];
                                timeline.setFrame(frame, getValue(keyMap, "time", 0), getValue(keyMap, "name", null));
                            }
                            timelines.push(timeline);
                        }
                        else if (timelineName == "rgba") {
                            let timeline = new spine.RGBATimeline(frames, frames << 2, slotIndex);
                            let keyMap = timelineMap[0];
                            let time = getValue(keyMap, "time", 0);
                            let color = spine.Color.fromString(keyMap.color);
                            for (let frame = 0, bezier = 0;; frame++) {
                                timeline.setFrame(frame, time, color.r, color.g, color.b, color.a);
                                let nextMap = timelineMap[frame + 1];
                                if (!nextMap) {
                                    timeline.shrink(bezier);
                                    break;
                                }
                                let time2 = getValue(nextMap, "time", 0);
                                let newColor = spine.Color.fromString(nextMap.color);
                                let curve = keyMap.curve;
                                if (curve) {
                                    bezier = readCurve(curve, timeline, bezier, frame, 0, time, time2, color.r, newColor.r, 1);
                                    bezier = readCurve(curve, timeline, bezier, frame, 1, time, time2, color.g, newColor.g, 1);
                                    bezier = readCurve(curve, timeline, bezier, frame, 2, time, time2, color.b, newColor.b, 1);
                                    bezier = readCurve(curve, timeline, bezier, frame, 3, time, time2, color.a, newColor.a, 1);
                                }
                                time = time2;
                                color = newColor;
                                keyMap = nextMap;
                            }
                            timelines.push(timeline);
                        }
                        else if (timelineName == "rgb") {
                            let timeline = new spine.RGBTimeline(frames, frames * 3, slotIndex);
                            let keyMap = timelineMap[0];
                            let time = getValue(keyMap, "time", 0);
                            let color = spine.Color.fromString(keyMap.color);
                            for (let frame = 0, bezier = 0;; frame++) {
                                timeline.setFrame(frame, time, color.r, color.g, color.b);
                                let nextMap = timelineMap[frame + 1];
                                if (!nextMap) {
                                    timeline.shrink(bezier);
                                    break;
                                }
                                let time2 = getValue(nextMap, "time", 0);
                                let newColor = spine.Color.fromString(nextMap.color);
                                let curve = keyMap.curve;
                                if (curve) {
                                    bezier = readCurve(curve, timeline, bezier, frame, 0, time, time2, color.r, newColor.r, 1);
                                    bezier = readCurve(curve, timeline, bezier, frame, 1, time, time2, color.g, newColor.g, 1);
                                    bezier = readCurve(curve, timeline, bezier, frame, 2, time, time2, color.b, newColor.b, 1);
                                }
                                time = time2;
                                color = newColor;
                                keyMap = nextMap;
                            }
                            timelines.push(timeline);
                        }
                        else if (timelineName == "alpha") {
                            timelines.push(readTimeline1(timelineMap, new spine.AlphaTimeline(frames, frames, slotIndex), 0, 1));
                        }
                        else if (timelineName == "rgba2") {
                            let timeline = new spine.RGBA2Timeline(frames, frames * 7, slotIndex);
                            let keyMap = timelineMap[0];
                            let time = getValue(keyMap, "time", 0);
                            let color = spine.Color.fromString(keyMap.light);
                            let color2 = spine.Color.fromString(keyMap.dark);
                            for (let frame = 0, bezier = 0;; frame++) {
                                timeline.setFrame(frame, time, color.r, color.g, color.b, color.a, color2.r, color2.g, color2.b);
                                let nextMap = timelineMap[frame + 1];
                                if (!nextMap) {
                                    timeline.shrink(bezier);
                                    break;
                                }
                                let time2 = getValue(nextMap, "time", 0);
                                let newColor = spine.Color.fromString(nextMap.light);
                                let newColor2 = spine.Color.fromString(nextMap.dark);
                                let curve = keyMap.curve;
                                if (curve) {
                                    bezier = readCurve(curve, timeline, bezier, frame, 0, time, time2, color.r, newColor.r, 1);
                                    bezier = readCurve(curve, timeline, bezier, frame, 1, time, time2, color.g, newColor.g, 1);
                                    bezier = readCurve(curve, timeline, bezier, frame, 2, time, time2, color.b, newColor.b, 1);
                                    bezier = readCurve(curve, timeline, bezier, frame, 3, time, time2, color.a, newColor.a, 1);
                                    bezier = readCurve(curve, timeline, bezier, frame, 4, time, time2, color2.r, newColor2.r, 1);
                                    bezier = readCurve(curve, timeline, bezier, frame, 5, time, time2, color2.g, newColor2.g, 1);
                                    bezier = readCurve(curve, timeline, bezier, frame, 6, time, time2, color2.b, newColor2.b, 1);
                                }
                                time = time2;
                                color = newColor;
                                color2 = newColor2;
                                keyMap = nextMap;
                            }
                            timelines.push(timeline);
                        }
                        else if (timelineName == "rgb2") {
                            let timeline = new spine.RGB2Timeline(frames, frames * 6, slotIndex);
                            let keyMap = timelineMap[0];
                            let time = getValue(keyMap, "time", 0);
                            let color = spine.Color.fromString(keyMap.light);
                            let color2 = spine.Color.fromString(keyMap.dark);
                            for (let frame = 0, bezier = 0;; frame++) {
                                timeline.setFrame(frame, time, color.r, color.g, color.b, color2.r, color2.g, color2.b);
                                let nextMap = timelineMap[frame + 1];
                                if (!nextMap) {
                                    timeline.shrink(bezier);
                                    break;
                                }
                                let time2 = getValue(nextMap, "time", 0);
                                let newColor = spine.Color.fromString(nextMap.light);
                                let newColor2 = spine.Color.fromString(nextMap.dark);
                                let curve = keyMap.curve;
                                if (curve) {
                                    bezier = readCurve(curve, timeline, bezier, frame, 0, time, time2, color.r, newColor.r, 1);
                                    bezier = readCurve(curve, timeline, bezier, frame, 1, time, time2, color.g, newColor.g, 1);
                                    bezier = readCurve(curve, timeline, bezier, frame, 2, time, time2, color.b, newColor.b, 1);
                                    bezier = readCurve(curve, timeline, bezier, frame, 3, time, time2, color2.r, newColor2.r, 1);
                                    bezier = readCurve(curve, timeline, bezier, frame, 4, time, time2, color2.g, newColor2.g, 1);
                                    bezier = readCurve(curve, timeline, bezier, frame, 5, time, time2, color2.b, newColor2.b, 1);
                                }
                                time = time2;
                                color = newColor;
                                color2 = newColor2;
                                keyMap = nextMap;
                            }
                            timelines.push(timeline);
                        }
                    }
                }
            }
            if (map.bones) {
                for (let boneName in map.bones) {
                    let boneMap = map.bones[boneName];
                    let bone = skeletonData.findBone(boneName);
                    if (!bone)
                        throw new Error("Bone not found: " + boneName);
                    let boneIndex = bone.index;
                    for (let timelineName in boneMap) {
                        let timelineMap = boneMap[timelineName];
                        let frames = timelineMap.length;
                        if (frames == 0)
                            continue;
                        if (timelineName === "rotate") {
                            timelines.push(readTimeline1(timelineMap, new spine.RotateTimeline(frames, frames, boneIndex), 0, 1));
                        }
                        else if (timelineName === "translate") {
                            let timeline = new spine.TranslateTimeline(frames, frames << 1, boneIndex);
                            timelines.push(readTimeline2(timelineMap, timeline, "x", "y", 0, scale));
                        }
                        else if (timelineName === "translatex") {
                            let timeline = new spine.TranslateXTimeline(frames, frames, boneIndex);
                            timelines.push(readTimeline1(timelineMap, timeline, 0, scale));
                        }
                        else if (timelineName === "translatey") {
                            let timeline = new spine.TranslateYTimeline(frames, frames, boneIndex);
                            timelines.push(readTimeline1(timelineMap, timeline, 0, scale));
                        }
                        else if (timelineName === "scale") {
                            let timeline = new spine.ScaleTimeline(frames, frames << 1, boneIndex);
                            timelines.push(readTimeline2(timelineMap, timeline, "x", "y", 1, 1));
                        }
                        else if (timelineName === "scalex") {
                            let timeline = new spine.ScaleXTimeline(frames, frames, boneIndex);
                            timelines.push(readTimeline1(timelineMap, timeline, 1, 1));
                        }
                        else if (timelineName === "scaley") {
                            let timeline = new spine.ScaleYTimeline(frames, frames, boneIndex);
                            timelines.push(readTimeline1(timelineMap, timeline, 1, 1));
                        }
                        else if (timelineName === "shear") {
                            let timeline = new spine.ShearTimeline(frames, frames << 1, boneIndex);
                            timelines.push(readTimeline2(timelineMap, timeline, "x", "y", 0, 1));
                        }
                        else if (timelineName === "shearx") {
                            let timeline = new spine.ShearXTimeline(frames, frames, boneIndex);
                            timelines.push(readTimeline1(timelineMap, timeline, 0, 1));
                        }
                        else if (timelineName === "sheary") {
                            let timeline = new spine.ShearYTimeline(frames, frames, boneIndex);
                            timelines.push(readTimeline1(timelineMap, timeline, 0, 1));
                        }
                        else if (timelineName === "inherit") {
                            let timeline = new spine.InheritTimeline(frames, bone.index);
                            for (let frame = 0; frame < timelineMap.length; frame++) {
                                let aFrame = timelineMap[frame];
                                timeline.setFrame(frame, getValue(aFrame, "time", 0), spine.Utils.enumValue(spine.Inherit, getValue(aFrame, "inherit", "Normal")));
                            }
                            timelines.push(timeline);
                        }
                    }
                }
            }
            if (map.ik) {
                for (let constraintName in map.ik) {
                    let constraintMap = map.ik[constraintName];
                    let keyMap = constraintMap[0];
                    if (!keyMap)
                        continue;
                    let constraint = skeletonData.findIkConstraint(constraintName);
                    if (!constraint)
                        throw new Error("IK Constraint not found: " + constraintName);
                    let constraintIndex = skeletonData.ikConstraints.indexOf(constraint);
                    let timeline = new spine.IkConstraintTimeline(constraintMap.length, constraintMap.length << 1, constraintIndex);
                    let time = getValue(keyMap, "time", 0);
                    let mix = getValue(keyMap, "mix", 1);
                    let softness = getValue(keyMap, "softness", 0) * scale;
                    for (let frame = 0, bezier = 0;; frame++) {
                        timeline.setFrame(frame, time, mix, softness, getValue(keyMap, "bendPositive", true) ? 1 : -1, getValue(keyMap, "compress", false), getValue(keyMap, "stretch", false));
                        let nextMap = constraintMap[frame + 1];
                        if (!nextMap) {
                            timeline.shrink(bezier);
                            break;
                        }
                        let time2 = getValue(nextMap, "time", 0);
                        let mix2 = getValue(nextMap, "mix", 1);
                        let softness2 = getValue(nextMap, "softness", 0) * scale;
                        let curve = keyMap.curve;
                        if (curve) {
                            bezier = readCurve(curve, timeline, bezier, frame, 0, time, time2, mix, mix2, 1);
                            bezier = readCurve(curve, timeline, bezier, frame, 1, time, time2, softness, softness2, scale);
                        }
                        time = time2;
                        mix = mix2;
                        softness = softness2;
                        keyMap = nextMap;
                    }
                    timelines.push(timeline);
                }
            }
            if (map.transform) {
                for (let constraintName in map.transform) {
                    let timelineMap = map.transform[constraintName];
                    let keyMap = timelineMap[0];
                    if (!keyMap)
                        continue;
                    let constraint = skeletonData.findTransformConstraint(constraintName);
                    if (!constraint)
                        throw new Error("Transform constraint not found: " + constraintName);
                    let constraintIndex = skeletonData.transformConstraints.indexOf(constraint);
                    let timeline = new spine.TransformConstraintTimeline(timelineMap.length, timelineMap.length * 6, constraintIndex);
                    let time = getValue(keyMap, "time", 0);
                    let mixRotate = getValue(keyMap, "mixRotate", 1);
                    let mixX = getValue(keyMap, "mixX", 1);
                    let mixY = getValue(keyMap, "mixY", mixX);
                    let mixScaleX = getValue(keyMap, "mixScaleX", 1);
                    let mixScaleY = getValue(keyMap, "mixScaleY", mixScaleX);
                    let mixShearY = getValue(keyMap, "mixShearY", 1);
                    for (let frame = 0, bezier = 0;; frame++) {
                        timeline.setFrame(frame, time, mixRotate, mixX, mixY, mixScaleX, mixScaleY, mixShearY);
                        let nextMap = timelineMap[frame + 1];
                        if (!nextMap) {
                            timeline.shrink(bezier);
                            break;
                        }
                        let time2 = getValue(nextMap, "time", 0);
                        let mixRotate2 = getValue(nextMap, "mixRotate", 1);
                        let mixX2 = getValue(nextMap, "mixX", 1);
                        let mixY2 = getValue(nextMap, "mixY", mixX2);
                        let mixScaleX2 = getValue(nextMap, "mixScaleX", 1);
                        let mixScaleY2 = getValue(nextMap, "mixScaleY", mixScaleX2);
                        let mixShearY2 = getValue(nextMap, "mixShearY", 1);
                        let curve = keyMap.curve;
                        if (curve) {
                            bezier = readCurve(curve, timeline, bezier, frame, 0, time, time2, mixRotate, mixRotate2, 1);
                            bezier = readCurve(curve, timeline, bezier, frame, 1, time, time2, mixX, mixX2, 1);
                            bezier = readCurve(curve, timeline, bezier, frame, 2, time, time2, mixY, mixY2, 1);
                            bezier = readCurve(curve, timeline, bezier, frame, 3, time, time2, mixScaleX, mixScaleX2, 1);
                            bezier = readCurve(curve, timeline, bezier, frame, 4, time, time2, mixScaleY, mixScaleY2, 1);
                            bezier = readCurve(curve, timeline, bezier, frame, 5, time, time2, mixShearY, mixShearY2, 1);
                        }
                        time = time2;
                        mixRotate = mixRotate2;
                        mixX = mixX2;
                        mixY = mixY2;
                        mixScaleX = mixScaleX2;
                        mixScaleY = mixScaleY2;
                        mixScaleX = mixScaleX2;
                        keyMap = nextMap;
                    }
                    timelines.push(timeline);
                }
            }
            if (map.path) {
                for (let constraintName in map.path) {
                    let constraintMap = map.path[constraintName];
                    let constraint = skeletonData.findPathConstraint(constraintName);
                    if (!constraint)
                        throw new Error("Path constraint not found: " + constraintName);
                    let constraintIndex = skeletonData.pathConstraints.indexOf(constraint);
                    for (let timelineName in constraintMap) {
                        let timelineMap = constraintMap[timelineName];
                        let keyMap = timelineMap[0];
                        if (!keyMap)
                            continue;
                        let frames = timelineMap.length;
                        if (timelineName === "position") {
                            let timeline = new spine.PathConstraintPositionTimeline(frames, frames, constraintIndex);
                            timelines.push(readTimeline1(timelineMap, timeline, 0, constraint.positionMode == spine.PositionMode.Fixed ? scale : 1));
                        }
                        else if (timelineName === "spacing") {
                            let timeline = new spine.PathConstraintSpacingTimeline(frames, frames, constraintIndex);
                            timelines.push(readTimeline1(timelineMap, timeline, 0, constraint.spacingMode == spine.SpacingMode.Length || constraint.spacingMode == spine.SpacingMode.Fixed ? scale : 1));
                        }
                        else if (timelineName === "mix") {
                            let timeline = new spine.PathConstraintMixTimeline(frames, frames * 3, constraintIndex);
                            let time = getValue(keyMap, "time", 0);
                            let mixRotate = getValue(keyMap, "mixRotate", 1);
                            let mixX = getValue(keyMap, "mixX", 1);
                            let mixY = getValue(keyMap, "mixY", mixX);
                            for (let frame = 0, bezier = 0;; frame++) {
                                timeline.setFrame(frame, time, mixRotate, mixX, mixY);
                                let nextMap = timelineMap[frame + 1];
                                if (!nextMap) {
                                    timeline.shrink(bezier);
                                    break;
                                }
                                let time2 = getValue(nextMap, "time", 0);
                                let mixRotate2 = getValue(nextMap, "mixRotate", 1);
                                let mixX2 = getValue(nextMap, "mixX", 1);
                                let mixY2 = getValue(nextMap, "mixY", mixX2);
                                let curve = keyMap.curve;
                                if (curve) {
                                    bezier = readCurve(curve, timeline, bezier, frame, 0, time, time2, mixRotate, mixRotate2, 1);
                                    bezier = readCurve(curve, timeline, bezier, frame, 1, time, time2, mixX, mixX2, 1);
                                    bezier = readCurve(curve, timeline, bezier, frame, 2, time, time2, mixY, mixY2, 1);
                                }
                                time = time2;
                                mixRotate = mixRotate2;
                                mixX = mixX2;
                                mixY = mixY2;
                                keyMap = nextMap;
                            }
                            timelines.push(timeline);
                        }
                    }
                }
            }
            if (map.physics) {
                for (let constraintName in map.physics) {
                    let constraintMap = map.physics[constraintName];
                    let constraintIndex = -1;
                    if (constraintName.length > 0) {
                        let constraint = skeletonData.findPhysicsConstraint(constraintName);
                        if (!constraint)
                            throw new Error("Physics constraint not found: " + constraintName);
                        constraintIndex = skeletonData.physicsConstraints.indexOf(constraint);
                    }
                    for (let timelineName in constraintMap) {
                        let timelineMap = constraintMap[timelineName];
                        let keyMap = timelineMap[0];
                        if (!keyMap)
                            continue;
                        let frames = timelineMap.length;
                        if (timelineName == "reset") {
                            const timeline = new spine.PhysicsConstraintResetTimeline(frames, constraintIndex);
                            for (let frame = 0; keyMap != null; keyMap = timelineMap[frame + 1], frame++)
                                timeline.setFrame(frame, getValue(keyMap, "time", 0));
                            timelines.push(timeline);
                            continue;
                        }
                        let timeline;
                        if (timelineName == "inertia")
                            timeline = new spine.PhysicsConstraintInertiaTimeline(frames, frames, constraintIndex);
                        else if (timelineName == "strength")
                            timeline = new spine.PhysicsConstraintStrengthTimeline(frames, frames, constraintIndex);
                        else if (timelineName == "damping")
                            timeline = new spine.PhysicsConstraintDampingTimeline(frames, frames, constraintIndex);
                        else if (timelineName == "mass")
                            timeline = new spine.PhysicsConstraintMassTimeline(frames, frames, constraintIndex);
                        else if (timelineName == "wind")
                            timeline = new spine.PhysicsConstraintWindTimeline(frames, frames, constraintIndex);
                        else if (timelineName == "gravity")
                            timeline = new spine.PhysicsConstraintGravityTimeline(frames, frames, constraintIndex);
                        else if (timelineName == "mix")
                            timeline = new spine.PhysicsConstraintMixTimeline(frames, frames, constraintIndex);
                        else
                            continue;
                        timelines.push(readTimeline1(timelineMap, timeline, 0, 1));
                    }
                }
            }
            if (map.attachments) {
                for (let attachmentsName in map.attachments) {
                    let attachmentsMap = map.attachments[attachmentsName];
                    let skin = skeletonData.findSkin(attachmentsName);
                    if (!skin)
                        throw new Error("Skin not found: " + attachmentsName);
                    for (let slotMapName in attachmentsMap) {
                        let slotMap = attachmentsMap[slotMapName];
                        let slot = skeletonData.findSlot(slotMapName);
                        if (!slot)
                            throw new Error("Slot not found: " + slotMapName);
                        let slotIndex = slot.index;
                        for (let attachmentMapName in slotMap) {
                            let attachmentMap = slotMap[attachmentMapName];
                            let attachment = skin.getAttachment(slotIndex, attachmentMapName);
                            for (let timelineMapName in attachmentMap) {
                                let timelineMap = attachmentMap[timelineMapName];
                                let keyMap = timelineMap[0];
                                if (!keyMap)
                                    continue;
                                if (timelineMapName == "deform") {
                                    let weighted = attachment.bones;
                                    let vertices = attachment.vertices;
                                    let deformLength = weighted ? vertices.length / 3 * 2 : vertices.length;
                                    let timeline = new spine.DeformTimeline(timelineMap.length, timelineMap.length, slotIndex, attachment);
                                    let time = getValue(keyMap, "time", 0);
                                    for (let frame = 0, bezier = 0;; frame++) {
                                        let deform;
                                        let verticesValue = getValue(keyMap, "vertices", null);
                                        if (!verticesValue)
                                            deform = weighted ? spine.Utils.newFloatArray(deformLength) : vertices;
                                        else {
                                            deform = spine.Utils.newFloatArray(deformLength);
                                            let start = getValue(keyMap, "offset", 0);
                                            spine.Utils.arrayCopy(verticesValue, 0, deform, start, verticesValue.length);
                                            if (scale != 1) {
                                                for (let i = start, n = i + verticesValue.length; i < n; i++)
                                                    deform[i] *= scale;
                                            }
                                            if (!weighted) {
                                                for (let i = 0; i < deformLength; i++)
                                                    deform[i] += vertices[i];
                                            }
                                        }
                                        timeline.setFrame(frame, time, deform);
                                        let nextMap = timelineMap[frame + 1];
                                        if (!nextMap) {
                                            timeline.shrink(bezier);
                                            break;
                                        }
                                        let time2 = getValue(nextMap, "time", 0);
                                        let curve = keyMap.curve;
                                        if (curve)
                                            bezier = readCurve(curve, timeline, bezier, frame, 0, time, time2, 0, 1, 1);
                                        time = time2;
                                        keyMap = nextMap;
                                    }
                                    timelines.push(timeline);
                                }
                                else if (timelineMapName == "sequence") {
                                    let timeline = new spine.SequenceTimeline(timelineMap.length, slotIndex, attachment);
                                    let lastDelay = 0;
                                    for (let frame = 0; frame < timelineMap.length; frame++) {
                                        let delay = getValue(keyMap, "delay", lastDelay);
                                        let time = getValue(keyMap, "time", 0);
                                        let mode = spine.SequenceMode[getValue(keyMap, "mode", "hold")];
                                        let index = getValue(keyMap, "index", 0);
                                        timeline.setFrame(frame, time, mode, index, delay);
                                        lastDelay = delay;
                                        keyMap = timelineMap[frame + 1];
                                    }
                                    timelines.push(timeline);
                                }
                            }
                        }
                    }
                }
            }
            if (map.drawOrder) {
                let timeline = new spine.DrawOrderTimeline(map.drawOrder.length);
                let slotCount = skeletonData.slots.length;
                let frame = 0;
                for (let i = 0; i < map.drawOrder.length; i++, frame++) {
                    let drawOrderMap = map.drawOrder[i];
                    let drawOrder = null;
                    let offsets = getValue(drawOrderMap, "offsets", null);
                    if (offsets) {
                        drawOrder = spine.Utils.newArray(slotCount, -1);
                        let unchanged = spine.Utils.newArray(slotCount - offsets.length, 0);
                        let originalIndex = 0, unchangedIndex = 0;
                        for (let ii = 0; ii < offsets.length; ii++) {
                            let offsetMap = offsets[ii];
                            let slot = skeletonData.findSlot(offsetMap.slot);
                            if (!slot)
                                throw new Error("Slot not found: " + slot);
                            let slotIndex = slot.index;
                            while (originalIndex != slotIndex)
                                unchanged[unchangedIndex++] = originalIndex++;
                            drawOrder[originalIndex + offsetMap.offset] = originalIndex++;
                        }
                        while (originalIndex < slotCount)
                            unchanged[unchangedIndex++] = originalIndex++;
                        for (let ii = slotCount - 1; ii >= 0; ii--)
                            if (drawOrder[ii] == -1)
                                drawOrder[ii] = unchanged[--unchangedIndex];
                    }
                    timeline.setFrame(frame, getValue(drawOrderMap, "time", 0), drawOrder);
                }
                timelines.push(timeline);
            }
            if (map.events) {
                let timeline = new spine.EventTimeline(map.events.length);
                let frame = 0;
                for (let i = 0; i < map.events.length; i++, frame++) {
                    let eventMap = map.events[i];
                    let eventData = skeletonData.findEvent(eventMap.name);
                    if (!eventData)
                        throw new Error("Event not found: " + eventMap.name);
                    let event = new spine.Event(spine.Utils.toSinglePrecision(getValue(eventMap, "time", 0)), eventData);
                    event.intValue = getValue(eventMap, "int", eventData.intValue);
                    event.floatValue = getValue(eventMap, "float", eventData.floatValue);
                    event.stringValue = getValue(eventMap, "string", eventData.stringValue);
                    if (event.data.audioPath) {
                        event.volume = getValue(eventMap, "volume", 1);
                        event.balance = getValue(eventMap, "balance", 0);
                    }
                    timeline.setFrame(frame, event);
                }
                timelines.push(timeline);
            }
            let duration = 0;
            for (let i = 0, n = timelines.length; i < n; i++)
                duration = Math.max(duration, timelines[i].getDuration());
            skeletonData.animations.push(new spine.Animation(name, timelines, duration));
        }
    }
    spine.SkeletonJson = SkeletonJson;
    class LinkedMesh {
        constructor(mesh, skin, slotIndex, parent, inheritDeform) {
            this.mesh = mesh;
            this.skin = skin;
            this.slotIndex = slotIndex;
            this.parent = parent;
            this.inheritTimeline = inheritDeform;
        }
    }
    function readTimeline1(keys, timeline, defaultValue, scale) {
        let keyMap = keys[0];
        let time = getValue(keyMap, "time", 0);
        let value = getValue(keyMap, "value", defaultValue) * scale;
        let bezier = 0;
        for (let frame = 0;; frame++) {
            timeline.setFrame(frame, time, value);
            let nextMap = keys[frame + 1];
            if (!nextMap) {
                timeline.shrink(bezier);
                return timeline;
            }
            let time2 = getValue(nextMap, "time", 0);
            let value2 = getValue(nextMap, "value", defaultValue) * scale;
            if (keyMap.curve)
                bezier = readCurve(keyMap.curve, timeline, bezier, frame, 0, time, time2, value, value2, scale);
            time = time2;
            value = value2;
            keyMap = nextMap;
        }
    }
    function readTimeline2(keys, timeline, name1, name2, defaultValue, scale) {
        let keyMap = keys[0];
        let time = getValue(keyMap, "time", 0);
        let value1 = getValue(keyMap, name1, defaultValue) * scale;
        let value2 = getValue(keyMap, name2, defaultValue) * scale;
        let bezier = 0;
        for (let frame = 0;; frame++) {
            timeline.setFrame(frame, time, value1, value2);
            let nextMap = keys[frame + 1];
            if (!nextMap) {
                timeline.shrink(bezier);
                return timeline;
            }
            let time2 = getValue(nextMap, "time", 0);
            let nvalue1 = getValue(nextMap, name1, defaultValue) * scale;
            let nvalue2 = getValue(nextMap, name2, defaultValue) * scale;
            let curve = keyMap.curve;
            if (curve) {
                bezier = readCurve(curve, timeline, bezier, frame, 0, time, time2, value1, nvalue1, scale);
                bezier = readCurve(curve, timeline, bezier, frame, 1, time, time2, value2, nvalue2, scale);
            }
            time = time2;
            value1 = nvalue1;
            value2 = nvalue2;
            keyMap = nextMap;
        }
    }
    function readCurve(curve, timeline, bezier, frame, value, time1, time2, value1, value2, scale) {
        if (curve == "stepped") {
            timeline.setStepped(frame);
            return bezier;
        }
        let i = value << 2;
        let cx1 = curve[i];
        let cy1 = curve[i + 1] * scale;
        let cx2 = curve[i + 2];
        let cy2 = curve[i + 3] * scale;
        timeline.setBezier(bezier, frame, value, time1, value1, cx1, cy1, cx2, cy2, time2, value2);
        return bezier + 1;
    }
    function getValue(map, property, defaultValue) {
        return map[property] !== undefined ? map[property] : defaultValue;
    }
})(spine || (spine = {}));
var spine;
(function (spine) {
    class SkinEntry {
        constructor(slotIndex = 0, name, attachment) {
            this.slotIndex = slotIndex;
            this.name = name;
            this.attachment = attachment;
        }
    }
    spine.SkinEntry = SkinEntry;
    class Skin {
        constructor(name) {
            this.attachments = new Array();
            this.bones = Array();
            this.constraints = new Array();
            this.color = new spine.Color(0.99607843, 0.61960787, 0.30980393, 1);
            if (!name)
                throw new Error("name cannot be null.");
            this.name = name;
        }
        setAttachment(slotIndex, name, attachment) {
            if (!attachment)
                throw new Error("attachment cannot be null.");
            let attachments = this.attachments;
            if (slotIndex >= attachments.length)
                attachments.length = slotIndex + 1;
            if (!attachments[slotIndex])
                attachments[slotIndex] = {};
            attachments[slotIndex][name] = attachment;
        }
        addSkin(skin) {
            for (let i = 0; i < skin.bones.length; i++) {
                let bone = skin.bones[i];
                let contained = false;
                for (let ii = 0; ii < this.bones.length; ii++) {
                    if (this.bones[ii] == bone) {
                        contained = true;
                        break;
                    }
                }
                if (!contained)
                    this.bones.push(bone);
            }
            for (let i = 0; i < skin.constraints.length; i++) {
                let constraint = skin.constraints[i];
                let contained = false;
                for (let ii = 0; ii < this.constraints.length; ii++) {
                    if (this.constraints[ii] == constraint) {
                        contained = true;
                        break;
                    }
                }
                if (!contained)
                    this.constraints.push(constraint);
            }
            let attachments = skin.getAttachments();
            for (let i = 0; i < attachments.length; i++) {
                var attachment = attachments[i];
                this.setAttachment(attachment.slotIndex, attachment.name, attachment.attachment);
            }
        }
        copySkin(skin) {
            for (let i = 0; i < skin.bones.length; i++) {
                let bone = skin.bones[i];
                let contained = false;
                for (let ii = 0; ii < this.bones.length; ii++) {
                    if (this.bones[ii] == bone) {
                        contained = true;
                        break;
                    }
                }
                if (!contained)
                    this.bones.push(bone);
            }
            for (let i = 0; i < skin.constraints.length; i++) {
                let constraint = skin.constraints[i];
                let contained = false;
                for (let ii = 0; ii < this.constraints.length; ii++) {
                    if (this.constraints[ii] == constraint) {
                        contained = true;
                        break;
                    }
                }
                if (!contained)
                    this.constraints.push(constraint);
            }
            let attachments = skin.getAttachments();
            for (let i = 0; i < attachments.length; i++) {
                var attachment = attachments[i];
                if (!attachment.attachment)
                    continue;
                if (attachment.attachment instanceof spine.MeshAttachment) {
                    attachment.attachment = attachment.attachment.newLinkedMesh();
                    this.setAttachment(attachment.slotIndex, attachment.name, attachment.attachment);
                }
                else {
                    attachment.attachment = attachment.attachment.copy();
                    this.setAttachment(attachment.slotIndex, attachment.name, attachment.attachment);
                }
            }
        }
        getAttachment(slotIndex, name) {
            let dictionary = this.attachments[slotIndex];
            return dictionary ? dictionary[name] : null;
        }
        removeAttachment(slotIndex, name) {
            let dictionary = this.attachments[slotIndex];
            if (dictionary)
                delete dictionary[name];
        }
        getAttachments() {
            let entries = new Array();
            for (var i = 0; i < this.attachments.length; i++) {
                let slotAttachments = this.attachments[i];
                if (slotAttachments) {
                    for (let name in slotAttachments) {
                        let attachment = slotAttachments[name];
                        if (attachment)
                            entries.push(new SkinEntry(i, name, attachment));
                    }
                }
            }
            return entries;
        }
        getAttachmentsForSlot(slotIndex, attachments) {
            let slotAttachments = this.attachments[slotIndex];
            if (slotAttachments) {
                for (let name in slotAttachments) {
                    let attachment = slotAttachments[name];
                    if (attachment)
                        attachments.push(new SkinEntry(slotIndex, name, attachment));
                }
            }
        }
        clear() {
            this.attachments.length = 0;
            this.bones.length = 0;
            this.constraints.length = 0;
        }
        attachAll(skeleton, oldSkin) {
            let slotIndex = 0;
            for (let i = 0; i < skeleton.slots.length; i++) {
                let slot = skeleton.slots[i];
                let slotAttachment = slot.getAttachment();
                if (slotAttachment && slotIndex < oldSkin.attachments.length) {
                    let dictionary = oldSkin.attachments[slotIndex];
                    for (let key in dictionary) {
                        let skinAttachment = dictionary[key];
                        if (slotAttachment == skinAttachment) {
                            let attachment = this.getAttachment(slotIndex, key);
                            if (attachment)
                                slot.setAttachment(attachment);
                            break;
                        }
                    }
                }
                slotIndex++;
            }
        }
    }
    spine.Skin = Skin;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class Slot {
        constructor(data, bone) {
            this.darkColor = null;
            this.attachment = null;
            this.attachmentState = 0;
            this.sequenceIndex = -1;
            this.deform = new Array();
            if (!data)
                throw new Error("data cannot be null.");
            if (!bone)
                throw new Error("bone cannot be null.");
            this.data = data;
            this.bone = bone;
            this.color = new spine.Color();
            this.darkColor = !data.darkColor ? null : new spine.Color();
            this.setToSetupPose();
        }
        getSkeleton() {
            return this.bone.skeleton;
        }
        getAttachment() {
            return this.attachment;
        }
        setAttachment(attachment) {
            if (this.attachment == attachment)
                return;
            if (!(attachment instanceof spine.VertexAttachment) || !(this.attachment instanceof spine.VertexAttachment)
                || attachment.timelineAttachment != this.attachment.timelineAttachment) {
                this.deform.length = 0;
            }
            this.attachment = attachment;
            this.sequenceIndex = -1;
        }
        setToSetupPose() {
            this.color.setFromColor(this.data.color);
            if (this.darkColor)
                this.darkColor.setFromColor(this.data.darkColor);
            if (!this.data.attachmentName)
                this.attachment = null;
            else {
                this.attachment = null;
                this.setAttachment(this.bone.skeleton.getAttachment(this.data.index, this.data.attachmentName));
            }
        }
    }
    spine.Slot = Slot;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class SlotData {
        constructor(index, name, boneData) {
            this.index = 0;
            this.color = new spine.Color(1, 1, 1, 1);
            this.darkColor = null;
            this.attachmentName = null;
            this.blendMode = BlendMode.Normal;
            this.visible = true;
            if (index < 0)
                throw new Error("index must be >= 0.");
            if (!name)
                throw new Error("name cannot be null.");
            if (!boneData)
                throw new Error("boneData cannot be null.");
            this.index = index;
            this.name = name;
            this.boneData = boneData;
        }
    }
    spine.SlotData = SlotData;
    let BlendMode;
    (function (BlendMode) {
        BlendMode[BlendMode["Normal"] = 0] = "Normal";
        BlendMode[BlendMode["Additive"] = 1] = "Additive";
        BlendMode[BlendMode["Multiply"] = 2] = "Multiply";
        BlendMode[BlendMode["Screen"] = 3] = "Screen";
    })(BlendMode = spine.BlendMode || (spine.BlendMode = {}));
})(spine || (spine = {}));
var spine;
(function (spine) {
    class Texture {
        constructor(image) {
            this._image = image;
        }
        getImage() {
            return this._image;
        }
    }
    spine.Texture = Texture;
    let TextureFilter;
    (function (TextureFilter) {
        TextureFilter[TextureFilter["Nearest"] = 9728] = "Nearest";
        TextureFilter[TextureFilter["Linear"] = 9729] = "Linear";
        TextureFilter[TextureFilter["MipMap"] = 9987] = "MipMap";
        TextureFilter[TextureFilter["MipMapNearestNearest"] = 9984] = "MipMapNearestNearest";
        TextureFilter[TextureFilter["MipMapLinearNearest"] = 9985] = "MipMapLinearNearest";
        TextureFilter[TextureFilter["MipMapNearestLinear"] = 9986] = "MipMapNearestLinear";
        TextureFilter[TextureFilter["MipMapLinearLinear"] = 9987] = "MipMapLinearLinear";
    })(TextureFilter = spine.TextureFilter || (spine.TextureFilter = {}));
    let TextureWrap;
    (function (TextureWrap) {
        TextureWrap[TextureWrap["MirroredRepeat"] = 33648] = "MirroredRepeat";
        TextureWrap[TextureWrap["ClampToEdge"] = 33071] = "ClampToEdge";
        TextureWrap[TextureWrap["Repeat"] = 10497] = "Repeat";
    })(TextureWrap = spine.TextureWrap || (spine.TextureWrap = {}));
    class TextureRegion {
        constructor() {
            this.u = 0;
            this.v = 0;
            this.u2 = 0;
            this.v2 = 0;
            this.width = 0;
            this.height = 0;
            this.degrees = 0;
            this.offsetX = 0;
            this.offsetY = 0;
            this.originalWidth = 0;
            this.originalHeight = 0;
        }
    }
    spine.TextureRegion = TextureRegion;
    class FakeTexture extends Texture {
        setFilters(minFilter, magFilter) { }
        setWraps(uWrap, vWrap) { }
        dispose() { }
    }
    spine.FakeTexture = FakeTexture;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class TextureAtlas {
        constructor(atlasText) {
            this.pages = new Array();
            this.regions = new Array();
            let reader = new TextureAtlasReader(atlasText);
            let entry = new Array(4);
            let pageFields = {};
            pageFields["size"] = (page) => {
                page.width = parseInt(entry[1]);
                page.height = parseInt(entry[2]);
            };
            pageFields["format"] = () => {
            };
            pageFields["filter"] = (page) => {
                page.minFilter = spine.Utils.enumValue(spine.TextureFilter, entry[1]);
                page.magFilter = spine.Utils.enumValue(spine.TextureFilter, entry[2]);
            };
            pageFields["repeat"] = (page) => {
                if (entry[1].indexOf('x') != -1)
                    page.uWrap = spine.TextureWrap.Repeat;
                if (entry[1].indexOf('y') != -1)
                    page.vWrap = spine.TextureWrap.Repeat;
            };
            pageFields["pma"] = (page) => {
                page.pma = entry[1] == "true";
            };
            var regionFields = {};
            regionFields["xy"] = (region) => {
                region.x = parseInt(entry[1]);
                region.y = parseInt(entry[2]);
            };
            regionFields["size"] = (region) => {
                region.width = parseInt(entry[1]);
                region.height = parseInt(entry[2]);
            };
            regionFields["bounds"] = (region) => {
                region.x = parseInt(entry[1]);
                region.y = parseInt(entry[2]);
                region.width = parseInt(entry[3]);
                region.height = parseInt(entry[4]);
            };
            regionFields["offset"] = (region) => {
                region.offsetX = parseInt(entry[1]);
                region.offsetY = parseInt(entry[2]);
            };
            regionFields["orig"] = (region) => {
                region.originalWidth = parseInt(entry[1]);
                region.originalHeight = parseInt(entry[2]);
            };
            regionFields["offsets"] = (region) => {
                region.offsetX = parseInt(entry[1]);
                region.offsetY = parseInt(entry[2]);
                region.originalWidth = parseInt(entry[3]);
                region.originalHeight = parseInt(entry[4]);
            };
            regionFields["rotate"] = (region) => {
                let value = entry[1];
                if (value == "true")
                    region.degrees = 90;
                else if (value != "false")
                    region.degrees = parseInt(value);
            };
            regionFields["index"] = (region) => {
                region.index = parseInt(entry[1]);
            };
            let line = reader.readLine();
            while (line && line.trim().length == 0)
                line = reader.readLine();
            while (true) {
                if (!line || line.trim().length == 0)
                    break;
                if (reader.readEntry(entry, line) == 0)
                    break;
                line = reader.readLine();
            }
            let page = null;
            let names = null;
            let values = null;
            while (true) {
                if (line === null)
                    break;
                if (line.trim().length == 0) {
                    page = null;
                    line = reader.readLine();
                }
                else if (!page) {
                    page = new TextureAtlasPage(line.trim());
                    while (true) {
                        if (reader.readEntry(entry, line = reader.readLine()) == 0)
                            break;
                        let field = pageFields[entry[0]];
                        if (field)
                            field(page);
                    }
                    this.pages.push(page);
                }
                else {
                    let region = new TextureAtlasRegion(page, line);
                    while (true) {
                        let count = reader.readEntry(entry, line = reader.readLine());
                        if (count == 0)
                            break;
                        let field = regionFields[entry[0]];
                        if (field)
                            field(region);
                        else {
                            if (!names)
                                names = [];
                            if (!values)
                                values = [];
                            names.push(entry[0]);
                            let entryValues = [];
                            for (let i = 0; i < count; i++)
                                entryValues.push(parseInt(entry[i + 1]));
                            values.push(entryValues);
                        }
                    }
                    if (region.originalWidth == 0 && region.originalHeight == 0) {
                        region.originalWidth = region.width;
                        region.originalHeight = region.height;
                    }
                    if (names && names.length > 0 && values && values.length > 0) {
                        region.names = names;
                        region.values = values;
                        names = null;
                        values = null;
                    }
                    region.u = region.x / page.width;
                    region.v = region.y / page.height;
                    if (region.degrees == 90) {
                        region.u2 = (region.x + region.height) / page.width;
                        region.v2 = (region.y + region.width) / page.height;
                    }
                    else {
                        region.u2 = (region.x + region.width) / page.width;
                        region.v2 = (region.y + region.height) / page.height;
                    }
                    this.regions.push(region);
                }
            }
        }
        findRegion(name) {
            for (let i = 0; i < this.regions.length; i++) {
                if (this.regions[i].name == name) {
                    return this.regions[i];
                }
            }
            return null;
        }
        setTextures(assetManager, pathPrefix = "") {
            for (let page of this.pages)
                page.setTexture(assetManager.get(pathPrefix + page.name));
        }
        dispose() {
            var _a;
            for (let i = 0; i < this.pages.length; i++) {
                (_a = this.pages[i].texture) === null || _a === void 0 ? void 0 : _a.dispose();
            }
        }
    }
    spine.TextureAtlas = TextureAtlas;
    class TextureAtlasReader {
        constructor(text) {
            this.index = 0;
            this.lines = text.split(/\r\n|\r|\n/);
        }
        readLine() {
            if (this.index >= this.lines.length)
                return null;
            return this.lines[this.index++];
        }
        readEntry(entry, line) {
            if (!line)
                return 0;
            line = line.trim();
            if (line.length == 0)
                return 0;
            let colon = line.indexOf(':');
            if (colon == -1)
                return 0;
            entry[0] = line.substr(0, colon).trim();
            for (let i = 1, lastMatch = colon + 1;; i++) {
                let comma = line.indexOf(',', lastMatch);
                if (comma == -1) {
                    entry[i] = line.substr(lastMatch).trim();
                    return i;
                }
                entry[i] = line.substr(lastMatch, comma - lastMatch).trim();
                lastMatch = comma + 1;
                if (i == 4)
                    return 4;
            }
        }
    }
    class TextureAtlasPage {
        constructor(name) {
            this.minFilter = spine.TextureFilter.Nearest;
            this.magFilter = spine.TextureFilter.Nearest;
            this.uWrap = spine.TextureWrap.ClampToEdge;
            this.vWrap = spine.TextureWrap.ClampToEdge;
            this.texture = null;
            this.width = 0;
            this.height = 0;
            this.pma = false;
            this.regions = new Array();
            this.name = name;
        }
        setTexture(texture) {
            this.texture = texture;
            texture.setFilters(this.minFilter, this.magFilter);
            texture.setWraps(this.uWrap, this.vWrap);
            for (let region of this.regions)
                region.texture = texture;
        }
    }
    spine.TextureAtlasPage = TextureAtlasPage;
    class TextureAtlasRegion extends spine.TextureRegion {
        constructor(page, name) {
            super();
            this.x = 0;
            this.y = 0;
            this.offsetX = 0;
            this.offsetY = 0;
            this.originalWidth = 0;
            this.originalHeight = 0;
            this.index = 0;
            this.degrees = 0;
            this.names = null;
            this.values = null;
            this.page = page;
            this.name = name;
            page.regions.push(this);
        }
    }
    spine.TextureAtlasRegion = TextureAtlasRegion;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class TransformConstraint {
        constructor(data, skeleton) {
            this.mixRotate = 0;
            this.mixX = 0;
            this.mixY = 0;
            this.mixScaleX = 0;
            this.mixScaleY = 0;
            this.mixShearY = 0;
            this.temp = new spine.Vector2();
            this.active = false;
            if (!data)
                throw new Error("data cannot be null.");
            if (!skeleton)
                throw new Error("skeleton cannot be null.");
            this.data = data;
            this.bones = new Array();
            for (let i = 0; i < data.bones.length; i++) {
                let bone = skeleton.findBone(data.bones[i].name);
                if (!bone)
                    throw new Error(`Couldn't find bone ${data.bones[i].name}.`);
                this.bones.push(bone);
            }
            let target = skeleton.findBone(data.target.name);
            if (!target)
                throw new Error(`Couldn't find target bone ${data.target.name}.`);
            this.target = target;
            this.mixRotate = data.mixRotate;
            this.mixX = data.mixX;
            this.mixY = data.mixY;
            this.mixScaleX = data.mixScaleX;
            this.mixScaleY = data.mixScaleY;
            this.mixShearY = data.mixShearY;
        }
        isActive() {
            return this.active;
        }
        setToSetupPose() {
            const data = this.data;
            this.mixRotate = data.mixRotate;
            this.mixX = data.mixX;
            this.mixY = data.mixY;
            this.mixScaleX = data.mixScaleX;
            this.mixScaleY = data.mixScaleY;
            this.mixShearY = data.mixShearY;
        }
        update(physics) {
            if (this.mixRotate == 0 && this.mixX == 0 && this.mixY == 0 && this.mixScaleX == 0 && this.mixScaleY == 0 && this.mixShearY == 0)
                return;
            if (this.data.local) {
                if (this.data.relative)
                    this.applyRelativeLocal();
                else
                    this.applyAbsoluteLocal();
            }
            else {
                if (this.data.relative)
                    this.applyRelativeWorld();
                else
                    this.applyAbsoluteWorld();
            }
        }
        applyAbsoluteWorld() {
            let mixRotate = this.mixRotate, mixX = this.mixX, mixY = this.mixY, mixScaleX = this.mixScaleX, mixScaleY = this.mixScaleY, mixShearY = this.mixShearY;
            let translate = mixX != 0 || mixY != 0;
            let target = this.target;
            let ta = target.a, tb = target.b, tc = target.c, td = target.d;
            let degRadReflect = ta * td - tb * tc > 0 ? spine.MathUtils.degRad : -spine.MathUtils.degRad;
            let offsetRotation = this.data.offsetRotation * degRadReflect;
            let offsetShearY = this.data.offsetShearY * degRadReflect;
            let bones = this.bones;
            for (let i = 0, n = bones.length; i < n; i++) {
                let bone = bones[i];
                if (mixRotate != 0) {
                    let a = bone.a, b = bone.b, c = bone.c, d = bone.d;
                    let r = Math.atan2(tc, ta) - Math.atan2(c, a) + offsetRotation;
                    if (r > spine.MathUtils.PI)
                        r -= spine.MathUtils.PI2;
                    else if (r < -spine.MathUtils.PI)
                        r += spine.MathUtils.PI2;
                    r *= mixRotate;
                    let cos = Math.cos(r), sin = Math.sin(r);
                    bone.a = cos * a - sin * c;
                    bone.b = cos * b - sin * d;
                    bone.c = sin * a + cos * c;
                    bone.d = sin * b + cos * d;
                }
                if (translate) {
                    let temp = this.temp;
                    target.localToWorld(temp.set(this.data.offsetX, this.data.offsetY));
                    bone.worldX += (temp.x - bone.worldX) * mixX;
                    bone.worldY += (temp.y - bone.worldY) * mixY;
                }
                if (mixScaleX != 0) {
                    let s = Math.sqrt(bone.a * bone.a + bone.c * bone.c);
                    if (s != 0)
                        s = (s + (Math.sqrt(ta * ta + tc * tc) - s + this.data.offsetScaleX) * mixScaleX) / s;
                    bone.a *= s;
                    bone.c *= s;
                }
                if (mixScaleY != 0) {
                    let s = Math.sqrt(bone.b * bone.b + bone.d * bone.d);
                    if (s != 0)
                        s = (s + (Math.sqrt(tb * tb + td * td) - s + this.data.offsetScaleY) * mixScaleY) / s;
                    bone.b *= s;
                    bone.d *= s;
                }
                if (mixShearY > 0) {
                    let b = bone.b, d = bone.d;
                    let by = Math.atan2(d, b);
                    let r = Math.atan2(td, tb) - Math.atan2(tc, ta) - (by - Math.atan2(bone.c, bone.a));
                    if (r > spine.MathUtils.PI)
                        r -= spine.MathUtils.PI2;
                    else if (r < -spine.MathUtils.PI)
                        r += spine.MathUtils.PI2;
                    r = by + (r + offsetShearY) * mixShearY;
                    let s = Math.sqrt(b * b + d * d);
                    bone.b = Math.cos(r) * s;
                    bone.d = Math.sin(r) * s;
                }
                bone.updateAppliedTransform();
            }
        }
        applyRelativeWorld() {
            let mixRotate = this.mixRotate, mixX = this.mixX, mixY = this.mixY, mixScaleX = this.mixScaleX, mixScaleY = this.mixScaleY, mixShearY = this.mixShearY;
            let translate = mixX != 0 || mixY != 0;
            let target = this.target;
            let ta = target.a, tb = target.b, tc = target.c, td = target.d;
            let degRadReflect = ta * td - tb * tc > 0 ? spine.MathUtils.degRad : -spine.MathUtils.degRad;
            let offsetRotation = this.data.offsetRotation * degRadReflect, offsetShearY = this.data.offsetShearY * degRadReflect;
            let bones = this.bones;
            for (let i = 0, n = bones.length; i < n; i++) {
                let bone = bones[i];
                if (mixRotate != 0) {
                    let a = bone.a, b = bone.b, c = bone.c, d = bone.d;
                    let r = Math.atan2(tc, ta) + offsetRotation;
                    if (r > spine.MathUtils.PI)
                        r -= spine.MathUtils.PI2;
                    else if (r < -spine.MathUtils.PI)
                        r += spine.MathUtils.PI2;
                    r *= mixRotate;
                    let cos = Math.cos(r), sin = Math.sin(r);
                    bone.a = cos * a - sin * c;
                    bone.b = cos * b - sin * d;
                    bone.c = sin * a + cos * c;
                    bone.d = sin * b + cos * d;
                }
                if (translate) {
                    let temp = this.temp;
                    target.localToWorld(temp.set(this.data.offsetX, this.data.offsetY));
                    bone.worldX += temp.x * mixX;
                    bone.worldY += temp.y * mixY;
                }
                if (mixScaleX != 0) {
                    let s = (Math.sqrt(ta * ta + tc * tc) - 1 + this.data.offsetScaleX) * mixScaleX + 1;
                    bone.a *= s;
                    bone.c *= s;
                }
                if (mixScaleY != 0) {
                    let s = (Math.sqrt(tb * tb + td * td) - 1 + this.data.offsetScaleY) * mixScaleY + 1;
                    bone.b *= s;
                    bone.d *= s;
                }
                if (mixShearY > 0) {
                    let r = Math.atan2(td, tb) - Math.atan2(tc, ta);
                    if (r > spine.MathUtils.PI)
                        r -= spine.MathUtils.PI2;
                    else if (r < -spine.MathUtils.PI)
                        r += spine.MathUtils.PI2;
                    let b = bone.b, d = bone.d;
                    r = Math.atan2(d, b) + (r - spine.MathUtils.PI / 2 + offsetShearY) * mixShearY;
                    let s = Math.sqrt(b * b + d * d);
                    bone.b = Math.cos(r) * s;
                    bone.d = Math.sin(r) * s;
                }
                bone.updateAppliedTransform();
            }
        }
        applyAbsoluteLocal() {
            let mixRotate = this.mixRotate, mixX = this.mixX, mixY = this.mixY, mixScaleX = this.mixScaleX, mixScaleY = this.mixScaleY, mixShearY = this.mixShearY;
            let target = this.target;
            let bones = this.bones;
            for (let i = 0, n = bones.length; i < n; i++) {
                let bone = bones[i];
                let rotation = bone.arotation;
                if (mixRotate != 0)
                    rotation += (target.arotation - rotation + this.data.offsetRotation) * mixRotate;
                let x = bone.ax, y = bone.ay;
                x += (target.ax - x + this.data.offsetX) * mixX;
                y += (target.ay - y + this.data.offsetY) * mixY;
                let scaleX = bone.ascaleX, scaleY = bone.ascaleY;
                if (mixScaleX != 0 && scaleX != 0)
                    scaleX = (scaleX + (target.ascaleX - scaleX + this.data.offsetScaleX) * mixScaleX) / scaleX;
                if (mixScaleY != 0 && scaleY != 0)
                    scaleY = (scaleY + (target.ascaleY - scaleY + this.data.offsetScaleY) * mixScaleY) / scaleY;
                let shearY = bone.ashearY;
                if (mixShearY != 0)
                    shearY += (target.ashearY - shearY + this.data.offsetShearY) * mixShearY;
                bone.updateWorldTransformWith(x, y, rotation, scaleX, scaleY, bone.ashearX, shearY);
            }
        }
        applyRelativeLocal() {
            let mixRotate = this.mixRotate, mixX = this.mixX, mixY = this.mixY, mixScaleX = this.mixScaleX, mixScaleY = this.mixScaleY, mixShearY = this.mixShearY;
            let target = this.target;
            let bones = this.bones;
            for (let i = 0, n = bones.length; i < n; i++) {
                let bone = bones[i];
                let rotation = bone.arotation + (target.arotation + this.data.offsetRotation) * mixRotate;
                let x = bone.ax + (target.ax + this.data.offsetX) * mixX;
                let y = bone.ay + (target.ay + this.data.offsetY) * mixY;
                let scaleX = bone.ascaleX * (((target.ascaleX - 1 + this.data.offsetScaleX) * mixScaleX) + 1);
                let scaleY = bone.ascaleY * (((target.ascaleY - 1 + this.data.offsetScaleY) * mixScaleY) + 1);
                let shearY = bone.ashearY + (target.ashearY + this.data.offsetShearY) * mixShearY;
                bone.updateWorldTransformWith(x, y, rotation, scaleX, scaleY, bone.ashearX, shearY);
            }
        }
    }
    spine.TransformConstraint = TransformConstraint;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class TransformConstraintData extends spine.ConstraintData {
        constructor(name) {
            super(name, 0, false);
            this.bones = new Array();
            this._target = null;
            this.mixRotate = 0;
            this.mixX = 0;
            this.mixY = 0;
            this.mixScaleX = 0;
            this.mixScaleY = 0;
            this.mixShearY = 0;
            this.offsetRotation = 0;
            this.offsetX = 0;
            this.offsetY = 0;
            this.offsetScaleX = 0;
            this.offsetScaleY = 0;
            this.offsetShearY = 0;
            this.relative = false;
            this.local = false;
        }
        set target(boneData) { this._target = boneData; }
        get target() {
            if (!this._target)
                throw new Error("BoneData not set.");
            else
                return this._target;
        }
    }
    spine.TransformConstraintData = TransformConstraintData;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class Triangulator {
        constructor() {
            this.convexPolygons = new Array();
            this.convexPolygonsIndices = new Array();
            this.indicesArray = new Array();
            this.isConcaveArray = new Array();
            this.triangles = new Array();
            this.polygonPool = new spine.Pool(() => {
                return new Array();
            });
            this.polygonIndicesPool = new spine.Pool(() => {
                return new Array();
            });
        }
        triangulate(verticesArray) {
            let vertices = verticesArray;
            let vertexCount = verticesArray.length >> 1;
            let indices = this.indicesArray;
            indices.length = 0;
            for (let i = 0; i < vertexCount; i++)
                indices[i] = i;
            let isConcave = this.isConcaveArray;
            isConcave.length = 0;
            for (let i = 0, n = vertexCount; i < n; ++i)
                isConcave[i] = Triangulator.isConcave(i, vertexCount, vertices, indices);
            let triangles = this.triangles;
            triangles.length = 0;
            while (vertexCount > 3) {
                let previous = vertexCount - 1, i = 0, next = 1;
                while (true) {
                    outer: if (!isConcave[i]) {
                        let p1 = indices[previous] << 1, p2 = indices[i] << 1, p3 = indices[next] << 1;
                        let p1x = vertices[p1], p1y = vertices[p1 + 1];
                        let p2x = vertices[p2], p2y = vertices[p2 + 1];
                        let p3x = vertices[p3], p3y = vertices[p3 + 1];
                        for (let ii = (next + 1) % vertexCount; ii != previous; ii = (ii + 1) % vertexCount) {
                            if (!isConcave[ii])
                                continue;
                            let v = indices[ii] << 1;
                            let vx = vertices[v], vy = vertices[v + 1];
                            if (Triangulator.positiveArea(p3x, p3y, p1x, p1y, vx, vy)) {
                                if (Triangulator.positiveArea(p1x, p1y, p2x, p2y, vx, vy)) {
                                    if (Triangulator.positiveArea(p2x, p2y, p3x, p3y, vx, vy))
                                        break outer;
                                }
                            }
                        }
                        break;
                    }
                    if (next == 0) {
                        do {
                            if (!isConcave[i])
                                break;
                            i--;
                        } while (i > 0);
                        break;
                    }
                    previous = i;
                    i = next;
                    next = (next + 1) % vertexCount;
                }
                triangles.push(indices[(vertexCount + i - 1) % vertexCount]);
                triangles.push(indices[i]);
                triangles.push(indices[(i + 1) % vertexCount]);
                indices.splice(i, 1);
                isConcave.splice(i, 1);
                vertexCount--;
                let previousIndex = (vertexCount + i - 1) % vertexCount;
                let nextIndex = i == vertexCount ? 0 : i;
                isConcave[previousIndex] = Triangulator.isConcave(previousIndex, vertexCount, vertices, indices);
                isConcave[nextIndex] = Triangulator.isConcave(nextIndex, vertexCount, vertices, indices);
            }
            if (vertexCount == 3) {
                triangles.push(indices[2]);
                triangles.push(indices[0]);
                triangles.push(indices[1]);
            }
            return triangles;
        }
        decompose(verticesArray, triangles) {
            let vertices = verticesArray;
            let convexPolygons = this.convexPolygons;
            this.polygonPool.freeAll(convexPolygons);
            convexPolygons.length = 0;
            let convexPolygonsIndices = this.convexPolygonsIndices;
            this.polygonIndicesPool.freeAll(convexPolygonsIndices);
            convexPolygonsIndices.length = 0;
            let polygonIndices = this.polygonIndicesPool.obtain();
            polygonIndices.length = 0;
            let polygon = this.polygonPool.obtain();
            polygon.length = 0;
            let fanBaseIndex = -1, lastWinding = 0;
            for (let i = 0, n = triangles.length; i < n; i += 3) {
                let t1 = triangles[i] << 1, t2 = triangles[i + 1] << 1, t3 = triangles[i + 2] << 1;
                let x1 = vertices[t1], y1 = vertices[t1 + 1];
                let x2 = vertices[t2], y2 = vertices[t2 + 1];
                let x3 = vertices[t3], y3 = vertices[t3 + 1];
                let merged = false;
                if (fanBaseIndex == t1) {
                    let o = polygon.length - 4;
                    let winding1 = Triangulator.winding(polygon[o], polygon[o + 1], polygon[o + 2], polygon[o + 3], x3, y3);
                    let winding2 = Triangulator.winding(x3, y3, polygon[0], polygon[1], polygon[2], polygon[3]);
                    if (winding1 == lastWinding && winding2 == lastWinding) {
                        polygon.push(x3);
                        polygon.push(y3);
                        polygonIndices.push(t3);
                        merged = true;
                    }
                }
                if (!merged) {
                    if (polygon.length > 0) {
                        convexPolygons.push(polygon);
                        convexPolygonsIndices.push(polygonIndices);
                    }
                    else {
                        this.polygonPool.free(polygon);
                        this.polygonIndicesPool.free(polygonIndices);
                    }
                    polygon = this.polygonPool.obtain();
                    polygon.length = 0;
                    polygon.push(x1);
                    polygon.push(y1);
                    polygon.push(x2);
                    polygon.push(y2);
                    polygon.push(x3);
                    polygon.push(y3);
                    polygonIndices = this.polygonIndicesPool.obtain();
                    polygonIndices.length = 0;
                    polygonIndices.push(t1);
                    polygonIndices.push(t2);
                    polygonIndices.push(t3);
                    lastWinding = Triangulator.winding(x1, y1, x2, y2, x3, y3);
                    fanBaseIndex = t1;
                }
            }
            if (polygon.length > 0) {
                convexPolygons.push(polygon);
                convexPolygonsIndices.push(polygonIndices);
            }
            for (let i = 0, n = convexPolygons.length; i < n; i++) {
                polygonIndices = convexPolygonsIndices[i];
                if (polygonIndices.length == 0)
                    continue;
                let firstIndex = polygonIndices[0];
                let lastIndex = polygonIndices[polygonIndices.length - 1];
                polygon = convexPolygons[i];
                let o = polygon.length - 4;
                let prevPrevX = polygon[o], prevPrevY = polygon[o + 1];
                let prevX = polygon[o + 2], prevY = polygon[o + 3];
                let firstX = polygon[0], firstY = polygon[1];
                let secondX = polygon[2], secondY = polygon[3];
                let winding = Triangulator.winding(prevPrevX, prevPrevY, prevX, prevY, firstX, firstY);
                for (let ii = 0; ii < n; ii++) {
                    if (ii == i)
                        continue;
                    let otherIndices = convexPolygonsIndices[ii];
                    if (otherIndices.length != 3)
                        continue;
                    let otherFirstIndex = otherIndices[0];
                    let otherSecondIndex = otherIndices[1];
                    let otherLastIndex = otherIndices[2];
                    let otherPoly = convexPolygons[ii];
                    let x3 = otherPoly[otherPoly.length - 2], y3 = otherPoly[otherPoly.length - 1];
                    if (otherFirstIndex != firstIndex || otherSecondIndex != lastIndex)
                        continue;
                    let winding1 = Triangulator.winding(prevPrevX, prevPrevY, prevX, prevY, x3, y3);
                    let winding2 = Triangulator.winding(x3, y3, firstX, firstY, secondX, secondY);
                    if (winding1 == winding && winding2 == winding) {
                        otherPoly.length = 0;
                        otherIndices.length = 0;
                        polygon.push(x3);
                        polygon.push(y3);
                        polygonIndices.push(otherLastIndex);
                        prevPrevX = prevX;
                        prevPrevY = prevY;
                        prevX = x3;
                        prevY = y3;
                        ii = 0;
                    }
                }
            }
            for (let i = convexPolygons.length - 1; i >= 0; i--) {
                polygon = convexPolygons[i];
                if (polygon.length == 0) {
                    convexPolygons.splice(i, 1);
                    this.polygonPool.free(polygon);
                    polygonIndices = convexPolygonsIndices[i];
                    convexPolygonsIndices.splice(i, 1);
                    this.polygonIndicesPool.free(polygonIndices);
                }
            }
            return convexPolygons;
        }
        static isConcave(index, vertexCount, vertices, indices) {
            let previous = indices[(vertexCount + index - 1) % vertexCount] << 1;
            let current = indices[index] << 1;
            let next = indices[(index + 1) % vertexCount] << 1;
            return !this.positiveArea(vertices[previous], vertices[previous + 1], vertices[current], vertices[current + 1], vertices[next], vertices[next + 1]);
        }
        static positiveArea(p1x, p1y, p2x, p2y, p3x, p3y) {
            return p1x * (p3y - p2y) + p2x * (p1y - p3y) + p3x * (p2y - p1y) >= 0;
        }
        static winding(p1x, p1y, p2x, p2y, p3x, p3y) {
            let px = p2x - p1x, py = p2y - p1y;
            return p3x * py - p3y * px + px * p1y - p1x * py >= 0 ? 1 : -1;
        }
    }
    spine.Triangulator = Triangulator;
})(spine || (spine = {}));
// LayaBox_Modify
window.spine = spine;