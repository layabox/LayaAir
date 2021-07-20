/******************************************************************************
 * Spine Runtimes License Agreement
 * Last updated January 1, 2020. Replaces all prior versions.
 *
 * Copyright (c) 2013-2020, Esoteric Software LLC
 *
 * Integration of the Spine Runtimes into software or otherwise creating
 * derivative works of the Spine Runtimes is permitted under the terms and
 * conditions of Section 2 of the Spine Editor License Agreement:
 * http://esotericsoftware.com/spine-editor-license
 *
 * Otherwise, it is permitted to integrate the Spine Runtimes into software
 * or otherwise create derivative works of the Spine Runtimes (collectively,
 * "Products"), provided that each user of the Products must obtain their own
 * Spine Editor license and redistribution of the Products in any form must
 * include this license and copyright notice.
 *
 * THE SPINE RUNTIMES ARE PROVIDED BY ESOTERIC SOFTWARE LLC "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL ESOTERIC SOFTWARE LLC BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES,
 * BUSINESS INTERRUPTION, OR LOSS OF USE, DATA, OR PROFITS) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THE SPINE RUNTIMES, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
var spine;
(function (spine) {
    class Animation {
        constructor(name, timelines, duration) {
            if (name == null)
                throw new Error("name cannot be null.");
            if (timelines == null)
                throw new Error("timelines cannot be null.");
            this.name = name;
            this.timelines = timelines;
            this.duration = duration;
        }
        apply(skeleton, lastTime, time, loop, events, alpha, blend, direction) {
            if (skeleton == null)
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
        static binarySearch(values, target, step = 1) {
            let low = 0;
            let high = values.length / step - 2;
            if (high == 0)
                return step;
            let current = high >>> 1;
            while (true) {
                if (values[(current + 1) * step] <= target)
                    low = current + 1;
                else
                    high = current;
                if (low == high)
                    return (low + 1) * step;
                current = (low + high) >>> 1;
            }
        }
        static linearSearch(values, target, step) {
            for (let i = 0, last = values.length - step; i <= last; i += step)
                if (values[i] > target)
                    return i;
            return -1;
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
        MixDirection[MixDirection["in"] = 0] = "in";
        MixDirection[MixDirection["out"] = 1] = "out";
    })(MixDirection = spine.MixDirection || (spine.MixDirection = {}));
    let TimelineType;
    (function (TimelineType) {
        TimelineType[TimelineType["rotate"] = 0] = "rotate";
        TimelineType[TimelineType["translate"] = 1] = "translate";
        TimelineType[TimelineType["scale"] = 2] = "scale";
        TimelineType[TimelineType["shear"] = 3] = "shear";
        TimelineType[TimelineType["attachment"] = 4] = "attachment";
        TimelineType[TimelineType["color"] = 5] = "color";
        TimelineType[TimelineType["deform"] = 6] = "deform";
        TimelineType[TimelineType["event"] = 7] = "event";
        TimelineType[TimelineType["drawOrder"] = 8] = "drawOrder";
        TimelineType[TimelineType["ikConstraint"] = 9] = "ikConstraint";
        TimelineType[TimelineType["transformConstraint"] = 10] = "transformConstraint";
        TimelineType[TimelineType["pathConstraintPosition"] = 11] = "pathConstraintPosition";
        TimelineType[TimelineType["pathConstraintSpacing"] = 12] = "pathConstraintSpacing";
        TimelineType[TimelineType["pathConstraintMix"] = 13] = "pathConstraintMix";
        TimelineType[TimelineType["twoColor"] = 14] = "twoColor";
    })(TimelineType = spine.TimelineType || (spine.TimelineType = {}));
    class CurveTimeline {
        constructor(frameCount) {
            if (frameCount <= 0)
                throw new Error("frameCount must be > 0: " + frameCount);
            this.curves = spine.Utils.newFloatArray((frameCount - 1) * CurveTimeline.BEZIER_SIZE);
        }
        getFrameCount() {
            return this.curves.length / CurveTimeline.BEZIER_SIZE + 1;
        }
        setLinear(frameIndex) {
            this.curves[frameIndex * CurveTimeline.BEZIER_SIZE] = CurveTimeline.LINEAR;
        }
        setStepped(frameIndex) {
            this.curves[frameIndex * CurveTimeline.BEZIER_SIZE] = CurveTimeline.STEPPED;
        }
        getCurveType(frameIndex) {
            let index = frameIndex * CurveTimeline.BEZIER_SIZE;
            if (index == this.curves.length)
                return CurveTimeline.LINEAR;
            let type = this.curves[index];
            if (type == CurveTimeline.LINEAR)
                return CurveTimeline.LINEAR;
            if (type == CurveTimeline.STEPPED)
                return CurveTimeline.STEPPED;
            return CurveTimeline.BEZIER;
        }
        setCurve(frameIndex, cx1, cy1, cx2, cy2) {
            let tmpx = (-cx1 * 2 + cx2) * 0.03, tmpy = (-cy1 * 2 + cy2) * 0.03;
            let dddfx = ((cx1 - cx2) * 3 + 1) * 0.006, dddfy = ((cy1 - cy2) * 3 + 1) * 0.006;
            let ddfx = tmpx * 2 + dddfx, ddfy = tmpy * 2 + dddfy;
            let dfx = cx1 * 0.3 + tmpx + dddfx * 0.16666667, dfy = cy1 * 0.3 + tmpy + dddfy * 0.16666667;
            let i = frameIndex * CurveTimeline.BEZIER_SIZE;
            let curves = this.curves;
            curves[i++] = CurveTimeline.BEZIER;
            let x = dfx, y = dfy;
            for (let n = i + CurveTimeline.BEZIER_SIZE - 1; i < n; i += 2) {
                curves[i] = x;
                curves[i + 1] = y;
                dfx += ddfx;
                dfy += ddfy;
                ddfx += dddfx;
                ddfy += dddfy;
                x += dfx;
                y += dfy;
            }
        }
        getCurvePercent(frameIndex, percent) {
            percent = spine.MathUtils.clamp(percent, 0, 1);
            let curves = this.curves;
            let i = frameIndex * CurveTimeline.BEZIER_SIZE;
            let type = curves[i];
            if (type == CurveTimeline.LINEAR)
                return percent;
            if (type == CurveTimeline.STEPPED)
                return 0;
            i++;
            let x = 0;
            for (let start = i, n = i + CurveTimeline.BEZIER_SIZE - 1; i < n; i += 2) {
                x = curves[i];
                if (x >= percent) {
                    let prevX, prevY;
                    if (i == start) {
                        prevX = 0;
                        prevY = 0;
                    }
                    else {
                        prevX = curves[i - 2];
                        prevY = curves[i - 1];
                    }
                    return prevY + (curves[i + 1] - prevY) * (percent - prevX) / (x - prevX);
                }
            }
            let y = curves[i - 1];
            return y + (1 - y) * (percent - x) / (1 - x);
        }
    }
    CurveTimeline.LINEAR = 0;
    CurveTimeline.STEPPED = 1;
    CurveTimeline.BEZIER = 2;
    CurveTimeline.BEZIER_SIZE = 10 * 2 - 1;
    spine.CurveTimeline = CurveTimeline;
    class RotateTimeline extends CurveTimeline {
        constructor(frameCount) {
            super(frameCount);
            this.frames = spine.Utils.newFloatArray(frameCount << 1);
        }
        getPropertyId() {
            return (TimelineType.rotate << 24) + this.boneIndex;
        }
        setFrame(frameIndex, time, degrees) {
            frameIndex <<= 1;
            this.frames[frameIndex] = time;
            this.frames[frameIndex + RotateTimeline.ROTATION] = degrees;
        }
        apply(skeleton, lastTime, time, events, alpha, blend, direction) {
            let frames = this.frames;
            let bone = skeleton.bones[this.boneIndex];
            if (time < frames[0]) {
                switch (blend) {
                    case MixBlend.setup:
                        bone.rotation = bone.data.rotation;
                        return;
                    case MixBlend.first:
                        let r = bone.data.rotation - bone.rotation;
                        bone.rotation += (r - (16384 - ((16384.499999999996 - r / 360) | 0)) * 360) * alpha;
                }
                return;
            }
            if (time >= frames[frames.length - RotateTimeline.ENTRIES]) {
                let r = frames[frames.length + RotateTimeline.PREV_ROTATION];
                switch (blend) {
                    case MixBlend.setup:
                        bone.rotation = bone.data.rotation + r * alpha;
                        break;
                    case MixBlend.first:
                    case MixBlend.replace:
                        r += bone.data.rotation - bone.rotation;
                        r -= (16384 - ((16384.499999999996 - r / 360) | 0)) * 360;
                    case MixBlend.add:
                        bone.rotation += r * alpha;
                }
                return;
            }
            let frame = Animation.binarySearch(frames, time, RotateTimeline.ENTRIES);
            let prevRotation = frames[frame + RotateTimeline.PREV_ROTATION];
            let frameTime = frames[frame];
            let percent = this.getCurvePercent((frame >> 1) - 1, 1 - (time - frameTime) / (frames[frame + RotateTimeline.PREV_TIME] - frameTime));
            let r = frames[frame + RotateTimeline.ROTATION] - prevRotation;
            r = prevRotation + (r - (16384 - ((16384.499999999996 - r / 360) | 0)) * 360) * percent;
            switch (blend) {
                case MixBlend.setup:
                    bone.rotation = bone.data.rotation + (r - (16384 - ((16384.499999999996 - r / 360) | 0)) * 360) * alpha;
                    break;
                case MixBlend.first:
                case MixBlend.replace:
                    r += bone.data.rotation - bone.rotation;
                case MixBlend.add:
                    bone.rotation += (r - (16384 - ((16384.499999999996 - r / 360) | 0)) * 360) * alpha;
            }
        }
    }
    RotateTimeline.ENTRIES = 2;
    RotateTimeline.PREV_TIME = -2;
    RotateTimeline.PREV_ROTATION = -1;
    RotateTimeline.ROTATION = 1;
    spine.RotateTimeline = RotateTimeline;
    class TranslateTimeline extends CurveTimeline {
        constructor(frameCount) {
            super(frameCount);
            this.frames = spine.Utils.newFloatArray(frameCount * TranslateTimeline.ENTRIES);
        }
        getPropertyId() {
            return (TimelineType.translate << 24) + this.boneIndex;
        }
        setFrame(frameIndex, time, x, y) {
            frameIndex *= TranslateTimeline.ENTRIES;
            this.frames[frameIndex] = time;
            this.frames[frameIndex + TranslateTimeline.X] = x;
            this.frames[frameIndex + TranslateTimeline.Y] = y;
        }
        apply(skeleton, lastTime, time, events, alpha, blend, direction) {
            let frames = this.frames;
            let bone = skeleton.bones[this.boneIndex];
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
            if (time >= frames[frames.length - TranslateTimeline.ENTRIES]) {
                x = frames[frames.length + TranslateTimeline.PREV_X];
                y = frames[frames.length + TranslateTimeline.PREV_Y];
            }
            else {
                let frame = Animation.binarySearch(frames, time, TranslateTimeline.ENTRIES);
                x = frames[frame + TranslateTimeline.PREV_X];
                y = frames[frame + TranslateTimeline.PREV_Y];
                let frameTime = frames[frame];
                let percent = this.getCurvePercent(frame / TranslateTimeline.ENTRIES - 1, 1 - (time - frameTime) / (frames[frame + TranslateTimeline.PREV_TIME] - frameTime));
                x += (frames[frame + TranslateTimeline.X] - x) * percent;
                y += (frames[frame + TranslateTimeline.Y] - y) * percent;
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
    TranslateTimeline.ENTRIES = 3;
    TranslateTimeline.PREV_TIME = -3;
    TranslateTimeline.PREV_X = -2;
    TranslateTimeline.PREV_Y = -1;
    TranslateTimeline.X = 1;
    TranslateTimeline.Y = 2;
    spine.TranslateTimeline = TranslateTimeline;
    class ScaleTimeline extends TranslateTimeline {
        constructor(frameCount) {
            super(frameCount);
        }
        getPropertyId() {
            return (TimelineType.scale << 24) + this.boneIndex;
        }
        apply(skeleton, lastTime, time, events, alpha, blend, direction) {
            let frames = this.frames;
            let bone = skeleton.bones[this.boneIndex];
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
            let x = 0, y = 0;
            if (time >= frames[frames.length - ScaleTimeline.ENTRIES]) {
                x = frames[frames.length + ScaleTimeline.PREV_X] * bone.data.scaleX;
                y = frames[frames.length + ScaleTimeline.PREV_Y] * bone.data.scaleY;
            }
            else {
                let frame = Animation.binarySearch(frames, time, ScaleTimeline.ENTRIES);
                x = frames[frame + ScaleTimeline.PREV_X];
                y = frames[frame + ScaleTimeline.PREV_Y];
                let frameTime = frames[frame];
                let percent = this.getCurvePercent(frame / ScaleTimeline.ENTRIES - 1, 1 - (time - frameTime) / (frames[frame + ScaleTimeline.PREV_TIME] - frameTime));
                x = (x + (frames[frame + ScaleTimeline.X] - x) * percent) * bone.data.scaleX;
                y = (y + (frames[frame + ScaleTimeline.Y] - y) * percent) * bone.data.scaleY;
            }
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
                if (direction == MixDirection.out) {
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
                            bx = bone.scaleX;
                            by = bone.scaleY;
                            bone.scaleX = bx + (Math.abs(x) * spine.MathUtils.signum(bx) - bone.data.scaleX) * alpha;
                            bone.scaleY = by + (Math.abs(y) * spine.MathUtils.signum(by) - bone.data.scaleY) * alpha;
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
                            bx = spine.MathUtils.signum(x);
                            by = spine.MathUtils.signum(y);
                            bone.scaleX = Math.abs(bone.scaleX) * bx + (x - Math.abs(bone.data.scaleX) * bx) * alpha;
                            bone.scaleY = Math.abs(bone.scaleY) * by + (y - Math.abs(bone.data.scaleY) * by) * alpha;
                    }
                }
            }
        }
    }
    spine.ScaleTimeline = ScaleTimeline;
    class ShearTimeline extends TranslateTimeline {
        constructor(frameCount) {
            super(frameCount);
        }
        getPropertyId() {
            return (TimelineType.shear << 24) + this.boneIndex;
        }
        apply(skeleton, lastTime, time, events, alpha, blend, direction) {
            let frames = this.frames;
            let bone = skeleton.bones[this.boneIndex];
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
            if (time >= frames[frames.length - ShearTimeline.ENTRIES]) {
                x = frames[frames.length + ShearTimeline.PREV_X];
                y = frames[frames.length + ShearTimeline.PREV_Y];
            }
            else {
                let frame = Animation.binarySearch(frames, time, ShearTimeline.ENTRIES);
                x = frames[frame + ShearTimeline.PREV_X];
                y = frames[frame + ShearTimeline.PREV_Y];
                let frameTime = frames[frame];
                let percent = this.getCurvePercent(frame / ShearTimeline.ENTRIES - 1, 1 - (time - frameTime) / (frames[frame + ShearTimeline.PREV_TIME] - frameTime));
                x = x + (frames[frame + ShearTimeline.X] - x) * percent;
                y = y + (frames[frame + ShearTimeline.Y] - y) * percent;
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
    class ColorTimeline extends CurveTimeline {
        constructor(frameCount) {
            super(frameCount);
            this.frames = spine.Utils.newFloatArray(frameCount * ColorTimeline.ENTRIES);
        }
        getPropertyId() {
            return (TimelineType.color << 24) + this.slotIndex;
        }
        setFrame(frameIndex, time, r, g, b, a) {
            frameIndex *= ColorTimeline.ENTRIES;
            this.frames[frameIndex] = time;
            this.frames[frameIndex + ColorTimeline.R] = r;
            this.frames[frameIndex + ColorTimeline.G] = g;
            this.frames[frameIndex + ColorTimeline.B] = b;
            this.frames[frameIndex + ColorTimeline.A] = a;
        }
        apply(skeleton, lastTime, time, events, alpha, blend, direction) {
            let slot = skeleton.slots[this.slotIndex];
            let frames = this.frames;
            if (time < frames[0]) {
                switch (blend) {
                    case MixBlend.setup:
                        slot.color.setFromColor(slot.data.color);
                        return;
                    case MixBlend.first:
                        let color = slot.color, setup = slot.data.color;
                        color.add((setup.r - color.r) * alpha, (setup.g - color.g) * alpha, (setup.b - color.b) * alpha, (setup.a - color.a) * alpha);
                }
                return;
            }
            let r = 0, g = 0, b = 0, a = 0;
            if (time >= frames[frames.length - ColorTimeline.ENTRIES]) {
                let i = frames.length;
                r = frames[i + ColorTimeline.PREV_R];
                g = frames[i + ColorTimeline.PREV_G];
                b = frames[i + ColorTimeline.PREV_B];
                a = frames[i + ColorTimeline.PREV_A];
            }
            else {
                let frame = Animation.binarySearch(frames, time, ColorTimeline.ENTRIES);
                r = frames[frame + ColorTimeline.PREV_R];
                g = frames[frame + ColorTimeline.PREV_G];
                b = frames[frame + ColorTimeline.PREV_B];
                a = frames[frame + ColorTimeline.PREV_A];
                let frameTime = frames[frame];
                let percent = this.getCurvePercent(frame / ColorTimeline.ENTRIES - 1, 1 - (time - frameTime) / (frames[frame + ColorTimeline.PREV_TIME] - frameTime));
                r += (frames[frame + ColorTimeline.R] - r) * percent;
                g += (frames[frame + ColorTimeline.G] - g) * percent;
                b += (frames[frame + ColorTimeline.B] - b) * percent;
                a += (frames[frame + ColorTimeline.A] - a) * percent;
            }
            if (alpha == 1)
                slot.color.set(r, g, b, a);
            else {
                let color = slot.color;
                if (blend == MixBlend.setup)
                    color.setFromColor(slot.data.color);
                color.add((r - color.r) * alpha, (g - color.g) * alpha, (b - color.b) * alpha, (a - color.a) * alpha);
            }
        }
    }
    ColorTimeline.ENTRIES = 5;
    ColorTimeline.PREV_TIME = -5;
    ColorTimeline.PREV_R = -4;
    ColorTimeline.PREV_G = -3;
    ColorTimeline.PREV_B = -2;
    ColorTimeline.PREV_A = -1;
    ColorTimeline.R = 1;
    ColorTimeline.G = 2;
    ColorTimeline.B = 3;
    ColorTimeline.A = 4;
    spine.ColorTimeline = ColorTimeline;
    class TwoColorTimeline extends CurveTimeline {
        constructor(frameCount) {
            super(frameCount);
            this.frames = spine.Utils.newFloatArray(frameCount * TwoColorTimeline.ENTRIES);
        }
        getPropertyId() {
            return (TimelineType.twoColor << 24) + this.slotIndex;
        }
        setFrame(frameIndex, time, r, g, b, a, r2, g2, b2) {
            frameIndex *= TwoColorTimeline.ENTRIES;
            this.frames[frameIndex] = time;
            this.frames[frameIndex + TwoColorTimeline.R] = r;
            this.frames[frameIndex + TwoColorTimeline.G] = g;
            this.frames[frameIndex + TwoColorTimeline.B] = b;
            this.frames[frameIndex + TwoColorTimeline.A] = a;
            this.frames[frameIndex + TwoColorTimeline.R2] = r2;
            this.frames[frameIndex + TwoColorTimeline.G2] = g2;
            this.frames[frameIndex + TwoColorTimeline.B2] = b2;
        }
        apply(skeleton, lastTime, time, events, alpha, blend, direction) {
            let slot = skeleton.slots[this.slotIndex];
            let frames = this.frames;
            if (time < frames[0]) {
                switch (blend) {
                    case MixBlend.setup:
                        slot.color.setFromColor(slot.data.color);
                        slot.darkColor.setFromColor(slot.data.darkColor);
                        return;
                    case MixBlend.first:
                        let light = slot.color, dark = slot.darkColor, setupLight = slot.data.color, setupDark = slot.data.darkColor;
                        light.add((setupLight.r - light.r) * alpha, (setupLight.g - light.g) * alpha, (setupLight.b - light.b) * alpha, (setupLight.a - light.a) * alpha);
                        dark.add((setupDark.r - dark.r) * alpha, (setupDark.g - dark.g) * alpha, (setupDark.b - dark.b) * alpha, 0);
                }
                return;
            }
            let r = 0, g = 0, b = 0, a = 0, r2 = 0, g2 = 0, b2 = 0;
            if (time >= frames[frames.length - TwoColorTimeline.ENTRIES]) {
                let i = frames.length;
                r = frames[i + TwoColorTimeline.PREV_R];
                g = frames[i + TwoColorTimeline.PREV_G];
                b = frames[i + TwoColorTimeline.PREV_B];
                a = frames[i + TwoColorTimeline.PREV_A];
                r2 = frames[i + TwoColorTimeline.PREV_R2];
                g2 = frames[i + TwoColorTimeline.PREV_G2];
                b2 = frames[i + TwoColorTimeline.PREV_B2];
            }
            else {
                let frame = Animation.binarySearch(frames, time, TwoColorTimeline.ENTRIES);
                r = frames[frame + TwoColorTimeline.PREV_R];
                g = frames[frame + TwoColorTimeline.PREV_G];
                b = frames[frame + TwoColorTimeline.PREV_B];
                a = frames[frame + TwoColorTimeline.PREV_A];
                r2 = frames[frame + TwoColorTimeline.PREV_R2];
                g2 = frames[frame + TwoColorTimeline.PREV_G2];
                b2 = frames[frame + TwoColorTimeline.PREV_B2];
                let frameTime = frames[frame];
                let percent = this.getCurvePercent(frame / TwoColorTimeline.ENTRIES - 1, 1 - (time - frameTime) / (frames[frame + TwoColorTimeline.PREV_TIME] - frameTime));
                r += (frames[frame + TwoColorTimeline.R] - r) * percent;
                g += (frames[frame + TwoColorTimeline.G] - g) * percent;
                b += (frames[frame + TwoColorTimeline.B] - b) * percent;
                a += (frames[frame + TwoColorTimeline.A] - a) * percent;
                r2 += (frames[frame + TwoColorTimeline.R2] - r2) * percent;
                g2 += (frames[frame + TwoColorTimeline.G2] - g2) * percent;
                b2 += (frames[frame + TwoColorTimeline.B2] - b2) * percent;
            }
            if (alpha == 1) {
                slot.color.set(r, g, b, a);
                slot.darkColor.set(r2, g2, b2, 1);
            }
            else {
                let light = slot.color, dark = slot.darkColor;
                if (blend == MixBlend.setup) {
                    light.setFromColor(slot.data.color);
                    dark.setFromColor(slot.data.darkColor);
                }
                light.add((r - light.r) * alpha, (g - light.g) * alpha, (b - light.b) * alpha, (a - light.a) * alpha);
                dark.add((r2 - dark.r) * alpha, (g2 - dark.g) * alpha, (b2 - dark.b) * alpha, 0);
            }
        }
    }
    TwoColorTimeline.ENTRIES = 8;
    TwoColorTimeline.PREV_TIME = -8;
    TwoColorTimeline.PREV_R = -7;
    TwoColorTimeline.PREV_G = -6;
    TwoColorTimeline.PREV_B = -5;
    TwoColorTimeline.PREV_A = -4;
    TwoColorTimeline.PREV_R2 = -3;
    TwoColorTimeline.PREV_G2 = -2;
    TwoColorTimeline.PREV_B2 = -1;
    TwoColorTimeline.R = 1;
    TwoColorTimeline.G = 2;
    TwoColorTimeline.B = 3;
    TwoColorTimeline.A = 4;
    TwoColorTimeline.R2 = 5;
    TwoColorTimeline.G2 = 6;
    TwoColorTimeline.B2 = 7;
    spine.TwoColorTimeline = TwoColorTimeline;
    class AttachmentTimeline {
        constructor(frameCount) {
            this.frames = spine.Utils.newFloatArray(frameCount);
            this.attachmentNames = new Array(frameCount);
        }
        getPropertyId() {
            return (TimelineType.attachment << 24) + this.slotIndex;
        }
        getFrameCount() {
            return this.frames.length;
        }
        setFrame(frameIndex, time, attachmentName) {
            this.frames[frameIndex] = time;
            this.attachmentNames[frameIndex] = attachmentName;
        }
        apply(skeleton, lastTime, time, events, alpha, blend, direction) {
            let slot = skeleton.slots[this.slotIndex];
            if (direction == MixDirection.out && blend == MixBlend.setup) {
                let attachmentName = slot.data.attachmentName;
                slot.setAttachment(attachmentName == null ? null : skeleton.getAttachment(this.slotIndex, attachmentName));
                return;
            }
            let frames = this.frames;
            if (time < frames[0]) {
                if (blend == MixBlend.setup || blend == MixBlend.first) {
                    let attachmentName = slot.data.attachmentName;
                    slot.setAttachment(attachmentName == null ? null : skeleton.getAttachment(this.slotIndex, attachmentName));
                }
                return;
            }
            let frameIndex = 0;
            if (time >= frames[frames.length - 1])
                frameIndex = frames.length - 1;
            else
                frameIndex = Animation.binarySearch(frames, time, 1) - 1;
            let attachmentName = this.attachmentNames[frameIndex];
            skeleton.slots[this.slotIndex]
                .setAttachment(attachmentName == null ? null : skeleton.getAttachment(this.slotIndex, attachmentName));
        }
    }
    spine.AttachmentTimeline = AttachmentTimeline;
    let zeros = null;
    class DeformTimeline extends CurveTimeline {
        constructor(frameCount) {
            super(frameCount);
            this.frames = spine.Utils.newFloatArray(frameCount);
            this.frameVertices = new Array(frameCount);
            if (zeros == null)
                zeros = spine.Utils.newFloatArray(64);
        }
        getPropertyId() {
            return (TimelineType.deform << 27) + +this.attachment.id + this.slotIndex;
        }
        setFrame(frameIndex, time, vertices) {
            this.frames[frameIndex] = time;
            this.frameVertices[frameIndex] = vertices;
        }
        apply(skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
            let slot = skeleton.slots[this.slotIndex];
            let slotAttachment = slot.getAttachment();
            if (!(slotAttachment instanceof spine.VertexAttachment) || !slotAttachment.applyDeform(this.attachment))
                return;
            let verticesArray = slot.attachmentVertices;
            if (verticesArray.length == 0)
                blend = MixBlend.setup;
            let frameVertices = this.frameVertices;
            let vertexCount = frameVertices[0].length;
            let frames = this.frames;
            if (time < frames[0]) {
                let vertexAttachment = slotAttachment;
                switch (blend) {
                    case MixBlend.setup:
                        verticesArray.length = 0;
                        return;
                    case MixBlend.first:
                        if (alpha == 1) {
                            verticesArray.length = 0;
                            break;
                        }
                        let vertices = spine.Utils.setArraySize(verticesArray, vertexCount);
                        if (vertexAttachment.bones == null) {
                            let setupVertices = vertexAttachment.vertices;
                            for (var i = 0; i < vertexCount; i++)
                                vertices[i] += (setupVertices[i] - vertices[i]) * alpha;
                        }
                        else {
                            alpha = 1 - alpha;
                            for (var i = 0; i < vertexCount; i++)
                                vertices[i] *= alpha;
                        }
                }
                return;
            }
            let vertices = spine.Utils.setArraySize(verticesArray, vertexCount);
            if (time >= frames[frames.length - 1]) {
                let lastVertices = frameVertices[frames.length - 1];
                if (alpha == 1) {
                    if (blend == MixBlend.add) {
                        let vertexAttachment = slotAttachment;
                        if (vertexAttachment.bones == null) {
                            let setupVertices = vertexAttachment.vertices;
                            for (let i = 0; i < vertexCount; i++) {
                                vertices[i] += lastVertices[i] - setupVertices[i];
                            }
                        }
                        else {
                            for (let i = 0; i < vertexCount; i++)
                                vertices[i] += lastVertices[i];
                        }
                    }
                    else {
                        spine.Utils.arrayCopy(lastVertices, 0, vertices, 0, vertexCount);
                    }
                }
                else {
                    switch (blend) {
                        case MixBlend.setup: {
                            let vertexAttachment = slotAttachment;
                            if (vertexAttachment.bones == null) {
                                let setupVertices = vertexAttachment.vertices;
                                for (let i = 0; i < vertexCount; i++) {
                                    let setup = setupVertices[i];
                                    vertices[i] = setup + (lastVertices[i] - setup) * alpha;
                                }
                            }
                            else {
                                for (let i = 0; i < vertexCount; i++)
                                    vertices[i] = lastVertices[i] * alpha;
                            }
                            break;
                        }
                        case MixBlend.first:
                        case MixBlend.replace:
                            for (let i = 0; i < vertexCount; i++)
                                vertices[i] += (lastVertices[i] - vertices[i]) * alpha;
                        case MixBlend.add:
                            let vertexAttachment = slotAttachment;
                            if (vertexAttachment.bones == null) {
                                let setupVertices = vertexAttachment.vertices;
                                for (let i = 0; i < vertexCount; i++) {
                                    vertices[i] += (lastVertices[i] - setupVertices[i]) * alpha;
                                }
                            }
                            else {
                                for (let i = 0; i < vertexCount; i++)
                                    vertices[i] += lastVertices[i] * alpha;
                            }
                    }
                }
                return;
            }
            let frame = Animation.binarySearch(frames, time);
            let prevVertices = frameVertices[frame - 1];
            let nextVertices = frameVertices[frame];
            let frameTime = frames[frame];
            let percent = this.getCurvePercent(frame - 1, 1 - (time - frameTime) / (frames[frame - 1] - frameTime));
            if (alpha == 1) {
                if (blend == MixBlend.add) {
                    let vertexAttachment = slotAttachment;
                    if (vertexAttachment.bones == null) {
                        let setupVertices = vertexAttachment.vertices;
                        for (let i = 0; i < vertexCount; i++) {
                            let prev = prevVertices[i];
                            vertices[i] += prev + (nextVertices[i] - prev) * percent - setupVertices[i];
                        }
                    }
                    else {
                        for (let i = 0; i < vertexCount; i++) {
                            let prev = prevVertices[i];
                            vertices[i] += prev + (nextVertices[i] - prev) * percent;
                        }
                    }
                }
                else {
                    for (let i = 0; i < vertexCount; i++) {
                        let prev = prevVertices[i];
                        vertices[i] = prev + (nextVertices[i] - prev) * percent;
                    }
                }
            }
            else {
                switch (blend) {
                    case MixBlend.setup: {
                        let vertexAttachment = slotAttachment;
                        if (vertexAttachment.bones == null) {
                            let setupVertices = vertexAttachment.vertices;
                            for (let i = 0; i < vertexCount; i++) {
                                let prev = prevVertices[i], setup = setupVertices[i];
                                vertices[i] = setup + (prev + (nextVertices[i] - prev) * percent - setup) * alpha;
                            }
                        }
                        else {
                            for (let i = 0; i < vertexCount; i++) {
                                let prev = prevVertices[i];
                                vertices[i] = (prev + (nextVertices[i] - prev) * percent) * alpha;
                            }
                        }
                        break;
                    }
                    case MixBlend.first:
                    case MixBlend.replace:
                        for (let i = 0; i < vertexCount; i++) {
                            let prev = prevVertices[i];
                            vertices[i] += (prev + (nextVertices[i] - prev) * percent - vertices[i]) * alpha;
                        }
                        break;
                    case MixBlend.add:
                        let vertexAttachment = slotAttachment;
                        if (vertexAttachment.bones == null) {
                            let setupVertices = vertexAttachment.vertices;
                            for (let i = 0; i < vertexCount; i++) {
                                let prev = prevVertices[i];
                                vertices[i] += (prev + (nextVertices[i] - prev) * percent - setupVertices[i]) * alpha;
                            }
                        }
                        else {
                            for (let i = 0; i < vertexCount; i++) {
                                let prev = prevVertices[i];
                                vertices[i] += (prev + (nextVertices[i] - prev) * percent) * alpha;
                            }
                        }
                }
            }
        }
    }
    spine.DeformTimeline = DeformTimeline;
    class EventTimeline {
        constructor(frameCount) {
            this.frames = spine.Utils.newFloatArray(frameCount);
            this.events = new Array(frameCount);
        }
        getPropertyId() {
            return TimelineType.event << 24;
        }
        getFrameCount() {
            return this.frames.length;
        }
        setFrame(frameIndex, event) {
            this.frames[frameIndex] = event.time;
            this.events[frameIndex] = event;
        }
        apply(skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
            if (firedEvents == null)
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
            let frame = 0;
            if (lastTime < frames[0])
                frame = 0;
            else {
                frame = Animation.binarySearch(frames, lastTime);
                let frameTime = frames[frame];
                while (frame > 0) {
                    if (frames[frame - 1] != frameTime)
                        break;
                    frame--;
                }
            }
            for (; frame < frameCount && time >= frames[frame]; frame++)
                firedEvents.push(this.events[frame]);
        }
    }
    spine.EventTimeline = EventTimeline;
    class DrawOrderTimeline {
        constructor(frameCount) {
            this.frames = spine.Utils.newFloatArray(frameCount);
            this.drawOrders = new Array(frameCount);
        }
        getPropertyId() {
            return TimelineType.drawOrder << 24;
        }
        getFrameCount() {
            return this.frames.length;
        }
        setFrame(frameIndex, time, drawOrder) {
            this.frames[frameIndex] = time;
            this.drawOrders[frameIndex] = drawOrder;
        }
        apply(skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
            let drawOrder = skeleton.drawOrder;
            let slots = skeleton.slots;
            if (direction == MixDirection.out && blend == MixBlend.setup) {
                spine.Utils.arrayCopy(skeleton.slots, 0, skeleton.drawOrder, 0, skeleton.slots.length);
                return;
            }
            let frames = this.frames;
            if (time < frames[0]) {
                if (blend == MixBlend.setup || blend == MixBlend.first)
                    spine.Utils.arrayCopy(skeleton.slots, 0, skeleton.drawOrder, 0, skeleton.slots.length);
                return;
            }
            let frame = 0;
            if (time >= frames[frames.length - 1])
                frame = frames.length - 1;
            else
                frame = Animation.binarySearch(frames, time) - 1;
            let drawOrderToSetupIndex = this.drawOrders[frame];
            if (drawOrderToSetupIndex == null)
                spine.Utils.arrayCopy(slots, 0, drawOrder, 0, slots.length);
            else {
                for (let i = 0, n = drawOrderToSetupIndex.length; i < n; i++)
                    drawOrder[i] = slots[drawOrderToSetupIndex[i]];
            }
        }
    }
    spine.DrawOrderTimeline = DrawOrderTimeline;
    class IkConstraintTimeline extends CurveTimeline {
        constructor(frameCount) {
            super(frameCount);
            this.frames = spine.Utils.newFloatArray(frameCount * IkConstraintTimeline.ENTRIES);
        }
        getPropertyId() {
            return (TimelineType.ikConstraint << 24) + this.ikConstraintIndex;
        }
        setFrame(frameIndex, time, mix, bendDirection, compress, stretch) {
            frameIndex *= IkConstraintTimeline.ENTRIES;
            this.frames[frameIndex] = time;
            this.frames[frameIndex + IkConstraintTimeline.MIX] = mix;
            this.frames[frameIndex + IkConstraintTimeline.BEND_DIRECTION] = bendDirection;
            this.frames[frameIndex + IkConstraintTimeline.COMPRESS] = compress ? 1 : 0;
            this.frames[frameIndex + IkConstraintTimeline.STRETCH] = stretch ? 1 : 0;
        }
        apply(skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
            let frames = this.frames;
            let constraint = skeleton.ikConstraints[this.ikConstraintIndex];
            if (time < frames[0]) {
                switch (blend) {
                    case MixBlend.setup:
                        constraint.mix = constraint.data.mix;
                        constraint.bendDirection = constraint.data.bendDirection;
                        constraint.compress = constraint.data.compress;
                        constraint.stretch = constraint.data.stretch;
                        return;
                    case MixBlend.first:
                        constraint.mix += (constraint.data.mix - constraint.mix) * alpha;
                        constraint.bendDirection = constraint.data.bendDirection;
                        constraint.compress = constraint.data.compress;
                        constraint.stretch = constraint.data.stretch;
                }
                return;
            }
            if (time >= frames[frames.length - IkConstraintTimeline.ENTRIES]) {
                if (blend == MixBlend.setup) {
                    constraint.mix = constraint.data.mix + (frames[frames.length + IkConstraintTimeline.PREV_MIX] - constraint.data.mix) * alpha;
                    if (direction == MixDirection.out) {
                        constraint.bendDirection = constraint.data.bendDirection;
                        constraint.compress = constraint.data.compress;
                        constraint.stretch = constraint.data.stretch;
                    }
                    else {
                        constraint.bendDirection = frames[frames.length + IkConstraintTimeline.PREV_BEND_DIRECTION];
                        constraint.compress = frames[frames.length + IkConstraintTimeline.PREV_COMPRESS] != 0;
                        constraint.stretch = frames[frames.length + IkConstraintTimeline.PREV_STRETCH] != 0;
                    }
                }
                else {
                    constraint.mix += (frames[frames.length + IkConstraintTimeline.PREV_MIX] - constraint.mix) * alpha;
                    if (direction == MixDirection.in) {
                        constraint.bendDirection = frames[frames.length + IkConstraintTimeline.PREV_BEND_DIRECTION];
                        constraint.compress = frames[frames.length + IkConstraintTimeline.PREV_COMPRESS] != 0;
                        constraint.stretch = frames[frames.length + IkConstraintTimeline.PREV_STRETCH] != 0;
                    }
                }
                return;
            }
            let frame = Animation.binarySearch(frames, time, IkConstraintTimeline.ENTRIES);
            let mix = frames[frame + IkConstraintTimeline.PREV_MIX];
            let frameTime = frames[frame];
            let percent = this.getCurvePercent(frame / IkConstraintTimeline.ENTRIES - 1, 1 - (time - frameTime) / (frames[frame + IkConstraintTimeline.PREV_TIME] - frameTime));
            if (blend == MixBlend.setup) {
                constraint.mix = constraint.data.mix + (mix + (frames[frame + IkConstraintTimeline.MIX] - mix) * percent - constraint.data.mix) * alpha;
                if (direction == MixDirection.out) {
                    constraint.bendDirection = constraint.data.bendDirection;
                    constraint.compress = constraint.data.compress;
                    constraint.stretch = constraint.data.stretch;
                }
                else {
                    constraint.bendDirection = frames[frame + IkConstraintTimeline.PREV_BEND_DIRECTION];
                    constraint.compress = frames[frame + IkConstraintTimeline.PREV_COMPRESS] != 0;
                    constraint.stretch = frames[frame + IkConstraintTimeline.PREV_STRETCH] != 0;
                }
            }
            else {
                constraint.mix += (mix + (frames[frame + IkConstraintTimeline.MIX] - mix) * percent - constraint.mix) * alpha;
                if (direction == MixDirection.in) {
                    constraint.bendDirection = frames[frame + IkConstraintTimeline.PREV_BEND_DIRECTION];
                    constraint.compress = frames[frame + IkConstraintTimeline.PREV_COMPRESS] != 0;
                    constraint.stretch = frames[frame + IkConstraintTimeline.PREV_STRETCH] != 0;
                }
            }
        }
    }
    IkConstraintTimeline.ENTRIES = 5;
    IkConstraintTimeline.PREV_TIME = -5;
    IkConstraintTimeline.PREV_MIX = -4;
    IkConstraintTimeline.PREV_BEND_DIRECTION = -3;
    IkConstraintTimeline.PREV_COMPRESS = -2;
    IkConstraintTimeline.PREV_STRETCH = -1;
    IkConstraintTimeline.MIX = 1;
    IkConstraintTimeline.BEND_DIRECTION = 2;
    IkConstraintTimeline.COMPRESS = 3;
    IkConstraintTimeline.STRETCH = 4;
    spine.IkConstraintTimeline = IkConstraintTimeline;
    class TransformConstraintTimeline extends CurveTimeline {
        constructor(frameCount) {
            super(frameCount);
            this.frames = spine.Utils.newFloatArray(frameCount * TransformConstraintTimeline.ENTRIES);
        }
        getPropertyId() {
            return (TimelineType.transformConstraint << 24) + this.transformConstraintIndex;
        }
        setFrame(frameIndex, time, rotateMix, translateMix, scaleMix, shearMix) {
            frameIndex *= TransformConstraintTimeline.ENTRIES;
            this.frames[frameIndex] = time;
            this.frames[frameIndex + TransformConstraintTimeline.ROTATE] = rotateMix;
            this.frames[frameIndex + TransformConstraintTimeline.TRANSLATE] = translateMix;
            this.frames[frameIndex + TransformConstraintTimeline.SCALE] = scaleMix;
            this.frames[frameIndex + TransformConstraintTimeline.SHEAR] = shearMix;
        }
        apply(skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
            let frames = this.frames;
            let constraint = skeleton.transformConstraints[this.transformConstraintIndex];
            if (time < frames[0]) {
                let data = constraint.data;
                switch (blend) {
                    case MixBlend.setup:
                        constraint.rotateMix = data.rotateMix;
                        constraint.translateMix = data.translateMix;
                        constraint.scaleMix = data.scaleMix;
                        constraint.shearMix = data.shearMix;
                        return;
                    case MixBlend.first:
                        constraint.rotateMix += (data.rotateMix - constraint.rotateMix) * alpha;
                        constraint.translateMix += (data.translateMix - constraint.translateMix) * alpha;
                        constraint.scaleMix += (data.scaleMix - constraint.scaleMix) * alpha;
                        constraint.shearMix += (data.shearMix - constraint.shearMix) * alpha;
                }
                return;
            }
            let rotate = 0, translate = 0, scale = 0, shear = 0;
            if (time >= frames[frames.length - TransformConstraintTimeline.ENTRIES]) {
                let i = frames.length;
                rotate = frames[i + TransformConstraintTimeline.PREV_ROTATE];
                translate = frames[i + TransformConstraintTimeline.PREV_TRANSLATE];
                scale = frames[i + TransformConstraintTimeline.PREV_SCALE];
                shear = frames[i + TransformConstraintTimeline.PREV_SHEAR];
            }
            else {
                let frame = Animation.binarySearch(frames, time, TransformConstraintTimeline.ENTRIES);
                rotate = frames[frame + TransformConstraintTimeline.PREV_ROTATE];
                translate = frames[frame + TransformConstraintTimeline.PREV_TRANSLATE];
                scale = frames[frame + TransformConstraintTimeline.PREV_SCALE];
                shear = frames[frame + TransformConstraintTimeline.PREV_SHEAR];
                let frameTime = frames[frame];
                let percent = this.getCurvePercent(frame / TransformConstraintTimeline.ENTRIES - 1, 1 - (time - frameTime) / (frames[frame + TransformConstraintTimeline.PREV_TIME] - frameTime));
                rotate += (frames[frame + TransformConstraintTimeline.ROTATE] - rotate) * percent;
                translate += (frames[frame + TransformConstraintTimeline.TRANSLATE] - translate) * percent;
                scale += (frames[frame + TransformConstraintTimeline.SCALE] - scale) * percent;
                shear += (frames[frame + TransformConstraintTimeline.SHEAR] - shear) * percent;
            }
            if (blend == MixBlend.setup) {
                let data = constraint.data;
                constraint.rotateMix = data.rotateMix + (rotate - data.rotateMix) * alpha;
                constraint.translateMix = data.translateMix + (translate - data.translateMix) * alpha;
                constraint.scaleMix = data.scaleMix + (scale - data.scaleMix) * alpha;
                constraint.shearMix = data.shearMix + (shear - data.shearMix) * alpha;
            }
            else {
                constraint.rotateMix += (rotate - constraint.rotateMix) * alpha;
                constraint.translateMix += (translate - constraint.translateMix) * alpha;
                constraint.scaleMix += (scale - constraint.scaleMix) * alpha;
                constraint.shearMix += (shear - constraint.shearMix) * alpha;
            }
        }
    }
    TransformConstraintTimeline.ENTRIES = 5;
    TransformConstraintTimeline.PREV_TIME = -5;
    TransformConstraintTimeline.PREV_ROTATE = -4;
    TransformConstraintTimeline.PREV_TRANSLATE = -3;
    TransformConstraintTimeline.PREV_SCALE = -2;
    TransformConstraintTimeline.PREV_SHEAR = -1;
    TransformConstraintTimeline.ROTATE = 1;
    TransformConstraintTimeline.TRANSLATE = 2;
    TransformConstraintTimeline.SCALE = 3;
    TransformConstraintTimeline.SHEAR = 4;
    spine.TransformConstraintTimeline = TransformConstraintTimeline;
    class PathConstraintPositionTimeline extends CurveTimeline {
        constructor(frameCount) {
            super(frameCount);
            this.frames = spine.Utils.newFloatArray(frameCount * PathConstraintPositionTimeline.ENTRIES);
        }
        getPropertyId() {
            return (TimelineType.pathConstraintPosition << 24) + this.pathConstraintIndex;
        }
        setFrame(frameIndex, time, value) {
            frameIndex *= PathConstraintPositionTimeline.ENTRIES;
            this.frames[frameIndex] = time;
            this.frames[frameIndex + PathConstraintPositionTimeline.VALUE] = value;
        }
        apply(skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
            let frames = this.frames;
            let constraint = skeleton.pathConstraints[this.pathConstraintIndex];
            if (time < frames[0]) {
                switch (blend) {
                    case MixBlend.setup:
                        constraint.position = constraint.data.position;
                        return;
                    case MixBlend.first:
                        constraint.position += (constraint.data.position - constraint.position) * alpha;
                }
                return;
            }
            let position = 0;
            if (time >= frames[frames.length - PathConstraintPositionTimeline.ENTRIES])
                position = frames[frames.length + PathConstraintPositionTimeline.PREV_VALUE];
            else {
                let frame = Animation.binarySearch(frames, time, PathConstraintPositionTimeline.ENTRIES);
                position = frames[frame + PathConstraintPositionTimeline.PREV_VALUE];
                let frameTime = frames[frame];
                let percent = this.getCurvePercent(frame / PathConstraintPositionTimeline.ENTRIES - 1, 1 - (time - frameTime) / (frames[frame + PathConstraintPositionTimeline.PREV_TIME] - frameTime));
                position += (frames[frame + PathConstraintPositionTimeline.VALUE] - position) * percent;
            }
            if (blend == MixBlend.setup)
                constraint.position = constraint.data.position + (position - constraint.data.position) * alpha;
            else
                constraint.position += (position - constraint.position) * alpha;
        }
    }
    PathConstraintPositionTimeline.ENTRIES = 2;
    PathConstraintPositionTimeline.PREV_TIME = -2;
    PathConstraintPositionTimeline.PREV_VALUE = -1;
    PathConstraintPositionTimeline.VALUE = 1;
    spine.PathConstraintPositionTimeline = PathConstraintPositionTimeline;
    class PathConstraintSpacingTimeline extends PathConstraintPositionTimeline {
        constructor(frameCount) {
            super(frameCount);
        }
        getPropertyId() {
            return (TimelineType.pathConstraintSpacing << 24) + this.pathConstraintIndex;
        }
        apply(skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
            let frames = this.frames;
            let constraint = skeleton.pathConstraints[this.pathConstraintIndex];
            if (time < frames[0]) {
                switch (blend) {
                    case MixBlend.setup:
                        constraint.spacing = constraint.data.spacing;
                        return;
                    case MixBlend.first:
                        constraint.spacing += (constraint.data.spacing - constraint.spacing) * alpha;
                }
                return;
            }
            let spacing = 0;
            if (time >= frames[frames.length - PathConstraintSpacingTimeline.ENTRIES])
                spacing = frames[frames.length + PathConstraintSpacingTimeline.PREV_VALUE];
            else {
                let frame = Animation.binarySearch(frames, time, PathConstraintSpacingTimeline.ENTRIES);
                spacing = frames[frame + PathConstraintSpacingTimeline.PREV_VALUE];
                let frameTime = frames[frame];
                let percent = this.getCurvePercent(frame / PathConstraintSpacingTimeline.ENTRIES - 1, 1 - (time - frameTime) / (frames[frame + PathConstraintSpacingTimeline.PREV_TIME] - frameTime));
                spacing += (frames[frame + PathConstraintSpacingTimeline.VALUE] - spacing) * percent;
            }
            if (blend == MixBlend.setup)
                constraint.spacing = constraint.data.spacing + (spacing - constraint.data.spacing) * alpha;
            else
                constraint.spacing += (spacing - constraint.spacing) * alpha;
        }
    }
    spine.PathConstraintSpacingTimeline = PathConstraintSpacingTimeline;
    class PathConstraintMixTimeline extends CurveTimeline {
        constructor(frameCount) {
            super(frameCount);
            this.frames = spine.Utils.newFloatArray(frameCount * PathConstraintMixTimeline.ENTRIES);
        }
        getPropertyId() {
            return (TimelineType.pathConstraintMix << 24) + this.pathConstraintIndex;
        }
        setFrame(frameIndex, time, rotateMix, translateMix) {
            frameIndex *= PathConstraintMixTimeline.ENTRIES;
            this.frames[frameIndex] = time;
            this.frames[frameIndex + PathConstraintMixTimeline.ROTATE] = rotateMix;
            this.frames[frameIndex + PathConstraintMixTimeline.TRANSLATE] = translateMix;
        }
        apply(skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
            let frames = this.frames;
            let constraint = skeleton.pathConstraints[this.pathConstraintIndex];
            if (time < frames[0]) {
                switch (blend) {
                    case MixBlend.setup:
                        constraint.rotateMix = constraint.data.rotateMix;
                        constraint.translateMix = constraint.data.translateMix;
                        return;
                    case MixBlend.first:
                        constraint.rotateMix += (constraint.data.rotateMix - constraint.rotateMix) * alpha;
                        constraint.translateMix += (constraint.data.translateMix - constraint.translateMix) * alpha;
                }
                return;
            }
            let rotate = 0, translate = 0;
            if (time >= frames[frames.length - PathConstraintMixTimeline.ENTRIES]) {
                rotate = frames[frames.length + PathConstraintMixTimeline.PREV_ROTATE];
                translate = frames[frames.length + PathConstraintMixTimeline.PREV_TRANSLATE];
            }
            else {
                let frame = Animation.binarySearch(frames, time, PathConstraintMixTimeline.ENTRIES);
                rotate = frames[frame + PathConstraintMixTimeline.PREV_ROTATE];
                translate = frames[frame + PathConstraintMixTimeline.PREV_TRANSLATE];
                let frameTime = frames[frame];
                let percent = this.getCurvePercent(frame / PathConstraintMixTimeline.ENTRIES - 1, 1 - (time - frameTime) / (frames[frame + PathConstraintMixTimeline.PREV_TIME] - frameTime));
                rotate += (frames[frame + PathConstraintMixTimeline.ROTATE] - rotate) * percent;
                translate += (frames[frame + PathConstraintMixTimeline.TRANSLATE] - translate) * percent;
            }
            if (blend == MixBlend.setup) {
                constraint.rotateMix = constraint.data.rotateMix + (rotate - constraint.data.rotateMix) * alpha;
                constraint.translateMix = constraint.data.translateMix + (translate - constraint.data.translateMix) * alpha;
            }
            else {
                constraint.rotateMix += (rotate - constraint.rotateMix) * alpha;
                constraint.translateMix += (translate - constraint.translateMix) * alpha;
            }
        }
    }
    PathConstraintMixTimeline.ENTRIES = 3;
    PathConstraintMixTimeline.PREV_TIME = -3;
    PathConstraintMixTimeline.PREV_ROTATE = -2;
    PathConstraintMixTimeline.PREV_TRANSLATE = -1;
    PathConstraintMixTimeline.ROTATE = 1;
    PathConstraintMixTimeline.TRANSLATE = 2;
    spine.PathConstraintMixTimeline = PathConstraintMixTimeline;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class AnimationState {
        constructor(data) {
            this.tracks = new Array();
            this.events = new Array();
            this.listeners = new Array();
            this.queue = new EventQueue(this);
            this.propertyIDs = new spine.IntSet();
            this.animationsChanged = false;
            this.timeScale = 1;
            this.trackEntryPool = new spine.Pool(() => new TrackEntry());
            this.data = data;
        }
        update(delta) {
            delta *= this.timeScale;
            let tracks = this.tracks;
            for (let i = 0, n = tracks.length; i < n; i++) {
                let current = tracks[i];
                if (current == null)
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
                if (next != null) {
                    let nextTime = current.trackLast - next.delay;
                    if (nextTime >= 0) {
                        next.delay = 0;
                        next.trackTime = current.timeScale == 0 ? 0 : (nextTime / current.timeScale + delta) * next.timeScale;
                        current.trackTime += currentDelta;
                        this.setCurrent(i, next, true);
                        while (next.mixingFrom != null) {
                            next.mixTime += delta;
                            next = next.mixingFrom;
                        }
                        continue;
                    }
                }
                else if (current.trackLast >= current.trackEnd && current.mixingFrom == null) {
                    tracks[i] = null;
                    this.queue.end(current);
                    this.disposeNext(current);
                    continue;
                }
                if (current.mixingFrom != null && this.updateMixingFrom(current, delta)) {
                    let from = current.mixingFrom;
                    current.mixingFrom = null;
                    if (from != null)
                        from.mixingTo = null;
                    while (from != null) {
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
            if (from == null)
                return true;
            let finished = this.updateMixingFrom(from, delta);
            from.animationLast = from.nextAnimationLast;
            from.trackLast = from.nextTrackLast;
            if (to.mixTime > 0 && to.mixTime >= to.mixDuration) {
                if (from.totalAlpha == 0 || to.mixDuration == 0) {
                    to.mixingFrom = from.mixingFrom;
                    if (from.mixingFrom != null)
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
            if (skeleton == null)
                throw new Error("skeleton cannot be null.");
            if (this.animationsChanged)
                this._animationsChanged();
            let events = this.events;
            let tracks = this.tracks;
            let applied = false;
            for (let i = 0, n = tracks.length; i < n; i++) {
                let current = tracks[i];
                if (current == null || current.delay > 0)
                    continue;
                applied = true;
                let blend = i == 0 ? spine.MixBlend.first : current.mixBlend;
                let mix = current.alpha;
                if (current.mixingFrom != null)
                    mix *= this.applyMixingFrom(current, skeleton, blend);
                else if (current.trackTime >= current.trackEnd && current.next == null)
                    mix = 0;
                let animationLast = current.animationLast, animationTime = current.getAnimationTime();
                let timelineCount = current.animation.timelines.length;
                let timelines = current.animation.timelines;
                if ((i == 0 && mix == 1) || blend == spine.MixBlend.add) {
                    for (let ii = 0; ii < timelineCount; ii++)
                        timelines[ii].apply(skeleton, animationLast, animationTime, events, mix, blend, spine.MixDirection.in);
                }
                else {
                    let timelineMode = current.timelineMode;
                    let firstFrame = current.timelinesRotation.length == 0;
                    if (firstFrame)
                        spine.Utils.setArraySize(current.timelinesRotation, timelineCount << 1, null);
                    let timelinesRotation = current.timelinesRotation;
                    for (let ii = 0; ii < timelineCount; ii++) {
                        let timeline = timelines[ii];
                        let timelineBlend = timelineMode[ii] == AnimationState.SUBSEQUENT ? blend : spine.MixBlend.setup;
                        if (timeline instanceof spine.RotateTimeline) {
                            this.applyRotateTimeline(timeline, skeleton, animationTime, mix, timelineBlend, timelinesRotation, ii << 1, firstFrame);
                        }
                        else {
                            spine.Utils.webkit602BugfixHelper(mix, blend);
                            timeline.apply(skeleton, animationLast, animationTime, events, mix, timelineBlend, spine.MixDirection.in);
                        }
                    }
                }
                this.queueEvents(current, animationTime);
                events.length = 0;
                current.nextAnimationLast = animationTime;
                current.nextTrackLast = current.trackTime;
            }
            this.queue.drain();
            return applied;
        }
        applyMixingFrom(to, skeleton, blend) {
            let from = to.mixingFrom;
            if (from.mixingFrom != null)
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
            let events = mix < from.eventThreshold ? this.events : null;
            let attachments = mix < from.attachmentThreshold, drawOrder = mix < from.drawOrderThreshold;
            let animationLast = from.animationLast, animationTime = from.getAnimationTime();
            let timelineCount = from.animation.timelines.length;
            let timelines = from.animation.timelines;
            let alphaHold = from.alpha * to.interruptAlpha, alphaMix = alphaHold * (1 - mix);
            if (blend == spine.MixBlend.add) {
                for (let i = 0; i < timelineCount; i++)
                    timelines[i].apply(skeleton, animationLast, animationTime, events, alphaMix, blend, spine.MixDirection.out);
            }
            else {
                let timelineMode = from.timelineMode;
                let timelineHoldMix = from.timelineHoldMix;
                let firstFrame = from.timelinesRotation.length == 0;
                if (firstFrame)
                    spine.Utils.setArraySize(from.timelinesRotation, timelineCount << 1, null);
                let timelinesRotation = from.timelinesRotation;
                from.totalAlpha = 0;
                for (let i = 0; i < timelineCount; i++) {
                    let timeline = timelines[i];
                    let direction = spine.MixDirection.out;
                    let timelineBlend;
                    let alpha = 0;
                    switch (timelineMode[i]) {
                        case AnimationState.SUBSEQUENT:
                            if (!attachments && timeline instanceof spine.AttachmentTimeline)
                                continue;
                            if (!drawOrder && timeline instanceof spine.DrawOrderTimeline)
                                continue;
                            timelineBlend = blend;
                            alpha = alphaMix;
                            break;
                        case AnimationState.FIRST:
                            timelineBlend = spine.MixBlend.setup;
                            alpha = alphaMix;
                            break;
                        case AnimationState.HOLD:
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
                    if (timeline instanceof spine.RotateTimeline)
                        this.applyRotateTimeline(timeline, skeleton, animationTime, alpha, timelineBlend, timelinesRotation, i << 1, firstFrame);
                    else {
                        spine.Utils.webkit602BugfixHelper(alpha, blend);
                        if (timelineBlend == spine.MixBlend.setup) {
                            if (timeline instanceof spine.AttachmentTimeline) {
                                if (attachments)
                                    direction = spine.MixDirection.out;
                            }
                            else if (timeline instanceof spine.DrawOrderTimeline) {
                                if (drawOrder)
                                    direction = spine.MixDirection.out;
                            }
                        }
                        timeline.apply(skeleton, animationLast, animationTime, events, alpha, timelineBlend, direction);
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
        applyRotateTimeline(timeline, skeleton, time, alpha, blend, timelinesRotation, i, firstFrame) {
            if (firstFrame)
                timelinesRotation[i] = 0;
            if (alpha == 1) {
                timeline.apply(skeleton, 0, time, null, 1, blend, spine.MixDirection.in);
                return;
            }
            let rotateTimeline = timeline;
            let frames = rotateTimeline.frames;
            let bone = skeleton.bones[rotateTimeline.boneIndex];
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
                if (time >= frames[frames.length - spine.RotateTimeline.ENTRIES])
                    r2 = bone.data.rotation + frames[frames.length + spine.RotateTimeline.PREV_ROTATION];
                else {
                    let frame = spine.Animation.binarySearch(frames, time, spine.RotateTimeline.ENTRIES);
                    let prevRotation = frames[frame + spine.RotateTimeline.PREV_ROTATION];
                    let frameTime = frames[frame];
                    let percent = rotateTimeline.getCurvePercent((frame >> 1) - 1, 1 - (time - frameTime) / (frames[frame + spine.RotateTimeline.PREV_TIME] - frameTime));
                    r2 = frames[frame + spine.RotateTimeline.ROTATION] - prevRotation;
                    r2 -= (16384 - ((16384.499999999996 - r2 / 360) | 0)) * 360;
                    r2 = prevRotation + r2 * percent + bone.data.rotation;
                    r2 -= (16384 - ((16384.499999999996 - r2 / 360) | 0)) * 360;
                }
            }
            let total = 0, diff = r2 - r1;
            diff -= (16384 - ((16384.499999999996 - diff / 360) | 0)) * 360;
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
                let current = diff > 0, dir = lastTotal >= 0;
                if (spine.MathUtils.signum(lastDiff) != spine.MathUtils.signum(diff) && Math.abs(lastDiff) <= 90) {
                    if (Math.abs(lastTotal) > 180)
                        lastTotal += 360 * spine.MathUtils.signum(lastTotal);
                    dir = current;
                }
                total = diff + lastTotal - lastTotal % 360;
                if (dir != current)
                    total += 360 * spine.MathUtils.signum(lastTotal);
                timelinesRotation[i] = total;
            }
            timelinesRotation[i + 1] = diff;
            r1 += total * alpha;
            bone.rotation = r1 - (16384 - ((16384.499999999996 - r1 / 360) | 0)) * 360;
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
            if (entry.loop)
                complete = duration == 0 || trackLastWrapped > entry.trackTime % duration;
            else
                complete = animationTime >= animationEnd && entry.animationLast < animationEnd;
            if (complete)
                this.queue.complete(entry);
            for (; i < n; i++) {
                let event = events[i];
                if (event.time < animationStart)
                    continue;
                this.queue.event(entry, events[i]);
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
            if (current == null)
                return;
            this.queue.end(current);
            this.disposeNext(current);
            let entry = current;
            while (true) {
                let from = entry.mixingFrom;
                if (from == null)
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
            if (from != null) {
                if (interrupt)
                    this.queue.interrupt(from);
                current.mixingFrom = from;
                from.mixingTo = current;
                current.mixTime = 0;
                if (from.mixingFrom != null && from.mixDuration > 0)
                    current.interruptAlpha *= Math.min(1, from.mixTime / from.mixDuration);
                from.timelinesRotation.length = 0;
            }
            this.queue.start(current);
        }
        setAnimation(trackIndex, animationName, loop) {
            let animation = this.data.skeletonData.findAnimation(animationName);
            if (animation == null)
                throw new Error("Animation not found: " + animationName);
            return this.setAnimationWith(trackIndex, animation, loop);
        }
        setAnimationWith(trackIndex, animation, loop) {
            if (animation == null)
                throw new Error("animation cannot be null.");
            let interrupt = true;
            let current = this.expandToIndex(trackIndex);
            if (current != null) {
                if (current.nextTrackLast == -1) {
                    this.tracks[trackIndex] = current.mixingFrom;
                    this.queue.interrupt(current);
                    this.queue.end(current);
                    this.disposeNext(current);
                    current = current.mixingFrom;
                    interrupt = false;
                }
                else
                    this.disposeNext(current);
            }
            let entry = this.trackEntry(trackIndex, animation, loop, current);
            this.setCurrent(trackIndex, entry, interrupt);
            this.queue.drain();
            return entry;
        }
        addAnimation(trackIndex, animationName, loop, delay) {
            let animation = this.data.skeletonData.findAnimation(animationName);
            if (animation == null)
                throw new Error("Animation not found: " + animationName);
            return this.addAnimationWith(trackIndex, animation, loop, delay);
        }
        addAnimationWith(trackIndex, animation, loop, delay) {
            if (animation == null)
                throw new Error("animation cannot be null.");
            let last = this.expandToIndex(trackIndex);
            if (last != null) {
                while (last.next != null)
                    last = last.next;
            }
            let entry = this.trackEntry(trackIndex, animation, loop, last);
            if (last == null) {
                this.setCurrent(trackIndex, entry, true);
                this.queue.drain();
            }
            else {
                last.next = entry;
                if (delay <= 0) {
                    let duration = last.animationEnd - last.animationStart;
                    if (duration != 0) {
                        if (last.loop)
                            delay += duration * (1 + ((last.trackTime / duration) | 0));
                        else
                            delay += Math.max(duration, last.trackTime);
                        delay -= this.data.getMix(last.animation, animation);
                    }
                    else
                        delay = last.trackTime;
                }
            }
            entry.delay = delay;
            return entry;
        }
        setEmptyAnimation(trackIndex, mixDuration) {
            let entry = this.setAnimationWith(trackIndex, AnimationState.emptyAnimation, false);
            entry.mixDuration = mixDuration;
            entry.trackEnd = mixDuration;
            return entry;
        }
        addEmptyAnimation(trackIndex, mixDuration, delay) {
            if (delay <= 0)
                delay -= mixDuration;
            let entry = this.addAnimationWith(trackIndex, AnimationState.emptyAnimation, false, delay);
            entry.mixDuration = mixDuration;
            entry.trackEnd = mixDuration;
            return entry;
        }
        setEmptyAnimations(mixDuration) {
            let oldDrainDisabled = this.queue.drainDisabled;
            this.queue.drainDisabled = true;
            for (let i = 0, n = this.tracks.length; i < n; i++) {
                let current = this.tracks[i];
                if (current != null)
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
            entry.trackIndex = trackIndex;
            entry.animation = animation;
            entry.loop = loop;
            entry.holdPrevious = false;
            entry.eventThreshold = 0;
            entry.attachmentThreshold = 0;
            entry.drawOrderThreshold = 0;
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
            entry.interruptAlpha = 1;
            entry.mixTime = 0;
            entry.mixDuration = last == null ? 0 : this.data.getMix(last.animation, animation);
            return entry;
        }
        disposeNext(entry) {
            let next = entry.next;
            while (next != null) {
                this.queue.dispose(next);
                next = next.next;
            }
            entry.next = null;
        }
        _animationsChanged() {
            this.animationsChanged = false;
            this.propertyIDs.clear();
            for (let i = 0, n = this.tracks.length; i < n; i++) {
                let entry = this.tracks[i];
                if (entry == null)
                    continue;
                while (entry.mixingFrom != null)
                    entry = entry.mixingFrom;
                do {
                    if (entry.mixingFrom == null || entry.mixBlend != spine.MixBlend.add)
                        this.setTimelineModes(entry);
                    entry = entry.mixingTo;
                } while (entry != null);
            }
        }
        setTimelineModes(entry) {
            let to = entry.mixingTo;
            let timelines = entry.animation.timelines;
            let timelinesCount = entry.animation.timelines.length;
            let timelineMode = spine.Utils.setArraySize(entry.timelineMode, timelinesCount);
            entry.timelineHoldMix.length = 0;
            let timelineDipMix = spine.Utils.setArraySize(entry.timelineHoldMix, timelinesCount);
            let propertyIDs = this.propertyIDs;
            if (to != null && to.holdPrevious) {
                for (let i = 0; i < timelinesCount; i++) {
                    propertyIDs.add(timelines[i].getPropertyId());
                    timelineMode[i] = AnimationState.HOLD;
                }
                return;
            }
            outer: for (let i = 0; i < timelinesCount; i++) {
                let id = timelines[i].getPropertyId();
                if (!propertyIDs.add(id))
                    timelineMode[i] = AnimationState.SUBSEQUENT;
                else if (to == null || !this.hasTimeline(to, id))
                    timelineMode[i] = AnimationState.FIRST;
                else {
                    for (let next = to.mixingTo; next != null; next = next.mixingTo) {
                        if (this.hasTimeline(next, id))
                            continue;
                        if (entry.mixDuration > 0) {
                            timelineMode[i] = AnimationState.HOLD_MIX;
                            timelineDipMix[i] = next;
                            continue outer;
                        }
                        break;
                    }
                    timelineMode[i] = AnimationState.HOLD;
                }
            }
        }
        hasTimeline(entry, id) {
            let timelines = entry.animation.timelines;
            for (let i = 0, n = timelines.length; i < n; i++)
                if (timelines[i].getPropertyId() == id)
                    return true;
            return false;
        }
        getCurrent(trackIndex) {
            if (trackIndex >= this.tracks.length)
                return null;
            return this.tracks[trackIndex];
        }
        addListener(listener) {
            if (listener == null)
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
    AnimationState.emptyAnimation = new spine.Animation("<empty>", [], 0);
    AnimationState.SUBSEQUENT = 0;
    AnimationState.FIRST = 1;
    AnimationState.HOLD = 2;
    AnimationState.HOLD_MIX = 3;
    spine.AnimationState = AnimationState;
    class TrackEntry {
        constructor() {
            this.mixBlend = spine.MixBlend.replace;
            this.timelineMode = new Array();
            this.timelineHoldMix = new Array();
            this.timelinesRotation = new Array();
        }
        reset() {
            this.next = null;
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
                        if (entry.listener != null && entry.listener.start)
                            entry.listener.start(entry);
                        for (let ii = 0; ii < listeners.length; ii++)
                            if (listeners[ii].start)
                                listeners[ii].start(entry);
                        break;
                    case EventType.interrupt:
                        if (entry.listener != null && entry.listener.interrupt)
                            entry.listener.interrupt(entry);
                        for (let ii = 0; ii < listeners.length; ii++)
                            if (listeners[ii].interrupt)
                                listeners[ii].interrupt(entry);
                        break;
                    case EventType.end:
                        if (entry.listener != null && entry.listener.end)
                            entry.listener.end(entry);
                        for (let ii = 0; ii < listeners.length; ii++)
                            if (listeners[ii].end)
                                listeners[ii].end(entry);
                    case EventType.dispose:
                        if (entry.listener != null && entry.listener.dispose)
                            entry.listener.dispose(entry);
                        for (let ii = 0; ii < listeners.length; ii++)
                            if (listeners[ii].dispose)
                                listeners[ii].dispose(entry);
                        this.animState.trackEntryPool.free(entry);
                        break;
                    case EventType.complete:
                        if (entry.listener != null && entry.listener.complete)
                            entry.listener.complete(entry);
                        for (let ii = 0; ii < listeners.length; ii++)
                            if (listeners[ii].complete)
                                listeners[ii].complete(entry);
                        break;
                    case EventType.event:
                        let event = objects[i++ + 2];
                        if (entry.listener != null && entry.listener.event)
                            entry.listener.event(entry, event);
                        for (let ii = 0; ii < listeners.length; ii++)
                            if (listeners[ii].event)
                                listeners[ii].event(entry, event);
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
    class AnimationStateAdapter2 {
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
    spine.AnimationStateAdapter2 = AnimationStateAdapter2;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class AnimationStateData {
        constructor(skeletonData) {
            this.animationToMixTime = {};
            this.defaultMix = 0;
            if (skeletonData == null)
                throw new Error("skeletonData cannot be null.");
            this.skeletonData = skeletonData;
        }
        setMix(fromName, toName, duration) {
            let from = this.skeletonData.findAnimation(fromName);
            if (from == null)
                throw new Error("Animation not found: " + fromName);
            let to = this.skeletonData.findAnimation(toName);
            if (to == null)
                throw new Error("Animation not found: " + toName);
            this.setMixWith(from, to, duration);
        }
        setMixWith(from, to, duration) {
            if (from == null)
                throw new Error("from cannot be null.");
            if (to == null)
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
    class AssetManager {
        constructor(textureLoader, pathPrefix = "") {
            this.assets = {};
            this.errors = {};
            this.toLoad = 0;
            this.loaded = 0;
            this.textureLoader = textureLoader;
            this.pathPrefix = pathPrefix;
        }
        static downloadText(url, success, error) {
            // LayaBox_Modify
            // let request = new XMLHttpRequest();
            // request.open("GET", url, true);
            // request.onload = () => {
            //     if (request.status == 200) {
            //         success(request.responseText);
            //     }
            //     else {
            //         error(request.status, request.responseText);
            //     }
            // };
            // request.onerror = () => {
            //     error(request.status, request.responseText);
            // };
            // request.send();
            let _Laya = Laya.Laya ? Laya.Laya : Laya;
            _Laya.loader.load([{type: _Laya.Loader.TEXT, url: url}], _Laya.Handler.create(this, (re) => {
                if (re) {
                    success(_Laya.loader.getRes(url));
                } else {
                    error(400, "download text error: " + url);
                }
            }));
        }
        static downloadBinary(url, success, error) {
            // LayaBox_Modify
            // let request = new XMLHttpRequest();
            // request.open("GET", url, true);
            // request.responseType = "arraybuffer";
            // request.onload = () => {
            //     if (request.status == 200) {
            //         success(new Uint8Array(request.response));
            //     }
            //     else {
            //         error(request.status, request.responseText);
            //     }
            // };
            // request.onerror = () => {
            //     error(request.status, request.responseText);
            // };
            // request.send();
            let _Laya = Laya.Laya ? Laya.Laya : Laya;
            _Laya.loader.load([{type: _Laya.Loader.BUFFER, url: url}], _Laya.Handler.create(this, (re) => {
                if (re) {
                    success(new Uint8Array(_Laya.loader.getRes(url)));
                } else {
                    error(400, "download binary error: " + url);
                }
            }));
        }
        loadText(path, success = null, error = null) {
            path = this.pathPrefix + path;
            this.toLoad++;
            AssetManager.downloadText(path, (data) => {
                this.assets[path] = data;
                if (success)
                    success(path, data);
                this.toLoad--;
                this.loaded++;
            }, (state, responseText) => {
                this.errors[path] = `Couldn't load text ${path}: status ${status}, ${responseText}`;
                if (error)
                    error(path, `Couldn't load text ${path}: status ${status}, ${responseText}`);
                this.toLoad--;
                this.loaded++;
            });
        }
        loadTexture(path, success = null, error = null) {
            path = this.pathPrefix + path;
            this.toLoad++;
            // LayaBox_Modify
            // let img = new Image();
            // img.crossOrigin = "anonymous";
            // img.onload = (ev) => {
            //     let texture = this.textureLoader(img);
            //     this.assets[path] = texture;
            //     this.toLoad--;
            //     this.loaded++;
            //     if (success)
            //         success(path, img);
            // };
            // img.onerror = (ev) => {
            //     this.errors[path] = `Couldn't load image ${path}`;
            //     this.toLoad--;
            //     this.loaded++;
            //     if (error)
            //         error(path, `Couldn't load image ${path}`);
            // };
            // img.src = path;
            let _Laya = Laya.Laya ? Laya.Laya : Laya;
            _Laya.loader.load([{type: _Laya.Loader.IMAGE, url: path}], _Laya.Handler.create(this, (re) => {
                if (re) {
                    let texture = this.textureLoader(_Laya.loader.getRes(path));
                    this.assets[path] = texture;
                    this.toLoad--;
                    this.loaded++;
                    if (success)
                        success(path, texture);
                } else {
                    this.errors[path] = `Couldn't load image ${path}`;
                    this.toLoad--;
                    this.loaded++;
                    if (error)
                        error(path, `Couldn't load image ${path}`);
                }
            }));
        }
        loadTextureData(path, data, success = null, error = null) {
            path = this.pathPrefix + path;
            this.toLoad++;
            let img = new Image();
            img.onload = (ev) => {
                let texture = this.textureLoader(img);
                this.assets[path] = texture;
                this.toLoad--;
                this.loaded++;
                if (success)
                    success(path, img);
            };
            img.onerror = (ev) => {
                this.errors[path] = `Couldn't load image ${path}`;
                this.toLoad--;
                this.loaded++;
                if (error)
                    error(path, `Couldn't load image ${path}`);
            };
            img.src = data;
        }
        loadTextureAtlas(path, success = null, error = null) {
            let parent = path.lastIndexOf("/") >= 0 ? path.substring(0, path.lastIndexOf("/")) : "";
            path = this.pathPrefix + path;
            this.toLoad++;
            AssetManager.downloadText(path, (atlasData) => {
                let pagesLoaded = { count: 0 };
                let atlasPages = new Array();
                try {
                    let atlas = new spine.TextureAtlas(atlasData, (path) => {
                        // LayaBox_Modify
                        atlasPages.push(parent == "" ? path : parent + "/" + path);
                        let image = document.createElement("img");
                        // QQ平台报错，无法设置width height
                        // image.width = 16;
                        // image.height = 16;
                        return new spine.FakeTexture(image);
                    });
                }
                catch (e) {
                    let ex = e;
                    this.errors[path] = `Couldn't load texture atlas ${path}: ${ex.message}`;
                    if (error)
                        error(path, `Couldn't load texture atlas ${path}: ${ex.message}`);
                    this.toLoad--;
                    this.loaded++;
                    return;
                }
                for (let atlasPage of atlasPages) {
                    let pageLoadError = false;
                    this.loadTexture(atlasPage, (imagePath, image) => {
                        pagesLoaded.count++;
                        if (pagesLoaded.count == atlasPages.length) {
                            if (!pageLoadError) {
                                try {
                                    let atlas = new spine.TextureAtlas(atlasData, (path) => {
                                        // LayaBox_Modify
                                        return this.get(parent == "" ? path : parent + "/" + path);
                                    });
                                    this.assets[path] = atlas;
                                    if (success)
                                        success(path, atlas);
                                    this.toLoad--;
                                    this.loaded++;
                                }
                                catch (e) {
                                    let ex = e;
                                    this.errors[path] = `Couldn't load texture atlas ${path}: ${ex.message}`;
                                    if (error)
                                        error(path, `Couldn't load texture atlas ${path}: ${ex.message}`);
                                    this.toLoad--;
                                    this.loaded++;
                                }
                            }
                            else {
                                this.errors[path] = `Couldn't load texture atlas page ${imagePath}} of atlas ${path}`;
                                if (error)
                                    error(path, `Couldn't load texture atlas page ${imagePath} of atlas ${path}`);
                                this.toLoad--;
                                this.loaded++;
                            }
                        }
                    }, (imagePath, errorMessage) => {
                        pageLoadError = true;
                        pagesLoaded.count++;
                        if (pagesLoaded.count == atlasPages.length) {
                            this.errors[path] = `Couldn't load texture atlas page ${imagePath}} of atlas ${path}`;
                            if (error)
                                error(path, `Couldn't load texture atlas page ${imagePath} of atlas ${path}`);
                            this.toLoad--;
                            this.loaded++;
                        }
                    });
                }
            }, (state, responseText) => {
                this.errors[path] = `Couldn't load texture atlas ${path}: status ${status}, ${responseText}`;
                if (error)
                    error(path, `Couldn't load texture atlas ${path}: status ${status}, ${responseText}`);
                this.toLoad--;
                this.loaded++;
            });
        }
        get(path) {
            path = this.pathPrefix + path;
            return this.assets[path];
        }
        remove(path) {
            path = this.pathPrefix + path;
            let asset = this.assets[path];
            if (asset.dispose)
                asset.dispose();
            this.assets[path] = null;
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
    spine.AssetManager = AssetManager;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class AtlasAttachmentLoader {
        constructor(atlas) {
            this.atlas = atlas;
        }
        newRegionAttachment(skin, name, path) {
            let region = this.atlas.findRegion(path);
            if (region == null)
                throw new Error("Region not found in atlas: " + path + " (region attachment: " + name + ")");
            region.renderObject = region;
            let attachment = new spine.RegionAttachment(name);
            attachment.setRegion(region);
            return attachment;
        }
        newMeshAttachment(skin, name, path) {
            let region = this.atlas.findRegion(path);
            if (region == null)
                throw new Error("Region not found in atlas: " + path + " (mesh attachment: " + name + ")");
            region.renderObject = region;
            let attachment = new spine.MeshAttachment(name);
            attachment.region = region;
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
    class Bone {
        constructor(data, skeleton, parent) {
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
            this.appliedValid = false;
            this.a = 0;
            this.b = 0;
            this.worldX = 0;
            this.c = 0;
            this.d = 0;
            this.worldY = 0;
            this.sorted = false;
            if (data == null)
                throw new Error("data cannot be null.");
            if (skeleton == null)
                throw new Error("skeleton cannot be null.");
            this.data = data;
            this.skeleton = skeleton;
            this.parent = parent;
            this.setToSetupPose();
        }
        update() {
            this.updateWorldTransformWith(this.x, this.y, this.rotation, this.scaleX, this.scaleY, this.shearX, this.shearY);
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
            this.appliedValid = true;
            let parent = this.parent;
            if (parent == null) {
                let skeleton = this.skeleton;
                let rotationY = rotation + 90 + shearY;
                let sx = skeleton.scaleX;
                let sy = skeleton.scaleY;
                this.a = spine.MathUtils.cosDeg(rotation + shearX) * scaleX * sx;
                this.b = spine.MathUtils.cosDeg(rotationY) * scaleY * sx;
                this.c = spine.MathUtils.sinDeg(rotation + shearX) * scaleX * sy;
                this.d = spine.MathUtils.sinDeg(rotationY) * scaleY * sy;
                this.worldX = x * sx + skeleton.x;
                this.worldY = y * sy + skeleton.y;
                return;
            }
            let pa = parent.a, pb = parent.b, pc = parent.c, pd = parent.d;
            this.worldX = pa * x + pb * y + parent.worldX;
            this.worldY = pc * x + pd * y + parent.worldY;
            switch (this.data.transformMode) {
                case spine.TransformMode.Normal: {
                    let rotationY = rotation + 90 + shearY;
                    let la = spine.MathUtils.cosDeg(rotation + shearX) * scaleX;
                    let lb = spine.MathUtils.cosDeg(rotationY) * scaleY;
                    let lc = spine.MathUtils.sinDeg(rotation + shearX) * scaleX;
                    let ld = spine.MathUtils.sinDeg(rotationY) * scaleY;
                    this.a = pa * la + pb * lc;
                    this.b = pa * lb + pb * ld;
                    this.c = pc * la + pd * lc;
                    this.d = pc * lb + pd * ld;
                    return;
                }
                case spine.TransformMode.OnlyTranslation: {
                    let rotationY = rotation + 90 + shearY;
                    this.a = spine.MathUtils.cosDeg(rotation + shearX) * scaleX;
                    this.b = spine.MathUtils.cosDeg(rotationY) * scaleY;
                    this.c = spine.MathUtils.sinDeg(rotation + shearX) * scaleX;
                    this.d = spine.MathUtils.sinDeg(rotationY) * scaleY;
                    break;
                }
                case spine.TransformMode.NoRotationOrReflection: {
                    let s = pa * pa + pc * pc;
                    let prx = 0;
                    if (s > 0.0001) {
                        s = Math.abs(pa * pd - pb * pc) / s;
                        pb = pc * s;
                        pd = pa * s;
                        prx = Math.atan2(pc, pa) * spine.MathUtils.radDeg;
                    }
                    else {
                        pa = 0;
                        pc = 0;
                        prx = 90 - Math.atan2(pd, pb) * spine.MathUtils.radDeg;
                    }
                    let rx = rotation + shearX - prx;
                    let ry = rotation + shearY - prx + 90;
                    let la = spine.MathUtils.cosDeg(rx) * scaleX;
                    let lb = spine.MathUtils.cosDeg(ry) * scaleY;
                    let lc = spine.MathUtils.sinDeg(rx) * scaleX;
                    let ld = spine.MathUtils.sinDeg(ry) * scaleY;
                    this.a = pa * la - pb * lc;
                    this.b = pa * lb - pb * ld;
                    this.c = pc * la + pd * lc;
                    this.d = pc * lb + pd * ld;
                    break;
                }
                case spine.TransformMode.NoScale:
                case spine.TransformMode.NoScaleOrReflection: {
                    let cos = spine.MathUtils.cosDeg(rotation);
                    let sin = spine.MathUtils.sinDeg(rotation);
                    let za = (pa * cos + pb * sin) / this.skeleton.scaleX;
                    let zc = (pc * cos + pd * sin) / this.skeleton.scaleY;
                    let s = Math.sqrt(za * za + zc * zc);
                    if (s > 0.00001)
                        s = 1 / s;
                    za *= s;
                    zc *= s;
                    s = Math.sqrt(za * za + zc * zc);
                    if (this.data.transformMode == spine.TransformMode.NoScale
                        && (pa * pd - pb * pc < 0) != (this.skeleton.scaleX < 0 != this.skeleton.scaleY < 0))
                        s = -s;
                    let r = Math.PI / 2 + Math.atan2(zc, za);
                    let zb = Math.cos(r) * s;
                    let zd = Math.sin(r) * s;
                    let la = spine.MathUtils.cosDeg(shearX) * scaleX;
                    let lb = spine.MathUtils.cosDeg(90 + shearY) * scaleY;
                    let lc = spine.MathUtils.sinDeg(shearX) * scaleX;
                    let ld = spine.MathUtils.sinDeg(90 + shearY) * scaleY;
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
        updateAppliedTransform() {
            this.appliedValid = true;
            let parent = this.parent;
            if (parent == null) {
                this.ax = this.worldX;
                this.ay = this.worldY;
                this.arotation = Math.atan2(this.c, this.a) * spine.MathUtils.radDeg;
                this.ascaleX = Math.sqrt(this.a * this.a + this.c * this.c);
                this.ascaleY = Math.sqrt(this.b * this.b + this.d * this.d);
                this.ashearX = 0;
                this.ashearY = Math.atan2(this.a * this.b + this.c * this.d, this.a * this.d - this.b * this.c) * spine.MathUtils.radDeg;
                return;
            }
            let pa = parent.a, pb = parent.b, pc = parent.c, pd = parent.d;
            let pid = 1 / (pa * pd - pb * pc);
            let dx = this.worldX - parent.worldX, dy = this.worldY - parent.worldY;
            this.ax = (dx * pd * pid - dy * pb * pid);
            this.ay = (dy * pa * pid - dx * pc * pid);
            let ia = pid * pd;
            let id = pid * pa;
            let ib = pid * pb;
            let ic = pid * pc;
            let ra = ia * this.a - ib * this.c;
            let rb = ia * this.b - ib * this.d;
            let rc = id * this.c - ic * this.a;
            let rd = id * this.d - ic * this.b;
            this.ashearX = 0;
            this.ascaleX = Math.sqrt(ra * ra + rc * rc);
            if (this.ascaleX > 0.0001) {
                let det = ra * rd - rb * rc;
                this.ascaleY = det / this.ascaleX;
                this.ashearY = Math.atan2(ra * rb + rc * rd, det) * spine.MathUtils.radDeg;
                this.arotation = Math.atan2(rc, ra) * spine.MathUtils.radDeg;
            }
            else {
                this.ascaleX = 0;
                this.ascaleY = Math.sqrt(rb * rb + rd * rd);
                this.ashearY = 0;
                this.arotation = 90 - Math.atan2(rd, rb) * spine.MathUtils.radDeg;
            }
        }
        worldToLocal(world) {
            let a = this.a, b = this.b, c = this.c, d = this.d;
            let invDet = 1 / (a * d - b * c);
            let x = world.x - this.worldX, y = world.y - this.worldY;
            world.x = (x * d * invDet - y * b * invDet);
            world.y = (y * a * invDet - x * c * invDet);
            return world;
        }
        localToWorld(local) {
            let x = local.x, y = local.y;
            local.x = x * this.a + y * this.b + this.worldX;
            local.y = x * this.c + y * this.d + this.worldY;
            return local;
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
            let a = this.a, b = this.b, c = this.c, d = this.d;
            let cos = spine.MathUtils.cosDeg(degrees), sin = spine.MathUtils.sinDeg(degrees);
            this.a = cos * a - sin * c;
            this.b = cos * b - sin * d;
            this.c = sin * a + cos * c;
            this.d = sin * b + cos * d;
            this.appliedValid = false;
        }
    }
    spine.Bone = Bone;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class BoneData {
        constructor(index, name, parent) {
            this.x = 0;
            this.y = 0;
            this.rotation = 0;
            this.scaleX = 1;
            this.scaleY = 1;
            this.shearX = 0;
            this.shearY = 0;
            this.transformMode = TransformMode.Normal;
            if (index < 0)
                throw new Error("index must be >= 0.");
            if (name == null)
                throw new Error("name cannot be null.");
            this.index = index;
            this.name = name;
            this.parent = parent;
        }
    }
    spine.BoneData = BoneData;
    let TransformMode;
    (function (TransformMode) {
        TransformMode[TransformMode["Normal"] = 0] = "Normal";
        TransformMode[TransformMode["OnlyTranslation"] = 1] = "OnlyTranslation";
        TransformMode[TransformMode["NoRotationOrReflection"] = 2] = "NoRotationOrReflection";
        TransformMode[TransformMode["NoScale"] = 3] = "NoScale";
        TransformMode[TransformMode["NoScaleOrReflection"] = 4] = "NoScaleOrReflection";
    })(TransformMode = spine.TransformMode || (spine.TransformMode = {}));
})(spine || (spine = {}));
var spine;
(function (spine) {
    class Event {
        constructor(time, data) {
            if (data == null)
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
            if (data == null)
                throw new Error("data cannot be null.");
            if (skeleton == null)
                throw new Error("skeleton cannot be null.");
            this.data = data;
            this.mix = data.mix;
            this.bendDirection = data.bendDirection;
            this.compress = data.compress;
            this.stretch = data.stretch;
            this.bones = new Array();
            for (let i = 0; i < data.bones.length; i++)
                this.bones.push(skeleton.findBone(data.bones[i].name));
            this.target = skeleton.findBone(data.target.name);
        }
        getOrder() {
            return this.data.order;
        }
        apply() {
            this.update();
        }
        update() {
            let target = this.target;
            let bones = this.bones;
            switch (bones.length) {
                case 1:
                    this.apply1(bones[0], target.worldX, target.worldY, this.compress, this.stretch, this.data.uniform, this.mix);
                    break;
                case 2:
                    this.apply2(bones[0], bones[1], target.worldX, target.worldY, this.bendDirection, this.stretch, this.mix);
                    break;
            }
        }
        apply1(bone, targetX, targetY, compress, stretch, uniform, alpha) {
            if (!bone.appliedValid)
                bone.updateAppliedTransform();
            let p = bone.parent;
            let id = 1 / (p.a * p.d - p.b * p.c);
            let x = targetX - p.worldX, y = targetY - p.worldY;
            let tx = (x * p.d - y * p.b) * id - bone.ax, ty = (y * p.a - x * p.c) * id - bone.ay;
            let rotationIK = Math.atan2(ty, tx) * spine.MathUtils.radDeg - bone.ashearX - bone.arotation;
            if (bone.ascaleX < 0)
                rotationIK += 180;
            if (rotationIK > 180)
                rotationIK -= 360;
            else if (rotationIK < -180)
                rotationIK += 360;
            let sx = bone.ascaleX, sy = bone.ascaleY;
            if (compress || stretch) {
                let b = bone.data.length * sx, dd = Math.sqrt(tx * tx + ty * ty);
                if ((compress && dd < b) || (stretch && dd > b) && b > 0.0001) {
                    let s = (dd / b - 1) * alpha + 1;
                    sx *= s;
                    if (uniform)
                        sy *= s;
                }
            }
            bone.updateWorldTransformWith(bone.ax, bone.ay, bone.arotation + rotationIK * alpha, sx, sy, bone.ashearX, bone.ashearY);
        }
        apply2(parent, child, targetX, targetY, bendDir, stretch, alpha) {
            if (alpha == 0) {
                child.updateWorldTransform();
                return;
            }
            if (!parent.appliedValid)
                parent.updateAppliedTransform();
            if (!child.appliedValid)
                child.updateAppliedTransform();
            let px = parent.ax, py = parent.ay, psx = parent.ascaleX, sx = psx, psy = parent.ascaleY, csx = child.ascaleX;
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
            if (!u) {
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
            a = pp.a;
            b = pp.b;
            c = pp.c;
            d = pp.d;
            let id = 1 / (a * d - b * c), x = targetX - pp.worldX, y = targetY - pp.worldY;
            let tx = (x * d - y * b) * id - px, ty = (y * a - x * c) * id - py, dd = tx * tx + ty * ty;
            x = cwx - pp.worldX;
            y = cwy - pp.worldY;
            let dx = (x * d - y * b) * id - px, dy = (y * a - x * c) * id - py;
            let l1 = Math.sqrt(dx * dx + dy * dy), l2 = child.data.length * csx, a1 = 0, a2 = 0;
            outer: if (u) {
                l2 *= psx;
                let cos = (dd - l1 * l1 - l2 * l2) / (2 * l1 * l2);
                if (cos < -1)
                    cos = -1;
                else if (cos > 1) {
                    cos = 1;
                    if (stretch && l1 + l2 > 0.0001)
                        sx *= (Math.sqrt(dd) / (l1 + l2) - 1) * alpha + 1;
                }
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
                    q = -(c1 + q) / 2;
                    let r0 = q / c2, r1 = c / q;
                    let r = Math.abs(r0) < Math.abs(r1) ? r0 : r1;
                    if (r * r <= dd) {
                        y = Math.sqrt(dd - r * r) * bendDir;
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
                if (dd <= (minDist + maxDist) / 2) {
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
            parent.updateWorldTransformWith(px, py, rotation + a1 * alpha, sx, parent.ascaleY, 0, 0);
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
    class IkConstraintData {
        constructor(name) {
            this.order = 0;
            this.bones = new Array();
            this.bendDirection = 1;
            this.compress = false;
            this.stretch = false;
            this.uniform = false;
            this.mix = 1;
            this.name = name;
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
            this.rotateMix = 0;
            this.translateMix = 0;
            this.spaces = new Array();
            this.positions = new Array();
            this.world = new Array();
            this.curves = new Array();
            this.lengths = new Array();
            this.segments = new Array();
            if (data == null)
                throw new Error("data cannot be null.");
            if (skeleton == null)
                throw new Error("skeleton cannot be null.");
            this.data = data;
            this.bones = new Array();
            for (let i = 0, n = data.bones.length; i < n; i++)
                this.bones.push(skeleton.findBone(data.bones[i].name));
            this.target = skeleton.findSlot(data.target.name);
            this.position = data.position;
            this.spacing = data.spacing;
            this.rotateMix = data.rotateMix;
            this.translateMix = data.translateMix;
        }
        apply() {
            this.update();
        }
        update() {
            let attachment = this.target.getAttachment();
            if (!(attachment instanceof spine.PathAttachment))
                return;
            let rotateMix = this.rotateMix, translateMix = this.translateMix;
            let translate = translateMix > 0, rotate = rotateMix > 0;
            if (!translate && !rotate)
                return;
            let data = this.data;
            let percentSpacing = data.spacingMode == spine.SpacingMode.Percent;
            let rotateMode = data.rotateMode;
            let tangents = rotateMode == spine.RotateMode.Tangent, scale = rotateMode == spine.RotateMode.ChainScale;
            let boneCount = this.bones.length, spacesCount = tangents ? boneCount : boneCount + 1;
            let bones = this.bones;
            let spaces = spine.Utils.setArraySize(this.spaces, spacesCount), lengths = null;
            let spacing = this.spacing;
            if (scale || !percentSpacing) {
                if (scale)
                    lengths = spine.Utils.setArraySize(this.lengths, boneCount);
                let lengthSpacing = data.spacingMode == spine.SpacingMode.Length;
                for (let i = 0, n = spacesCount - 1; i < n;) {
                    let bone = bones[i];
                    let setupLength = bone.data.length;
                    if (setupLength < PathConstraint.epsilon) {
                        if (scale)
                            lengths[i] = 0;
                        spaces[++i] = 0;
                    }
                    else if (percentSpacing) {
                        if (scale) {
                            let x = setupLength * bone.a, y = setupLength * bone.c;
                            let length = Math.sqrt(x * x + y * y);
                            lengths[i] = length;
                        }
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
            else {
                for (let i = 1; i < spacesCount; i++)
                    spaces[i] = spacing;
            }
            let positions = this.computeWorldPositions(attachment, spacesCount, tangents, data.positionMode == spine.PositionMode.Percent, percentSpacing);
            let boneX = positions[0], boneY = positions[1], offsetRotation = data.offsetRotation;
            let tip = false;
            if (offsetRotation == 0)
                tip = rotateMode == spine.RotateMode.Chain;
            else {
                tip = false;
                let p = this.target.bone;
                offsetRotation *= p.a * p.d - p.b * p.c > 0 ? spine.MathUtils.degRad : -spine.MathUtils.degRad;
            }
            for (let i = 0, p = 3; i < boneCount; i++, p += 3) {
                let bone = bones[i];
                bone.worldX += (boneX - bone.worldX) * translateMix;
                bone.worldY += (boneY - bone.worldY) * translateMix;
                let x = positions[p], y = positions[p + 1], dx = x - boneX, dy = y - boneY;
                if (scale) {
                    let length = lengths[i];
                    if (length != 0) {
                        let s = (Math.sqrt(dx * dx + dy * dy) / length - 1) * rotateMix + 1;
                        bone.a *= s;
                        bone.c *= s;
                    }
                }
                boneX = x;
                boneY = y;
                if (rotate) {
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
                        boneX += (length * (cos * a - sin * c) - dx) * rotateMix;
                        boneY += (length * (sin * a + cos * c) - dy) * rotateMix;
                    }
                    else {
                        r += offsetRotation;
                    }
                    if (r > spine.MathUtils.PI)
                        r -= spine.MathUtils.PI2;
                    else if (r < -spine.MathUtils.PI)
                        r += spine.MathUtils.PI2;
                    r *= rotateMix;
                    cos = Math.cos(r);
                    sin = Math.sin(r);
                    bone.a = cos * a - sin * c;
                    bone.b = cos * b - sin * d;
                    bone.c = sin * a + cos * c;
                    bone.d = sin * b + cos * d;
                }
                bone.appliedValid = false;
            }
        }
        computeWorldPositions(path, spacesCount, tangents, percentPosition, percentSpacing) {
            let target = this.target;
            let position = this.position;
            let spaces = this.spaces, out = spine.Utils.setArraySize(this.positions, spacesCount * 3 + 2), world = null;
            let closed = path.closed;
            let verticesLength = path.worldVerticesLength, curveCount = verticesLength / 6, prevCurve = PathConstraint.NONE;
            if (!path.constantSpeed) {
                let lengths = path.lengths;
                curveCount -= closed ? 1 : 2;
                let pathLength = lengths[curveCount];
                if (percentPosition)
                    position *= pathLength;
                if (percentSpacing) {
                    for (let i = 1; i < spacesCount; i++)
                        spaces[i] *= pathLength;
                }
                world = spine.Utils.setArraySize(this.world, 8);
                for (let i = 0, o = 0, curve = 0; i < spacesCount; i++, o += 3) {
                    let space = spaces[i];
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
            if (percentPosition)
                position *= pathLength;
            else
                position *= pathLength / path.lengths[curveCount - 1];
            if (percentSpacing) {
                for (let i = 1; i < spacesCount; i++)
                    spaces[i] *= pathLength;
            }
            let segments = this.segments;
            let curveLength = 0;
            for (let i = 0, o = 0, curve = 0, segment = 0; i < spacesCount; i++, o += 3) {
                let space = spaces[i];
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
        getOrder() {
            return this.data.order;
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
    class PathConstraintData {
        constructor(name) {
            this.order = 0;
            this.bones = new Array();
            this.name = name;
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
    class Assets {
        constructor(clientId) {
            this.toLoad = new Array();
            this.assets = {};
            this.clientId = clientId;
        }
        loaded() {
            let i = 0;
            for (let v in this.assets)
                i++;
            return i;
        }
    }
    class SharedAssetManager {
        constructor(pathPrefix = "") {
            this.clientAssets = {};
            this.queuedAssets = {};
            this.rawAssets = {};
            this.errors = {};
            this.pathPrefix = pathPrefix;
        }
        queueAsset(clientId, textureLoader, path) {
            let clientAssets = this.clientAssets[clientId];
            if (clientAssets === null || clientAssets === undefined) {
                clientAssets = new Assets(clientId);
                this.clientAssets[clientId] = clientAssets;
            }
            if (textureLoader !== null)
                clientAssets.textureLoader = textureLoader;
            clientAssets.toLoad.push(path);
            if (this.queuedAssets[path] === path) {
                return false;
            }
            else {
                this.queuedAssets[path] = path;
                return true;
            }
        }
        loadText(clientId, path) {
            path = this.pathPrefix + path;
            if (!this.queueAsset(clientId, null, path))
                return;
            let request = new XMLHttpRequest();
            request.onreadystatechange = () => {
                if (request.readyState == XMLHttpRequest.DONE) {
                    if (request.status >= 200 && request.status < 300) {
                        this.rawAssets[path] = request.responseText;
                    }
                    else {
                        this.errors[path] = `Couldn't load text ${path}: status ${request.status}, ${request.responseText}`;
                    }
                }
            };
            request.open("GET", path, true);
            request.send();
        }
        loadJson(clientId, path) {
            path = this.pathPrefix + path;
            if (!this.queueAsset(clientId, null, path))
                return;
            let request = new XMLHttpRequest();
            request.onreadystatechange = () => {
                if (request.readyState == XMLHttpRequest.DONE) {
                    if (request.status >= 200 && request.status < 300) {
                        this.rawAssets[path] = JSON.parse(request.responseText);
                    }
                    else {
                        this.errors[path] = `Couldn't load text ${path}: status ${request.status}, ${request.responseText}`;
                    }
                }
            };
            request.open("GET", path, true);
            request.send();
        }
        loadTexture(clientId, textureLoader, path) {
            path = this.pathPrefix + path;
            if (!this.queueAsset(clientId, textureLoader, path))
                return;
            let img = new Image();
            img.src = path;
            img.crossOrigin = "anonymous";
            img.onload = (ev) => {
                this.rawAssets[path] = img;
            };
            img.onerror = (ev) => {
                this.errors[path] = `Couldn't load image ${path}`;
            };
        }
        get(clientId, path) {
            path = this.pathPrefix + path;
            let clientAssets = this.clientAssets[clientId];
            if (clientAssets === null || clientAssets === undefined)
                return true;
            return clientAssets.assets[path];
        }
        updateClientAssets(clientAssets) {
            for (let i = 0; i < clientAssets.toLoad.length; i++) {
                let path = clientAssets.toLoad[i];
                let asset = clientAssets.assets[path];
                if (asset === null || asset === undefined) {
                    let rawAsset = this.rawAssets[path];
                    if (rawAsset === null || rawAsset === undefined)
                        continue;
                    if (rawAsset instanceof HTMLImageElement) {
                        clientAssets.assets[path] = clientAssets.textureLoader(rawAsset);
                    }
                    else {
                        clientAssets.assets[path] = rawAsset;
                    }
                }
            }
        }
        isLoadingComplete(clientId) {
            let clientAssets = this.clientAssets[clientId];
            if (clientAssets === null || clientAssets === undefined)
                return true;
            this.updateClientAssets(clientAssets);
            return clientAssets.toLoad.length == clientAssets.loaded();
        }
        dispose() {
        }
        hasErrors() {
            return Object.keys(this.errors).length > 0;
        }
        getErrors() {
            return this.errors;
        }
    }
    spine.SharedAssetManager = SharedAssetManager;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class Skeleton {
        constructor(data) {
            this._updateCache = new Array();
            this.updateCacheReset = new Array();
            this.time = 0;
            this.scaleX = 1;
            this.scaleY = 1;
            this.x = 0;
            this.y = 0;
            if (data == null)
                throw new Error("data cannot be null.");
            this.data = data;
            this.bones = new Array();
            for (let i = 0; i < data.bones.length; i++) {
                let boneData = data.bones[i];
                let bone;
                if (boneData.parent == null)
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
            this.color = new spine.Color(1, 1, 1, 1);
            this.updateCache();
        }
        updateCache() {
            let updateCache = this._updateCache;
            updateCache.length = 0;
            this.updateCacheReset.length = 0;
            let bones = this.bones;
            for (let i = 0, n = bones.length; i < n; i++)
                bones[i].sorted = false;
            let ikConstraints = this.ikConstraints;
            let transformConstraints = this.transformConstraints;
            let pathConstraints = this.pathConstraints;
            let ikCount = ikConstraints.length, transformCount = transformConstraints.length, pathCount = pathConstraints.length;
            let constraintCount = ikCount + transformCount + pathCount;
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
            }
            for (let i = 0, n = bones.length; i < n; i++)
                this.sortBone(bones[i]);
        }
        sortIkConstraint(constraint) {
            let target = constraint.target;
            this.sortBone(target);
            let constrained = constraint.bones;
            let parent = constrained[0];
            this.sortBone(parent);
            if (constrained.length > 1) {
                let child = constrained[constrained.length - 1];
                if (!(this._updateCache.indexOf(child) > -1))
                    this.updateCacheReset.push(child);
            }
            this._updateCache.push(constraint);
            this.sortReset(parent.children);
            constrained[constrained.length - 1].sorted = true;
        }
        sortPathConstraint(constraint) {
            let slot = constraint.target;
            let slotIndex = slot.data.index;
            let slotBone = slot.bone;
            if (this.skin != null)
                this.sortPathConstraintAttachment(this.skin, slotIndex, slotBone);
            if (this.data.defaultSkin != null && this.data.defaultSkin != this.skin)
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
            this.sortBone(constraint.target);
            let constrained = constraint.bones;
            let boneCount = constrained.length;
            if (constraint.data.local) {
                for (let i = 0; i < boneCount; i++) {
                    let child = constrained[i];
                    this.sortBone(child.parent);
                    if (!(this._updateCache.indexOf(child) > -1))
                        this.updateCacheReset.push(child);
                }
            }
            else {
                for (let i = 0; i < boneCount; i++) {
                    this.sortBone(constrained[i]);
                }
            }
            this._updateCache.push(constraint);
            for (let ii = 0; ii < boneCount; ii++)
                this.sortReset(constrained[ii].children);
            for (let ii = 0; ii < boneCount; ii++)
                constrained[ii].sorted = true;
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
            if (pathBones == null)
                this.sortBone(slotBone);
            else {
                let bones = this.bones;
                let i = 0;
                while (i < pathBones.length) {
                    let boneCount = pathBones[i++];
                    for (let n = i + boneCount; i < n; i++) {
                        let boneIndex = pathBones[i];
                        this.sortBone(bones[boneIndex]);
                    }
                }
            }
        }
        sortBone(bone) {
            if (bone.sorted)
                return;
            let parent = bone.parent;
            if (parent != null)
                this.sortBone(parent);
            bone.sorted = true;
            this._updateCache.push(bone);
        }
        sortReset(bones) {
            for (let i = 0, n = bones.length; i < n; i++) {
                let bone = bones[i];
                if (bone.sorted)
                    this.sortReset(bone.children);
                bone.sorted = false;
            }
        }
        updateWorldTransform() {
            let updateCacheReset = this.updateCacheReset;
            for (let i = 0, n = updateCacheReset.length; i < n; i++) {
                let bone = updateCacheReset[i];
                bone.ax = bone.x;
                bone.ay = bone.y;
                bone.arotation = bone.rotation;
                bone.ascaleX = bone.scaleX;
                bone.ascaleY = bone.scaleY;
                bone.ashearX = bone.shearX;
                bone.ashearY = bone.shearY;
                bone.appliedValid = true;
            }
            let updateCache = this._updateCache;
            for (let i = 0, n = updateCache.length; i < n; i++)
                updateCache[i].update();
        }
        setToSetupPose() {
            this.setBonesToSetupPose();
            this.setSlotsToSetupPose();
        }
        setBonesToSetupPose() {
            let bones = this.bones;
            for (let i = 0, n = bones.length; i < n; i++)
                bones[i].setToSetupPose();
            let ikConstraints = this.ikConstraints;
            for (let i = 0, n = ikConstraints.length; i < n; i++) {
                let constraint = ikConstraints[i];
                constraint.mix = constraint.data.mix;
                constraint.bendDirection = constraint.data.bendDirection;
                constraint.compress = constraint.data.compress;
                constraint.stretch = constraint.data.stretch;
            }
            let transformConstraints = this.transformConstraints;
            for (let i = 0, n = transformConstraints.length; i < n; i++) {
                let constraint = transformConstraints[i];
                let data = constraint.data;
                constraint.rotateMix = data.rotateMix;
                constraint.translateMix = data.translateMix;
                constraint.scaleMix = data.scaleMix;
                constraint.shearMix = data.shearMix;
            }
            let pathConstraints = this.pathConstraints;
            for (let i = 0, n = pathConstraints.length; i < n; i++) {
                let constraint = pathConstraints[i];
                let data = constraint.data;
                constraint.position = data.position;
                constraint.spacing = data.spacing;
                constraint.rotateMix = data.rotateMix;
                constraint.translateMix = data.translateMix;
            }
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
            if (boneName == null)
                throw new Error("boneName cannot be null.");
            let bones = this.bones;
            for (let i = 0, n = bones.length; i < n; i++) {
                let bone = bones[i];
                if (bone.data.name == boneName)
                    return bone;
            }
            return null;
        }
        findBoneIndex(boneName) {
            if (boneName == null)
                throw new Error("boneName cannot be null.");
            let bones = this.bones;
            for (let i = 0, n = bones.length; i < n; i++)
                if (bones[i].data.name == boneName)
                    return i;
            return -1;
        }
        findSlot(slotName) {
            if (slotName == null)
                throw new Error("slotName cannot be null.");
            let slots = this.slots;
            for (let i = 0, n = slots.length; i < n; i++) {
                let slot = slots[i];
                if (slot.data.name == slotName)
                    return slot;
            }
            return null;
        }
        findSlotIndex(slotName) {
            if (slotName == null)
                throw new Error("slotName cannot be null.");
            let slots = this.slots;
            for (let i = 0, n = slots.length; i < n; i++)
                if (slots[i].data.name == slotName)
                    return i;
            return -1;
        }
        setSkinByName(skinName) {
            let skin = this.data.findSkin(skinName);
            if (skin == null)
                throw new Error("Skin not found: " + skinName);
            this.setSkin(skin);
        }
        setSkin(newSkin) {
            if (newSkin != null) {
                if (this.skin != null)
                    newSkin.attachAll(this, this.skin);
                else {
                    let slots = this.slots;
                    for (let i = 0, n = slots.length; i < n; i++) {
                        let slot = slots[i];
                        let name = slot.data.attachmentName;
                        if (name != null) {
                            let attachment = newSkin.getAttachment(i, name);
                            if (attachment != null)
                                slot.setAttachment(attachment);
                        }
                    }
                }
            }
            this.skin = newSkin;
        }
        getAttachmentByName(slotName, attachmentName) {
            return this.getAttachment(this.data.findSlotIndex(slotName), attachmentName);
        }
        getAttachment(slotIndex, attachmentName) {
            if (attachmentName == null)
                throw new Error("attachmentName cannot be null.");
            if (this.skin != null) {
                let attachment = this.skin.getAttachment(slotIndex, attachmentName);
                if (attachment != null)
                    return attachment;
            }
            if (this.data.defaultSkin != null)
                return this.data.defaultSkin.getAttachment(slotIndex, attachmentName);
            return null;
        }
        setAttachment(slotName, attachmentName) {
            if (slotName == null)
                throw new Error("slotName cannot be null.");
            let slots = this.slots;
            for (let i = 0, n = slots.length; i < n; i++) {
                let slot = slots[i];
                if (slot.data.name == slotName) {
                    let attachment = null;
                    if (attachmentName != null) {
                        attachment = this.getAttachment(i, attachmentName);
                        if (attachment == null)
                            throw new Error("Attachment not found: " + attachmentName + ", for slot: " + slotName);
                    }
                    slot.setAttachment(attachment);
                    return;
                }
            }
            throw new Error("Slot not found: " + slotName);
        }
        findIkConstraint(constraintName) {
            if (constraintName == null)
                throw new Error("constraintName cannot be null.");
            let ikConstraints = this.ikConstraints;
            for (let i = 0, n = ikConstraints.length; i < n; i++) {
                let ikConstraint = ikConstraints[i];
                if (ikConstraint.data.name == constraintName)
                    return ikConstraint;
            }
            return null;
        }
        findTransformConstraint(constraintName) {
            if (constraintName == null)
                throw new Error("constraintName cannot be null.");
            let transformConstraints = this.transformConstraints;
            for (let i = 0, n = transformConstraints.length; i < n; i++) {
                let constraint = transformConstraints[i];
                if (constraint.data.name == constraintName)
                    return constraint;
            }
            return null;
        }
        findPathConstraint(constraintName) {
            if (constraintName == null)
                throw new Error("constraintName cannot be null.");
            let pathConstraints = this.pathConstraints;
            for (let i = 0, n = pathConstraints.length; i < n; i++) {
                let constraint = pathConstraints[i];
                if (constraint.data.name == constraintName)
                    return constraint;
            }
            return null;
        }
        getBounds(offset, size, temp = new Array(2)) {
            if (offset == null)
                throw new Error("offset cannot be null.");
            if (size == null)
                throw new Error("size cannot be null.");
            let drawOrder = this.drawOrder;
            let minX = Number.POSITIVE_INFINITY, minY = Number.POSITIVE_INFINITY, maxX = Number.NEGATIVE_INFINITY, maxY = Number.NEGATIVE_INFINITY;
            for (let i = 0, n = drawOrder.length; i < n; i++) {
                let slot = drawOrder[i];
                let verticesLength = 0;
                let vertices = null;
                let attachment = slot.getAttachment();
                if (attachment instanceof spine.RegionAttachment) {
                    verticesLength = 8;
                    vertices = spine.Utils.setArraySize(temp, verticesLength, 0);
                    attachment.computeWorldVertices(slot.bone, vertices, 0, 2);
                }
                else if (attachment instanceof spine.MeshAttachment) {
                    let mesh = attachment;
                    verticesLength = mesh.worldVerticesLength;
                    vertices = spine.Utils.setArraySize(temp, verticesLength, 0);
                    mesh.computeWorldVertices(slot, 0, verticesLength, vertices, 0, 2);
                }
                if (vertices != null) {
                    for (let ii = 0, nn = vertices.length; ii < nn; ii += 2) {
                        let x = vertices[ii], y = vertices[ii + 1];
                        minX = Math.min(minX, x);
                        minY = Math.min(minY, y);
                        maxX = Math.max(maxX, x);
                        maxY = Math.max(maxY, y);
                    }
                }
            }
            offset.set(minX, minY);
            size.set(maxX - minX, maxY - minY);
        }
        update(delta) {
            this.time += delta;
        }
    }
    spine.Skeleton = Skeleton;
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
            if (skeleton == null)
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
            if (boundingBox == null)
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
            this.clippedTriangles = new Array();
            this.scratch = new Array();
        }
        clipStart(slot, clip) {
            if (this.clipAttachment != null)
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
            if (this.clipAttachment != null && this.clipAttachment.endSlot == slot.data)
                this.clipEnd();
        }
        clipEnd() {
            if (this.clipAttachment == null)
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
        clipTriangles(vertices, verticesLength, triangles, trianglesLength, uvs, light, dark, twoColor) {
            let clipOutput = this.clipOutput, clippedVertices = this.clippedVertices;
            let clippedTriangles = this.clippedTriangles;
            let polygons = this.clippingPolygons;
            let polygonsCount = this.clippingPolygons.length;
            let vertexSize = twoColor ? 12 : 8;
            let index = 0;
            clippedVertices.length = 0;
            clippedTriangles.length = 0;
            outer: for (let i = 0; i < trianglesLength; i += 3) {
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
                        for (let ii = 0; ii < clipOutputLength; ii += 2) {
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
                            s += vertexSize;
                        }
                        s = clippedTriangles.length;
                        let clippedTrianglesItems = spine.Utils.setArraySize(clippedTriangles, s + 3 * (clipOutputCount - 2));
                        clipOutputCount--;
                        for (let ii = 1; ii < clipOutputCount; ii++) {
                            clippedTrianglesItems[s] = index;
                            clippedTrianglesItems[s + 1] = (index + ii);
                            clippedTrianglesItems[s + 2] = (index + ii + 1);
                            s += 3;
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
                        continue outer;
                    }
                }
            }
        }
        clip(x1, y1, x2, y2, x3, y3, clippingArea, output) {
            let originalOutput = output;
            let clipped = false;
            let input = null;
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
            let clippingVertices = clippingArea;
            let clippingVerticesLast = clippingArea.length - 4;
            for (let i = 0;; i += 2) {
                let edgeX = clippingVertices[i], edgeY = clippingVertices[i + 1];
                let edgeX2 = clippingVertices[i + 2], edgeY2 = clippingVertices[i + 3];
                let deltaX = edgeX - edgeX2, deltaY = edgeY - edgeY2;
                let inputVertices = input;
                let inputVerticesLength = input.length - 2, outputStart = output.length;
                for (let ii = 0; ii < inputVerticesLength; ii += 2) {
                    let inputX = inputVertices[ii], inputY = inputVertices[ii + 1];
                    let inputX2 = inputVertices[ii + 2], inputY2 = inputVertices[ii + 3];
                    let side2 = deltaX * (inputY2 - edgeY2) - deltaY * (inputX2 - edgeX2) > 0;
                    if (deltaX * (inputY - edgeY2) - deltaY * (inputX - edgeX2) > 0) {
                        if (side2) {
                            output.push(inputX2);
                            output.push(inputY2);
                            continue;
                        }
                        let c0 = inputY2 - inputY, c2 = inputX2 - inputX;
                        let s = c0 * (edgeX2 - edgeX) - c2 * (edgeY2 - edgeY);
                        if (Math.abs(s) > 0.000001) {
                            let ua = (c2 * (edgeY - inputY) - c0 * (edgeX - inputX)) / s;
                            output.push(edgeX + (edgeX2 - edgeX) * ua);
                            output.push(edgeY + (edgeY2 - edgeY) * ua);
                        }
                        else {
                            output.push(edgeX);
                            output.push(edgeY);
                        }
                    }
                    else if (side2) {
                        let c0 = inputY2 - inputY, c2 = inputX2 - inputX;
                        let s = c0 * (edgeX2 - edgeX) - c2 * (edgeY2 - edgeY);
                        if (Math.abs(s) > 0.000001) {
                            let ua = (c2 * (edgeY - inputY) - c0 * (edgeX - inputX)) / s;
                            output.push(edgeX + (edgeX2 - edgeX) * ua);
                            output.push(edgeY + (edgeY2 - edgeY) * ua);
                        }
                        else {
                            output.push(edgeX);
                            output.push(edgeY);
                        }
                        output.push(inputX2);
                        output.push(inputY2);
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
            this.bones = new Array();
            this.slots = new Array();
            this.skins = new Array();
            this.events = new Array();
            this.animations = new Array();
            this.ikConstraints = new Array();
            this.transformConstraints = new Array();
            this.pathConstraints = new Array();
            this.fps = 0;
        }
        findBone(boneName) {
            if (boneName == null)
                throw new Error("boneName cannot be null.");
            let bones = this.bones;
            for (let i = 0, n = bones.length; i < n; i++) {
                let bone = bones[i];
                if (bone.name == boneName)
                    return bone;
            }
            return null;
        }
        findBoneIndex(boneName) {
            if (boneName == null)
                throw new Error("boneName cannot be null.");
            let bones = this.bones;
            for (let i = 0, n = bones.length; i < n; i++)
                if (bones[i].name == boneName)
                    return i;
            return -1;
        }
        findSlot(slotName) {
            if (slotName == null)
                throw new Error("slotName cannot be null.");
            let slots = this.slots;
            for (let i = 0, n = slots.length; i < n; i++) {
                let slot = slots[i];
                if (slot.name == slotName)
                    return slot;
            }
            return null;
        }
        findSlotIndex(slotName) {
            if (slotName == null)
                throw new Error("slotName cannot be null.");
            let slots = this.slots;
            for (let i = 0, n = slots.length; i < n; i++)
                if (slots[i].name == slotName)
                    return i;
            return -1;
        }
        findSkin(skinName) {
            if (skinName == null)
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
            if (eventDataName == null)
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
            if (animationName == null)
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
            if (constraintName == null)
                throw new Error("constraintName cannot be null.");
            let ikConstraints = this.ikConstraints;
            for (let i = 0, n = ikConstraints.length; i < n; i++) {
                let constraint = ikConstraints[i];
                if (constraint.name == constraintName)
                    return constraint;
            }
            return null;
        }
        findTransformConstraint(constraintName) {
            if (constraintName == null)
                throw new Error("constraintName cannot be null.");
            let transformConstraints = this.transformConstraints;
            for (let i = 0, n = transformConstraints.length; i < n; i++) {
                let constraint = transformConstraints[i];
                if (constraint.name == constraintName)
                    return constraint;
            }
            return null;
        }
        findPathConstraint(constraintName) {
            if (constraintName == null)
                throw new Error("constraintName cannot be null.");
            let pathConstraints = this.pathConstraints;
            for (let i = 0, n = pathConstraints.length; i < n; i++) {
                let constraint = pathConstraints[i];
                if (constraint.name == constraintName)
                    return constraint;
            }
            return null;
        }
        findPathConstraintIndex(pathConstraintName) {
            if (pathConstraintName == null)
                throw new Error("pathConstraintName cannot be null.");
            let pathConstraints = this.pathConstraints;
            for (let i = 0, n = pathConstraints.length; i < n; i++)
                if (pathConstraints[i].name == pathConstraintName)
                    return i;
            return -1;
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
            let scale = this.scale;
            let skeletonData = new spine.SkeletonData();
            let root = typeof (json) === "string" ? JSON.parse(json) : json;
            let skeletonMap = root.skeleton;
            if (skeletonMap != null) {
                skeletonData.hash = skeletonMap.hash;
                skeletonData.version = skeletonMap.spine;
                skeletonData.width = skeletonMap.width;
                skeletonData.height = skeletonMap.height;
                skeletonData.fps = skeletonMap.fps;
                skeletonData.imagesPath = skeletonMap.images;
            }
            if (root.bones) {
                for (let i = 0; i < root.bones.length; i++) {
                    let boneMap = root.bones[i];
                    let parent = null;
                    let parentName = this.getValue(boneMap, "parent", null);
                    if (parentName != null) {
                        parent = skeletonData.findBone(parentName);
                        if (parent == null)
                            throw new Error("Parent bone not found: " + parentName);
                    }
                    let data = new spine.BoneData(skeletonData.bones.length, boneMap.name, parent);
                    data.length = this.getValue(boneMap, "length", 0) * scale;
                    data.x = this.getValue(boneMap, "x", 0) * scale;
                    data.y = this.getValue(boneMap, "y", 0) * scale;
                    data.rotation = this.getValue(boneMap, "rotation", 0);
                    data.scaleX = this.getValue(boneMap, "scaleX", 1);
                    data.scaleY = this.getValue(boneMap, "scaleY", 1);
                    data.shearX = this.getValue(boneMap, "shearX", 0);
                    data.shearY = this.getValue(boneMap, "shearY", 0);
                    data.transformMode = SkeletonJson.transformModeFromString(this.getValue(boneMap, "transform", "normal"));
                    skeletonData.bones.push(data);
                }
            }
            if (root.slots) {
                for (let i = 0; i < root.slots.length; i++) {
                    let slotMap = root.slots[i];
                    let slotName = slotMap.name;
                    let boneName = slotMap.bone;
                    let boneData = skeletonData.findBone(boneName);
                    if (boneData == null)
                        throw new Error("Slot bone not found: " + boneName);
                    let data = new spine.SlotData(skeletonData.slots.length, slotName, boneData);
                    let color = this.getValue(slotMap, "color", null);
                    if (color != null)
                        data.color.setFromString(color);
                    let dark = this.getValue(slotMap, "dark", null);
                    if (dark != null) {
                        data.darkColor = new spine.Color(1, 1, 1, 1);
                        data.darkColor.setFromString(dark);
                    }
                    data.attachmentName = this.getValue(slotMap, "attachment", null);
                    data.blendMode = SkeletonJson.blendModeFromString(this.getValue(slotMap, "blend", "normal"));
                    skeletonData.slots.push(data);
                }
            }
            if (root.ik) {
                for (let i = 0; i < root.ik.length; i++) {
                    let constraintMap = root.ik[i];
                    let data = new spine.IkConstraintData(constraintMap.name);
                    data.order = this.getValue(constraintMap, "order", 0);
                    for (let j = 0; j < constraintMap.bones.length; j++) {
                        let boneName = constraintMap.bones[j];
                        let bone = skeletonData.findBone(boneName);
                        if (bone == null)
                            throw new Error("IK bone not found: " + boneName);
                        data.bones.push(bone);
                    }
                    let targetName = constraintMap.target;
                    data.target = skeletonData.findBone(targetName);
                    if (data.target == null)
                        throw new Error("IK target bone not found: " + targetName);
                    data.mix = this.getValue(constraintMap, "mix", 1);
                    data.bendDirection = this.getValue(constraintMap, "bendPositive", true) ? 1 : -1;
                    data.compress = this.getValue(constraintMap, "compress", false);
                    data.stretch = this.getValue(constraintMap, "stretch", false);
                    data.uniform = this.getValue(constraintMap, "uniform", false);
                    skeletonData.ikConstraints.push(data);
                }
            }
            if (root.transform) {
                for (let i = 0; i < root.transform.length; i++) {
                    let constraintMap = root.transform[i];
                    let data = new spine.TransformConstraintData(constraintMap.name);
                    data.order = this.getValue(constraintMap, "order", 0);
                    for (let j = 0; j < constraintMap.bones.length; j++) {
                        let boneName = constraintMap.bones[j];
                        let bone = skeletonData.findBone(boneName);
                        if (bone == null)
                            throw new Error("Transform constraint bone not found: " + boneName);
                        data.bones.push(bone);
                    }
                    let targetName = constraintMap.target;
                    data.target = skeletonData.findBone(targetName);
                    if (data.target == null)
                        throw new Error("Transform constraint target bone not found: " + targetName);
                    data.local = this.getValue(constraintMap, "local", false);
                    data.relative = this.getValue(constraintMap, "relative", false);
                    data.offsetRotation = this.getValue(constraintMap, "rotation", 0);
                    data.offsetX = this.getValue(constraintMap, "x", 0) * scale;
                    data.offsetY = this.getValue(constraintMap, "y", 0) * scale;
                    data.offsetScaleX = this.getValue(constraintMap, "scaleX", 0);
                    data.offsetScaleY = this.getValue(constraintMap, "scaleY", 0);
                    data.offsetShearY = this.getValue(constraintMap, "shearY", 0);
                    data.rotateMix = this.getValue(constraintMap, "rotateMix", 1);
                    data.translateMix = this.getValue(constraintMap, "translateMix", 1);
                    data.scaleMix = this.getValue(constraintMap, "scaleMix", 1);
                    data.shearMix = this.getValue(constraintMap, "shearMix", 1);
                    skeletonData.transformConstraints.push(data);
                }
            }
            if (root.path) {
                for (let i = 0; i < root.path.length; i++) {
                    let constraintMap = root.path[i];
                    let data = new spine.PathConstraintData(constraintMap.name);
                    data.order = this.getValue(constraintMap, "order", 0);
                    for (let j = 0; j < constraintMap.bones.length; j++) {
                        let boneName = constraintMap.bones[j];
                        let bone = skeletonData.findBone(boneName);
                        if (bone == null)
                            throw new Error("Transform constraint bone not found: " + boneName);
                        data.bones.push(bone);
                    }
                    let targetName = constraintMap.target;
                    data.target = skeletonData.findSlot(targetName);
                    if (data.target == null)
                        throw new Error("Path target slot not found: " + targetName);
                    data.positionMode = SkeletonJson.positionModeFromString(this.getValue(constraintMap, "positionMode", "percent"));
                    data.spacingMode = SkeletonJson.spacingModeFromString(this.getValue(constraintMap, "spacingMode", "length"));
                    data.rotateMode = SkeletonJson.rotateModeFromString(this.getValue(constraintMap, "rotateMode", "tangent"));
                    data.offsetRotation = this.getValue(constraintMap, "rotation", 0);
                    data.position = this.getValue(constraintMap, "position", 0);
                    if (data.positionMode == spine.PositionMode.Fixed)
                        data.position *= scale;
                    data.spacing = this.getValue(constraintMap, "spacing", 0);
                    if (data.spacingMode == spine.SpacingMode.Length || data.spacingMode == spine.SpacingMode.Fixed)
                        data.spacing *= scale;
                    data.rotateMix = this.getValue(constraintMap, "rotateMix", 1);
                    data.translateMix = this.getValue(constraintMap, "translateMix", 1);
                    skeletonData.pathConstraints.push(data);
                }
            }
            if (root.skins) {
                for (let skinName in root.skins) {
                    let skinMap = root.skins[skinName];
                    let skin = new spine.Skin(skinName);
                    for (let slotName in skinMap) {
                        let slotIndex = skeletonData.findSlotIndex(slotName);
                        if (slotIndex == -1)
                            throw new Error("Slot not found: " + slotName);
                        let slotMap = skinMap[slotName];
                        for (let entryName in slotMap) {
                            let attachment = this.readAttachment(slotMap[entryName], skin, slotIndex, entryName, skeletonData);
                            if (attachment != null)
                                skin.addAttachment(slotIndex, entryName, attachment);
                        }
                    }
                    skeletonData.skins.push(skin);
                    if (skin.name == "default")
                        skeletonData.defaultSkin = skin;
                }
            }
            for (let i = 0, n = this.linkedMeshes.length; i < n; i++) {
                let linkedMesh = this.linkedMeshes[i];
                let skin = linkedMesh.skin == null ? skeletonData.defaultSkin : skeletonData.findSkin(linkedMesh.skin);
                if (skin == null)
                    throw new Error("Skin not found: " + linkedMesh.skin);
                let parent = skin.getAttachment(linkedMesh.slotIndex, linkedMesh.parent);
                if (parent == null)
                    throw new Error("Parent mesh not found: " + linkedMesh.parent);
                linkedMesh.mesh.setParentMesh(parent);
                linkedMesh.mesh.updateUVs();
            }
            this.linkedMeshes.length = 0;
            if (root.events) {
                for (let eventName in root.events) {
                    let eventMap = root.events[eventName];
                    let data = new spine.EventData(eventName);
                    data.intValue = this.getValue(eventMap, "int", 0);
                    data.floatValue = this.getValue(eventMap, "float", 0);
                    data.stringValue = this.getValue(eventMap, "string", "");
                    data.audioPath = this.getValue(eventMap, "audio", null);
                    if (data.audioPath != null) {
                        data.volume = this.getValue(eventMap, "volume", 1);
                        data.balance = this.getValue(eventMap, "balance", 0);
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
            name = this.getValue(map, "name", name);
            let type = this.getValue(map, "type", "region");
            switch (type) {
                case "region": {
                    let path = this.getValue(map, "path", name);
                    let region = this.attachmentLoader.newRegionAttachment(skin, name, path);
                    if (region == null)
                        return null;
                    region.path = path;
                    region.x = this.getValue(map, "x", 0) * scale;
                    region.y = this.getValue(map, "y", 0) * scale;
                    region.scaleX = this.getValue(map, "scaleX", 1);
                    region.scaleY = this.getValue(map, "scaleY", 1);
                    region.rotation = this.getValue(map, "rotation", 0);
                    region.width = map.width * scale;
                    region.height = map.height * scale;
                    let color = this.getValue(map, "color", null);
                    if (color != null)
                        region.color.setFromString(color);
                    region.updateOffset();
                    return region;
                }
                case "boundingbox": {
                    let box = this.attachmentLoader.newBoundingBoxAttachment(skin, name);
                    if (box == null)
                        return null;
                    this.readVertices(map, box, map.vertexCount << 1);
                    let color = this.getValue(map, "color", null);
                    if (color != null)
                        box.color.setFromString(color);
                    return box;
                }
                case "mesh":
                case "linkedmesh": {
                    let path = this.getValue(map, "path", name);
                    let mesh = this.attachmentLoader.newMeshAttachment(skin, name, path);
                    if (mesh == null)
                        return null;
                    mesh.path = path;
                    let color = this.getValue(map, "color", null);
                    if (color != null)
                        mesh.color.setFromString(color);
                    let parent = this.getValue(map, "parent", null);
                    if (parent != null) {
                        mesh.inheritDeform = this.getValue(map, "deform", true);
                        this.linkedMeshes.push(new LinkedMesh(mesh, this.getValue(map, "skin", null), slotIndex, parent));
                        return mesh;
                    }
                    let uvs = map.uvs;
                    this.readVertices(map, mesh, uvs.length);
                    mesh.triangles = map.triangles;
                    mesh.regionUVs = uvs;
                    mesh.updateUVs();
                    mesh.hullLength = this.getValue(map, "hull", 0) * 2;
                    return mesh;
                }
                case "path": {
                    let path = this.attachmentLoader.newPathAttachment(skin, name);
                    if (path == null)
                        return null;
                    path.closed = this.getValue(map, "closed", false);
                    path.constantSpeed = this.getValue(map, "constantSpeed", true);
                    let vertexCount = map.vertexCount;
                    this.readVertices(map, path, vertexCount << 1);
                    let lengths = spine.Utils.newArray(vertexCount / 3, 0);
                    for (let i = 0; i < map.lengths.length; i++)
                        lengths[i] = map.lengths[i] * scale;
                    path.lengths = lengths;
                    let color = this.getValue(map, "color", null);
                    if (color != null)
                        path.color.setFromString(color);
                    return path;
                }
                case "point": {
                    let point = this.attachmentLoader.newPointAttachment(skin, name);
                    if (point == null)
                        return null;
                    point.x = this.getValue(map, "x", 0) * scale;
                    point.y = this.getValue(map, "y", 0) * scale;
                    point.rotation = this.getValue(map, "rotation", 0);
                    let color = this.getValue(map, "color", null);
                    if (color != null)
                        point.color.setFromString(color);
                    return point;
                }
                case "clipping": {
                    let clip = this.attachmentLoader.newClippingAttachment(skin, name);
                    if (clip == null)
                        return null;
                    let end = this.getValue(map, "end", null);
                    if (end != null) {
                        let slot = skeletonData.findSlot(end);
                        if (slot == null)
                            throw new Error("Clipping end slot not found: " + end);
                        clip.endSlot = slot;
                    }
                    let vertexCount = map.vertexCount;
                    this.readVertices(map, clip, vertexCount << 1);
                    let color = this.getValue(map, "color", null);
                    if (color != null)
                        clip.color.setFromString(color);
                    return clip;
                }
            }
            return null;
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
            let duration = 0;
            if (map.slots) {
                for (let slotName in map.slots) {
                    let slotMap = map.slots[slotName];
                    let slotIndex = skeletonData.findSlotIndex(slotName);
                    if (slotIndex == -1)
                        throw new Error("Slot not found: " + slotName);
                    for (let timelineName in slotMap) {
                        let timelineMap = slotMap[timelineName];
                        if (timelineName == "attachment") {
                            let timeline = new spine.AttachmentTimeline(timelineMap.length);
                            timeline.slotIndex = slotIndex;
                            let frameIndex = 0;
                            for (let i = 0; i < timelineMap.length; i++) {
                                let valueMap = timelineMap[i];
                                timeline.setFrame(frameIndex++, valueMap.time, valueMap.name);
                            }
                            timelines.push(timeline);
                            duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);
                        }
                        else if (timelineName == "color") {
                            let timeline = new spine.ColorTimeline(timelineMap.length);
                            timeline.slotIndex = slotIndex;
                            let frameIndex = 0;
                            for (let i = 0; i < timelineMap.length; i++) {
                                let valueMap = timelineMap[i];
                                let color = new spine.Color();
                                color.setFromString(valueMap.color);
                                timeline.setFrame(frameIndex, valueMap.time, color.r, color.g, color.b, color.a);
                                this.readCurve(valueMap, timeline, frameIndex);
                                frameIndex++;
                            }
                            timelines.push(timeline);
                            duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * spine.ColorTimeline.ENTRIES]);
                        }
                        else if (timelineName == "twoColor") {
                            let timeline = new spine.TwoColorTimeline(timelineMap.length);
                            timeline.slotIndex = slotIndex;
                            let frameIndex = 0;
                            for (let i = 0; i < timelineMap.length; i++) {
                                let valueMap = timelineMap[i];
                                let light = new spine.Color();
                                let dark = new spine.Color();
                                light.setFromString(valueMap.light);
                                dark.setFromString(valueMap.dark);
                                timeline.setFrame(frameIndex, valueMap.time, light.r, light.g, light.b, light.a, dark.r, dark.g, dark.b);
                                this.readCurve(valueMap, timeline, frameIndex);
                                frameIndex++;
                            }
                            timelines.push(timeline);
                            duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * spine.TwoColorTimeline.ENTRIES]);
                        }
                        else
                            throw new Error("Invalid timeline type for a slot: " + timelineName + " (" + slotName + ")");
                    }
                }
            }
            if (map.bones) {
                for (let boneName in map.bones) {
                    let boneMap = map.bones[boneName];
                    let boneIndex = skeletonData.findBoneIndex(boneName);
                    if (boneIndex == -1)
                        throw new Error("Bone not found: " + boneName);
                    for (let timelineName in boneMap) {
                        let timelineMap = boneMap[timelineName];
                        if (timelineName === "rotate") {
                            let timeline = new spine.RotateTimeline(timelineMap.length);
                            timeline.boneIndex = boneIndex;
                            let frameIndex = 0;
                            for (let i = 0; i < timelineMap.length; i++) {
                                let valueMap = timelineMap[i];
                                timeline.setFrame(frameIndex, valueMap.time, valueMap.angle);
                                this.readCurve(valueMap, timeline, frameIndex);
                                frameIndex++;
                            }
                            timelines.push(timeline);
                            duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * spine.RotateTimeline.ENTRIES]);
                        }
                        else if (timelineName === "translate" || timelineName === "scale" || timelineName === "shear") {
                            let timeline = null;
                            let timelineScale = 1;
                            if (timelineName === "scale")
                                timeline = new spine.ScaleTimeline(timelineMap.length);
                            else if (timelineName === "shear")
                                timeline = new spine.ShearTimeline(timelineMap.length);
                            else {
                                timeline = new spine.TranslateTimeline(timelineMap.length);
                                timelineScale = scale;
                            }
                            timeline.boneIndex = boneIndex;
                            let frameIndex = 0;
                            for (let i = 0; i < timelineMap.length; i++) {
                                let valueMap = timelineMap[i];
                                let x = this.getValue(valueMap, "x", 0), y = this.getValue(valueMap, "y", 0);
                                timeline.setFrame(frameIndex, valueMap.time, x * timelineScale, y * timelineScale);
                                this.readCurve(valueMap, timeline, frameIndex);
                                frameIndex++;
                            }
                            timelines.push(timeline);
                            duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * spine.TranslateTimeline.ENTRIES]);
                        }
                        else
                            throw new Error("Invalid timeline type for a bone: " + timelineName + " (" + boneName + ")");
                    }
                }
            }
            if (map.ik) {
                for (let constraintName in map.ik) {
                    let constraintMap = map.ik[constraintName];
                    let constraint = skeletonData.findIkConstraint(constraintName);
                    let timeline = new spine.IkConstraintTimeline(constraintMap.length);
                    timeline.ikConstraintIndex = skeletonData.ikConstraints.indexOf(constraint);
                    let frameIndex = 0;
                    for (let i = 0; i < constraintMap.length; i++) {
                        let valueMap = constraintMap[i];
                        timeline.setFrame(frameIndex, valueMap.time, this.getValue(valueMap, "mix", 1), this.getValue(valueMap, "bendPositive", true) ? 1 : -1, this.getValue(valueMap, "compress", false), this.getValue(valueMap, "stretch", false));
                        this.readCurve(valueMap, timeline, frameIndex);
                        frameIndex++;
                    }
                    timelines.push(timeline);
                    duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * spine.IkConstraintTimeline.ENTRIES]);
                }
            }
            if (map.transform) {
                for (let constraintName in map.transform) {
                    let constraintMap = map.transform[constraintName];
                    let constraint = skeletonData.findTransformConstraint(constraintName);
                    let timeline = new spine.TransformConstraintTimeline(constraintMap.length);
                    timeline.transformConstraintIndex = skeletonData.transformConstraints.indexOf(constraint);
                    let frameIndex = 0;
                    for (let i = 0; i < constraintMap.length; i++) {
                        let valueMap = constraintMap[i];
                        timeline.setFrame(frameIndex, valueMap.time, this.getValue(valueMap, "rotateMix", 1), this.getValue(valueMap, "translateMix", 1), this.getValue(valueMap, "scaleMix", 1), this.getValue(valueMap, "shearMix", 1));
                        this.readCurve(valueMap, timeline, frameIndex);
                        frameIndex++;
                    }
                    timelines.push(timeline);
                    duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * spine.TransformConstraintTimeline.ENTRIES]);
                }
            }
            if (map.paths) {
                for (let constraintName in map.paths) {
                    let constraintMap = map.paths[constraintName];
                    let index = skeletonData.findPathConstraintIndex(constraintName);
                    if (index == -1)
                        throw new Error("Path constraint not found: " + constraintName);
                    let data = skeletonData.pathConstraints[index];
                    for (let timelineName in constraintMap) {
                        let timelineMap = constraintMap[timelineName];
                        if (timelineName === "position" || timelineName === "spacing") {
                            let timeline = null;
                            let timelineScale = 1;
                            if (timelineName === "spacing") {
                                timeline = new spine.PathConstraintSpacingTimeline(timelineMap.length);
                                if (data.spacingMode == spine.SpacingMode.Length || data.spacingMode == spine.SpacingMode.Fixed)
                                    timelineScale = scale;
                            }
                            else {
                                timeline = new spine.PathConstraintPositionTimeline(timelineMap.length);
                                if (data.positionMode == spine.PositionMode.Fixed)
                                    timelineScale = scale;
                            }
                            timeline.pathConstraintIndex = index;
                            let frameIndex = 0;
                            for (let i = 0; i < timelineMap.length; i++) {
                                let valueMap = timelineMap[i];
                                timeline.setFrame(frameIndex, valueMap.time, this.getValue(valueMap, timelineName, 0) * timelineScale);
                                this.readCurve(valueMap, timeline, frameIndex);
                                frameIndex++;
                            }
                            timelines.push(timeline);
                            duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * spine.PathConstraintPositionTimeline.ENTRIES]);
                        }
                        else if (timelineName === "mix") {
                            let timeline = new spine.PathConstraintMixTimeline(timelineMap.length);
                            timeline.pathConstraintIndex = index;
                            let frameIndex = 0;
                            for (let i = 0; i < timelineMap.length; i++) {
                                let valueMap = timelineMap[i];
                                timeline.setFrame(frameIndex, valueMap.time, this.getValue(valueMap, "rotateMix", 1), this.getValue(valueMap, "translateMix", 1));
                                this.readCurve(valueMap, timeline, frameIndex);
                                frameIndex++;
                            }
                            timelines.push(timeline);
                            duration = Math.max(duration, timeline.frames[(timeline.getFrameCount() - 1) * spine.PathConstraintMixTimeline.ENTRIES]);
                        }
                    }
                }
            }
            if (map.deform) {
                for (let deformName in map.deform) {
                    let deformMap = map.deform[deformName];
                    let skin = skeletonData.findSkin(deformName);
                    if (skin == null)
                        throw new Error("Skin not found: " + deformName);
                    for (let slotName in deformMap) {
                        let slotMap = deformMap[slotName];
                        let slotIndex = skeletonData.findSlotIndex(slotName);
                        if (slotIndex == -1)
                            throw new Error("Slot not found: " + slotMap.name);
                        for (let timelineName in slotMap) {
                            let timelineMap = slotMap[timelineName];
                            let attachment = skin.getAttachment(slotIndex, timelineName);
                            if (attachment == null)
                                throw new Error("Deform attachment not found: " + timelineMap.name);
                            let weighted = attachment.bones != null;
                            let vertices = attachment.vertices;
                            let deformLength = weighted ? vertices.length / 3 * 2 : vertices.length;
                            let timeline = new spine.DeformTimeline(timelineMap.length);
                            timeline.slotIndex = slotIndex;
                            timeline.attachment = attachment;
                            let frameIndex = 0;
                            for (let j = 0; j < timelineMap.length; j++) {
                                let valueMap = timelineMap[j];
                                let deform;
                                let verticesValue = this.getValue(valueMap, "vertices", null);
                                if (verticesValue == null)
                                    deform = weighted ? spine.Utils.newFloatArray(deformLength) : vertices;
                                else {
                                    deform = spine.Utils.newFloatArray(deformLength);
                                    let start = this.getValue(valueMap, "offset", 0);
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
                                timeline.setFrame(frameIndex, valueMap.time, deform);
                                this.readCurve(valueMap, timeline, frameIndex);
                                frameIndex++;
                            }
                            timelines.push(timeline);
                            duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);
                        }
                    }
                }
            }
            let drawOrderNode = map.drawOrder;
            if (drawOrderNode == null)
                drawOrderNode = map.draworder;
            if (drawOrderNode != null) {
                let timeline = new spine.DrawOrderTimeline(drawOrderNode.length);
                let slotCount = skeletonData.slots.length;
                let frameIndex = 0;
                for (let j = 0; j < drawOrderNode.length; j++) {
                    let drawOrderMap = drawOrderNode[j];
                    let drawOrder = null;
                    let offsets = this.getValue(drawOrderMap, "offsets", null);
                    if (offsets != null) {
                        drawOrder = spine.Utils.newArray(slotCount, -1);
                        let unchanged = spine.Utils.newArray(slotCount - offsets.length, 0);
                        let originalIndex = 0, unchangedIndex = 0;
                        for (let i = 0; i < offsets.length; i++) {
                            let offsetMap = offsets[i];
                            let slotIndex = skeletonData.findSlotIndex(offsetMap.slot);
                            if (slotIndex == -1)
                                throw new Error("Slot not found: " + offsetMap.slot);
                            while (originalIndex != slotIndex)
                                unchanged[unchangedIndex++] = originalIndex++;
                            drawOrder[originalIndex + offsetMap.offset] = originalIndex++;
                        }
                        while (originalIndex < slotCount)
                            unchanged[unchangedIndex++] = originalIndex++;
                        for (let i = slotCount - 1; i >= 0; i--)
                            if (drawOrder[i] == -1)
                                drawOrder[i] = unchanged[--unchangedIndex];
                    }
                    timeline.setFrame(frameIndex++, drawOrderMap.time, drawOrder);
                }
                timelines.push(timeline);
                duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);
            }
            if (map.events) {
                let timeline = new spine.EventTimeline(map.events.length);
                let frameIndex = 0;
                for (let i = 0; i < map.events.length; i++) {
                    let eventMap = map.events[i];
                    let eventData = skeletonData.findEvent(eventMap.name);
                    if (eventData == null)
                        throw new Error("Event not found: " + eventMap.name);
                    let event = new spine.Event(spine.Utils.toSinglePrecision(eventMap.time), eventData);
                    event.intValue = this.getValue(eventMap, "int", eventData.intValue);
                    event.floatValue = this.getValue(eventMap, "float", eventData.floatValue);
                    event.stringValue = this.getValue(eventMap, "string", eventData.stringValue);
                    if (event.data.audioPath != null) {
                        event.volume = this.getValue(eventMap, "volume", 1);
                        event.balance = this.getValue(eventMap, "balance", 0);
                    }
                    timeline.setFrame(frameIndex++, event);
                }
                timelines.push(timeline);
                duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);
            }
            if (isNaN(duration)) {
                throw new Error("Error while parsing animation, duration is NaN");
            }
            skeletonData.animations.push(new spine.Animation(name, timelines, duration));
        }
        readCurve(map, timeline, frameIndex) {
            if (!map.curve)
                return;
            if (map.curve === "stepped")
                timeline.setStepped(frameIndex);
            else if (Object.prototype.toString.call(map.curve) === '[object Array]') {
                let curve = map.curve;
                timeline.setCurve(frameIndex, curve[0], curve[1], curve[2], curve[3]);
            }
        }
        getValue(map, prop, defaultValue) {
            return map[prop] !== undefined ? map[prop] : defaultValue;
        }
        static blendModeFromString(str) {
            str = str.toLowerCase();
            if (str == "normal")
                return spine.BlendMode.Normal;
            if (str == "additive")
                return spine.BlendMode.Additive;
            if (str == "multiply")
                return spine.BlendMode.Multiply;
            if (str == "screen")
                return spine.BlendMode.Screen;
            throw new Error(`Unknown blend mode: ${str}`);
        }
        static positionModeFromString(str) {
            str = str.toLowerCase();
            if (str == "fixed")
                return spine.PositionMode.Fixed;
            if (str == "percent")
                return spine.PositionMode.Percent;
            throw new Error(`Unknown position mode: ${str}`);
        }
        static spacingModeFromString(str) {
            str = str.toLowerCase();
            if (str == "length")
                return spine.SpacingMode.Length;
            if (str == "fixed")
                return spine.SpacingMode.Fixed;
            if (str == "percent")
                return spine.SpacingMode.Percent;
            throw new Error(`Unknown position mode: ${str}`);
        }
        static rotateModeFromString(str) {
            str = str.toLowerCase();
            if (str == "tangent")
                return spine.RotateMode.Tangent;
            if (str == "chain")
                return spine.RotateMode.Chain;
            if (str == "chainscale")
                return spine.RotateMode.ChainScale;
            throw new Error(`Unknown rotate mode: ${str}`);
        }
        static transformModeFromString(str) {
            str = str.toLowerCase();
            if (str == "normal")
                return spine.TransformMode.Normal;
            if (str == "onlytranslation")
                return spine.TransformMode.OnlyTranslation;
            if (str == "norotationorreflection")
                return spine.TransformMode.NoRotationOrReflection;
            if (str == "noscale")
                return spine.TransformMode.NoScale;
            if (str == "noscaleorreflection")
                return spine.TransformMode.NoScaleOrReflection;
            throw new Error(`Unknown transform mode: ${str}`);
        }
    }
    spine.SkeletonJson = SkeletonJson;
    class LinkedMesh {
        constructor(mesh, skin, slotIndex, parent) {
            this.mesh = mesh;
            this.skin = skin;
            this.slotIndex = slotIndex;
            this.parent = parent;
        }
    }
})(spine || (spine = {}));
var spine;
(function (spine) {
    class Skin {
        constructor(name) {
            this.attachments = new Array();
            if (name == null)
                throw new Error("name cannot be null.");
            this.name = name;
        }
        addAttachment(slotIndex, name, attachment) {
            if (attachment == null)
                throw new Error("attachment cannot be null.");
            let attachments = this.attachments;
            if (slotIndex >= attachments.length)
                attachments.length = slotIndex + 1;
            if (!attachments[slotIndex])
                attachments[slotIndex] = {};
            attachments[slotIndex][name] = attachment;
        }
        getAttachment(slotIndex, name) {
            let dictionary = this.attachments[slotIndex];
            return dictionary ? dictionary[name] : null;
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
                            if (attachment != null)
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
            this.attachmentVertices = new Array();
            if (data == null)
                throw new Error("data cannot be null.");
            if (bone == null)
                throw new Error("bone cannot be null.");
            this.data = data;
            this.bone = bone;
            this.color = new spine.Color();
            this.darkColor = data.darkColor == null ? null : new spine.Color();
            this.setToSetupPose();
        }
        getAttachment() {
            return this.attachment;
        }
        setAttachment(attachment) {
            if (this.attachment == attachment)
                return;
            this.attachment = attachment;
            this.attachmentTime = this.bone.skeleton.time;
            this.attachmentVertices.length = 0;
        }
        setAttachmentTime(time) {
            this.attachmentTime = this.bone.skeleton.time - time;
        }
        getAttachmentTime() {
            return this.bone.skeleton.time - this.attachmentTime;
        }
        setToSetupPose() {
            this.color.setFromColor(this.data.color);
            if (this.darkColor != null)
                this.darkColor.setFromColor(this.data.darkColor);
            if (this.data.attachmentName == null)
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
            this.color = new spine.Color(1, 1, 1, 1);
            if (index < 0)
                throw new Error("index must be >= 0.");
            if (name == null)
                throw new Error("name cannot be null.");
            if (boneData == null)
                throw new Error("boneData cannot be null.");
            this.index = index;
            this.name = name;
            this.boneData = boneData;
        }
    }
    spine.SlotData = SlotData;
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
        static filterFromString(text) {
            switch (text.toLowerCase()) {
                case "nearest": return TextureFilter.Nearest;
                case "linear": return TextureFilter.Linear;
                case "mipmap": return TextureFilter.MipMap;
                case "mipmapnearestnearest": return TextureFilter.MipMapNearestNearest;
                case "mipmaplinearnearest": return TextureFilter.MipMapLinearNearest;
                case "mipmapnearestlinear": return TextureFilter.MipMapNearestLinear;
                case "mipmaplinearlinear": return TextureFilter.MipMapLinearLinear;
                default: throw new Error(`Unknown texture filter ${text}`);
            }
        }
        static wrapFromString(text) {
            switch (text.toLowerCase()) {
                case "mirroredtepeat": return TextureWrap.MirroredRepeat;
                case "clamptoedge": return TextureWrap.ClampToEdge;
                case "repeat": return TextureWrap.Repeat;
                default: throw new Error(`Unknown texture wrap ${text}`);
            }
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
            this.rotate = false;
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
        constructor(atlasText, textureLoader) {
            this.pages = new Array();
            this.regions = new Array();
            this.load(atlasText, textureLoader);
        }
        load(atlasText, textureLoader) {
            if (textureLoader == null)
                throw new Error("textureLoader cannot be null.");
            let reader = new TextureAtlasReader(atlasText);
            let tuple = new Array(4);
            let page = null;
            while (true) {
                let line = reader.readLine();
                if (line == null)
                    break;
                line = line.trim();
                if (line.length == 0)
                    page = null;
                else if (!page) {
                    page = new TextureAtlasPage();
                    page.name = line;
                    if (reader.readTuple(tuple) == 2) {
                        page.width = parseInt(tuple[0]);
                        page.height = parseInt(tuple[1]);
                        reader.readTuple(tuple);
                    }
                    reader.readTuple(tuple);
                    page.minFilter = spine.Texture.filterFromString(tuple[0]);
                    page.magFilter = spine.Texture.filterFromString(tuple[1]);
                    let direction = reader.readValue();
                    page.uWrap = spine.TextureWrap.ClampToEdge;
                    page.vWrap = spine.TextureWrap.ClampToEdge;
                    if (direction == "x")
                        page.uWrap = spine.TextureWrap.Repeat;
                    else if (direction == "y")
                        page.vWrap = spine.TextureWrap.Repeat;
                    else if (direction == "xy")
                        page.uWrap = page.vWrap = spine.TextureWrap.Repeat;
                    page.texture = textureLoader(line);
                    page.texture.setFilters(page.minFilter, page.magFilter);
                    page.texture.setWraps(page.uWrap, page.vWrap);
                    page.width = page.texture.getImage().width;
                    page.height = page.texture.getImage().height;
                    this.pages.push(page);
                }
                else {
                    let region = new TextureAtlasRegion();
                    region.name = line;
                    region.page = page;
                    region.rotate = reader.readValue() == "true";
                    reader.readTuple(tuple);
                    let x = parseInt(tuple[0]);
                    let y = parseInt(tuple[1]);
                    reader.readTuple(tuple);
                    let width = parseInt(tuple[0]);
                    let height = parseInt(tuple[1]);
                    region.u = x / page.width;
                    region.v = y / page.height;
                    if (region.rotate) {
                        region.u2 = (x + height) / page.width;
                        region.v2 = (y + width) / page.height;
                    }
                    else {
                        region.u2 = (x + width) / page.width;
                        region.v2 = (y + height) / page.height;
                    }
                    region.x = x;
                    region.y = y;
                    region.width = Math.abs(width);
                    region.height = Math.abs(height);
                    if (reader.readTuple(tuple) == 4) {
                        if (reader.readTuple(tuple) == 4) {
                            reader.readTuple(tuple);
                        }
                    }
                    region.originalWidth = parseInt(tuple[0]);
                    region.originalHeight = parseInt(tuple[1]);
                    reader.readTuple(tuple);
                    region.offsetX = parseInt(tuple[0]);
                    region.offsetY = parseInt(tuple[1]);
                    region.index = parseInt(reader.readValue());
                    region.texture = page.texture;
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
        dispose() {
            for (let i = 0; i < this.pages.length; i++) {
                this.pages[i].texture.dispose();
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
        readValue() {
            let line = this.readLine();
            let colon = line.indexOf(":");
            if (colon == -1)
                throw new Error("Invalid line: " + line);
            return line.substring(colon + 1).trim();
        }
        readTuple(tuple) {
            let line = this.readLine();
            let colon = line.indexOf(":");
            if (colon == -1)
                throw new Error("Invalid line: " + line);
            let i = 0, lastMatch = colon + 1;
            for (; i < 3; i++) {
                let comma = line.indexOf(",", lastMatch);
                if (comma == -1)
                    break;
                tuple[i] = line.substr(lastMatch, comma - lastMatch).trim();
                lastMatch = comma + 1;
            }
            tuple[i] = line.substring(lastMatch).trim();
            return i + 1;
        }
    }
    class TextureAtlasPage {
    }
    spine.TextureAtlasPage = TextureAtlasPage;
    class TextureAtlasRegion extends spine.TextureRegion {
    }
    spine.TextureAtlasRegion = TextureAtlasRegion;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class TransformConstraint {
        constructor(data, skeleton) {
            this.rotateMix = 0;
            this.translateMix = 0;
            this.scaleMix = 0;
            this.shearMix = 0;
            this.temp = new spine.Vector2();
            if (data == null)
                throw new Error("data cannot be null.");
            if (skeleton == null)
                throw new Error("skeleton cannot be null.");
            this.data = data;
            this.rotateMix = data.rotateMix;
            this.translateMix = data.translateMix;
            this.scaleMix = data.scaleMix;
            this.shearMix = data.shearMix;
            this.bones = new Array();
            for (let i = 0; i < data.bones.length; i++)
                this.bones.push(skeleton.findBone(data.bones[i].name));
            this.target = skeleton.findBone(data.target.name);
        }
        apply() {
            this.update();
        }
        update() {
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
            let rotateMix = this.rotateMix, translateMix = this.translateMix, scaleMix = this.scaleMix, shearMix = this.shearMix;
            let target = this.target;
            let ta = target.a, tb = target.b, tc = target.c, td = target.d;
            let degRadReflect = ta * td - tb * tc > 0 ? spine.MathUtils.degRad : -spine.MathUtils.degRad;
            let offsetRotation = this.data.offsetRotation * degRadReflect;
            let offsetShearY = this.data.offsetShearY * degRadReflect;
            let bones = this.bones;
            for (let i = 0, n = bones.length; i < n; i++) {
                let bone = bones[i];
                let modified = false;
                if (rotateMix != 0) {
                    let a = bone.a, b = bone.b, c = bone.c, d = bone.d;
                    let r = Math.atan2(tc, ta) - Math.atan2(c, a) + offsetRotation;
                    if (r > spine.MathUtils.PI)
                        r -= spine.MathUtils.PI2;
                    else if (r < -spine.MathUtils.PI)
                        r += spine.MathUtils.PI2;
                    r *= rotateMix;
                    let cos = Math.cos(r), sin = Math.sin(r);
                    bone.a = cos * a - sin * c;
                    bone.b = cos * b - sin * d;
                    bone.c = sin * a + cos * c;
                    bone.d = sin * b + cos * d;
                    modified = true;
                }
                if (translateMix != 0) {
                    let temp = this.temp;
                    target.localToWorld(temp.set(this.data.offsetX, this.data.offsetY));
                    bone.worldX += (temp.x - bone.worldX) * translateMix;
                    bone.worldY += (temp.y - bone.worldY) * translateMix;
                    modified = true;
                }
                if (scaleMix > 0) {
                    let s = Math.sqrt(bone.a * bone.a + bone.c * bone.c);
                    let ts = Math.sqrt(ta * ta + tc * tc);
                    if (s > 0.00001)
                        s = (s + (ts - s + this.data.offsetScaleX) * scaleMix) / s;
                    bone.a *= s;
                    bone.c *= s;
                    s = Math.sqrt(bone.b * bone.b + bone.d * bone.d);
                    ts = Math.sqrt(tb * tb + td * td);
                    if (s > 0.00001)
                        s = (s + (ts - s + this.data.offsetScaleY) * scaleMix) / s;
                    bone.b *= s;
                    bone.d *= s;
                    modified = true;
                }
                if (shearMix > 0) {
                    let b = bone.b, d = bone.d;
                    let by = Math.atan2(d, b);
                    let r = Math.atan2(td, tb) - Math.atan2(tc, ta) - (by - Math.atan2(bone.c, bone.a));
                    if (r > spine.MathUtils.PI)
                        r -= spine.MathUtils.PI2;
                    else if (r < -spine.MathUtils.PI)
                        r += spine.MathUtils.PI2;
                    r = by + (r + offsetShearY) * shearMix;
                    let s = Math.sqrt(b * b + d * d);
                    bone.b = Math.cos(r) * s;
                    bone.d = Math.sin(r) * s;
                    modified = true;
                }
                if (modified)
                    bone.appliedValid = false;
            }
        }
        applyRelativeWorld() {
            let rotateMix = this.rotateMix, translateMix = this.translateMix, scaleMix = this.scaleMix, shearMix = this.shearMix;
            let target = this.target;
            let ta = target.a, tb = target.b, tc = target.c, td = target.d;
            let degRadReflect = ta * td - tb * tc > 0 ? spine.MathUtils.degRad : -spine.MathUtils.degRad;
            let offsetRotation = this.data.offsetRotation * degRadReflect, offsetShearY = this.data.offsetShearY * degRadReflect;
            let bones = this.bones;
            for (let i = 0, n = bones.length; i < n; i++) {
                let bone = bones[i];
                let modified = false;
                if (rotateMix != 0) {
                    let a = bone.a, b = bone.b, c = bone.c, d = bone.d;
                    let r = Math.atan2(tc, ta) + offsetRotation;
                    if (r > spine.MathUtils.PI)
                        r -= spine.MathUtils.PI2;
                    else if (r < -spine.MathUtils.PI)
                        r += spine.MathUtils.PI2;
                    r *= rotateMix;
                    let cos = Math.cos(r), sin = Math.sin(r);
                    bone.a = cos * a - sin * c;
                    bone.b = cos * b - sin * d;
                    bone.c = sin * a + cos * c;
                    bone.d = sin * b + cos * d;
                    modified = true;
                }
                if (translateMix != 0) {
                    let temp = this.temp;
                    target.localToWorld(temp.set(this.data.offsetX, this.data.offsetY));
                    bone.worldX += temp.x * translateMix;
                    bone.worldY += temp.y * translateMix;
                    modified = true;
                }
                if (scaleMix > 0) {
                    let s = (Math.sqrt(ta * ta + tc * tc) - 1 + this.data.offsetScaleX) * scaleMix + 1;
                    bone.a *= s;
                    bone.c *= s;
                    s = (Math.sqrt(tb * tb + td * td) - 1 + this.data.offsetScaleY) * scaleMix + 1;
                    bone.b *= s;
                    bone.d *= s;
                    modified = true;
                }
                if (shearMix > 0) {
                    let r = Math.atan2(td, tb) - Math.atan2(tc, ta);
                    if (r > spine.MathUtils.PI)
                        r -= spine.MathUtils.PI2;
                    else if (r < -spine.MathUtils.PI)
                        r += spine.MathUtils.PI2;
                    let b = bone.b, d = bone.d;
                    r = Math.atan2(d, b) + (r - spine.MathUtils.PI / 2 + offsetShearY) * shearMix;
                    let s = Math.sqrt(b * b + d * d);
                    bone.b = Math.cos(r) * s;
                    bone.d = Math.sin(r) * s;
                    modified = true;
                }
                if (modified)
                    bone.appliedValid = false;
            }
        }
        applyAbsoluteLocal() {
            let rotateMix = this.rotateMix, translateMix = this.translateMix, scaleMix = this.scaleMix, shearMix = this.shearMix;
            let target = this.target;
            if (!target.appliedValid)
                target.updateAppliedTransform();
            let bones = this.bones;
            for (let i = 0, n = bones.length; i < n; i++) {
                let bone = bones[i];
                if (!bone.appliedValid)
                    bone.updateAppliedTransform();
                let rotation = bone.arotation;
                if (rotateMix != 0) {
                    let r = target.arotation - rotation + this.data.offsetRotation;
                    r -= (16384 - ((16384.499999999996 - r / 360) | 0)) * 360;
                    rotation += r * rotateMix;
                }
                let x = bone.ax, y = bone.ay;
                if (translateMix != 0) {
                    x += (target.ax - x + this.data.offsetX) * translateMix;
                    y += (target.ay - y + this.data.offsetY) * translateMix;
                }
                let scaleX = bone.ascaleX, scaleY = bone.ascaleY;
                if (scaleMix != 0) {
                    if (scaleX > 0.00001)
                        scaleX = (scaleX + (target.ascaleX - scaleX + this.data.offsetScaleX) * scaleMix) / scaleX;
                    if (scaleY > 0.00001)
                        scaleY = (scaleY + (target.ascaleY - scaleY + this.data.offsetScaleY) * scaleMix) / scaleY;
                }
                let shearY = bone.ashearY;
                if (shearMix != 0) {
                    let r = target.ashearY - shearY + this.data.offsetShearY;
                    r -= (16384 - ((16384.499999999996 - r / 360) | 0)) * 360;
                    bone.shearY += r * shearMix;
                }
                bone.updateWorldTransformWith(x, y, rotation, scaleX, scaleY, bone.ashearX, shearY);
            }
        }
        applyRelativeLocal() {
            let rotateMix = this.rotateMix, translateMix = this.translateMix, scaleMix = this.scaleMix, shearMix = this.shearMix;
            let target = this.target;
            if (!target.appliedValid)
                target.updateAppliedTransform();
            let bones = this.bones;
            for (let i = 0, n = bones.length; i < n; i++) {
                let bone = bones[i];
                if (!bone.appliedValid)
                    bone.updateAppliedTransform();
                let rotation = bone.arotation;
                if (rotateMix != 0)
                    rotation += (target.arotation + this.data.offsetRotation) * rotateMix;
                let x = bone.ax, y = bone.ay;
                if (translateMix != 0) {
                    x += (target.ax + this.data.offsetX) * translateMix;
                    y += (target.ay + this.data.offsetY) * translateMix;
                }
                let scaleX = bone.ascaleX, scaleY = bone.ascaleY;
                if (scaleMix != 0) {
                    if (scaleX > 0.00001)
                        scaleX *= ((target.ascaleX - 1 + this.data.offsetScaleX) * scaleMix) + 1;
                    if (scaleY > 0.00001)
                        scaleY *= ((target.ascaleY - 1 + this.data.offsetScaleY) * scaleMix) + 1;
                }
                let shearY = bone.ashearY;
                if (shearMix != 0)
                    shearY += (target.ashearY + this.data.offsetShearY) * shearMix;
                bone.updateWorldTransformWith(x, y, rotation, scaleX, scaleY, bone.ashearX, shearY);
            }
        }
        getOrder() {
            return this.data.order;
        }
    }
    spine.TransformConstraint = TransformConstraint;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class TransformConstraintData {
        constructor(name) {
            this.order = 0;
            this.bones = new Array();
            this.rotateMix = 0;
            this.translateMix = 0;
            this.scaleMix = 0;
            this.shearMix = 0;
            this.offsetRotation = 0;
            this.offsetX = 0;
            this.offsetY = 0;
            this.offsetScaleX = 0;
            this.offsetScaleY = 0;
            this.offsetShearY = 0;
            this.relative = false;
            this.local = false;
            if (name == null)
                throw new Error("name cannot be null.");
            this.name = name;
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
            this.clamp();
            return this;
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
            this.r = parseInt(hex.substr(0, 2), 16) / 255.0;
            this.g = parseInt(hex.substr(2, 2), 16) / 255.0;
            this.b = parseInt(hex.substr(4, 2), 16) / 255.0;
            this.a = (hex.length != 8 ? 255 : parseInt(hex.substr(6, 2), 16)) / 255.0;
            return this;
        }
        add(r, g, b, a) {
            this.r += r;
            this.g += g;
            this.b += b;
            this.a += a;
            this.clamp();
            return this;
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
    }
    MathUtils.PI = 3.1415927;
    MathUtils.PI2 = MathUtils.PI * 2;
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
            if (Utils.SUPPORTS_TYPED_ARRAYS) {
                return new Float32Array(size);
            }
            else {
                let array = new Array(size);
                for (let i = 0; i < array.length; i++)
                    array[i] = 0;
                return array;
            }
        }
        static newShortArray(size) {
            if (Utils.SUPPORTS_TYPED_ARRAYS) {
                return new Int16Array(size);
            }
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
            for (let i = 0; i < items.length; i++) {
                if (items[i].reset)
                    items[i].reset();
                this.items[i] = items[i];
            }
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
                    for (let i = 0; i < this.values.length; i++) {
                        mean += this.values[i];
                    }
                    this.mean = mean / this.values.length;
                    this.dirty = false;
                }
                return this.mean;
            }
            else {
                return 0;
            }
        }
    }
    spine.WindowedMean = WindowedMean;
})(spine || (spine = {}));
(() => {
    if (!Math.fround) {
        Math.fround = (function (array) {
            return function (x) {
                return array[0] = x, array[0];
            };
        })(new Float32Array(1));
    }
})();
var spine;
(function (spine) {
    class Attachment {
        constructor(name) {
            if (name == null)
                throw new Error("name cannot be null.");
            this.name = name;
        }
    }
    spine.Attachment = Attachment;
    class VertexAttachment extends Attachment {
        constructor(name) {
            super(name);
            this.id = (VertexAttachment.nextID++ & 65535) << 11;
            this.worldVerticesLength = 0;
        }
        computeWorldVertices(slot, start, count, worldVertices, offset, stride) {
            count = offset + (count >> 1) * stride;
            let skeleton = slot.bone.skeleton;
            let deformArray = slot.attachmentVertices;
            let vertices = this.vertices;
            let bones = this.bones;
            if (bones == null) {
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
        applyDeform(sourceAttachment) {
            return this == sourceAttachment;
        }
    }
    VertexAttachment.nextID = 0;
    spine.VertexAttachment = VertexAttachment;
})(spine || (spine = {}));
var spine;
(function (spine) {
    let AttachmentType;
    (function (AttachmentType) {
        AttachmentType[AttachmentType["Region"] = 0] = "Region";
        AttachmentType[AttachmentType["BoundingBox"] = 1] = "BoundingBox";
        AttachmentType[AttachmentType["Mesh"] = 2] = "Mesh";
        AttachmentType[AttachmentType["LinkedMesh"] = 3] = "LinkedMesh";
        AttachmentType[AttachmentType["Path"] = 4] = "Path";
        AttachmentType[AttachmentType["Point"] = 5] = "Point";
    })(AttachmentType = spine.AttachmentType || (spine.AttachmentType = {}));
})(spine || (spine = {}));
var spine;
(function (spine) {
    class BoundingBoxAttachment extends spine.VertexAttachment {
        constructor(name) {
            super(name);
            this.color = new spine.Color(1, 1, 1, 1);
        }
    }
    spine.BoundingBoxAttachment = BoundingBoxAttachment;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class ClippingAttachment extends spine.VertexAttachment {
        constructor(name) {
            super(name);
            this.color = new spine.Color(0.2275, 0.2275, 0.8078, 1);
        }
    }
    spine.ClippingAttachment = ClippingAttachment;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class MeshAttachment extends spine.VertexAttachment {
        constructor(name) {
            super(name);
            this.color = new spine.Color(1, 1, 1, 1);
            this.inheritDeform = false;
            this.tempColor = new spine.Color(0, 0, 0, 0);
        }
        updateUVs() {
            let regionUVs = this.regionUVs;
            if (this.uvs == null || this.uvs.length != regionUVs.length)
                this.uvs = spine.Utils.newFloatArray(regionUVs.length);
            let uvs = this.uvs;
            let u = 0, v = 0, width = 0, height = 0;
            if (this.region instanceof spine.TextureAtlasRegion) {
                let region = this.region;
                let textureWidth = region.texture.getImage().width, textureHeight = region.texture.getImage().height;
                if (region.rotate) {
                    u = region.u - (region.originalHeight - region.offsetY - region.height) / textureWidth;
                    v = region.v - (region.originalWidth - region.offsetX - region.width) / textureHeight;
                    width = region.originalHeight / textureWidth;
                    height = region.originalWidth / textureHeight;
                    for (let i = 0, n = uvs.length; i < n; i += 2) {
                        uvs[i] = u + regionUVs[i + 1] * width;
                        uvs[i + 1] = v + height - regionUVs[i] * height;
                    }
                    return;
                }
                u = region.u - region.offsetX / textureWidth;
                v = region.v - (region.originalHeight - region.offsetY - region.height) / textureHeight;
                width = region.originalWidth / textureWidth;
                height = region.originalHeight / textureHeight;
            }
            else if (this.region == null) {
                u = v = 0;
                width = height = 1;
            }
            else {
                u = this.region.u;
                v = this.region.v;
                width = this.region.u2 - u;
                height = this.region.v2 - v;
            }
            for (let i = 0, n = uvs.length; i < n; i += 2) {
                uvs[i] = u + regionUVs[i] * width;
                uvs[i + 1] = v + regionUVs[i + 1] * height;
            }
        }
        applyDeform(sourceAttachment) {
            return this == sourceAttachment || (this.inheritDeform && this.parentMesh == sourceAttachment);
        }
        getParentMesh() {
            return this.parentMesh;
        }
        setParentMesh(parentMesh) {
            this.parentMesh = parentMesh;
            if (parentMesh != null) {
                this.bones = parentMesh.bones;
                this.vertices = parentMesh.vertices;
                this.worldVerticesLength = parentMesh.worldVerticesLength;
                this.regionUVs = parentMesh.regionUVs;
                this.triangles = parentMesh.triangles;
                this.hullLength = parentMesh.hullLength;
                this.worldVerticesLength = parentMesh.worldVerticesLength;
            }
        }
    }
    spine.MeshAttachment = MeshAttachment;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class PathAttachment extends spine.VertexAttachment {
        constructor(name) {
            super(name);
            this.closed = false;
            this.constantSpeed = false;
            this.color = new spine.Color(1, 1, 1, 1);
        }
    }
    spine.PathAttachment = PathAttachment;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class PointAttachment extends spine.VertexAttachment {
        constructor(name) {
            super(name);
            this.color = new spine.Color(0.38, 0.94, 0, 1);
        }
        computeWorldPosition(bone, point) {
            point.x = this.x * bone.a + this.y * bone.b + bone.worldX;
            point.y = this.x * bone.c + this.y * bone.d + bone.worldY;
            return point;
        }
        computeWorldRotation(bone) {
            let cos = spine.MathUtils.cosDeg(this.rotation), sin = spine.MathUtils.sinDeg(this.rotation);
            let x = cos * bone.a + sin * bone.b;
            let y = cos * bone.c + sin * bone.d;
            return Math.atan2(y, x) * spine.MathUtils.radDeg;
        }
    }
    spine.PointAttachment = PointAttachment;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class RegionAttachment extends spine.Attachment {
        constructor(name) {
            super(name);
            this.x = 0;
            this.y = 0;
            this.scaleX = 1;
            this.scaleY = 1;
            this.rotation = 0;
            this.width = 0;
            this.height = 0;
            this.color = new spine.Color(1, 1, 1, 1);
            this.offset = spine.Utils.newFloatArray(8);
            this.uvs = spine.Utils.newFloatArray(8);
            this.tempColor = new spine.Color(1, 1, 1, 1);
        }
        updateOffset() {
            let regionScaleX = this.width / this.region.originalWidth * this.scaleX;
            let regionScaleY = this.height / this.region.originalHeight * this.scaleY;
            let localX = -this.width / 2 * this.scaleX + this.region.offsetX * regionScaleX;
            let localY = -this.height / 2 * this.scaleY + this.region.offsetY * regionScaleY;
            let localX2 = localX + this.region.width * regionScaleX;
            let localY2 = localY + this.region.height * regionScaleY;
            let radians = this.rotation * Math.PI / 180;
            let cos = Math.cos(radians);
            let sin = Math.sin(radians);
            let localXCos = localX * cos + this.x;
            let localXSin = localX * sin;
            let localYCos = localY * cos + this.y;
            let localYSin = localY * sin;
            let localX2Cos = localX2 * cos + this.x;
            let localX2Sin = localX2 * sin;
            let localY2Cos = localY2 * cos + this.y;
            let localY2Sin = localY2 * sin;
            let offset = this.offset;
            offset[RegionAttachment.OX1] = localXCos - localYSin;
            offset[RegionAttachment.OY1] = localYCos + localXSin;
            offset[RegionAttachment.OX2] = localXCos - localY2Sin;
            offset[RegionAttachment.OY2] = localY2Cos + localXSin;
            offset[RegionAttachment.OX3] = localX2Cos - localY2Sin;
            offset[RegionAttachment.OY3] = localY2Cos + localX2Sin;
            offset[RegionAttachment.OX4] = localX2Cos - localYSin;
            offset[RegionAttachment.OY4] = localYCos + localX2Sin;
        }
        setRegion(region) {
            this.region = region;
            let uvs = this.uvs;
            if (region.rotate) {
                uvs[2] = region.u;
                uvs[3] = region.v2;
                uvs[4] = region.u;
                uvs[5] = region.v;
                uvs[6] = region.u2;
                uvs[7] = region.v;
                uvs[0] = region.u2;
                uvs[1] = region.v2;
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
        computeWorldVertices(bone, worldVertices, offset, stride) {
            let vertexOffset = this.offset;
            let x = bone.worldX, y = bone.worldY;
            let a = bone.a, b = bone.b, c = bone.c, d = bone.d;
            let offsetX = 0, offsetY = 0;
            offsetX = vertexOffset[RegionAttachment.OX1];
            offsetY = vertexOffset[RegionAttachment.OY1];
            worldVertices[offset] = offsetX * a + offsetY * b + x;
            worldVertices[offset + 1] = offsetX * c + offsetY * d + y;
            offset += stride;
            offsetX = vertexOffset[RegionAttachment.OX2];
            offsetY = vertexOffset[RegionAttachment.OY2];
            worldVertices[offset] = offsetX * a + offsetY * b + x;
            worldVertices[offset + 1] = offsetX * c + offsetY * d + y;
            offset += stride;
            offsetX = vertexOffset[RegionAttachment.OX3];
            offsetY = vertexOffset[RegionAttachment.OY3];
            worldVertices[offset] = offsetX * a + offsetY * b + x;
            worldVertices[offset + 1] = offsetX * c + offsetY * d + y;
            offset += stride;
            offsetX = vertexOffset[RegionAttachment.OX4];
            offsetY = vertexOffset[RegionAttachment.OY4];
            worldVertices[offset] = offsetX * a + offsetY * b + x;
            worldVertices[offset + 1] = offsetX * c + offsetY * d + y;
        }
    }
    RegionAttachment.OX1 = 0;
    RegionAttachment.OY1 = 1;
    RegionAttachment.OX2 = 2;
    RegionAttachment.OY2 = 3;
    RegionAttachment.OX3 = 4;
    RegionAttachment.OY3 = 5;
    RegionAttachment.OX4 = 6;
    RegionAttachment.OY4 = 7;
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
    class JitterEffect {
        constructor(jitterX, jitterY) {
            this.jitterX = 0;
            this.jitterY = 0;
            this.jitterX = jitterX;
            this.jitterY = jitterY;
        }
        begin(skeleton) {
        }
        transform(position, uv, light, dark) {
            position.x += spine.MathUtils.randomTriangular(-this.jitterX, this.jitterY);
            position.y += spine.MathUtils.randomTriangular(-this.jitterX, this.jitterY);
        }
        end() {
        }
    }
    spine.JitterEffect = JitterEffect;
})(spine || (spine = {}));
var spine;
(function (spine) {
    class SwirlEffect {
        constructor(radius) {
            this.centerX = 0;
            this.centerY = 0;
            this.radius = 0;
            this.angle = 0;
            this.worldX = 0;
            this.worldY = 0;
            this.radius = radius;
        }
        begin(skeleton) {
            this.worldX = skeleton.x + this.centerX;
            this.worldY = skeleton.y + this.centerY;
        }
        transform(position, uv, light, dark) {
            let radAngle = this.angle * spine.MathUtils.degreesToRadians;
            let x = position.x - this.worldX;
            let y = position.y - this.worldY;
            let dist = Math.sqrt(x * x + y * y);
            if (dist < this.radius) {
                let theta = SwirlEffect.interpolation.apply(0, radAngle, (this.radius - dist) / this.radius);
                let cos = Math.cos(theta);
                let sin = Math.sin(theta);
                position.x = cos * x - sin * y + this.worldX;
                position.y = sin * x + cos * y + this.worldY;
            }
        }
        end() {
        }
    }
    SwirlEffect.interpolation = new spine.PowOut(2);
    spine.SwirlEffect = SwirlEffect;
})(spine || (spine = {}));
// LayaBox_Modify
window.spine = spine;