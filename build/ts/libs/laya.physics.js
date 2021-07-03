var box2d = window.box2d = (function (exports) {
  'use strict';

  /*
  * Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  class b2BlockAllocator {
  }

  /*
  * Copyright (c) 2011 Erin Catto http://box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  /// Color for debug drawing. Each value has the range [0,1].
  class b2Color {
      constructor(r = 0.5, g = 0.5, b = 0.5, a = 1.0) {
          this.r = r;
          this.g = g;
          this.b = b;
          this.a = a;
      }
      Clone() {
          return new b2Color().Copy(this);
      }
      Copy(other) {
          this.r = other.r;
          this.g = other.g;
          this.b = other.b;
          this.a = other.a;
          return this;
      }
      IsEqual(color) {
          return (this.r === color.r) && (this.g === color.g) && (this.b === color.b) && (this.a === color.a);
      }
      IsZero() {
          return (this.r === 0) && (this.g === 0) && (this.b === 0) && (this.a === 0);
      }
      Set(r, g, b, a = this.a) {
          this.SetRGBA(r, g, b, a);
      }
      SetByteRGB(r, g, b) {
          this.r = r / 0xff;
          this.g = g / 0xff;
          this.b = b / 0xff;
          return this;
      }
      SetByteRGBA(r, g, b, a) {
          this.r = r / 0xff;
          this.g = g / 0xff;
          this.b = b / 0xff;
          this.a = a / 0xff;
          return this;
      }
      SetRGB(rr, gg, bb) {
          this.r = rr;
          this.g = gg;
          this.b = bb;
          return this;
      }
      SetRGBA(rr, gg, bb, aa) {
          this.r = rr;
          this.g = gg;
          this.b = bb;
          this.a = aa;
          return this;
      }
      SelfAdd(color) {
          this.r += color.r;
          this.g += color.g;
          this.b += color.b;
          this.a += color.a;
          return this;
      }
      Add(color, out) {
          out.r = this.r + color.r;
          out.g = this.g + color.g;
          out.b = this.b + color.b;
          out.a = this.a + color.a;
          return out;
      }
      SelfSub(color) {
          this.r -= color.r;
          this.g -= color.g;
          this.b -= color.b;
          this.a -= color.a;
          return this;
      }
      Sub(color, out) {
          out.r = this.r - color.r;
          out.g = this.g - color.g;
          out.b = this.b - color.b;
          out.a = this.a - color.a;
          return out;
      }
      SelfMul(s) {
          this.r *= s;
          this.g *= s;
          this.b *= s;
          this.a *= s;
          return this;
      }
      Mul(s, out) {
          out.r = this.r * s;
          out.g = this.g * s;
          out.b = this.b * s;
          out.a = this.a * s;
          return out;
      }
      Mix(mixColor, strength) {
          b2Color.MixColors(this, mixColor, strength);
      }
      static MixColors(colorA, colorB, strength) {
          const dr = (strength * (colorB.r - colorA.r));
          const dg = (strength * (colorB.g - colorA.g));
          const db = (strength * (colorB.b - colorA.b));
          const da = (strength * (colorB.a - colorA.a));
          colorA.r += dr;
          colorA.g += dg;
          colorA.b += db;
          colorA.a += da;
          colorB.r -= dr;
          colorB.g -= dg;
          colorB.b -= db;
          colorB.a -= da;
      }
      MakeStyleString(alpha = this.a) {
          return b2Color.MakeStyleString(this.r, this.g, this.b, alpha);
      }
      static MakeStyleString(r, g, b, a = 1.0) {
          // function clamp(x: number, lo: number, hi: number) { return x < lo ? lo : hi < x ? hi : x; }
          r *= 255; // r = clamp(r, 0, 255);
          g *= 255; // g = clamp(g, 0, 255);
          b *= 255; // b = clamp(b, 0, 255);
          // a = clamp(a, 0, 1);
          if (a < 1) {
              return `rgba(${r},${g},${b},${a})`;
          }
          else {
              return `rgb(${r},${g},${b})`;
          }
      }
  }
  b2Color.ZERO = new b2Color(0, 0, 0, 0);
  b2Color.RED = new b2Color(1, 0, 0);
  b2Color.GREEN = new b2Color(0, 1, 0);
  b2Color.BLUE = new b2Color(0, 0, 1);
  exports.b2DrawFlags = void 0;
  (function (b2DrawFlags) {
      b2DrawFlags[b2DrawFlags["e_none"] = 0] = "e_none";
      b2DrawFlags[b2DrawFlags["e_shapeBit"] = 1] = "e_shapeBit";
      b2DrawFlags[b2DrawFlags["e_jointBit"] = 2] = "e_jointBit";
      b2DrawFlags[b2DrawFlags["e_aabbBit"] = 4] = "e_aabbBit";
      b2DrawFlags[b2DrawFlags["e_pairBit"] = 8] = "e_pairBit";
      b2DrawFlags[b2DrawFlags["e_centerOfMassBit"] = 16] = "e_centerOfMassBit";
      b2DrawFlags[b2DrawFlags["e_all"] = 63] = "e_all";
  })(exports.b2DrawFlags || (exports.b2DrawFlags = {}));
  /// Implement and register this class with a b2World to provide debug drawing of physics
  /// entities in your game.
  class b2Draw {
      constructor() {
          this.m_drawFlags = 0;
      }
      SetFlags(flags) {
          this.m_drawFlags = flags;
      }
      GetFlags() {
          return this.m_drawFlags;
      }
      AppendFlags(flags) {
          this.m_drawFlags |= flags;
      }
      ClearFlags(flags) {
          this.m_drawFlags &= ~flags;
      }
  }

  /*
  * Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  // import { b2_lengthUnitsPerMeter } from "./b2_settings.js";
  function b2Assert(condition, ...args) {
      if (!condition) {
          // debugger;
          throw new Error(...args);
      }
  }
  function b2Maybe(value, def) {
      return value !== undefined ? value : def;
  }
  const b2_maxFloat = 1E+37; // FLT_MAX instead of Number.MAX_VALUE;
  const b2_epsilon = 1E-5; // FLT_EPSILON instead of Number.EPSILON;
  const b2_epsilon_sq = (b2_epsilon * b2_epsilon);
  const b2_pi = 3.14159265359; // Math.PI;
  /// @file
  /// Global tuning constants based on meters-kilograms-seconds (MKS) units.
  ///
  // Tunable Constants
  /// You can use this to change the length scale used by your game.
  /// For example for inches you could use 39.4.
  const b2_lengthUnitsPerMeter = 1.0;
  /// The maximum number of vertices on a convex polygon. You cannot increase
  /// this too much because b2BlockAllocator has a maximum object size.
  const b2_maxPolygonVertices = 8;
  // Collision
  /// The maximum number of contact points between two convex shapes. Do
  /// not change this value.
  const b2_maxManifoldPoints = 2;
  /// This is used to fatten AABBs in the dynamic tree. This allows proxies
  /// to move by a small amount without triggering a tree adjustment.
  /// This is in meters.
  const b2_aabbExtension = 0.1 * b2_lengthUnitsPerMeter;
  /// This is used to fatten AABBs in the dynamic tree. This is used to predict
  /// the future position based on the current displacement.
  /// This is a dimensionless multiplier.
  const b2_aabbMultiplier = 4;
  /// A small length used as a collision and constraint tolerance. Usually it is
  /// chosen to be numerically significant, but visually insignificant.
  const b2_linearSlop = 0.005 * b2_lengthUnitsPerMeter;
  /// A small angle used as a collision and constraint tolerance. Usually it is
  /// chosen to be numerically significant, but visually insignificant.
  const b2_angularSlop = 2 / 180 * b2_pi;
  /// The radius of the polygon/edge shape skin. This should not be modified. Making
  /// this smaller means polygons will have an insufficient buffer for continuous collision.
  /// Making it larger may create artifacts for vertex collision.
  const b2_polygonRadius = 2 * b2_linearSlop;
  /// Maximum number of sub-steps per contact in continuous physics simulation.
  const b2_maxSubSteps = 8;
  // Dynamics
  /// Maximum number of contacts to be handled to solve a TOI impact.
  const b2_maxTOIContacts = 32;
  /// The maximum linear position correction used when solving constraints. This helps to
  /// prevent overshoot.
  const b2_maxLinearCorrection = 0.2 * b2_lengthUnitsPerMeter;
  /// The maximum angular position correction used when solving constraints. This helps to
  /// prevent overshoot.
  const b2_maxAngularCorrection = 8 / 180 * b2_pi;
  /// The maximum linear velocity of a body. This limit is very large and is used
  /// to prevent numerical problems. You shouldn't need to adjust this.
  const b2_maxTranslation = 2 * b2_lengthUnitsPerMeter;
  const b2_maxTranslationSquared = b2_maxTranslation * b2_maxTranslation;
  /// The maximum angular velocity of a body. This limit is very large and is used
  /// to prevent numerical problems. You shouldn't need to adjust this.
  const b2_maxRotation = 0.5 * b2_pi;
  const b2_maxRotationSquared = b2_maxRotation * b2_maxRotation;
  /// This scale factor controls how fast overlap is resolved. Ideally this would be 1 so
  /// that overlap is removed in one time step. However using values close to 1 often lead
  /// to overshoot.
  const b2_baumgarte = 0.2;
  const b2_toiBaumgarte = 0.75;
  // Sleep
  /// The time that a body must be still before it will go to sleep.
  const b2_timeToSleep = 0.5;
  /// A body cannot sleep if its linear velocity is above this tolerance.
  const b2_linearSleepTolerance = 0.01 * b2_lengthUnitsPerMeter;
  /// A body cannot sleep if its angular velocity is above this tolerance.
  const b2_angularSleepTolerance = 2 / 180 * b2_pi;
  // FILE* b2_dumpFile = nullptr;
  // void b2OpenDump(const char* fileName)
  // {
  // 	b2Assert(b2_dumpFile == nullptr);
  // 	b2_dumpFile = fopen(fileName, "w");
  // }
  // void b2Dump(const char* string, ...)
  // {
  // 	if (b2_dumpFile == nullptr)
  // 	{
  // 		return;
  // 	}
  // 	va_list args;
  // 	va_start(args, string);
  // 	vfprintf(b2_dumpFile, string, args);
  // 	va_end(args);
  // }
  // void b2CloseDump()
  // {
  // 	fclose(b2_dumpFile);
  // 	b2_dumpFile = nullptr;
  // }
  /// Version numbering scheme.
  /// See http://en.wikipedia.org/wiki/Software_versioning
  class b2Version {
      constructor(major = 0, minor = 0, revision = 0) {
          this.major = 0; ///< significant changes
          this.minor = 0; ///< incremental changes
          this.revision = 0; ///< bug fixes
          this.major = major;
          this.minor = minor;
          this.revision = revision;
      }
      toString() {
          return this.major + "." + this.minor + "." + this.revision;
      }
  }
  /// Current version.
  const b2_version = new b2Version(2, 4, 1);
  const b2_branch = "master";
  const b2_commit = "9ebbbcd960ad424e03e5de6e66a40764c16f51bc";
  function b2ParseInt(v) {
      return parseInt(v, 10);
  }
  function b2ParseUInt(v) {
      return Math.abs(parseInt(v, 10));
  }
  function b2MakeArray(length, init) {
      const a = new Array(length);
      for (let i = 0; i < length; ++i) {
          a[i] = init(i);
      }
      return a;
  }
  function b2MakeNullArray(length) {
      const a = new Array(length);
      for (let i = 0; i < length; ++i) {
          a[i] = null;
      }
      return a;
  }
  function b2MakeNumberArray(length, init = 0) {
      const a = new Array(length);
      for (let i = 0; i < length; ++i) {
          a[i] = init;
      }
      return a;
  }

  /*
  * Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  /// @file
  /// Settings that can be overriden for your application
  ///
  // Tunable Constants
  /// You can use this to change the length scale used by your game.
  /// For example for inches you could use 39.4.
  // export const b2_lengthUnitsPerMeter: number = 1.0;
  /// The maximum number of vertices on a convex polygon. You cannot increase
  /// this too much because b2BlockAllocator has a maximum object size.
  // export const b2_maxPolygonVertices: number = 8;
  // Memory Allocation
  /// Implement this function to use your own memory allocator.
  function b2Alloc(size) {
      return null;
  }
  /// If you implement b2Alloc, you should also implement this function.
  function b2Free(mem) {
  }
  /// Logging function.
  function b2Log(message, ...args) {
      // console.log(message, ...args);
  }

  /*
  * Copyright (c) 2010 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  /// This is a growable LIFO stack with an initial capacity of N.
  /// If the stack size exceeds the initial capacity, the heap is used
  /// to increase the size of the stack.
  class b2GrowableStack {
      constructor(N) {
          this.m_stack = [];
          this.m_count = 0;
          this.m_stack = b2MakeArray(N, (index) => null);
          this.m_count = 0;
      }
      Reset() {
          this.m_count = 0;
          return this;
      }
      Push(element) {
          this.m_stack[this.m_count] = element;
          this.m_count++;
      }
      Pop() {
          // DEBUG: b2Assert(this.m_count > 0);
          this.m_count--;
          const element = this.m_stack[this.m_count];
          this.m_stack[this.m_count] = null;
          return element;
      }
      GetCount() {
          return this.m_count;
      }
  }

  /*
  * Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  const b2_pi_over_180 = b2_pi / 180;
  const b2_180_over_pi = 180 / b2_pi;
  const b2_two_pi = 2 * b2_pi;
  const b2Abs = Math.abs;
  function b2Min(a, b) { return a < b ? a : b; }
  function b2Max(a, b) { return a > b ? a : b; }
  function b2Clamp(a, lo, hi) {
      return (a < lo) ? (lo) : ((a > hi) ? (hi) : (a));
  }
  function b2Swap(a, b) {
      // DEBUG: b2Assert(false);
      const tmp = a[0];
      a[0] = b[0];
      b[0] = tmp;
  }
  /// This function is used to ensure that a floating point number is
  /// not a NaN or infinity.
  const b2IsValid = isFinite;
  function b2Sq(n) {
      return n * n;
  }
  /// This is a approximate yet fast inverse square-root.
  function b2InvSqrt(n) {
      return 1 / Math.sqrt(n);
  }
  const b2Sqrt = Math.sqrt;
  const b2Pow = Math.pow;
  function b2DegToRad(degrees) {
      return degrees * b2_pi_over_180;
  }
  function b2RadToDeg(radians) {
      return radians * b2_180_over_pi;
  }
  const b2Cos = Math.cos;
  const b2Sin = Math.sin;
  const b2Acos = Math.acos;
  const b2Asin = Math.asin;
  const b2Atan2 = Math.atan2;
  function b2NextPowerOfTwo(x) {
      x |= (x >> 1) & 0x7FFFFFFF;
      x |= (x >> 2) & 0x3FFFFFFF;
      x |= (x >> 4) & 0x0FFFFFFF;
      x |= (x >> 8) & 0x00FFFFFF;
      x |= (x >> 16) & 0x0000FFFF;
      return x + 1;
  }
  function b2IsPowerOfTwo(x) {
      return x > 0 && (x & (x - 1)) === 0;
  }
  function b2Random() {
      return Math.random() * 2 - 1;
  }
  function b2RandomRange(lo, hi) {
      return (hi - lo) * Math.random() + lo;
  }
  /// A 2D column vector.
  class b2Vec2 {
      constructor(x = 0, y = 0) {
          this.x = x;
          this.y = y;
      }
      Clone() {
          return new b2Vec2(this.x, this.y);
      }
      SetZero() {
          this.x = 0;
          this.y = 0;
          return this;
      }
      Set(x, y) {
          this.x = x;
          this.y = y;
          return this;
      }
      Copy(other) {
          this.x = other.x;
          this.y = other.y;
          return this;
      }
      SelfAdd(v) {
          this.x += v.x;
          this.y += v.y;
          return this;
      }
      SelfAddXY(x, y) {
          this.x += x;
          this.y += y;
          return this;
      }
      SelfSub(v) {
          this.x -= v.x;
          this.y -= v.y;
          return this;
      }
      SelfSubXY(x, y) {
          this.x -= x;
          this.y -= y;
          return this;
      }
      SelfMul(s) {
          this.x *= s;
          this.y *= s;
          return this;
      }
      SelfMulAdd(s, v) {
          this.x += s * v.x;
          this.y += s * v.y;
          return this;
      }
      SelfMulSub(s, v) {
          this.x -= s * v.x;
          this.y -= s * v.y;
          return this;
      }
      Dot(v) {
          return this.x * v.x + this.y * v.y;
      }
      Cross(v) {
          return this.x * v.y - this.y * v.x;
      }
      Length() {
          const x = this.x, y = this.y;
          return Math.sqrt(x * x + y * y);
      }
      LengthSquared() {
          const x = this.x, y = this.y;
          return (x * x + y * y);
      }
      Normalize() {
          const length = this.Length();
          if (length >= b2_epsilon) {
              const inv_length = 1 / length;
              this.x *= inv_length;
              this.y *= inv_length;
          }
          return length;
      }
      SelfNormalize() {
          const length = this.Length();
          if (length >= b2_epsilon) {
              const inv_length = 1 / length;
              this.x *= inv_length;
              this.y *= inv_length;
          }
          return this;
      }
      SelfRotate(radians) {
          const c = Math.cos(radians);
          const s = Math.sin(radians);
          const x = this.x;
          this.x = c * x - s * this.y;
          this.y = s * x + c * this.y;
          return this;
      }
      SelfRotateCosSin(c, s) {
          const x = this.x;
          this.x = c * x - s * this.y;
          this.y = s * x + c * this.y;
          return this;
      }
      IsValid() {
          return isFinite(this.x) && isFinite(this.y);
      }
      SelfCrossVS(s) {
          const x = this.x;
          this.x = s * this.y;
          this.y = -s * x;
          return this;
      }
      SelfCrossSV(s) {
          const x = this.x;
          this.x = -s * this.y;
          this.y = s * x;
          return this;
      }
      SelfMinV(v) {
          this.x = b2Min(this.x, v.x);
          this.y = b2Min(this.y, v.y);
          return this;
      }
      SelfMaxV(v) {
          this.x = b2Max(this.x, v.x);
          this.y = b2Max(this.y, v.y);
          return this;
      }
      SelfAbs() {
          this.x = b2Abs(this.x);
          this.y = b2Abs(this.y);
          return this;
      }
      SelfNeg() {
          this.x = (-this.x);
          this.y = (-this.y);
          return this;
      }
      SelfSkew() {
          const x = this.x;
          this.x = -this.y;
          this.y = x;
          return this;
      }
      static MakeArray(length) {
          return b2MakeArray(length, (i) => new b2Vec2());
      }
      static AbsV(v, out) {
          out.x = b2Abs(v.x);
          out.y = b2Abs(v.y);
          return out;
      }
      static MinV(a, b, out) {
          out.x = b2Min(a.x, b.x);
          out.y = b2Min(a.y, b.y);
          return out;
      }
      static MaxV(a, b, out) {
          out.x = b2Max(a.x, b.x);
          out.y = b2Max(a.y, b.y);
          return out;
      }
      static ClampV(v, lo, hi, out) {
          out.x = b2Clamp(v.x, lo.x, hi.x);
          out.y = b2Clamp(v.y, lo.y, hi.y);
          return out;
      }
      static RotateV(v, radians, out) {
          const v_x = v.x, v_y = v.y;
          const c = Math.cos(radians);
          const s = Math.sin(radians);
          out.x = c * v_x - s * v_y;
          out.y = s * v_x + c * v_y;
          return out;
      }
      static DotVV(a, b) {
          return a.x * b.x + a.y * b.y;
      }
      static CrossVV(a, b) {
          return a.x * b.y - a.y * b.x;
      }
      static CrossVS(v, s, out) {
          const v_x = v.x;
          out.x = s * v.y;
          out.y = -s * v_x;
          return out;
      }
      static CrossVOne(v, out) {
          const v_x = v.x;
          out.x = v.y;
          out.y = -v_x;
          return out;
      }
      static CrossSV(s, v, out) {
          const v_x = v.x;
          out.x = -s * v.y;
          out.y = s * v_x;
          return out;
      }
      static CrossOneV(v, out) {
          const v_x = v.x;
          out.x = -v.y;
          out.y = v_x;
          return out;
      }
      static AddVV(a, b, out) { out.x = a.x + b.x; out.y = a.y + b.y; return out; }
      static SubVV(a, b, out) { out.x = a.x - b.x; out.y = a.y - b.y; return out; }
      static MulSV(s, v, out) { out.x = v.x * s; out.y = v.y * s; return out; }
      static MulVS(v, s, out) { out.x = v.x * s; out.y = v.y * s; return out; }
      static AddVMulSV(a, s, b, out) { out.x = a.x + (s * b.x); out.y = a.y + (s * b.y); return out; }
      static SubVMulSV(a, s, b, out) { out.x = a.x - (s * b.x); out.y = a.y - (s * b.y); return out; }
      static AddVCrossSV(a, s, v, out) {
          const v_x = v.x;
          out.x = a.x - (s * v.y);
          out.y = a.y + (s * v_x);
          return out;
      }
      static MidVV(a, b, out) { out.x = (a.x + b.x) * 0.5; out.y = (a.y + b.y) * 0.5; return out; }
      static ExtVV(a, b, out) { out.x = (b.x - a.x) * 0.5; out.y = (b.y - a.y) * 0.5; return out; }
      static IsEqualToV(a, b) {
          return a.x === b.x && a.y === b.y;
      }
      static DistanceVV(a, b) {
          const c_x = a.x - b.x;
          const c_y = a.y - b.y;
          return Math.sqrt(c_x * c_x + c_y * c_y);
      }
      static DistanceSquaredVV(a, b) {
          const c_x = a.x - b.x;
          const c_y = a.y - b.y;
          return (c_x * c_x + c_y * c_y);
      }
      static NegV(v, out) { out.x = -v.x; out.y = -v.y; return out; }
  }
  b2Vec2.ZERO = new b2Vec2(0, 0);
  b2Vec2.UNITX = new b2Vec2(1, 0);
  b2Vec2.UNITY = new b2Vec2(0, 1);
  b2Vec2.s_t0 = new b2Vec2();
  b2Vec2.s_t1 = new b2Vec2();
  b2Vec2.s_t2 = new b2Vec2();
  b2Vec2.s_t3 = new b2Vec2();
  const b2Vec2_zero = new b2Vec2(0, 0);
  /// A 2D column vector with 3 elements.
  class b2Vec3 {
      constructor(...args) {
          if (args[0] instanceof Float32Array) {
              if (args[0].length !== 3) {
                  throw new Error();
              }
              this.data = args[0];
          }
          else {
              const x = typeof args[0] === "number" ? args[0] : 0;
              const y = typeof args[1] === "number" ? args[1] : 0;
              const z = typeof args[2] === "number" ? args[2] : 0;
              this.data = new Float32Array([x, y, z]);
          }
      }
      get x() { return this.data[0]; }
      set x(value) { this.data[0] = value; }
      get y() { return this.data[1]; }
      set y(value) { this.data[1] = value; }
      get z() { return this.data[2]; }
      set z(value) { this.data[2] = value; }
      Clone() {
          return new b2Vec3(this.x, this.y, this.z);
      }
      SetZero() {
          this.x = 0;
          this.y = 0;
          this.z = 0;
          return this;
      }
      SetXYZ(x, y, z) {
          this.x = x;
          this.y = y;
          this.z = z;
          return this;
      }
      Copy(other) {
          this.x = other.x;
          this.y = other.y;
          this.z = other.z;
          return this;
      }
      SelfNeg() {
          this.x = (-this.x);
          this.y = (-this.y);
          this.z = (-this.z);
          return this;
      }
      SelfAdd(v) {
          this.x += v.x;
          this.y += v.y;
          this.z += v.z;
          return this;
      }
      SelfAddXYZ(x, y, z) {
          this.x += x;
          this.y += y;
          this.z += z;
          return this;
      }
      SelfSub(v) {
          this.x -= v.x;
          this.y -= v.y;
          this.z -= v.z;
          return this;
      }
      SelfSubXYZ(x, y, z) {
          this.x -= x;
          this.y -= y;
          this.z -= z;
          return this;
      }
      SelfMul(s) {
          this.x *= s;
          this.y *= s;
          this.z *= s;
          return this;
      }
      static DotV3V3(a, b) {
          return a.x * b.x + a.y * b.y + a.z * b.z;
      }
      static CrossV3V3(a, b, out) {
          const a_x = a.x, a_y = a.y, a_z = a.z;
          const b_x = b.x, b_y = b.y, b_z = b.z;
          out.x = a_y * b_z - a_z * b_y;
          out.y = a_z * b_x - a_x * b_z;
          out.z = a_x * b_y - a_y * b_x;
          return out;
      }
  }
  b2Vec3.ZERO = new b2Vec3(0, 0, 0);
  b2Vec3.s_t0 = new b2Vec3();
  /// A 2-by-2 matrix. Stored in column-major order.
  class b2Mat22 {
      constructor() {
          // public readonly data: Float32Array = new Float32Array([ 1, 0, 0, 1 ]);
          // public readonly ex: b2Vec2 = new b2Vec2(this.data.subarray(0, 2));
          // public readonly ey: b2Vec2 = new b2Vec2(this.data.subarray(2, 4));
          this.ex = new b2Vec2(1, 0);
          this.ey = new b2Vec2(0, 1);
      }
      Clone() {
          return new b2Mat22().Copy(this);
      }
      static FromVV(c1, c2) {
          return new b2Mat22().SetVV(c1, c2);
      }
      static FromSSSS(r1c1, r1c2, r2c1, r2c2) {
          return new b2Mat22().SetSSSS(r1c1, r1c2, r2c1, r2c2);
      }
      static FromAngle(radians) {
          return new b2Mat22().SetAngle(radians);
      }
      SetSSSS(r1c1, r1c2, r2c1, r2c2) {
          this.ex.Set(r1c1, r2c1);
          this.ey.Set(r1c2, r2c2);
          return this;
      }
      SetVV(c1, c2) {
          this.ex.Copy(c1);
          this.ey.Copy(c2);
          return this;
      }
      SetAngle(radians) {
          const c = Math.cos(radians);
          const s = Math.sin(radians);
          this.ex.Set(c, s);
          this.ey.Set(-s, c);
          return this;
      }
      Copy(other) {
          this.ex.Copy(other.ex);
          this.ey.Copy(other.ey);
          return this;
      }
      SetIdentity() {
          this.ex.Set(1, 0);
          this.ey.Set(0, 1);
          return this;
      }
      SetZero() {
          this.ex.SetZero();
          this.ey.SetZero();
          return this;
      }
      GetAngle() {
          return Math.atan2(this.ex.y, this.ex.x);
      }
      GetInverse(out) {
          const a = this.ex.x;
          const b = this.ey.x;
          const c = this.ex.y;
          const d = this.ey.y;
          let det = a * d - b * c;
          if (det !== 0) {
              det = 1 / det;
          }
          out.ex.x = det * d;
          out.ey.x = (-det * b);
          out.ex.y = (-det * c);
          out.ey.y = det * a;
          return out;
      }
      Solve(b_x, b_y, out) {
          const a11 = this.ex.x, a12 = this.ey.x;
          const a21 = this.ex.y, a22 = this.ey.y;
          let det = a11 * a22 - a12 * a21;
          if (det !== 0) {
              det = 1 / det;
          }
          out.x = det * (a22 * b_x - a12 * b_y);
          out.y = det * (a11 * b_y - a21 * b_x);
          return out;
      }
      SelfAbs() {
          this.ex.SelfAbs();
          this.ey.SelfAbs();
          return this;
      }
      SelfInv() {
          this.GetInverse(this);
          return this;
      }
      SelfAddM(M) {
          this.ex.SelfAdd(M.ex);
          this.ey.SelfAdd(M.ey);
          return this;
      }
      SelfSubM(M) {
          this.ex.SelfSub(M.ex);
          this.ey.SelfSub(M.ey);
          return this;
      }
      static AbsM(M, out) {
          const M_ex = M.ex, M_ey = M.ey;
          out.ex.x = b2Abs(M_ex.x);
          out.ex.y = b2Abs(M_ex.y);
          out.ey.x = b2Abs(M_ey.x);
          out.ey.y = b2Abs(M_ey.y);
          return out;
      }
      static MulMV(M, v, out) {
          const M_ex = M.ex, M_ey = M.ey;
          const v_x = v.x, v_y = v.y;
          out.x = M_ex.x * v_x + M_ey.x * v_y;
          out.y = M_ex.y * v_x + M_ey.y * v_y;
          return out;
      }
      static MulTMV(M, v, out) {
          const M_ex = M.ex, M_ey = M.ey;
          const v_x = v.x, v_y = v.y;
          out.x = M_ex.x * v_x + M_ex.y * v_y;
          out.y = M_ey.x * v_x + M_ey.y * v_y;
          return out;
      }
      static AddMM(A, B, out) {
          const A_ex = A.ex, A_ey = A.ey;
          const B_ex = B.ex, B_ey = B.ey;
          out.ex.x = A_ex.x + B_ex.x;
          out.ex.y = A_ex.y + B_ex.y;
          out.ey.x = A_ey.x + B_ey.x;
          out.ey.y = A_ey.y + B_ey.y;
          return out;
      }
      static MulMM(A, B, out) {
          const A_ex_x = A.ex.x, A_ex_y = A.ex.y;
          const A_ey_x = A.ey.x, A_ey_y = A.ey.y;
          const B_ex_x = B.ex.x, B_ex_y = B.ex.y;
          const B_ey_x = B.ey.x, B_ey_y = B.ey.y;
          out.ex.x = A_ex_x * B_ex_x + A_ey_x * B_ex_y;
          out.ex.y = A_ex_y * B_ex_x + A_ey_y * B_ex_y;
          out.ey.x = A_ex_x * B_ey_x + A_ey_x * B_ey_y;
          out.ey.y = A_ex_y * B_ey_x + A_ey_y * B_ey_y;
          return out;
      }
      static MulTMM(A, B, out) {
          const A_ex_x = A.ex.x, A_ex_y = A.ex.y;
          const A_ey_x = A.ey.x, A_ey_y = A.ey.y;
          const B_ex_x = B.ex.x, B_ex_y = B.ex.y;
          const B_ey_x = B.ey.x, B_ey_y = B.ey.y;
          out.ex.x = A_ex_x * B_ex_x + A_ex_y * B_ex_y;
          out.ex.y = A_ey_x * B_ex_x + A_ey_y * B_ex_y;
          out.ey.x = A_ex_x * B_ey_x + A_ex_y * B_ey_y;
          out.ey.y = A_ey_x * B_ey_x + A_ey_y * B_ey_y;
          return out;
      }
  }
  b2Mat22.IDENTITY = new b2Mat22();
  /// A 3-by-3 matrix. Stored in column-major order.
  class b2Mat33 {
      constructor() {
          this.data = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
          this.ex = new b2Vec3(this.data.subarray(0, 3));
          this.ey = new b2Vec3(this.data.subarray(3, 6));
          this.ez = new b2Vec3(this.data.subarray(6, 9));
      }
      Clone() {
          return new b2Mat33().Copy(this);
      }
      SetVVV(c1, c2, c3) {
          this.ex.Copy(c1);
          this.ey.Copy(c2);
          this.ez.Copy(c3);
          return this;
      }
      Copy(other) {
          this.ex.Copy(other.ex);
          this.ey.Copy(other.ey);
          this.ez.Copy(other.ez);
          return this;
      }
      SetIdentity() {
          this.ex.SetXYZ(1, 0, 0);
          this.ey.SetXYZ(0, 1, 0);
          this.ez.SetXYZ(0, 0, 1);
          return this;
      }
      SetZero() {
          this.ex.SetZero();
          this.ey.SetZero();
          this.ez.SetZero();
          return this;
      }
      SelfAddM(M) {
          this.ex.SelfAdd(M.ex);
          this.ey.SelfAdd(M.ey);
          this.ez.SelfAdd(M.ez);
          return this;
      }
      Solve33(b_x, b_y, b_z, out) {
          const a11 = this.ex.x, a21 = this.ex.y, a31 = this.ex.z;
          const a12 = this.ey.x, a22 = this.ey.y, a32 = this.ey.z;
          const a13 = this.ez.x, a23 = this.ez.y, a33 = this.ez.z;
          let det = a11 * (a22 * a33 - a32 * a23) + a21 * (a32 * a13 - a12 * a33) + a31 * (a12 * a23 - a22 * a13);
          if (det !== 0) {
              det = 1 / det;
          }
          out.x = det * (b_x * (a22 * a33 - a32 * a23) + b_y * (a32 * a13 - a12 * a33) + b_z * (a12 * a23 - a22 * a13));
          out.y = det * (a11 * (b_y * a33 - b_z * a23) + a21 * (b_z * a13 - b_x * a33) + a31 * (b_x * a23 - b_y * a13));
          out.z = det * (a11 * (a22 * b_z - a32 * b_y) + a21 * (a32 * b_x - a12 * b_z) + a31 * (a12 * b_y - a22 * b_x));
          return out;
      }
      Solve22(b_x, b_y, out) {
          const a11 = this.ex.x, a12 = this.ey.x;
          const a21 = this.ex.y, a22 = this.ey.y;
          let det = a11 * a22 - a12 * a21;
          if (det !== 0) {
              det = 1 / det;
          }
          out.x = det * (a22 * b_x - a12 * b_y);
          out.y = det * (a11 * b_y - a21 * b_x);
          return out;
      }
      GetInverse22(M) {
          const a = this.ex.x, b = this.ey.x, c = this.ex.y, d = this.ey.y;
          let det = a * d - b * c;
          if (det !== 0) {
              det = 1 / det;
          }
          M.ex.x = det * d;
          M.ey.x = -det * b;
          M.ex.z = 0;
          M.ex.y = -det * c;
          M.ey.y = det * a;
          M.ey.z = 0;
          M.ez.x = 0;
          M.ez.y = 0;
          M.ez.z = 0;
      }
      GetSymInverse33(M) {
          let det = b2Vec3.DotV3V3(this.ex, b2Vec3.CrossV3V3(this.ey, this.ez, b2Vec3.s_t0));
          if (det !== 0) {
              det = 1 / det;
          }
          const a11 = this.ex.x, a12 = this.ey.x, a13 = this.ez.x;
          const a22 = this.ey.y, a23 = this.ez.y;
          const a33 = this.ez.z;
          M.ex.x = det * (a22 * a33 - a23 * a23);
          M.ex.y = det * (a13 * a23 - a12 * a33);
          M.ex.z = det * (a12 * a23 - a13 * a22);
          M.ey.x = M.ex.y;
          M.ey.y = det * (a11 * a33 - a13 * a13);
          M.ey.z = det * (a13 * a12 - a11 * a23);
          M.ez.x = M.ex.z;
          M.ez.y = M.ey.z;
          M.ez.z = det * (a11 * a22 - a12 * a12);
      }
      static MulM33V3(A, v, out) {
          const v_x = v.x, v_y = v.y, v_z = v.z;
          out.x = A.ex.x * v_x + A.ey.x * v_y + A.ez.x * v_z;
          out.y = A.ex.y * v_x + A.ey.y * v_y + A.ez.y * v_z;
          out.z = A.ex.z * v_x + A.ey.z * v_y + A.ez.z * v_z;
          return out;
      }
      static MulM33XYZ(A, x, y, z, out) {
          out.x = A.ex.x * x + A.ey.x * y + A.ez.x * z;
          out.y = A.ex.y * x + A.ey.y * y + A.ez.y * z;
          out.z = A.ex.z * x + A.ey.z * y + A.ez.z * z;
          return out;
      }
      static MulM33V2(A, v, out) {
          const v_x = v.x, v_y = v.y;
          out.x = A.ex.x * v_x + A.ey.x * v_y;
          out.y = A.ex.y * v_x + A.ey.y * v_y;
          return out;
      }
      static MulM33XY(A, x, y, out) {
          out.x = A.ex.x * x + A.ey.x * y;
          out.y = A.ex.y * x + A.ey.y * y;
          return out;
      }
  }
  b2Mat33.IDENTITY = new b2Mat33();
  /// Rotation
  class b2Rot {
      constructor(angle = 0) {
          this.s = 0;
          this.c = 1;
          if (angle) {
              this.s = Math.sin(angle);
              this.c = Math.cos(angle);
          }
      }
      Clone() {
          return new b2Rot().Copy(this);
      }
      Copy(other) {
          this.s = other.s;
          this.c = other.c;
          return this;
      }
      SetAngle(angle) {
          this.s = Math.sin(angle);
          this.c = Math.cos(angle);
          return this;
      }
      SetIdentity() {
          this.s = 0;
          this.c = 1;
          return this;
      }
      GetAngle() {
          return Math.atan2(this.s, this.c);
      }
      GetXAxis(out) {
          out.x = this.c;
          out.y = this.s;
          return out;
      }
      GetYAxis(out) {
          out.x = -this.s;
          out.y = this.c;
          return out;
      }
      static MulRR(q, r, out) {
          // [qc -qs] * [rc -rs] = [qc*rc-qs*rs -qc*rs-qs*rc]
          // [qs  qc]   [rs  rc]   [qs*rc+qc*rs -qs*rs+qc*rc]
          // s = qs * rc + qc * rs
          // c = qc * rc - qs * rs
          const q_c = q.c, q_s = q.s;
          const r_c = r.c, r_s = r.s;
          out.s = q_s * r_c + q_c * r_s;
          out.c = q_c * r_c - q_s * r_s;
          return out;
      }
      static MulTRR(q, r, out) {
          // [ qc qs] * [rc -rs] = [qc*rc+qs*rs -qc*rs+qs*rc]
          // [-qs qc]   [rs  rc]   [-qs*rc+qc*rs qs*rs+qc*rc]
          // s = qc * rs - qs * rc
          // c = qc * rc + qs * rs
          const q_c = q.c, q_s = q.s;
          const r_c = r.c, r_s = r.s;
          out.s = q_c * r_s - q_s * r_c;
          out.c = q_c * r_c + q_s * r_s;
          return out;
      }
      static MulRV(q, v, out) {
          const q_c = q.c, q_s = q.s;
          const v_x = v.x, v_y = v.y;
          out.x = q_c * v_x - q_s * v_y;
          out.y = q_s * v_x + q_c * v_y;
          return out;
      }
      static MulTRV(q, v, out) {
          const q_c = q.c, q_s = q.s;
          const v_x = v.x, v_y = v.y;
          out.x = q_c * v_x + q_s * v_y;
          out.y = -q_s * v_x + q_c * v_y;
          return out;
      }
  }
  b2Rot.IDENTITY = new b2Rot();
  /// A transform contains translation and rotation. It is used to represent
  /// the position and orientation of rigid frames.
  class b2Transform {
      constructor() {
          this.p = new b2Vec2();
          this.q = new b2Rot();
      }
      Clone() {
          return new b2Transform().Copy(this);
      }
      Copy(other) {
          this.p.Copy(other.p);
          this.q.Copy(other.q);
          return this;
      }
      SetIdentity() {
          this.p.SetZero();
          this.q.SetIdentity();
          return this;
      }
      SetPositionRotation(position, q) {
          this.p.Copy(position);
          this.q.Copy(q);
          return this;
      }
      SetPositionAngle(pos, a) {
          this.p.Copy(pos);
          this.q.SetAngle(a);
          return this;
      }
      SetPosition(position) {
          this.p.Copy(position);
          return this;
      }
      SetPositionXY(x, y) {
          this.p.Set(x, y);
          return this;
      }
      SetRotation(rotation) {
          this.q.Copy(rotation);
          return this;
      }
      SetRotationAngle(radians) {
          this.q.SetAngle(radians);
          return this;
      }
      GetPosition() {
          return this.p;
      }
      GetRotation() {
          return this.q;
      }
      GetRotationAngle() {
          return this.q.GetAngle();
      }
      GetAngle() {
          return this.q.GetAngle();
      }
      static MulXV(T, v, out) {
          // float32 x = (T.q.c * v.x - T.q.s * v.y) + T.p.x;
          // float32 y = (T.q.s * v.x + T.q.c * v.y) + T.p.y;
          // return b2Vec2(x, y);
          const T_q_c = T.q.c, T_q_s = T.q.s;
          const v_x = v.x, v_y = v.y;
          out.x = (T_q_c * v_x - T_q_s * v_y) + T.p.x;
          out.y = (T_q_s * v_x + T_q_c * v_y) + T.p.y;
          return out;
      }
      static MulTXV(T, v, out) {
          // float32 px = v.x - T.p.x;
          // float32 py = v.y - T.p.y;
          // float32 x = (T.q.c * px + T.q.s * py);
          // float32 y = (-T.q.s * px + T.q.c * py);
          // return b2Vec2(x, y);
          const T_q_c = T.q.c, T_q_s = T.q.s;
          const p_x = v.x - T.p.x;
          const p_y = v.y - T.p.y;
          out.x = (T_q_c * p_x + T_q_s * p_y);
          out.y = (-T_q_s * p_x + T_q_c * p_y);
          return out;
      }
      static MulXX(A, B, out) {
          b2Rot.MulRR(A.q, B.q, out.q);
          b2Vec2.AddVV(b2Rot.MulRV(A.q, B.p, out.p), A.p, out.p);
          return out;
      }
      static MulTXX(A, B, out) {
          b2Rot.MulTRR(A.q, B.q, out.q);
          b2Rot.MulTRV(A.q, b2Vec2.SubVV(B.p, A.p, out.p), out.p);
          return out;
      }
  }
  b2Transform.IDENTITY = new b2Transform();
  /// This describes the motion of a body/shape for TOI computation.
  /// Shapes are defined with respect to the body origin, which may
  /// no coincide with the center of mass. However, to support dynamics
  /// we must interpolate the center of mass position.
  class b2Sweep {
      constructor() {
          this.localCenter = new b2Vec2();
          this.c0 = new b2Vec2();
          this.c = new b2Vec2();
          this.a0 = 0;
          this.a = 0;
          this.alpha0 = 0;
      }
      Clone() {
          return new b2Sweep().Copy(this);
      }
      Copy(other) {
          this.localCenter.Copy(other.localCenter);
          this.c0.Copy(other.c0);
          this.c.Copy(other.c);
          this.a0 = other.a0;
          this.a = other.a;
          this.alpha0 = other.alpha0;
          return this;
      }
      // https://fgiesen.wordpress.com/2012/08/15/linear-interpolation-past-present-and-future/
      GetTransform(xf, beta) {
          xf.p.x = (1.0 - beta) * this.c0.x + beta * this.c.x;
          xf.p.y = (1.0 - beta) * this.c0.y + beta * this.c.y;
          const angle = (1.0 - beta) * this.a0 + beta * this.a;
          xf.q.SetAngle(angle);
          xf.p.SelfSub(b2Rot.MulRV(xf.q, this.localCenter, b2Vec2.s_t0));
          return xf;
      }
      Advance(alpha) {
          // DEBUG: b2Assert(this.alpha0 < 1);
          const beta = (alpha - this.alpha0) / (1 - this.alpha0);
          this.c0.SelfMulAdd(beta, this.c.Clone().SelfSub(this.c0));
          this.a0 += beta * (this.a - this.a0);
          this.alpha0 = alpha;
      }
      Normalize() {
          const d = b2_two_pi * Math.floor(this.a0 / b2_two_pi);
          this.a0 -= d;
          this.a -= d;
      }
  }

  /*
  * Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  class b2StackAllocator {
  }

  /*
  * Copyright (c) 2011 Erin Catto http://box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  /// Timer for profiling. This has platform specific code and may
  /// not work on every platform.
  class b2Timer {
      constructor() {
          this.m_start = Date.now();
      }
      /// Reset the timer.
      Reset() {
          this.m_start = Date.now();
          return this;
      }
      /// Get the time since construction or the last reset.
      GetMilliseconds() {
          return Date.now() - this.m_start;
      }
  }
  class b2Counter {
      constructor() {
          this.m_count = 0;
          this.m_min_count = 0;
          this.m_max_count = 0;
      }
      GetCount() {
          return this.m_count;
      }
      GetMinCount() {
          return this.m_min_count;
      }
      GetMaxCount() {
          return this.m_max_count;
      }
      ResetCount() {
          const count = this.m_count;
          this.m_count = 0;
          return count;
      }
      ResetMinCount() {
          this.m_min_count = 0;
      }
      ResetMaxCount() {
          this.m_max_count = 0;
      }
      Increment() {
          this.m_count++;
          if (this.m_max_count < this.m_count) {
              this.m_max_count = this.m_count;
          }
      }
      Decrement() {
          this.m_count--;
          if (this.m_min_count > this.m_count) {
              this.m_min_count = this.m_count;
          }
      }
  }

  /*
  * Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  /// This holds the mass data computed for a shape.
  class b2MassData {
      constructor() {
          /// The mass of the shape, usually in kilograms.
          this.mass = 0;
          /// The position of the shape's centroid relative to the shape's origin.
          this.center = new b2Vec2(0, 0);
          /// The rotational inertia of the shape about the local origin.
          this.I = 0;
      }
  }
  exports.b2ShapeType = void 0;
  (function (b2ShapeType) {
      b2ShapeType[b2ShapeType["e_unknown"] = -1] = "e_unknown";
      b2ShapeType[b2ShapeType["e_circleShape"] = 0] = "e_circleShape";
      b2ShapeType[b2ShapeType["e_edgeShape"] = 1] = "e_edgeShape";
      b2ShapeType[b2ShapeType["e_polygonShape"] = 2] = "e_polygonShape";
      b2ShapeType[b2ShapeType["e_chainShape"] = 3] = "e_chainShape";
      b2ShapeType[b2ShapeType["e_shapeTypeCount"] = 4] = "e_shapeTypeCount";
  })(exports.b2ShapeType || (exports.b2ShapeType = {}));
  /// A shape is used for collision detection. You can create a shape however you like.
  /// Shapes used for simulation in b2World are created automatically when a b2Fixture
  /// is created. Shapes may encapsulate a one or more child shapes.
  class b2Shape {
      constructor(type, radius) {
          this.m_type = exports.b2ShapeType.e_unknown;
          /// Radius of a shape. For polygonal shapes this must be b2_polygonRadius. There is no support for
          /// making rounded polygons.
          this.m_radius = 0;
          this.m_type = type;
          this.m_radius = radius;
      }
      Copy(other) {
          // DEBUG: b2Assert(this.m_type === other.m_type);
          this.m_radius = other.m_radius;
          return this;
      }
      /// Get the type of this shape. You can use this to down cast to the concrete shape.
      /// @return the shape type.
      GetType() {
          return this.m_type;
      }
  }

  /*
  * Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  /// A distance proxy is used by the GJK algorithm.
  /// It encapsulates any shape.
  class b2DistanceProxy {
      constructor() {
          this.m_buffer = b2Vec2.MakeArray(2);
          this.m_vertices = this.m_buffer;
          this.m_count = 0;
          this.m_radius = 0;
      }
      Copy(other) {
          if (other.m_vertices === other.m_buffer) {
              this.m_vertices = this.m_buffer;
              this.m_buffer[0].Copy(other.m_buffer[0]);
              this.m_buffer[1].Copy(other.m_buffer[1]);
          }
          else {
              this.m_vertices = other.m_vertices;
          }
          this.m_count = other.m_count;
          this.m_radius = other.m_radius;
          return this;
      }
      Reset() {
          this.m_vertices = this.m_buffer;
          this.m_count = 0;
          this.m_radius = 0;
          return this;
      }
      SetShape(shape, index) {
          shape.SetupDistanceProxy(this, index);
      }
      SetVerticesRadius(vertices, count, radius) {
          this.m_vertices = vertices;
          this.m_count = count;
          this.m_radius = radius;
      }
      Set(...args) {
          if (args[0] instanceof b2Shape) {
              this.SetShape(args[0], args[1]);
          }
          else {
              this.SetVerticesRadius(args[0], args[1], args[2]);
          }
      }
      GetSupport(d) {
          let bestIndex = 0;
          let bestValue = b2Vec2.DotVV(this.m_vertices[0], d);
          for (let i = 1; i < this.m_count; ++i) {
              const value = b2Vec2.DotVV(this.m_vertices[i], d);
              if (value > bestValue) {
                  bestIndex = i;
                  bestValue = value;
              }
          }
          return bestIndex;
      }
      GetSupportVertex(d) {
          let bestIndex = 0;
          let bestValue = b2Vec2.DotVV(this.m_vertices[0], d);
          for (let i = 1; i < this.m_count; ++i) {
              const value = b2Vec2.DotVV(this.m_vertices[i], d);
              if (value > bestValue) {
                  bestIndex = i;
                  bestValue = value;
              }
          }
          return this.m_vertices[bestIndex];
      }
      GetVertexCount() {
          return this.m_count;
      }
      GetVertex(index) {
          // DEBUG: b2Assert(0 <= index && index < this.m_count);
          return this.m_vertices[index];
      }
  }
  class b2SimplexCache {
      constructor() {
          this.metric = 0;
          this.count = 0;
          this.indexA = [0, 0, 0];
          this.indexB = [0, 0, 0];
      }
      Reset() {
          this.metric = 0;
          this.count = 0;
          return this;
      }
  }
  class b2DistanceInput {
      constructor() {
          this.proxyA = new b2DistanceProxy();
          this.proxyB = new b2DistanceProxy();
          this.transformA = new b2Transform();
          this.transformB = new b2Transform();
          this.useRadii = false;
      }
      Reset() {
          this.proxyA.Reset();
          this.proxyB.Reset();
          this.transformA.SetIdentity();
          this.transformB.SetIdentity();
          this.useRadii = false;
          return this;
      }
  }
  class b2DistanceOutput {
      constructor() {
          this.pointA = new b2Vec2();
          this.pointB = new b2Vec2();
          this.distance = 0;
          this.iterations = 0; ///< number of GJK iterations used
      }
      Reset() {
          this.pointA.SetZero();
          this.pointB.SetZero();
          this.distance = 0;
          this.iterations = 0;
          return this;
      }
  }
  /// Input parameters for b2ShapeCast
  class b2ShapeCastInput {
      constructor() {
          this.proxyA = new b2DistanceProxy();
          this.proxyB = new b2DistanceProxy();
          this.transformA = new b2Transform();
          this.transformB = new b2Transform();
          this.translationB = new b2Vec2();
      }
  }
  /// Output results for b2ShapeCast
  class b2ShapeCastOutput {
      constructor() {
          this.point = new b2Vec2();
          this.normal = new b2Vec2();
          this.lambda = 0.0;
          this.iterations = 0;
      }
  }
  exports.b2_gjkCalls = 0;
  exports.b2_gjkIters = 0;
  exports.b2_gjkMaxIters = 0;
  function b2_gjk_reset() {
      exports.b2_gjkCalls = 0;
      exports.b2_gjkIters = 0;
      exports.b2_gjkMaxIters = 0;
  }
  class b2SimplexVertex {
      constructor() {
          this.wA = new b2Vec2(); // support point in proxyA
          this.wB = new b2Vec2(); // support point in proxyB
          this.w = new b2Vec2(); // wB - wA
          this.a = 0; // barycentric coordinate for closest point
          this.indexA = 0; // wA index
          this.indexB = 0; // wB index
      }
      Copy(other) {
          this.wA.Copy(other.wA); // support point in proxyA
          this.wB.Copy(other.wB); // support point in proxyB
          this.w.Copy(other.w); // wB - wA
          this.a = other.a; // barycentric coordinate for closest point
          this.indexA = other.indexA; // wA index
          this.indexB = other.indexB; // wB index
          return this;
      }
  }
  class b2Simplex {
      constructor() {
          this.m_v1 = new b2SimplexVertex();
          this.m_v2 = new b2SimplexVertex();
          this.m_v3 = new b2SimplexVertex();
          this.m_vertices = [ /*3*/];
          this.m_count = 0;
          this.m_vertices[0] = this.m_v1;
          this.m_vertices[1] = this.m_v2;
          this.m_vertices[2] = this.m_v3;
      }
      ReadCache(cache, proxyA, transformA, proxyB, transformB) {
          // DEBUG: b2Assert(0 <= cache.count && cache.count <= 3);
          // Copy data from cache.
          this.m_count = cache.count;
          const vertices = this.m_vertices;
          for (let i = 0; i < this.m_count; ++i) {
              const v = vertices[i];
              v.indexA = cache.indexA[i];
              v.indexB = cache.indexB[i];
              const wALocal = proxyA.GetVertex(v.indexA);
              const wBLocal = proxyB.GetVertex(v.indexB);
              b2Transform.MulXV(transformA, wALocal, v.wA);
              b2Transform.MulXV(transformB, wBLocal, v.wB);
              b2Vec2.SubVV(v.wB, v.wA, v.w);
              v.a = 0;
          }
          // Compute the new simplex metric, if it is substantially different than
          // old metric then flush the simplex.
          if (this.m_count > 1) {
              const metric1 = cache.metric;
              const metric2 = this.GetMetric();
              if (metric2 < 0.5 * metric1 || 2 * metric1 < metric2 || metric2 < b2_epsilon) {
                  // Reset the simplex.
                  this.m_count = 0;
              }
          }
          // If the cache is empty or invalid ...
          if (this.m_count === 0) {
              const v = vertices[0];
              v.indexA = 0;
              v.indexB = 0;
              const wALocal = proxyA.GetVertex(0);
              const wBLocal = proxyB.GetVertex(0);
              b2Transform.MulXV(transformA, wALocal, v.wA);
              b2Transform.MulXV(transformB, wBLocal, v.wB);
              b2Vec2.SubVV(v.wB, v.wA, v.w);
              v.a = 1;
              this.m_count = 1;
          }
      }
      WriteCache(cache) {
          cache.metric = this.GetMetric();
          cache.count = this.m_count;
          const vertices = this.m_vertices;
          for (let i = 0; i < this.m_count; ++i) {
              cache.indexA[i] = vertices[i].indexA;
              cache.indexB[i] = vertices[i].indexB;
          }
      }
      GetSearchDirection(out) {
          switch (this.m_count) {
              case 1:
                  return b2Vec2.NegV(this.m_v1.w, out);
              case 2: {
                  const e12 = b2Vec2.SubVV(this.m_v2.w, this.m_v1.w, out);
                  const sgn = b2Vec2.CrossVV(e12, b2Vec2.NegV(this.m_v1.w, b2Vec2.s_t0));
                  if (sgn > 0) {
                      // Origin is left of e12.
                      return b2Vec2.CrossOneV(e12, out);
                  }
                  else {
                      // Origin is right of e12.
                      return b2Vec2.CrossVOne(e12, out);
                  }
              }
              default:
                  // DEBUG: b2Assert(false);
                  return out.SetZero();
          }
      }
      GetClosestPoint(out) {
          switch (this.m_count) {
              case 0:
                  // DEBUG: b2Assert(false);
                  return out.SetZero();
              case 1:
                  return out.Copy(this.m_v1.w);
              case 2:
                  return out.Set(this.m_v1.a * this.m_v1.w.x + this.m_v2.a * this.m_v2.w.x, this.m_v1.a * this.m_v1.w.y + this.m_v2.a * this.m_v2.w.y);
              case 3:
                  return out.SetZero();
              default:
                  // DEBUG: b2Assert(false);
                  return out.SetZero();
          }
      }
      GetWitnessPoints(pA, pB) {
          switch (this.m_count) {
              case 0:
                  // DEBUG: b2Assert(false);
                  break;
              case 1:
                  pA.Copy(this.m_v1.wA);
                  pB.Copy(this.m_v1.wB);
                  break;
              case 2:
                  pA.x = this.m_v1.a * this.m_v1.wA.x + this.m_v2.a * this.m_v2.wA.x;
                  pA.y = this.m_v1.a * this.m_v1.wA.y + this.m_v2.a * this.m_v2.wA.y;
                  pB.x = this.m_v1.a * this.m_v1.wB.x + this.m_v2.a * this.m_v2.wB.x;
                  pB.y = this.m_v1.a * this.m_v1.wB.y + this.m_v2.a * this.m_v2.wB.y;
                  break;
              case 3:
                  pB.x = pA.x = this.m_v1.a * this.m_v1.wA.x + this.m_v2.a * this.m_v2.wA.x + this.m_v3.a * this.m_v3.wA.x;
                  pB.y = pA.y = this.m_v1.a * this.m_v1.wA.y + this.m_v2.a * this.m_v2.wA.y + this.m_v3.a * this.m_v3.wA.y;
                  break;
          }
      }
      GetMetric() {
          switch (this.m_count) {
              case 0:
                  // DEBUG: b2Assert(false);
                  return 0;
              case 1:
                  return 0;
              case 2:
                  return b2Vec2.DistanceVV(this.m_v1.w, this.m_v2.w);
              case 3:
                  return b2Vec2.CrossVV(b2Vec2.SubVV(this.m_v2.w, this.m_v1.w, b2Vec2.s_t0), b2Vec2.SubVV(this.m_v3.w, this.m_v1.w, b2Vec2.s_t1));
              default:
                  // DEBUG: b2Assert(false);
                  return 0;
          }
      }
      Solve2() {
          const w1 = this.m_v1.w;
          const w2 = this.m_v2.w;
          const e12 = b2Vec2.SubVV(w2, w1, b2Simplex.s_e12);
          // w1 region
          const d12_2 = (-b2Vec2.DotVV(w1, e12));
          if (d12_2 <= 0) {
              // a2 <= 0, so we clamp it to 0
              this.m_v1.a = 1;
              this.m_count = 1;
              return;
          }
          // w2 region
          const d12_1 = b2Vec2.DotVV(w2, e12);
          if (d12_1 <= 0) {
              // a1 <= 0, so we clamp it to 0
              this.m_v2.a = 1;
              this.m_count = 1;
              this.m_v1.Copy(this.m_v2);
              return;
          }
          // Must be in e12 region.
          const inv_d12 = 1 / (d12_1 + d12_2);
          this.m_v1.a = d12_1 * inv_d12;
          this.m_v2.a = d12_2 * inv_d12;
          this.m_count = 2;
      }
      Solve3() {
          const w1 = this.m_v1.w;
          const w2 = this.m_v2.w;
          const w3 = this.m_v3.w;
          // Edge12
          // [1      1     ][a1] = [1]
          // [w1.e12 w2.e12][a2] = [0]
          // a3 = 0
          const e12 = b2Vec2.SubVV(w2, w1, b2Simplex.s_e12);
          const w1e12 = b2Vec2.DotVV(w1, e12);
          const w2e12 = b2Vec2.DotVV(w2, e12);
          const d12_1 = w2e12;
          const d12_2 = (-w1e12);
          // Edge13
          // [1      1     ][a1] = [1]
          // [w1.e13 w3.e13][a3] = [0]
          // a2 = 0
          const e13 = b2Vec2.SubVV(w3, w1, b2Simplex.s_e13);
          const w1e13 = b2Vec2.DotVV(w1, e13);
          const w3e13 = b2Vec2.DotVV(w3, e13);
          const d13_1 = w3e13;
          const d13_2 = (-w1e13);
          // Edge23
          // [1      1     ][a2] = [1]
          // [w2.e23 w3.e23][a3] = [0]
          // a1 = 0
          const e23 = b2Vec2.SubVV(w3, w2, b2Simplex.s_e23);
          const w2e23 = b2Vec2.DotVV(w2, e23);
          const w3e23 = b2Vec2.DotVV(w3, e23);
          const d23_1 = w3e23;
          const d23_2 = (-w2e23);
          // Triangle123
          const n123 = b2Vec2.CrossVV(e12, e13);
          const d123_1 = n123 * b2Vec2.CrossVV(w2, w3);
          const d123_2 = n123 * b2Vec2.CrossVV(w3, w1);
          const d123_3 = n123 * b2Vec2.CrossVV(w1, w2);
          // w1 region
          if (d12_2 <= 0 && d13_2 <= 0) {
              this.m_v1.a = 1;
              this.m_count = 1;
              return;
          }
          // e12
          if (d12_1 > 0 && d12_2 > 0 && d123_3 <= 0) {
              const inv_d12 = 1 / (d12_1 + d12_2);
              this.m_v1.a = d12_1 * inv_d12;
              this.m_v2.a = d12_2 * inv_d12;
              this.m_count = 2;
              return;
          }
          // e13
          if (d13_1 > 0 && d13_2 > 0 && d123_2 <= 0) {
              const inv_d13 = 1 / (d13_1 + d13_2);
              this.m_v1.a = d13_1 * inv_d13;
              this.m_v3.a = d13_2 * inv_d13;
              this.m_count = 2;
              this.m_v2.Copy(this.m_v3);
              return;
          }
          // w2 region
          if (d12_1 <= 0 && d23_2 <= 0) {
              this.m_v2.a = 1;
              this.m_count = 1;
              this.m_v1.Copy(this.m_v2);
              return;
          }
          // w3 region
          if (d13_1 <= 0 && d23_1 <= 0) {
              this.m_v3.a = 1;
              this.m_count = 1;
              this.m_v1.Copy(this.m_v3);
              return;
          }
          // e23
          if (d23_1 > 0 && d23_2 > 0 && d123_1 <= 0) {
              const inv_d23 = 1 / (d23_1 + d23_2);
              this.m_v2.a = d23_1 * inv_d23;
              this.m_v3.a = d23_2 * inv_d23;
              this.m_count = 2;
              this.m_v1.Copy(this.m_v3);
              return;
          }
          // Must be in triangle123
          const inv_d123 = 1 / (d123_1 + d123_2 + d123_3);
          this.m_v1.a = d123_1 * inv_d123;
          this.m_v2.a = d123_2 * inv_d123;
          this.m_v3.a = d123_3 * inv_d123;
          this.m_count = 3;
      }
  }
  b2Simplex.s_e12 = new b2Vec2();
  b2Simplex.s_e13 = new b2Vec2();
  b2Simplex.s_e23 = new b2Vec2();
  const b2Distance_s_simplex = new b2Simplex();
  const b2Distance_s_saveA = [0, 0, 0];
  const b2Distance_s_saveB = [0, 0, 0];
  const b2Distance_s_p = new b2Vec2();
  const b2Distance_s_d = new b2Vec2();
  const b2Distance_s_normal = new b2Vec2();
  const b2Distance_s_supportA = new b2Vec2();
  const b2Distance_s_supportB = new b2Vec2();
  function b2Distance(output, cache, input) {
      ++exports.b2_gjkCalls;
      const proxyA = input.proxyA;
      const proxyB = input.proxyB;
      const transformA = input.transformA;
      const transformB = input.transformB;
      // Initialize the simplex.
      const simplex = b2Distance_s_simplex;
      simplex.ReadCache(cache, proxyA, transformA, proxyB, transformB);
      // Get simplex vertices as an array.
      const vertices = simplex.m_vertices;
      const k_maxIters = 20;
      // These store the vertices of the last simplex so that we
      // can check for duplicates and prevent cycling.
      const saveA = b2Distance_s_saveA;
      const saveB = b2Distance_s_saveB;
      let saveCount = 0;
      // Main iteration loop.
      let iter = 0;
      while (iter < k_maxIters) {
          // Copy simplex so we can identify duplicates.
          saveCount = simplex.m_count;
          for (let i = 0; i < saveCount; ++i) {
              saveA[i] = vertices[i].indexA;
              saveB[i] = vertices[i].indexB;
          }
          switch (simplex.m_count) {
              case 1:
                  break;
              case 2:
                  simplex.Solve2();
                  break;
              case 3:
                  simplex.Solve3();
                  break;
          }
          // If we have 3 points, then the origin is in the corresponding triangle.
          if (simplex.m_count === 3) {
              break;
          }
          // Get search direction.
          const d = simplex.GetSearchDirection(b2Distance_s_d);
          // Ensure the search direction is numerically fit.
          if (d.LengthSquared() < b2_epsilon_sq) {
              // The origin is probably contained by a line segment
              // or triangle. Thus the shapes are overlapped.
              // We can't return zero here even though there may be overlap.
              // In case the simplex is a point, segment, or triangle it is difficult
              // to determine if the origin is contained in the CSO or very close to it.
              break;
          }
          // Compute a tentative new simplex vertex using support points.
          const vertex = vertices[simplex.m_count];
          vertex.indexA = proxyA.GetSupport(b2Rot.MulTRV(transformA.q, b2Vec2.NegV(d, b2Vec2.s_t0), b2Distance_s_supportA));
          b2Transform.MulXV(transformA, proxyA.GetVertex(vertex.indexA), vertex.wA);
          vertex.indexB = proxyB.GetSupport(b2Rot.MulTRV(transformB.q, d, b2Distance_s_supportB));
          b2Transform.MulXV(transformB, proxyB.GetVertex(vertex.indexB), vertex.wB);
          b2Vec2.SubVV(vertex.wB, vertex.wA, vertex.w);
          // Iteration count is equated to the number of support point calls.
          ++iter;
          ++exports.b2_gjkIters;
          // Check for duplicate support points. This is the main termination criteria.
          let duplicate = false;
          for (let i = 0; i < saveCount; ++i) {
              if (vertex.indexA === saveA[i] && vertex.indexB === saveB[i]) {
                  duplicate = true;
                  break;
              }
          }
          // If we found a duplicate support point we must exit to avoid cycling.
          if (duplicate) {
              break;
          }
          // New vertex is ok and needed.
          ++simplex.m_count;
      }
      exports.b2_gjkMaxIters = b2Max(exports.b2_gjkMaxIters, iter);
      // Prepare output.
      simplex.GetWitnessPoints(output.pointA, output.pointB);
      output.distance = b2Vec2.DistanceVV(output.pointA, output.pointB);
      output.iterations = iter;
      // Cache the simplex.
      simplex.WriteCache(cache);
      // Apply radii if requested.
      if (input.useRadii) {
          const rA = proxyA.m_radius;
          const rB = proxyB.m_radius;
          if (output.distance > (rA + rB) && output.distance > b2_epsilon) {
              // Shapes are still no overlapped.
              // Move the witness points to the outer surface.
              output.distance -= rA + rB;
              const normal = b2Vec2.SubVV(output.pointB, output.pointA, b2Distance_s_normal);
              normal.Normalize();
              output.pointA.SelfMulAdd(rA, normal);
              output.pointB.SelfMulSub(rB, normal);
          }
          else {
              // Shapes are overlapped when radii are considered.
              // Move the witness points to the middle.
              const p = b2Vec2.MidVV(output.pointA, output.pointB, b2Distance_s_p);
              output.pointA.Copy(p);
              output.pointB.Copy(p);
              output.distance = 0;
          }
      }
  }
  /// Perform a linear shape cast of shape B moving and shape A fixed. Determines the hit point, normal, and translation fraction.
  // GJK-raycast
  // Algorithm by Gino van den Bergen.
  // "Smooth Mesh Contacts with GJK" in Game Physics Pearls. 2010
  // bool b2ShapeCast(b2ShapeCastOutput* output, const b2ShapeCastInput* input);
  const b2ShapeCast_s_n = new b2Vec2();
  const b2ShapeCast_s_simplex = new b2Simplex();
  const b2ShapeCast_s_wA = new b2Vec2();
  const b2ShapeCast_s_wB = new b2Vec2();
  const b2ShapeCast_s_v = new b2Vec2();
  const b2ShapeCast_s_p = new b2Vec2();
  const b2ShapeCast_s_pointA = new b2Vec2();
  const b2ShapeCast_s_pointB = new b2Vec2();
  function b2ShapeCast(output, input) {
      output.iterations = 0;
      output.lambda = 1.0;
      output.normal.SetZero();
      output.point.SetZero();
      // const b2DistanceProxy* proxyA = &input.proxyA;
      const proxyA = input.proxyA;
      // const b2DistanceProxy* proxyB = &input.proxyB;
      const proxyB = input.proxyB;
      // float32 radiusA = b2Max(proxyA.m_radius, b2_polygonRadius);
      const radiusA = b2Max(proxyA.m_radius, b2_polygonRadius);
      // float32 radiusB = b2Max(proxyB.m_radius, b2_polygonRadius);
      const radiusB = b2Max(proxyB.m_radius, b2_polygonRadius);
      // float32 radius = radiusA + radiusB;
      const radius = radiusA + radiusB;
      // b2Transform xfA = input.transformA;
      const xfA = input.transformA;
      // b2Transform xfB = input.transformB;
      const xfB = input.transformB;
      // b2Vec2 r = input.translationB;
      const r = input.translationB;
      // b2Vec2 n(0.0f, 0.0f);
      const n = b2ShapeCast_s_n.Set(0.0, 0.0);
      // float32 lambda = 0.0f;
      let lambda = 0.0;
      // Initial simplex
      const simplex = b2ShapeCast_s_simplex;
      simplex.m_count = 0;
      // Get simplex vertices as an array.
      // b2SimplexVertex* vertices = &simplex.m_v1;
      const vertices = simplex.m_vertices;
      // Get support point in -r direction
      // int32 indexA = proxyA.GetSupport(b2MulT(xfA.q, -r));
      let indexA = proxyA.GetSupport(b2Rot.MulTRV(xfA.q, b2Vec2.NegV(r, b2Vec2.s_t1), b2Vec2.s_t0));
      // b2Vec2 wA = b2Mul(xfA, proxyA.GetVertex(indexA));
      let wA = b2Transform.MulXV(xfA, proxyA.GetVertex(indexA), b2ShapeCast_s_wA);
      // int32 indexB = proxyB.GetSupport(b2MulT(xfB.q, r));
      let indexB = proxyB.GetSupport(b2Rot.MulTRV(xfB.q, r, b2Vec2.s_t0));
      // b2Vec2 wB = b2Mul(xfB, proxyB.GetVertex(indexB));
      let wB = b2Transform.MulXV(xfB, proxyB.GetVertex(indexB), b2ShapeCast_s_wB);
      // b2Vec2 v = wA - wB;
      const v = b2Vec2.SubVV(wA, wB, b2ShapeCast_s_v);
      // Sigma is the target distance between polygons
      // float32 sigma = b2Max(b2_polygonRadius, radius - b2_polygonRadius);
      const sigma = b2Max(b2_polygonRadius, radius - b2_polygonRadius);
      // const float32 tolerance = 0.5f * b2_linearSlop;
      const tolerance = 0.5 * b2_linearSlop;
      // Main iteration loop.
      // const int32 k_maxIters = 20;
      const k_maxIters = 20;
      // int32 iter = 0;
      let iter = 0;
      // while (iter < k_maxIters && v.Length() - sigma > tolerance)
      while (iter < k_maxIters && v.Length() - sigma > tolerance) {
          // DEBUG: b2Assert(simplex.m_count < 3);
          output.iterations += 1;
          // Support in direction -v (A - B)
          // indexA = proxyA.GetSupport(b2MulT(xfA.q, -v));
          indexA = proxyA.GetSupport(b2Rot.MulTRV(xfA.q, b2Vec2.NegV(v, b2Vec2.s_t1), b2Vec2.s_t0));
          // wA = b2Mul(xfA, proxyA.GetVertex(indexA));
          wA = b2Transform.MulXV(xfA, proxyA.GetVertex(indexA), b2ShapeCast_s_wA);
          // indexB = proxyB.GetSupport(b2MulT(xfB.q, v));
          indexB = proxyB.GetSupport(b2Rot.MulTRV(xfB.q, v, b2Vec2.s_t0));
          // wB = b2Mul(xfB, proxyB.GetVertex(indexB));
          wB = b2Transform.MulXV(xfB, proxyB.GetVertex(indexB), b2ShapeCast_s_wB);
          // b2Vec2 p = wA - wB;
          const p = b2Vec2.SubVV(wA, wB, b2ShapeCast_s_p);
          // -v is a normal at p
          v.Normalize();
          // Intersect ray with plane
          const vp = b2Vec2.DotVV(v, p);
          const vr = b2Vec2.DotVV(v, r);
          if (vp - sigma > lambda * vr) {
              if (vr <= 0.0) {
                  return false;
              }
              lambda = (vp - sigma) / vr;
              if (lambda > 1.0) {
                  return false;
              }
              // n = -v;
              n.Copy(v).SelfNeg();
              simplex.m_count = 0;
          }
          // Reverse simplex since it works with B - A.
          // Shift by lambda * r because we want the closest point to the current clip point.
          // Note that the support point p is not shifted because we want the plane equation
          // to be formed in unshifted space.
          // b2SimplexVertex* vertex = vertices + simplex.m_count;
          const vertex = vertices[simplex.m_count];
          vertex.indexA = indexB;
          // vertex.wA = wB + lambda * r;
          vertex.wA.Copy(wB).SelfMulAdd(lambda, r);
          vertex.indexB = indexA;
          // vertex.wB = wA;
          vertex.wB.Copy(wA);
          // vertex.w = vertex.wB - vertex.wA;
          vertex.w.Copy(vertex.wB).SelfSub(vertex.wA);
          vertex.a = 1.0;
          simplex.m_count += 1;
          switch (simplex.m_count) {
              case 1:
                  break;
              case 2:
                  simplex.Solve2();
                  break;
              case 3:
                  simplex.Solve3();
                  break;
              // DEBUG: b2Assert(false);
          }
          // If we have 3 points, then the origin is in the corresponding triangle.
          if (simplex.m_count === 3) {
              // Overlap
              return false;
          }
          // Get search direction.
          // v = simplex.GetClosestPoint();
          simplex.GetClosestPoint(v);
          // Iteration count is equated to the number of support point calls.
          ++iter;
      }
      if (iter === 0) {
          // Initial overlap
          return false;
      }
      // Prepare output.
      const pointA = b2ShapeCast_s_pointA;
      const pointB = b2ShapeCast_s_pointB;
      simplex.GetWitnessPoints(pointA, pointB);
      if (v.LengthSquared() > 0.0) {
          // n = -v;
          n.Copy(v).SelfNeg();
          n.Normalize();
      }
      // output.point = pointA + radiusA * n;
      output.normal.Copy(n);
      output.lambda = lambda;
      output.iterations = iter;
      return true;
  }

  /*
  * Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  /// @file
  /// Structures and functions used for computing contact points, distance
  /// queries, and TOI queries.
  exports.b2ContactFeatureType = void 0;
  (function (b2ContactFeatureType) {
      b2ContactFeatureType[b2ContactFeatureType["e_vertex"] = 0] = "e_vertex";
      b2ContactFeatureType[b2ContactFeatureType["e_face"] = 1] = "e_face";
  })(exports.b2ContactFeatureType || (exports.b2ContactFeatureType = {}));
  /// The features that intersect to form the contact point
  /// This must be 4 bytes or less.
  class b2ContactFeature {
      constructor() {
          this._key = 0;
          this._key_invalid = false;
          this._indexA = 0;
          this._indexB = 0;
          this._typeA = 0;
          this._typeB = 0;
      }
      get key() {
          if (this._key_invalid) {
              this._key_invalid = false;
              this._key = this._indexA | (this._indexB << 8) | (this._typeA << 16) | (this._typeB << 24);
          }
          return this._key;
      }
      set key(value) {
          this._key = value;
          this._key_invalid = false;
          this._indexA = this._key & 0xff;
          this._indexB = (this._key >> 8) & 0xff;
          this._typeA = (this._key >> 16) & 0xff;
          this._typeB = (this._key >> 24) & 0xff;
      }
      get indexA() {
          return this._indexA;
      }
      set indexA(value) {
          this._indexA = value;
          this._key_invalid = true;
      }
      get indexB() {
          return this._indexB;
      }
      set indexB(value) {
          this._indexB = value;
          this._key_invalid = true;
      }
      get typeA() {
          return this._typeA;
      }
      set typeA(value) {
          this._typeA = value;
          this._key_invalid = true;
      }
      get typeB() {
          return this._typeB;
      }
      set typeB(value) {
          this._typeB = value;
          this._key_invalid = true;
      }
  }
  /// Contact ids to facilitate warm starting.
  class b2ContactID {
      constructor() {
          this.cf = new b2ContactFeature();
      }
      Copy(o) {
          this.key = o.key;
          return this;
      }
      Clone() {
          return new b2ContactID().Copy(this);
      }
      get key() {
          return this.cf.key;
      }
      set key(value) {
          this.cf.key = value;
      }
  }
  /// A manifold point is a contact point belonging to a contact
  /// manifold. It holds details related to the geometry and dynamics
  /// of the contact points.
  /// The local point usage depends on the manifold type:
  /// -e_circles: the local center of circleB
  /// -e_faceA: the local center of cirlceB or the clip point of polygonB
  /// -e_faceB: the clip point of polygonA
  /// This structure is stored across time steps, so we keep it small.
  /// Note: the impulses are used for internal caching and may not
  /// provide reliable contact forces, especially for high speed collisions.
  class b2ManifoldPoint {
      constructor() {
          this.localPoint = new b2Vec2(); ///< usage depends on manifold type
          this.normalImpulse = 0; ///< the non-penetration impulse
          this.tangentImpulse = 0; ///< the friction impulse
          this.id = new b2ContactID(); ///< uniquely identifies a contact point between two shapes
      }
      static MakeArray(length) {
          return b2MakeArray(length, (i) => new b2ManifoldPoint());
      }
      Reset() {
          this.localPoint.SetZero();
          this.normalImpulse = 0;
          this.tangentImpulse = 0;
          this.id.key = 0;
      }
      Copy(o) {
          this.localPoint.Copy(o.localPoint);
          this.normalImpulse = o.normalImpulse;
          this.tangentImpulse = o.tangentImpulse;
          this.id.Copy(o.id);
          return this;
      }
  }
  exports.b2ManifoldType = void 0;
  (function (b2ManifoldType) {
      b2ManifoldType[b2ManifoldType["e_unknown"] = -1] = "e_unknown";
      b2ManifoldType[b2ManifoldType["e_circles"] = 0] = "e_circles";
      b2ManifoldType[b2ManifoldType["e_faceA"] = 1] = "e_faceA";
      b2ManifoldType[b2ManifoldType["e_faceB"] = 2] = "e_faceB";
  })(exports.b2ManifoldType || (exports.b2ManifoldType = {}));
  /// A manifold for two touching convex shapes.
  /// Box2D supports multiple types of contact:
  /// - clip point versus plane with radius
  /// - point versus point with radius (circles)
  /// The local point usage depends on the manifold type:
  /// -e_circles: the local center of circleA
  /// -e_faceA: the center of faceA
  /// -e_faceB: the center of faceB
  /// Similarly the local normal usage:
  /// -e_circles: not used
  /// -e_faceA: the normal on polygonA
  /// -e_faceB: the normal on polygonB
  /// We store contacts in this way so that position correction can
  /// account for movement, which is critical for continuous physics.
  /// All contact scenarios must be expressed in one of these types.
  /// This structure is stored across time steps, so we keep it small.
  class b2Manifold {
      constructor() {
          this.points = b2ManifoldPoint.MakeArray(b2_maxManifoldPoints);
          this.localNormal = new b2Vec2();
          this.localPoint = new b2Vec2();
          this.type = exports.b2ManifoldType.e_unknown;
          this.pointCount = 0;
      }
      Reset() {
          for (let i = 0; i < b2_maxManifoldPoints; ++i) {
              // DEBUG: b2Assert(this.points[i] instanceof b2ManifoldPoint);
              this.points[i].Reset();
          }
          this.localNormal.SetZero();
          this.localPoint.SetZero();
          this.type = exports.b2ManifoldType.e_unknown;
          this.pointCount = 0;
      }
      Copy(o) {
          this.pointCount = o.pointCount;
          for (let i = 0; i < b2_maxManifoldPoints; ++i) {
              // DEBUG: b2Assert(this.points[i] instanceof b2ManifoldPoint);
              this.points[i].Copy(o.points[i]);
          }
          this.localNormal.Copy(o.localNormal);
          this.localPoint.Copy(o.localPoint);
          this.type = o.type;
          return this;
      }
      Clone() {
          return new b2Manifold().Copy(this);
      }
  }
  class b2WorldManifold {
      constructor() {
          this.normal = new b2Vec2();
          this.points = b2Vec2.MakeArray(b2_maxManifoldPoints);
          this.separations = b2MakeNumberArray(b2_maxManifoldPoints);
      }
      Initialize(manifold, xfA, radiusA, xfB, radiusB) {
          if (manifold.pointCount === 0) {
              return;
          }
          switch (manifold.type) {
              case exports.b2ManifoldType.e_circles: {
                  this.normal.Set(1, 0);
                  const pointA = b2Transform.MulXV(xfA, manifold.localPoint, b2WorldManifold.Initialize_s_pointA);
                  const pointB = b2Transform.MulXV(xfB, manifold.points[0].localPoint, b2WorldManifold.Initialize_s_pointB);
                  if (b2Vec2.DistanceSquaredVV(pointA, pointB) > b2_epsilon_sq) {
                      b2Vec2.SubVV(pointB, pointA, this.normal).SelfNormalize();
                  }
                  const cA = b2Vec2.AddVMulSV(pointA, radiusA, this.normal, b2WorldManifold.Initialize_s_cA);
                  const cB = b2Vec2.SubVMulSV(pointB, radiusB, this.normal, b2WorldManifold.Initialize_s_cB);
                  b2Vec2.MidVV(cA, cB, this.points[0]);
                  this.separations[0] = b2Vec2.DotVV(b2Vec2.SubVV(cB, cA, b2Vec2.s_t0), this.normal); // b2Dot(cB - cA, normal);
                  break;
              }
              case exports.b2ManifoldType.e_faceA: {
                  b2Rot.MulRV(xfA.q, manifold.localNormal, this.normal);
                  const planePoint = b2Transform.MulXV(xfA, manifold.localPoint, b2WorldManifold.Initialize_s_planePoint);
                  for (let i = 0; i < manifold.pointCount; ++i) {
                      const clipPoint = b2Transform.MulXV(xfB, manifold.points[i].localPoint, b2WorldManifold.Initialize_s_clipPoint);
                      const s = radiusA - b2Vec2.DotVV(b2Vec2.SubVV(clipPoint, planePoint, b2Vec2.s_t0), this.normal);
                      const cA = b2Vec2.AddVMulSV(clipPoint, s, this.normal, b2WorldManifold.Initialize_s_cA);
                      const cB = b2Vec2.SubVMulSV(clipPoint, radiusB, this.normal, b2WorldManifold.Initialize_s_cB);
                      b2Vec2.MidVV(cA, cB, this.points[i]);
                      this.separations[i] = b2Vec2.DotVV(b2Vec2.SubVV(cB, cA, b2Vec2.s_t0), this.normal); // b2Dot(cB - cA, normal);
                  }
                  break;
              }
              case exports.b2ManifoldType.e_faceB: {
                  b2Rot.MulRV(xfB.q, manifold.localNormal, this.normal);
                  const planePoint = b2Transform.MulXV(xfB, manifold.localPoint, b2WorldManifold.Initialize_s_planePoint);
                  for (let i = 0; i < manifold.pointCount; ++i) {
                      const clipPoint = b2Transform.MulXV(xfA, manifold.points[i].localPoint, b2WorldManifold.Initialize_s_clipPoint);
                      const s = radiusB - b2Vec2.DotVV(b2Vec2.SubVV(clipPoint, planePoint, b2Vec2.s_t0), this.normal);
                      const cB = b2Vec2.AddVMulSV(clipPoint, s, this.normal, b2WorldManifold.Initialize_s_cB);
                      const cA = b2Vec2.SubVMulSV(clipPoint, radiusA, this.normal, b2WorldManifold.Initialize_s_cA);
                      b2Vec2.MidVV(cA, cB, this.points[i]);
                      this.separations[i] = b2Vec2.DotVV(b2Vec2.SubVV(cA, cB, b2Vec2.s_t0), this.normal); // b2Dot(cA - cB, normal);
                  }
                  // Ensure normal points from A to B.
                  this.normal.SelfNeg();
                  break;
              }
          }
      }
  }
  b2WorldManifold.Initialize_s_pointA = new b2Vec2();
  b2WorldManifold.Initialize_s_pointB = new b2Vec2();
  b2WorldManifold.Initialize_s_cA = new b2Vec2();
  b2WorldManifold.Initialize_s_cB = new b2Vec2();
  b2WorldManifold.Initialize_s_planePoint = new b2Vec2();
  b2WorldManifold.Initialize_s_clipPoint = new b2Vec2();
  /// This is used for determining the state of contact points.
  exports.b2PointState = void 0;
  (function (b2PointState) {
      b2PointState[b2PointState["b2_nullState"] = 0] = "b2_nullState";
      b2PointState[b2PointState["b2_addState"] = 1] = "b2_addState";
      b2PointState[b2PointState["b2_persistState"] = 2] = "b2_persistState";
      b2PointState[b2PointState["b2_removeState"] = 3] = "b2_removeState";
  })(exports.b2PointState || (exports.b2PointState = {}));
  /// Compute the point states given two manifolds. The states pertain to the transition from manifold1
  /// to manifold2. So state1 is either persist or remove while state2 is either add or persist.
  function b2GetPointStates(state1, state2, manifold1, manifold2) {
      // Detect persists and removes.
      let i;
      for (i = 0; i < manifold1.pointCount; ++i) {
          const id = manifold1.points[i].id;
          const key = id.key;
          state1[i] = exports.b2PointState.b2_removeState;
          for (let j = 0, jct = manifold2.pointCount; j < jct; ++j) {
              if (manifold2.points[j].id.key === key) {
                  state1[i] = exports.b2PointState.b2_persistState;
                  break;
              }
          }
      }
      for (; i < b2_maxManifoldPoints; ++i) {
          state1[i] = exports.b2PointState.b2_nullState;
      }
      // Detect persists and adds.
      for (i = 0; i < manifold2.pointCount; ++i) {
          const id = manifold2.points[i].id;
          const key = id.key;
          state2[i] = exports.b2PointState.b2_addState;
          for (let j = 0, jct = manifold1.pointCount; j < jct; ++j) {
              if (manifold1.points[j].id.key === key) {
                  state2[i] = exports.b2PointState.b2_persistState;
                  break;
              }
          }
      }
      for (; i < b2_maxManifoldPoints; ++i) {
          state2[i] = exports.b2PointState.b2_nullState;
      }
  }
  /// Used for computing contact manifolds.
  class b2ClipVertex {
      constructor() {
          this.v = new b2Vec2();
          this.id = new b2ContactID();
      }
      static MakeArray(length) {
          return b2MakeArray(length, (i) => new b2ClipVertex());
      }
      Copy(other) {
          this.v.Copy(other.v);
          this.id.Copy(other.id);
          return this;
      }
  }
  /// Ray-cast input data. The ray extends from p1 to p1 + maxFraction * (p2 - p1).
  class b2RayCastInput {
      constructor() {
          this.p1 = new b2Vec2();
          this.p2 = new b2Vec2();
          this.maxFraction = 1;
      }
      Copy(o) {
          this.p1.Copy(o.p1);
          this.p2.Copy(o.p2);
          this.maxFraction = o.maxFraction;
          return this;
      }
  }
  /// Ray-cast output data. The ray hits at p1 + fraction * (p2 - p1), where p1 and p2
  /// come from b2RayCastInput.
  class b2RayCastOutput {
      constructor() {
          this.normal = new b2Vec2();
          this.fraction = 0;
      }
      Copy(o) {
          this.normal.Copy(o.normal);
          this.fraction = o.fraction;
          return this;
      }
  }
  /// An axis aligned bounding box.
  class b2AABB {
      constructor() {
          this.lowerBound = new b2Vec2(); ///< the lower vertex
          this.upperBound = new b2Vec2(); ///< the upper vertex
          this.m_cache_center = new b2Vec2(); // access using GetCenter()
          this.m_cache_extent = new b2Vec2(); // access using GetExtents()
      }
      Copy(o) {
          this.lowerBound.Copy(o.lowerBound);
          this.upperBound.Copy(o.upperBound);
          return this;
      }
      /// Verify that the bounds are sorted.
      IsValid() {
          if (!this.lowerBound.IsValid()) {
              return false;
          }
          if (!this.upperBound.IsValid()) {
              return false;
          }
          if (this.upperBound.x < this.lowerBound.x) {
              return false;
          }
          if (this.upperBound.y < this.lowerBound.y) {
              return false;
          }
          return true;
      }
      /// Get the center of the AABB.
      GetCenter() {
          return b2Vec2.MidVV(this.lowerBound, this.upperBound, this.m_cache_center);
      }
      /// Get the extents of the AABB (half-widths).
      GetExtents() {
          return b2Vec2.ExtVV(this.lowerBound, this.upperBound, this.m_cache_extent);
      }
      /// Get the perimeter length
      GetPerimeter() {
          const wx = this.upperBound.x - this.lowerBound.x;
          const wy = this.upperBound.y - this.lowerBound.y;
          return 2 * (wx + wy);
      }
      /// Combine an AABB into this one.
      Combine1(aabb) {
          this.lowerBound.x = b2Min(this.lowerBound.x, aabb.lowerBound.x);
          this.lowerBound.y = b2Min(this.lowerBound.y, aabb.lowerBound.y);
          this.upperBound.x = b2Max(this.upperBound.x, aabb.upperBound.x);
          this.upperBound.y = b2Max(this.upperBound.y, aabb.upperBound.y);
          return this;
      }
      /// Combine two AABBs into this one.
      Combine2(aabb1, aabb2) {
          this.lowerBound.x = b2Min(aabb1.lowerBound.x, aabb2.lowerBound.x);
          this.lowerBound.y = b2Min(aabb1.lowerBound.y, aabb2.lowerBound.y);
          this.upperBound.x = b2Max(aabb1.upperBound.x, aabb2.upperBound.x);
          this.upperBound.y = b2Max(aabb1.upperBound.y, aabb2.upperBound.y);
          return this;
      }
      static Combine(aabb1, aabb2, out) {
          out.Combine2(aabb1, aabb2);
          return out;
      }
      /// Does this aabb contain the provided AABB.
      Contains(aabb) {
          let result = true;
          result = result && this.lowerBound.x <= aabb.lowerBound.x;
          result = result && this.lowerBound.y <= aabb.lowerBound.y;
          result = result && aabb.upperBound.x <= this.upperBound.x;
          result = result && aabb.upperBound.y <= this.upperBound.y;
          return result;
      }
      // From Real-time Collision Detection, p179.
      RayCast(output, input) {
          let tmin = (-b2_maxFloat);
          let tmax = b2_maxFloat;
          const p_x = input.p1.x;
          const p_y = input.p1.y;
          const d_x = input.p2.x - input.p1.x;
          const d_y = input.p2.y - input.p1.y;
          const absD_x = b2Abs(d_x);
          const absD_y = b2Abs(d_y);
          const normal = output.normal;
          if (absD_x < b2_epsilon) {
              // Parallel.
              if (p_x < this.lowerBound.x || this.upperBound.x < p_x) {
                  return false;
              }
          }
          else {
              const inv_d = 1 / d_x;
              let t1 = (this.lowerBound.x - p_x) * inv_d;
              let t2 = (this.upperBound.x - p_x) * inv_d;
              // Sign of the normal vector.
              let s = (-1);
              if (t1 > t2) {
                  const t3 = t1;
                  t1 = t2;
                  t2 = t3;
                  s = 1;
              }
              // Push the min up
              if (t1 > tmin) {
                  normal.x = s;
                  normal.y = 0;
                  tmin = t1;
              }
              // Pull the max down
              tmax = b2Min(tmax, t2);
              if (tmin > tmax) {
                  return false;
              }
          }
          if (absD_y < b2_epsilon) {
              // Parallel.
              if (p_y < this.lowerBound.y || this.upperBound.y < p_y) {
                  return false;
              }
          }
          else {
              const inv_d = 1 / d_y;
              let t1 = (this.lowerBound.y - p_y) * inv_d;
              let t2 = (this.upperBound.y - p_y) * inv_d;
              // Sign of the normal vector.
              let s = (-1);
              if (t1 > t2) {
                  const t3 = t1;
                  t1 = t2;
                  t2 = t3;
                  s = 1;
              }
              // Push the min up
              if (t1 > tmin) {
                  normal.x = 0;
                  normal.y = s;
                  tmin = t1;
              }
              // Pull the max down
              tmax = b2Min(tmax, t2);
              if (tmin > tmax) {
                  return false;
              }
          }
          // Does the ray start inside the box?
          // Does the ray intersect beyond the max fraction?
          if (tmin < 0 || input.maxFraction < tmin) {
              return false;
          }
          // Intersection.
          output.fraction = tmin;
          return true;
      }
      TestContain(point) {
          if (point.x < this.lowerBound.x || this.upperBound.x < point.x) {
              return false;
          }
          if (point.y < this.lowerBound.y || this.upperBound.y < point.y) {
              return false;
          }
          return true;
      }
      TestOverlap(other) {
          if (this.upperBound.x < other.lowerBound.x) {
              return false;
          }
          if (this.upperBound.y < other.lowerBound.y) {
              return false;
          }
          if (other.upperBound.x < this.lowerBound.x) {
              return false;
          }
          if (other.upperBound.y < this.lowerBound.y) {
              return false;
          }
          return true;
      }
  }
  function b2TestOverlapAABB(a, b) {
      if (a.upperBound.x < b.lowerBound.x) {
          return false;
      }
      if (a.upperBound.y < b.lowerBound.y) {
          return false;
      }
      if (b.upperBound.x < a.lowerBound.x) {
          return false;
      }
      if (b.upperBound.y < a.lowerBound.y) {
          return false;
      }
      return true;
  }
  /// Clipping for contact manifolds.
  function b2ClipSegmentToLine(vOut, vIn, normal, offset, vertexIndexA) {
      // Start with no output points
      let count = 0;
      const vIn0 = vIn[0];
      const vIn1 = vIn[1];
      // Calculate the distance of end points to the line
      const distance0 = b2Vec2.DotVV(normal, vIn0.v) - offset;
      const distance1 = b2Vec2.DotVV(normal, vIn1.v) - offset;
      // If the points are behind the plane
      if (distance0 <= 0) {
          vOut[count++].Copy(vIn0);
      }
      if (distance1 <= 0) {
          vOut[count++].Copy(vIn1);
      }
      // If the points are on different sides of the plane
      if (distance0 * distance1 < 0) {
          // Find intersection point of edge and plane
          const interp = distance0 / (distance0 - distance1);
          const v = vOut[count].v;
          v.x = vIn0.v.x + interp * (vIn1.v.x - vIn0.v.x);
          v.y = vIn0.v.y + interp * (vIn1.v.y - vIn0.v.y);
          // VertexA is hitting edgeB.
          const id = vOut[count].id;
          id.cf.indexA = vertexIndexA;
          id.cf.indexB = vIn0.id.cf.indexB;
          id.cf.typeA = exports.b2ContactFeatureType.e_vertex;
          id.cf.typeB = exports.b2ContactFeatureType.e_face;
          ++count;
          // b2Assert(count === 2);
      }
      return count;
  }
  /// Determine if two generic shapes overlap.
  const b2TestOverlapShape_s_input = new b2DistanceInput();
  const b2TestOverlapShape_s_simplexCache = new b2SimplexCache();
  const b2TestOverlapShape_s_output = new b2DistanceOutput();
  function b2TestOverlapShape(shapeA, indexA, shapeB, indexB, xfA, xfB) {
      const input = b2TestOverlapShape_s_input.Reset();
      input.proxyA.SetShape(shapeA, indexA);
      input.proxyB.SetShape(shapeB, indexB);
      input.transformA.Copy(xfA);
      input.transformB.Copy(xfB);
      input.useRadii = true;
      const simplexCache = b2TestOverlapShape_s_simplexCache.Reset();
      simplexCache.count = 0;
      const output = b2TestOverlapShape_s_output.Reset();
      b2Distance(output, simplexCache, input);
      return output.distance < 10 * b2_epsilon;
  }

  /*
  * Copyright (c) 2009 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  function verify(value) {
      if (value === null) {
          throw new Error();
      }
      return value;
  }
  /// A node in the dynamic tree. The client does not interact with this directly.
  class b2TreeNode {
      constructor(id = 0) {
          this.m_id = 0;
          this.aabb = new b2AABB();
          this._userData = null;
          this.parent = null; // or next
          this.child1 = null;
          this.child2 = null;
          this.height = 0; // leaf = 0, free node = -1
          this.moved = false;
          this.m_id = id;
      }
      get userData() {
          if (this._userData === null) {
              throw new Error();
          }
          return this._userData;
      }
      set userData(value) {
          if (this._userData !== null) {
              throw new Error();
          }
          this._userData = value;
      }
      Reset() {
          this._userData = null;
      }
      IsLeaf() {
          return this.child1 === null;
      }
  }
  class b2DynamicTree {
      constructor() {
          this.m_root = null;
          // b2TreeNode* public m_nodes;
          // int32 public m_nodeCount;
          // int32 public m_nodeCapacity;
          this.m_freeList = null;
          this.m_insertionCount = 0;
          this.m_stack = new b2GrowableStack(256);
      }
      Query(...args) {
          let aabb, callback;
          if (args[0] instanceof b2AABB) {
              aabb = args[0];
              callback = args[1];
          }
          else {
              aabb = args[1];
              callback = args[0];
          }
          const stack = this.m_stack.Reset();
          stack.Push(this.m_root);
          while (stack.GetCount() > 0) {
              const node = stack.Pop();
              if (node === null) {
                  continue;
              }
              if (node.aabb.TestOverlap(aabb)) {
                  if (node.IsLeaf()) {
                      const proceed = callback(node);
                      if (!proceed) {
                          return;
                      }
                  }
                  else {
                      stack.Push(node.child1);
                      stack.Push(node.child2);
                  }
              }
          }
      }
      QueryPoint(point, callback) {
          const stack = this.m_stack.Reset();
          stack.Push(this.m_root);
          while (stack.GetCount() > 0) {
              const node = stack.Pop();
              if (node === null) {
                  continue;
              }
              if (node.aabb.TestContain(point)) {
                  if (node.IsLeaf()) {
                      const proceed = callback(node);
                      if (!proceed) {
                          return;
                      }
                  }
                  else {
                      stack.Push(node.child1);
                      stack.Push(node.child2);
                  }
              }
          }
      }
      RayCast(...args) {
          let callback, input;
          if (args[0] instanceof b2RayCastInput) {
              input = args[0];
              callback = args[1];
          }
          else {
              input = args[1];
              callback = args[0];
          }
          const p1 = input.p1;
          const p2 = input.p2;
          const r = b2Vec2.SubVV(p2, p1, b2DynamicTree.s_r);
          // DEBUG: b2Assert(r.LengthSquared() > 0);
          r.Normalize();
          // v is perpendicular to the segment.
          const v = b2Vec2.CrossOneV(r, b2DynamicTree.s_v);
          const abs_v = b2Vec2.AbsV(v, b2DynamicTree.s_abs_v);
          // Separating axis for segment (Gino, p80).
          // |dot(v, p1 - c)| > dot(|v|, h)
          let maxFraction = input.maxFraction;
          // Build a bounding box for the segment.
          const segmentAABB = b2DynamicTree.s_segmentAABB;
          let t_x = p1.x + maxFraction * (p2.x - p1.x);
          let t_y = p1.y + maxFraction * (p2.y - p1.y);
          segmentAABB.lowerBound.x = b2Min(p1.x, t_x);
          segmentAABB.lowerBound.y = b2Min(p1.y, t_y);
          segmentAABB.upperBound.x = b2Max(p1.x, t_x);
          segmentAABB.upperBound.y = b2Max(p1.y, t_y);
          const stack = this.m_stack.Reset();
          stack.Push(this.m_root);
          while (stack.GetCount() > 0) {
              const node = stack.Pop();
              if (node === null) {
                  continue;
              }
              if (!b2TestOverlapAABB(node.aabb, segmentAABB)) {
                  continue;
              }
              // Separating axis for segment (Gino, p80).
              // |dot(v, p1 - c)| > dot(|v|, h)
              const c = node.aabb.GetCenter();
              const h = node.aabb.GetExtents();
              const separation = b2Abs(b2Vec2.DotVV(v, b2Vec2.SubVV(p1, c, b2Vec2.s_t0))) - b2Vec2.DotVV(abs_v, h);
              if (separation > 0) {
                  continue;
              }
              if (node.IsLeaf()) {
                  const subInput = b2DynamicTree.s_subInput;
                  subInput.p1.Copy(input.p1);
                  subInput.p2.Copy(input.p2);
                  subInput.maxFraction = maxFraction;
                  const value = callback(subInput, node);
                  if (value === 0) {
                      // The client has terminated the ray cast.
                      return;
                  }
                  if (value > 0) {
                      // Update segment bounding box.
                      maxFraction = value;
                      t_x = p1.x + maxFraction * (p2.x - p1.x);
                      t_y = p1.y + maxFraction * (p2.y - p1.y);
                      segmentAABB.lowerBound.x = b2Min(p1.x, t_x);
                      segmentAABB.lowerBound.y = b2Min(p1.y, t_y);
                      segmentAABB.upperBound.x = b2Max(p1.x, t_x);
                      segmentAABB.upperBound.y = b2Max(p1.y, t_y);
                  }
              }
              else {
                  stack.Push(node.child1);
                  stack.Push(node.child2);
              }
          }
      }
      AllocateNode() {
          // Expand the node pool as needed.
          if (this.m_freeList !== null) {
              const node = this.m_freeList;
              this.m_freeList = node.parent; // this.m_freeList = node.next;
              node.parent = null;
              node.child1 = null;
              node.child2 = null;
              node.height = 0;
              node.moved = false;
              return node;
          }
          return new b2TreeNode(b2DynamicTree.s_node_id++);
      }
      FreeNode(node) {
          node.parent = this.m_freeList; // node.next = this.m_freeList;
          node.child1 = null;
          node.child2 = null;
          node.height = -1;
          node.Reset();
          this.m_freeList = node;
      }
      CreateProxy(aabb, userData) {
          const node = this.AllocateNode();
          // Fatten the aabb.
          const r_x = b2_aabbExtension;
          const r_y = b2_aabbExtension;
          node.aabb.lowerBound.x = aabb.lowerBound.x - r_x;
          node.aabb.lowerBound.y = aabb.lowerBound.y - r_y;
          node.aabb.upperBound.x = aabb.upperBound.x + r_x;
          node.aabb.upperBound.y = aabb.upperBound.y + r_y;
          node.userData = userData;
          node.height = 0;
          node.moved = true;
          this.InsertLeaf(node);
          return node;
      }
      DestroyProxy(node) {
          // DEBUG: b2Assert(node.IsLeaf());
          this.RemoveLeaf(node);
          this.FreeNode(node);
      }
      MoveProxy(node, aabb, displacement) {
          // DEBUG: b2Assert(node.IsLeaf());
          // Extend AABB
          const fatAABB = b2DynamicTree.MoveProxy_s_fatAABB;
          const r_x = b2_aabbExtension;
          const r_y = b2_aabbExtension;
          fatAABB.lowerBound.x = aabb.lowerBound.x - r_x;
          fatAABB.lowerBound.y = aabb.lowerBound.y - r_y;
          fatAABB.upperBound.x = aabb.upperBound.x + r_x;
          fatAABB.upperBound.y = aabb.upperBound.y + r_y;
          // Predict AABB movement
          const d_x = b2_aabbMultiplier * displacement.x;
          const d_y = b2_aabbMultiplier * displacement.y;
          if (d_x < 0.0) {
              fatAABB.lowerBound.x += d_x;
          }
          else {
              fatAABB.upperBound.x += d_x;
          }
          if (d_y < 0.0) {
              fatAABB.lowerBound.y += d_y;
          }
          else {
              fatAABB.upperBound.y += d_y;
          }
          const treeAABB = node.aabb; // m_nodes[proxyId].aabb;
          if (treeAABB.Contains(aabb)) {
              // The tree AABB still contains the object, but it might be too large.
              // Perhaps the object was moving fast but has since gone to sleep.
              // The huge AABB is larger than the new fat AABB.
              const hugeAABB = b2DynamicTree.MoveProxy_s_hugeAABB;
              hugeAABB.lowerBound.x = fatAABB.lowerBound.x - 4.0 * r_x;
              hugeAABB.lowerBound.y = fatAABB.lowerBound.y - 4.0 * r_y;
              hugeAABB.upperBound.x = fatAABB.upperBound.x + 4.0 * r_x;
              hugeAABB.upperBound.y = fatAABB.upperBound.y + 4.0 * r_y;
              if (hugeAABB.Contains(treeAABB)) {
                  // The tree AABB contains the object AABB and the tree AABB is
                  // not too large. No tree update needed.
                  return false;
              }
              // Otherwise the tree AABB is huge and needs to be shrunk
          }
          this.RemoveLeaf(node);
          node.aabb.Copy(fatAABB); // m_nodes[proxyId].aabb = fatAABB;
          this.InsertLeaf(node);
          node.moved = true;
          return true;
      }
      InsertLeaf(leaf) {
          ++this.m_insertionCount;
          if (this.m_root === null) {
              this.m_root = leaf;
              this.m_root.parent = null;
              return;
          }
          // Find the best sibling for this node
          const leafAABB = leaf.aabb;
          let sibling = this.m_root;
          while (!sibling.IsLeaf()) {
              const child1 = verify(sibling.child1);
              const child2 = verify(sibling.child2);
              const area = sibling.aabb.GetPerimeter();
              const combinedAABB = b2DynamicTree.s_combinedAABB;
              combinedAABB.Combine2(sibling.aabb, leafAABB);
              const combinedArea = combinedAABB.GetPerimeter();
              // Cost of creating a new parent for this node and the new leaf
              const cost = 2 * combinedArea;
              // Minimum cost of pushing the leaf further down the tree
              const inheritanceCost = 2 * (combinedArea - area);
              // Cost of descending into child1
              let cost1;
              const aabb = b2DynamicTree.s_aabb;
              let oldArea;
              let newArea;
              if (child1.IsLeaf()) {
                  aabb.Combine2(leafAABB, child1.aabb);
                  cost1 = aabb.GetPerimeter() + inheritanceCost;
              }
              else {
                  aabb.Combine2(leafAABB, child1.aabb);
                  oldArea = child1.aabb.GetPerimeter();
                  newArea = aabb.GetPerimeter();
                  cost1 = (newArea - oldArea) + inheritanceCost;
              }
              // Cost of descending into child2
              let cost2;
              if (child2.IsLeaf()) {
                  aabb.Combine2(leafAABB, child2.aabb);
                  cost2 = aabb.GetPerimeter() + inheritanceCost;
              }
              else {
                  aabb.Combine2(leafAABB, child2.aabb);
                  oldArea = child2.aabb.GetPerimeter();
                  newArea = aabb.GetPerimeter();
                  cost2 = newArea - oldArea + inheritanceCost;
              }
              // Descend according to the minimum cost.
              if (cost < cost1 && cost < cost2) {
                  break;
              }
              // Descend
              if (cost1 < cost2) {
                  sibling = child1;
              }
              else {
                  sibling = child2;
              }
          }
          // Create a parent for the siblings.
          const oldParent = sibling.parent;
          const newParent = this.AllocateNode();
          newParent.parent = oldParent;
          newParent.aabb.Combine2(leafAABB, sibling.aabb);
          newParent.height = sibling.height + 1;
          if (oldParent !== null) {
              // The sibling was not the root.
              if (oldParent.child1 === sibling) {
                  oldParent.child1 = newParent;
              }
              else {
                  oldParent.child2 = newParent;
              }
              newParent.child1 = sibling;
              newParent.child2 = leaf;
              sibling.parent = newParent;
              leaf.parent = newParent;
          }
          else {
              // The sibling was the root.
              newParent.child1 = sibling;
              newParent.child2 = leaf;
              sibling.parent = newParent;
              leaf.parent = newParent;
              this.m_root = newParent;
          }
          // Walk back up the tree fixing heights and AABBs
          let node = leaf.parent;
          while (node !== null) {
              node = this.Balance(node);
              const child1 = verify(node.child1);
              const child2 = verify(node.child2);
              node.height = 1 + b2Max(child1.height, child2.height);
              node.aabb.Combine2(child1.aabb, child2.aabb);
              node = node.parent;
          }
          // this.Validate();
      }
      RemoveLeaf(leaf) {
          if (leaf === this.m_root) {
              this.m_root = null;
              return;
          }
          const parent = verify(leaf.parent);
          const grandParent = parent && parent.parent;
          const sibling = verify(parent.child1 === leaf ? parent.child2 : parent.child1);
          if (grandParent !== null) {
              // Destroy parent and connect sibling to grandParent.
              if (grandParent.child1 === parent) {
                  grandParent.child1 = sibling;
              }
              else {
                  grandParent.child2 = sibling;
              }
              sibling.parent = grandParent;
              this.FreeNode(parent);
              // Adjust ancestor bounds.
              let index = grandParent;
              while (index !== null) {
                  index = this.Balance(index);
                  const child1 = verify(index.child1);
                  const child2 = verify(index.child2);
                  index.aabb.Combine2(child1.aabb, child2.aabb);
                  index.height = 1 + b2Max(child1.height, child2.height);
                  index = index.parent;
              }
          }
          else {
              this.m_root = sibling;
              sibling.parent = null;
              this.FreeNode(parent);
          }
          // this.Validate();
      }
      Balance(A) {
          // DEBUG: b2Assert(A !== null);
          if (A.IsLeaf() || A.height < 2) {
              return A;
          }
          const B = verify(A.child1);
          const C = verify(A.child2);
          const balance = C.height - B.height;
          // Rotate C up
          if (balance > 1) {
              const F = verify(C.child1);
              const G = verify(C.child2);
              // Swap A and C
              C.child1 = A;
              C.parent = A.parent;
              A.parent = C;
              // A's old parent should point to C
              if (C.parent !== null) {
                  if (C.parent.child1 === A) {
                      C.parent.child1 = C;
                  }
                  else {
                      // DEBUG: b2Assert(C.parent.child2 === A);
                      C.parent.child2 = C;
                  }
              }
              else {
                  this.m_root = C;
              }
              // Rotate
              if (F.height > G.height) {
                  C.child2 = F;
                  A.child2 = G;
                  G.parent = A;
                  A.aabb.Combine2(B.aabb, G.aabb);
                  C.aabb.Combine2(A.aabb, F.aabb);
                  A.height = 1 + b2Max(B.height, G.height);
                  C.height = 1 + b2Max(A.height, F.height);
              }
              else {
                  C.child2 = G;
                  A.child2 = F;
                  F.parent = A;
                  A.aabb.Combine2(B.aabb, F.aabb);
                  C.aabb.Combine2(A.aabb, G.aabb);
                  A.height = 1 + b2Max(B.height, F.height);
                  C.height = 1 + b2Max(A.height, G.height);
              }
              return C;
          }
          // Rotate B up
          if (balance < -1) {
              const D = verify(B.child1);
              const E = verify(B.child2);
              // Swap A and B
              B.child1 = A;
              B.parent = A.parent;
              A.parent = B;
              // A's old parent should point to B
              if (B.parent !== null) {
                  if (B.parent.child1 === A) {
                      B.parent.child1 = B;
                  }
                  else {
                      // DEBUG: b2Assert(B.parent.child2 === A);
                      B.parent.child2 = B;
                  }
              }
              else {
                  this.m_root = B;
              }
              // Rotate
              if (D.height > E.height) {
                  B.child2 = D;
                  A.child1 = E;
                  E.parent = A;
                  A.aabb.Combine2(C.aabb, E.aabb);
                  B.aabb.Combine2(A.aabb, D.aabb);
                  A.height = 1 + b2Max(C.height, E.height);
                  B.height = 1 + b2Max(A.height, D.height);
              }
              else {
                  B.child2 = E;
                  A.child1 = D;
                  D.parent = A;
                  A.aabb.Combine2(C.aabb, D.aabb);
                  B.aabb.Combine2(A.aabb, E.aabb);
                  A.height = 1 + b2Max(C.height, D.height);
                  B.height = 1 + b2Max(A.height, E.height);
              }
              return B;
          }
          return A;
      }
      GetHeight() {
          if (this.m_root === null) {
              return 0;
          }
          return this.m_root.height;
      }
      static GetAreaNode(node) {
          if (node === null) {
              return 0;
          }
          if (node.IsLeaf()) {
              return 0;
          }
          let area = node.aabb.GetPerimeter();
          area += b2DynamicTree.GetAreaNode(node.child1);
          area += b2DynamicTree.GetAreaNode(node.child2);
          return area;
      }
      GetAreaRatio() {
          if (this.m_root === null) {
              return 0;
          }
          const root = this.m_root;
          const rootArea = root.aabb.GetPerimeter();
          const totalArea = b2DynamicTree.GetAreaNode(this.m_root);
          /*
          float32 totalArea = 0.0;
          for (int32 i = 0; i < m_nodeCapacity; ++i) {
            const b2TreeNode<T>* node = m_nodes + i;
            if (node.height < 0) {
              // Free node in pool
              continue;
            }
      
            totalArea += node.aabb.GetPerimeter();
          }
          */
          return totalArea / rootArea;
      }
      static ComputeHeightNode(node) {
          if (node === null) {
              return 0;
          }
          if (node.IsLeaf()) {
              return 0;
          }
          const height1 = b2DynamicTree.ComputeHeightNode(node.child1);
          const height2 = b2DynamicTree.ComputeHeightNode(node.child2);
          return 1 + b2Max(height1, height2);
      }
      ComputeHeight() {
          const height = b2DynamicTree.ComputeHeightNode(this.m_root);
          return height;
      }
      ValidateStructure(node) {
          if (node === null) {
              return;
          }
          if (node === this.m_root) ;
          if (node.IsLeaf()) {
              // DEBUG: b2Assert(node.child1 === null);
              // DEBUG: b2Assert(node.child2 === null);
              // DEBUG: b2Assert(node.height === 0);
              return;
          }
          const child1 = verify(node.child1);
          const child2 = verify(node.child2);
          // DEBUG: b2Assert(child1.parent === index);
          // DEBUG: b2Assert(child2.parent === index);
          this.ValidateStructure(child1);
          this.ValidateStructure(child2);
      }
      ValidateMetrics(node) {
          if (node === null) {
              return;
          }
          if (node.IsLeaf()) {
              // DEBUG: b2Assert(node.child1 === null);
              // DEBUG: b2Assert(node.child2 === null);
              // DEBUG: b2Assert(node.height === 0);
              return;
          }
          const child1 = verify(node.child1);
          const child2 = verify(node.child2);
          // DEBUG: const height1: number = child1.height;
          // DEBUG: const height2: number = child2.height;
          // DEBUG: const height: number = 1 + b2Max(height1, height2);
          // DEBUG: b2Assert(node.height === height);
          const aabb = b2DynamicTree.s_aabb;
          aabb.Combine2(child1.aabb, child2.aabb);
          // DEBUG: b2Assert(aabb.lowerBound === node.aabb.lowerBound);
          // DEBUG: b2Assert(aabb.upperBound === node.aabb.upperBound);
          this.ValidateMetrics(child1);
          this.ValidateMetrics(child2);
      }
      Validate() {
          // DEBUG: this.ValidateStructure(this.m_root);
          // DEBUG: this.ValidateMetrics(this.m_root);
          // let freeCount: number = 0;
          // let freeIndex: b2TreeNode<T> | null = this.m_freeList;
          // while (freeIndex !== null) {
          //   freeIndex = freeIndex.parent; // freeIndex = freeIndex.next;
          //   ++freeCount;
          // }
          // DEBUG: b2Assert(this.GetHeight() === this.ComputeHeight());
          // b2Assert(this.m_nodeCount + freeCount === this.m_nodeCapacity);
      }
      static GetMaxBalanceNode(node, maxBalance) {
          if (node === null) {
              return maxBalance;
          }
          if (node.height <= 1) {
              return maxBalance;
          }
          // DEBUG: b2Assert(!node.IsLeaf());
          const child1 = verify(node.child1);
          const child2 = verify(node.child2);
          const balance = b2Abs(child2.height - child1.height);
          return b2Max(maxBalance, balance);
      }
      GetMaxBalance() {
          const maxBalance = b2DynamicTree.GetMaxBalanceNode(this.m_root, 0);
          /*
          int32 maxBalance = 0;
          for (int32 i = 0; i < m_nodeCapacity; ++i) {
            const b2TreeNode<T>* node = m_nodes + i;
            if (node.height <= 1) {
              continue;
            }
      
            b2Assert(!node.IsLeaf());
      
            int32 child1 = node.child1;
            int32 child2 = node.child2;
            int32 balance = b2Abs(m_nodes[child2].height - m_nodes[child1].height);
            maxBalance = b2Max(maxBalance, balance);
          }
          */
          return maxBalance;
      }
      RebuildBottomUp() {
          /*
          int32* nodes = (int32*)b2Alloc(m_nodeCount * sizeof(int32));
          int32 count = 0;
      
          // Build array of leaves. Free the rest.
          for (int32 i = 0; i < m_nodeCapacity; ++i) {
            if (m_nodes[i].height < 0) {
              // free node in pool
              continue;
            }
      
            if (m_nodes[i].IsLeaf()) {
              m_nodes[i].parent = b2_nullNode;
              nodes[count] = i;
              ++count;
            } else {
              FreeNode(i);
            }
          }
      
          while (count > 1) {
            float32 minCost = b2_maxFloat;
            int32 iMin = -1, jMin = -1;
            for (int32 i = 0; i < count; ++i) {
              b2AABB aabbi = m_nodes[nodes[i]].aabb;
      
              for (int32 j = i + 1; j < count; ++j) {
                b2AABB aabbj = m_nodes[nodes[j]].aabb;
                b2AABB b;
                b.Combine(aabbi, aabbj);
                float32 cost = b.GetPerimeter();
                if (cost < minCost) {
                  iMin = i;
                  jMin = j;
                  minCost = cost;
                }
              }
            }
      
            int32 index1 = nodes[iMin];
            int32 index2 = nodes[jMin];
            b2TreeNode<T>* child1 = m_nodes + index1;
            b2TreeNode<T>* child2 = m_nodes + index2;
      
            int32 parentIndex = AllocateNode();
            b2TreeNode<T>* parent = m_nodes + parentIndex;
            parent.child1 = index1;
            parent.child2 = index2;
            parent.height = 1 + b2Max(child1.height, child2.height);
            parent.aabb.Combine(child1.aabb, child2.aabb);
            parent.parent = b2_nullNode;
      
            child1.parent = parentIndex;
            child2.parent = parentIndex;
      
            nodes[jMin] = nodes[count-1];
            nodes[iMin] = parentIndex;
            --count;
          }
      
          m_root = nodes[0];
          b2Free(nodes);
          */
          this.Validate();
      }
      static ShiftOriginNode(node, newOrigin) {
          if (node === null) {
              return;
          }
          if (node.height <= 1) {
              return;
          }
          // DEBUG: b2Assert(!node.IsLeaf());
          const child1 = node.child1;
          const child2 = node.child2;
          b2DynamicTree.ShiftOriginNode(child1, newOrigin);
          b2DynamicTree.ShiftOriginNode(child2, newOrigin);
          node.aabb.lowerBound.SelfSub(newOrigin);
          node.aabb.upperBound.SelfSub(newOrigin);
      }
      ShiftOrigin(newOrigin) {
          b2DynamicTree.ShiftOriginNode(this.m_root, newOrigin);
          /*
          // Build array of leaves. Free the rest.
          for (int32 i = 0; i < m_nodeCapacity; ++i) {
            m_nodes[i].aabb.lowerBound -= newOrigin;
            m_nodes[i].aabb.upperBound -= newOrigin;
          }
          */
      }
  }
  b2DynamicTree.s_r = new b2Vec2();
  b2DynamicTree.s_v = new b2Vec2();
  b2DynamicTree.s_abs_v = new b2Vec2();
  b2DynamicTree.s_segmentAABB = new b2AABB();
  b2DynamicTree.s_subInput = new b2RayCastInput();
  b2DynamicTree.s_combinedAABB = new b2AABB();
  b2DynamicTree.s_aabb = new b2AABB();
  b2DynamicTree.s_node_id = 0;
  b2DynamicTree.MoveProxy_s_fatAABB = new b2AABB();
  b2DynamicTree.MoveProxy_s_hugeAABB = new b2AABB();

  /*
  * Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  class b2Pair {
      constructor(proxyA, proxyB) {
          this.proxyA = proxyA;
          this.proxyB = proxyB;
      }
  }
  /// The broad-phase is used for computing pairs and performing volume queries and ray casts.
  /// This broad-phase does not persist pairs. Instead, this reports potentially new pairs.
  /// It is up to the client to consume the new pairs and to track subsequent overlap.
  class b2BroadPhase {
      constructor() {
          this.m_tree = new b2DynamicTree();
          this.m_proxyCount = 0;
          // public m_moveCapacity: number = 16;
          this.m_moveCount = 0;
          this.m_moveBuffer = [];
          // public m_pairCapacity: number = 16;
          this.m_pairCount = 0;
          this.m_pairBuffer = [];
      }
      // public m_queryProxyId: number = 0;
      /// Create a proxy with an initial AABB. Pairs are not reported until
      /// UpdatePairs is called.
      CreateProxy(aabb, userData) {
          const proxy = this.m_tree.CreateProxy(aabb, userData);
          ++this.m_proxyCount;
          this.BufferMove(proxy);
          return proxy;
      }
      /// Destroy a proxy. It is up to the client to remove any pairs.
      DestroyProxy(proxy) {
          this.UnBufferMove(proxy);
          --this.m_proxyCount;
          this.m_tree.DestroyProxy(proxy);
      }
      /// Call MoveProxy as many times as you like, then when you are done
      /// call UpdatePairs to finalized the proxy pairs (for your time step).
      MoveProxy(proxy, aabb, displacement) {
          const buffer = this.m_tree.MoveProxy(proxy, aabb, displacement);
          if (buffer) {
              this.BufferMove(proxy);
          }
      }
      /// Call to trigger a re-processing of it's pairs on the next call to UpdatePairs.
      TouchProxy(proxy) {
          this.BufferMove(proxy);
      }
      /// Get the fat AABB for a proxy.
      // public GetFatAABB(proxy: b2TreeNode<T>): b2AABB {
      //   return this.m_tree.GetFatAABB(proxy);
      // }
      /// Get user data from a proxy. Returns NULL if the id is invalid.
      // public GetUserData(proxy: b2TreeNode<T>): T {
      //   return this.m_tree.GetUserData(proxy);
      // }
      /// Test overlap of fat AABBs.
      // public TestOverlap(proxyA: b2TreeNode<T>, proxyB: b2TreeNode<T>): boolean {
      //   const aabbA: b2AABB = this.m_tree.GetFatAABB(proxyA);
      //   const aabbB: b2AABB = this.m_tree.GetFatAABB(proxyB);
      //   return b2TestOverlapAABB(aabbA, aabbB);
      // }
      /// Get the number of proxies.
      GetProxyCount() {
          return this.m_proxyCount;
      }
      /// Update the pairs. This results in pair callbacks. This can only add pairs.
      UpdatePairs(callback) {
          // Reset pair buffer
          this.m_pairCount = 0;
          // Perform tree queries for all moving proxies.
          for (let i = 0; i < this.m_moveCount; ++i) {
              const queryProxy = this.m_moveBuffer[i];
              if (queryProxy === null) {
                  continue;
              }
              // This is called from b2.DynamicTree::Query when we are gathering pairs.
              // boolean b2BroadPhase::QueryCallback(int32 proxyId);
              // We have to query the tree with the fat AABB so that
              // we don't fail to create a pair that may touch later.
              const fatAABB = queryProxy.aabb; // this.m_tree.GetFatAABB(queryProxy);
              // Query tree, create pairs and add them pair buffer.
              this.m_tree.Query(fatAABB, (proxy) => {
                  // A proxy cannot form a pair with itself.
                  if (proxy.m_id === queryProxy.m_id) {
                      return true;
                  }
                  const moved = proxy.moved; // this.m_tree.WasMoved(proxy);
                  if (moved && proxy.m_id > queryProxy.m_id) {
                      // Both proxies are moving. Avoid duplicate pairs.
                      return true;
                  }
                  // const proxyA = proxy < queryProxy ? proxy : queryProxy;
                  // const proxyB = proxy >= queryProxy ? proxy : queryProxy;
                  let proxyA;
                  let proxyB;
                  if (proxy.m_id < queryProxy.m_id) {
                      proxyA = proxy;
                      proxyB = queryProxy;
                  }
                  else {
                      proxyA = queryProxy;
                      proxyB = proxy;
                  }
                  // Grow the pair buffer as needed.
                  if (this.m_pairCount === this.m_pairBuffer.length) {
                      this.m_pairBuffer[this.m_pairCount] = new b2Pair(proxyA, proxyB);
                  }
                  else {
                      const pair = this.m_pairBuffer[this.m_pairCount];
                      pair.proxyA = proxyA;
                      pair.proxyB = proxyB;
                  }
                  ++this.m_pairCount;
                  return true;
              });
          }
          // Send pairs to caller
          for (let i = 0; i < this.m_pairCount; ++i) {
              const primaryPair = this.m_pairBuffer[i];
              const userDataA = primaryPair.proxyA.userData; // this.m_tree.GetUserData(primaryPair.proxyA);
              const userDataB = primaryPair.proxyB.userData; // this.m_tree.GetUserData(primaryPair.proxyB);
              callback(userDataA, userDataB);
          }
          // Clear move flags
          for (let i = 0; i < this.m_moveCount; ++i) {
              const proxy = this.m_moveBuffer[i];
              if (proxy === null) {
                  continue;
              }
              proxy.moved = false; // this.m_tree.ClearMoved(proxy);
          }
          // Reset move buffer
          this.m_moveCount = 0;
      }
      Query(...args) {
          this.m_tree.Query(args[0], args[1]);
      }
      QueryPoint(point, callback) {
          this.m_tree.QueryPoint(point, callback);
      }
      /// Ray-cast against the proxies in the tree. This relies on the callback
      /// to perform a exact ray-cast in the case were the proxy contains a shape.
      /// The callback also performs the any collision filtering. This has performance
      /// roughly equal to k * log(n), where k is the number of collisions and n is the
      /// number of proxies in the tree.
      /// @param input the ray-cast input data. The ray extends from p1 to p1 + maxFraction * (p2 - p1).
      /// @param callback a callback class that is called for each proxy that is hit by the ray.
      RayCast(input, callback) {
          this.m_tree.RayCast(input, callback);
      }
      /// Get the height of the embedded tree.
      GetTreeHeight() {
          return this.m_tree.GetHeight();
      }
      /// Get the balance of the embedded tree.
      GetTreeBalance() {
          return this.m_tree.GetMaxBalance();
      }
      /// Get the quality metric of the embedded tree.
      GetTreeQuality() {
          return this.m_tree.GetAreaRatio();
      }
      /// Shift the world origin. Useful for large worlds.
      /// The shift formula is: position -= newOrigin
      /// @param newOrigin the new origin with respect to the old origin
      ShiftOrigin(newOrigin) {
          this.m_tree.ShiftOrigin(newOrigin);
      }
      BufferMove(proxy) {
          this.m_moveBuffer[this.m_moveCount] = proxy;
          ++this.m_moveCount;
      }
      UnBufferMove(proxy) {
          for (let i = 0; i < this.m_moveCount; i++) {
              if (this.m_moveBuffer[i] == proxy) {
                  this.m_moveBuffer[i] = null;
              }
          }
      }
  }

  /*
  * Copyright (c) 2006-2010 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  /// A line segment (edge) shape. These can be connected in chains or loops
  /// to other edge shapes. Edges created independently are two-sided and do
  /// no provide smooth movement across junctions.
  class b2EdgeShape extends b2Shape {
      constructor() {
          super(exports.b2ShapeType.e_edgeShape, b2_polygonRadius);
          this.m_vertex1 = new b2Vec2();
          this.m_vertex2 = new b2Vec2();
          this.m_vertex0 = new b2Vec2();
          this.m_vertex3 = new b2Vec2();
          /// Uses m_vertex0 and m_vertex3 to create smooth collision.
          this.m_oneSided = false;
      }
      /// Set this as a part of a sequence. Vertex v0 precedes the edge and vertex v3
      /// follows. These extra vertices are used to provide smooth movement
      /// across junctions. This also makes the collision one-sided. The edge
      /// normal points to the right looking from v1 to v2.
      // void SetOneSided(const b2Vec2& v0, const b2Vec2& v1,const b2Vec2& v2, const b2Vec2& v3);
      SetOneSided(v0, v1, v2, v3) {
          this.m_vertex0.Copy(v0);
          this.m_vertex1.Copy(v1);
          this.m_vertex2.Copy(v2);
          this.m_vertex3.Copy(v3);
          this.m_oneSided = true;
          return this;
      }
      /// Set this as an isolated edge. Collision is two-sided.
      SetTwoSided(v1, v2) {
          this.m_vertex1.Copy(v1);
          this.m_vertex2.Copy(v2);
          this.m_oneSided = false;
          return this;
      }
      /// Implement b2Shape.
      Clone() {
          return new b2EdgeShape().Copy(this);
      }
      Copy(other) {
          super.Copy(other);
          // DEBUG: b2Assert(other instanceof b2EdgeShape);
          this.m_vertex1.Copy(other.m_vertex1);
          this.m_vertex2.Copy(other.m_vertex2);
          this.m_vertex0.Copy(other.m_vertex0);
          this.m_vertex3.Copy(other.m_vertex3);
          this.m_oneSided = other.m_oneSided;
          return this;
      }
      /// @see b2Shape::GetChildCount
      GetChildCount() {
          return 1;
      }
      /// @see b2Shape::TestPoint
      TestPoint(xf, p) {
          return false;
      }
      RayCast(output, input, xf, childIndex) {
          // Put the ray into the edge's frame of reference.
          const p1 = b2Transform.MulTXV(xf, input.p1, b2EdgeShape.RayCast_s_p1);
          const p2 = b2Transform.MulTXV(xf, input.p2, b2EdgeShape.RayCast_s_p2);
          const d = b2Vec2.SubVV(p2, p1, b2EdgeShape.RayCast_s_d);
          const v1 = this.m_vertex1;
          const v2 = this.m_vertex2;
          const e = b2Vec2.SubVV(v2, v1, b2EdgeShape.RayCast_s_e);
          // Normal points to the right, looking from v1 at v2
          const normal = output.normal.Set(e.y, -e.x).SelfNormalize();
          // q = p1 + t * d
          // dot(normal, q - v1) = 0
          // dot(normal, p1 - v1) + t * dot(normal, d) = 0
          const numerator = b2Vec2.DotVV(normal, b2Vec2.SubVV(v1, p1, b2Vec2.s_t0));
          if (this.m_oneSided && numerator > 0.0) {
              return false;
          }
          const denominator = b2Vec2.DotVV(normal, d);
          if (denominator === 0) {
              return false;
          }
          const t = numerator / denominator;
          if (t < 0 || input.maxFraction < t) {
              return false;
          }
          const q = b2Vec2.AddVMulSV(p1, t, d, b2EdgeShape.RayCast_s_q);
          // q = v1 + s * r
          // s = dot(q - v1, r) / dot(r, r)
          const r = b2Vec2.SubVV(v2, v1, b2EdgeShape.RayCast_s_r);
          const rr = b2Vec2.DotVV(r, r);
          if (rr === 0) {
              return false;
          }
          const s = b2Vec2.DotVV(b2Vec2.SubVV(q, v1, b2Vec2.s_t0), r) / rr;
          if (s < 0 || 1 < s) {
              return false;
          }
          output.fraction = t;
          b2Rot.MulRV(xf.q, output.normal, output.normal);
          if (numerator > 0) {
              output.normal.SelfNeg();
          }
          return true;
      }
      ComputeAABB(aabb, xf, childIndex) {
          const v1 = b2Transform.MulXV(xf, this.m_vertex1, b2EdgeShape.ComputeAABB_s_v1);
          const v2 = b2Transform.MulXV(xf, this.m_vertex2, b2EdgeShape.ComputeAABB_s_v2);
          b2Vec2.MinV(v1, v2, aabb.lowerBound);
          b2Vec2.MaxV(v1, v2, aabb.upperBound);
          const r = this.m_radius;
          aabb.lowerBound.SelfSubXY(r, r);
          aabb.upperBound.SelfAddXY(r, r);
      }
      /// @see b2Shape::ComputeMass
      ComputeMass(massData, density) {
          massData.mass = 0;
          b2Vec2.MidVV(this.m_vertex1, this.m_vertex2, massData.center);
          massData.I = 0;
      }
      SetupDistanceProxy(proxy, index) {
          proxy.m_vertices = proxy.m_buffer;
          proxy.m_vertices[0].Copy(this.m_vertex1);
          proxy.m_vertices[1].Copy(this.m_vertex2);
          proxy.m_count = 2;
          proxy.m_radius = this.m_radius;
      }
      ComputeSubmergedArea(normal, offset, xf, c) {
          c.SetZero();
          return 0;
      }
      Dump(log) {
          log("    const shape: b2EdgeShape = new b2EdgeShape();\n");
          log("    shape.m_radius = %.15f;\n", this.m_radius);
          log("    shape.m_vertex0.Set(%.15f, %.15f);\n", this.m_vertex0.x, this.m_vertex0.y);
          log("    shape.m_vertex1.Set(%.15f, %.15f);\n", this.m_vertex1.x, this.m_vertex1.y);
          log("    shape.m_vertex2.Set(%.15f, %.15f);\n", this.m_vertex2.x, this.m_vertex2.y);
          log("    shape.m_vertex3.Set(%.15f, %.15f);\n", this.m_vertex3.x, this.m_vertex3.y);
          log("    shape.m_oneSided = %s;\n", this.m_oneSided);
      }
  }
  /// Implement b2Shape.
  // p = p1 + t * d
  // v = v1 + s * e
  // p1 + t * d = v1 + s * e
  // s * e - t * d = p1 - v1
  b2EdgeShape.RayCast_s_p1 = new b2Vec2();
  b2EdgeShape.RayCast_s_p2 = new b2Vec2();
  b2EdgeShape.RayCast_s_d = new b2Vec2();
  b2EdgeShape.RayCast_s_e = new b2Vec2();
  b2EdgeShape.RayCast_s_q = new b2Vec2();
  b2EdgeShape.RayCast_s_r = new b2Vec2();
  /// @see b2Shape::ComputeAABB
  b2EdgeShape.ComputeAABB_s_v1 = new b2Vec2();
  b2EdgeShape.ComputeAABB_s_v2 = new b2Vec2();

  /*
  * Copyright (c) 2006-2010 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  /// A chain shape is a free form sequence of line segments.
  /// The chain has one-sided collision, with the surface normal pointing to the right of the edge.
  /// This provides a counter-clockwise winding like the polygon shape.
  /// Connectivity information is used to create smooth collisions.
  /// @warning the chain will not collide properly if there are self-intersections.
  class b2ChainShape extends b2Shape {
      constructor() {
          super(exports.b2ShapeType.e_chainShape, b2_polygonRadius);
          this.m_vertices = [];
          this.m_count = 0;
          this.m_prevVertex = new b2Vec2();
          this.m_nextVertex = new b2Vec2();
      }
      CreateLoop(...args) {
          if (typeof args[0][0] === "number") {
              const vertices = args[0];
              if (vertices.length % 2 !== 0) {
                  throw new Error();
              }
              return this._CreateLoop((index) => ({ x: vertices[index * 2], y: vertices[index * 2 + 1] }), vertices.length / 2);
          }
          else {
              const vertices = args[0];
              const count = args[1] || vertices.length;
              return this._CreateLoop((index) => vertices[index], count);
          }
      }
      _CreateLoop(vertices, count) {
          // DEBUG: b2Assert(count >= 3);
          if (count < 3) {
              return this;
          }
          // DEBUG: for (let i: number = 1; i < count; ++i) {
          // DEBUG:   const v1 = vertices[start + i - 1];
          // DEBUG:   const v2 = vertices[start + i];
          // DEBUG:   // If the code crashes here, it means your vertices are too close together.
          // DEBUG:   b2Assert(b2Vec2.DistanceSquaredVV(v1, v2) > b2_linearSlop * b2_linearSlop);
          // DEBUG: }
          this.m_count = count + 1;
          this.m_vertices = b2Vec2.MakeArray(this.m_count);
          for (let i = 0; i < count; ++i) {
              this.m_vertices[i].Copy(vertices(i));
          }
          this.m_vertices[count].Copy(this.m_vertices[0]);
          this.m_prevVertex.Copy(this.m_vertices[this.m_count - 2]);
          this.m_nextVertex.Copy(this.m_vertices[1]);
          return this;
      }
      CreateChain(...args) {
          if (typeof args[0][0] === "number") {
              const vertices = args[0];
              const prevVertex = args[1];
              const nextVertex = args[2];
              if (vertices.length % 2 !== 0) {
                  throw new Error();
              }
              return this._CreateChain((index) => ({ x: vertices[index * 2], y: vertices[index * 2 + 1] }), vertices.length / 2, prevVertex, nextVertex);
          }
          else {
              const vertices = args[0];
              const count = args[1] || vertices.length;
              const prevVertex = args[2];
              const nextVertex = args[3];
              return this._CreateChain((index) => vertices[index], count, prevVertex, nextVertex);
          }
      }
      _CreateChain(vertices, count, prevVertex, nextVertex) {
          // DEBUG: b2Assert(count >= 2);
          // DEBUG: for (let i: number = 1; i < count; ++i) {
          // DEBUG:   const v1 = vertices[start + i - 1];
          // DEBUG:   const v2 = vertices[start + i];
          // DEBUG:   // If the code crashes here, it means your vertices are too close together.
          // DEBUG:   b2Assert(b2Vec2.DistanceSquaredVV(v1, v2) > b2_linearSlop * b2_linearSlop);
          // DEBUG: }
          this.m_count = count;
          this.m_vertices = b2Vec2.MakeArray(count);
          for (let i = 0; i < count; ++i) {
              this.m_vertices[i].Copy(vertices(i));
          }
          this.m_prevVertex.Copy(prevVertex);
          this.m_nextVertex.Copy(nextVertex);
          return this;
      }
      /// Implement b2Shape. Vertices are cloned using b2Alloc.
      Clone() {
          return new b2ChainShape().Copy(this);
      }
      Copy(other) {
          super.Copy(other);
          // DEBUG: b2Assert(other instanceof b2ChainShape);
          this._CreateChain((index) => other.m_vertices[index], other.m_count, other.m_prevVertex, other.m_nextVertex);
          this.m_prevVertex.Copy(other.m_prevVertex);
          this.m_nextVertex.Copy(other.m_nextVertex);
          return this;
      }
      /// @see b2Shape::GetChildCount
      GetChildCount() {
          // edge count = vertex count - 1
          return this.m_count - 1;
      }
      /// Get a child edge.
      GetChildEdge(edge, index) {
          // DEBUG: b2Assert(0 <= index && index < this.m_count - 1);
          edge.m_radius = this.m_radius;
          edge.m_vertex1.Copy(this.m_vertices[index]);
          edge.m_vertex2.Copy(this.m_vertices[index + 1]);
          edge.m_oneSided = true;
          if (index > 0) {
              edge.m_vertex0.Copy(this.m_vertices[index - 1]);
          }
          else {
              edge.m_vertex0.Copy(this.m_prevVertex);
          }
          if (index < this.m_count - 2) {
              edge.m_vertex3.Copy(this.m_vertices[index + 2]);
          }
          else {
              edge.m_vertex3.Copy(this.m_nextVertex);
          }
      }
      /// This always return false.
      /// @see b2Shape::TestPoint
      TestPoint(xf, p) {
          return false;
      }
      RayCast(output, input, xf, childIndex) {
          // DEBUG: b2Assert(childIndex < this.m_count);
          const edgeShape = b2ChainShape.RayCast_s_edgeShape;
          edgeShape.m_vertex1.Copy(this.m_vertices[childIndex]);
          edgeShape.m_vertex2.Copy(this.m_vertices[(childIndex + 1) % this.m_count]);
          return edgeShape.RayCast(output, input, xf, 0);
      }
      ComputeAABB(aabb, xf, childIndex) {
          // DEBUG: b2Assert(childIndex < this.m_count);
          const vertexi1 = this.m_vertices[childIndex];
          const vertexi2 = this.m_vertices[(childIndex + 1) % this.m_count];
          const v1 = b2Transform.MulXV(xf, vertexi1, b2ChainShape.ComputeAABB_s_v1);
          const v2 = b2Transform.MulXV(xf, vertexi2, b2ChainShape.ComputeAABB_s_v2);
          const lower = b2Vec2.MinV(v1, v2, b2ChainShape.ComputeAABB_s_lower);
          const upper = b2Vec2.MaxV(v1, v2, b2ChainShape.ComputeAABB_s_upper);
          aabb.lowerBound.x = lower.x - this.m_radius;
          aabb.lowerBound.y = lower.y - this.m_radius;
          aabb.upperBound.x = upper.x + this.m_radius;
          aabb.upperBound.y = upper.y + this.m_radius;
      }
      /// Chains have zero mass.
      /// @see b2Shape::ComputeMass
      ComputeMass(massData, density) {
          massData.mass = 0;
          massData.center.SetZero();
          massData.I = 0;
      }
      SetupDistanceProxy(proxy, index) {
          // DEBUG: b2Assert(0 <= index && index < this.m_count);
          proxy.m_vertices = proxy.m_buffer;
          proxy.m_vertices[0].Copy(this.m_vertices[index]);
          if (index + 1 < this.m_count) {
              proxy.m_vertices[1].Copy(this.m_vertices[index + 1]);
          }
          else {
              proxy.m_vertices[1].Copy(this.m_vertices[0]);
          }
          proxy.m_count = 2;
          proxy.m_radius = this.m_radius;
      }
      ComputeSubmergedArea(normal, offset, xf, c) {
          c.SetZero();
          return 0;
      }
      Dump(log) {
          log("    const shape: b2ChainShape = new b2ChainShape();\n");
          log("    const vs: b2Vec2[] = [];\n");
          for (let i = 0; i < this.m_count; ++i) {
              log("    vs[%d] = new bVec2(%.15f, %.15f);\n", i, this.m_vertices[i].x, this.m_vertices[i].y);
          }
          log("    shape.CreateChain(vs, %d);\n", this.m_count);
          log("    shape.m_prevVertex.Set(%.15f, %.15f);\n", this.m_prevVertex.x, this.m_prevVertex.y);
          log("    shape.m_nextVertex.Set(%.15f, %.15f);\n", this.m_nextVertex.x, this.m_nextVertex.y);
      }
  }
  /// Implement b2Shape.
  b2ChainShape.RayCast_s_edgeShape = new b2EdgeShape();
  /// @see b2Shape::ComputeAABB
  b2ChainShape.ComputeAABB_s_v1 = new b2Vec2();
  b2ChainShape.ComputeAABB_s_v2 = new b2Vec2();
  b2ChainShape.ComputeAABB_s_lower = new b2Vec2();
  b2ChainShape.ComputeAABB_s_upper = new b2Vec2();

  /*
  * Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  /// A solid circle shape
  class b2CircleShape extends b2Shape {
      constructor(radius = 0) {
          super(exports.b2ShapeType.e_circleShape, radius);
          this.m_p = new b2Vec2();
      }
      Set(position, radius = this.m_radius) {
          this.m_p.Copy(position);
          this.m_radius = radius;
          return this;
      }
      /// Implement b2Shape.
      Clone() {
          return new b2CircleShape().Copy(this);
      }
      Copy(other) {
          super.Copy(other);
          // DEBUG: b2Assert(other instanceof b2CircleShape);
          this.m_p.Copy(other.m_p);
          return this;
      }
      /// @see b2Shape::GetChildCount
      GetChildCount() {
          return 1;
      }
      TestPoint(transform, p) {
          const center = b2Transform.MulXV(transform, this.m_p, b2CircleShape.TestPoint_s_center);
          const d = b2Vec2.SubVV(p, center, b2CircleShape.TestPoint_s_d);
          return b2Vec2.DotVV(d, d) <= b2Sq(this.m_radius);
      }
      RayCast(output, input, transform, childIndex) {
          const position = b2Transform.MulXV(transform, this.m_p, b2CircleShape.RayCast_s_position);
          const s = b2Vec2.SubVV(input.p1, position, b2CircleShape.RayCast_s_s);
          const b = b2Vec2.DotVV(s, s) - b2Sq(this.m_radius);
          // Solve quadratic equation.
          const r = b2Vec2.SubVV(input.p2, input.p1, b2CircleShape.RayCast_s_r);
          const c = b2Vec2.DotVV(s, r);
          const rr = b2Vec2.DotVV(r, r);
          const sigma = c * c - rr * b;
          // Check for negative discriminant and short segment.
          if (sigma < 0 || rr < b2_epsilon) {
              return false;
          }
          // Find the point of intersection of the line with the circle.
          let a = (-(c + b2Sqrt(sigma)));
          // Is the intersection point on the segment?
          if (0 <= a && a <= input.maxFraction * rr) {
              a /= rr;
              output.fraction = a;
              b2Vec2.AddVMulSV(s, a, r, output.normal).SelfNormalize();
              return true;
          }
          return false;
      }
      ComputeAABB(aabb, transform, childIndex) {
          const p = b2Transform.MulXV(transform, this.m_p, b2CircleShape.ComputeAABB_s_p);
          aabb.lowerBound.Set(p.x - this.m_radius, p.y - this.m_radius);
          aabb.upperBound.Set(p.x + this.m_radius, p.y + this.m_radius);
      }
      /// @see b2Shape::ComputeMass
      ComputeMass(massData, density) {
          const radius_sq = b2Sq(this.m_radius);
          massData.mass = density * b2_pi * radius_sq;
          massData.center.Copy(this.m_p);
          // inertia about the local origin
          massData.I = massData.mass * (0.5 * radius_sq + b2Vec2.DotVV(this.m_p, this.m_p));
      }
      SetupDistanceProxy(proxy, index) {
          proxy.m_vertices = proxy.m_buffer;
          proxy.m_vertices[0].Copy(this.m_p);
          proxy.m_count = 1;
          proxy.m_radius = this.m_radius;
      }
      ComputeSubmergedArea(normal, offset, xf, c) {
          const p = b2Transform.MulXV(xf, this.m_p, new b2Vec2());
          const l = (-(b2Vec2.DotVV(normal, p) - offset));
          if (l < (-this.m_radius) + b2_epsilon) {
              // Completely dry
              return 0;
          }
          if (l > this.m_radius) {
              // Completely wet
              c.Copy(p);
              return b2_pi * this.m_radius * this.m_radius;
          }
          // Magic
          const r2 = this.m_radius * this.m_radius;
          const l2 = l * l;
          const area = r2 * (b2Asin(l / this.m_radius) + b2_pi / 2) + l * b2Sqrt(r2 - l2);
          const com = (-2 / 3 * b2Pow(r2 - l2, 1.5) / area);
          c.x = p.x + normal.x * com;
          c.y = p.y + normal.y * com;
          return area;
      }
      Dump(log) {
          log("    const shape: b2CircleShape = new b2CircleShape();\n");
          log("    shape.m_radius = %.15f;\n", this.m_radius);
          log("    shape.m_p.Set(%.15f, %.15f);\n", this.m_p.x, this.m_p.y);
      }
  }
  /// Implement b2Shape.
  b2CircleShape.TestPoint_s_center = new b2Vec2();
  b2CircleShape.TestPoint_s_d = new b2Vec2();
  /// Implement b2Shape.
  /// @note because the circle is solid, rays that start inside do not hit because the normal is
  /// not defined.
  // Collision Detection in Interactive 3D Environments by Gino van den Bergen
  // From Section 3.1.2
  // x = s + a * r
  // norm(x) = radius
  b2CircleShape.RayCast_s_position = new b2Vec2();
  b2CircleShape.RayCast_s_s = new b2Vec2();
  b2CircleShape.RayCast_s_r = new b2Vec2();
  /// @see b2Shape::ComputeAABB
  b2CircleShape.ComputeAABB_s_p = new b2Vec2();

  const b2CollideCircles_s_pA = new b2Vec2();
  const b2CollideCircles_s_pB = new b2Vec2();
  function b2CollideCircles(manifold, circleA, xfA, circleB, xfB) {
      manifold.pointCount = 0;
      const pA = b2Transform.MulXV(xfA, circleA.m_p, b2CollideCircles_s_pA);
      const pB = b2Transform.MulXV(xfB, circleB.m_p, b2CollideCircles_s_pB);
      const distSqr = b2Vec2.DistanceSquaredVV(pA, pB);
      const radius = circleA.m_radius + circleB.m_radius;
      if (distSqr > radius * radius) {
          return;
      }
      manifold.type = exports.b2ManifoldType.e_circles;
      manifold.localPoint.Copy(circleA.m_p);
      manifold.localNormal.SetZero();
      manifold.pointCount = 1;
      manifold.points[0].localPoint.Copy(circleB.m_p);
      manifold.points[0].id.key = 0;
  }
  const b2CollidePolygonAndCircle_s_c = new b2Vec2();
  const b2CollidePolygonAndCircle_s_cLocal = new b2Vec2();
  const b2CollidePolygonAndCircle_s_faceCenter = new b2Vec2();
  function b2CollidePolygonAndCircle(manifold, polygonA, xfA, circleB, xfB) {
      manifold.pointCount = 0;
      // Compute circle position in the frame of the polygon.
      const c = b2Transform.MulXV(xfB, circleB.m_p, b2CollidePolygonAndCircle_s_c);
      const cLocal = b2Transform.MulTXV(xfA, c, b2CollidePolygonAndCircle_s_cLocal);
      // Find the min separating edge.
      let normalIndex = 0;
      let separation = (-b2_maxFloat);
      const radius = polygonA.m_radius + circleB.m_radius;
      const vertexCount = polygonA.m_count;
      const vertices = polygonA.m_vertices;
      const normals = polygonA.m_normals;
      for (let i = 0; i < vertexCount; ++i) {
          const s = b2Vec2.DotVV(normals[i], b2Vec2.SubVV(cLocal, vertices[i], b2Vec2.s_t0));
          if (s > radius) {
              // Early out.
              return;
          }
          if (s > separation) {
              separation = s;
              normalIndex = i;
          }
      }
      // Vertices that subtend the incident face.
      const vertIndex1 = normalIndex;
      const vertIndex2 = (vertIndex1 + 1) % vertexCount;
      const v1 = vertices[vertIndex1];
      const v2 = vertices[vertIndex2];
      // If the center is inside the polygon ...
      if (separation < b2_epsilon) {
          manifold.pointCount = 1;
          manifold.type = exports.b2ManifoldType.e_faceA;
          manifold.localNormal.Copy(normals[normalIndex]);
          b2Vec2.MidVV(v1, v2, manifold.localPoint);
          manifold.points[0].localPoint.Copy(circleB.m_p);
          manifold.points[0].id.key = 0;
          return;
      }
      // Compute barycentric coordinates
      const u1 = b2Vec2.DotVV(b2Vec2.SubVV(cLocal, v1, b2Vec2.s_t0), b2Vec2.SubVV(v2, v1, b2Vec2.s_t1));
      const u2 = b2Vec2.DotVV(b2Vec2.SubVV(cLocal, v2, b2Vec2.s_t0), b2Vec2.SubVV(v1, v2, b2Vec2.s_t1));
      if (u1 <= 0) {
          if (b2Vec2.DistanceSquaredVV(cLocal, v1) > radius * radius) {
              return;
          }
          manifold.pointCount = 1;
          manifold.type = exports.b2ManifoldType.e_faceA;
          b2Vec2.SubVV(cLocal, v1, manifold.localNormal).SelfNormalize();
          manifold.localPoint.Copy(v1);
          manifold.points[0].localPoint.Copy(circleB.m_p);
          manifold.points[0].id.key = 0;
      }
      else if (u2 <= 0) {
          if (b2Vec2.DistanceSquaredVV(cLocal, v2) > radius * radius) {
              return;
          }
          manifold.pointCount = 1;
          manifold.type = exports.b2ManifoldType.e_faceA;
          b2Vec2.SubVV(cLocal, v2, manifold.localNormal).SelfNormalize();
          manifold.localPoint.Copy(v2);
          manifold.points[0].localPoint.Copy(circleB.m_p);
          manifold.points[0].id.key = 0;
      }
      else {
          const faceCenter = b2Vec2.MidVV(v1, v2, b2CollidePolygonAndCircle_s_faceCenter);
          const separation = b2Vec2.DotVV(b2Vec2.SubVV(cLocal, faceCenter, b2Vec2.s_t1), normals[vertIndex1]);
          if (separation > radius) {
              return;
          }
          manifold.pointCount = 1;
          manifold.type = exports.b2ManifoldType.e_faceA;
          manifold.localNormal.Copy(normals[vertIndex1]).SelfNormalize();
          manifold.localPoint.Copy(faceCenter);
          manifold.points[0].localPoint.Copy(circleB.m_p);
          manifold.points[0].id.key = 0;
      }
  }

  // DEBUG: import { b2Assert } from "../common/b2_settings.js";
  const b2CollideEdgeAndCircle_s_Q = new b2Vec2();
  const b2CollideEdgeAndCircle_s_e = new b2Vec2();
  const b2CollideEdgeAndCircle_s_d = new b2Vec2();
  const b2CollideEdgeAndCircle_s_e1 = new b2Vec2();
  const b2CollideEdgeAndCircle_s_e2 = new b2Vec2();
  const b2CollideEdgeAndCircle_s_P = new b2Vec2();
  const b2CollideEdgeAndCircle_s_n = new b2Vec2();
  const b2CollideEdgeAndCircle_s_id = new b2ContactID();
  function b2CollideEdgeAndCircle(manifold, edgeA, xfA, circleB, xfB) {
      manifold.pointCount = 0;
      // Compute circle in frame of edge
      const Q = b2Transform.MulTXV(xfA, b2Transform.MulXV(xfB, circleB.m_p, b2Vec2.s_t0), b2CollideEdgeAndCircle_s_Q);
      const A = edgeA.m_vertex1;
      const B = edgeA.m_vertex2;
      const e = b2Vec2.SubVV(B, A, b2CollideEdgeAndCircle_s_e);
      // Normal points to the right for a CCW winding
      // b2Vec2 n(e.y, -e.x);
      // const n: b2Vec2 = b2CollideEdgeAndCircle_s_n.Set(-e.y, e.x);
      const n = b2CollideEdgeAndCircle_s_n.Set(e.y, -e.x);
      // float offset = b2Dot(n, Q - A);
      const offset = b2Vec2.DotVV(n, b2Vec2.SubVV(Q, A, b2Vec2.s_t0));
      const oneSided = edgeA.m_oneSided;
      if (oneSided && offset < 0.0) {
          return;
      }
      // Barycentric coordinates
      const u = b2Vec2.DotVV(e, b2Vec2.SubVV(B, Q, b2Vec2.s_t0));
      const v = b2Vec2.DotVV(e, b2Vec2.SubVV(Q, A, b2Vec2.s_t0));
      const radius = edgeA.m_radius + circleB.m_radius;
      // const cf: b2ContactFeature = new b2ContactFeature();
      const id = b2CollideEdgeAndCircle_s_id;
      id.cf.indexB = 0;
      id.cf.typeB = exports.b2ContactFeatureType.e_vertex;
      // Region A
      if (v <= 0) {
          const P = A;
          const d = b2Vec2.SubVV(Q, P, b2CollideEdgeAndCircle_s_d);
          const dd = b2Vec2.DotVV(d, d);
          if (dd > radius * radius) {
              return;
          }
          // Is there an edge connected to A?
          if (edgeA.m_oneSided) {
              const A1 = edgeA.m_vertex0;
              const B1 = A;
              const e1 = b2Vec2.SubVV(B1, A1, b2CollideEdgeAndCircle_s_e1);
              const u1 = b2Vec2.DotVV(e1, b2Vec2.SubVV(B1, Q, b2Vec2.s_t0));
              // Is the circle in Region AB of the previous edge?
              if (u1 > 0) {
                  return;
              }
          }
          id.cf.indexA = 0;
          id.cf.typeA = exports.b2ContactFeatureType.e_vertex;
          manifold.pointCount = 1;
          manifold.type = exports.b2ManifoldType.e_circles;
          manifold.localNormal.SetZero();
          manifold.localPoint.Copy(P);
          manifold.points[0].id.Copy(id);
          // manifold.points[0].id.key = 0;
          // manifold.points[0].id.cf = cf;
          manifold.points[0].localPoint.Copy(circleB.m_p);
          return;
      }
      // Region B
      if (u <= 0) {
          const P = B;
          const d = b2Vec2.SubVV(Q, P, b2CollideEdgeAndCircle_s_d);
          const dd = b2Vec2.DotVV(d, d);
          if (dd > radius * radius) {
              return;
          }
          // Is there an edge connected to B?
          if (edgeA.m_oneSided) {
              const B2 = edgeA.m_vertex3;
              const A2 = B;
              const e2 = b2Vec2.SubVV(B2, A2, b2CollideEdgeAndCircle_s_e2);
              const v2 = b2Vec2.DotVV(e2, b2Vec2.SubVV(Q, A2, b2Vec2.s_t0));
              // Is the circle in Region AB of the next edge?
              if (v2 > 0) {
                  return;
              }
          }
          id.cf.indexA = 1;
          id.cf.typeA = exports.b2ContactFeatureType.e_vertex;
          manifold.pointCount = 1;
          manifold.type = exports.b2ManifoldType.e_circles;
          manifold.localNormal.SetZero();
          manifold.localPoint.Copy(P);
          manifold.points[0].id.Copy(id);
          // manifold.points[0].id.key = 0;
          // manifold.points[0].id.cf = cf;
          manifold.points[0].localPoint.Copy(circleB.m_p);
          return;
      }
      // Region AB
      const den = b2Vec2.DotVV(e, e);
      // DEBUG: b2Assert(den > 0);
      const P = b2CollideEdgeAndCircle_s_P;
      P.x = (1 / den) * (u * A.x + v * B.x);
      P.y = (1 / den) * (u * A.y + v * B.y);
      const d = b2Vec2.SubVV(Q, P, b2CollideEdgeAndCircle_s_d);
      const dd = b2Vec2.DotVV(d, d);
      if (dd > radius * radius) {
          return;
      }
      if (offset < 0) {
          n.Set(-n.x, -n.y);
      }
      n.Normalize();
      id.cf.indexA = 0;
      id.cf.typeA = exports.b2ContactFeatureType.e_face;
      manifold.pointCount = 1;
      manifold.type = exports.b2ManifoldType.e_faceA;
      manifold.localNormal.Copy(n);
      manifold.localPoint.Copy(A);
      manifold.points[0].id.Copy(id);
      // manifold.points[0].id.key = 0;
      // manifold.points[0].id.cf = cf;
      manifold.points[0].localPoint.Copy(circleB.m_p);
  }
  var b2EPAxisType;
  (function (b2EPAxisType) {
      b2EPAxisType[b2EPAxisType["e_unknown"] = 0] = "e_unknown";
      b2EPAxisType[b2EPAxisType["e_edgeA"] = 1] = "e_edgeA";
      b2EPAxisType[b2EPAxisType["e_edgeB"] = 2] = "e_edgeB";
  })(b2EPAxisType || (b2EPAxisType = {}));
  class b2EPAxis {
      constructor() {
          this.normal = new b2Vec2();
          this.type = b2EPAxisType.e_unknown;
          this.index = 0;
          this.separation = 0;
      }
  }
  class b2TempPolygon {
      constructor() {
          this.vertices = [];
          this.normals = [];
          this.count = 0;
      }
  }
  class b2ReferenceFace {
      constructor() {
          this.i1 = 0;
          this.i2 = 0;
          this.v1 = new b2Vec2();
          this.v2 = new b2Vec2();
          this.normal = new b2Vec2();
          this.sideNormal1 = new b2Vec2();
          this.sideOffset1 = 0;
          this.sideNormal2 = new b2Vec2();
          this.sideOffset2 = 0;
      }
  }
  // static b2EPAxis b2ComputeEdgeSeparation(const b2TempPolygon& polygonB, const b2Vec2& v1, const b2Vec2& normal1)
  const b2ComputeEdgeSeparation_s_axis = new b2EPAxis();
  const b2ComputeEdgeSeparation_s_axes = [new b2Vec2(), new b2Vec2()];
  function b2ComputeEdgeSeparation(polygonB, v1, normal1) {
      // b2EPAxis axis;
      const axis = b2ComputeEdgeSeparation_s_axis;
      axis.type = b2EPAxisType.e_edgeA;
      axis.index = -1;
      axis.separation = -Number.MAX_VALUE; // -FLT_MAX;
      axis.normal.SetZero();
      // b2Vec2 axes[2] = { normal1, -normal1 };
      const axes = b2ComputeEdgeSeparation_s_axes;
      axes[0].Copy(normal1);
      axes[1].Copy(normal1).SelfNeg();
      // Find axis with least overlap (min-max problem)
      for (let j = 0; j < 2; ++j) {
          let sj = Number.MAX_VALUE; // FLT_MAX;
          // Find deepest polygon vertex along axis j
          for (let i = 0; i < polygonB.count; ++i) {
              // float si = b2Dot(axes[j], polygonB.vertices[i] - v1);
              const si = b2Vec2.DotVV(axes[j], b2Vec2.SubVV(polygonB.vertices[i], v1, b2Vec2.s_t0));
              if (si < sj) {
                  sj = si;
              }
          }
          if (sj > axis.separation) {
              axis.index = j;
              axis.separation = sj;
              axis.normal.Copy(axes[j]);
          }
      }
      return axis;
  }
  // static b2EPAxis b2ComputePolygonSeparation(const b2TempPolygon& polygonB, const b2Vec2& v1, const b2Vec2& v2)
  const b2ComputePolygonSeparation_s_axis = new b2EPAxis();
  const b2ComputePolygonSeparation_s_n = new b2Vec2();
  function b2ComputePolygonSeparation(polygonB, v1, v2) {
      const axis = b2ComputePolygonSeparation_s_axis;
      axis.type = b2EPAxisType.e_unknown;
      axis.index = -1;
      axis.separation = -Number.MAX_VALUE; // -FLT_MAX;
      axis.normal.SetZero();
      for (let i = 0; i < polygonB.count; ++i) {
          // b2Vec2 n = -polygonB.normals[i];
          const n = b2Vec2.NegV(polygonB.normals[i], b2ComputePolygonSeparation_s_n);
          // float s1 = b2Dot(n, polygonB.vertices[i] - v1);
          const s1 = b2Vec2.DotVV(n, b2Vec2.SubVV(polygonB.vertices[i], v1, b2Vec2.s_t0));
          // float s2 = b2Dot(n, polygonB.vertices[i] - v2);
          const s2 = b2Vec2.DotVV(n, b2Vec2.SubVV(polygonB.vertices[i], v2, b2Vec2.s_t0));
          // float s = b2Min(s1, s2);
          const s = b2Min(s1, s2);
          if (s > axis.separation) {
              axis.type = b2EPAxisType.e_edgeB;
              axis.index = i;
              axis.separation = s;
              axis.normal.Copy(n);
          }
      }
      return axis;
  }
  const b2CollideEdgeAndPolygon_s_xf = new b2Transform();
  const b2CollideEdgeAndPolygon_s_centroidB = new b2Vec2();
  const b2CollideEdgeAndPolygon_s_edge1 = new b2Vec2();
  const b2CollideEdgeAndPolygon_s_normal1 = new b2Vec2();
  const b2CollideEdgeAndPolygon_s_edge0 = new b2Vec2();
  const b2CollideEdgeAndPolygon_s_normal0 = new b2Vec2();
  const b2CollideEdgeAndPolygon_s_edge2 = new b2Vec2();
  const b2CollideEdgeAndPolygon_s_normal2 = new b2Vec2();
  const b2CollideEdgeAndPolygon_s_tempPolygonB = new b2TempPolygon();
  const b2CollideEdgeAndPolygon_s_ref = new b2ReferenceFace();
  const b2CollideEdgeAndPolygon_s_clipPoints = [new b2ClipVertex(), new b2ClipVertex()];
  const b2CollideEdgeAndPolygon_s_clipPoints1 = [new b2ClipVertex(), new b2ClipVertex()];
  const b2CollideEdgeAndPolygon_s_clipPoints2 = [new b2ClipVertex(), new b2ClipVertex()];
  function b2CollideEdgeAndPolygon(manifold, edgeA, xfA, polygonB, xfB) {
      manifold.pointCount = 0;
      // b2Transform xf = b2MulT(xfA, xfB);
      const xf = b2Transform.MulTXX(xfA, xfB, b2CollideEdgeAndPolygon_s_xf);
      // b2Vec2 centroidB = b2Mul(xf, polygonB.m_centroid);
      const centroidB = b2Transform.MulXV(xf, polygonB.m_centroid, b2CollideEdgeAndPolygon_s_centroidB);
      // b2Vec2 v1 = edgeA.m_vertex1;
      const v1 = edgeA.m_vertex1;
      // b2Vec2 v2 = edgeA.m_vertex2;
      const v2 = edgeA.m_vertex2;
      // b2Vec2 edge1 = v2 - v1;
      const edge1 = b2Vec2.SubVV(v2, v1, b2CollideEdgeAndPolygon_s_edge1);
      edge1.Normalize();
      // Normal points to the right for a CCW winding
      // b2Vec2 normal1(edge1.y, -edge1.x);
      const normal1 = b2CollideEdgeAndPolygon_s_normal1.Set(edge1.y, -edge1.x);
      // float offset1 = b2Dot(normal1, centroidB - v1);
      const offset1 = b2Vec2.DotVV(normal1, b2Vec2.SubVV(centroidB, v1, b2Vec2.s_t0));
      const oneSided = edgeA.m_oneSided;
      if (oneSided && offset1 < 0.0) {
          return;
      }
      // Get polygonB in frameA
      // b2TempPolygon tempPolygonB;
      const tempPolygonB = b2CollideEdgeAndPolygon_s_tempPolygonB;
      tempPolygonB.count = polygonB.m_count;
      for (let i = 0; i < polygonB.m_count; ++i) {
          if (tempPolygonB.vertices.length <= i) {
              tempPolygonB.vertices.push(new b2Vec2());
          }
          if (tempPolygonB.normals.length <= i) {
              tempPolygonB.normals.push(new b2Vec2());
          }
          // tempPolygonB.vertices[i] = b2Mul(xf, polygonB.m_vertices[i]);
          b2Transform.MulXV(xf, polygonB.m_vertices[i], tempPolygonB.vertices[i]);
          // tempPolygonB.normals[i] = b2Mul(xf.q, polygonB.m_normals[i]);
          b2Rot.MulRV(xf.q, polygonB.m_normals[i], tempPolygonB.normals[i]);
      }
      const radius = polygonB.m_radius + edgeA.m_radius;
      // b2EPAxis edgeAxis = b2ComputeEdgeSeparation(tempPolygonB, v1, normal1);
      const edgeAxis = b2ComputeEdgeSeparation(tempPolygonB, v1, normal1);
      if (edgeAxis.separation > radius) {
          return;
      }
      // b2EPAxis polygonAxis = b2ComputePolygonSeparation(tedge0.y, -edge0.xempPolygonB, v1, v2);
      const polygonAxis = b2ComputePolygonSeparation(tempPolygonB, v1, v2);
      if (polygonAxis.separation > radius) {
          return;
      }
      // Use hysteresis for jitter reduction.
      const k_relativeTol = 0.98;
      const k_absoluteTol = 0.001;
      // b2EPAxis primaryAxis;
      let primaryAxis;
      if (polygonAxis.separation - radius > k_relativeTol * (edgeAxis.separation - radius) + k_absoluteTol) {
          primaryAxis = polygonAxis;
      }
      else {
          primaryAxis = edgeAxis;
      }
      if (oneSided) {
          // Smooth collision
          // See https://box2d.org/posts/2020/06/ghost-collisions/
          // b2Vec2 edge0 = v1 - edgeA.m_vertex0;
          const edge0 = b2Vec2.SubVV(v1, edgeA.m_vertex0, b2CollideEdgeAndPolygon_s_edge0);
          edge0.Normalize();
          // b2Vec2 normal0(edge0.y, -edge0.x);
          const normal0 = b2CollideEdgeAndPolygon_s_normal0.Set(edge0.y, -edge0.x);
          const convex1 = b2Vec2.CrossVV(edge0, edge1) >= 0.0;
          // b2Vec2 edge2 = edgeA.m_vertex3 - v2;
          const edge2 = b2Vec2.SubVV(edgeA.m_vertex3, v2, b2CollideEdgeAndPolygon_s_edge2);
          edge2.Normalize();
          // b2Vec2 normal2(edge2.y, -edge2.x);
          const normal2 = b2CollideEdgeAndPolygon_s_normal2.Set(edge2.y, -edge2.x);
          const convex2 = b2Vec2.CrossVV(edge1, edge2) >= 0.0;
          const sinTol = 0.1;
          const side1 = b2Vec2.DotVV(primaryAxis.normal, edge1) <= 0.0;
          // Check Gauss Map
          if (side1) {
              if (convex1) {
                  if (b2Vec2.CrossVV(primaryAxis.normal, normal0) > sinTol) {
                      // Skip region
                      return;
                  }
                  // Admit region
              }
              else {
                  // Snap region
                  primaryAxis = edgeAxis;
              }
          }
          else {
              if (convex2) {
                  if (b2Vec2.CrossVV(normal2, primaryAxis.normal) > sinTol) {
                      // Skip region
                      return;
                  }
                  // Admit region
              }
              else {
                  // Snap region
                  primaryAxis = edgeAxis;
              }
          }
      }
      // b2ClipVertex clipPoints[2];
      const clipPoints = b2CollideEdgeAndPolygon_s_clipPoints;
      // b2ReferenceFace ref;
      const ref = b2CollideEdgeAndPolygon_s_ref;
      if (primaryAxis.type === b2EPAxisType.e_edgeA) {
          manifold.type = exports.b2ManifoldType.e_faceA;
          // Search for the polygon normal that is most anti-parallel to the edge normal.
          let bestIndex = 0;
          let bestValue = b2Vec2.DotVV(primaryAxis.normal, tempPolygonB.normals[0]);
          for (let i = 1; i < tempPolygonB.count; ++i) {
              const value = b2Vec2.DotVV(primaryAxis.normal, tempPolygonB.normals[i]);
              if (value < bestValue) {
                  bestValue = value;
                  bestIndex = i;
              }
          }
          const i1 = bestIndex;
          const i2 = i1 + 1 < tempPolygonB.count ? i1 + 1 : 0;
          clipPoints[0].v.Copy(tempPolygonB.vertices[i1]);
          clipPoints[0].id.cf.indexA = 0;
          clipPoints[0].id.cf.indexB = i1;
          clipPoints[0].id.cf.typeA = exports.b2ContactFeatureType.e_face;
          clipPoints[0].id.cf.typeB = exports.b2ContactFeatureType.e_vertex;
          clipPoints[1].v.Copy(tempPolygonB.vertices[i2]);
          clipPoints[1].id.cf.indexA = 0;
          clipPoints[1].id.cf.indexB = i2;
          clipPoints[1].id.cf.typeA = exports.b2ContactFeatureType.e_face;
          clipPoints[1].id.cf.typeB = exports.b2ContactFeatureType.e_vertex;
          ref.i1 = 0;
          ref.i2 = 1;
          ref.v1.Copy(v1);
          ref.v2.Copy(v2);
          ref.normal.Copy(primaryAxis.normal);
          ref.sideNormal1.Copy(edge1).SelfNeg(); // ref.sideNormal1 = -edge1;
          ref.sideNormal2.Copy(edge1);
      }
      else {
          manifold.type = exports.b2ManifoldType.e_faceB;
          clipPoints[0].v.Copy(v2);
          clipPoints[0].id.cf.indexA = 1;
          clipPoints[0].id.cf.indexB = primaryAxis.index;
          clipPoints[0].id.cf.typeA = exports.b2ContactFeatureType.e_vertex;
          clipPoints[0].id.cf.typeB = exports.b2ContactFeatureType.e_face;
          clipPoints[1].v.Copy(v1);
          clipPoints[1].id.cf.indexA = 0;
          clipPoints[1].id.cf.indexB = primaryAxis.index;
          clipPoints[1].id.cf.typeA = exports.b2ContactFeatureType.e_vertex;
          clipPoints[1].id.cf.typeB = exports.b2ContactFeatureType.e_face;
          ref.i1 = primaryAxis.index;
          ref.i2 = ref.i1 + 1 < tempPolygonB.count ? ref.i1 + 1 : 0;
          ref.v1.Copy(tempPolygonB.vertices[ref.i1]);
          ref.v2.Copy(tempPolygonB.vertices[ref.i2]);
          ref.normal.Copy(tempPolygonB.normals[ref.i1]);
          // CCW winding
          ref.sideNormal1.Set(ref.normal.y, -ref.normal.x);
          ref.sideNormal2.Copy(ref.sideNormal1).SelfNeg(); // ref.sideNormal2 = -ref.sideNormal1;
      }
      ref.sideOffset1 = b2Vec2.DotVV(ref.sideNormal1, ref.v1);
      ref.sideOffset2 = b2Vec2.DotVV(ref.sideNormal2, ref.v2);
      // Clip incident edge against reference face side planes
      // b2ClipVertex clipPoints1[2];
      const clipPoints1 = b2CollideEdgeAndPolygon_s_clipPoints1; // [new b2ClipVertex(), new b2ClipVertex()];
      // b2ClipVertex clipPoints2[2];
      const clipPoints2 = b2CollideEdgeAndPolygon_s_clipPoints2; // [new b2ClipVertex(), new b2ClipVertex()];
      // int32 np;
      let np;
      // Clip to side 1
      np = b2ClipSegmentToLine(clipPoints1, clipPoints, ref.sideNormal1, ref.sideOffset1, ref.i1);
      if (np < b2_maxManifoldPoints) {
          return;
      }
      // Clip to side 2
      np = b2ClipSegmentToLine(clipPoints2, clipPoints1, ref.sideNormal2, ref.sideOffset2, ref.i2);
      if (np < b2_maxManifoldPoints) {
          return;
      }
      // Now clipPoints2 contains the clipped points.
      if (primaryAxis.type === b2EPAxisType.e_edgeA) {
          manifold.localNormal.Copy(ref.normal);
          manifold.localPoint.Copy(ref.v1);
      }
      else {
          manifold.localNormal.Copy(polygonB.m_normals[ref.i1]);
          manifold.localPoint.Copy(polygonB.m_vertices[ref.i1]);
      }
      let pointCount = 0;
      for (let i = 0; i < b2_maxManifoldPoints; ++i) {
          const separation = b2Vec2.DotVV(ref.normal, b2Vec2.SubVV(clipPoints2[i].v, ref.v1, b2Vec2.s_t0));
          if (separation <= radius) {
              const cp = manifold.points[pointCount];
              if (primaryAxis.type === b2EPAxisType.e_edgeA) {
                  b2Transform.MulTXV(xf, clipPoints2[i].v, cp.localPoint); // cp.localPoint = b2MulT(xf, clipPoints2[i].v);
                  cp.id.Copy(clipPoints2[i].id);
              }
              else {
                  cp.localPoint.Copy(clipPoints2[i].v);
                  cp.id.cf.typeA = clipPoints2[i].id.cf.typeB;
                  cp.id.cf.typeB = clipPoints2[i].id.cf.typeA;
                  cp.id.cf.indexA = clipPoints2[i].id.cf.indexB;
                  cp.id.cf.indexB = clipPoints2[i].id.cf.indexA;
              }
              ++pointCount;
          }
      }
      manifold.pointCount = pointCount;
  }

  // MIT License
  // Find the max separation between poly1 and poly2 using edge normals from poly1.
  const b2FindMaxSeparation_s_xf = new b2Transform();
  const b2FindMaxSeparation_s_n = new b2Vec2();
  const b2FindMaxSeparation_s_v1 = new b2Vec2();
  function b2FindMaxSeparation(edgeIndex, poly1, xf1, poly2, xf2) {
      const count1 = poly1.m_count;
      const count2 = poly2.m_count;
      const n1s = poly1.m_normals;
      const v1s = poly1.m_vertices;
      const v2s = poly2.m_vertices;
      const xf = b2Transform.MulTXX(xf2, xf1, b2FindMaxSeparation_s_xf);
      let bestIndex = 0;
      let maxSeparation = -b2_maxFloat;
      for (let i = 0; i < count1; ++i) {
          // Get poly1 normal in frame2.
          const n = b2Rot.MulRV(xf.q, n1s[i], b2FindMaxSeparation_s_n);
          const v1 = b2Transform.MulXV(xf, v1s[i], b2FindMaxSeparation_s_v1);
          // Find deepest point for normal i.
          let si = b2_maxFloat;
          for (let j = 0; j < count2; ++j) {
              const sij = b2Vec2.DotVV(n, b2Vec2.SubVV(v2s[j], v1, b2Vec2.s_t0));
              if (sij < si) {
                  si = sij;
              }
          }
          if (si > maxSeparation) {
              maxSeparation = si;
              bestIndex = i;
          }
      }
      edgeIndex[0] = bestIndex;
      return maxSeparation;
  }
  const b2FindIncidentEdge_s_normal1 = new b2Vec2();
  function b2FindIncidentEdge(c, poly1, xf1, edge1, poly2, xf2) {
      const normals1 = poly1.m_normals;
      const count2 = poly2.m_count;
      const vertices2 = poly2.m_vertices;
      const normals2 = poly2.m_normals;
      // DEBUG: b2Assert(0 <= edge1 && edge1 < poly1.m_count);
      // Get the normal of the reference edge in poly2's frame.
      const normal1 = b2Rot.MulTRV(xf2.q, b2Rot.MulRV(xf1.q, normals1[edge1], b2Vec2.s_t0), b2FindIncidentEdge_s_normal1);
      // Find the incident edge on poly2.
      let index = 0;
      let minDot = b2_maxFloat;
      for (let i = 0; i < count2; ++i) {
          const dot = b2Vec2.DotVV(normal1, normals2[i]);
          if (dot < minDot) {
              minDot = dot;
              index = i;
          }
      }
      // Build the clip vertices for the incident edge.
      const i1 = index;
      const i2 = i1 + 1 < count2 ? i1 + 1 : 0;
      const c0 = c[0];
      b2Transform.MulXV(xf2, vertices2[i1], c0.v);
      const cf0 = c0.id.cf;
      cf0.indexA = edge1;
      cf0.indexB = i1;
      cf0.typeA = exports.b2ContactFeatureType.e_face;
      cf0.typeB = exports.b2ContactFeatureType.e_vertex;
      const c1 = c[1];
      b2Transform.MulXV(xf2, vertices2[i2], c1.v);
      const cf1 = c1.id.cf;
      cf1.indexA = edge1;
      cf1.indexB = i2;
      cf1.typeA = exports.b2ContactFeatureType.e_face;
      cf1.typeB = exports.b2ContactFeatureType.e_vertex;
  }
  // Find edge normal of max separation on A - return if separating axis is found
  // Find edge normal of max separation on B - return if separation axis is found
  // Choose reference edge as min(minA, minB)
  // Find incident edge
  // Clip
  // The normal points from 1 to 2
  const b2CollidePolygons_s_incidentEdge = [new b2ClipVertex(), new b2ClipVertex()];
  const b2CollidePolygons_s_clipPoints1 = [new b2ClipVertex(), new b2ClipVertex()];
  const b2CollidePolygons_s_clipPoints2 = [new b2ClipVertex(), new b2ClipVertex()];
  const b2CollidePolygons_s_edgeA = [0];
  const b2CollidePolygons_s_edgeB = [0];
  const b2CollidePolygons_s_localTangent = new b2Vec2();
  const b2CollidePolygons_s_localNormal = new b2Vec2();
  const b2CollidePolygons_s_planePoint = new b2Vec2();
  const b2CollidePolygons_s_normal = new b2Vec2();
  const b2CollidePolygons_s_tangent = new b2Vec2();
  const b2CollidePolygons_s_ntangent = new b2Vec2();
  const b2CollidePolygons_s_v11 = new b2Vec2();
  const b2CollidePolygons_s_v12 = new b2Vec2();
  function b2CollidePolygons(manifold, polyA, xfA, polyB, xfB) {
      manifold.pointCount = 0;
      const totalRadius = polyA.m_radius + polyB.m_radius;
      const edgeA = b2CollidePolygons_s_edgeA;
      edgeA[0] = 0;
      const separationA = b2FindMaxSeparation(edgeA, polyA, xfA, polyB, xfB);
      if (separationA > totalRadius) {
          return;
      }
      const edgeB = b2CollidePolygons_s_edgeB;
      edgeB[0] = 0;
      const separationB = b2FindMaxSeparation(edgeB, polyB, xfB, polyA, xfA);
      if (separationB > totalRadius) {
          return;
      }
      let poly1; // reference polygon
      let poly2; // incident polygon
      let xf1, xf2;
      let edge1 = 0; // reference edge
      let flip = 0;
      const k_tol = 0.1 * b2_linearSlop;
      if (separationB > separationA + k_tol) {
          poly1 = polyB;
          poly2 = polyA;
          xf1 = xfB;
          xf2 = xfA;
          edge1 = edgeB[0];
          manifold.type = exports.b2ManifoldType.e_faceB;
          flip = 1;
      }
      else {
          poly1 = polyA;
          poly2 = polyB;
          xf1 = xfA;
          xf2 = xfB;
          edge1 = edgeA[0];
          manifold.type = exports.b2ManifoldType.e_faceA;
          flip = 0;
      }
      const incidentEdge = b2CollidePolygons_s_incidentEdge;
      b2FindIncidentEdge(incidentEdge, poly1, xf1, edge1, poly2, xf2);
      const count1 = poly1.m_count;
      const vertices1 = poly1.m_vertices;
      const iv1 = edge1;
      const iv2 = edge1 + 1 < count1 ? edge1 + 1 : 0;
      const local_v11 = vertices1[iv1];
      const local_v12 = vertices1[iv2];
      const localTangent = b2Vec2.SubVV(local_v12, local_v11, b2CollidePolygons_s_localTangent);
      localTangent.Normalize();
      const localNormal = b2Vec2.CrossVOne(localTangent, b2CollidePolygons_s_localNormal);
      const planePoint = b2Vec2.MidVV(local_v11, local_v12, b2CollidePolygons_s_planePoint);
      const tangent = b2Rot.MulRV(xf1.q, localTangent, b2CollidePolygons_s_tangent);
      const normal = b2Vec2.CrossVOne(tangent, b2CollidePolygons_s_normal);
      const v11 = b2Transform.MulXV(xf1, local_v11, b2CollidePolygons_s_v11);
      const v12 = b2Transform.MulXV(xf1, local_v12, b2CollidePolygons_s_v12);
      // Face offset.
      const frontOffset = b2Vec2.DotVV(normal, v11);
      // Side offsets, extended by polytope skin thickness.
      const sideOffset1 = -b2Vec2.DotVV(tangent, v11) + totalRadius;
      const sideOffset2 = b2Vec2.DotVV(tangent, v12) + totalRadius;
      // Clip incident edge against extruded edge1 side edges.
      const clipPoints1 = b2CollidePolygons_s_clipPoints1;
      const clipPoints2 = b2CollidePolygons_s_clipPoints2;
      let np;
      // Clip to box side 1
      const ntangent = b2Vec2.NegV(tangent, b2CollidePolygons_s_ntangent);
      np = b2ClipSegmentToLine(clipPoints1, incidentEdge, ntangent, sideOffset1, iv1);
      if (np < 2) {
          return;
      }
      // Clip to negative box side 1
      np = b2ClipSegmentToLine(clipPoints2, clipPoints1, tangent, sideOffset2, iv2);
      if (np < 2) {
          return;
      }
      // Now clipPoints2 contains the clipped points.
      manifold.localNormal.Copy(localNormal);
      manifold.localPoint.Copy(planePoint);
      let pointCount = 0;
      for (let i = 0; i < b2_maxManifoldPoints; ++i) {
          const cv = clipPoints2[i];
          const separation = b2Vec2.DotVV(normal, cv.v) - frontOffset;
          if (separation <= totalRadius) {
              const cp = manifold.points[pointCount];
              b2Transform.MulTXV(xf2, cv.v, cp.localPoint);
              cp.id.Copy(cv.id);
              if (flip) {
                  // Swap features
                  const cf = cp.id.cf;
                  cp.id.cf.indexA = cf.indexB;
                  cp.id.cf.indexB = cf.indexA;
                  cp.id.cf.typeA = cf.typeB;
                  cp.id.cf.typeB = cf.typeA;
              }
              ++pointCount;
          }
      }
      manifold.pointCount = pointCount;
  }

  /*
  * Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  /// A solid convex polygon. It is assumed that the interior of the polygon is to
  /// the left of each edge.
  /// In most cases you should not need many vertices for a convex polygon.
  class b2PolygonShape extends b2Shape {
      constructor() {
          super(exports.b2ShapeType.e_polygonShape, b2_polygonRadius);
          this.m_centroid = new b2Vec2(0, 0);
          this.m_vertices = [];
          this.m_normals = [];
          this.m_count = 0;
      }
      /// Implement b2Shape.
      Clone() {
          return new b2PolygonShape().Copy(this);
      }
      Copy(other) {
          super.Copy(other);
          // DEBUG: b2Assert(other instanceof b2PolygonShape);
          this.m_centroid.Copy(other.m_centroid);
          this.m_count = other.m_count;
          this.m_vertices = b2Vec2.MakeArray(this.m_count);
          this.m_normals = b2Vec2.MakeArray(this.m_count);
          for (let i = 0; i < this.m_count; ++i) {
              this.m_vertices[i].Copy(other.m_vertices[i]);
              this.m_normals[i].Copy(other.m_normals[i]);
          }
          return this;
      }
      /// @see b2Shape::GetChildCount
      GetChildCount() {
          return 1;
      }
      Set(...args) {
          if (typeof args[0][0] === "number") {
              const vertices = args[0];
              if (vertices.length % 2 !== 0) {
                  throw new Error();
              }
              return this._Set((index) => ({ x: vertices[index * 2], y: vertices[index * 2 + 1] }), vertices.length / 2);
          }
          else {
              const vertices = args[0];
              const count = args[1] || vertices.length;
              return this._Set((index) => vertices[index], count);
          }
      }
      _Set(vertices, count) {
          // DEBUG: b2Assert(3 <= count);
          if (count < 3) {
              return this.SetAsBox(1, 1);
          }
          let n = count;
          // Perform welding and copy vertices into local buffer.
          const ps = [];
          for (let i = 0; i < n; ++i) {
              const /*b2Vec2*/ v = vertices(i);
              let /*bool*/ unique = true;
              for (let /*int32*/ j = 0; j < ps.length; ++j) {
                  if (b2Vec2.DistanceSquaredVV(v, ps[j]) < ((0.5 * b2_linearSlop) * (0.5 * b2_linearSlop))) {
                      unique = false;
                      break;
                  }
              }
              if (unique) {
                  ps.push(v);
              }
          }
          n = ps.length;
          if (n < 3) {
              // Polygon is degenerate.
              // DEBUG: b2Assert(false);
              return this.SetAsBox(1.0, 1.0);
          }
          // Create the convex hull using the Gift wrapping algorithm
          // http://en.wikipedia.org/wiki/Gift_wrapping_algorithm
          // Find the right most point on the hull
          let i0 = 0;
          let x0 = ps[0].x;
          for (let i = 1; i < n; ++i) {
              const x = ps[i].x;
              if (x > x0 || (x === x0 && ps[i].y < ps[i0].y)) {
                  i0 = i;
                  x0 = x;
              }
          }
          const hull = [];
          let m = 0;
          let ih = i0;
          for (;;) {
              hull[m] = ih;
              let ie = 0;
              for (let j = 1; j < n; ++j) {
                  if (ie === ih) {
                      ie = j;
                      continue;
                  }
                  const r = b2Vec2.SubVV(ps[ie], ps[hull[m]], b2PolygonShape.Set_s_r);
                  const v = b2Vec2.SubVV(ps[j], ps[hull[m]], b2PolygonShape.Set_s_v);
                  const c = b2Vec2.CrossVV(r, v);
                  if (c < 0) {
                      ie = j;
                  }
                  // Collinearity check
                  if (c === 0 && v.LengthSquared() > r.LengthSquared()) {
                      ie = j;
                  }
              }
              ++m;
              ih = ie;
              if (ie === i0) {
                  break;
              }
          }
          this.m_count = m;
          this.m_vertices = b2Vec2.MakeArray(this.m_count);
          this.m_normals = b2Vec2.MakeArray(this.m_count);
          // Copy vertices.
          for (let i = 0; i < m; ++i) {
              this.m_vertices[i].Copy(ps[hull[i]]);
          }
          // Compute normals. Ensure the edges have non-zero length.
          for (let i = 0; i < m; ++i) {
              const vertexi1 = this.m_vertices[i];
              const vertexi2 = this.m_vertices[(i + 1) % m];
              const edge = b2Vec2.SubVV(vertexi2, vertexi1, b2Vec2.s_t0); // edge uses s_t0
              // DEBUG: b2Assert(edge.LengthSquared() > b2_epsilon_sq);
              b2Vec2.CrossVOne(edge, this.m_normals[i]).SelfNormalize();
          }
          // Compute the polygon centroid.
          b2PolygonShape.ComputeCentroid(this.m_vertices, m, this.m_centroid);
          return this;
      }
      /// Build vertices to represent an axis-aligned box or an oriented box.
      /// @param hx the half-width.
      /// @param hy the half-height.
      /// @param center the center of the box in local coordinates.
      /// @param angle the rotation of the box in local coordinates.
      SetAsBox(hx, hy, center, angle = 0) {
          this.m_count = 4;
          this.m_vertices = b2Vec2.MakeArray(this.m_count);
          this.m_normals = b2Vec2.MakeArray(this.m_count);
          this.m_vertices[0].Set((-hx), (-hy));
          this.m_vertices[1].Set(hx, (-hy));
          this.m_vertices[2].Set(hx, hy);
          this.m_vertices[3].Set((-hx), hy);
          this.m_normals[0].Set(0, (-1));
          this.m_normals[1].Set(1, 0);
          this.m_normals[2].Set(0, 1);
          this.m_normals[3].Set((-1), 0);
          this.m_centroid.SetZero();
          if (center) {
              this.m_centroid.Copy(center);
              const xf = new b2Transform();
              xf.SetPosition(center);
              xf.SetRotationAngle(angle);
              // Transform vertices and normals.
              for (let i = 0; i < this.m_count; ++i) {
                  b2Transform.MulXV(xf, this.m_vertices[i], this.m_vertices[i]);
                  b2Rot.MulRV(xf.q, this.m_normals[i], this.m_normals[i]);
              }
          }
          return this;
      }
      TestPoint(xf, p) {
          const pLocal = b2Transform.MulTXV(xf, p, b2PolygonShape.TestPoint_s_pLocal);
          for (let i = 0; i < this.m_count; ++i) {
              const dot = b2Vec2.DotVV(this.m_normals[i], b2Vec2.SubVV(pLocal, this.m_vertices[i], b2Vec2.s_t0));
              if (dot > 0) {
                  return false;
              }
          }
          return true;
      }
      RayCast(output, input, xf, childIndex) {
          // Put the ray into the polygon's frame of reference.
          const p1 = b2Transform.MulTXV(xf, input.p1, b2PolygonShape.RayCast_s_p1);
          const p2 = b2Transform.MulTXV(xf, input.p2, b2PolygonShape.RayCast_s_p2);
          const d = b2Vec2.SubVV(p2, p1, b2PolygonShape.RayCast_s_d);
          let lower = 0, upper = input.maxFraction;
          let index = -1;
          for (let i = 0; i < this.m_count; ++i) {
              // p = p1 + a * d
              // dot(normal, p - v) = 0
              // dot(normal, p1 - v) + a * dot(normal, d) = 0
              const numerator = b2Vec2.DotVV(this.m_normals[i], b2Vec2.SubVV(this.m_vertices[i], p1, b2Vec2.s_t0));
              const denominator = b2Vec2.DotVV(this.m_normals[i], d);
              if (denominator === 0) {
                  if (numerator < 0) {
                      return false;
                  }
              }
              else {
                  // Note: we want this predicate without division:
                  // lower < numerator / denominator, where denominator < 0
                  // Since denominator < 0, we have to flip the inequality:
                  // lower < numerator / denominator <==> denominator * lower > numerator.
                  if (denominator < 0 && numerator < lower * denominator) {
                      // Increase lower.
                      // The segment enters this half-space.
                      lower = numerator / denominator;
                      index = i;
                  }
                  else if (denominator > 0 && numerator < upper * denominator) {
                      // Decrease upper.
                      // The segment exits this half-space.
                      upper = numerator / denominator;
                  }
              }
              // The use of epsilon here causes the assert on lower to trip
              // in some cases. Apparently the use of epsilon was to make edge
              // shapes work, but now those are handled separately.
              // if (upper < lower - b2_epsilon)
              if (upper < lower) {
                  return false;
              }
          }
          // DEBUG: b2Assert(0 <= lower && lower <= input.maxFraction);
          if (index >= 0) {
              output.fraction = lower;
              b2Rot.MulRV(xf.q, this.m_normals[index], output.normal);
              return true;
          }
          return false;
      }
      ComputeAABB(aabb, xf, childIndex) {
          const lower = b2Transform.MulXV(xf, this.m_vertices[0], aabb.lowerBound);
          const upper = aabb.upperBound.Copy(lower);
          for (let i = 0; i < this.m_count; ++i) {
              const v = b2Transform.MulXV(xf, this.m_vertices[i], b2PolygonShape.ComputeAABB_s_v);
              b2Vec2.MinV(v, lower, lower);
              b2Vec2.MaxV(v, upper, upper);
          }
          const r = this.m_radius;
          lower.SelfSubXY(r, r);
          upper.SelfAddXY(r, r);
      }
      ComputeMass(massData, density) {
          // Polygon mass, centroid, and inertia.
          // Let rho be the polygon density in mass per unit area.
          // Then:
          // mass = rho * int(dA)
          // centroid.x = (1/mass) * rho * int(x * dA)
          // centroid.y = (1/mass) * rho * int(y * dA)
          // I = rho * int((x*x + y*y) * dA)
          //
          // We can compute these integrals by summing all the integrals
          // for each triangle of the polygon. To evaluate the integral
          // for a single triangle, we make a change of variables to
          // the (u,v) coordinates of the triangle:
          // x = x0 + e1x * u + e2x * v
          // y = y0 + e1y * u + e2y * v
          // where 0 <= u && 0 <= v && u + v <= 1.
          //
          // We integrate u from [0,1-v] and then v from [0,1].
          // We also need to use the Jacobian of the transformation:
          // D = cross(e1, e2)
          //
          // Simplification: triangle centroid = (1/3) * (p1 + p2 + p3)
          //
          // The rest of the derivation is handled by computer algebra.
          // DEBUG: b2Assert(this.m_count >= 3);
          const center = b2PolygonShape.ComputeMass_s_center.SetZero();
          let area = 0;
          let I = 0;
          // Get a reference point for forming triangles.
          // Use the first vertex to reduce round-off errors.
          const s = b2PolygonShape.ComputeMass_s_s.Copy(this.m_vertices[0]);
          const k_inv3 = 1 / 3;
          for (let i = 0; i < this.m_count; ++i) {
              // Triangle vertices.
              const e1 = b2Vec2.SubVV(this.m_vertices[i], s, b2PolygonShape.ComputeMass_s_e1);
              const e2 = b2Vec2.SubVV(this.m_vertices[(i + 1) % this.m_count], s, b2PolygonShape.ComputeMass_s_e2);
              const D = b2Vec2.CrossVV(e1, e2);
              const triangleArea = 0.5 * D;
              area += triangleArea;
              // Area weighted centroid
              center.SelfAdd(b2Vec2.MulSV(triangleArea * k_inv3, b2Vec2.AddVV(e1, e2, b2Vec2.s_t0), b2Vec2.s_t1));
              const ex1 = e1.x;
              const ey1 = e1.y;
              const ex2 = e2.x;
              const ey2 = e2.y;
              const intx2 = ex1 * ex1 + ex2 * ex1 + ex2 * ex2;
              const inty2 = ey1 * ey1 + ey2 * ey1 + ey2 * ey2;
              I += (0.25 * k_inv3 * D) * (intx2 + inty2);
          }
          // Total mass
          massData.mass = density * area;
          // Center of mass
          // DEBUG: b2Assert(area > b2_epsilon);
          center.SelfMul(1 / area);
          b2Vec2.AddVV(center, s, massData.center);
          // Inertia tensor relative to the local origin (point s).
          massData.I = density * I;
          // Shift to center of mass then to original body origin.
          massData.I += massData.mass * (b2Vec2.DotVV(massData.center, massData.center) - b2Vec2.DotVV(center, center));
      }
      Validate() {
          for (let i = 0; i < this.m_count; ++i) {
              const i1 = i;
              const i2 = (i + 1) % this.m_count;
              const p = this.m_vertices[i1];
              const e = b2Vec2.SubVV(this.m_vertices[i2], p, b2PolygonShape.Validate_s_e);
              for (let j = 0; j < this.m_count; ++j) {
                  if (j === i1 || j === i2) {
                      continue;
                  }
                  const v = b2Vec2.SubVV(this.m_vertices[j], p, b2PolygonShape.Validate_s_v);
                  const c = b2Vec2.CrossVV(e, v);
                  if (c < 0) {
                      return false;
                  }
              }
          }
          return true;
      }
      SetupDistanceProxy(proxy, index) {
          proxy.m_vertices = this.m_vertices;
          proxy.m_count = this.m_count;
          proxy.m_radius = this.m_radius;
      }
      ComputeSubmergedArea(normal, offset, xf, c) {
          // Transform plane into shape co-ordinates
          const normalL = b2Rot.MulTRV(xf.q, normal, b2PolygonShape.ComputeSubmergedArea_s_normalL);
          const offsetL = offset - b2Vec2.DotVV(normal, xf.p);
          const depths = [];
          let diveCount = 0;
          let intoIndex = -1;
          let outoIndex = -1;
          let lastSubmerged = false;
          for (let i = 0; i < this.m_count; ++i) {
              depths[i] = b2Vec2.DotVV(normalL, this.m_vertices[i]) - offsetL;
              const isSubmerged = depths[i] < (-b2_epsilon);
              if (i > 0) {
                  if (isSubmerged) {
                      if (!lastSubmerged) {
                          intoIndex = i - 1;
                          diveCount++;
                      }
                  }
                  else {
                      if (lastSubmerged) {
                          outoIndex = i - 1;
                          diveCount++;
                      }
                  }
              }
              lastSubmerged = isSubmerged;
          }
          switch (diveCount) {
              case 0:
                  if (lastSubmerged) {
                      // Completely submerged
                      const md = b2PolygonShape.ComputeSubmergedArea_s_md;
                      this.ComputeMass(md, 1);
                      b2Transform.MulXV(xf, md.center, c);
                      return md.mass;
                  }
                  else {
                      // Completely dry
                      return 0;
                  }
              case 1:
                  if (intoIndex === (-1)) {
                      intoIndex = this.m_count - 1;
                  }
                  else {
                      outoIndex = this.m_count - 1;
                  }
                  break;
          }
          const intoIndex2 = ((intoIndex + 1) % this.m_count);
          const outoIndex2 = ((outoIndex + 1) % this.m_count);
          const intoLamdda = (0 - depths[intoIndex]) / (depths[intoIndex2] - depths[intoIndex]);
          const outoLamdda = (0 - depths[outoIndex]) / (depths[outoIndex2] - depths[outoIndex]);
          const intoVec = b2PolygonShape.ComputeSubmergedArea_s_intoVec.Set(this.m_vertices[intoIndex].x * (1 - intoLamdda) + this.m_vertices[intoIndex2].x * intoLamdda, this.m_vertices[intoIndex].y * (1 - intoLamdda) + this.m_vertices[intoIndex2].y * intoLamdda);
          const outoVec = b2PolygonShape.ComputeSubmergedArea_s_outoVec.Set(this.m_vertices[outoIndex].x * (1 - outoLamdda) + this.m_vertices[outoIndex2].x * outoLamdda, this.m_vertices[outoIndex].y * (1 - outoLamdda) + this.m_vertices[outoIndex2].y * outoLamdda);
          // Initialize accumulator
          let area = 0;
          const center = b2PolygonShape.ComputeSubmergedArea_s_center.SetZero();
          let p2 = this.m_vertices[intoIndex2];
          let p3;
          // An awkward loop from intoIndex2+1 to outIndex2
          let i = intoIndex2;
          while (i !== outoIndex2) {
              i = (i + 1) % this.m_count;
              if (i === outoIndex2) {
                  p3 = outoVec;
              }
              else {
                  p3 = this.m_vertices[i];
              }
              const triangleArea = 0.5 * ((p2.x - intoVec.x) * (p3.y - intoVec.y) - (p2.y - intoVec.y) * (p3.x - intoVec.x));
              area += triangleArea;
              // Area weighted centroid
              center.x += triangleArea * (intoVec.x + p2.x + p3.x) / 3;
              center.y += triangleArea * (intoVec.y + p2.y + p3.y) / 3;
              p2 = p3;
          }
          // Normalize and transform centroid
          center.SelfMul(1 / area);
          b2Transform.MulXV(xf, center, c);
          return area;
      }
      Dump(log) {
          log("    const shape: b2PolygonShape = new b2PolygonShape();\n");
          log("    const vs: b2Vec2[] = [];\n");
          for (let i = 0; i < this.m_count; ++i) {
              log("    vs[%d] = new b2Vec2(%.15f, %.15f);\n", i, this.m_vertices[i].x, this.m_vertices[i].y);
          }
          log("    shape.Set(vs, %d);\n", this.m_count);
      }
      static ComputeCentroid(vs, count, out) {
          // DEBUG: b2Assert(count >= 3);
          const c = out;
          c.SetZero();
          let area = 0;
          // Get a reference point for forming triangles.
          // Use the first vertex to reduce round-off errors.
          const s = b2PolygonShape.ComputeCentroid_s_s.Copy(vs[0]);
          const inv3 = 1 / 3;
          for (let i = 0; i < count; ++i) {
              // Triangle vertices.
              const p1 = b2Vec2.SubVV(vs[0], s, b2PolygonShape.ComputeCentroid_s_p1);
              const p2 = b2Vec2.SubVV(vs[i], s, b2PolygonShape.ComputeCentroid_s_p2);
              const p3 = b2Vec2.SubVV(vs[(i + 1) % count], s, b2PolygonShape.ComputeCentroid_s_p3);
              const e1 = b2Vec2.SubVV(p2, p1, b2PolygonShape.ComputeCentroid_s_e1);
              const e2 = b2Vec2.SubVV(p3, p1, b2PolygonShape.ComputeCentroid_s_e2);
              const D = b2Vec2.CrossVV(e1, e2);
              const triangleArea = 0.5 * D;
              area += triangleArea;
              // Area weighted centroid
              c.x += triangleArea * inv3 * (p1.x + p2.x + p3.x);
              c.y += triangleArea * inv3 * (p1.y + p2.y + p3.y);
          }
          // Centroid
          // DEBUG: b2Assert(area > b2_epsilon);
          // c = (1.0f / area) * c + s;
          c.x = (1 / area) * c.x + s.x;
          c.y = (1 / area) * c.y + s.y;
          return c;
      }
  }
  /// Create a convex hull from the given array of points.
  /// @warning the points may be re-ordered, even if they form a convex polygon
  /// @warning collinear points are handled but not removed. Collinear points
  /// may lead to poor stacking behavior.
  b2PolygonShape.Set_s_r = new b2Vec2();
  b2PolygonShape.Set_s_v = new b2Vec2();
  /// @see b2Shape::TestPoint
  b2PolygonShape.TestPoint_s_pLocal = new b2Vec2();
  /// Implement b2Shape.
  /// @note because the polygon is solid, rays that start inside do not hit because the normal is
  /// not defined.
  b2PolygonShape.RayCast_s_p1 = new b2Vec2();
  b2PolygonShape.RayCast_s_p2 = new b2Vec2();
  b2PolygonShape.RayCast_s_d = new b2Vec2();
  /// @see b2Shape::ComputeAABB
  b2PolygonShape.ComputeAABB_s_v = new b2Vec2();
  /// @see b2Shape::ComputeMass
  b2PolygonShape.ComputeMass_s_center = new b2Vec2();
  b2PolygonShape.ComputeMass_s_s = new b2Vec2();
  b2PolygonShape.ComputeMass_s_e1 = new b2Vec2();
  b2PolygonShape.ComputeMass_s_e2 = new b2Vec2();
  b2PolygonShape.Validate_s_e = new b2Vec2();
  b2PolygonShape.Validate_s_v = new b2Vec2();
  b2PolygonShape.ComputeSubmergedArea_s_normalL = new b2Vec2();
  b2PolygonShape.ComputeSubmergedArea_s_md = new b2MassData();
  b2PolygonShape.ComputeSubmergedArea_s_intoVec = new b2Vec2();
  b2PolygonShape.ComputeSubmergedArea_s_outoVec = new b2Vec2();
  b2PolygonShape.ComputeSubmergedArea_s_center = new b2Vec2();
  b2PolygonShape.ComputeCentroid_s_s = new b2Vec2();
  b2PolygonShape.ComputeCentroid_s_p1 = new b2Vec2();
  b2PolygonShape.ComputeCentroid_s_p2 = new b2Vec2();
  b2PolygonShape.ComputeCentroid_s_p3 = new b2Vec2();
  b2PolygonShape.ComputeCentroid_s_e1 = new b2Vec2();
  b2PolygonShape.ComputeCentroid_s_e2 = new b2Vec2();

  /*
  * Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  exports.b2_toiTime = 0;
  exports.b2_toiMaxTime = 0;
  exports.b2_toiCalls = 0;
  exports.b2_toiIters = 0;
  exports.b2_toiMaxIters = 0;
  exports.b2_toiRootIters = 0;
  exports.b2_toiMaxRootIters = 0;
  function b2_toi_reset() {
      exports.b2_toiTime = 0;
      exports.b2_toiMaxTime = 0;
      exports.b2_toiCalls = 0;
      exports.b2_toiIters = 0;
      exports.b2_toiMaxIters = 0;
      exports.b2_toiRootIters = 0;
      exports.b2_toiMaxRootIters = 0;
  }
  const b2TimeOfImpact_s_xfA = new b2Transform();
  const b2TimeOfImpact_s_xfB = new b2Transform();
  const b2TimeOfImpact_s_pointA = new b2Vec2();
  const b2TimeOfImpact_s_pointB = new b2Vec2();
  const b2TimeOfImpact_s_normal = new b2Vec2();
  const b2TimeOfImpact_s_axisA = new b2Vec2();
  const b2TimeOfImpact_s_axisB = new b2Vec2();
  /// Input parameters for b2TimeOfImpact
  class b2TOIInput {
      constructor() {
          this.proxyA = new b2DistanceProxy();
          this.proxyB = new b2DistanceProxy();
          this.sweepA = new b2Sweep();
          this.sweepB = new b2Sweep();
          this.tMax = 0; // defines sweep interval [0, tMax]
      }
  }
  /// Output parameters for b2TimeOfImpact.
  exports.b2TOIOutputState = void 0;
  (function (b2TOIOutputState) {
      b2TOIOutputState[b2TOIOutputState["e_unknown"] = 0] = "e_unknown";
      b2TOIOutputState[b2TOIOutputState["e_failed"] = 1] = "e_failed";
      b2TOIOutputState[b2TOIOutputState["e_overlapped"] = 2] = "e_overlapped";
      b2TOIOutputState[b2TOIOutputState["e_touching"] = 3] = "e_touching";
      b2TOIOutputState[b2TOIOutputState["e_separated"] = 4] = "e_separated";
  })(exports.b2TOIOutputState || (exports.b2TOIOutputState = {}));
  class b2TOIOutput {
      constructor() {
          this.state = exports.b2TOIOutputState.e_unknown;
          this.t = 0;
      }
  }
  exports.b2SeparationFunctionType = void 0;
  (function (b2SeparationFunctionType) {
      b2SeparationFunctionType[b2SeparationFunctionType["e_unknown"] = -1] = "e_unknown";
      b2SeparationFunctionType[b2SeparationFunctionType["e_points"] = 0] = "e_points";
      b2SeparationFunctionType[b2SeparationFunctionType["e_faceA"] = 1] = "e_faceA";
      b2SeparationFunctionType[b2SeparationFunctionType["e_faceB"] = 2] = "e_faceB";
  })(exports.b2SeparationFunctionType || (exports.b2SeparationFunctionType = {}));
  class b2SeparationFunction {
      constructor() {
          this.m_sweepA = new b2Sweep();
          this.m_sweepB = new b2Sweep();
          this.m_type = exports.b2SeparationFunctionType.e_unknown;
          this.m_localPoint = new b2Vec2();
          this.m_axis = new b2Vec2();
      }
      Initialize(cache, proxyA, sweepA, proxyB, sweepB, t1) {
          this.m_proxyA = proxyA;
          this.m_proxyB = proxyB;
          const count = cache.count;
          // DEBUG: b2Assert(0 < count && count < 3);
          this.m_sweepA.Copy(sweepA);
          this.m_sweepB.Copy(sweepB);
          const xfA = b2TimeOfImpact_s_xfA;
          const xfB = b2TimeOfImpact_s_xfB;
          this.m_sweepA.GetTransform(xfA, t1);
          this.m_sweepB.GetTransform(xfB, t1);
          if (count === 1) {
              this.m_type = exports.b2SeparationFunctionType.e_points;
              const localPointA = this.m_proxyA.GetVertex(cache.indexA[0]);
              const localPointB = this.m_proxyB.GetVertex(cache.indexB[0]);
              const pointA = b2Transform.MulXV(xfA, localPointA, b2TimeOfImpact_s_pointA);
              const pointB = b2Transform.MulXV(xfB, localPointB, b2TimeOfImpact_s_pointB);
              b2Vec2.SubVV(pointB, pointA, this.m_axis);
              const s = this.m_axis.Normalize();
              return s;
          }
          else if (cache.indexA[0] === cache.indexA[1]) {
              // Two points on B and one on A.
              this.m_type = exports.b2SeparationFunctionType.e_faceB;
              const localPointB1 = this.m_proxyB.GetVertex(cache.indexB[0]);
              const localPointB2 = this.m_proxyB.GetVertex(cache.indexB[1]);
              b2Vec2.CrossVOne(b2Vec2.SubVV(localPointB2, localPointB1, b2Vec2.s_t0), this.m_axis).SelfNormalize();
              const normal = b2Rot.MulRV(xfB.q, this.m_axis, b2TimeOfImpact_s_normal);
              b2Vec2.MidVV(localPointB1, localPointB2, this.m_localPoint);
              const pointB = b2Transform.MulXV(xfB, this.m_localPoint, b2TimeOfImpact_s_pointB);
              const localPointA = this.m_proxyA.GetVertex(cache.indexA[0]);
              const pointA = b2Transform.MulXV(xfA, localPointA, b2TimeOfImpact_s_pointA);
              let s = b2Vec2.DotVV(b2Vec2.SubVV(pointA, pointB, b2Vec2.s_t0), normal);
              if (s < 0) {
                  this.m_axis.SelfNeg();
                  s = -s;
              }
              return s;
          }
          else {
              // Two points on A and one or two points on B.
              this.m_type = exports.b2SeparationFunctionType.e_faceA;
              const localPointA1 = this.m_proxyA.GetVertex(cache.indexA[0]);
              const localPointA2 = this.m_proxyA.GetVertex(cache.indexA[1]);
              b2Vec2.CrossVOne(b2Vec2.SubVV(localPointA2, localPointA1, b2Vec2.s_t0), this.m_axis).SelfNormalize();
              const normal = b2Rot.MulRV(xfA.q, this.m_axis, b2TimeOfImpact_s_normal);
              b2Vec2.MidVV(localPointA1, localPointA2, this.m_localPoint);
              const pointA = b2Transform.MulXV(xfA, this.m_localPoint, b2TimeOfImpact_s_pointA);
              const localPointB = this.m_proxyB.GetVertex(cache.indexB[0]);
              const pointB = b2Transform.MulXV(xfB, localPointB, b2TimeOfImpact_s_pointB);
              let s = b2Vec2.DotVV(b2Vec2.SubVV(pointB, pointA, b2Vec2.s_t0), normal);
              if (s < 0) {
                  this.m_axis.SelfNeg();
                  s = -s;
              }
              return s;
          }
      }
      FindMinSeparation(indexA, indexB, t) {
          const xfA = b2TimeOfImpact_s_xfA;
          const xfB = b2TimeOfImpact_s_xfB;
          this.m_sweepA.GetTransform(xfA, t);
          this.m_sweepB.GetTransform(xfB, t);
          switch (this.m_type) {
              case exports.b2SeparationFunctionType.e_points: {
                  const axisA = b2Rot.MulTRV(xfA.q, this.m_axis, b2TimeOfImpact_s_axisA);
                  const axisB = b2Rot.MulTRV(xfB.q, b2Vec2.NegV(this.m_axis, b2Vec2.s_t0), b2TimeOfImpact_s_axisB);
                  indexA[0] = this.m_proxyA.GetSupport(axisA);
                  indexB[0] = this.m_proxyB.GetSupport(axisB);
                  const localPointA = this.m_proxyA.GetVertex(indexA[0]);
                  const localPointB = this.m_proxyB.GetVertex(indexB[0]);
                  const pointA = b2Transform.MulXV(xfA, localPointA, b2TimeOfImpact_s_pointA);
                  const pointB = b2Transform.MulXV(xfB, localPointB, b2TimeOfImpact_s_pointB);
                  const separation = b2Vec2.DotVV(b2Vec2.SubVV(pointB, pointA, b2Vec2.s_t0), this.m_axis);
                  return separation;
              }
              case exports.b2SeparationFunctionType.e_faceA: {
                  const normal = b2Rot.MulRV(xfA.q, this.m_axis, b2TimeOfImpact_s_normal);
                  const pointA = b2Transform.MulXV(xfA, this.m_localPoint, b2TimeOfImpact_s_pointA);
                  const axisB = b2Rot.MulTRV(xfB.q, b2Vec2.NegV(normal, b2Vec2.s_t0), b2TimeOfImpact_s_axisB);
                  indexA[0] = -1;
                  indexB[0] = this.m_proxyB.GetSupport(axisB);
                  const localPointB = this.m_proxyB.GetVertex(indexB[0]);
                  const pointB = b2Transform.MulXV(xfB, localPointB, b2TimeOfImpact_s_pointB);
                  const separation = b2Vec2.DotVV(b2Vec2.SubVV(pointB, pointA, b2Vec2.s_t0), normal);
                  return separation;
              }
              case exports.b2SeparationFunctionType.e_faceB: {
                  const normal = b2Rot.MulRV(xfB.q, this.m_axis, b2TimeOfImpact_s_normal);
                  const pointB = b2Transform.MulXV(xfB, this.m_localPoint, b2TimeOfImpact_s_pointB);
                  const axisA = b2Rot.MulTRV(xfA.q, b2Vec2.NegV(normal, b2Vec2.s_t0), b2TimeOfImpact_s_axisA);
                  indexB[0] = -1;
                  indexA[0] = this.m_proxyA.GetSupport(axisA);
                  const localPointA = this.m_proxyA.GetVertex(indexA[0]);
                  const pointA = b2Transform.MulXV(xfA, localPointA, b2TimeOfImpact_s_pointA);
                  const separation = b2Vec2.DotVV(b2Vec2.SubVV(pointA, pointB, b2Vec2.s_t0), normal);
                  return separation;
              }
              default:
                  // DEBUG: b2Assert(false);
                  indexA[0] = -1;
                  indexB[0] = -1;
                  return 0;
          }
      }
      Evaluate(indexA, indexB, t) {
          const xfA = b2TimeOfImpact_s_xfA;
          const xfB = b2TimeOfImpact_s_xfB;
          this.m_sweepA.GetTransform(xfA, t);
          this.m_sweepB.GetTransform(xfB, t);
          switch (this.m_type) {
              case exports.b2SeparationFunctionType.e_points: {
                  const localPointA = this.m_proxyA.GetVertex(indexA);
                  const localPointB = this.m_proxyB.GetVertex(indexB);
                  const pointA = b2Transform.MulXV(xfA, localPointA, b2TimeOfImpact_s_pointA);
                  const pointB = b2Transform.MulXV(xfB, localPointB, b2TimeOfImpact_s_pointB);
                  const separation = b2Vec2.DotVV(b2Vec2.SubVV(pointB, pointA, b2Vec2.s_t0), this.m_axis);
                  return separation;
              }
              case exports.b2SeparationFunctionType.e_faceA: {
                  const normal = b2Rot.MulRV(xfA.q, this.m_axis, b2TimeOfImpact_s_normal);
                  const pointA = b2Transform.MulXV(xfA, this.m_localPoint, b2TimeOfImpact_s_pointA);
                  const localPointB = this.m_proxyB.GetVertex(indexB);
                  const pointB = b2Transform.MulXV(xfB, localPointB, b2TimeOfImpact_s_pointB);
                  const separation = b2Vec2.DotVV(b2Vec2.SubVV(pointB, pointA, b2Vec2.s_t0), normal);
                  return separation;
              }
              case exports.b2SeparationFunctionType.e_faceB: {
                  const normal = b2Rot.MulRV(xfB.q, this.m_axis, b2TimeOfImpact_s_normal);
                  const pointB = b2Transform.MulXV(xfB, this.m_localPoint, b2TimeOfImpact_s_pointB);
                  const localPointA = this.m_proxyA.GetVertex(indexA);
                  const pointA = b2Transform.MulXV(xfA, localPointA, b2TimeOfImpact_s_pointA);
                  const separation = b2Vec2.DotVV(b2Vec2.SubVV(pointA, pointB, b2Vec2.s_t0), normal);
                  return separation;
              }
              default:
                  // DEBUG: b2Assert(false);
                  return 0;
          }
      }
  }
  const b2TimeOfImpact_s_timer = new b2Timer();
  const b2TimeOfImpact_s_cache = new b2SimplexCache();
  const b2TimeOfImpact_s_distanceInput = new b2DistanceInput();
  const b2TimeOfImpact_s_distanceOutput = new b2DistanceOutput();
  const b2TimeOfImpact_s_fcn = new b2SeparationFunction();
  const b2TimeOfImpact_s_indexA = [0];
  const b2TimeOfImpact_s_indexB = [0];
  const b2TimeOfImpact_s_sweepA = new b2Sweep();
  const b2TimeOfImpact_s_sweepB = new b2Sweep();
  function b2TimeOfImpact(output, input) {
      const timer = b2TimeOfImpact_s_timer.Reset();
      ++exports.b2_toiCalls;
      output.state = exports.b2TOIOutputState.e_unknown;
      output.t = input.tMax;
      const proxyA = input.proxyA;
      const proxyB = input.proxyB;
      const maxVertices = b2Max(b2_maxPolygonVertices, b2Max(proxyA.m_count, proxyB.m_count));
      const sweepA = b2TimeOfImpact_s_sweepA.Copy(input.sweepA);
      const sweepB = b2TimeOfImpact_s_sweepB.Copy(input.sweepB);
      // Large rotations can make the root finder fail, so we normalize the
      // sweep angles.
      sweepA.Normalize();
      sweepB.Normalize();
      const tMax = input.tMax;
      const totalRadius = proxyA.m_radius + proxyB.m_radius;
      const target = b2Max(b2_linearSlop, totalRadius - 3 * b2_linearSlop);
      const tolerance = 0.25 * b2_linearSlop;
      // DEBUG: b2Assert(target > tolerance);
      let t1 = 0;
      const k_maxIterations = 20; // TODO_ERIN b2Settings
      let iter = 0;
      // Prepare input for distance query.
      const cache = b2TimeOfImpact_s_cache;
      cache.count = 0;
      const distanceInput = b2TimeOfImpact_s_distanceInput;
      distanceInput.proxyA.Copy(input.proxyA);
      distanceInput.proxyB.Copy(input.proxyB);
      distanceInput.useRadii = false;
      // The outer loop progressively attempts to compute new separating axes.
      // This loop terminates when an axis is repeated (no progress is made).
      for (;;) {
          const xfA = b2TimeOfImpact_s_xfA;
          const xfB = b2TimeOfImpact_s_xfB;
          sweepA.GetTransform(xfA, t1);
          sweepB.GetTransform(xfB, t1);
          // Get the distance between shapes. We can also use the results
          // to get a separating axis.
          distanceInput.transformA.Copy(xfA);
          distanceInput.transformB.Copy(xfB);
          const distanceOutput = b2TimeOfImpact_s_distanceOutput;
          b2Distance(distanceOutput, cache, distanceInput);
          // If the shapes are overlapped, we give up on continuous collision.
          if (distanceOutput.distance <= 0) {
              // Failure!
              output.state = exports.b2TOIOutputState.e_overlapped;
              output.t = 0;
              break;
          }
          if (distanceOutput.distance < target + tolerance) {
              // Victory!
              output.state = exports.b2TOIOutputState.e_touching;
              output.t = t1;
              break;
          }
          // Initialize the separating axis.
          const fcn = b2TimeOfImpact_s_fcn;
          fcn.Initialize(cache, proxyA, sweepA, proxyB, sweepB, t1);
          /*
          #if 0
              // Dump the curve seen by the root finder {
                const int32 N = 100;
                float32 dx = 1.0f / N;
                float32 xs[N+1];
                float32 fs[N+1];
          
                float32 x = 0.0f;
          
                for (int32 i = 0; i <= N; ++i) {
                  sweepA.GetTransform(&xfA, x);
                  sweepB.GetTransform(&xfB, x);
                  float32 f = fcn.Evaluate(xfA, xfB) - target;
          
                  printf("%g %g\n", x, f);
          
                  xs[i] = x;
                  fs[i] = f;
          
                  x += dx;
                }
              }
          #endif
          */
          // Compute the TOI on the separating axis. We do this by successively
          // resolving the deepest point. This loop is bounded by the number of vertices.
          let done = false;
          let t2 = tMax;
          let pushBackIter = 0;
          for (;;) {
              // Find the deepest point at t2. Store the witness point indices.
              const indexA = b2TimeOfImpact_s_indexA;
              const indexB = b2TimeOfImpact_s_indexB;
              let s2 = fcn.FindMinSeparation(indexA, indexB, t2);
              // Is the final configuration separated?
              if (s2 > (target + tolerance)) {
                  // Victory!
                  output.state = exports.b2TOIOutputState.e_separated;
                  output.t = tMax;
                  done = true;
                  break;
              }
              // Has the separation reached tolerance?
              if (s2 > (target - tolerance)) {
                  // Advance the sweeps
                  t1 = t2;
                  break;
              }
              // Compute the initial separation of the witness points.
              let s1 = fcn.Evaluate(indexA[0], indexB[0], t1);
              // Check for initial overlap. This might happen if the root finder
              // runs out of iterations.
              if (s1 < (target - tolerance)) {
                  output.state = exports.b2TOIOutputState.e_failed;
                  output.t = t1;
                  done = true;
                  break;
              }
              // Check for touching
              if (s1 <= (target + tolerance)) {
                  // Victory! t1 should hold the TOI (could be 0.0).
                  output.state = exports.b2TOIOutputState.e_touching;
                  output.t = t1;
                  done = true;
                  break;
              }
              // Compute 1D root of: f(x) - target = 0
              let rootIterCount = 0;
              let a1 = t1;
              let a2 = t2;
              for (;;) {
                  // Use a mix of the secant rule and bisection.
                  let t = 0;
                  if (rootIterCount & 1) {
                      // Secant rule to improve convergence.
                      t = a1 + (target - s1) * (a2 - a1) / (s2 - s1);
                  }
                  else {
                      // Bisection to guarantee progress.
                      t = 0.5 * (a1 + a2);
                  }
                  ++rootIterCount;
                  ++exports.b2_toiRootIters;
                  const s = fcn.Evaluate(indexA[0], indexB[0], t);
                  if (b2Abs(s - target) < tolerance) {
                      // t2 holds a tentative value for t1
                      t2 = t;
                      break;
                  }
                  // Ensure we continue to bracket the root.
                  if (s > target) {
                      a1 = t;
                      s1 = s;
                  }
                  else {
                      a2 = t;
                      s2 = s;
                  }
                  if (rootIterCount === 50) {
                      break;
                  }
              }
              exports.b2_toiMaxRootIters = b2Max(exports.b2_toiMaxRootIters, rootIterCount);
              ++pushBackIter;
              if (pushBackIter === maxVertices) {
                  break;
              }
          }
          ++iter;
          ++exports.b2_toiIters;
          if (done) {
              break;
          }
          if (iter === k_maxIterations) {
              // Root finder got stuck. Semi-victory.
              output.state = exports.b2TOIOutputState.e_failed;
              output.t = t1;
              break;
          }
      }
      exports.b2_toiMaxIters = b2Max(exports.b2_toiMaxIters, iter);
      const time = timer.GetMilliseconds();
      exports.b2_toiMaxTime = b2Max(exports.b2_toiMaxTime, time);
      exports.b2_toiTime += time;
  }

  /*
  * Copyright (c) 2006-2007 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  exports.b2JointType = void 0;
  (function (b2JointType) {
      b2JointType[b2JointType["e_unknownJoint"] = 0] = "e_unknownJoint";
      b2JointType[b2JointType["e_revoluteJoint"] = 1] = "e_revoluteJoint";
      b2JointType[b2JointType["e_prismaticJoint"] = 2] = "e_prismaticJoint";
      b2JointType[b2JointType["e_distanceJoint"] = 3] = "e_distanceJoint";
      b2JointType[b2JointType["e_pulleyJoint"] = 4] = "e_pulleyJoint";
      b2JointType[b2JointType["e_mouseJoint"] = 5] = "e_mouseJoint";
      b2JointType[b2JointType["e_gearJoint"] = 6] = "e_gearJoint";
      b2JointType[b2JointType["e_wheelJoint"] = 7] = "e_wheelJoint";
      b2JointType[b2JointType["e_weldJoint"] = 8] = "e_weldJoint";
      b2JointType[b2JointType["e_frictionJoint"] = 9] = "e_frictionJoint";
      b2JointType[b2JointType["e_ropeJoint"] = 10] = "e_ropeJoint";
      b2JointType[b2JointType["e_motorJoint"] = 11] = "e_motorJoint";
      b2JointType[b2JointType["e_areaJoint"] = 12] = "e_areaJoint";
  })(exports.b2JointType || (exports.b2JointType = {}));
  class b2Jacobian {
      constructor() {
          this.linear = new b2Vec2();
          this.angularA = 0;
          this.angularB = 0;
      }
      SetZero() {
          this.linear.SetZero();
          this.angularA = 0;
          this.angularB = 0;
          return this;
      }
      Set(x, a1, a2) {
          this.linear.Copy(x);
          this.angularA = a1;
          this.angularB = a2;
          return this;
      }
  }
  /// A joint edge is used to connect bodies and joints together
  /// in a joint graph where each body is a node and each joint
  /// is an edge. A joint edge belongs to a doubly linked list
  /// maintained in each attached body. Each joint has two joint
  /// nodes, one for each attached body.
  class b2JointEdge {
      constructor(joint) {
          this._other = null; ///< provides quick access to the other body attached.
          this.prev = null; ///< the previous joint edge in the body's joint list
          this.next = null; ///< the next joint edge in the body's joint list
          this.joint = joint;
      }
      get other() {
          if (this._other === null) {
              throw new Error();
          }
          return this._other;
      }
      set other(value) {
          if (this._other !== null) {
              throw new Error();
          }
          this._other = value;
      }
      Reset() {
          this._other = null;
          this.prev = null;
          this.next = null;
      }
  }
  /// Joint definitions are used to construct joints.
  class b2JointDef {
      constructor(type) {
          /// The joint type is set automatically for concrete joint types.
          this.type = exports.b2JointType.e_unknownJoint;
          /// Use this to attach application specific data to your joints.
          this.userData = null;
          /// Set this flag to true if the attached bodies should collide.
          this.collideConnected = false;
          this.type = type;
      }
  }
  /// Utility to compute linear stiffness values from frequency and damping ratio
  // void b2LinearStiffness(float& stiffness, float& damping,
  // 	float frequencyHertz, float dampingRatio,
  // 	const b2Body* bodyA, const b2Body* bodyB);
  // kylin: 这里是合理的，需要修改def的值；C++中为引用传递
  function b2LinearStiffness(def, frequencyHertz, dampingRatio, bodyA, bodyB) {
      const massA = bodyA.GetMass();
      const massB = bodyB.GetMass();
      let mass;
      if (massA > 0.0 && massB > 0.0) {
          mass = massA * massB / (massA + massB);
      }
      else if (massA > 0.0) {
          mass = massA;
      }
      else {
          mass = massB;
      }
      const omega = 2.0 * b2_pi * frequencyHertz;
      def.stiffness = mass * omega * omega;
      def.damping = 2.0 * mass * dampingRatio * omega;
  }
  /// Utility to compute rotational stiffness values frequency and damping ratio
  // void b2AngularStiffness(float& stiffness, float& damping,
  // 	float frequencyHertz, float dampingRatio,
  // 	const b2Body* bodyA, const b2Body* bodyB);
  function b2AngularStiffness(def, frequencyHertz, dampingRatio, bodyA, bodyB) {
      const IA = bodyA.GetInertia();
      const IB = bodyB.GetInertia();
      let I;
      if (IA > 0.0 && IB > 0.0) {
          I = IA * IB / (IA + IB);
      }
      else if (IA > 0.0) {
          I = IA;
      }
      else {
          I = IB;
      }
      const omega = 2.0 * b2_pi * frequencyHertz;
      def.stiffness = I * omega * omega;
      def.damping = 2.0 * I * dampingRatio * omega;
  }
  /// The base joint class. Joints are used to constraint two bodies together in
  /// various fashions. Some joints also feature limits and motors.
  class b2Joint {
      constructor(def) {
          // DEBUG: b2Assert(def.bodyA !== def.bodyB);
          this.m_type = exports.b2JointType.e_unknownJoint;
          this.m_prev = null;
          this.m_next = null;
          this.m_edgeA = new b2JointEdge(this);
          this.m_edgeB = new b2JointEdge(this);
          this.m_index = 0;
          this.m_islandFlag = false;
          this.m_collideConnected = false;
          this.m_userData = null;
          this.m_type = def.type;
          this.m_edgeA.other = def.bodyB;
          this.m_edgeB.other = def.bodyA;
          this.m_bodyA = def.bodyA;
          this.m_bodyB = def.bodyB;
          this.m_collideConnected = b2Maybe(def.collideConnected, false);
          this.m_userData = b2Maybe(def.userData, null);
      }
      /// Get the type of the concrete joint.
      GetType() {
          return this.m_type;
      }
      /// Get the first body attached to this joint.
      GetBodyA() {
          return this.m_bodyA;
      }
      /// Get the second body attached to this joint.
      GetBodyB() {
          return this.m_bodyB;
      }
      /// Get the next joint the world joint list.
      GetNext() {
          return this.m_next;
      }
      /// Get the user data pointer.
      GetUserData() {
          return this.m_userData;
      }
      /// Set the user data pointer.
      SetUserData(data) {
          this.m_userData = data;
      }
      /// Short-cut function to determine if either body is inactive.
      IsEnabled() {
          return this.m_bodyA.IsEnabled() && this.m_bodyB.IsEnabled();
      }
      /// Get collide connected.
      /// Note: modifying the collide connect flag won't work correctly because
      /// the flag is only checked when fixture AABBs begin to overlap.
      GetCollideConnected() {
          return this.m_collideConnected;
      }
      /// Dump this joint to the log file.
      Dump(log) {
          log("// Dump is not supported for this joint type.\n");
      }
      /// Shift the origin for any points stored in world coordinates.
      ShiftOrigin(newOrigin) { }
      Draw(draw) {
          const xf1 = this.m_bodyA.GetTransform();
          const xf2 = this.m_bodyB.GetTransform();
          const x1 = xf1.p;
          const x2 = xf2.p;
          const p1 = this.GetAnchorA(b2Joint.Draw_s_p1);
          const p2 = this.GetAnchorB(b2Joint.Draw_s_p2);
          const color = b2Joint.Draw_s_color.SetRGB(0.5, 0.8, 0.8);
          switch (this.m_type) {
              case exports.b2JointType.e_distanceJoint:
                  draw.DrawSegment(p1, p2, color);
                  break;
              case exports.b2JointType.e_pulleyJoint:
                  {
                      const pulley = this;
                      const s1 = pulley.GetGroundAnchorA();
                      const s2 = pulley.GetGroundAnchorB();
                      draw.DrawSegment(s1, p1, color);
                      draw.DrawSegment(s2, p2, color);
                      draw.DrawSegment(s1, s2, color);
                  }
                  break;
              case exports.b2JointType.e_mouseJoint:
                  {
                      const c = b2Joint.Draw_s_c;
                      c.Set(0.0, 1.0, 0.0);
                      draw.DrawPoint(p1, 4.0, c);
                      draw.DrawPoint(p2, 4.0, c);
                      c.Set(0.8, 0.8, 0.8);
                      draw.DrawSegment(p1, p2, c);
                  }
                  break;
              default:
                  draw.DrawSegment(x1, p1, color);
                  draw.DrawSegment(p1, p2, color);
                  draw.DrawSegment(x2, p2, color);
          }
      }
  }
  /// Debug draw this joint
  b2Joint.Draw_s_p1 = new b2Vec2();
  b2Joint.Draw_s_p2 = new b2Vec2();
  b2Joint.Draw_s_color = new b2Color(0.5, 0.8, 0.8);
  b2Joint.Draw_s_c = new b2Color();

  /*
  * Copyright (c) 2006-2007 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  /// Distance joint definition. This requires defining an
  /// anchor point on both bodies and the non-zero length of the
  /// distance joint. The definition uses local anchor points
  /// so that the initial configuration can violate the constraint
  /// slightly. This helps when saving and loading a game.
  /// @warning Do not use a zero or short length.
  class b2DistanceJointDef extends b2JointDef {
      constructor() {
          super(exports.b2JointType.e_distanceJoint);
          this.localAnchorA = new b2Vec2();
          this.localAnchorB = new b2Vec2();
          this.length = 1;
          this.minLength = 0;
          this.maxLength = b2_maxFloat; // FLT_MAX;
          this.stiffness = 0;
          this.damping = 0;
      }
      Initialize(b1, b2, anchor1, anchor2) {
          this.bodyA = b1;
          this.bodyB = b2;
          this.bodyA.GetLocalPoint(anchor1, this.localAnchorA);
          this.bodyB.GetLocalPoint(anchor2, this.localAnchorB);
          this.length = b2Max(b2Vec2.DistanceVV(anchor1, anchor2), b2_linearSlop);
          this.minLength = this.length;
          this.maxLength = this.length;
      }
  }
  class b2DistanceJoint extends b2Joint {
      constructor(def) {
          super(def);
          this.m_stiffness = 0;
          this.m_damping = 0;
          this.m_bias = 0;
          this.m_length = 0;
          this.m_minLength = 0;
          this.m_maxLength = 0;
          // Solver shared
          this.m_localAnchorA = new b2Vec2();
          this.m_localAnchorB = new b2Vec2();
          this.m_gamma = 0;
          this.m_impulse = 0;
          this.m_lowerImpulse = 0;
          this.m_upperImpulse = 0;
          // Solver temp
          this.m_indexA = 0;
          this.m_indexB = 0;
          this.m_u = new b2Vec2();
          this.m_rA = new b2Vec2();
          this.m_rB = new b2Vec2();
          this.m_localCenterA = new b2Vec2();
          this.m_localCenterB = new b2Vec2();
          this.m_currentLength = 0;
          this.m_invMassA = 0;
          this.m_invMassB = 0;
          this.m_invIA = 0;
          this.m_invIB = 0;
          this.m_softMass = 0;
          this.m_mass = 0;
          this.m_qA = new b2Rot();
          this.m_qB = new b2Rot();
          this.m_lalcA = new b2Vec2();
          this.m_lalcB = new b2Vec2();
          this.m_localAnchorA.Copy(b2Maybe(def.localAnchorA, b2Vec2.ZERO));
          this.m_localAnchorB.Copy(b2Maybe(def.localAnchorB, b2Vec2.ZERO));
          this.m_length = b2Max(b2Maybe(def.length, this.GetCurrentLength()), b2_linearSlop);
          this.m_minLength = b2Max(b2Maybe(def.minLength, this.m_length), b2_linearSlop);
          this.m_maxLength = b2Max(b2Maybe(def.maxLength, this.m_length), this.m_minLength);
          this.m_stiffness = b2Maybe(def.stiffness, 0);
          this.m_damping = b2Maybe(def.damping, 0);
      }
      GetAnchorA(out) {
          return this.m_bodyA.GetWorldPoint(this.m_localAnchorA, out);
      }
      GetAnchorB(out) {
          return this.m_bodyB.GetWorldPoint(this.m_localAnchorB, out);
      }
      GetReactionForce(inv_dt, out) {
          // b2Vec2 F = inv_dt * (m_impulse + m_lowerImpulse - m_upperImpulse) * m_u;
          out.x = inv_dt * (this.m_impulse + this.m_lowerImpulse - this.m_upperImpulse) * this.m_u.x;
          out.y = inv_dt * (this.m_impulse + this.m_lowerImpulse - this.m_upperImpulse) * this.m_u.y;
          return out;
      }
      GetReactionTorque(inv_dt) {
          return 0;
      }
      GetLocalAnchorA() { return this.m_localAnchorA; }
      GetLocalAnchorB() { return this.m_localAnchorB; }
      SetLength(length) {
          this.m_impulse = 0;
          this.m_length = b2Max(b2_linearSlop, length);
          return this.m_length;
      }
      GetLength() {
          return this.m_length;
      }
      SetMinLength(minLength) {
          this.m_lowerImpulse = 0;
          this.m_minLength = b2Clamp(minLength, b2_linearSlop, this.m_maxLength);
          return this.m_minLength;
      }
      SetMaxLength(maxLength) {
          this.m_upperImpulse = 0;
          this.m_maxLength = b2Max(maxLength, this.m_minLength);
          return this.m_maxLength;
      }
      GetCurrentLength() {
          const pA = this.m_bodyA.GetWorldPoint(this.m_localAnchorA, new b2Vec2());
          const pB = this.m_bodyB.GetWorldPoint(this.m_localAnchorB, new b2Vec2());
          return b2Vec2.DistanceVV(pA, pB);
      }
      SetStiffness(stiffness) {
          this.m_stiffness = stiffness;
      }
      GetStiffness() {
          return this.m_stiffness;
      }
      SetDamping(damping) {
          this.m_damping = damping;
      }
      GetDamping() {
          return this.m_damping;
      }
      Dump(log) {
          const indexA = this.m_bodyA.m_islandIndex;
          const indexB = this.m_bodyB.m_islandIndex;
          log("  const jd: b2DistanceJointDef = new b2DistanceJointDef();\n");
          log("  jd.bodyA = bodies[%d];\n", indexA);
          log("  jd.bodyB = bodies[%d];\n", indexB);
          log("  jd.collideConnected = %s;\n", (this.m_collideConnected) ? ("true") : ("false"));
          log("  jd.localAnchorA.Set(%.15f, %.15f);\n", this.m_localAnchorA.x, this.m_localAnchorA.y);
          log("  jd.localAnchorB.Set(%.15f, %.15f);\n", this.m_localAnchorB.x, this.m_localAnchorB.y);
          log("  jd.length = %.15f;\n", this.m_length);
          log("  jd.minLength = %.15f;\n", this.m_minLength);
          log("  jd.maxLength = %.15f;\n", this.m_maxLength);
          log("  jd.stiffness = %.15f;\n", this.m_stiffness);
          log("  jd.damping = %.15f;\n", this.m_damping);
          log("  joints[%d] = this.m_world.CreateJoint(jd);\n", this.m_index);
      }
      InitVelocityConstraints(data) {
          this.m_indexA = this.m_bodyA.m_islandIndex;
          this.m_indexB = this.m_bodyB.m_islandIndex;
          this.m_localCenterA.Copy(this.m_bodyA.m_sweep.localCenter);
          this.m_localCenterB.Copy(this.m_bodyB.m_sweep.localCenter);
          this.m_invMassA = this.m_bodyA.m_invMass;
          this.m_invMassB = this.m_bodyB.m_invMass;
          this.m_invIA = this.m_bodyA.m_invI;
          this.m_invIB = this.m_bodyB.m_invI;
          const cA = data.positions[this.m_indexA].c;
          const aA = data.positions[this.m_indexA].a;
          const vA = data.velocities[this.m_indexA].v;
          let wA = data.velocities[this.m_indexA].w;
          const cB = data.positions[this.m_indexB].c;
          const aB = data.positions[this.m_indexB].a;
          const vB = data.velocities[this.m_indexB].v;
          let wB = data.velocities[this.m_indexB].w;
          // const qA: b2Rot = new b2Rot(aA), qB: b2Rot = new b2Rot(aB);
          const qA = this.m_qA.SetAngle(aA), qB = this.m_qB.SetAngle(aB);
          // m_rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
          b2Vec2.SubVV(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
          b2Rot.MulRV(qA, this.m_lalcA, this.m_rA);
          // m_rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
          b2Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
          b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);
          // m_u = cB + m_rB - cA - m_rA;
          this.m_u.x = cB.x + this.m_rB.x - cA.x - this.m_rA.x;
          this.m_u.y = cB.y + this.m_rB.y - cA.y - this.m_rA.y;
          // Handle singularity.
          this.m_currentLength = this.m_u.Length();
          if (this.m_currentLength > b2_linearSlop) {
              this.m_u.SelfMul(1 / this.m_currentLength);
          }
          else {
              this.m_u.SetZero();
              this.m_mass = 0;
              this.m_impulse = 0;
              this.m_lowerImpulse = 0;
              this.m_upperImpulse = 0;
          }
          // float32 crAu = b2Cross(m_rA, m_u);
          const crAu = b2Vec2.CrossVV(this.m_rA, this.m_u);
          // float32 crBu = b2Cross(m_rB, m_u);
          const crBu = b2Vec2.CrossVV(this.m_rB, this.m_u);
          // float32 invMass = m_invMassA + m_invIA * crAu * crAu + m_invMassB + m_invIB * crBu * crBu;
          let invMass = this.m_invMassA + this.m_invIA * crAu * crAu + this.m_invMassB + this.m_invIB * crBu * crBu;
          this.m_mass = invMass !== 0 ? 1 / invMass : 0;
          if (this.m_stiffness > 0 && this.m_minLength < this.m_maxLength) {
              // soft
              const C = this.m_currentLength - this.m_length;
              const d = this.m_damping;
              const k = this.m_stiffness;
              // magic formulas
              const h = data.step.dt;
              // gamma = 1 / (h * (d + h * k))
              // the extra factor of h in the denominator is since the lambda is an impulse, not a force
              this.m_gamma = h * (d + h * k);
              this.m_gamma = this.m_gamma !== 0 ? 1 / this.m_gamma : 0;
              this.m_bias = C * h * k * this.m_gamma;
              invMass += this.m_gamma;
              this.m_softMass = invMass !== 0 ? 1 / invMass : 0;
          }
          else {
              // rigid
              this.m_gamma = 0;
              this.m_bias = 0;
              this.m_softMass = this.m_mass;
          }
          if (data.step.warmStarting) {
              // Scale the impulse to support a variable time step.
              this.m_impulse *= data.step.dtRatio;
              this.m_lowerImpulse *= data.step.dtRatio;
              this.m_upperImpulse *= data.step.dtRatio;
              const P = b2Vec2.MulSV(this.m_impulse + this.m_lowerImpulse - this.m_upperImpulse, this.m_u, b2DistanceJoint.InitVelocityConstraints_s_P);
              vA.SelfMulSub(this.m_invMassA, P);
              wA -= this.m_invIA * b2Vec2.CrossVV(this.m_rA, P);
              vB.SelfMulAdd(this.m_invMassB, P);
              wB += this.m_invIB * b2Vec2.CrossVV(this.m_rB, P);
          }
          else {
              this.m_impulse = 0;
          }
          // data.velocities[this.m_indexA].v = vA;
          data.velocities[this.m_indexA].w = wA;
          // data.velocities[this.m_indexB].v = vB;
          data.velocities[this.m_indexB].w = wB;
      }
      SolveVelocityConstraints(data) {
          const vA = data.velocities[this.m_indexA].v;
          let wA = data.velocities[this.m_indexA].w;
          const vB = data.velocities[this.m_indexB].v;
          let wB = data.velocities[this.m_indexB].w;
          if (this.m_minLength < this.m_maxLength) {
              if (this.m_stiffness > 0) {
                  // Cdot = dot(u, v + cross(w, r))
                  const vpA = b2Vec2.AddVCrossSV(vA, wA, this.m_rA, b2DistanceJoint.SolveVelocityConstraints_s_vpA);
                  const vpB = b2Vec2.AddVCrossSV(vB, wB, this.m_rB, b2DistanceJoint.SolveVelocityConstraints_s_vpB);
                  const Cdot = b2Vec2.DotVV(this.m_u, b2Vec2.SubVV(vpB, vpA, b2Vec2.s_t0));
                  const impulse = -this.m_softMass * (Cdot + this.m_bias + this.m_gamma * this.m_impulse);
                  this.m_impulse += impulse;
                  const P = b2Vec2.MulSV(impulse, this.m_u, b2DistanceJoint.SolveVelocityConstraints_s_P);
                  vA.SelfMulSub(this.m_invMassA, P);
                  wA -= this.m_invIA * b2Vec2.CrossVV(this.m_rA, P);
                  vB.SelfMulAdd(this.m_invMassB, P);
                  wB += this.m_invIB * b2Vec2.CrossVV(this.m_rB, P);
              }
              // lower
              {
                  const C = this.m_currentLength - this.m_minLength;
                  const bias = b2Max(0, C) * data.step.inv_dt;
                  const vpA = b2Vec2.AddVCrossSV(vA, wA, this.m_rA, b2DistanceJoint.SolveVelocityConstraints_s_vpA);
                  const vpB = b2Vec2.AddVCrossSV(vB, wB, this.m_rB, b2DistanceJoint.SolveVelocityConstraints_s_vpB);
                  const Cdot = b2Vec2.DotVV(this.m_u, b2Vec2.SubVV(vpB, vpA, b2Vec2.s_t0));
                  let impulse = -this.m_mass * (Cdot + bias);
                  const oldImpulse = this.m_lowerImpulse;
                  this.m_lowerImpulse = b2Max(0, this.m_lowerImpulse + impulse);
                  impulse = this.m_lowerImpulse - oldImpulse;
                  const P = b2Vec2.MulSV(impulse, this.m_u, b2DistanceJoint.SolveVelocityConstraints_s_P);
                  vA.SelfMulSub(this.m_invMassA, P);
                  wA -= this.m_invIA * b2Vec2.CrossVV(this.m_rA, P);
                  vB.SelfMulAdd(this.m_invMassB, P);
                  wB += this.m_invIB * b2Vec2.CrossVV(this.m_rB, P);
              }
              // upper
              {
                  const C = this.m_maxLength - this.m_currentLength;
                  const bias = b2Max(0, C) * data.step.inv_dt;
                  const vpA = b2Vec2.AddVCrossSV(vA, wA, this.m_rA, b2DistanceJoint.SolveVelocityConstraints_s_vpA);
                  const vpB = b2Vec2.AddVCrossSV(vB, wB, this.m_rB, b2DistanceJoint.SolveVelocityConstraints_s_vpB);
                  const Cdot = b2Vec2.DotVV(this.m_u, b2Vec2.SubVV(vpA, vpB, b2Vec2.s_t0));
                  let impulse = -this.m_mass * (Cdot + bias);
                  const oldImpulse = this.m_upperImpulse;
                  this.m_upperImpulse = b2Max(0, this.m_upperImpulse + impulse);
                  impulse = this.m_upperImpulse - oldImpulse;
                  const P = b2Vec2.MulSV(-impulse, this.m_u, b2DistanceJoint.SolveVelocityConstraints_s_P);
                  vA.SelfMulSub(this.m_invMassA, P);
                  wA -= this.m_invIA * b2Vec2.CrossVV(this.m_rA, P);
                  vB.SelfMulAdd(this.m_invMassB, P);
                  wB += this.m_invIB * b2Vec2.CrossVV(this.m_rB, P);
              }
          }
          else {
              // Equal limits
              // Cdot = dot(u, v + cross(w, r))
              const vpA = b2Vec2.AddVCrossSV(vA, wA, this.m_rA, b2DistanceJoint.SolveVelocityConstraints_s_vpA);
              const vpB = b2Vec2.AddVCrossSV(vB, wB, this.m_rB, b2DistanceJoint.SolveVelocityConstraints_s_vpB);
              const Cdot = b2Vec2.DotVV(this.m_u, b2Vec2.SubVV(vpB, vpA, b2Vec2.s_t0));
              const impulse = -this.m_mass * Cdot;
              this.m_impulse += impulse;
              const P = b2Vec2.MulSV(impulse, this.m_u, b2DistanceJoint.SolveVelocityConstraints_s_P);
              vA.SelfMulSub(this.m_invMassA, P);
              wA -= this.m_invIA * b2Vec2.CrossVV(this.m_rA, P);
              vB.SelfMulAdd(this.m_invMassB, P);
              wB += this.m_invIB * b2Vec2.CrossVV(this.m_rB, P);
          }
          // data.velocities[this.m_indexA].v = vA;
          data.velocities[this.m_indexA].w = wA;
          // data.velocities[this.m_indexB].v = vB;
          data.velocities[this.m_indexB].w = wB;
      }
      SolvePositionConstraints(data) {
          const cA = data.positions[this.m_indexA].c;
          let aA = data.positions[this.m_indexA].a;
          const cB = data.positions[this.m_indexB].c;
          let aB = data.positions[this.m_indexB].a;
          // const qA: b2Rot = new b2Rot(aA), qB: b2Rot = new b2Rot(aB);
          const qA = this.m_qA.SetAngle(aA), qB = this.m_qB.SetAngle(aB);
          // b2Vec2 rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
          const rA = b2Rot.MulRV(qA, this.m_lalcA, this.m_rA); // use m_rA
          // b2Vec2 rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
          const rB = b2Rot.MulRV(qB, this.m_lalcB, this.m_rB); // use m_rB
          // b2Vec2 u = cB + rB - cA - rA;
          const u = this.m_u; // use m_u
          u.x = cB.x + rB.x - cA.x - rA.x;
          u.y = cB.y + rB.y - cA.y - rA.y;
          const length = this.m_u.Normalize();
          let C;
          if (this.m_minLength == this.m_maxLength) {
              C = length - this.m_minLength;
          }
          else if (length < this.m_minLength) {
              C = length - this.m_minLength;
          }
          else if (this.m_maxLength < length) {
              C = length - this.m_maxLength;
          }
          else {
              return true;
          }
          const impulse = -this.m_mass * C;
          const P = b2Vec2.MulSV(impulse, u, b2DistanceJoint.SolvePositionConstraints_s_P);
          cA.SelfMulSub(this.m_invMassA, P);
          aA -= this.m_invIA * b2Vec2.CrossVV(rA, P);
          cB.SelfMulAdd(this.m_invMassB, P);
          aB += this.m_invIB * b2Vec2.CrossVV(rB, P);
          // data.positions[this.m_indexA].c = cA;
          data.positions[this.m_indexA].a = aA;
          // data.positions[this.m_indexB].c = cB;
          data.positions[this.m_indexB].a = aB;
          return b2Abs(C) < b2_linearSlop;
      }
      Draw(draw) {
          const xfA = this.m_bodyA.GetTransform();
          const xfB = this.m_bodyB.GetTransform();
          const pA = b2Transform.MulXV(xfA, this.m_localAnchorA, b2DistanceJoint.Draw_s_pA);
          const pB = b2Transform.MulXV(xfB, this.m_localAnchorB, b2DistanceJoint.Draw_s_pB);
          const axis = b2Vec2.SubVV(pB, pA, b2DistanceJoint.Draw_s_axis);
          axis.Normalize();
          const c1 = b2DistanceJoint.Draw_s_c1; // b2Color c1(0.7f, 0.7f, 0.7f);
          const c2 = b2DistanceJoint.Draw_s_c2; // b2Color c2(0.3f, 0.9f, 0.3f);
          const c3 = b2DistanceJoint.Draw_s_c3; // b2Color c3(0.9f, 0.3f, 0.3f);
          const c4 = b2DistanceJoint.Draw_s_c4; // b2Color c4(0.4f, 0.4f, 0.4f);
          draw.DrawSegment(pA, pB, c4);
          // b2Vec2 pRest = pA + this.m_length * axis;
          const pRest = b2Vec2.AddVMulSV(pA, this.m_length, axis, b2DistanceJoint.Draw_s_pRest);
          draw.DrawPoint(pRest, 8.0, c1);
          if (this.m_minLength != this.m_maxLength) {
              if (this.m_minLength > b2_linearSlop) {
                  // b2Vec2 pMin = pA + this.m_minLength * axis;
                  const pMin = b2Vec2.AddVMulSV(pA, this.m_minLength, axis, b2DistanceJoint.Draw_s_pMin);
                  draw.DrawPoint(pMin, 4.0, c2);
              }
              if (this.m_maxLength < b2_maxFloat) {
                  // b2Vec2 pMax = pA + this.m_maxLength * axis;
                  const pMax = b2Vec2.AddVMulSV(pA, this.m_maxLength, axis, b2DistanceJoint.Draw_s_pMax);
                  draw.DrawPoint(pMax, 4.0, c3);
              }
          }
      }
  }
  b2DistanceJoint.InitVelocityConstraints_s_P = new b2Vec2();
  b2DistanceJoint.SolveVelocityConstraints_s_vpA = new b2Vec2();
  b2DistanceJoint.SolveVelocityConstraints_s_vpB = new b2Vec2();
  b2DistanceJoint.SolveVelocityConstraints_s_P = new b2Vec2();
  b2DistanceJoint.SolvePositionConstraints_s_P = new b2Vec2();
  b2DistanceJoint.Draw_s_pA = new b2Vec2();
  b2DistanceJoint.Draw_s_pB = new b2Vec2();
  b2DistanceJoint.Draw_s_axis = new b2Vec2();
  b2DistanceJoint.Draw_s_c1 = new b2Color(0.7, 0.7, 0.7);
  b2DistanceJoint.Draw_s_c2 = new b2Color(0.3, 0.9, 0.3);
  b2DistanceJoint.Draw_s_c3 = new b2Color(0.9, 0.3, 0.3);
  b2DistanceJoint.Draw_s_c4 = new b2Color(0.4, 0.4, 0.4);
  b2DistanceJoint.Draw_s_pRest = new b2Vec2();
  b2DistanceJoint.Draw_s_pMin = new b2Vec2();
  b2DistanceJoint.Draw_s_pMax = new b2Vec2();

  // DEBUG: import { b2Assert } from "../common/b2_settings.js";
  class b2AreaJointDef extends b2JointDef {
      constructor() {
          super(exports.b2JointType.e_areaJoint);
          this.bodies = [];
          this.stiffness = 0;
          this.damping = 0;
      }
      AddBody(body) {
          this.bodies.push(body);
          if (this.bodies.length === 1) {
              this.bodyA = body;
          }
          else if (this.bodies.length === 2) {
              this.bodyB = body;
          }
      }
  }
  class b2AreaJoint extends b2Joint {
      constructor(def) {
          super(def);
          this.m_stiffness = 0;
          this.m_damping = 0;
          // Solver shared
          this.m_impulse = 0;
          this.m_targetArea = 0;
          this.m_delta = new b2Vec2();
          // DEBUG: b2Assert(def.bodies.length >= 3, "You cannot create an area joint with less than three bodies.");
          this.m_bodies = def.bodies;
          this.m_stiffness = b2Maybe(def.stiffness, 0);
          this.m_damping = b2Maybe(def.damping, 0);
          this.m_targetLengths = b2MakeNumberArray(def.bodies.length);
          this.m_normals = b2Vec2.MakeArray(def.bodies.length);
          this.m_joints = []; // b2MakeNullArray(def.bodies.length);
          this.m_deltas = b2Vec2.MakeArray(def.bodies.length);
          const djd = new b2DistanceJointDef();
          djd.stiffness = this.m_stiffness;
          djd.damping = this.m_damping;
          this.m_targetArea = 0;
          for (let i = 0; i < this.m_bodies.length; ++i) {
              const body = this.m_bodies[i];
              const next = this.m_bodies[(i + 1) % this.m_bodies.length];
              const body_c = body.GetWorldCenter();
              const next_c = next.GetWorldCenter();
              this.m_targetLengths[i] = b2Vec2.DistanceVV(body_c, next_c);
              this.m_targetArea += b2Vec2.CrossVV(body_c, next_c);
              djd.Initialize(body, next, body_c, next_c);
              this.m_joints[i] = body.GetWorld().CreateJoint(djd);
          }
          this.m_targetArea *= 0.5;
      }
      GetAnchorA(out) {
          return out;
      }
      GetAnchorB(out) {
          return out;
      }
      GetReactionForce(inv_dt, out) {
          return out;
      }
      GetReactionTorque(inv_dt) {
          return 0;
      }
      SetStiffness(stiffness) {
          this.m_stiffness = stiffness;
          for (let i = 0; i < this.m_joints.length; ++i) {
              this.m_joints[i].SetStiffness(stiffness);
          }
      }
      GetStiffness() {
          return this.m_stiffness;
      }
      SetDamping(damping) {
          this.m_damping = damping;
          for (let i = 0; i < this.m_joints.length; ++i) {
              this.m_joints[i].SetDamping(damping);
          }
      }
      GetDamping() {
          return this.m_damping;
      }
      Dump(log) {
          log("Area joint dumping is not supported.\n");
      }
      InitVelocityConstraints(data) {
          for (let i = 0; i < this.m_bodies.length; ++i) {
              const prev = this.m_bodies[(i + this.m_bodies.length - 1) % this.m_bodies.length];
              const next = this.m_bodies[(i + 1) % this.m_bodies.length];
              const prev_c = data.positions[prev.m_islandIndex].c;
              const next_c = data.positions[next.m_islandIndex].c;
              const delta = this.m_deltas[i];
              b2Vec2.SubVV(next_c, prev_c, delta);
          }
          if (data.step.warmStarting) {
              this.m_impulse *= data.step.dtRatio;
              for (let i = 0; i < this.m_bodies.length; ++i) {
                  const body = this.m_bodies[i];
                  const body_v = data.velocities[body.m_islandIndex].v;
                  const delta = this.m_deltas[i];
                  body_v.x += body.m_invMass * delta.y * 0.5 * this.m_impulse;
                  body_v.y += body.m_invMass * -delta.x * 0.5 * this.m_impulse;
              }
          }
          else {
              this.m_impulse = 0;
          }
      }
      SolveVelocityConstraints(data) {
          let dotMassSum = 0;
          let crossMassSum = 0;
          for (let i = 0; i < this.m_bodies.length; ++i) {
              const body = this.m_bodies[i];
              const body_v = data.velocities[body.m_islandIndex].v;
              const delta = this.m_deltas[i];
              dotMassSum += delta.LengthSquared() / body.GetMass();
              crossMassSum += b2Vec2.CrossVV(body_v, delta);
          }
          const lambda = -2 * crossMassSum / dotMassSum;
          // lambda = b2Clamp(lambda, -b2_maxLinearCorrection, b2_maxLinearCorrection);
          this.m_impulse += lambda;
          for (let i = 0; i < this.m_bodies.length; ++i) {
              const body = this.m_bodies[i];
              const body_v = data.velocities[body.m_islandIndex].v;
              const delta = this.m_deltas[i];
              body_v.x += body.m_invMass * delta.y * 0.5 * lambda;
              body_v.y += body.m_invMass * -delta.x * 0.5 * lambda;
          }
      }
      SolvePositionConstraints(data) {
          let perimeter = 0;
          let area = 0;
          for (let i = 0; i < this.m_bodies.length; ++i) {
              const body = this.m_bodies[i];
              const next = this.m_bodies[(i + 1) % this.m_bodies.length];
              const body_c = data.positions[body.m_islandIndex].c;
              const next_c = data.positions[next.m_islandIndex].c;
              const delta = b2Vec2.SubVV(next_c, body_c, this.m_delta);
              let dist = delta.Length();
              if (dist < b2_epsilon) {
                  dist = 1;
              }
              this.m_normals[i].x = delta.y / dist;
              this.m_normals[i].y = -delta.x / dist;
              perimeter += dist;
              area += b2Vec2.CrossVV(body_c, next_c);
          }
          area *= 0.5;
          const deltaArea = this.m_targetArea - area;
          const toExtrude = 0.5 * deltaArea / perimeter;
          let done = true;
          for (let i = 0; i < this.m_bodies.length; ++i) {
              const body = this.m_bodies[i];
              const body_c = data.positions[body.m_islandIndex].c;
              const next_i = (i + 1) % this.m_bodies.length;
              const delta = b2Vec2.AddVV(this.m_normals[i], this.m_normals[next_i], this.m_delta);
              delta.SelfMul(toExtrude);
              const norm_sq = delta.LengthSquared();
              if (norm_sq > b2Sq(b2_maxLinearCorrection)) {
                  delta.SelfMul(b2_maxLinearCorrection / b2Sqrt(norm_sq));
              }
              if (norm_sq > b2Sq(b2_linearSlop)) {
                  done = false;
              }
              body_c.x += delta.x;
              body_c.y += delta.y;
          }
          return done;
      }
  }

  /*
  * Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  /// This holds contact filtering data.
  class b2Filter {
      constructor() {
          /// The collision category bits. Normally you would just set one bit.
          this.categoryBits = 0x0001;
          /// The collision mask bits. This states the categories that this
          /// shape would accept for collision.
          this.maskBits = 0xFFFF;
          /// Collision groups allow a certain group of objects to never collide (negative)
          /// or always collide (positive). Zero means no collision group. Non-zero group
          /// filtering always wins against the mask bits.
          this.groupIndex = 0;
      }
      Clone() {
          return new b2Filter().Copy(this);
      }
      Copy(other) {
          // DEBUG: b2Assert(this !== other);
          this.categoryBits = other.categoryBits;
          this.maskBits = other.maskBits;
          this.groupIndex = other.groupIndex || 0;
          return this;
      }
  }
  b2Filter.DEFAULT = new b2Filter();
  /// A fixture definition is used to create a fixture. This class defines an
  /// abstract fixture definition. You can reuse fixture definitions safely.
  class b2FixtureDef {
      constructor() {
          /// Use this to store application specific fixture data.
          this.userData = null;
          /// The friction coefficient, usually in the range [0,1].
          this.friction = 0.2;
          /// The restitution (elasticity) usually in the range [0,1].
          this.restitution = 0;
          /// Restitution velocity threshold, usually in m/s. Collisions above this
          /// speed have restitution applied (will bounce).
          this.restitutionThreshold = 1.0 * b2_lengthUnitsPerMeter;
          /// The density, usually in kg/m^2.
          this.density = 0;
          /// A sensor shape collects contact information but never generates a collision
          /// response.
          this.isSensor = false;
          /// Contact filtering data.
          this.filter = new b2Filter();
      }
  }
  /// This proxy is used internally to connect fixtures to the broad-phase.
  class b2FixtureProxy {
      constructor(fixture, childIndex) {
          this.aabb = new b2AABB();
          this.childIndex = 0;
          this.fixture = fixture;
          this.childIndex = childIndex;
          this.fixture.m_shape.ComputeAABB(this.aabb, this.fixture.m_body.GetTransform(), childIndex);
          this.treeNode = this.fixture.m_body.m_world.m_contactManager.m_broadPhase.CreateProxy(this.aabb, this);
      }
      Reset() {
          this.fixture.m_body.m_world.m_contactManager.m_broadPhase.DestroyProxy(this.treeNode);
      }
      Touch() {
          this.fixture.m_body.m_world.m_contactManager.m_broadPhase.TouchProxy(this.treeNode);
      }
      Synchronize(transform1, transform2) {
          if (transform1 === transform2) {
              this.fixture.m_shape.ComputeAABB(this.aabb, transform1, this.childIndex);
              this.fixture.m_body.m_world.m_contactManager.m_broadPhase.MoveProxy(this.treeNode, this.aabb, b2Vec2.ZERO);
          }
          else {
              // Compute an AABB that covers the swept shape (may miss some rotation effect).
              const aabb1 = b2FixtureProxy.Synchronize_s_aabb1;
              const aabb2 = b2FixtureProxy.Synchronize_s_aabb2;
              this.fixture.m_shape.ComputeAABB(aabb1, transform1, this.childIndex);
              this.fixture.m_shape.ComputeAABB(aabb2, transform2, this.childIndex);
              this.aabb.Combine2(aabb1, aabb2);
              const displacement = b2FixtureProxy.Synchronize_s_displacement;
              displacement.Copy(aabb2.GetCenter()).SelfSub(aabb1.GetCenter());
              this.fixture.m_body.m_world.m_contactManager.m_broadPhase.MoveProxy(this.treeNode, this.aabb, displacement);
          }
      }
  }
  b2FixtureProxy.Synchronize_s_aabb1 = new b2AABB();
  b2FixtureProxy.Synchronize_s_aabb2 = new b2AABB();
  b2FixtureProxy.Synchronize_s_displacement = new b2Vec2();
  /// A fixture is used to attach a shape to a body for collision detection. A fixture
  /// inherits its transform from its parent. Fixtures hold additional non-geometric data
  /// such as friction, collision filters, etc.
  /// Fixtures are created via b2Body::CreateFixture.
  /// @warning you cannot reuse fixtures.
  class b2Fixture {
      constructor(body, def) {
          this.m_density = 0;
          this.m_next = null;
          this.m_friction = 0;
          this.m_restitution = 0;
          this.m_restitutionThreshold = 1.0 * b2_lengthUnitsPerMeter;
          this.m_proxies = [];
          this.m_filter = new b2Filter();
          this.m_isSensor = false;
          this.m_userData = null;
          this.m_body = body;
          this.m_shape = def.shape.Clone();
          this.m_userData = b2Maybe(def.userData, null);
          this.m_friction = b2Maybe(def.friction, 0.2);
          this.m_restitution = b2Maybe(def.restitution, 0);
          this.m_restitutionThreshold = b2Maybe(def.restitutionThreshold, 0);
          this.m_filter.Copy(b2Maybe(def.filter, b2Filter.DEFAULT));
          this.m_isSensor = b2Maybe(def.isSensor, false);
          this.m_density = b2Maybe(def.density, 0);
      }
      get m_proxyCount() { return this.m_proxies.length; }
      // 为了避免引擎/项目报错增加到空方法；通过 body.CreateFixture 以及 body.DestroyFixture 方法执行时不需要这两个方法的
      Create(allocator, body, def) {
      }
      Destroy() {
      }
      Reset() {
          // The proxies must be destroyed before calling this.
          // DEBUG: b2Assert(this.m_proxyCount === 0);
      }
      /// Get the type of the child shape. You can use this to down cast to the concrete shape.
      /// @return the shape type.
      GetType() {
          return this.m_shape.GetType();
      }
      /// Get the child shape. You can modify the child shape, however you should not change the
      /// number of vertices because this will crash some collision caching mechanisms.
      /// Manipulating the shape may lead to non-physical behavior.
      GetShape() {
          return this.m_shape;
      }
      /// Set if this fixture is a sensor.
      SetSensor(sensor) {
          if (sensor !== this.m_isSensor) {
              this.m_body.SetAwake(true);
              this.m_isSensor = sensor;
          }
      }
      /// Is this fixture a sensor (non-solid)?
      /// @return the true if the shape is a sensor.
      IsSensor() {
          return this.m_isSensor;
      }
      /// Set the contact filtering data. This will not update contacts until the next time
      /// step when either parent body is active and awake.
      /// This automatically calls Refilter.
      SetFilterData(filter) {
          this.m_filter.Copy(filter);
          this.Refilter();
      }
      /// Get the contact filtering data.
      GetFilterData() {
          return this.m_filter;
      }
      /// Call this if you want to establish collision that was previously disabled by b2ContactFilter::ShouldCollide.
      Refilter() {
          // Flag associated contacts for filtering.
          let edge = this.m_body.GetContactList();
          while (edge) {
              const contact = edge.contact;
              const fixtureA = contact.GetFixtureA();
              const fixtureB = contact.GetFixtureB();
              if (fixtureA === this || fixtureB === this) {
                  contact.FlagForFiltering();
              }
              edge = edge.next;
          }
          // Touch each proxy so that new pairs may be created
          this.TouchProxies();
      }
      /// Get the parent body of this fixture. This is NULL if the fixture is not attached.
      /// @return the parent body.
      GetBody() {
          return this.m_body;
      }
      /// Get the next fixture in the parent body's fixture list.
      /// @return the next shape.
      GetNext() {
          return this.m_next;
      }
      /// Get the user data that was assigned in the fixture definition. Use this to
      /// store your application specific data.
      GetUserData() {
          return this.m_userData;
      }
      /// Set the user data. Use this to store your application specific data.
      SetUserData(data) {
          this.m_userData = data;
      }
      /// Test a point for containment in this fixture.
      /// @param p a point in world coordinates.
      TestPoint(p) {
          return this.m_shape.TestPoint(this.m_body.GetTransform(), p);
      }
      /// Cast a ray against this shape.
      /// @param output the ray-cast results.
      /// @param input the ray-cast input parameters.
      RayCast(output, input, childIndex) {
          return this.m_shape.RayCast(output, input, this.m_body.GetTransform(), childIndex);
      }
      /// Get the mass data for this fixture. The mass data is based on the density and
      /// the shape. The rotational inertia is about the shape's origin. This operation
      /// may be expensive.
      GetMassData(massData = new b2MassData()) {
          this.m_shape.ComputeMass(massData, this.m_density);
          return massData;
      }
      /// Set the density of this fixture. This will _not_ automatically adjust the mass
      /// of the body. You must call b2Body::ResetMassData to update the body's mass.
      SetDensity(density) {
          this.m_density = density;
      }
      /// Get the density of this fixture.
      GetDensity() {
          return this.m_density;
      }
      /// Get the coefficient of friction.
      GetFriction() {
          return this.m_friction;
      }
      /// Set the coefficient of friction. This will _not_ change the friction of
      /// existing contacts.
      SetFriction(friction) {
          this.m_friction = friction;
      }
      /// Get the coefficient of restitution.
      GetRestitution() {
          return this.m_restitution;
      }
      /// Set the coefficient of restitution. This will _not_ change the restitution of
      /// existing contacts.
      SetRestitution(restitution) {
          this.m_restitution = restitution;
      }
      /// Get the restitution velocity threshold.
      GetRestitutionThreshold() {
          return this.m_restitutionThreshold;
      }
      /// Set the restitution threshold. This will _not_ change the restitution threshold of
      /// existing contacts.
      SetRestitutionThreshold(threshold) {
          this.m_restitutionThreshold = threshold;
      }
      /// Get the fixture's AABB. This AABB may be enlarge and/or stale.
      /// If you need a more accurate AABB, compute it using the shape and
      /// the body transform.
      GetAABB(childIndex) {
          // DEBUG: b2Assert(0 <= childIndex && childIndex < this.m_proxyCount);
          return this.m_proxies[childIndex].aabb;
      }
      /// Dump this fixture to the log file.
      Dump(log, bodyIndex) {
          log("    const fd: b2FixtureDef = new b2FixtureDef();\n");
          log("    fd.friction = %.15f;\n", this.m_friction);
          log("    fd.restitution = %.15f;\n", this.m_restitution);
          log("    fd.restitutionThreshold = %.15f;\n", this.m_restitutionThreshold);
          log("    fd.density = %.15f;\n", this.m_density);
          log("    fd.isSensor = %s;\n", (this.m_isSensor) ? ("true") : ("false"));
          log("    fd.filter.categoryBits = %d;\n", this.m_filter.categoryBits);
          log("    fd.filter.maskBits = %d;\n", this.m_filter.maskBits);
          log("    fd.filter.groupIndex = %d;\n", this.m_filter.groupIndex);
          this.m_shape.Dump(log);
          log("\n");
          log("    fd.shape = shape;\n");
          log("\n");
          log("    bodies[%d].CreateFixture(fd);\n", bodyIndex);
      }
      // These support body activation/deactivation.
      CreateProxies() {
          if (this.m_proxies.length !== 0) {
              throw new Error();
          }
          // Create proxies in the broad-phase.
          for (let i = 0; i < this.m_shape.GetChildCount(); ++i) {
              this.m_proxies[i] = new b2FixtureProxy(this, i);
          }
      }
      DestroyProxies() {
          // Destroy proxies in the broad-phase.
          for (const proxy of this.m_proxies) {
              proxy.Reset();
          }
          this.m_proxies.length = 0;
      }
      TouchProxies() {
          for (const proxy of this.m_proxies) {
              proxy.Touch();
          }
      }
      Synchronize(broadPhase, transform1, transform2) {
          this.SynchronizeProxies(transform1, transform2);
      }
      SynchronizeProxies(transform1, transform2) {
          for (const proxy of this.m_proxies) {
              proxy.Synchronize(transform1, transform2);
          }
      }
  }

  /*
  * Copyright (c) 2006-2011 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  /// The body type.
  /// static: zero mass, zero velocity, may be manually moved
  /// kinematic: zero mass, non-zero velocity set by user, moved by solver
  /// dynamic: positive mass, non-zero velocity determined by forces, moved by solver
  exports.b2BodyType = void 0;
  (function (b2BodyType) {
      b2BodyType[b2BodyType["b2_unknown"] = -1] = "b2_unknown";
      b2BodyType[b2BodyType["b2_staticBody"] = 0] = "b2_staticBody";
      b2BodyType[b2BodyType["b2_kinematicBody"] = 1] = "b2_kinematicBody";
      b2BodyType[b2BodyType["b2_dynamicBody"] = 2] = "b2_dynamicBody";
      // TODO_ERIN
      // b2_bulletBody = 3
  })(exports.b2BodyType || (exports.b2BodyType = {}));
  /// A body definition holds all the data needed to construct a rigid body.
  /// You can safely re-use body definitions. Shapes are added to a body after construction.
  class b2BodyDef {
      constructor() {
          /// The body type: static, kinematic, or dynamic.
          /// Note: if a dynamic body would have zero mass, the mass is set to one.
          this.type = exports.b2BodyType.b2_staticBody;
          /// The world position of the body. Avoid creating bodies at the origin
          /// since this can lead to many overlapping shapes.
          /// kylin: C++版本的b2Vec2重载了大量的运算符，为了避免开发者错误操作，设置为 readonly 是合理的
          this.position = new b2Vec2(0, 0);
          /// The world angle of the body in radians.
          this.angle = 0;
          /// The linear velocity of the body's origin in world co-ordinates.
          this.linearVelocity = new b2Vec2(0, 0);
          /// The angular velocity of the body.
          this.angularVelocity = 0;
          /// Linear damping is use to reduce the linear velocity. The damping parameter
          /// can be larger than 1.0f but the damping effect becomes sensitive to the
          /// time step when the damping parameter is large.
          this.linearDamping = 0;
          /// Angular damping is use to reduce the angular velocity. The damping parameter
          /// can be larger than 1.0f but the damping effect becomes sensitive to the
          /// time step when the damping parameter is large.
          this.angularDamping = 0;
          /// Set this flag to false if this body should never fall asleep. Note that
          /// this increases CPU usage.
          this.allowSleep = true;
          /// Is this body initially awake or sleeping?
          this.awake = true;
          /// Should this body be prevented from rotating? Useful for characters.
          this.fixedRotation = false;
          /// Is this a fast moving body that should be prevented from tunneling through
          /// other moving bodies? Note that all bodies are prevented from tunneling through
          /// kinematic and static bodies. This setting is only considered on dynamic bodies.
          /// @warning You should use this flag sparingly since it increases processing time.
          this.bullet = false;
          /// Does this body start out enabled?
          this.enabled = true;
          /// Use this to store application specific body data.
          this.userData = null;
          /// Scale the gravity applied to this body.
          this.gravityScale = 1;
      }
  }
  /// A rigid body. These are created via b2World::CreateBody.
  class b2Body {
      constructor(bd, world) {
          this.m_type = exports.b2BodyType.b2_staticBody;
          this.m_islandFlag = false;
          this.m_awakeFlag = false;
          this.m_autoSleepFlag = false;
          this.m_bulletFlag = false;
          this.m_fixedRotationFlag = false;
          this.m_enabledFlag = false;
          this.m_toiFlag = false;
          this.m_islandIndex = 0;
          this.m_xf = new b2Transform(); // the body origin transform
          this.m_sweep = new b2Sweep(); // the swept motion for CCD
          this.m_linearVelocity = new b2Vec2();
          this.m_angularVelocity = 0;
          this.m_force = new b2Vec2();
          this.m_torque = 0;
          this.m_prev = null;
          this.m_next = null;
          this.m_fixtureList = null;
          this.m_fixtureCount = 0;
          this.m_jointList = null;
          this.m_contactList = null;
          this.m_mass = 1;
          this.m_invMass = 1;
          // Rotational inertia about the center of mass.
          this.m_I = 0;
          this.m_invI = 0;
          this.m_linearDamping = 0;
          this.m_angularDamping = 0;
          this.m_gravityScale = 1;
          this.m_sleepTime = 0;
          this.m_userData = null;
          this.m_bulletFlag = b2Maybe(bd.bullet, false);
          this.m_fixedRotationFlag = b2Maybe(bd.fixedRotation, false);
          this.m_autoSleepFlag = b2Maybe(bd.allowSleep, true);
          // this.m_awakeFlag = b2Maybe(bd.awake, true);
          if (b2Maybe(bd.awake, false) && b2Maybe(bd.type, exports.b2BodyType.b2_staticBody) !== exports.b2BodyType.b2_staticBody) {
              this.m_awakeFlag = true;
          }
          this.m_enabledFlag = b2Maybe(bd.enabled, true);
          this.m_world = world;
          this.m_xf.p.Copy(b2Maybe(bd.position, b2Vec2.ZERO));
          // DEBUG: b2Assert(this.m_xf.p.IsValid());
          this.m_xf.q.SetAngle(b2Maybe(bd.angle, 0));
          // DEBUG: b2Assert(b2IsValid(this.m_xf.q.GetAngle()));
          this.m_sweep.localCenter.SetZero();
          this.m_sweep.c0.Copy(this.m_xf.p);
          this.m_sweep.c.Copy(this.m_xf.p);
          this.m_sweep.a0 = this.m_sweep.a = this.m_xf.q.GetAngle();
          this.m_sweep.alpha0 = 0;
          this.m_linearVelocity.Copy(b2Maybe(bd.linearVelocity, b2Vec2.ZERO));
          // DEBUG: b2Assert(this.m_linearVelocity.IsValid());
          this.m_angularVelocity = b2Maybe(bd.angularVelocity, 0);
          // DEBUG: b2Assert(b2IsValid(this.m_angularVelocity));
          this.m_linearDamping = b2Maybe(bd.linearDamping, 0);
          this.m_angularDamping = b2Maybe(bd.angularDamping, 0);
          this.m_gravityScale = b2Maybe(bd.gravityScale, 1);
          // DEBUG: b2Assert(b2IsValid(this.m_gravityScale) && this.m_gravityScale >= 0);
          // DEBUG: b2Assert(b2IsValid(this.m_angularDamping) && this.m_angularDamping >= 0);
          // DEBUG: b2Assert(b2IsValid(this.m_linearDamping) && this.m_linearDamping >= 0);
          this.m_force.SetZero();
          this.m_torque = 0;
          this.m_sleepTime = 0;
          this.m_type = b2Maybe(bd.type, exports.b2BodyType.b2_staticBody);
          this.m_mass = 0;
          this.m_invMass = 0;
          this.m_I = 0;
          this.m_invI = 0;
          this.m_userData = bd.userData;
          this.m_fixtureList = null;
          this.m_fixtureCount = 0;
      }
      CreateFixture(a, b = 0) {
          if (a instanceof b2Shape) {
              return this.CreateFixtureShapeDensity(a, b);
          }
          else {
              return this.CreateFixtureDef(a);
          }
      }
      /// Creates a fixture and attach it to this body. Use this function if you need
      /// to set some fixture parameters, like friction. Otherwise you can create the
      /// fixture directly from a shape.
      /// If the density is non-zero, this function automatically updates the mass of the body.
      /// Contacts are not created until the next time step.
      /// @param def the fixture definition.
      /// @warning This function is locked during callbacks.
      CreateFixtureDef(def) {
          if (this.m_world.IsLocked()) {
              throw new Error();
          }
          const fixture = new b2Fixture(this, def);
          if (this.m_enabledFlag) {
              fixture.CreateProxies();
          }
          fixture.m_next = this.m_fixtureList;
          this.m_fixtureList = fixture;
          ++this.m_fixtureCount;
          // fixture.m_body = this;
          // Adjust mass properties if needed.
          if (fixture.m_density > 0) {
              this.ResetMassData();
          }
          // Let the world know we have a new fixture. This will cause new contacts
          // to be created at the beginning of the next time step.
          this.m_world.m_newContacts = true;
          return fixture;
      }
      CreateFixtureShapeDensity(shape, density = 0) {
          const def = b2Body.CreateFixtureShapeDensity_s_def;
          def.shape = shape;
          def.density = density;
          return this.CreateFixtureDef(def);
      }
      /// Destroy a fixture. This removes the fixture from the broad-phase and
      /// destroys all contacts associated with this fixture. This will
      /// automatically adjust the mass of the body if the body is dynamic and the
      /// fixture has positive density.
      /// All fixtures attached to a body are implicitly destroyed when the body is destroyed.
      /// @param fixture the fixture to be removed.
      /// @warning This function is locked during callbacks.
      DestroyFixture(fixture) {
          if (this.m_world.IsLocked()) {
              throw new Error();
          }
          // DEBUG: b2Assert(fixture.m_body === this);
          // Remove the fixture from this body's singly linked list.
          // DEBUG: b2Assert(this.m_fixtureCount > 0);
          let node = this.m_fixtureList;
          let ppF = null;
          // DEBUG: let found: boolean = false;
          while (node !== null) {
              if (node === fixture) {
                  if (ppF) {
                      ppF.m_next = fixture.m_next;
                  }
                  else {
                      this.m_fixtureList = fixture.m_next;
                  }
                  // DEBUG: found = true;
                  break;
              }
              ppF = node;
              node = node.m_next;
          }
          // You tried to remove a shape that is not attached to this body.
          // DEBUG: b2Assert(found);
          // Destroy any contacts associated with the fixture.
          let edge = this.m_contactList;
          while (edge) {
              const c = edge.contact;
              edge = edge.next;
              const fixtureA = c.GetFixtureA();
              const fixtureB = c.GetFixtureB();
              if (fixture === fixtureA || fixture === fixtureB) {
                  // This destroys the contact and removes it from
                  // this body's contact list.
                  this.m_world.m_contactManager.Destroy(c);
              }
          }
          if (this.m_enabledFlag) {
              fixture.DestroyProxies();
          }
          // fixture.m_body = null;
          fixture.m_next = null;
          fixture.Reset();
          --this.m_fixtureCount;
          // Reset the mass data.
          this.ResetMassData();
      }
      /// Set the position of the body's origin and rotation.
      /// This breaks any contacts and wakes the other bodies.
      /// Manipulating a body's transform may cause non-physical behavior.
      /// @param position the world position of the body's local origin.
      /// @param angle the world rotation in radians.
      SetTransformVec(position, angle) {
          this.SetTransformXY(position.x, position.y, angle);
      }
      SetTransformXY(x, y, angle) {
          if (this.m_world.IsLocked()) {
              throw new Error();
          }
          this.m_xf.q.SetAngle(angle);
          this.m_xf.p.Set(x, y);
          b2Transform.MulXV(this.m_xf, this.m_sweep.localCenter, this.m_sweep.c);
          this.m_sweep.a = angle;
          this.m_sweep.c0.Copy(this.m_sweep.c);
          this.m_sweep.a0 = angle;
          for (let f = this.m_fixtureList; f; f = f.m_next) {
              f.SynchronizeProxies(this.m_xf, this.m_xf);
          }
          // Check for new contacts the next step
          this.m_world.m_newContacts = true;
      }
      SetTransform(position, angle) {
          this.SetTransformXY(position.x, position.y, angle);
      }
      /// Get the body transform for the body's origin.
      /// @return the world transform of the body's origin.
      GetTransform() {
          return this.m_xf;
      }
      /// Get the world body origin position.
      /// @return the world position of the body's origin.
      GetPosition() {
          return this.m_xf.p;
      }
      SetPosition(position) {
          this.SetTransformVec(position, this.GetAngle());
      }
      SetPositionXY(x, y) {
          this.SetTransformXY(x, y, this.GetAngle());
      }
      /// Get the angle in radians.
      /// @return the current world rotation angle in radians.
      GetAngle() {
          return this.m_sweep.a;
      }
      SetAngle(angle) {
          this.SetTransformVec(this.GetPosition(), angle);
      }
      /// Get the world position of the center of mass.
      GetWorldCenter() {
          return this.m_sweep.c;
      }
      /// Get the local position of the center of mass.
      GetLocalCenter() {
          return this.m_sweep.localCenter;
      }
      /// Set the linear velocity of the center of mass.
      /// @param v the new linear velocity of the center of mass.
      SetLinearVelocity(v) {
          if (this.m_type === exports.b2BodyType.b2_staticBody) {
              return;
          }
          if (b2Vec2.DotVV(v, v) > 0) {
              this.SetAwake(true);
          }
          this.m_linearVelocity.Copy(v);
      }
      /// Get the linear velocity of the center of mass.
      /// @return the linear velocity of the center of mass.
      GetLinearVelocity() {
          return this.m_linearVelocity;
      }
      /// Set the angular velocity.
      /// @param omega the new angular velocity in radians/second.
      SetAngularVelocity(w) {
          if (this.m_type === exports.b2BodyType.b2_staticBody) {
              return;
          }
          if (w * w > 0) {
              this.SetAwake(true);
          }
          this.m_angularVelocity = w;
      }
      /// Get the angular velocity.
      /// @return the angular velocity in radians/second.
      GetAngularVelocity() {
          return this.m_angularVelocity;
      }
      GetDefinition(bd) {
          bd.type = this.GetType();
          bd.allowSleep = this.m_autoSleepFlag;
          bd.angle = this.GetAngle();
          bd.angularDamping = this.m_angularDamping;
          bd.gravityScale = this.m_gravityScale;
          bd.angularVelocity = this.m_angularVelocity;
          bd.fixedRotation = this.m_fixedRotationFlag;
          bd.bullet = this.m_bulletFlag;
          bd.awake = this.m_awakeFlag;
          bd.linearDamping = this.m_linearDamping;
          bd.linearVelocity.Copy(this.GetLinearVelocity());
          bd.position.Copy(this.GetPosition());
          bd.userData = this.GetUserData();
          return bd;
      }
      /// Apply a force at a world point. If the force is not
      /// applied at the center of mass, it will generate a torque and
      /// affect the angular velocity. This wakes up the body.
      /// @param force the world force vector, usually in Newtons (N).
      /// @param point the world position of the point of application.
      /// @param wake also wake up the body
      ApplyForce(force, point, wake = true) {
          if (this.m_type !== exports.b2BodyType.b2_dynamicBody) {
              return;
          }
          if (wake && !this.m_awakeFlag) {
              this.SetAwake(true);
          }
          // Don't accumulate a force if the body is sleeping.
          if (this.m_awakeFlag) {
              this.m_force.x += force.x;
              this.m_force.y += force.y;
              this.m_torque += ((point.x - this.m_sweep.c.x) * force.y - (point.y - this.m_sweep.c.y) * force.x);
          }
      }
      /// Apply a force to the center of mass. This wakes up the body.
      /// @param force the world force vector, usually in Newtons (N).
      /// @param wake also wake up the body
      ApplyForceToCenter(force, wake = true) {
          if (this.m_type !== exports.b2BodyType.b2_dynamicBody) {
              return;
          }
          if (wake && !this.m_awakeFlag) {
              this.SetAwake(true);
          }
          // Don't accumulate a force if the body is sleeping.
          if (this.m_awakeFlag) {
              this.m_force.x += force.x;
              this.m_force.y += force.y;
          }
      }
      /// Apply a torque. This affects the angular velocity
      /// without affecting the linear velocity of the center of mass.
      /// @param torque about the z-axis (out of the screen), usually in N-m.
      /// @param wake also wake up the body
      ApplyTorque(torque, wake = true) {
          if (this.m_type !== exports.b2BodyType.b2_dynamicBody) {
              return;
          }
          if (wake && !this.m_awakeFlag) {
              this.SetAwake(true);
          }
          // Don't accumulate a force if the body is sleeping.
          if (this.m_awakeFlag) {
              this.m_torque += torque;
          }
      }
      /// Apply an impulse at a point. This immediately modifies the velocity.
      /// It also modifies the angular velocity if the point of application
      /// is not at the center of mass. This wakes up the body.
      /// @param impulse the world impulse vector, usually in N-seconds or kg-m/s.
      /// @param point the world position of the point of application.
      /// @param wake also wake up the body
      ApplyLinearImpulse(impulse, point, wake = true) {
          if (this.m_type !== exports.b2BodyType.b2_dynamicBody) {
              return;
          }
          if (wake && !this.m_awakeFlag) {
              this.SetAwake(true);
          }
          // Don't accumulate a force if the body is sleeping.
          if (this.m_awakeFlag) {
              this.m_linearVelocity.x += this.m_invMass * impulse.x;
              this.m_linearVelocity.y += this.m_invMass * impulse.y;
              this.m_angularVelocity += this.m_invI * ((point.x - this.m_sweep.c.x) * impulse.y - (point.y - this.m_sweep.c.y) * impulse.x);
          }
      }
      /// Apply an impulse at the center of gravity. This immediately modifies the velocity.
      /// @param impulse the world impulse vector, usually in N-seconds or kg-m/s.
      /// @param wake also wake up the body
      ApplyLinearImpulseToCenter(impulse, wake = true) {
          if (this.m_type !== exports.b2BodyType.b2_dynamicBody) {
              return;
          }
          if (wake && !this.m_awakeFlag) {
              this.SetAwake(true);
          }
          // Don't accumulate a force if the body is sleeping.
          if (this.m_awakeFlag) {
              this.m_linearVelocity.x += this.m_invMass * impulse.x;
              this.m_linearVelocity.y += this.m_invMass * impulse.y;
          }
      }
      /// Apply an angular impulse.
      /// @param impulse the angular impulse in units of kg*m*m/s
      /// @param wake also wake up the body
      ApplyAngularImpulse(impulse, wake = true) {
          if (this.m_type !== exports.b2BodyType.b2_dynamicBody) {
              return;
          }
          if (wake && !this.m_awakeFlag) {
              this.SetAwake(true);
          }
          // Don't accumulate a force if the body is sleeping.
          if (this.m_awakeFlag) {
              this.m_angularVelocity += this.m_invI * impulse;
          }
      }
      /// Get the total mass of the body.
      /// @return the mass, usually in kilograms (kg).
      GetMass() {
          return this.m_mass;
      }
      /// Get the rotational inertia of the body about the local origin.
      /// @return the rotational inertia, usually in kg-m^2.
      GetInertia() {
          return this.m_I + this.m_mass * b2Vec2.DotVV(this.m_sweep.localCenter, this.m_sweep.localCenter);
      }
      /// Get the mass data of the body.
      /// @return a struct containing the mass, inertia and center of the body.
      GetMassData(data) {
          data.mass = this.m_mass;
          data.I = this.m_I + this.m_mass * b2Vec2.DotVV(this.m_sweep.localCenter, this.m_sweep.localCenter);
          data.center.Copy(this.m_sweep.localCenter);
          return data;
      }
      SetMassData(massData) {
          if (this.m_world.IsLocked()) {
              throw new Error();
          }
          if (this.m_type !== exports.b2BodyType.b2_dynamicBody) {
              return;
          }
          this.m_invMass = 0;
          this.m_I = 0;
          this.m_invI = 0;
          this.m_mass = massData.mass;
          if (this.m_mass <= 0) {
              this.m_mass = 1;
          }
          this.m_invMass = 1 / this.m_mass;
          if (massData.I > 0 && !this.m_fixedRotationFlag) {
              this.m_I = massData.I - this.m_mass * b2Vec2.DotVV(massData.center, massData.center);
              // DEBUG: b2Assert(this.m_I > 0);
              this.m_invI = 1 / this.m_I;
          }
          // Move center of mass.
          const oldCenter = b2Body.SetMassData_s_oldCenter.Copy(this.m_sweep.c);
          this.m_sweep.localCenter.Copy(massData.center);
          b2Transform.MulXV(this.m_xf, this.m_sweep.localCenter, this.m_sweep.c);
          this.m_sweep.c0.Copy(this.m_sweep.c);
          // Update center of mass velocity.
          b2Vec2.AddVCrossSV(this.m_linearVelocity, this.m_angularVelocity, b2Vec2.SubVV(this.m_sweep.c, oldCenter, b2Vec2.s_t0), this.m_linearVelocity);
      }
      ResetMassData() {
          // Compute mass data from shapes. Each shape has its own density.
          this.m_mass = 0;
          this.m_invMass = 0;
          this.m_I = 0;
          this.m_invI = 0;
          this.m_sweep.localCenter.SetZero();
          // Static and kinematic bodies have zero mass.
          if (this.m_type === exports.b2BodyType.b2_staticBody || this.m_type === exports.b2BodyType.b2_kinematicBody) {
              this.m_sweep.c0.Copy(this.m_xf.p);
              this.m_sweep.c.Copy(this.m_xf.p);
              this.m_sweep.a0 = this.m_sweep.a;
              return;
          }
          // DEBUG: b2Assert(this.m_type === b2BodyType.b2_dynamicBody);
          // Accumulate mass over all fixtures.
          const localCenter = b2Body.ResetMassData_s_localCenter.SetZero();
          for (let f = this.m_fixtureList; f; f = f.m_next) {
              if (f.m_density === 0) {
                  continue;
              }
              const massData = f.GetMassData(b2Body.ResetMassData_s_massData);
              this.m_mass += massData.mass;
              localCenter.x += massData.center.x * massData.mass;
              localCenter.y += massData.center.y * massData.mass;
              this.m_I += massData.I;
          }
          // Compute center of mass.
          if (this.m_mass > 0) {
              this.m_invMass = 1 / this.m_mass;
              localCenter.x *= this.m_invMass;
              localCenter.y *= this.m_invMass;
          }
          if (this.m_I > 0 && !this.m_fixedRotationFlag) {
              // Center the inertia about the center of mass.
              this.m_I -= this.m_mass * b2Vec2.DotVV(localCenter, localCenter);
              // DEBUG: b2Assert(this.m_I > 0);
              this.m_invI = 1 / this.m_I;
          }
          else {
              this.m_I = 0;
              this.m_invI = 0;
          }
          // Move center of mass.
          const oldCenter = b2Body.ResetMassData_s_oldCenter.Copy(this.m_sweep.c);
          this.m_sweep.localCenter.Copy(localCenter);
          b2Transform.MulXV(this.m_xf, this.m_sweep.localCenter, this.m_sweep.c);
          this.m_sweep.c0.Copy(this.m_sweep.c);
          // Update center of mass velocity.
          b2Vec2.AddVCrossSV(this.m_linearVelocity, this.m_angularVelocity, b2Vec2.SubVV(this.m_sweep.c, oldCenter, b2Vec2.s_t0), this.m_linearVelocity);
      }
      /// Get the world coordinates of a point given the local coordinates.
      /// @param localPoint a point on the body measured relative the the body's origin.
      /// @return the same point expressed in world coordinates.
      GetWorldPoint(localPoint, out) {
          return b2Transform.MulXV(this.m_xf, localPoint, out);
      }
      /// Get the world coordinates of a vector given the local coordinates.
      /// @param localVector a vector fixed in the body.
      /// @return the same vector expressed in world coordinates.
      GetWorldVector(localVector, out) {
          return b2Rot.MulRV(this.m_xf.q, localVector, out);
      }
      /// Gets a local point relative to the body's origin given a world point.
      /// @param a point in world coordinates.
      /// @return the corresponding local point relative to the body's origin.
      GetLocalPoint(worldPoint, out) {
          return b2Transform.MulTXV(this.m_xf, worldPoint, out);
      }
      /// Gets a local vector given a world vector.
      /// @param a vector in world coordinates.
      /// @return the corresponding local vector.
      GetLocalVector(worldVector, out) {
          return b2Rot.MulTRV(this.m_xf.q, worldVector, out);
      }
      /// Get the world linear velocity of a world point attached to this body.
      /// @param a point in world coordinates.
      /// @return the world velocity of a point.
      GetLinearVelocityFromWorldPoint(worldPoint, out) {
          return b2Vec2.AddVCrossSV(this.m_linearVelocity, this.m_angularVelocity, b2Vec2.SubVV(worldPoint, this.m_sweep.c, b2Vec2.s_t0), out);
      }
      /// Get the world velocity of a local point.
      /// @param a point in local coordinates.
      /// @return the world velocity of a point.
      GetLinearVelocityFromLocalPoint(localPoint, out) {
          return this.GetLinearVelocityFromWorldPoint(this.GetWorldPoint(localPoint, out), out);
      }
      /// Get the linear damping of the body.
      GetLinearDamping() {
          return this.m_linearDamping;
      }
      /// Set the linear damping of the body.
      SetLinearDamping(linearDamping) {
          this.m_linearDamping = linearDamping;
      }
      /// Get the angular damping of the body.
      GetAngularDamping() {
          return this.m_angularDamping;
      }
      /// Set the angular damping of the body.
      SetAngularDamping(angularDamping) {
          this.m_angularDamping = angularDamping;
      }
      /// Get the gravity scale of the body.
      GetGravityScale() {
          return this.m_gravityScale;
      }
      /// Set the gravity scale of the body.
      SetGravityScale(scale) {
          this.m_gravityScale = scale;
      }
      /// Set the type of this body. This may alter the mass and velocity.
      SetType(type) {
          if (this.m_world.IsLocked()) {
              throw new Error();
          }
          if (this.m_type === type) {
              return;
          }
          this.m_type = type;
          this.ResetMassData();
          if (this.m_type === exports.b2BodyType.b2_staticBody) {
              this.m_linearVelocity.SetZero();
              this.m_angularVelocity = 0;
              this.m_sweep.a0 = this.m_sweep.a;
              this.m_sweep.c0.Copy(this.m_sweep.c);
              this.m_awakeFlag = false;
              this.SynchronizeFixtures();
          }
          this.SetAwake(true);
          this.m_force.SetZero();
          this.m_torque = 0;
          // Delete the attached contacts.
          let ce = this.m_contactList;
          while (ce) {
              const ce0 = ce;
              ce = ce.next;
              this.m_world.m_contactManager.Destroy(ce0.contact);
          }
          this.m_contactList = null;
          // Touch the proxies so that new contacts will be created (when appropriate)
          for (let f = this.m_fixtureList; f; f = f.m_next) {
              f.TouchProxies();
          }
      }
      /// Get the type of this body.
      GetType() {
          return this.m_type;
      }
      /// Should this body be treated like a bullet for continuous collision detection?
      SetBullet(flag) {
          this.m_bulletFlag = flag;
      }
      /// Is this body treated like a bullet for continuous collision detection?
      IsBullet() {
          return this.m_bulletFlag;
      }
      /// You can disable sleeping on this body. If you disable sleeping, the
      /// body will be woken.
      SetSleepingAllowed(flag) {
          this.m_autoSleepFlag = flag;
          if (!flag) {
              this.SetAwake(true);
          }
      }
      /// Is this body allowed to sleep
      IsSleepingAllowed() {
          return this.m_autoSleepFlag;
      }
      /// Set the sleep state of the body. A sleeping body has very
      /// low CPU cost.
      /// @param flag set to true to wake the body, false to put it to sleep.
      SetAwake(flag) {
          if (this.m_type === exports.b2BodyType.b2_staticBody) {
              return;
          }
          if (flag) {
              this.m_awakeFlag = true;
              this.m_sleepTime = 0;
          }
          else {
              this.m_awakeFlag = false;
              this.m_sleepTime = 0;
              this.m_linearVelocity.SetZero();
              this.m_angularVelocity = 0;
              this.m_force.SetZero();
              this.m_torque = 0;
          }
      }
      /// Get the sleeping state of this body.
      /// @return true if the body is sleeping.
      IsAwake() {
          return this.m_awakeFlag;
      }
      /// Allow a body to be disabled. A disabled body is not simulated and cannot
      /// be collided with or woken up.
      /// If you pass a flag of true, all fixtures will be added to the broad-phase.
      /// If you pass a flag of false, all fixtures will be removed from the
      /// broad-phase and all contacts will be destroyed.
      /// Fixtures and joints are otherwise unaffected. You may continue
      /// to create/destroy fixtures and joints on disabled bodies.
      /// Fixtures on a disabled body are implicitly disabled and will
      /// not participate in collisions, ray-casts, or queries.
      /// Joints connected to a disabled body are implicitly disabled.
      /// An diabled body is still owned by a b2World object and remains
      /// in the body list.
      SetEnabled(flag) {
          if (this.m_world.IsLocked()) {
              throw new Error();
          }
          if (flag === this.IsEnabled()) {
              return;
          }
          this.m_enabledFlag = flag;
          if (flag) {
              // Create all proxies.
              for (let f = this.m_fixtureList; f; f = f.m_next) {
                  f.CreateProxies();
              }
              // Contacts are created at the beginning of the next
              this.m_world.m_newContacts = true;
          }
          else {
              // Destroy all proxies.
              for (let f = this.m_fixtureList; f; f = f.m_next) {
                  f.DestroyProxies();
              }
              // Destroy the attached contacts.
              let ce = this.m_contactList;
              while (ce) {
                  const ce0 = ce;
                  ce = ce.next;
                  this.m_world.m_contactManager.Destroy(ce0.contact);
              }
              this.m_contactList = null;
          }
      }
      /// Get the active state of the body.
      IsEnabled() {
          return this.m_enabledFlag;
      }
      /// Set this body to have fixed rotation. This causes the mass
      /// to be reset.
      SetFixedRotation(flag) {
          if (this.m_fixedRotationFlag === flag) {
              return;
          }
          this.m_fixedRotationFlag = flag;
          this.m_angularVelocity = 0;
          this.ResetMassData();
      }
      /// Does this body have fixed rotation?
      IsFixedRotation() {
          return this.m_fixedRotationFlag;
      }
      /// Get the list of all fixtures attached to this body.
      GetFixtureList() {
          return this.m_fixtureList;
      }
      /// Get the list of all joints attached to this body.
      GetJointList() {
          return this.m_jointList;
      }
      /// Get the list of all contacts attached to this body.
      /// @warning this list changes during the time step and you may
      /// miss some collisions if you don't use b2ContactListener.
      GetContactList() {
          return this.m_contactList;
      }
      /// Get the next body in the world's body list.
      GetNext() {
          return this.m_next;
      }
      /// Get the user data pointer that was provided in the body definition.
      GetUserData() {
          return this.m_userData;
      }
      /// Set the user data. Use this to store your application specific data.
      SetUserData(data) {
          this.m_userData = data;
      }
      /// Get the parent world of this body.
      GetWorld() {
          return this.m_world;
      }
      /// Dump this body to a file
      Dump(log) {
          const bodyIndex = this.m_islandIndex;
          log("{\n");
          log("  const bd: b2BodyDef = new b2BodyDef();\n");
          let type_str = "";
          switch (this.m_type) {
              case exports.b2BodyType.b2_staticBody:
                  type_str = "b2BodyType.b2_staticBody";
                  break;
              case exports.b2BodyType.b2_kinematicBody:
                  type_str = "b2BodyType.b2_kinematicBody";
                  break;
              case exports.b2BodyType.b2_dynamicBody:
                  type_str = "b2BodyType.b2_dynamicBody";
                  break;
          }
          log("  bd.type = %s;\n", type_str);
          log("  bd.position.Set(%.15f, %.15f);\n", this.m_xf.p.x, this.m_xf.p.y);
          log("  bd.angle = %.15f;\n", this.m_sweep.a);
          log("  bd.linearVelocity.Set(%.15f, %.15f);\n", this.m_linearVelocity.x, this.m_linearVelocity.y);
          log("  bd.angularVelocity = %.15f;\n", this.m_angularVelocity);
          log("  bd.linearDamping = %.15f;\n", this.m_linearDamping);
          log("  bd.angularDamping = %.15f;\n", this.m_angularDamping);
          log("  bd.allowSleep = %s;\n", (this.m_autoSleepFlag) ? ("true") : ("false"));
          log("  bd.awake = %s;\n", (this.m_awakeFlag) ? ("true") : ("false"));
          log("  bd.fixedRotation = %s;\n", (this.m_fixedRotationFlag) ? ("true") : ("false"));
          log("  bd.bullet = %s;\n", (this.m_bulletFlag) ? ("true") : ("false"));
          log("  bd.active = %s;\n", (this.m_enabledFlag) ? ("true") : ("false"));
          log("  bd.gravityScale = %.15f;\n", this.m_gravityScale);
          log("\n");
          log("  bodies[%d] = this.m_world.CreateBody(bd);\n", this.m_islandIndex);
          log("\n");
          for (let f = this.m_fixtureList; f; f = f.m_next) {
              log("  {\n");
              f.Dump(log, bodyIndex);
              log("  }\n");
          }
          log("}\n");
      }
      SynchronizeFixtures() {
          if (this.m_awakeFlag) {
              const xf1 = b2Body.SynchronizeFixtures_s_xf1;
              xf1.q.SetAngle(this.m_sweep.a0);
              b2Rot.MulRV(xf1.q, this.m_sweep.localCenter, xf1.p);
              b2Vec2.SubVV(this.m_sweep.c0, xf1.p, xf1.p);
              for (let f = this.m_fixtureList; f; f = f.m_next) {
                  f.SynchronizeProxies(xf1, this.m_xf);
              }
          }
          else {
              for (let f = this.m_fixtureList; f; f = f.m_next) {
                  f.SynchronizeProxies(this.m_xf, this.m_xf);
              }
          }
      }
      SynchronizeTransform() {
          this.m_xf.q.SetAngle(this.m_sweep.a);
          b2Rot.MulRV(this.m_xf.q, this.m_sweep.localCenter, this.m_xf.p);
          b2Vec2.SubVV(this.m_sweep.c, this.m_xf.p, this.m_xf.p);
      }
      // This is used to prevent connected bodies from colliding.
      // It may lie, depending on the collideConnected flag.
      ShouldCollide(other) {
          // At least one body should be dynamic or kinematic.
          if (this.m_type === exports.b2BodyType.b2_staticBody && other.m_type === exports.b2BodyType.b2_staticBody) {
              return false;
          }
          return this.ShouldCollideConnected(other);
      }
      ShouldCollideConnected(other) {
          // Does a joint prevent collision?
          for (let jn = this.m_jointList; jn; jn = jn.next) {
              if (jn.other === other) {
                  if (!jn.joint.m_collideConnected) {
                      return false;
                  }
              }
          }
          return true;
      }
      Advance(alpha) {
          // Advance to the new safe time. This doesn't sync the broad-phase.
          this.m_sweep.Advance(alpha);
          this.m_sweep.c.Copy(this.m_sweep.c0);
          this.m_sweep.a = this.m_sweep.a0;
          this.m_xf.q.SetAngle(this.m_sweep.a);
          b2Rot.MulRV(this.m_xf.q, this.m_sweep.localCenter, this.m_xf.p);
          b2Vec2.SubVV(this.m_sweep.c, this.m_xf.p, this.m_xf.p);
      }
  }
  /// Creates a fixture from a shape and attach it to this body.
  /// This is a convenience function. Use b2FixtureDef if you need to set parameters
  /// like friction, restitution, user data, or filtering.
  /// If the density is non-zero, this function automatically updates the mass of the body.
  /// @param shape the shape to be cloned.
  /// @param density the shape density (set to zero for static bodies).
  /// @warning This function is locked during callbacks.
  b2Body.CreateFixtureShapeDensity_s_def = new b2FixtureDef();
  /// Set the mass properties to override the mass properties of the fixtures.
  /// Note that this changes the center of mass position.
  /// Note that creating or destroying fixtures can also alter the mass.
  /// This function has no effect if the body isn't dynamic.
  /// @param massData the mass properties.
  b2Body.SetMassData_s_oldCenter = new b2Vec2();
  /// This resets the mass properties to the sum of the mass properties of the fixtures.
  /// This normally does not need to be called unless you called SetMassData to override
  /// the mass and you later want to reset the mass.
  b2Body.ResetMassData_s_localCenter = new b2Vec2();
  b2Body.ResetMassData_s_oldCenter = new b2Vec2();
  b2Body.ResetMassData_s_massData = new b2MassData();
  b2Body.SynchronizeFixtures_s_xf1 = new b2Transform();

  /*
  * Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  /// Friction mixing law. The idea is to allow either fixture to drive the friction to zero.
  /// For example, anything slides on ice.
  function b2MixFriction(friction1, friction2) {
      return b2Sqrt(friction1 * friction2);
  }
  /// Restitution mixing law. The idea is allow for anything to bounce off an inelastic surface.
  /// For example, a superball bounces on anything.
  function b2MixRestitution(restitution1, restitution2) {
      return restitution1 > restitution2 ? restitution1 : restitution2;
  }
  /// Restitution mixing law. This picks the lowest value.
  function b2MixRestitutionThreshold(threshold1, threshold2) {
      return threshold1 < threshold2 ? threshold1 : threshold2;
  }
  class b2ContactEdge {
      constructor(contact) {
          this._other = null; ///< provides quick access to the other body attached.
          this.prev = null; ///< the previous contact edge in the body's contact list
          this.next = null; ///< the next contact edge in the body's contact list
          this.contact = contact;
      }
      get other() {
          if (this._other === null) {
              throw new Error();
          }
          return this._other;
      }
      set other(value) {
          if (this._other !== null) {
              throw new Error();
          }
          this._other = value;
      }
      Reset() {
          this._other = null;
          this.prev = null;
          this.next = null;
      }
  }
  class b2Contact {
      constructor() {
          this.m_islandFlag = false; /// Used when crawling contact graph when forming islands.
          this.m_touchingFlag = false; /// Set when the shapes are touching.
          this.m_enabledFlag = false; /// This contact can be disabled (by user)
          this.m_filterFlag = false; /// This contact needs filtering because a fixture filter was changed.
          this.m_bulletHitFlag = false; /// This bullet contact had a TOI event
          this.m_toiFlag = false; /// This contact has a valid TOI in m_toi
          this.m_prev = null;
          this.m_next = null;
          this.m_nodeA = new b2ContactEdge(this);
          this.m_nodeB = new b2ContactEdge(this);
          this.m_indexA = 0;
          this.m_indexB = 0;
          this.m_manifold = new b2Manifold(); // TODO: readonly
          this.m_toiCount = 0;
          this.m_toi = 0;
          this.m_friction = 0;
          this.m_restitution = 0;
          this.m_restitutionThreshold = 0;
          this.m_tangentSpeed = 0;
          this.m_oldManifold = new b2Manifold(); // TODO: readonly
      }
      GetManifold() {
          return this.m_manifold;
      }
      GetWorldManifold(worldManifold) {
          const bodyA = this.m_fixtureA.GetBody();
          const bodyB = this.m_fixtureB.GetBody();
          const shapeA = this.GetShapeA();
          const shapeB = this.GetShapeB();
          worldManifold.Initialize(this.m_manifold, bodyA.GetTransform(), shapeA.m_radius, bodyB.GetTransform(), shapeB.m_radius);
      }
      IsTouching() {
          return this.m_touchingFlag;
      }
      SetEnabled(flag) {
          this.m_enabledFlag = flag;
      }
      IsEnabled() {
          return this.m_enabledFlag;
      }
      GetNext() {
          return this.m_next;
      }
      GetFixtureA() {
          return this.m_fixtureA;
      }
      GetChildIndexA() {
          return this.m_indexA;
      }
      GetShapeA() {
          return this.m_fixtureA.GetShape();
      }
      GetFixtureB() {
          return this.m_fixtureB;
      }
      GetChildIndexB() {
          return this.m_indexB;
      }
      GetShapeB() {
          return this.m_fixtureB.GetShape();
      }
      FlagForFiltering() {
          this.m_filterFlag = true;
      }
      SetFriction(friction) {
          this.m_friction = friction;
      }
      GetFriction() {
          return this.m_friction;
      }
      ResetFriction() {
          this.m_friction = b2MixFriction(this.m_fixtureA.m_friction, this.m_fixtureB.m_friction);
      }
      SetRestitution(restitution) {
          this.m_restitution = restitution;
      }
      GetRestitution() {
          return this.m_restitution;
      }
      ResetRestitution() {
          this.m_restitution = b2MixRestitution(this.m_fixtureA.m_restitution, this.m_fixtureB.m_restitution);
      }
      /// Override the default restitution velocity threshold mixture. You can call this in b2ContactListener::PreSolve.
      /// The value persists until you set or reset.
      SetRestitutionThreshold(threshold) {
          this.m_restitutionThreshold = threshold;
      }
      /// Get the restitution threshold.
      GetRestitutionThreshold() {
          return this.m_restitutionThreshold;
      }
      /// Reset the restitution threshold to the default value.
      ResetRestitutionThreshold() {
          this.m_restitutionThreshold = b2MixRestitutionThreshold(this.m_fixtureA.m_restitutionThreshold, this.m_fixtureB.m_restitutionThreshold);
      }
      SetTangentSpeed(speed) {
          this.m_tangentSpeed = speed;
      }
      GetTangentSpeed() {
          return this.m_tangentSpeed;
      }
      Reset(fixtureA, indexA, fixtureB, indexB) {
          this.m_islandFlag = false;
          this.m_touchingFlag = false;
          this.m_enabledFlag = true;
          this.m_filterFlag = false;
          this.m_bulletHitFlag = false;
          this.m_toiFlag = false;
          this.m_fixtureA = fixtureA;
          this.m_fixtureB = fixtureB;
          this.m_indexA = indexA;
          this.m_indexB = indexB;
          this.m_manifold.pointCount = 0;
          this.m_prev = null;
          this.m_next = null;
          this.m_nodeA.Reset();
          this.m_nodeB.Reset();
          this.m_toiCount = 0;
          this.m_friction = b2MixFriction(this.m_fixtureA.m_friction, this.m_fixtureB.m_friction);
          this.m_restitution = b2MixRestitution(this.m_fixtureA.m_restitution, this.m_fixtureB.m_restitution);
          this.m_restitutionThreshold = b2MixRestitutionThreshold(this.m_fixtureA.m_restitutionThreshold, this.m_fixtureB.m_restitutionThreshold);
      }
      Update(listener) {
          const tManifold = this.m_oldManifold;
          this.m_oldManifold = this.m_manifold;
          this.m_manifold = tManifold;
          // Re-enable this contact.
          this.m_enabledFlag = true;
          let touching = false;
          const wasTouching = this.m_touchingFlag;
          const sensorA = this.m_fixtureA.IsSensor();
          const sensorB = this.m_fixtureB.IsSensor();
          const sensor = sensorA || sensorB;
          const bodyA = this.m_fixtureA.GetBody();
          const bodyB = this.m_fixtureB.GetBody();
          const xfA = bodyA.GetTransform();
          const xfB = bodyB.GetTransform();
          // Is this contact a sensor?
          if (sensor) {
              const shapeA = this.GetShapeA();
              const shapeB = this.GetShapeB();
              touching = b2TestOverlapShape(shapeA, this.m_indexA, shapeB, this.m_indexB, xfA, xfB);
              // Sensors don't generate manifolds.
              this.m_manifold.pointCount = 0;
          }
          else {
              this.Evaluate(this.m_manifold, xfA, xfB);
              touching = this.m_manifold.pointCount > 0;
              // Match old contact ids to new contact ids and copy the
              // stored impulses to warm start the solver.
              for (let i = 0; i < this.m_manifold.pointCount; ++i) {
                  const mp2 = this.m_manifold.points[i];
                  mp2.normalImpulse = 0;
                  mp2.tangentImpulse = 0;
                  const id2 = mp2.id;
                  for (let j = 0; j < this.m_oldManifold.pointCount; ++j) {
                      const mp1 = this.m_oldManifold.points[j];
                      if (mp1.id.key === id2.key) {
                          mp2.normalImpulse = mp1.normalImpulse;
                          mp2.tangentImpulse = mp1.tangentImpulse;
                          break;
                      }
                  }
              }
              if (touching !== wasTouching) {
                  bodyA.SetAwake(true);
                  bodyB.SetAwake(true);
              }
          }
          this.m_touchingFlag = touching;
          if (!wasTouching && touching && listener) {
              listener.BeginContact(this);
          }
          if (wasTouching && !touching && listener) {
              listener.EndContact(this);
          }
          if (!sensor && touching && listener) {
              listener.PreSolve(this, this.m_oldManifold);
          }
      }
      ComputeTOI(sweepA, sweepB) {
          const input = b2Contact.ComputeTOI_s_input;
          input.proxyA.SetShape(this.GetShapeA(), this.m_indexA);
          input.proxyB.SetShape(this.GetShapeB(), this.m_indexB);
          input.sweepA.Copy(sweepA);
          input.sweepB.Copy(sweepB);
          input.tMax = b2_linearSlop;
          const output = b2Contact.ComputeTOI_s_output;
          b2TimeOfImpact(output, input);
          return output.t;
      }
  }
  b2Contact.ComputeTOI_s_input = new b2TOIInput();
  b2Contact.ComputeTOI_s_output = new b2TOIOutput();

  /*
  * Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  class b2ChainAndCircleContact extends b2Contact {
      static Create() {
          return new b2ChainAndCircleContact();
      }
      static Destroy(contact) {
      }
      Evaluate(manifold, xfA, xfB) {
          const edge = b2ChainAndCircleContact.Evaluate_s_edge;
          this.GetShapeA().GetChildEdge(edge, this.m_indexA);
          b2CollideEdgeAndCircle(manifold, edge, xfA, this.GetShapeB(), xfB);
      }
  }
  b2ChainAndCircleContact.Evaluate_s_edge = new b2EdgeShape();

  /*
  * Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  class b2ChainAndPolygonContact extends b2Contact {
      static Create() {
          return new b2ChainAndPolygonContact();
      }
      static Destroy(contact) {
      }
      Evaluate(manifold, xfA, xfB) {
          const edge = b2ChainAndPolygonContact.Evaluate_s_edge;
          this.GetShapeA().GetChildEdge(edge, this.m_indexA);
          b2CollideEdgeAndPolygon(manifold, edge, xfA, this.GetShapeB(), xfB);
      }
  }
  b2ChainAndPolygonContact.Evaluate_s_edge = new b2EdgeShape();

  /*
  * Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  class b2CircleContact extends b2Contact {
      static Create() {
          return new b2CircleContact();
      }
      static Destroy(contact) {
      }
      Evaluate(manifold, xfA, xfB) {
          b2CollideCircles(manifold, this.GetShapeA(), xfA, this.GetShapeB(), xfB);
      }
  }

  /*
  * Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  class b2PolygonContact extends b2Contact {
      static Create() {
          return new b2PolygonContact();
      }
      static Destroy(contact) {
      }
      Evaluate(manifold, xfA, xfB) {
          b2CollidePolygons(manifold, this.GetShapeA(), xfA, this.GetShapeB(), xfB);
      }
  }

  /*
  * Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  class b2PolygonAndCircleContact extends b2Contact {
      static Create() {
          return new b2PolygonAndCircleContact();
      }
      static Destroy(contact) {
      }
      Evaluate(manifold, xfA, xfB) {
          b2CollidePolygonAndCircle(manifold, this.GetShapeA(), xfA, this.GetShapeB(), xfB);
      }
  }

  /*
  * Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  class b2EdgeAndCircleContact extends b2Contact {
      static Create() {
          return new b2EdgeAndCircleContact();
      }
      static Destroy(contact) {
      }
      Evaluate(manifold, xfA, xfB) {
          b2CollideEdgeAndCircle(manifold, this.GetShapeA(), xfA, this.GetShapeB(), xfB);
      }
  }

  /*
  * Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  class b2EdgeAndPolygonContact extends b2Contact {
      static Create() {
          return new b2EdgeAndPolygonContact();
      }
      static Destroy(contact) {
      }
      Evaluate(manifold, xfA, xfB) {
          b2CollideEdgeAndPolygon(manifold, this.GetShapeA(), xfA, this.GetShapeB(), xfB);
      }
  }

  // DEBUG: import { b2Assert } from "../common/b2_settings.js";
  class b2ContactRegister {
      constructor() {
          this.pool = [];
          this.createFcn = null;
          this.destroyFcn = null;
          this.primary = false;
      }
  }
  class b2ContactFactory {
      constructor() {
          this.m_registers = [];
          this.InitializeRegisters();
      }
      AddType(createFcn, destroyFcn, typeA, typeB) {
          const pool = [];
          function poolCreateFcn() {
              return pool.pop() || createFcn();
          }
          function poolDestroyFcn(contact) {
              pool.push(contact);
          }
          this.m_registers[typeA][typeB].pool = pool;
          this.m_registers[typeA][typeB].createFcn = poolCreateFcn; // createFcn;
          this.m_registers[typeA][typeB].destroyFcn = poolDestroyFcn; // destroyFcn;
          this.m_registers[typeA][typeB].primary = true;
          if (typeA !== typeB) {
              this.m_registers[typeB][typeA].pool = pool;
              this.m_registers[typeB][typeA].createFcn = poolCreateFcn; // createFcn;
              this.m_registers[typeB][typeA].destroyFcn = poolDestroyFcn; // destroyFcn;
              this.m_registers[typeB][typeA].primary = false;
          }
      }
      InitializeRegisters() {
          for (let i = 0; i < exports.b2ShapeType.e_shapeTypeCount; i++) {
              this.m_registers[i] = [];
              for (let j = 0; j < exports.b2ShapeType.e_shapeTypeCount; j++) {
                  this.m_registers[i][j] = new b2ContactRegister();
              }
          }
          this.AddType(b2CircleContact.Create, b2CircleContact.Destroy, exports.b2ShapeType.e_circleShape, exports.b2ShapeType.e_circleShape);
          this.AddType(b2PolygonAndCircleContact.Create, b2PolygonAndCircleContact.Destroy, exports.b2ShapeType.e_polygonShape, exports.b2ShapeType.e_circleShape);
          this.AddType(b2PolygonContact.Create, b2PolygonContact.Destroy, exports.b2ShapeType.e_polygonShape, exports.b2ShapeType.e_polygonShape);
          this.AddType(b2EdgeAndCircleContact.Create, b2EdgeAndCircleContact.Destroy, exports.b2ShapeType.e_edgeShape, exports.b2ShapeType.e_circleShape);
          this.AddType(b2EdgeAndPolygonContact.Create, b2EdgeAndPolygonContact.Destroy, exports.b2ShapeType.e_edgeShape, exports.b2ShapeType.e_polygonShape);
          this.AddType(b2ChainAndCircleContact.Create, b2ChainAndCircleContact.Destroy, exports.b2ShapeType.e_chainShape, exports.b2ShapeType.e_circleShape);
          this.AddType(b2ChainAndPolygonContact.Create, b2ChainAndPolygonContact.Destroy, exports.b2ShapeType.e_chainShape, exports.b2ShapeType.e_polygonShape);
      }
      Create(fixtureA, indexA, fixtureB, indexB) {
          const typeA = fixtureA.GetType();
          const typeB = fixtureB.GetType();
          // DEBUG: b2Assert(0 <= typeA && typeA < b2ShapeType.e_shapeTypeCount);
          // DEBUG: b2Assert(0 <= typeB && typeB < b2ShapeType.e_shapeTypeCount);
          const reg = this.m_registers[typeA][typeB];
          if (reg.createFcn) {
              const c = reg.createFcn();
              if (reg.primary) {
                  c.Reset(fixtureA, indexA, fixtureB, indexB);
              }
              else {
                  c.Reset(fixtureB, indexB, fixtureA, indexA);
              }
              return c;
          }
          else {
              return null;
          }
      }
      Destroy(contact) {
          const typeA = contact.m_fixtureA.GetType();
          const typeB = contact.m_fixtureB.GetType();
          // DEBUG: b2Assert(0 <= typeA && typeB < b2ShapeType.e_shapeTypeCount);
          // DEBUG: b2Assert(0 <= typeA && typeB < b2ShapeType.e_shapeTypeCount);
          const reg = this.m_registers[typeA][typeB];
          if (reg.destroyFcn) {
              reg.destroyFcn(contact);
          }
      }
  }

  /*
  * Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  /// Joints and fixtures are destroyed when their associated
  /// body is destroyed. Implement this listener so that you
  /// may nullify references to these joints and shapes.
  class b2DestructionListener {
      /// Called when any joint is about to be destroyed due
      /// to the destruction of one of its attached bodies.
      SayGoodbyeJoint(joint) { }
      /// Called when any fixture is about to be destroyed due
      /// to the destruction of its parent body.
      SayGoodbyeFixture(fixture) { }
  }
  /// Implement this class to provide collision filtering. In other words, you can implement
  /// this class if you want finer control over contact creation.
  class b2ContactFilter {
      /// Return true if contact calculations should be performed between these two shapes.
      /// @warning for performance reasons this is only called when the AABBs begin to overlap.
      ShouldCollide(fixtureA, fixtureB) {
          const bodyA = fixtureA.GetBody();
          const bodyB = fixtureB.GetBody();
          // At least one body should be dynamic or kinematic.
          if (bodyB.GetType() === exports.b2BodyType.b2_staticBody && bodyA.GetType() === exports.b2BodyType.b2_staticBody) {
              return false;
          }
          // Does a joint prevent collision?
          if (!bodyB.ShouldCollideConnected(bodyA)) {
              return false;
          }
          const filter1 = fixtureA.GetFilterData();
          const filter2 = fixtureB.GetFilterData();
          if (filter1.groupIndex === filter2.groupIndex && filter1.groupIndex !== 0) {
              return (filter1.groupIndex > 0);
          }
          const collide = (((filter1.maskBits & filter2.categoryBits) !== 0) && ((filter1.categoryBits & filter2.maskBits) !== 0));
          return collide;
      }
  }
  b2ContactFilter.b2_defaultFilter = new b2ContactFilter();
  /// Contact impulses for reporting. Impulses are used instead of forces because
  /// sub-step forces may approach infinity for rigid body collisions. These
  /// match up one-to-one with the contact points in b2Manifold.
  class b2ContactImpulse {
      constructor() {
          this.normalImpulses = b2MakeNumberArray(b2_maxManifoldPoints);
          this.tangentImpulses = b2MakeNumberArray(b2_maxManifoldPoints);
          this.count = 0;
      }
  }
  /// Implement this class to get contact information. You can use these results for
  /// things like sounds and game logic. You can also get contact results by
  /// traversing the contact lists after the time step. However, you might miss
  /// some contacts because continuous physics leads to sub-stepping.
  /// Additionally you may receive multiple callbacks for the same contact in a
  /// single time step.
  /// You should strive to make your callbacks efficient because there may be
  /// many callbacks per time step.
  /// @warning You cannot create/destroy Box2D entities inside these callbacks.
  class b2ContactListener {
      /// Called when two fixtures begin to touch.
      BeginContact(contact) { }
      /// Called when two fixtures cease to touch.
      EndContact(contact) { }
      /// This is called after a contact is updated. This allows you to inspect a
      /// contact before it goes to the solver. If you are careful, you can modify the
      /// contact manifold (e.g. disable contact).
      /// A copy of the old manifold is provided so that you can detect changes.
      /// Note: this is called only for awake bodies.
      /// Note: this is called even when the number of contact points is zero.
      /// Note: this is not called for sensors.
      /// Note: if you set the number of contact points to zero, you will not
      /// get an EndContact callback. However, you may get a BeginContact callback
      /// the next step.
      PreSolve(contact, oldManifold) { }
      /// This lets you inspect a contact after the solver is finished. This is useful
      /// for inspecting impulses.
      /// Note: the contact manifold does not include time of impact impulses, which can be
      /// arbitrarily large if the sub-step is small. Hence the impulse is provided explicitly
      /// in a separate data structure.
      /// Note: this is only called for contacts that are touching, solid, and awake.
      PostSolve(contact, impulse) { }
  }
  b2ContactListener.b2_defaultListener = new b2ContactListener();
  /// Callback class for AABB queries.
  /// See b2World::Query
  class b2QueryCallback {
      /// Called for each fixture found in the query AABB.
      /// @return false to terminate the query.
      ReportFixture(fixture) {
          return true;
      }
  }
  /// Callback class for ray casts.
  /// See b2World::RayCast
  class b2RayCastCallback {
      /// Called for each fixture found in the query. You control how the ray cast
      /// proceeds by returning a float:
      /// return -1: ignore this fixture and continue
      /// return 0: terminate the ray cast
      /// return fraction: clip the ray to this point
      /// return 1: don't clip the ray and continue
      /// @param fixture the fixture hit by the ray
      /// @param point the point of initial intersection
      /// @param normal the normal vector at the point of intersection
      /// @return -1 to filter, 0 to terminate, fraction to clip the ray for
      /// closest hit, 1 to continue
      ReportFixture(fixture, point, normal, fraction) {
          return fraction;
      }
  }

  /*
  * Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  // Delegate of b2World.
  class b2ContactManager {
      constructor() {
          this.m_broadPhase = new b2BroadPhase();
          this.m_contactList = null;
          this.m_contactCount = 0;
          this.m_contactFilter = b2ContactFilter.b2_defaultFilter;
          this.m_contactListener = b2ContactListener.b2_defaultListener;
          this.m_contactFactory = new b2ContactFactory();
      }
      // Broad-phase callback.
      AddPair(proxyA, proxyB) {
          // DEBUG: b2Assert(proxyA instanceof b2FixtureProxy);
          // DEBUG: b2Assert(proxyB instanceof b2FixtureProxy);
          let fixtureA = proxyA.fixture;
          let fixtureB = proxyB.fixture;
          let indexA = proxyA.childIndex;
          let indexB = proxyB.childIndex;
          let bodyA = fixtureA.GetBody();
          let bodyB = fixtureB.GetBody();
          // Are the fixtures on the same body?
          if (bodyA === bodyB) {
              return;
          }
          // TODO_ERIN use a hash table to remove a potential bottleneck when both
          // bodies have a lot of contacts.
          // Does a contact already exist?
          let edge = bodyB.GetContactList();
          while (edge) {
              if (edge.other === bodyA) {
                  const fA = edge.contact.GetFixtureA();
                  const fB = edge.contact.GetFixtureB();
                  const iA = edge.contact.GetChildIndexA();
                  const iB = edge.contact.GetChildIndexB();
                  if (fA === fixtureA && fB === fixtureB && iA === indexA && iB === indexB) {
                      // A contact already exists.
                      return;
                  }
                  if (fA === fixtureB && fB === fixtureA && iA === indexB && iB === indexA) {
                      // A contact already exists.
                      return;
                  }
              }
              edge = edge.next;
          }
          // Check user filtering.
          if (this.m_contactFilter && !this.m_contactFilter.ShouldCollide(fixtureA, fixtureB)) {
              return;
          }
          // Call the factory.
          const c = this.m_contactFactory.Create(fixtureA, indexA, fixtureB, indexB);
          if (c === null) {
              return;
          }
          // Contact creation may swap fixtures.
          fixtureA = c.GetFixtureA();
          fixtureB = c.GetFixtureB();
          indexA = c.GetChildIndexA();
          indexB = c.GetChildIndexB();
          bodyA = fixtureA.m_body;
          bodyB = fixtureB.m_body;
          // Insert into the world.
          c.m_prev = null;
          c.m_next = this.m_contactList;
          if (this.m_contactList !== null) {
              this.m_contactList.m_prev = c;
          }
          this.m_contactList = c;
          // Connect to island graph.
          // Connect to body A
          c.m_nodeA.other = bodyB;
          c.m_nodeA.prev = null;
          c.m_nodeA.next = bodyA.m_contactList;
          if (bodyA.m_contactList !== null) {
              bodyA.m_contactList.prev = c.m_nodeA;
          }
          bodyA.m_contactList = c.m_nodeA;
          // Connect to body B
          c.m_nodeB.other = bodyA;
          c.m_nodeB.prev = null;
          c.m_nodeB.next = bodyB.m_contactList;
          if (bodyB.m_contactList !== null) {
              bodyB.m_contactList.prev = c.m_nodeB;
          }
          bodyB.m_contactList = c.m_nodeB;
          ++this.m_contactCount;
      }
      FindNewContacts() {
          this.m_broadPhase.UpdatePairs((proxyA, proxyB) => {
              this.AddPair(proxyA, proxyB);
          });
      }
      Destroy(c) {
          const fixtureA = c.GetFixtureA();
          const fixtureB = c.GetFixtureB();
          const bodyA = fixtureA.GetBody();
          const bodyB = fixtureB.GetBody();
          if (this.m_contactListener && c.IsTouching()) {
              this.m_contactListener.EndContact(c);
          }
          // Remove from the world.
          if (c.m_prev) {
              c.m_prev.m_next = c.m_next;
          }
          if (c.m_next) {
              c.m_next.m_prev = c.m_prev;
          }
          if (c === this.m_contactList) {
              this.m_contactList = c.m_next;
          }
          // Remove from body 1
          if (c.m_nodeA.prev) {
              c.m_nodeA.prev.next = c.m_nodeA.next;
          }
          if (c.m_nodeA.next) {
              c.m_nodeA.next.prev = c.m_nodeA.prev;
          }
          if (c.m_nodeA === bodyA.m_contactList) {
              bodyA.m_contactList = c.m_nodeA.next;
          }
          // Remove from body 2
          if (c.m_nodeB.prev) {
              c.m_nodeB.prev.next = c.m_nodeB.next;
          }
          if (c.m_nodeB.next) {
              c.m_nodeB.next.prev = c.m_nodeB.prev;
          }
          if (c.m_nodeB === bodyB.m_contactList) {
              bodyB.m_contactList = c.m_nodeB.next;
          }
          // moved this from b2ContactFactory:Destroy
          if (c.m_manifold.pointCount > 0 &&
              !fixtureA.IsSensor() &&
              !fixtureB.IsSensor()) {
              fixtureA.GetBody().SetAwake(true);
              fixtureB.GetBody().SetAwake(true);
          }
          // Call the factory.
          this.m_contactFactory.Destroy(c);
          --this.m_contactCount;
      }
      // This is the top level collision call for the time step. Here
      // all the narrow phase collision is processed for the world
      // contact list.
      Collide() {
          // Update awake contacts.
          let c = this.m_contactList;
          while (c) {
              const fixtureA = c.GetFixtureA();
              const fixtureB = c.GetFixtureB();
              const indexA = c.GetChildIndexA();
              const indexB = c.GetChildIndexB();
              const bodyA = fixtureA.GetBody();
              const bodyB = fixtureB.GetBody();
              // Is this contact flagged for filtering?
              if (c.m_filterFlag) {
                  // Check user filtering.
                  if (this.m_contactFilter && !this.m_contactFilter.ShouldCollide(fixtureA, fixtureB)) {
                      const cNuke = c;
                      c = cNuke.m_next;
                      this.Destroy(cNuke);
                      continue;
                  }
                  // Clear the filtering flag.
                  c.m_filterFlag = false;
              }
              const activeA = bodyA.IsAwake() && bodyA.m_type !== exports.b2BodyType.b2_staticBody;
              const activeB = bodyB.IsAwake() && bodyB.m_type !== exports.b2BodyType.b2_staticBody;
              // At least one body must be awake and it must be dynamic or kinematic.
              if (!activeA && !activeB) {
                  c = c.m_next;
                  continue;
              }
              const treeNodeA = fixtureA.m_proxies[indexA].treeNode;
              const treeNodeB = fixtureB.m_proxies[indexB].treeNode;
              const overlap = b2TestOverlapAABB(treeNodeA.aabb, treeNodeB.aabb);
              // Here we destroy contacts that cease to overlap in the broad-phase.
              if (!overlap) {
                  const cNuke = c;
                  c = cNuke.m_next;
                  this.Destroy(cNuke);
                  continue;
              }
              // The contact persists.
              c.Update(this.m_contactListener);
              c = c.m_next;
          }
      }
  }

  /*
  * Copyright (c) 2006-2011 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  /// Profiling data. Times are in milliseconds.
  class b2Profile {
      constructor() {
          this.step = 0;
          this.collide = 0;
          this.solve = 0;
          this.solveInit = 0;
          this.solveVelocity = 0;
          this.solvePosition = 0;
          this.broadphase = 0;
          this.solveTOI = 0;
      }
      Reset() {
          this.step = 0;
          this.collide = 0;
          this.solve = 0;
          this.solveInit = 0;
          this.solveVelocity = 0;
          this.solvePosition = 0;
          this.broadphase = 0;
          this.solveTOI = 0;
          return this;
      }
  }
  /// This is an internal structure.
  class b2TimeStep {
      constructor() {
          this.dt = 0; // time step
          this.inv_dt = 0; // inverse time step (0 if dt == 0).
          this.dtRatio = 0; // dt * inv_dt0
          this.velocityIterations = 0;
          this.positionIterations = 0;
          this.warmStarting = false;
      }
      Copy(step) {
          this.dt = step.dt;
          this.inv_dt = step.inv_dt;
          this.dtRatio = step.dtRatio;
          this.positionIterations = step.positionIterations;
          this.velocityIterations = step.velocityIterations;
          this.warmStarting = step.warmStarting;
          return this;
      }
  }
  class b2Position {
      constructor() {
          this.c = new b2Vec2();
          this.a = 0;
      }
      static MakeArray(length) {
          return b2MakeArray(length, (i) => new b2Position());
      }
  }
  class b2Velocity {
      constructor() {
          this.v = new b2Vec2();
          this.w = 0;
      }
      static MakeArray(length) {
          return b2MakeArray(length, (i) => new b2Velocity());
      }
  }
  class b2SolverData {
      constructor() {
          this.step = new b2TimeStep();
      }
  }

  /*
  * Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  // Solver debugging is normally disabled because the block solver sometimes has to deal with a poorly conditioned effective mass matrix.
  // #define B2_DEBUG_SOLVER 0
  exports.g_blockSolve = true;
  function get_g_blockSolve() { return exports.g_blockSolve; }
  function set_g_blockSolve(value) { exports.g_blockSolve = value; }
  class b2VelocityConstraintPoint {
      constructor() {
          this.rA = new b2Vec2();
          this.rB = new b2Vec2();
          this.normalImpulse = 0;
          this.tangentImpulse = 0;
          this.normalMass = 0;
          this.tangentMass = 0;
          this.velocityBias = 0;
      }
      static MakeArray(length) {
          return b2MakeArray(length, (i) => new b2VelocityConstraintPoint());
      }
  }
  class b2ContactVelocityConstraint {
      constructor() {
          this.points = b2VelocityConstraintPoint.MakeArray(b2_maxManifoldPoints);
          this.normal = new b2Vec2();
          this.tangent = new b2Vec2();
          this.normalMass = new b2Mat22();
          this.K = new b2Mat22();
          this.indexA = 0;
          this.indexB = 0;
          this.invMassA = 0;
          this.invMassB = 0;
          this.invIA = 0;
          this.invIB = 0;
          this.friction = 0;
          this.restitution = 0;
          this.threshold = 0;
          this.tangentSpeed = 0;
          this.pointCount = 0;
          this.contactIndex = 0;
      }
      static MakeArray(length) {
          return b2MakeArray(length, (i) => new b2ContactVelocityConstraint());
      }
  }
  class b2ContactPositionConstraint {
      constructor() {
          this.localPoints = b2Vec2.MakeArray(b2_maxManifoldPoints);
          this.localNormal = new b2Vec2();
          this.localPoint = new b2Vec2();
          this.indexA = 0;
          this.indexB = 0;
          this.invMassA = 0;
          this.invMassB = 0;
          this.localCenterA = new b2Vec2();
          this.localCenterB = new b2Vec2();
          this.invIA = 0;
          this.invIB = 0;
          this.type = exports.b2ManifoldType.e_unknown;
          this.radiusA = 0;
          this.radiusB = 0;
          this.pointCount = 0;
      }
      static MakeArray(length) {
          return b2MakeArray(length, (i) => new b2ContactPositionConstraint());
      }
  }
  class b2ContactSolverDef {
      constructor() {
          this.step = new b2TimeStep();
          this.count = 0;
      }
  }
  class b2PositionSolverManifold {
      constructor() {
          this.normal = new b2Vec2();
          this.point = new b2Vec2();
          this.separation = 0;
      }
      Initialize(pc, xfA, xfB, index) {
          const pointA = b2PositionSolverManifold.Initialize_s_pointA;
          const pointB = b2PositionSolverManifold.Initialize_s_pointB;
          const planePoint = b2PositionSolverManifold.Initialize_s_planePoint;
          const clipPoint = b2PositionSolverManifold.Initialize_s_clipPoint;
          // DEBUG: b2Assert(pc.pointCount > 0);
          switch (pc.type) {
              case exports.b2ManifoldType.e_circles: {
                  // b2Vec2 pointA = b2Mul(xfA, pc->localPoint);
                  b2Transform.MulXV(xfA, pc.localPoint, pointA);
                  // b2Vec2 pointB = b2Mul(xfB, pc->localPoints[0]);
                  b2Transform.MulXV(xfB, pc.localPoints[0], pointB);
                  // normal = pointB - pointA;
                  // normal.Normalize();
                  b2Vec2.SubVV(pointB, pointA, this.normal).SelfNormalize();
                  // point = 0.5f * (pointA + pointB);
                  b2Vec2.MidVV(pointA, pointB, this.point);
                  // separation = b2Dot(pointB - pointA, normal) - pc->radius;
                  this.separation = b2Vec2.DotVV(b2Vec2.SubVV(pointB, pointA, b2Vec2.s_t0), this.normal) - pc.radiusA - pc.radiusB;
                  break;
              }
              case exports.b2ManifoldType.e_faceA: {
                  // normal = b2Mul(xfA.q, pc->localNormal);
                  b2Rot.MulRV(xfA.q, pc.localNormal, this.normal);
                  // b2Vec2 planePoint = b2Mul(xfA, pc->localPoint);
                  b2Transform.MulXV(xfA, pc.localPoint, planePoint);
                  // b2Vec2 clipPoint = b2Mul(xfB, pc->localPoints[index]);
                  b2Transform.MulXV(xfB, pc.localPoints[index], clipPoint);
                  // separation = b2Dot(clipPoint - planePoint, normal) - pc->radius;
                  this.separation = b2Vec2.DotVV(b2Vec2.SubVV(clipPoint, planePoint, b2Vec2.s_t0), this.normal) - pc.radiusA - pc.radiusB;
                  // point = clipPoint;
                  this.point.Copy(clipPoint);
                  break;
              }
              case exports.b2ManifoldType.e_faceB: {
                  // normal = b2Mul(xfB.q, pc->localNormal);
                  b2Rot.MulRV(xfB.q, pc.localNormal, this.normal);
                  // b2Vec2 planePoint = b2Mul(xfB, pc->localPoint);
                  b2Transform.MulXV(xfB, pc.localPoint, planePoint);
                  // b2Vec2 clipPoint = b2Mul(xfA, pc->localPoints[index]);
                  b2Transform.MulXV(xfA, pc.localPoints[index], clipPoint);
                  // separation = b2Dot(clipPoint - planePoint, normal) - pc->radius;
                  this.separation = b2Vec2.DotVV(b2Vec2.SubVV(clipPoint, planePoint, b2Vec2.s_t0), this.normal) - pc.radiusA - pc.radiusB;
                  // point = clipPoint;
                  this.point.Copy(clipPoint);
                  // Ensure normal points from A to B
                  // normal = -normal;
                  this.normal.SelfNeg();
                  break;
              }
          }
      }
  }
  b2PositionSolverManifold.Initialize_s_pointA = new b2Vec2();
  b2PositionSolverManifold.Initialize_s_pointB = new b2Vec2();
  b2PositionSolverManifold.Initialize_s_planePoint = new b2Vec2();
  b2PositionSolverManifold.Initialize_s_clipPoint = new b2Vec2();
  class b2ContactSolver {
      constructor() {
          this.m_step = new b2TimeStep();
          this.m_positionConstraints = b2ContactPositionConstraint.MakeArray(1024); // TODO: b2Settings
          this.m_velocityConstraints = b2ContactVelocityConstraint.MakeArray(1024); // TODO: b2Settings
          this.m_count = 0;
      }
      Initialize(def) {
          this.m_step.Copy(def.step);
          this.m_count = def.count;
          // TODO:
          if (this.m_positionConstraints.length < this.m_count) {
              const new_length = b2Max(this.m_positionConstraints.length * 2, this.m_count);
              while (this.m_positionConstraints.length < new_length) {
                  this.m_positionConstraints[this.m_positionConstraints.length] = new b2ContactPositionConstraint();
              }
          }
          // TODO:
          if (this.m_velocityConstraints.length < this.m_count) {
              const new_length = b2Max(this.m_velocityConstraints.length * 2, this.m_count);
              while (this.m_velocityConstraints.length < new_length) {
                  this.m_velocityConstraints[this.m_velocityConstraints.length] = new b2ContactVelocityConstraint();
              }
          }
          this.m_positions = def.positions;
          this.m_velocities = def.velocities;
          this.m_contacts = def.contacts;
          // Initialize position independent portions of the constraints.
          for (let i = 0; i < this.m_count; ++i) {
              const contact = this.m_contacts[i];
              const fixtureA = contact.m_fixtureA;
              const fixtureB = contact.m_fixtureB;
              const shapeA = fixtureA.GetShape();
              const shapeB = fixtureB.GetShape();
              const radiusA = shapeA.m_radius;
              const radiusB = shapeB.m_radius;
              const bodyA = fixtureA.GetBody();
              const bodyB = fixtureB.GetBody();
              const manifold = contact.GetManifold();
              const pointCount = manifold.pointCount;
              // DEBUG: b2Assert(pointCount > 0);
              const vc = this.m_velocityConstraints[i];
              vc.friction = contact.m_friction;
              vc.restitution = contact.m_restitution;
              vc.threshold = contact.m_restitutionThreshold;
              vc.tangentSpeed = contact.m_tangentSpeed;
              vc.indexA = bodyA.m_islandIndex;
              vc.indexB = bodyB.m_islandIndex;
              vc.invMassA = bodyA.m_invMass;
              vc.invMassB = bodyB.m_invMass;
              vc.invIA = bodyA.m_invI;
              vc.invIB = bodyB.m_invI;
              vc.contactIndex = i;
              vc.pointCount = pointCount;
              vc.K.SetZero();
              vc.normalMass.SetZero();
              const pc = this.m_positionConstraints[i];
              pc.indexA = bodyA.m_islandIndex;
              pc.indexB = bodyB.m_islandIndex;
              pc.invMassA = bodyA.m_invMass;
              pc.invMassB = bodyB.m_invMass;
              pc.localCenterA.Copy(bodyA.m_sweep.localCenter);
              pc.localCenterB.Copy(bodyB.m_sweep.localCenter);
              pc.invIA = bodyA.m_invI;
              pc.invIB = bodyB.m_invI;
              pc.localNormal.Copy(manifold.localNormal);
              pc.localPoint.Copy(manifold.localPoint);
              pc.pointCount = pointCount;
              pc.radiusA = radiusA;
              pc.radiusB = radiusB;
              pc.type = manifold.type;
              for (let j = 0; j < pointCount; ++j) {
                  const cp = manifold.points[j];
                  const vcp = vc.points[j];
                  if (this.m_step.warmStarting) {
                      vcp.normalImpulse = this.m_step.dtRatio * cp.normalImpulse;
                      vcp.tangentImpulse = this.m_step.dtRatio * cp.tangentImpulse;
                  }
                  else {
                      vcp.normalImpulse = 0;
                      vcp.tangentImpulse = 0;
                  }
                  vcp.rA.SetZero();
                  vcp.rB.SetZero();
                  vcp.normalMass = 0;
                  vcp.tangentMass = 0;
                  vcp.velocityBias = 0;
                  pc.localPoints[j].Copy(cp.localPoint);
              }
          }
          return this;
      }
      InitializeVelocityConstraints() {
          const xfA = b2ContactSolver.InitializeVelocityConstraints_s_xfA;
          const xfB = b2ContactSolver.InitializeVelocityConstraints_s_xfB;
          const worldManifold = b2ContactSolver.InitializeVelocityConstraints_s_worldManifold;
          const k_maxConditionNumber = 1000;
          for (let i = 0; i < this.m_count; ++i) {
              const vc = this.m_velocityConstraints[i];
              const pc = this.m_positionConstraints[i];
              const radiusA = pc.radiusA;
              const radiusB = pc.radiusB;
              const manifold = this.m_contacts[vc.contactIndex].GetManifold();
              const indexA = vc.indexA;
              const indexB = vc.indexB;
              const mA = vc.invMassA;
              const mB = vc.invMassB;
              const iA = vc.invIA;
              const iB = vc.invIB;
              const localCenterA = pc.localCenterA;
              const localCenterB = pc.localCenterB;
              const cA = this.m_positions[indexA].c;
              const aA = this.m_positions[indexA].a;
              const vA = this.m_velocities[indexA].v;
              const wA = this.m_velocities[indexA].w;
              const cB = this.m_positions[indexB].c;
              const aB = this.m_positions[indexB].a;
              const vB = this.m_velocities[indexB].v;
              const wB = this.m_velocities[indexB].w;
              // DEBUG: b2Assert(manifold.pointCount > 0);
              xfA.q.SetAngle(aA);
              xfB.q.SetAngle(aB);
              b2Vec2.SubVV(cA, b2Rot.MulRV(xfA.q, localCenterA, b2Vec2.s_t0), xfA.p);
              b2Vec2.SubVV(cB, b2Rot.MulRV(xfB.q, localCenterB, b2Vec2.s_t0), xfB.p);
              worldManifold.Initialize(manifold, xfA, radiusA, xfB, radiusB);
              vc.normal.Copy(worldManifold.normal);
              b2Vec2.CrossVOne(vc.normal, vc.tangent); // compute from normal
              const pointCount = vc.pointCount;
              for (let j = 0; j < pointCount; ++j) {
                  const vcp = vc.points[j];
                  // vcp->rA = worldManifold.points[j] - cA;
                  b2Vec2.SubVV(worldManifold.points[j], cA, vcp.rA);
                  // vcp->rB = worldManifold.points[j] - cB;
                  b2Vec2.SubVV(worldManifold.points[j], cB, vcp.rB);
                  const rnA = b2Vec2.CrossVV(vcp.rA, vc.normal);
                  const rnB = b2Vec2.CrossVV(vcp.rB, vc.normal);
                  const kNormal = mA + mB + iA * rnA * rnA + iB * rnB * rnB;
                  vcp.normalMass = kNormal > 0 ? 1 / kNormal : 0;
                  // b2Vec2 tangent = b2Cross(vc->normal, 1.0f);
                  const tangent = vc.tangent; // precomputed from normal
                  const rtA = b2Vec2.CrossVV(vcp.rA, tangent);
                  const rtB = b2Vec2.CrossVV(vcp.rB, tangent);
                  const kTangent = mA + mB + iA * rtA * rtA + iB * rtB * rtB;
                  vcp.tangentMass = kTangent > 0 ? 1 / kTangent : 0;
                  // Setup a velocity bias for restitution.
                  vcp.velocityBias = 0;
                  // float32 vRel = b2Dot(vc->normal, vB + b2Cross(wB, vcp->rB) - vA - b2Cross(wA, vcp->rA));
                  const vRel = b2Vec2.DotVV(vc.normal, b2Vec2.SubVV(b2Vec2.AddVCrossSV(vB, wB, vcp.rB, b2Vec2.s_t0), b2Vec2.AddVCrossSV(vA, wA, vcp.rA, b2Vec2.s_t1), b2Vec2.s_t0));
                  if (vRel < -vc.threshold) {
                      vcp.velocityBias += (-vc.restitution * vRel);
                  }
              }
              // If we have two points, then prepare the block solver.
              if (vc.pointCount === 2 && exports.g_blockSolve) {
                  const vcp1 = vc.points[0];
                  const vcp2 = vc.points[1];
                  const rn1A = b2Vec2.CrossVV(vcp1.rA, vc.normal);
                  const rn1B = b2Vec2.CrossVV(vcp1.rB, vc.normal);
                  const rn2A = b2Vec2.CrossVV(vcp2.rA, vc.normal);
                  const rn2B = b2Vec2.CrossVV(vcp2.rB, vc.normal);
                  const k11 = mA + mB + iA * rn1A * rn1A + iB * rn1B * rn1B;
                  const k22 = mA + mB + iA * rn2A * rn2A + iB * rn2B * rn2B;
                  const k12 = mA + mB + iA * rn1A * rn2A + iB * rn1B * rn2B;
                  // Ensure a reasonable condition number.
                  // float32 k_maxConditionNumber = 1000.0f;
                  if (k11 * k11 < k_maxConditionNumber * (k11 * k22 - k12 * k12)) {
                      // K is safe to invert.
                      vc.K.ex.Set(k11, k12);
                      vc.K.ey.Set(k12, k22);
                      vc.K.GetInverse(vc.normalMass);
                  }
                  else {
                      // The constraints are redundant, just use one.
                      // TODO_ERIN use deepest?
                      vc.pointCount = 1;
                  }
              }
          }
      }
      WarmStart() {
          const P = b2ContactSolver.WarmStart_s_P;
          // Warm start.
          for (let i = 0; i < this.m_count; ++i) {
              const vc = this.m_velocityConstraints[i];
              const indexA = vc.indexA;
              const indexB = vc.indexB;
              const mA = vc.invMassA;
              const iA = vc.invIA;
              const mB = vc.invMassB;
              const iB = vc.invIB;
              const pointCount = vc.pointCount;
              const vA = this.m_velocities[indexA].v;
              let wA = this.m_velocities[indexA].w;
              const vB = this.m_velocities[indexB].v;
              let wB = this.m_velocities[indexB].w;
              const normal = vc.normal;
              // b2Vec2 tangent = b2Cross(normal, 1.0f);
              const tangent = vc.tangent; // precomputed from normal
              for (let j = 0; j < pointCount; ++j) {
                  const vcp = vc.points[j];
                  // b2Vec2 P = vcp->normalImpulse * normal + vcp->tangentImpulse * tangent;
                  b2Vec2.AddVV(b2Vec2.MulSV(vcp.normalImpulse, normal, b2Vec2.s_t0), b2Vec2.MulSV(vcp.tangentImpulse, tangent, b2Vec2.s_t1), P);
                  // wA -= iA * b2Cross(vcp->rA, P);
                  wA -= iA * b2Vec2.CrossVV(vcp.rA, P);
                  // vA -= mA * P;
                  vA.SelfMulSub(mA, P);
                  // wB += iB * b2Cross(vcp->rB, P);
                  wB += iB * b2Vec2.CrossVV(vcp.rB, P);
                  // vB += mB * P;
                  vB.SelfMulAdd(mB, P);
              }
              // this.m_velocities[indexA].v = vA;
              this.m_velocities[indexA].w = wA;
              // this.m_velocities[indexB].v = vB;
              this.m_velocities[indexB].w = wB;
          }
      }
      SolveVelocityConstraints() {
          const dv = b2ContactSolver.SolveVelocityConstraints_s_dv;
          const dv1 = b2ContactSolver.SolveVelocityConstraints_s_dv1;
          const dv2 = b2ContactSolver.SolveVelocityConstraints_s_dv2;
          const P = b2ContactSolver.SolveVelocityConstraints_s_P;
          const a = b2ContactSolver.SolveVelocityConstraints_s_a;
          const b = b2ContactSolver.SolveVelocityConstraints_s_b;
          const x = b2ContactSolver.SolveVelocityConstraints_s_x;
          const d = b2ContactSolver.SolveVelocityConstraints_s_d;
          const P1 = b2ContactSolver.SolveVelocityConstraints_s_P1;
          const P2 = b2ContactSolver.SolveVelocityConstraints_s_P2;
          const P1P2 = b2ContactSolver.SolveVelocityConstraints_s_P1P2;
          for (let i = 0; i < this.m_count; ++i) {
              const vc = this.m_velocityConstraints[i];
              const indexA = vc.indexA;
              const indexB = vc.indexB;
              const mA = vc.invMassA;
              const iA = vc.invIA;
              const mB = vc.invMassB;
              const iB = vc.invIB;
              const pointCount = vc.pointCount;
              const vA = this.m_velocities[indexA].v;
              let wA = this.m_velocities[indexA].w;
              const vB = this.m_velocities[indexB].v;
              let wB = this.m_velocities[indexB].w;
              // b2Vec2 normal = vc->normal;
              const normal = vc.normal;
              // b2Vec2 tangent = b2Cross(normal, 1.0f);
              const tangent = vc.tangent; // precomputed from normal
              const friction = vc.friction;
              // DEBUG: b2Assert(pointCount === 1 || pointCount === 2);
              // Solve tangent constraints first because non-penetration is more important
              // than friction.
              for (let j = 0; j < pointCount; ++j) {
                  const vcp = vc.points[j];
                  // Relative velocity at contact
                  // b2Vec2 dv = vB + b2Cross(wB, vcp->rB) - vA - b2Cross(wA, vcp->rA);
                  b2Vec2.SubVV(b2Vec2.AddVCrossSV(vB, wB, vcp.rB, b2Vec2.s_t0), b2Vec2.AddVCrossSV(vA, wA, vcp.rA, b2Vec2.s_t1), dv);
                  // Compute tangent force
                  // float32 vt = b2Dot(dv, tangent) - vc->tangentSpeed;
                  const vt = b2Vec2.DotVV(dv, tangent) - vc.tangentSpeed;
                  let lambda = vcp.tangentMass * (-vt);
                  // b2Clamp the accumulated force
                  const maxFriction = friction * vcp.normalImpulse;
                  const newImpulse = b2Clamp(vcp.tangentImpulse + lambda, (-maxFriction), maxFriction);
                  lambda = newImpulse - vcp.tangentImpulse;
                  vcp.tangentImpulse = newImpulse;
                  // Apply contact impulse
                  // b2Vec2 P = lambda * tangent;
                  b2Vec2.MulSV(lambda, tangent, P);
                  // vA -= mA * P;
                  vA.SelfMulSub(mA, P);
                  // wA -= iA * b2Cross(vcp->rA, P);
                  wA -= iA * b2Vec2.CrossVV(vcp.rA, P);
                  // vB += mB * P;
                  vB.SelfMulAdd(mB, P);
                  // wB += iB * b2Cross(vcp->rB, P);
                  wB += iB * b2Vec2.CrossVV(vcp.rB, P);
              }
              // Solve normal constraints
              if (vc.pointCount === 1 || exports.g_blockSolve === false) {
                  for (let j = 0; j < pointCount; ++j) {
                      const vcp = vc.points[j];
                      // Relative velocity at contact
                      // b2Vec2 dv = vB + b2Cross(wB, vcp->rB) - vA - b2Cross(wA, vcp->rA);
                      b2Vec2.SubVV(b2Vec2.AddVCrossSV(vB, wB, vcp.rB, b2Vec2.s_t0), b2Vec2.AddVCrossSV(vA, wA, vcp.rA, b2Vec2.s_t1), dv);
                      // Compute normal impulse
                      // float32 vn = b2Dot(dv, normal);
                      const vn = b2Vec2.DotVV(dv, normal);
                      let lambda = (-vcp.normalMass * (vn - vcp.velocityBias));
                      // b2Clamp the accumulated impulse
                      // float32 newImpulse = b2Max(vcp->normalImpulse + lambda, 0.0f);
                      const newImpulse = b2Max(vcp.normalImpulse + lambda, 0);
                      lambda = newImpulse - vcp.normalImpulse;
                      vcp.normalImpulse = newImpulse;
                      // Apply contact impulse
                      // b2Vec2 P = lambda * normal;
                      b2Vec2.MulSV(lambda, normal, P);
                      // vA -= mA * P;
                      vA.SelfMulSub(mA, P);
                      // wA -= iA * b2Cross(vcp->rA, P);
                      wA -= iA * b2Vec2.CrossVV(vcp.rA, P);
                      // vB += mB * P;
                      vB.SelfMulAdd(mB, P);
                      // wB += iB * b2Cross(vcp->rB, P);
                      wB += iB * b2Vec2.CrossVV(vcp.rB, P);
                  }
              }
              else {
                  // Block solver developed in collaboration with Dirk Gregorius (back in 01/07 on Box2D_Lite).
                  // Build the mini LCP for this contact patch
                  //
                  // vn = A * x + b, vn >= 0, x >= 0 and vn_i * x_i = 0 with i = 1..2
                  //
                  // A = J * W * JT and J = ( -n, -r1 x n, n, r2 x n )
                  // b = vn0 - velocityBias
                  //
                  // The system is solved using the "Total enumeration method" (s. Murty). The complementary constraint vn_i * x_i
                  // implies that we must have in any solution either vn_i = 0 or x_i = 0. So for the 2D contact problem the cases
                  // vn1 = 0 and vn2 = 0, x1 = 0 and x2 = 0, x1 = 0 and vn2 = 0, x2 = 0 and vn1 = 0 need to be tested. The first valid
                  // solution that satisfies the problem is chosen.
                  //
                  // In order to account of the accumulated impulse 'a' (because of the iterative nature of the solver which only requires
                  // that the accumulated impulse is clamped and not the incremental impulse) we change the impulse variable (x_i).
                  //
                  // Substitute:
                  //
                  // x = a + d
                  //
                  // a := old total impulse
                  // x := new total impulse
                  // d := incremental impulse
                  //
                  // For the current iteration we extend the formula for the incremental impulse
                  // to compute the new total impulse:
                  //
                  // vn = A * d + b
                  //    = A * (x - a) + b
                  //    = A * x + b - A * a
                  //    = A * x + b'
                  // b' = b - A * a;
                  const cp1 = vc.points[0];
                  const cp2 = vc.points[1];
                  // b2Vec2 a(cp1->normalImpulse, cp2->normalImpulse);
                  a.Set(cp1.normalImpulse, cp2.normalImpulse);
                  // DEBUG: b2Assert(a.x >= 0 && a.y >= 0);
                  // Relative velocity at contact
                  // b2Vec2 dv1 = vB + b2Cross(wB, cp1->rB) - vA - b2Cross(wA, cp1->rA);
                  b2Vec2.SubVV(b2Vec2.AddVCrossSV(vB, wB, cp1.rB, b2Vec2.s_t0), b2Vec2.AddVCrossSV(vA, wA, cp1.rA, b2Vec2.s_t1), dv1);
                  // b2Vec2 dv2 = vB + b2Cross(wB, cp2->rB) - vA - b2Cross(wA, cp2->rA);
                  b2Vec2.SubVV(b2Vec2.AddVCrossSV(vB, wB, cp2.rB, b2Vec2.s_t0), b2Vec2.AddVCrossSV(vA, wA, cp2.rA, b2Vec2.s_t1), dv2);
                  // Compute normal velocity
                  // float32 vn1 = b2Dot(dv1, normal);
                  let vn1 = b2Vec2.DotVV(dv1, normal);
                  // float32 vn2 = b2Dot(dv2, normal);
                  let vn2 = b2Vec2.DotVV(dv2, normal);
                  // b2Vec2 b;
                  b.x = vn1 - cp1.velocityBias;
                  b.y = vn2 - cp2.velocityBias;
                  // Compute b'
                  // b -= b2Mul(vc->K, a);
                  b.SelfSub(b2Mat22.MulMV(vc.K, a, b2Vec2.s_t0));
                  /*
                  #if B2_DEBUG_SOLVER === 1
                  const k_errorTol: number = 0.001;
                  #endif
                  */
                  for (;;) {
                      //
                      // Case 1: vn = 0
                      //
                      // 0 = A * x + b'
                      //
                      // Solve for x:
                      //
                      // x = - inv(A) * b'
                      //
                      // b2Vec2 x = - b2Mul(vc->normalMass, b);
                      b2Mat22.MulMV(vc.normalMass, b, x).SelfNeg();
                      if (x.x >= 0 && x.y >= 0) {
                          // Get the incremental impulse
                          // b2Vec2 d = x - a;
                          b2Vec2.SubVV(x, a, d);
                          // Apply incremental impulse
                          // b2Vec2 P1 = d.x * normal;
                          b2Vec2.MulSV(d.x, normal, P1);
                          // b2Vec2 P2 = d.y * normal;
                          b2Vec2.MulSV(d.y, normal, P2);
                          b2Vec2.AddVV(P1, P2, P1P2);
                          // vA -= mA * (P1 + P2);
                          vA.SelfMulSub(mA, P1P2);
                          // wA -= iA * (b2Cross(cp1->rA, P1) + b2Cross(cp2->rA, P2));
                          wA -= iA * (b2Vec2.CrossVV(cp1.rA, P1) + b2Vec2.CrossVV(cp2.rA, P2));
                          // vB += mB * (P1 + P2);
                          vB.SelfMulAdd(mB, P1P2);
                          // wB += iB * (b2Cross(cp1->rB, P1) + b2Cross(cp2->rB, P2));
                          wB += iB * (b2Vec2.CrossVV(cp1.rB, P1) + b2Vec2.CrossVV(cp2.rB, P2));
                          // Accumulate
                          cp1.normalImpulse = x.x;
                          cp2.normalImpulse = x.y;
                          /*
                          #if B2_DEBUG_SOLVER === 1
                          // Postconditions
                          dv1 = vB + b2Cross(wB, cp1->rB) - vA - b2Cross(wA, cp1->rA);
                          dv2 = vB + b2Cross(wB, cp2->rB) - vA - b2Cross(wA, cp2->rA);
              
                          // Compute normal velocity
                          vn1 = b2Dot(dv1, normal);
                          vn2 = b2Dot(dv2, normal);
              
                          b2Assert(b2Abs(vn1 - cp1->velocityBias) < k_errorTol);
                          b2Assert(b2Abs(vn2 - cp2->velocityBias) < k_errorTol);
                          #endif
                          */
                          break;
                      }
                      //
                      // Case 2: vn1 = 0 and x2 = 0
                      //
                      //   0 = a11 * x1 + a12 * 0 + b1'
                      // vn2 = a21 * x1 + a22 * 0 + b2'
                      //
                      x.x = (-cp1.normalMass * b.x);
                      x.y = 0;
                      vn1 = 0;
                      vn2 = vc.K.ex.y * x.x + b.y;
                      if (x.x >= 0 && vn2 >= 0) {
                          // Get the incremental impulse
                          // b2Vec2 d = x - a;
                          b2Vec2.SubVV(x, a, d);
                          // Apply incremental impulse
                          // b2Vec2 P1 = d.x * normal;
                          b2Vec2.MulSV(d.x, normal, P1);
                          // b2Vec2 P2 = d.y * normal;
                          b2Vec2.MulSV(d.y, normal, P2);
                          b2Vec2.AddVV(P1, P2, P1P2);
                          // vA -= mA * (P1 + P2);
                          vA.SelfMulSub(mA, P1P2);
                          // wA -= iA * (b2Cross(cp1->rA, P1) + b2Cross(cp2->rA, P2));
                          wA -= iA * (b2Vec2.CrossVV(cp1.rA, P1) + b2Vec2.CrossVV(cp2.rA, P2));
                          // vB += mB * (P1 + P2);
                          vB.SelfMulAdd(mB, P1P2);
                          // wB += iB * (b2Cross(cp1->rB, P1) + b2Cross(cp2->rB, P2));
                          wB += iB * (b2Vec2.CrossVV(cp1.rB, P1) + b2Vec2.CrossVV(cp2.rB, P2));
                          // Accumulate
                          cp1.normalImpulse = x.x;
                          cp2.normalImpulse = x.y;
                          /*
                          #if B2_DEBUG_SOLVER === 1
                          // Postconditions
                          dv1 = vB + b2Cross(wB, cp1->rB) - vA - b2Cross(wA, cp1->rA);
              
                          // Compute normal velocity
                          vn1 = b2Dot(dv1, normal);
              
                          b2Assert(b2Abs(vn1 - cp1->velocityBias) < k_errorTol);
                          #endif
                          */
                          break;
                      }
                      //
                      // Case 3: vn2 = 0 and x1 = 0
                      //
                      // vn1 = a11 * 0 + a12 * x2 + b1'
                      //   0 = a21 * 0 + a22 * x2 + b2'
                      //
                      x.x = 0;
                      x.y = (-cp2.normalMass * b.y);
                      vn1 = vc.K.ey.x * x.y + b.x;
                      vn2 = 0;
                      if (x.y >= 0 && vn1 >= 0) {
                          // Resubstitute for the incremental impulse
                          // b2Vec2 d = x - a;
                          b2Vec2.SubVV(x, a, d);
                          // Apply incremental impulse
                          // b2Vec2 P1 = d.x * normal;
                          b2Vec2.MulSV(d.x, normal, P1);
                          // b2Vec2 P2 = d.y * normal;
                          b2Vec2.MulSV(d.y, normal, P2);
                          b2Vec2.AddVV(P1, P2, P1P2);
                          // vA -= mA * (P1 + P2);
                          vA.SelfMulSub(mA, P1P2);
                          // wA -= iA * (b2Cross(cp1->rA, P1) + b2Cross(cp2->rA, P2));
                          wA -= iA * (b2Vec2.CrossVV(cp1.rA, P1) + b2Vec2.CrossVV(cp2.rA, P2));
                          // vB += mB * (P1 + P2);
                          vB.SelfMulAdd(mB, P1P2);
                          // wB += iB * (b2Cross(cp1->rB, P1) + b2Cross(cp2->rB, P2));
                          wB += iB * (b2Vec2.CrossVV(cp1.rB, P1) + b2Vec2.CrossVV(cp2.rB, P2));
                          // Accumulate
                          cp1.normalImpulse = x.x;
                          cp2.normalImpulse = x.y;
                          /*
                          #if B2_DEBUG_SOLVER === 1
                          // Postconditions
                          dv2 = vB + b2Cross(wB, cp2->rB) - vA - b2Cross(wA, cp2->rA);
              
                          // Compute normal velocity
                          vn2 = b2Dot(dv2, normal);
              
                          b2Assert(b2Abs(vn2 - cp2->velocityBias) < k_errorTol);
                          #endif
                          */
                          break;
                      }
                      //
                      // Case 4: x1 = 0 and x2 = 0
                      //
                      // vn1 = b1
                      // vn2 = b2;
                      x.x = 0;
                      x.y = 0;
                      vn1 = b.x;
                      vn2 = b.y;
                      if (vn1 >= 0 && vn2 >= 0) {
                          // Resubstitute for the incremental impulse
                          // b2Vec2 d = x - a;
                          b2Vec2.SubVV(x, a, d);
                          // Apply incremental impulse
                          // b2Vec2 P1 = d.x * normal;
                          b2Vec2.MulSV(d.x, normal, P1);
                          // b2Vec2 P2 = d.y * normal;
                          b2Vec2.MulSV(d.y, normal, P2);
                          b2Vec2.AddVV(P1, P2, P1P2);
                          // vA -= mA * (P1 + P2);
                          vA.SelfMulSub(mA, P1P2);
                          // wA -= iA * (b2Cross(cp1->rA, P1) + b2Cross(cp2->rA, P2));
                          wA -= iA * (b2Vec2.CrossVV(cp1.rA, P1) + b2Vec2.CrossVV(cp2.rA, P2));
                          // vB += mB * (P1 + P2);
                          vB.SelfMulAdd(mB, P1P2);
                          // wB += iB * (b2Cross(cp1->rB, P1) + b2Cross(cp2->rB, P2));
                          wB += iB * (b2Vec2.CrossVV(cp1.rB, P1) + b2Vec2.CrossVV(cp2.rB, P2));
                          // Accumulate
                          cp1.normalImpulse = x.x;
                          cp2.normalImpulse = x.y;
                          break;
                      }
                      // No solution, give up. This is hit sometimes, but it doesn't seem to matter.
                      break;
                  }
              }
              // this.m_velocities[indexA].v = vA;
              this.m_velocities[indexA].w = wA;
              // this.m_velocities[indexB].v = vB;
              this.m_velocities[indexB].w = wB;
          }
      }
      StoreImpulses() {
          for (let i = 0; i < this.m_count; ++i) {
              const vc = this.m_velocityConstraints[i];
              const manifold = this.m_contacts[vc.contactIndex].GetManifold();
              for (let j = 0; j < vc.pointCount; ++j) {
                  manifold.points[j].normalImpulse = vc.points[j].normalImpulse;
                  manifold.points[j].tangentImpulse = vc.points[j].tangentImpulse;
              }
          }
      }
      SolvePositionConstraints() {
          const xfA = b2ContactSolver.SolvePositionConstraints_s_xfA;
          const xfB = b2ContactSolver.SolvePositionConstraints_s_xfB;
          const psm = b2ContactSolver.SolvePositionConstraints_s_psm;
          const rA = b2ContactSolver.SolvePositionConstraints_s_rA;
          const rB = b2ContactSolver.SolvePositionConstraints_s_rB;
          const P = b2ContactSolver.SolvePositionConstraints_s_P;
          let minSeparation = 0;
          for (let i = 0; i < this.m_count; ++i) {
              const pc = this.m_positionConstraints[i];
              const indexA = pc.indexA;
              const indexB = pc.indexB;
              const localCenterA = pc.localCenterA;
              const mA = pc.invMassA;
              const iA = pc.invIA;
              const localCenterB = pc.localCenterB;
              const mB = pc.invMassB;
              const iB = pc.invIB;
              const pointCount = pc.pointCount;
              const cA = this.m_positions[indexA].c;
              let aA = this.m_positions[indexA].a;
              const cB = this.m_positions[indexB].c;
              let aB = this.m_positions[indexB].a;
              // Solve normal constraints
              for (let j = 0; j < pointCount; ++j) {
                  xfA.q.SetAngle(aA);
                  xfB.q.SetAngle(aB);
                  b2Vec2.SubVV(cA, b2Rot.MulRV(xfA.q, localCenterA, b2Vec2.s_t0), xfA.p);
                  b2Vec2.SubVV(cB, b2Rot.MulRV(xfB.q, localCenterB, b2Vec2.s_t0), xfB.p);
                  psm.Initialize(pc, xfA, xfB, j);
                  const normal = psm.normal;
                  const point = psm.point;
                  const separation = psm.separation;
                  // b2Vec2 rA = point - cA;
                  b2Vec2.SubVV(point, cA, rA);
                  // b2Vec2 rB = point - cB;
                  b2Vec2.SubVV(point, cB, rB);
                  // Track max constraint error.
                  minSeparation = b2Min(minSeparation, separation);
                  // Prevent large corrections and allow slop.
                  const C = b2Clamp(b2_baumgarte * (separation + b2_linearSlop), (-b2_maxLinearCorrection), 0);
                  // Compute the effective mass.
                  // float32 rnA = b2Cross(rA, normal);
                  const rnA = b2Vec2.CrossVV(rA, normal);
                  // float32 rnB = b2Cross(rB, normal);
                  const rnB = b2Vec2.CrossVV(rB, normal);
                  // float32 K = mA + mB + iA * rnA * rnA + iB * rnB * rnB;
                  const K = mA + mB + iA * rnA * rnA + iB * rnB * rnB;
                  // Compute normal impulse
                  const impulse = K > 0 ? -C / K : 0;
                  // b2Vec2 P = impulse * normal;
                  b2Vec2.MulSV(impulse, normal, P);
                  // cA -= mA * P;
                  cA.SelfMulSub(mA, P);
                  // aA -= iA * b2Cross(rA, P);
                  aA -= iA * b2Vec2.CrossVV(rA, P);
                  // cB += mB * P;
                  cB.SelfMulAdd(mB, P);
                  // aB += iB * b2Cross(rB, P);
                  aB += iB * b2Vec2.CrossVV(rB, P);
              }
              // this.m_positions[indexA].c = cA;
              this.m_positions[indexA].a = aA;
              // this.m_positions[indexB].c = cB;
              this.m_positions[indexB].a = aB;
          }
          // We can't expect minSpeparation >= -b2_linearSlop because we don't
          // push the separation above -b2_linearSlop.
          return minSeparation > (-3 * b2_linearSlop);
      }
      SolveTOIPositionConstraints(toiIndexA, toiIndexB) {
          const xfA = b2ContactSolver.SolveTOIPositionConstraints_s_xfA;
          const xfB = b2ContactSolver.SolveTOIPositionConstraints_s_xfB;
          const psm = b2ContactSolver.SolveTOIPositionConstraints_s_psm;
          const rA = b2ContactSolver.SolveTOIPositionConstraints_s_rA;
          const rB = b2ContactSolver.SolveTOIPositionConstraints_s_rB;
          const P = b2ContactSolver.SolveTOIPositionConstraints_s_P;
          let minSeparation = 0;
          for (let i = 0; i < this.m_count; ++i) {
              const pc = this.m_positionConstraints[i];
              const indexA = pc.indexA;
              const indexB = pc.indexB;
              const localCenterA = pc.localCenterA;
              const localCenterB = pc.localCenterB;
              const pointCount = pc.pointCount;
              let mA = 0;
              let iA = 0;
              if (indexA === toiIndexA || indexA === toiIndexB) {
                  mA = pc.invMassA;
                  iA = pc.invIA;
              }
              let mB = 0;
              let iB = 0;
              if (indexB === toiIndexA || indexB === toiIndexB) {
                  mB = pc.invMassB;
                  iB = pc.invIB;
              }
              const cA = this.m_positions[indexA].c;
              let aA = this.m_positions[indexA].a;
              const cB = this.m_positions[indexB].c;
              let aB = this.m_positions[indexB].a;
              // Solve normal constraints
              for (let j = 0; j < pointCount; ++j) {
                  xfA.q.SetAngle(aA);
                  xfB.q.SetAngle(aB);
                  b2Vec2.SubVV(cA, b2Rot.MulRV(xfA.q, localCenterA, b2Vec2.s_t0), xfA.p);
                  b2Vec2.SubVV(cB, b2Rot.MulRV(xfB.q, localCenterB, b2Vec2.s_t0), xfB.p);
                  psm.Initialize(pc, xfA, xfB, j);
                  const normal = psm.normal;
                  const point = psm.point;
                  const separation = psm.separation;
                  // b2Vec2 rA = point - cA;
                  b2Vec2.SubVV(point, cA, rA);
                  // b2Vec2 rB = point - cB;
                  b2Vec2.SubVV(point, cB, rB);
                  // Track max constraint error.
                  minSeparation = b2Min(minSeparation, separation);
                  // Prevent large corrections and allow slop.
                  const C = b2Clamp(b2_toiBaumgarte * (separation + b2_linearSlop), (-b2_maxLinearCorrection), 0);
                  // Compute the effective mass.
                  // float32 rnA = b2Cross(rA, normal);
                  const rnA = b2Vec2.CrossVV(rA, normal);
                  // float32 rnB = b2Cross(rB, normal);
                  const rnB = b2Vec2.CrossVV(rB, normal);
                  // float32 K = mA + mB + iA * rnA * rnA + iB * rnB * rnB;
                  const K = mA + mB + iA * rnA * rnA + iB * rnB * rnB;
                  // Compute normal impulse
                  const impulse = K > 0 ? -C / K : 0;
                  // b2Vec2 P = impulse * normal;
                  b2Vec2.MulSV(impulse, normal, P);
                  // cA -= mA * P;
                  cA.SelfMulSub(mA, P);
                  // aA -= iA * b2Cross(rA, P);
                  aA -= iA * b2Vec2.CrossVV(rA, P);
                  // cB += mB * P;
                  cB.SelfMulAdd(mB, P);
                  // aB += iB * b2Cross(rB, P);
                  aB += iB * b2Vec2.CrossVV(rB, P);
              }
              // this.m_positions[indexA].c = cA;
              this.m_positions[indexA].a = aA;
              // this.m_positions[indexB].c = cB;
              this.m_positions[indexB].a = aB;
          }
          // We can't expect minSpeparation >= -b2_linearSlop because we don't
          // push the separation above -b2_linearSlop.
          return minSeparation >= -1.5 * b2_linearSlop;
      }
  }
  b2ContactSolver.InitializeVelocityConstraints_s_xfA = new b2Transform();
  b2ContactSolver.InitializeVelocityConstraints_s_xfB = new b2Transform();
  b2ContactSolver.InitializeVelocityConstraints_s_worldManifold = new b2WorldManifold();
  b2ContactSolver.WarmStart_s_P = new b2Vec2();
  b2ContactSolver.SolveVelocityConstraints_s_dv = new b2Vec2();
  b2ContactSolver.SolveVelocityConstraints_s_dv1 = new b2Vec2();
  b2ContactSolver.SolveVelocityConstraints_s_dv2 = new b2Vec2();
  b2ContactSolver.SolveVelocityConstraints_s_P = new b2Vec2();
  b2ContactSolver.SolveVelocityConstraints_s_a = new b2Vec2();
  b2ContactSolver.SolveVelocityConstraints_s_b = new b2Vec2();
  b2ContactSolver.SolveVelocityConstraints_s_x = new b2Vec2();
  b2ContactSolver.SolveVelocityConstraints_s_d = new b2Vec2();
  b2ContactSolver.SolveVelocityConstraints_s_P1 = new b2Vec2();
  b2ContactSolver.SolveVelocityConstraints_s_P2 = new b2Vec2();
  b2ContactSolver.SolveVelocityConstraints_s_P1P2 = new b2Vec2();
  b2ContactSolver.SolvePositionConstraints_s_xfA = new b2Transform();
  b2ContactSolver.SolvePositionConstraints_s_xfB = new b2Transform();
  b2ContactSolver.SolvePositionConstraints_s_psm = new b2PositionSolverManifold();
  b2ContactSolver.SolvePositionConstraints_s_rA = new b2Vec2();
  b2ContactSolver.SolvePositionConstraints_s_rB = new b2Vec2();
  b2ContactSolver.SolvePositionConstraints_s_P = new b2Vec2();
  b2ContactSolver.SolveTOIPositionConstraints_s_xfA = new b2Transform();
  b2ContactSolver.SolveTOIPositionConstraints_s_xfB = new b2Transform();
  b2ContactSolver.SolveTOIPositionConstraints_s_psm = new b2PositionSolverManifold();
  b2ContactSolver.SolveTOIPositionConstraints_s_rA = new b2Vec2();
  b2ContactSolver.SolveTOIPositionConstraints_s_rB = new b2Vec2();
  b2ContactSolver.SolveTOIPositionConstraints_s_P = new b2Vec2();

  /*
  * Copyright (c) 2006-2007 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  /// Friction joint definition.
  class b2FrictionJointDef extends b2JointDef {
      constructor() {
          super(exports.b2JointType.e_frictionJoint);
          this.localAnchorA = new b2Vec2();
          this.localAnchorB = new b2Vec2();
          this.maxForce = 0;
          this.maxTorque = 0;
      }
      Initialize(bA, bB, anchor) {
          this.bodyA = bA;
          this.bodyB = bB;
          this.bodyA.GetLocalPoint(anchor, this.localAnchorA);
          this.bodyB.GetLocalPoint(anchor, this.localAnchorB);
      }
  }
  class b2FrictionJoint extends b2Joint {
      constructor(def) {
          super(def);
          this.m_localAnchorA = new b2Vec2();
          this.m_localAnchorB = new b2Vec2();
          // Solver shared
          this.m_linearImpulse = new b2Vec2();
          this.m_angularImpulse = 0;
          this.m_maxForce = 0;
          this.m_maxTorque = 0;
          // Solver temp
          this.m_indexA = 0;
          this.m_indexB = 0;
          this.m_rA = new b2Vec2();
          this.m_rB = new b2Vec2();
          this.m_localCenterA = new b2Vec2();
          this.m_localCenterB = new b2Vec2();
          this.m_invMassA = 0;
          this.m_invMassB = 0;
          this.m_invIA = 0;
          this.m_invIB = 0;
          this.m_linearMass = new b2Mat22();
          this.m_angularMass = 0;
          this.m_qA = new b2Rot();
          this.m_qB = new b2Rot();
          this.m_lalcA = new b2Vec2();
          this.m_lalcB = new b2Vec2();
          this.m_K = new b2Mat22();
          this.m_localAnchorA.Copy(b2Maybe(def.localAnchorA, b2Vec2.ZERO));
          this.m_localAnchorB.Copy(b2Maybe(def.localAnchorB, b2Vec2.ZERO));
          this.m_linearImpulse.SetZero();
          this.m_maxForce = b2Maybe(def.maxForce, 0);
          this.m_maxTorque = b2Maybe(def.maxTorque, 0);
          this.m_linearMass.SetZero();
      }
      InitVelocityConstraints(data) {
          this.m_indexA = this.m_bodyA.m_islandIndex;
          this.m_indexB = this.m_bodyB.m_islandIndex;
          this.m_localCenterA.Copy(this.m_bodyA.m_sweep.localCenter);
          this.m_localCenterB.Copy(this.m_bodyB.m_sweep.localCenter);
          this.m_invMassA = this.m_bodyA.m_invMass;
          this.m_invMassB = this.m_bodyB.m_invMass;
          this.m_invIA = this.m_bodyA.m_invI;
          this.m_invIB = this.m_bodyB.m_invI;
          // const cA: b2Vec2 = data.positions[this.m_indexA].c;
          const aA = data.positions[this.m_indexA].a;
          const vA = data.velocities[this.m_indexA].v;
          let wA = data.velocities[this.m_indexA].w;
          // const cB: b2Vec2 = data.positions[this.m_indexB].c;
          const aB = data.positions[this.m_indexB].a;
          const vB = data.velocities[this.m_indexB].v;
          let wB = data.velocities[this.m_indexB].w;
          // const qA: b2Rot = new b2Rot(aA), qB: b2Rot = new b2Rot(aB);
          const qA = this.m_qA.SetAngle(aA), qB = this.m_qB.SetAngle(aB);
          // Compute the effective mass matrix.
          // m_rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
          b2Vec2.SubVV(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
          const rA = b2Rot.MulRV(qA, this.m_lalcA, this.m_rA);
          // m_rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
          b2Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
          const rB = b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);
          // J = [-I -r1_skew I r2_skew]
          //     [ 0       -1 0       1]
          // r_skew = [-ry; rx]
          // Matlab
          // K = [ mA+r1y^2*iA+mB+r2y^2*iB,  -r1y*iA*r1x-r2y*iB*r2x,          -r1y*iA-r2y*iB]
          //     [  -r1y*iA*r1x-r2y*iB*r2x, mA+r1x^2*iA+mB+r2x^2*iB,           r1x*iA+r2x*iB]
          //     [          -r1y*iA-r2y*iB,           r1x*iA+r2x*iB,                   iA+iB]
          const mA = this.m_invMassA, mB = this.m_invMassB;
          const iA = this.m_invIA, iB = this.m_invIB;
          const K = this.m_K; // new b2Mat22();
          K.ex.x = mA + mB + iA * rA.y * rA.y + iB * rB.y * rB.y;
          K.ex.y = -iA * rA.x * rA.y - iB * rB.x * rB.y;
          K.ey.x = K.ex.y;
          K.ey.y = mA + mB + iA * rA.x * rA.x + iB * rB.x * rB.x;
          K.GetInverse(this.m_linearMass);
          this.m_angularMass = iA + iB;
          if (this.m_angularMass > 0) {
              this.m_angularMass = 1 / this.m_angularMass;
          }
          if (data.step.warmStarting) {
              // Scale impulses to support a variable time step.
              // m_linearImpulse *= data.step.dtRatio;
              this.m_linearImpulse.SelfMul(data.step.dtRatio);
              this.m_angularImpulse *= data.step.dtRatio;
              // const P: b2Vec2(m_linearImpulse.x, m_linearImpulse.y);
              const P = this.m_linearImpulse;
              // vA -= mA * P;
              vA.SelfMulSub(mA, P);
              // wA -= iA * (b2Cross(m_rA, P) + m_angularImpulse);
              wA -= iA * (b2Vec2.CrossVV(this.m_rA, P) + this.m_angularImpulse);
              // vB += mB * P;
              vB.SelfMulAdd(mB, P);
              // wB += iB * (b2Cross(m_rB, P) + m_angularImpulse);
              wB += iB * (b2Vec2.CrossVV(this.m_rB, P) + this.m_angularImpulse);
          }
          else {
              this.m_linearImpulse.SetZero();
              this.m_angularImpulse = 0;
          }
          // data.velocities[this.m_indexA].v = vA;
          data.velocities[this.m_indexA].w = wA;
          // data.velocities[this.m_indexB].v = vB;
          data.velocities[this.m_indexB].w = wB;
      }
      SolveVelocityConstraints(data) {
          const vA = data.velocities[this.m_indexA].v;
          let wA = data.velocities[this.m_indexA].w;
          const vB = data.velocities[this.m_indexB].v;
          let wB = data.velocities[this.m_indexB].w;
          const mA = this.m_invMassA, mB = this.m_invMassB;
          const iA = this.m_invIA, iB = this.m_invIB;
          const h = data.step.dt;
          // Solve angular friction
          {
              const Cdot = wB - wA;
              let impulse = (-this.m_angularMass * Cdot);
              const oldImpulse = this.m_angularImpulse;
              const maxImpulse = h * this.m_maxTorque;
              this.m_angularImpulse = b2Clamp(this.m_angularImpulse + impulse, (-maxImpulse), maxImpulse);
              impulse = this.m_angularImpulse - oldImpulse;
              wA -= iA * impulse;
              wB += iB * impulse;
          }
          // Solve linear friction
          {
              // b2Vec2 Cdot = vB + b2Cross(wB, m_rB) - vA - b2Cross(wA, m_rA);
              const Cdot_v2 = b2Vec2.SubVV(b2Vec2.AddVCrossSV(vB, wB, this.m_rB, b2Vec2.s_t0), b2Vec2.AddVCrossSV(vA, wA, this.m_rA, b2Vec2.s_t1), b2FrictionJoint.SolveVelocityConstraints_s_Cdot_v2);
              // b2Vec2 impulse = -b2Mul(m_linearMass, Cdot);
              const impulseV = b2Mat22.MulMV(this.m_linearMass, Cdot_v2, b2FrictionJoint.SolveVelocityConstraints_s_impulseV).SelfNeg();
              // b2Vec2 oldImpulse = m_linearImpulse;
              const oldImpulseV = b2FrictionJoint.SolveVelocityConstraints_s_oldImpulseV.Copy(this.m_linearImpulse);
              // m_linearImpulse += impulse;
              this.m_linearImpulse.SelfAdd(impulseV);
              const maxImpulse = h * this.m_maxForce;
              if (this.m_linearImpulse.LengthSquared() > maxImpulse * maxImpulse) {
                  this.m_linearImpulse.Normalize();
                  this.m_linearImpulse.SelfMul(maxImpulse);
              }
              // impulse = m_linearImpulse - oldImpulse;
              b2Vec2.SubVV(this.m_linearImpulse, oldImpulseV, impulseV);
              // vA -= mA * impulse;
              vA.SelfMulSub(mA, impulseV);
              // wA -= iA * b2Cross(m_rA, impulse);
              wA -= iA * b2Vec2.CrossVV(this.m_rA, impulseV);
              // vB += mB * impulse;
              vB.SelfMulAdd(mB, impulseV);
              // wB += iB * b2Cross(m_rB, impulse);
              wB += iB * b2Vec2.CrossVV(this.m_rB, impulseV);
          }
          // data.velocities[this.m_indexA].v = vA;
          data.velocities[this.m_indexA].w = wA;
          // data.velocities[this.m_indexB].v = vB;
          data.velocities[this.m_indexB].w = wB;
      }
      SolvePositionConstraints(data) {
          return true;
      }
      GetAnchorA(out) {
          return this.m_bodyA.GetWorldPoint(this.m_localAnchorA, out);
      }
      GetAnchorB(out) {
          return this.m_bodyB.GetWorldPoint(this.m_localAnchorB, out);
      }
      GetReactionForce(inv_dt, out) {
          out.x = inv_dt * this.m_linearImpulse.x;
          out.y = inv_dt * this.m_linearImpulse.y;
          return out;
      }
      GetReactionTorque(inv_dt) {
          return inv_dt * this.m_angularImpulse;
      }
      GetLocalAnchorA() { return this.m_localAnchorA; }
      GetLocalAnchorB() { return this.m_localAnchorB; }
      SetMaxForce(force) {
          this.m_maxForce = force;
      }
      GetMaxForce() {
          return this.m_maxForce;
      }
      SetMaxTorque(torque) {
          this.m_maxTorque = torque;
      }
      GetMaxTorque() {
          return this.m_maxTorque;
      }
      Dump(log) {
          const indexA = this.m_bodyA.m_islandIndex;
          const indexB = this.m_bodyB.m_islandIndex;
          log("  const jd: b2FrictionJointDef = new b2FrictionJointDef();\n");
          log("  jd.bodyA = bodies[%d];\n", indexA);
          log("  jd.bodyB = bodies[%d];\n", indexB);
          log("  jd.collideConnected = %s;\n", (this.m_collideConnected) ? ("true") : ("false"));
          log("  jd.localAnchorA.Set(%.15f, %.15f);\n", this.m_localAnchorA.x, this.m_localAnchorA.y);
          log("  jd.localAnchorB.Set(%.15f, %.15f);\n", this.m_localAnchorB.x, this.m_localAnchorB.y);
          log("  jd.maxForce = %.15f;\n", this.m_maxForce);
          log("  jd.maxTorque = %.15f;\n", this.m_maxTorque);
          log("  joints[%d] = this.m_world.CreateJoint(jd);\n", this.m_index);
      }
  }
  b2FrictionJoint.SolveVelocityConstraints_s_Cdot_v2 = new b2Vec2();
  b2FrictionJoint.SolveVelocityConstraints_s_impulseV = new b2Vec2();
  b2FrictionJoint.SolveVelocityConstraints_s_oldImpulseV = new b2Vec2();

  /*
  * Copyright (c) 2006-2011 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  /// Gear joint definition. This definition requires two existing
  /// revolute or prismatic joints (any combination will work).
  class b2GearJointDef extends b2JointDef {
      constructor() {
          super(exports.b2JointType.e_gearJoint);
          this.ratio = 1;
      }
  }
  class b2GearJoint extends b2Joint {
      constructor(def) {
          super(def);
          this.m_typeA = exports.b2JointType.e_unknownJoint;
          this.m_typeB = exports.b2JointType.e_unknownJoint;
          // Solver shared
          this.m_localAnchorA = new b2Vec2();
          this.m_localAnchorB = new b2Vec2();
          this.m_localAnchorC = new b2Vec2();
          this.m_localAnchorD = new b2Vec2();
          this.m_localAxisC = new b2Vec2();
          this.m_localAxisD = new b2Vec2();
          this.m_referenceAngleA = 0;
          this.m_referenceAngleB = 0;
          this.m_constant = 0;
          this.m_ratio = 0;
          this.m_impulse = 0;
          // Solver temp
          this.m_indexA = 0;
          this.m_indexB = 0;
          this.m_indexC = 0;
          this.m_indexD = 0;
          this.m_lcA = new b2Vec2();
          this.m_lcB = new b2Vec2();
          this.m_lcC = new b2Vec2();
          this.m_lcD = new b2Vec2();
          this.m_mA = 0;
          this.m_mB = 0;
          this.m_mC = 0;
          this.m_mD = 0;
          this.m_iA = 0;
          this.m_iB = 0;
          this.m_iC = 0;
          this.m_iD = 0;
          this.m_JvAC = new b2Vec2();
          this.m_JvBD = new b2Vec2();
          this.m_JwA = 0;
          this.m_JwB = 0;
          this.m_JwC = 0;
          this.m_JwD = 0;
          this.m_mass = 0;
          this.m_qA = new b2Rot();
          this.m_qB = new b2Rot();
          this.m_qC = new b2Rot();
          this.m_qD = new b2Rot();
          this.m_lalcA = new b2Vec2();
          this.m_lalcB = new b2Vec2();
          this.m_lalcC = new b2Vec2();
          this.m_lalcD = new b2Vec2();
          this.m_joint1 = def.joint1;
          this.m_joint2 = def.joint2;
          this.m_typeA = this.m_joint1.GetType();
          this.m_typeB = this.m_joint2.GetType();
          // DEBUG: b2Assert(this.m_typeA === b2JointType.e_revoluteJoint || this.m_typeA === b2JointType.e_prismaticJoint);
          // DEBUG: b2Assert(this.m_typeB === b2JointType.e_revoluteJoint || this.m_typeB === b2JointType.e_prismaticJoint);
          let coordinateA, coordinateB;
          // TODO_ERIN there might be some problem with the joint edges in b2Joint.
          this.m_bodyC = this.m_joint1.GetBodyA();
          this.m_bodyA = this.m_joint1.GetBodyB();
          // Body B on joint1 must be dynamic
          // b2Assert(this.m_bodyA.m_type === b2_dynamicBody);
          // Get geometry of joint1
          const xfA = this.m_bodyA.m_xf;
          const aA = this.m_bodyA.m_sweep.a;
          const xfC = this.m_bodyC.m_xf;
          const aC = this.m_bodyC.m_sweep.a;
          if (this.m_typeA === exports.b2JointType.e_revoluteJoint) {
              const revolute = def.joint1;
              this.m_localAnchorC.Copy(revolute.m_localAnchorA);
              this.m_localAnchorA.Copy(revolute.m_localAnchorB);
              this.m_referenceAngleA = revolute.m_referenceAngle;
              this.m_localAxisC.SetZero();
              coordinateA = aA - aC - this.m_referenceAngleA;
          }
          else {
              const prismatic = def.joint1;
              this.m_localAnchorC.Copy(prismatic.m_localAnchorA);
              this.m_localAnchorA.Copy(prismatic.m_localAnchorB);
              this.m_referenceAngleA = prismatic.m_referenceAngle;
              this.m_localAxisC.Copy(prismatic.m_localXAxisA);
              // b2Vec2 pC = m_localAnchorC;
              const pC = this.m_localAnchorC;
              // b2Vec2 pA = b2MulT(xfC.q, b2Mul(xfA.q, m_localAnchorA) + (xfA.p - xfC.p));
              const pA = b2Rot.MulTRV(xfC.q, b2Vec2.AddVV(b2Rot.MulRV(xfA.q, this.m_localAnchorA, b2Vec2.s_t0), b2Vec2.SubVV(xfA.p, xfC.p, b2Vec2.s_t1), b2Vec2.s_t0), b2Vec2.s_t0); // pA uses s_t0
              // coordinateA = b2Dot(pA - pC, m_localAxisC);
              coordinateA = b2Vec2.DotVV(b2Vec2.SubVV(pA, pC, b2Vec2.s_t0), this.m_localAxisC);
          }
          this.m_bodyD = this.m_joint2.GetBodyA();
          this.m_bodyB = this.m_joint2.GetBodyB();
          // Body B on joint2 must be dynamic
          // b2Assert(this.m_bodyB.m_type === b2_dynamicBody);
          // Get geometry of joint2
          const xfB = this.m_bodyB.m_xf;
          const aB = this.m_bodyB.m_sweep.a;
          const xfD = this.m_bodyD.m_xf;
          const aD = this.m_bodyD.m_sweep.a;
          if (this.m_typeB === exports.b2JointType.e_revoluteJoint) {
              const revolute = def.joint2;
              this.m_localAnchorD.Copy(revolute.m_localAnchorA);
              this.m_localAnchorB.Copy(revolute.m_localAnchorB);
              this.m_referenceAngleB = revolute.m_referenceAngle;
              this.m_localAxisD.SetZero();
              coordinateB = aB - aD - this.m_referenceAngleB;
          }
          else {
              const prismatic = def.joint2;
              this.m_localAnchorD.Copy(prismatic.m_localAnchorA);
              this.m_localAnchorB.Copy(prismatic.m_localAnchorB);
              this.m_referenceAngleB = prismatic.m_referenceAngle;
              this.m_localAxisD.Copy(prismatic.m_localXAxisA);
              // b2Vec2 pD = m_localAnchorD;
              const pD = this.m_localAnchorD;
              // b2Vec2 pB = b2MulT(xfD.q, b2Mul(xfB.q, m_localAnchorB) + (xfB.p - xfD.p));
              const pB = b2Rot.MulTRV(xfD.q, b2Vec2.AddVV(b2Rot.MulRV(xfB.q, this.m_localAnchorB, b2Vec2.s_t0), b2Vec2.SubVV(xfB.p, xfD.p, b2Vec2.s_t1), b2Vec2.s_t0), b2Vec2.s_t0); // pB uses s_t0
              // coordinateB = b2Dot(pB - pD, m_localAxisD);
              coordinateB = b2Vec2.DotVV(b2Vec2.SubVV(pB, pD, b2Vec2.s_t0), this.m_localAxisD);
          }
          this.m_ratio = b2Maybe(def.ratio, 1);
          this.m_constant = coordinateA + this.m_ratio * coordinateB;
          this.m_impulse = 0;
      }
      InitVelocityConstraints(data) {
          this.m_indexA = this.m_bodyA.m_islandIndex;
          this.m_indexB = this.m_bodyB.m_islandIndex;
          this.m_indexC = this.m_bodyC.m_islandIndex;
          this.m_indexD = this.m_bodyD.m_islandIndex;
          this.m_lcA.Copy(this.m_bodyA.m_sweep.localCenter);
          this.m_lcB.Copy(this.m_bodyB.m_sweep.localCenter);
          this.m_lcC.Copy(this.m_bodyC.m_sweep.localCenter);
          this.m_lcD.Copy(this.m_bodyD.m_sweep.localCenter);
          this.m_mA = this.m_bodyA.m_invMass;
          this.m_mB = this.m_bodyB.m_invMass;
          this.m_mC = this.m_bodyC.m_invMass;
          this.m_mD = this.m_bodyD.m_invMass;
          this.m_iA = this.m_bodyA.m_invI;
          this.m_iB = this.m_bodyB.m_invI;
          this.m_iC = this.m_bodyC.m_invI;
          this.m_iD = this.m_bodyD.m_invI;
          const aA = data.positions[this.m_indexA].a;
          const vA = data.velocities[this.m_indexA].v;
          let wA = data.velocities[this.m_indexA].w;
          const aB = data.positions[this.m_indexB].a;
          const vB = data.velocities[this.m_indexB].v;
          let wB = data.velocities[this.m_indexB].w;
          const aC = data.positions[this.m_indexC].a;
          const vC = data.velocities[this.m_indexC].v;
          let wC = data.velocities[this.m_indexC].w;
          const aD = data.positions[this.m_indexD].a;
          const vD = data.velocities[this.m_indexD].v;
          let wD = data.velocities[this.m_indexD].w;
          // b2Rot qA(aA), qB(aB), qC(aC), qD(aD);
          const qA = this.m_qA.SetAngle(aA), qB = this.m_qB.SetAngle(aB), qC = this.m_qC.SetAngle(aC), qD = this.m_qD.SetAngle(aD);
          this.m_mass = 0;
          if (this.m_typeA === exports.b2JointType.e_revoluteJoint) {
              this.m_JvAC.SetZero();
              this.m_JwA = 1;
              this.m_JwC = 1;
              this.m_mass += this.m_iA + this.m_iC;
          }
          else {
              // b2Vec2 u = b2Mul(qC, m_localAxisC);
              const u = b2Rot.MulRV(qC, this.m_localAxisC, b2GearJoint.InitVelocityConstraints_s_u);
              // b2Vec2 rC = b2Mul(qC, m_localAnchorC - m_lcC);
              b2Vec2.SubVV(this.m_localAnchorC, this.m_lcC, this.m_lalcC);
              const rC = b2Rot.MulRV(qC, this.m_lalcC, b2GearJoint.InitVelocityConstraints_s_rC);
              // b2Vec2 rA = b2Mul(qA, m_localAnchorA - m_lcA);
              b2Vec2.SubVV(this.m_localAnchorA, this.m_lcA, this.m_lalcA);
              const rA = b2Rot.MulRV(qA, this.m_lalcA, b2GearJoint.InitVelocityConstraints_s_rA);
              // m_JvAC = u;
              this.m_JvAC.Copy(u);
              // m_JwC = b2Cross(rC, u);
              this.m_JwC = b2Vec2.CrossVV(rC, u);
              // m_JwA = b2Cross(rA, u);
              this.m_JwA = b2Vec2.CrossVV(rA, u);
              this.m_mass += this.m_mC + this.m_mA + this.m_iC * this.m_JwC * this.m_JwC + this.m_iA * this.m_JwA * this.m_JwA;
          }
          if (this.m_typeB === exports.b2JointType.e_revoluteJoint) {
              this.m_JvBD.SetZero();
              this.m_JwB = this.m_ratio;
              this.m_JwD = this.m_ratio;
              this.m_mass += this.m_ratio * this.m_ratio * (this.m_iB + this.m_iD);
          }
          else {
              // b2Vec2 u = b2Mul(qD, m_localAxisD);
              const u = b2Rot.MulRV(qD, this.m_localAxisD, b2GearJoint.InitVelocityConstraints_s_u);
              // b2Vec2 rD = b2Mul(qD, m_localAnchorD - m_lcD);
              b2Vec2.SubVV(this.m_localAnchorD, this.m_lcD, this.m_lalcD);
              const rD = b2Rot.MulRV(qD, this.m_lalcD, b2GearJoint.InitVelocityConstraints_s_rD);
              // b2Vec2 rB = b2Mul(qB, m_localAnchorB - m_lcB);
              b2Vec2.SubVV(this.m_localAnchorB, this.m_lcB, this.m_lalcB);
              const rB = b2Rot.MulRV(qB, this.m_lalcB, b2GearJoint.InitVelocityConstraints_s_rB);
              // m_JvBD = m_ratio * u;
              b2Vec2.MulSV(this.m_ratio, u, this.m_JvBD);
              // m_JwD = m_ratio * b2Cross(rD, u);
              this.m_JwD = this.m_ratio * b2Vec2.CrossVV(rD, u);
              // m_JwB = m_ratio * b2Cross(rB, u);
              this.m_JwB = this.m_ratio * b2Vec2.CrossVV(rB, u);
              this.m_mass += this.m_ratio * this.m_ratio * (this.m_mD + this.m_mB) + this.m_iD * this.m_JwD * this.m_JwD + this.m_iB * this.m_JwB * this.m_JwB;
          }
          // Compute effective mass.
          this.m_mass = this.m_mass > 0 ? 1 / this.m_mass : 0;
          if (data.step.warmStarting) {
              // vA += (m_mA * m_impulse) * m_JvAC;
              vA.SelfMulAdd(this.m_mA * this.m_impulse, this.m_JvAC);
              wA += this.m_iA * this.m_impulse * this.m_JwA;
              // vB += (m_mB * m_impulse) * m_JvBD;
              vB.SelfMulAdd(this.m_mB * this.m_impulse, this.m_JvBD);
              wB += this.m_iB * this.m_impulse * this.m_JwB;
              // vC -= (m_mC * m_impulse) * m_JvAC;
              vC.SelfMulSub(this.m_mC * this.m_impulse, this.m_JvAC);
              wC -= this.m_iC * this.m_impulse * this.m_JwC;
              // vD -= (m_mD * m_impulse) * m_JvBD;
              vD.SelfMulSub(this.m_mD * this.m_impulse, this.m_JvBD);
              wD -= this.m_iD * this.m_impulse * this.m_JwD;
          }
          else {
              this.m_impulse = 0;
          }
          // data.velocities[this.m_indexA].v = vA;
          data.velocities[this.m_indexA].w = wA;
          // data.velocities[this.m_indexB].v = vB;
          data.velocities[this.m_indexB].w = wB;
          // data.velocities[this.m_indexC].v = vC;
          data.velocities[this.m_indexC].w = wC;
          // data.velocities[this.m_indexD].v = vD;
          data.velocities[this.m_indexD].w = wD;
      }
      SolveVelocityConstraints(data) {
          const vA = data.velocities[this.m_indexA].v;
          let wA = data.velocities[this.m_indexA].w;
          const vB = data.velocities[this.m_indexB].v;
          let wB = data.velocities[this.m_indexB].w;
          const vC = data.velocities[this.m_indexC].v;
          let wC = data.velocities[this.m_indexC].w;
          const vD = data.velocities[this.m_indexD].v;
          let wD = data.velocities[this.m_indexD].w;
          // float32 Cdot = b2Dot(m_JvAC, vA - vC) + b2Dot(m_JvBD, vB - vD);
          let Cdot = b2Vec2.DotVV(this.m_JvAC, b2Vec2.SubVV(vA, vC, b2Vec2.s_t0)) +
              b2Vec2.DotVV(this.m_JvBD, b2Vec2.SubVV(vB, vD, b2Vec2.s_t0));
          Cdot += (this.m_JwA * wA - this.m_JwC * wC) + (this.m_JwB * wB - this.m_JwD * wD);
          const impulse = -this.m_mass * Cdot;
          this.m_impulse += impulse;
          // vA += (m_mA * impulse) * m_JvAC;
          vA.SelfMulAdd((this.m_mA * impulse), this.m_JvAC);
          wA += this.m_iA * impulse * this.m_JwA;
          // vB += (m_mB * impulse) * m_JvBD;
          vB.SelfMulAdd((this.m_mB * impulse), this.m_JvBD);
          wB += this.m_iB * impulse * this.m_JwB;
          // vC -= (m_mC * impulse) * m_JvAC;
          vC.SelfMulSub((this.m_mC * impulse), this.m_JvAC);
          wC -= this.m_iC * impulse * this.m_JwC;
          // vD -= (m_mD * impulse) * m_JvBD;
          vD.SelfMulSub((this.m_mD * impulse), this.m_JvBD);
          wD -= this.m_iD * impulse * this.m_JwD;
          // data.velocities[this.m_indexA].v = vA;
          data.velocities[this.m_indexA].w = wA;
          // data.velocities[this.m_indexB].v = vB;
          data.velocities[this.m_indexB].w = wB;
          // data.velocities[this.m_indexC].v = vC;
          data.velocities[this.m_indexC].w = wC;
          // data.velocities[this.m_indexD].v = vD;
          data.velocities[this.m_indexD].w = wD;
      }
      SolvePositionConstraints(data) {
          const cA = data.positions[this.m_indexA].c;
          let aA = data.positions[this.m_indexA].a;
          const cB = data.positions[this.m_indexB].c;
          let aB = data.positions[this.m_indexB].a;
          const cC = data.positions[this.m_indexC].c;
          let aC = data.positions[this.m_indexC].a;
          const cD = data.positions[this.m_indexD].c;
          let aD = data.positions[this.m_indexD].a;
          // b2Rot qA(aA), qB(aB), qC(aC), qD(aD);
          const qA = this.m_qA.SetAngle(aA), qB = this.m_qB.SetAngle(aB), qC = this.m_qC.SetAngle(aC), qD = this.m_qD.SetAngle(aD);
          const linearError = 0;
          let coordinateA, coordinateB;
          const JvAC = this.m_JvAC, JvBD = this.m_JvBD;
          let JwA, JwB, JwC, JwD;
          let mass = 0;
          if (this.m_typeA === exports.b2JointType.e_revoluteJoint) {
              JvAC.SetZero();
              JwA = 1;
              JwC = 1;
              mass += this.m_iA + this.m_iC;
              coordinateA = aA - aC - this.m_referenceAngleA;
          }
          else {
              // b2Vec2 u = b2Mul(qC, m_localAxisC);
              const u = b2Rot.MulRV(qC, this.m_localAxisC, b2GearJoint.SolvePositionConstraints_s_u);
              // b2Vec2 rC = b2Mul(qC, m_localAnchorC - m_lcC);
              const rC = b2Rot.MulRV(qC, this.m_lalcC, b2GearJoint.SolvePositionConstraints_s_rC);
              // b2Vec2 rA = b2Mul(qA, m_localAnchorA - m_lcA);
              const rA = b2Rot.MulRV(qA, this.m_lalcA, b2GearJoint.SolvePositionConstraints_s_rA);
              // JvAC = u;
              JvAC.Copy(u);
              // JwC = b2Cross(rC, u);
              JwC = b2Vec2.CrossVV(rC, u);
              // JwA = b2Cross(rA, u);
              JwA = b2Vec2.CrossVV(rA, u);
              mass += this.m_mC + this.m_mA + this.m_iC * JwC * JwC + this.m_iA * JwA * JwA;
              // b2Vec2 pC = m_localAnchorC - m_lcC;
              const pC = this.m_lalcC;
              // b2Vec2 pA = b2MulT(qC, rA + (cA - cC));
              const pA = b2Rot.MulTRV(qC, b2Vec2.AddVV(rA, b2Vec2.SubVV(cA, cC, b2Vec2.s_t0), b2Vec2.s_t0), b2Vec2.s_t0); // pA uses s_t0
              // coordinateA = b2Dot(pA - pC, m_localAxisC);
              coordinateA = b2Vec2.DotVV(b2Vec2.SubVV(pA, pC, b2Vec2.s_t0), this.m_localAxisC);
          }
          if (this.m_typeB === exports.b2JointType.e_revoluteJoint) {
              JvBD.SetZero();
              JwB = this.m_ratio;
              JwD = this.m_ratio;
              mass += this.m_ratio * this.m_ratio * (this.m_iB + this.m_iD);
              coordinateB = aB - aD - this.m_referenceAngleB;
          }
          else {
              // b2Vec2 u = b2Mul(qD, m_localAxisD);
              const u = b2Rot.MulRV(qD, this.m_localAxisD, b2GearJoint.SolvePositionConstraints_s_u);
              // b2Vec2 rD = b2Mul(qD, m_localAnchorD - m_lcD);
              const rD = b2Rot.MulRV(qD, this.m_lalcD, b2GearJoint.SolvePositionConstraints_s_rD);
              // b2Vec2 rB = b2Mul(qB, m_localAnchorB - m_lcB);
              const rB = b2Rot.MulRV(qB, this.m_lalcB, b2GearJoint.SolvePositionConstraints_s_rB);
              // JvBD = m_ratio * u;
              b2Vec2.MulSV(this.m_ratio, u, JvBD);
              // JwD = m_ratio * b2Cross(rD, u);
              JwD = this.m_ratio * b2Vec2.CrossVV(rD, u);
              // JwB = m_ratio * b2Cross(rB, u);
              JwB = this.m_ratio * b2Vec2.CrossVV(rB, u);
              mass += this.m_ratio * this.m_ratio * (this.m_mD + this.m_mB) + this.m_iD * JwD * JwD + this.m_iB * JwB * JwB;
              // b2Vec2 pD = m_localAnchorD - m_lcD;
              const pD = this.m_lalcD;
              // b2Vec2 pB = b2MulT(qD, rB + (cB - cD));
              const pB = b2Rot.MulTRV(qD, b2Vec2.AddVV(rB, b2Vec2.SubVV(cB, cD, b2Vec2.s_t0), b2Vec2.s_t0), b2Vec2.s_t0); // pB uses s_t0
              // coordinateB = b2Dot(pB - pD, m_localAxisD);
              coordinateB = b2Vec2.DotVV(b2Vec2.SubVV(pB, pD, b2Vec2.s_t0), this.m_localAxisD);
          }
          const C = (coordinateA + this.m_ratio * coordinateB) - this.m_constant;
          let impulse = 0;
          if (mass > 0) {
              impulse = -C / mass;
          }
          // cA += m_mA * impulse * JvAC;
          cA.SelfMulAdd(this.m_mA * impulse, JvAC);
          aA += this.m_iA * impulse * JwA;
          // cB += m_mB * impulse * JvBD;
          cB.SelfMulAdd(this.m_mB * impulse, JvBD);
          aB += this.m_iB * impulse * JwB;
          // cC -= m_mC * impulse * JvAC;
          cC.SelfMulSub(this.m_mC * impulse, JvAC);
          aC -= this.m_iC * impulse * JwC;
          // cD -= m_mD * impulse * JvBD;
          cD.SelfMulSub(this.m_mD * impulse, JvBD);
          aD -= this.m_iD * impulse * JwD;
          // data.positions[this.m_indexA].c = cA;
          data.positions[this.m_indexA].a = aA;
          // data.positions[this.m_indexB].c = cB;
          data.positions[this.m_indexB].a = aB;
          // data.positions[this.m_indexC].c = cC;
          data.positions[this.m_indexC].a = aC;
          // data.positions[this.m_indexD].c = cD;
          data.positions[this.m_indexD].a = aD;
          // TODO_ERIN not implemented
          return linearError < b2_linearSlop;
      }
      GetAnchorA(out) {
          return this.m_bodyA.GetWorldPoint(this.m_localAnchorA, out);
      }
      GetAnchorB(out) {
          return this.m_bodyB.GetWorldPoint(this.m_localAnchorB, out);
      }
      GetReactionForce(inv_dt, out) {
          // b2Vec2 P = m_impulse * m_JvAC;
          // return inv_dt * P;
          return b2Vec2.MulSV(inv_dt * this.m_impulse, this.m_JvAC, out);
      }
      GetReactionTorque(inv_dt) {
          // float32 L = m_impulse * m_JwA;
          // return inv_dt * L;
          return inv_dt * this.m_impulse * this.m_JwA;
      }
      GetJoint1() { return this.m_joint1; }
      GetJoint2() { return this.m_joint2; }
      GetRatio() {
          return this.m_ratio;
      }
      SetRatio(ratio) {
          // DEBUG: b2Assert(b2IsValid(ratio));
          this.m_ratio = ratio;
      }
      Dump(log) {
          const indexA = this.m_bodyA.m_islandIndex;
          const indexB = this.m_bodyB.m_islandIndex;
          const index1 = this.m_joint1.m_index;
          const index2 = this.m_joint2.m_index;
          log("  const jd: b2GearJointDef = new b2GearJointDef();\n");
          log("  jd.bodyA = bodies[%d];\n", indexA);
          log("  jd.bodyB = bodies[%d];\n", indexB);
          log("  jd.collideConnected = %s;\n", (this.m_collideConnected) ? ("true") : ("false"));
          log("  jd.joint1 = joints[%d];\n", index1);
          log("  jd.joint2 = joints[%d];\n", index2);
          log("  jd.ratio = %.15f;\n", this.m_ratio);
          log("  joints[%d] = this.m_world.CreateJoint(jd);\n", this.m_index);
      }
  }
  b2GearJoint.InitVelocityConstraints_s_u = new b2Vec2();
  b2GearJoint.InitVelocityConstraints_s_rA = new b2Vec2();
  b2GearJoint.InitVelocityConstraints_s_rB = new b2Vec2();
  b2GearJoint.InitVelocityConstraints_s_rC = new b2Vec2();
  b2GearJoint.InitVelocityConstraints_s_rD = new b2Vec2();
  b2GearJoint.SolvePositionConstraints_s_u = new b2Vec2();
  b2GearJoint.SolvePositionConstraints_s_rA = new b2Vec2();
  b2GearJoint.SolvePositionConstraints_s_rB = new b2Vec2();
  b2GearJoint.SolvePositionConstraints_s_rC = new b2Vec2();
  b2GearJoint.SolvePositionConstraints_s_rD = new b2Vec2();

  /*
  * Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  /*
  Position Correction Notes
  =========================
  I tried the several algorithms for position correction of the 2D revolute joint.
  I looked at these systems:
  - simple pendulum (1m diameter sphere on massless 5m stick) with initial angular velocity of 100 rad/s.
  - suspension bridge with 30 1m long planks of length 1m.
  - multi-link chain with 30 1m long links.

  Here are the algorithms:

  Baumgarte - A fraction of the position error is added to the velocity error. There is no
  separate position solver.

  Pseudo Velocities - After the velocity solver and position integration,
  the position error, Jacobian, and effective mass are recomputed. Then
  the velocity constraints are solved with pseudo velocities and a fraction
  of the position error is added to the pseudo velocity error. The pseudo
  velocities are initialized to zero and there is no warm-starting. After
  the position solver, the pseudo velocities are added to the positions.
  This is also called the First Order World method or the Position LCP method.

  Modified Nonlinear Gauss-Seidel (NGS) - Like Pseudo Velocities except the
  position error is re-computed for each constraint and the positions are updated
  after the constraint is solved. The radius vectors (aka Jacobians) are
  re-computed too (otherwise the algorithm has horrible instability). The pseudo
  velocity states are not needed because they are effectively zero at the beginning
  of each iteration. Since we have the current position error, we allow the
  iterations to terminate early if the error becomes smaller than b2_linearSlop.

  Full NGS or just NGS - Like Modified NGS except the effective mass are re-computed
  each time a constraint is solved.

  Here are the results:
  Baumgarte - this is the cheapest algorithm but it has some stability problems,
  especially with the bridge. The chain links separate easily close to the root
  and they jitter as they struggle to pull together. This is one of the most common
  methods in the field. The big drawback is that the position correction artificially
  affects the momentum, thus leading to instabilities and false bounce. I used a
  bias factor of 0.2. A larger bias factor makes the bridge less stable, a smaller
  factor makes joints and contacts more spongy.

  Pseudo Velocities - the is more stable than the Baumgarte method. The bridge is
  stable. However, joints still separate with large angular velocities. Drag the
  simple pendulum in a circle quickly and the joint will separate. The chain separates
  easily and does not recover. I used a bias factor of 0.2. A larger value lead to
  the bridge collapsing when a heavy cube drops on it.

  Modified NGS - this algorithm is better in some ways than Baumgarte and Pseudo
  Velocities, but in other ways it is worse. The bridge and chain are much more
  stable, but the simple pendulum goes unstable at high angular velocities.

  Full NGS - stable in all tests. The joints display good stiffness. The bridge
  still sags, but this is better than infinite forces.

  Recommendations
  Pseudo Velocities are not really worthwhile because the bridge and chain cannot
  recover from joint separation. In other cases the benefit over Baumgarte is small.

  Modified NGS is not a robust method for the revolute joint due to the violent
  instability seen in the simple pendulum. Perhaps it is viable with other constraint
  types, especially scalar constraints where the effective mass is a scalar.

  This leaves Baumgarte and Full NGS. Baumgarte has small, but manageable instabilities
  and is very fast. I don't think we can escape Baumgarte, especially in highly
  demanding cases where high constraint fidelity is not needed.

  Full NGS is robust and easy on the eyes. I recommend this as an option for
  higher fidelity simulation and certainly for suspension bridges and long chains.
  Full NGS might be a good choice for ragdolls, especially motorized ragdolls where
  joint separation can be problematic. The number of NGS iterations can be reduced
  for better performance without harming robustness much.

  Each joint in a can be handled differently in the position solver. So I recommend
  a system where the user can select the algorithm on a per joint basis. I would
  probably default to the slower Full NGS and let the user select the faster
  Baumgarte method in performance critical scenarios.
  */
  /*
  Cache Performance

  The Box2D solvers are dominated by cache misses. Data structures are designed
  to increase the number of cache hits. Much of misses are due to random access
  to body data. The constraint structures are iterated over linearly, which leads
  to few cache misses.

  The bodies are not accessed during iteration. Instead read only data, such as
  the mass values are stored with the constraints. The mutable data are the constraint
  impulses and the bodies velocities/positions. The impulses are held inside the
  constraint structures. The body velocities/positions are held in compact, temporary
  arrays to increase the number of cache hits. Linear and angular velocity are
  stored in a single array since multiple arrays lead to multiple misses.
  */
  /*
  2D Rotation

  R = [cos(theta) -sin(theta)]
      [sin(theta) cos(theta) ]

  thetaDot = omega

  Let q1 = cos(theta), q2 = sin(theta).
  R = [q1 -q2]
      [q2  q1]

  q1Dot = -thetaDot * q2
  q2Dot = thetaDot * q1

  q1_new = q1_old - dt * w * q2
  q2_new = q2_old + dt * w * q1
  then normalize.

  This might be faster than computing sin+cos.
  However, we can compute sin+cos of the same angle fast.
  */
  class b2Island {
      constructor() {
          this.m_bodies = [ /*1024*/]; // TODO: b2Settings
          this.m_contacts = [ /*1024*/]; // TODO: b2Settings
          this.m_joints = [ /*1024*/]; // TODO: b2Settings
          this.m_positions = b2Position.MakeArray(1024); // TODO: b2Settings
          this.m_velocities = b2Velocity.MakeArray(1024); // TODO: b2Settings
          this.m_bodyCount = 0;
          this.m_jointCount = 0;
          this.m_contactCount = 0;
          this.m_bodyCapacity = 0;
          this.m_contactCapacity = 0;
          this.m_jointCapacity = 0;
      }
      Initialize(bodyCapacity, contactCapacity, jointCapacity, listener) {
          this.m_bodyCapacity = bodyCapacity;
          this.m_contactCapacity = contactCapacity;
          this.m_jointCapacity = jointCapacity;
          this.m_bodyCount = 0;
          this.m_contactCount = 0;
          this.m_jointCount = 0;
          this.m_listener = listener;
          // TODO:
          // while (this.m_bodies.length < bodyCapacity) {
          //   this.m_bodies[this.m_bodies.length] = null;
          // }
          // TODO:
          // while (this.m_contacts.length < contactCapacity) {
          //   this.m_contacts[this.m_contacts.length] = null;
          // }
          // TODO:
          // while (this.m_joints.length < jointCapacity) {
          //   this.m_joints[this.m_joints.length] = null;
          // }
          // TODO:
          if (this.m_positions.length < bodyCapacity) {
              const new_length = b2Max(this.m_positions.length * 2, bodyCapacity);
              while (this.m_positions.length < new_length) {
                  this.m_positions[this.m_positions.length] = new b2Position();
              }
          }
          // TODO:
          if (this.m_velocities.length < bodyCapacity) {
              const new_length = b2Max(this.m_velocities.length * 2, bodyCapacity);
              while (this.m_velocities.length < new_length) {
                  this.m_velocities[this.m_velocities.length] = new b2Velocity();
              }
          }
      }
      Clear() {
          this.m_bodyCount = 0;
          this.m_contactCount = 0;
          this.m_jointCount = 0;
      }
      AddBody(body) {
          // DEBUG: b2Assert(this.m_bodyCount < this.m_bodyCapacity);
          body.m_islandIndex = this.m_bodyCount;
          this.m_bodies[this.m_bodyCount++] = body;
      }
      AddContact(contact) {
          // DEBUG: b2Assert(this.m_contactCount < this.m_contactCapacity);
          this.m_contacts[this.m_contactCount++] = contact;
      }
      AddJoint(joint) {
          // DEBUG: b2Assert(this.m_jointCount < this.m_jointCapacity);
          this.m_joints[this.m_jointCount++] = joint;
      }
      Solve(profile, step, gravity, allowSleep) {
          const timer = b2Island.s_timer.Reset();
          const h = step.dt;
          // Integrate velocities and apply damping. Initialize the body state.
          for (let i = 0; i < this.m_bodyCount; ++i) {
              const b = this.m_bodies[i];
              // const c: b2Vec2 =
              this.m_positions[i].c.Copy(b.m_sweep.c);
              const a = b.m_sweep.a;
              const v = this.m_velocities[i].v.Copy(b.m_linearVelocity);
              let w = b.m_angularVelocity;
              // Store positions for continuous collision.
              b.m_sweep.c0.Copy(b.m_sweep.c);
              b.m_sweep.a0 = b.m_sweep.a;
              if (b.m_type === exports.b2BodyType.b2_dynamicBody) {
                  // Integrate velocities.
                  // v += h * b->m_invMass * (b->m_gravityScale * b->m_mass * gravity + b->m_force);
                  v.x += h * b.m_invMass * (b.m_gravityScale * b.m_mass * gravity.x + b.m_force.x);
                  v.y += h * b.m_invMass * (b.m_gravityScale * b.m_mass * gravity.y + b.m_force.y);
                  w += h * b.m_invI * b.m_torque;
                  // Apply damping.
                  // ODE: dv/dt + c * v = 0
                  // Solution: v(t) = v0 * exp(-c * t)
                  // Time step: v(t + dt) = v0 * exp(-c * (t + dt)) = v0 * exp(-c * t) * exp(-c * dt) = v * exp(-c * dt)
                  // v2 = exp(-c * dt) * v1
                  // Pade approximation:
                  // v2 = v1 * 1 / (1 + c * dt)
                  v.SelfMul(1.0 / (1.0 + h * b.m_linearDamping));
                  w *= 1.0 / (1.0 + h * b.m_angularDamping);
              }
              // this.m_positions[i].c = c;
              this.m_positions[i].a = a;
              // this.m_velocities[i].v = v;
              this.m_velocities[i].w = w;
          }
          timer.Reset();
          // Solver data
          const solverData = b2Island.s_solverData;
          solverData.step.Copy(step);
          solverData.positions = this.m_positions;
          solverData.velocities = this.m_velocities;
          // Initialize velocity constraints.
          const contactSolverDef = b2Island.s_contactSolverDef;
          contactSolverDef.step.Copy(step);
          contactSolverDef.contacts = this.m_contacts;
          contactSolverDef.count = this.m_contactCount;
          contactSolverDef.positions = this.m_positions;
          contactSolverDef.velocities = this.m_velocities;
          const contactSolver = b2Island.s_contactSolver.Initialize(contactSolverDef);
          contactSolver.InitializeVelocityConstraints();
          if (step.warmStarting) {
              contactSolver.WarmStart();
          }
          for (let i = 0; i < this.m_jointCount; ++i) {
              this.m_joints[i].InitVelocityConstraints(solverData);
          }
          profile.solveInit = timer.GetMilliseconds();
          // Solve velocity constraints.
          timer.Reset();
          for (let i = 0; i < step.velocityIterations; ++i) {
              for (let j = 0; j < this.m_jointCount; ++j) {
                  this.m_joints[j].SolveVelocityConstraints(solverData);
              }
              contactSolver.SolveVelocityConstraints();
          }
          // Store impulses for warm starting
          contactSolver.StoreImpulses();
          profile.solveVelocity = timer.GetMilliseconds();
          // Integrate positions.
          for (let i = 0; i < this.m_bodyCount; ++i) {
              const c = this.m_positions[i].c;
              let a = this.m_positions[i].a;
              const v = this.m_velocities[i].v;
              let w = this.m_velocities[i].w;
              // Check for large velocities
              const translation = b2Vec2.MulSV(h, v, b2Island.s_translation);
              if (b2Vec2.DotVV(translation, translation) > b2_maxTranslationSquared) {
                  const ratio = b2_maxTranslation / translation.Length();
                  v.SelfMul(ratio);
              }
              const rotation = h * w;
              if (rotation * rotation > b2_maxRotationSquared) {
                  const ratio = b2_maxRotation / b2Abs(rotation);
                  w *= ratio;
              }
              // Integrate
              c.x += h * v.x;
              c.y += h * v.y;
              a += h * w;
              // this.m_positions[i].c = c;
              this.m_positions[i].a = a;
              // this.m_velocities[i].v = v;
              this.m_velocities[i].w = w;
          }
          // Solve position constraints
          timer.Reset();
          let positionSolved = false;
          for (let i = 0; i < step.positionIterations; ++i) {
              const contactsOkay = contactSolver.SolvePositionConstraints();
              let jointsOkay = true;
              for (let j = 0; j < this.m_jointCount; ++j) {
                  const jointOkay = this.m_joints[j].SolvePositionConstraints(solverData);
                  jointsOkay = jointsOkay && jointOkay;
              }
              if (contactsOkay && jointsOkay) {
                  // Exit early if the position errors are small.
                  positionSolved = true;
                  break;
              }
          }
          // Copy state buffers back to the bodies
          for (let i = 0; i < this.m_bodyCount; ++i) {
              const body = this.m_bodies[i];
              body.m_sweep.c.Copy(this.m_positions[i].c);
              body.m_sweep.a = this.m_positions[i].a;
              body.m_linearVelocity.Copy(this.m_velocities[i].v);
              body.m_angularVelocity = this.m_velocities[i].w;
              body.SynchronizeTransform();
          }
          profile.solvePosition = timer.GetMilliseconds();
          this.Report(contactSolver.m_velocityConstraints);
          if (allowSleep) {
              let minSleepTime = b2_maxFloat;
              const linTolSqr = b2_linearSleepTolerance * b2_linearSleepTolerance;
              const angTolSqr = b2_angularSleepTolerance * b2_angularSleepTolerance;
              for (let i = 0; i < this.m_bodyCount; ++i) {
                  const b = this.m_bodies[i];
                  if (b.GetType() === exports.b2BodyType.b2_staticBody) {
                      continue;
                  }
                  if (!b.m_autoSleepFlag ||
                      b.m_angularVelocity * b.m_angularVelocity > angTolSqr ||
                      b2Vec2.DotVV(b.m_linearVelocity, b.m_linearVelocity) > linTolSqr) {
                      b.m_sleepTime = 0;
                      minSleepTime = 0;
                  }
                  else {
                      b.m_sleepTime += h;
                      minSleepTime = b2Min(minSleepTime, b.m_sleepTime);
                  }
              }
              if (minSleepTime >= b2_timeToSleep && positionSolved) {
                  for (let i = 0; i < this.m_bodyCount; ++i) {
                      const b = this.m_bodies[i];
                      b.SetAwake(false);
                  }
              }
          }
      }
      SolveTOI(subStep, toiIndexA, toiIndexB) {
          // DEBUG: b2Assert(toiIndexA < this.m_bodyCount);
          // DEBUG: b2Assert(toiIndexB < this.m_bodyCount);
          // Initialize the body state.
          for (let i = 0; i < this.m_bodyCount; ++i) {
              const b = this.m_bodies[i];
              this.m_positions[i].c.Copy(b.m_sweep.c);
              this.m_positions[i].a = b.m_sweep.a;
              this.m_velocities[i].v.Copy(b.m_linearVelocity);
              this.m_velocities[i].w = b.m_angularVelocity;
          }
          const contactSolverDef = b2Island.s_contactSolverDef;
          contactSolverDef.contacts = this.m_contacts;
          contactSolverDef.count = this.m_contactCount;
          contactSolverDef.step.Copy(subStep);
          contactSolverDef.positions = this.m_positions;
          contactSolverDef.velocities = this.m_velocities;
          const contactSolver = b2Island.s_contactSolver.Initialize(contactSolverDef);
          // Solve position constraints.
          for (let i = 0; i < subStep.positionIterations; ++i) {
              const contactsOkay = contactSolver.SolveTOIPositionConstraints(toiIndexA, toiIndexB);
              if (contactsOkay) {
                  break;
              }
          }
          /*
          #if 0
            // Is the new position really safe?
            for (int32 i = 0; i < this.m_contactCount; ++i) {
              b2Contact* c = this.m_contacts[i];
              b2Fixture* fA = c.GetFixtureA();
              b2Fixture* fB = c.GetFixtureB();
        
              b2Body* bA = fA.GetBody();
              b2Body* bB = fB.GetBody();
        
              int32 indexA = c.GetChildIndexA();
              int32 indexB = c.GetChildIndexB();
        
              b2DistanceInput input;
              input.proxyA.Set(fA.GetShape(), indexA);
              input.proxyB.Set(fB.GetShape(), indexB);
              input.transformA = bA.GetTransform();
              input.transformB = bB.GetTransform();
              input.useRadii = false;
        
              b2DistanceOutput output;
              b2SimplexCache cache;
              cache.count = 0;
              b2Distance(&output, &cache, &input);
        
              if (output.distance === 0 || cache.count === 3) {
                cache.count += 0;
              }
            }
          #endif
          */
          // Leap of faith to new safe state.
          this.m_bodies[toiIndexA].m_sweep.c0.Copy(this.m_positions[toiIndexA].c);
          this.m_bodies[toiIndexA].m_sweep.a0 = this.m_positions[toiIndexA].a;
          this.m_bodies[toiIndexB].m_sweep.c0.Copy(this.m_positions[toiIndexB].c);
          this.m_bodies[toiIndexB].m_sweep.a0 = this.m_positions[toiIndexB].a;
          // No warm starting is needed for TOI events because warm
          // starting impulses were applied in the discrete solver.
          contactSolver.InitializeVelocityConstraints();
          // Solve velocity constraints.
          for (let i = 0; i < subStep.velocityIterations; ++i) {
              contactSolver.SolveVelocityConstraints();
          }
          // Don't store the TOI contact forces for warm starting
          // because they can be quite large.
          const h = subStep.dt;
          // Integrate positions
          for (let i = 0; i < this.m_bodyCount; ++i) {
              const c = this.m_positions[i].c;
              let a = this.m_positions[i].a;
              const v = this.m_velocities[i].v;
              let w = this.m_velocities[i].w;
              // Check for large velocities
              const translation = b2Vec2.MulSV(h, v, b2Island.s_translation);
              if (b2Vec2.DotVV(translation, translation) > b2_maxTranslationSquared) {
                  const ratio = b2_maxTranslation / translation.Length();
                  v.SelfMul(ratio);
              }
              const rotation = h * w;
              if (rotation * rotation > b2_maxRotationSquared) {
                  const ratio = b2_maxRotation / b2Abs(rotation);
                  w *= ratio;
              }
              // Integrate
              c.SelfMulAdd(h, v);
              a += h * w;
              // this.m_positions[i].c = c;
              this.m_positions[i].a = a;
              // this.m_velocities[i].v = v;
              this.m_velocities[i].w = w;
              // Sync bodies
              const body = this.m_bodies[i];
              body.m_sweep.c.Copy(c);
              body.m_sweep.a = a;
              body.m_linearVelocity.Copy(v);
              body.m_angularVelocity = w;
              body.SynchronizeTransform();
          }
          this.Report(contactSolver.m_velocityConstraints);
      }
      Report(constraints) {
          if (this.m_listener === null) {
              return;
          }
          for (let i = 0; i < this.m_contactCount; ++i) {
              const c = this.m_contacts[i];
              if (!c) {
                  continue;
              }
              const vc = constraints[i];
              const impulse = b2Island.s_impulse;
              impulse.count = vc.pointCount;
              for (let j = 0; j < vc.pointCount; ++j) {
                  impulse.normalImpulses[j] = vc.points[j].normalImpulse;
                  impulse.tangentImpulses[j] = vc.points[j].tangentImpulse;
              }
              this.m_listener.PostSolve(c, impulse);
          }
      }
  }
  b2Island.s_timer = new b2Timer();
  b2Island.s_solverData = new b2SolverData();
  b2Island.s_contactSolverDef = new b2ContactSolverDef();
  b2Island.s_contactSolver = new b2ContactSolver();
  b2Island.s_translation = new b2Vec2();
  b2Island.s_impulse = new b2ContactImpulse();

  /*
  * Copyright (c) 2006-2012 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  class b2MotorJointDef extends b2JointDef {
      constructor() {
          super(exports.b2JointType.e_motorJoint);
          this.linearOffset = new b2Vec2(0, 0);
          this.angularOffset = 0;
          this.maxForce = 1;
          this.maxTorque = 1;
          this.correctionFactor = 0.3;
      }
      Initialize(bA, bB) {
          this.bodyA = bA;
          this.bodyB = bB;
          // b2Vec2 xB = bodyB->GetPosition();
          // linearOffset = bodyA->GetLocalPoint(xB);
          this.bodyA.GetLocalPoint(this.bodyB.GetPosition(), this.linearOffset);
          const angleA = this.bodyA.GetAngle();
          const angleB = this.bodyB.GetAngle();
          this.angularOffset = angleB - angleA;
      }
  }
  class b2MotorJoint extends b2Joint {
      constructor(def) {
          super(def);
          // Solver shared
          this.m_linearOffset = new b2Vec2();
          this.m_angularOffset = 0;
          this.m_linearImpulse = new b2Vec2();
          this.m_angularImpulse = 0;
          this.m_maxForce = 0;
          this.m_maxTorque = 0;
          this.m_correctionFactor = 0.3;
          // Solver temp
          this.m_indexA = 0;
          this.m_indexB = 0;
          this.m_rA = new b2Vec2();
          this.m_rB = new b2Vec2();
          this.m_localCenterA = new b2Vec2();
          this.m_localCenterB = new b2Vec2();
          this.m_linearError = new b2Vec2();
          this.m_angularError = 0;
          this.m_invMassA = 0;
          this.m_invMassB = 0;
          this.m_invIA = 0;
          this.m_invIB = 0;
          this.m_linearMass = new b2Mat22();
          this.m_angularMass = 0;
          this.m_qA = new b2Rot();
          this.m_qB = new b2Rot();
          this.m_K = new b2Mat22();
          this.m_linearOffset.Copy(b2Maybe(def.linearOffset, b2Vec2.ZERO));
          this.m_angularOffset = b2Maybe(def.angularOffset, 0);
          this.m_linearImpulse.SetZero();
          this.m_maxForce = b2Maybe(def.maxForce, 0);
          this.m_maxTorque = b2Maybe(def.maxTorque, 0);
          this.m_correctionFactor = b2Maybe(def.correctionFactor, 0.3);
      }
      GetAnchorA(out) {
          const pos = this.m_bodyA.GetPosition();
          out.x = pos.x;
          out.y = pos.y;
          return out;
      }
      GetAnchorB(out) {
          const pos = this.m_bodyB.GetPosition();
          out.x = pos.x;
          out.y = pos.y;
          return out;
      }
      GetReactionForce(inv_dt, out) {
          // return inv_dt * m_linearImpulse;
          return b2Vec2.MulSV(inv_dt, this.m_linearImpulse, out);
      }
      GetReactionTorque(inv_dt) {
          return inv_dt * this.m_angularImpulse;
      }
      SetLinearOffset(linearOffset) {
          if (!b2Vec2.IsEqualToV(linearOffset, this.m_linearOffset)) {
              this.m_bodyA.SetAwake(true);
              this.m_bodyB.SetAwake(true);
              this.m_linearOffset.Copy(linearOffset);
          }
      }
      GetLinearOffset() {
          return this.m_linearOffset;
      }
      SetAngularOffset(angularOffset) {
          if (angularOffset !== this.m_angularOffset) {
              this.m_bodyA.SetAwake(true);
              this.m_bodyB.SetAwake(true);
              this.m_angularOffset = angularOffset;
          }
      }
      GetAngularOffset() {
          return this.m_angularOffset;
      }
      SetMaxForce(force) {
          // DEBUG: b2Assert(b2IsValid(force) && force >= 0);
          this.m_maxForce = force;
      }
      GetMaxForce() {
          return this.m_maxForce;
      }
      SetMaxTorque(torque) {
          // DEBUG: b2Assert(b2IsValid(torque) && torque >= 0);
          this.m_maxTorque = torque;
      }
      GetMaxTorque() {
          return this.m_maxTorque;
      }
      InitVelocityConstraints(data) {
          this.m_indexA = this.m_bodyA.m_islandIndex;
          this.m_indexB = this.m_bodyB.m_islandIndex;
          this.m_localCenterA.Copy(this.m_bodyA.m_sweep.localCenter);
          this.m_localCenterB.Copy(this.m_bodyB.m_sweep.localCenter);
          this.m_invMassA = this.m_bodyA.m_invMass;
          this.m_invMassB = this.m_bodyB.m_invMass;
          this.m_invIA = this.m_bodyA.m_invI;
          this.m_invIB = this.m_bodyB.m_invI;
          const cA = data.positions[this.m_indexA].c;
          const aA = data.positions[this.m_indexA].a;
          const vA = data.velocities[this.m_indexA].v;
          let wA = data.velocities[this.m_indexA].w;
          const cB = data.positions[this.m_indexB].c;
          const aB = data.positions[this.m_indexB].a;
          const vB = data.velocities[this.m_indexB].v;
          let wB = data.velocities[this.m_indexB].w;
          const qA = this.m_qA.SetAngle(aA), qB = this.m_qB.SetAngle(aB);
          // Compute the effective mass matrix.
          // this.m_rA = b2Mul(qA, m_linearOffset - this.m_localCenterA);
          const rA = b2Rot.MulRV(qA, b2Vec2.SubVV(this.m_linearOffset, this.m_localCenterA, b2Vec2.s_t0), this.m_rA);
          // this.m_rB = b2Mul(qB, -this.m_localCenterB);
          const rB = b2Rot.MulRV(qB, b2Vec2.NegV(this.m_localCenterB, b2Vec2.s_t0), this.m_rB);
          // J = [-I -r1_skew I r2_skew]
          // r_skew = [-ry; rx]
          // Matlab
          // K = [ mA+r1y^2*iA+mB+r2y^2*iB,  -r1y*iA*r1x-r2y*iB*r2x,          -r1y*iA-r2y*iB]
          //     [  -r1y*iA*r1x-r2y*iB*r2x, mA+r1x^2*iA+mB+r2x^2*iB,           r1x*iA+r2x*iB]
          //     [          -r1y*iA-r2y*iB,           r1x*iA+r2x*iB,                   iA+iB]
          const mA = this.m_invMassA, mB = this.m_invMassB;
          const iA = this.m_invIA, iB = this.m_invIB;
          // Upper 2 by 2 of K for point to point
          const K = this.m_K;
          K.ex.x = mA + mB + iA * rA.y * rA.y + iB * rB.y * rB.y;
          K.ex.y = -iA * rA.x * rA.y - iB * rB.x * rB.y;
          K.ey.x = K.ex.y;
          K.ey.y = mA + mB + iA * rA.x * rA.x + iB * rB.x * rB.x;
          // this.m_linearMass = K.GetInverse();
          K.GetInverse(this.m_linearMass);
          this.m_angularMass = iA + iB;
          if (this.m_angularMass > 0) {
              this.m_angularMass = 1 / this.m_angularMass;
          }
          // this.m_linearError = cB + rB - cA - rA;
          b2Vec2.SubVV(b2Vec2.AddVV(cB, rB, b2Vec2.s_t0), b2Vec2.AddVV(cA, rA, b2Vec2.s_t1), this.m_linearError);
          this.m_angularError = aB - aA - this.m_angularOffset;
          if (data.step.warmStarting) {
              // Scale impulses to support a variable time step.
              // this.m_linearImpulse *= data.step.dtRatio;
              this.m_linearImpulse.SelfMul(data.step.dtRatio);
              this.m_angularImpulse *= data.step.dtRatio;
              // b2Vec2 P(this.m_linearImpulse.x, this.m_linearImpulse.y);
              const P = this.m_linearImpulse;
              // vA -= mA * P;
              vA.SelfMulSub(mA, P);
              wA -= iA * (b2Vec2.CrossVV(rA, P) + this.m_angularImpulse);
              // vB += mB * P;
              vB.SelfMulAdd(mB, P);
              wB += iB * (b2Vec2.CrossVV(rB, P) + this.m_angularImpulse);
          }
          else {
              this.m_linearImpulse.SetZero();
              this.m_angularImpulse = 0;
          }
          // data.velocities[this.m_indexA].v = vA; // vA is a reference
          data.velocities[this.m_indexA].w = wA;
          // data.velocities[this.m_indexB].v = vB; // vB is a reference
          data.velocities[this.m_indexB].w = wB;
      }
      SolveVelocityConstraints(data) {
          const vA = data.velocities[this.m_indexA].v;
          let wA = data.velocities[this.m_indexA].w;
          const vB = data.velocities[this.m_indexB].v;
          let wB = data.velocities[this.m_indexB].w;
          const mA = this.m_invMassA, mB = this.m_invMassB;
          const iA = this.m_invIA, iB = this.m_invIB;
          const h = data.step.dt;
          const inv_h = data.step.inv_dt;
          // Solve angular friction
          {
              const Cdot = wB - wA + inv_h * this.m_correctionFactor * this.m_angularError;
              let impulse = -this.m_angularMass * Cdot;
              const oldImpulse = this.m_angularImpulse;
              const maxImpulse = h * this.m_maxTorque;
              this.m_angularImpulse = b2Clamp(this.m_angularImpulse + impulse, -maxImpulse, maxImpulse);
              impulse = this.m_angularImpulse - oldImpulse;
              wA -= iA * impulse;
              wB += iB * impulse;
          }
          // Solve linear friction
          {
              const rA = this.m_rA;
              const rB = this.m_rB;
              // b2Vec2 Cdot = vB + b2Vec2.CrossSV(wB, rB) - vA - b2Vec2.CrossSV(wA, rA) + inv_h * this.m_correctionFactor * this.m_linearError;
              const Cdot_v2 = b2Vec2.AddVV(b2Vec2.SubVV(b2Vec2.AddVV(vB, b2Vec2.CrossSV(wB, rB, b2Vec2.s_t0), b2Vec2.s_t0), b2Vec2.AddVV(vA, b2Vec2.CrossSV(wA, rA, b2Vec2.s_t1), b2Vec2.s_t1), b2Vec2.s_t2), b2Vec2.MulSV(inv_h * this.m_correctionFactor, this.m_linearError, b2Vec2.s_t3), b2MotorJoint.SolveVelocityConstraints_s_Cdot_v2);
              // b2Vec2 impulse = -b2Mul(this.m_linearMass, Cdot);
              const impulse_v2 = b2Mat22.MulMV(this.m_linearMass, Cdot_v2, b2MotorJoint.SolveVelocityConstraints_s_impulse_v2).SelfNeg();
              // b2Vec2 oldImpulse = this.m_linearImpulse;
              const oldImpulse_v2 = b2MotorJoint.SolveVelocityConstraints_s_oldImpulse_v2.Copy(this.m_linearImpulse);
              // this.m_linearImpulse += impulse;
              this.m_linearImpulse.SelfAdd(impulse_v2);
              const maxImpulse = h * this.m_maxForce;
              if (this.m_linearImpulse.LengthSquared() > maxImpulse * maxImpulse) {
                  this.m_linearImpulse.Normalize();
                  // this.m_linearImpulse *= maxImpulse;
                  this.m_linearImpulse.SelfMul(maxImpulse);
              }
              // impulse = this.m_linearImpulse - oldImpulse;
              b2Vec2.SubVV(this.m_linearImpulse, oldImpulse_v2, impulse_v2);
              // vA -= mA * impulse;
              vA.SelfMulSub(mA, impulse_v2);
              // wA -= iA * b2Vec2.CrossVV(rA, impulse);
              wA -= iA * b2Vec2.CrossVV(rA, impulse_v2);
              // vB += mB * impulse;
              vB.SelfMulAdd(mB, impulse_v2);
              // wB += iB * b2Vec2.CrossVV(rB, impulse);
              wB += iB * b2Vec2.CrossVV(rB, impulse_v2);
          }
          // data.velocities[this.m_indexA].v = vA; // vA is a reference
          data.velocities[this.m_indexA].w = wA;
          // data.velocities[this.m_indexB].v = vB; // vB is a reference
          data.velocities[this.m_indexB].w = wB;
      }
      SolvePositionConstraints(data) {
          return true;
      }
      Dump(log) {
          const indexA = this.m_bodyA.m_islandIndex;
          const indexB = this.m_bodyB.m_islandIndex;
          log("  const jd: b2MotorJointDef = new b2MotorJointDef();\n");
          log("  jd.bodyA = bodies[%d];\n", indexA);
          log("  jd.bodyB = bodies[%d];\n", indexB);
          log("  jd.collideConnected = %s;\n", (this.m_collideConnected) ? ("true") : ("false"));
          log("  jd.linearOffset.Set(%.15f, %.15f);\n", this.m_linearOffset.x, this.m_linearOffset.y);
          log("  jd.angularOffset = %.15f;\n", this.m_angularOffset);
          log("  jd.maxForce = %.15f;\n", this.m_maxForce);
          log("  jd.maxTorque = %.15f;\n", this.m_maxTorque);
          log("  jd.correctionFactor = %.15f;\n", this.m_correctionFactor);
          log("  joints[%d] = this.m_world.CreateJoint(jd);\n", this.m_index);
      }
  }
  b2MotorJoint.SolveVelocityConstraints_s_Cdot_v2 = new b2Vec2();
  b2MotorJoint.SolveVelocityConstraints_s_impulse_v2 = new b2Vec2();
  b2MotorJoint.SolveVelocityConstraints_s_oldImpulse_v2 = new b2Vec2();

  /*
  * Copyright (c) 2006-2007 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  /// Mouse joint definition. This requires a world target point,
  /// tuning parameters, and the time step.
  class b2MouseJointDef extends b2JointDef {
      constructor() {
          super(exports.b2JointType.e_mouseJoint);
          this.target = new b2Vec2();
          this.maxForce = 0;
          this.stiffness = 5;
          this.damping = 0.7;
      }
  }
  class b2MouseJoint extends b2Joint {
      constructor(def) {
          super(def);
          this.m_localAnchorB = new b2Vec2();
          this.m_targetA = new b2Vec2();
          this.m_stiffness = 0;
          this.m_damping = 0;
          this.m_beta = 0;
          // Solver shared
          this.m_impulse = new b2Vec2();
          this.m_maxForce = 0;
          this.m_gamma = 0;
          // Solver temp
          this.m_indexA = 0;
          this.m_indexB = 0;
          this.m_rB = new b2Vec2();
          this.m_localCenterB = new b2Vec2();
          this.m_invMassB = 0;
          this.m_invIB = 0;
          this.m_mass = new b2Mat22();
          this.m_C = new b2Vec2();
          this.m_qB = new b2Rot();
          this.m_lalcB = new b2Vec2();
          this.m_K = new b2Mat22();
          this.m_targetA.Copy(b2Maybe(def.target, b2Vec2.ZERO));
          // DEBUG: b2Assert(this.m_targetA.IsValid());
          b2Transform.MulTXV(this.m_bodyB.GetTransform(), this.m_targetA, this.m_localAnchorB);
          this.m_maxForce = b2Maybe(def.maxForce, 0);
          // DEBUG: b2Assert(b2IsValid(this.m_maxForce) && this.m_maxForce >= 0);
          this.m_impulse.SetZero();
          this.m_stiffness = b2Maybe(def.stiffness, 0);
          // DEBUG: b2Assert(b2IsValid(this.m_stiffness) && this.m_stiffness >= 0);
          this.m_damping = b2Maybe(def.damping, 0);
          // DEBUG: b2Assert(b2IsValid(this.m_damping) && this.m_damping >= 0);
          this.m_beta = 0;
          this.m_gamma = 0;
      }
      SetTarget(target) {
          if (!this.m_bodyB.IsAwake()) {
              this.m_bodyB.SetAwake(true);
          }
          this.m_targetA.Copy(target);
      }
      GetTarget() {
          return this.m_targetA;
      }
      SetMaxForce(maxForce) {
          this.m_maxForce = maxForce;
      }
      GetMaxForce() {
          return this.m_maxForce;
      }
      SetStiffness(stiffness) {
          this.m_stiffness = stiffness;
      }
      GetStiffness() {
          return this.m_stiffness;
      }
      SetDamping(damping) {
          this.m_damping = damping;
      }
      GetDamping() {
          return this.m_damping;
      }
      InitVelocityConstraints(data) {
          this.m_indexB = this.m_bodyB.m_islandIndex;
          this.m_localCenterB.Copy(this.m_bodyB.m_sweep.localCenter);
          this.m_invMassB = this.m_bodyB.m_invMass;
          this.m_invIB = this.m_bodyB.m_invI;
          const cB = data.positions[this.m_indexB].c;
          const aB = data.positions[this.m_indexB].a;
          const vB = data.velocities[this.m_indexB].v;
          let wB = data.velocities[this.m_indexB].w;
          const qB = this.m_qB.SetAngle(aB);
          const mass = this.m_bodyB.GetMass();
          // Frequency
          const omega = 2 * b2_pi * this.m_stiffness;
          // Damping coefficient
          const d = 2 * mass * this.m_damping * omega;
          // Spring stiffness
          const k = mass * (omega * omega);
          // magic formulas
          // gamma has units of inverse mass.
          // beta has units of inverse time.
          const h = data.step.dt;
          this.m_gamma = h * (d + h * k);
          if (this.m_gamma !== 0) {
              this.m_gamma = 1 / this.m_gamma;
          }
          this.m_beta = h * k * this.m_gamma;
          // Compute the effective mass matrix.
          b2Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
          b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);
          // K    = [(1/m1 + 1/m2) * eye(2) - skew(r1) * invI1 * skew(r1) - skew(r2) * invI2 * skew(r2)]
          //      = [1/m1+1/m2     0    ] + invI1 * [r1.y*r1.y -r1.x*r1.y] + invI2 * [r1.y*r1.y -r1.x*r1.y]
          //        [    0     1/m1+1/m2]           [-r1.x*r1.y r1.x*r1.x]           [-r1.x*r1.y r1.x*r1.x]
          const K = this.m_K;
          K.ex.x = this.m_invMassB + this.m_invIB * this.m_rB.y * this.m_rB.y + this.m_gamma;
          K.ex.y = -this.m_invIB * this.m_rB.x * this.m_rB.y;
          K.ey.x = K.ex.y;
          K.ey.y = this.m_invMassB + this.m_invIB * this.m_rB.x * this.m_rB.x + this.m_gamma;
          K.GetInverse(this.m_mass);
          // m_C = cB + m_rB - m_targetA;
          this.m_C.x = cB.x + this.m_rB.x - this.m_targetA.x;
          this.m_C.y = cB.y + this.m_rB.y - this.m_targetA.y;
          // m_C *= m_beta;
          this.m_C.SelfMul(this.m_beta);
          // Cheat with some damping
          wB *= 0.98;
          if (data.step.warmStarting) {
              this.m_impulse.SelfMul(data.step.dtRatio);
              // vB += m_invMassB * m_impulse;
              vB.x += this.m_invMassB * this.m_impulse.x;
              vB.y += this.m_invMassB * this.m_impulse.y;
              wB += this.m_invIB * b2Vec2.CrossVV(this.m_rB, this.m_impulse);
          }
          else {
              this.m_impulse.SetZero();
          }
          // data.velocities[this.m_indexB].v = vB;
          data.velocities[this.m_indexB].w = wB;
      }
      SolveVelocityConstraints(data) {
          const vB = data.velocities[this.m_indexB].v;
          let wB = data.velocities[this.m_indexB].w;
          // Cdot = v + cross(w, r)
          // b2Vec2 Cdot = vB + b2Cross(wB, m_rB);
          const Cdot = b2Vec2.AddVCrossSV(vB, wB, this.m_rB, b2MouseJoint.SolveVelocityConstraints_s_Cdot);
          //  b2Vec2 impulse = b2Mul(m_mass, -(Cdot + m_C + m_gamma * m_impulse));
          const impulse = b2Mat22.MulMV(this.m_mass, b2Vec2.AddVV(Cdot, b2Vec2.AddVV(this.m_C, b2Vec2.MulSV(this.m_gamma, this.m_impulse, b2Vec2.s_t0), b2Vec2.s_t0), b2Vec2.s_t0).SelfNeg(), b2MouseJoint.SolveVelocityConstraints_s_impulse);
          // b2Vec2 oldImpulse = m_impulse;
          const oldImpulse = b2MouseJoint.SolveVelocityConstraints_s_oldImpulse.Copy(this.m_impulse);
          // m_impulse += impulse;
          this.m_impulse.SelfAdd(impulse);
          const maxImpulse = data.step.dt * this.m_maxForce;
          if (this.m_impulse.LengthSquared() > maxImpulse * maxImpulse) {
              this.m_impulse.SelfMul(maxImpulse / this.m_impulse.Length());
          }
          // impulse = m_impulse - oldImpulse;
          b2Vec2.SubVV(this.m_impulse, oldImpulse, impulse);
          // vB += m_invMassB * impulse;
          vB.SelfMulAdd(this.m_invMassB, impulse);
          wB += this.m_invIB * b2Vec2.CrossVV(this.m_rB, impulse);
          // data.velocities[this.m_indexB].v = vB;
          data.velocities[this.m_indexB].w = wB;
      }
      SolvePositionConstraints(data) {
          return true;
      }
      GetAnchorA(out) {
          out.x = this.m_targetA.x;
          out.y = this.m_targetA.y;
          return out;
      }
      GetAnchorB(out) {
          return this.m_bodyB.GetWorldPoint(this.m_localAnchorB, out);
      }
      GetReactionForce(inv_dt, out) {
          return b2Vec2.MulSV(inv_dt, this.m_impulse, out);
      }
      GetReactionTorque(inv_dt) {
          return 0;
      }
      Dump(log) {
          log("Mouse joint dumping is not supported.\n");
      }
      ShiftOrigin(newOrigin) {
          this.m_targetA.SelfSub(newOrigin);
      }
  }
  b2MouseJoint.SolveVelocityConstraints_s_Cdot = new b2Vec2();
  b2MouseJoint.SolveVelocityConstraints_s_impulse = new b2Vec2();
  b2MouseJoint.SolveVelocityConstraints_s_oldImpulse = new b2Vec2();

  /*
  * Copyright (c) 2006-2011 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  /// Prismatic joint definition. This requires defining a line of
  /// motion using an axis and an anchor point. The definition uses local
  /// anchor points and a local axis so that the initial configuration
  /// can violate the constraint slightly. The joint translation is zero
  /// when the local anchor points coincide in world space. Using local
  /// anchors and a local axis helps when saving and loading a game.
  class b2PrismaticJointDef extends b2JointDef {
      constructor() {
          super(exports.b2JointType.e_prismaticJoint);
          this.localAnchorA = new b2Vec2();
          this.localAnchorB = new b2Vec2();
          this.localAxisA = new b2Vec2(1, 0);
          this.referenceAngle = 0;
          this.enableLimit = false;
          this.lowerTranslation = 0;
          this.upperTranslation = 0;
          this.enableMotor = false;
          this.maxMotorForce = 0;
          this.motorSpeed = 0;
      }
      Initialize(bA, bB, anchor, axis) {
          this.bodyA = bA;
          this.bodyB = bB;
          this.bodyA.GetLocalPoint(anchor, this.localAnchorA);
          this.bodyB.GetLocalPoint(anchor, this.localAnchorB);
          this.bodyA.GetLocalVector(axis, this.localAxisA);
          this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle();
      }
  }
  // Linear constraint (point-to-line)
  // d = p2 - p1 = x2 + r2 - x1 - r1
  // C = dot(perp, d)
  // Cdot = dot(d, cross(w1, perp)) + dot(perp, v2 + cross(w2, r2) - v1 - cross(w1, r1))
  //      = -dot(perp, v1) - dot(cross(d + r1, perp), w1) + dot(perp, v2) + dot(cross(r2, perp), v2)
  // J = [-perp, -cross(d + r1, perp), perp, cross(r2,perp)]
  //
  // Angular constraint
  // C = a2 - a1 + a_initial
  // Cdot = w2 - w1
  // J = [0 0 -1 0 0 1]
  //
  // K = J * invM * JT
  //
  // J = [-a -s1 a s2]
  //     [0  -1  0  1]
  // a = perp
  // s1 = cross(d + r1, a) = cross(p2 - x1, a)
  // s2 = cross(r2, a) = cross(p2 - x2, a)
  // Motor/Limit linear constraint
  // C = dot(ax1, d)
  // Cdot = -dot(ax1, v1) - dot(cross(d + r1, ax1), w1) + dot(ax1, v2) + dot(cross(r2, ax1), v2)
  // J = [-ax1 -cross(d+r1,ax1) ax1 cross(r2,ax1)]
  // Predictive limit is applied even when the limit is not active.
  // Prevents a constraint speed that can lead to a constraint error in one time step.
  // Want C2 = C1 + h * Cdot >= 0
  // Or:
  // Cdot + C1/h >= 0
  // I do not apply a negative constraint error because that is handled in position correction.
  // So:
  // Cdot + max(C1, 0)/h >= 0
  // Block Solver
  // We develop a block solver that includes the angular and linear constraints. This makes the limit stiffer.
  //
  // The Jacobian has 2 rows:
  // J = [-uT -s1 uT s2] // linear
  //     [0   -1   0  1] // angular
  //
  // u = perp
  // s1 = cross(d + r1, u), s2 = cross(r2, u)
  // a1 = cross(d + r1, v), a2 = cross(r2, v)
  class b2PrismaticJoint extends b2Joint {
      constructor(def) {
          super(def);
          this.m_localAnchorA = new b2Vec2();
          this.m_localAnchorB = new b2Vec2();
          this.m_localXAxisA = new b2Vec2();
          this.m_localYAxisA = new b2Vec2();
          this.m_referenceAngle = 0;
          this.m_impulse = new b2Vec2(0, 0);
          this.m_motorImpulse = 0;
          this.m_lowerImpulse = 0;
          this.m_upperImpulse = 0;
          this.m_lowerTranslation = 0;
          this.m_upperTranslation = 0;
          this.m_maxMotorForce = 0;
          this.m_motorSpeed = 0;
          this.m_enableLimit = false;
          this.m_enableMotor = false;
          // Solver temp
          this.m_indexA = 0;
          this.m_indexB = 0;
          this.m_localCenterA = new b2Vec2();
          this.m_localCenterB = new b2Vec2();
          this.m_invMassA = 0;
          this.m_invMassB = 0;
          this.m_invIA = 0;
          this.m_invIB = 0;
          this.m_axis = new b2Vec2(0, 0);
          this.m_perp = new b2Vec2(0, 0);
          this.m_s1 = 0;
          this.m_s2 = 0;
          this.m_a1 = 0;
          this.m_a2 = 0;
          this.m_K = new b2Mat22();
          this.m_K3 = new b2Mat33();
          this.m_K2 = new b2Mat22();
          this.m_translation = 0;
          this.m_axialMass = 0;
          this.m_qA = new b2Rot();
          this.m_qB = new b2Rot();
          this.m_lalcA = new b2Vec2();
          this.m_lalcB = new b2Vec2();
          this.m_rA = new b2Vec2();
          this.m_rB = new b2Vec2();
          this.m_localAnchorA.Copy(b2Maybe(def.localAnchorA, b2Vec2.ZERO));
          this.m_localAnchorB.Copy(b2Maybe(def.localAnchorB, b2Vec2.ZERO));
          this.m_localXAxisA.Copy(b2Maybe(def.localAxisA, new b2Vec2(1, 0))).SelfNormalize();
          b2Vec2.CrossOneV(this.m_localXAxisA, this.m_localYAxisA);
          this.m_referenceAngle = b2Maybe(def.referenceAngle, 0);
          this.m_lowerTranslation = b2Maybe(def.lowerTranslation, 0);
          this.m_upperTranslation = b2Maybe(def.upperTranslation, 0);
          // b2Assert(this.m_lowerTranslation <= this.m_upperTranslation);
          this.m_maxMotorForce = b2Maybe(def.maxMotorForce, 0);
          this.m_motorSpeed = b2Maybe(def.motorSpeed, 0);
          this.m_enableLimit = b2Maybe(def.enableLimit, false);
          this.m_enableMotor = b2Maybe(def.enableMotor, false);
      }
      InitVelocityConstraints(data) {
          this.m_indexA = this.m_bodyA.m_islandIndex;
          this.m_indexB = this.m_bodyB.m_islandIndex;
          this.m_localCenterA.Copy(this.m_bodyA.m_sweep.localCenter);
          this.m_localCenterB.Copy(this.m_bodyB.m_sweep.localCenter);
          this.m_invMassA = this.m_bodyA.m_invMass;
          this.m_invMassB = this.m_bodyB.m_invMass;
          this.m_invIA = this.m_bodyA.m_invI;
          this.m_invIB = this.m_bodyB.m_invI;
          const cA = data.positions[this.m_indexA].c;
          const aA = data.positions[this.m_indexA].a;
          const vA = data.velocities[this.m_indexA].v;
          let wA = data.velocities[this.m_indexA].w;
          const cB = data.positions[this.m_indexB].c;
          const aB = data.positions[this.m_indexB].a;
          const vB = data.velocities[this.m_indexB].v;
          let wB = data.velocities[this.m_indexB].w;
          const qA = this.m_qA.SetAngle(aA), qB = this.m_qB.SetAngle(aB);
          // Compute the effective masses.
          // b2Vec2 rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
          b2Vec2.SubVV(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
          const rA = b2Rot.MulRV(qA, this.m_lalcA, this.m_rA);
          // b2Vec2 rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
          b2Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
          const rB = b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);
          // b2Vec2 d = (cB - cA) + rB - rA;
          const d = b2Vec2.AddVV(b2Vec2.SubVV(cB, cA, b2Vec2.s_t0), b2Vec2.SubVV(rB, rA, b2Vec2.s_t1), b2PrismaticJoint.InitVelocityConstraints_s_d);
          const mA = this.m_invMassA, mB = this.m_invMassB;
          const iA = this.m_invIA, iB = this.m_invIB;
          // Compute motor Jacobian and effective mass.
          {
              // m_axis = b2Mul(qA, m_localXAxisA);
              b2Rot.MulRV(qA, this.m_localXAxisA, this.m_axis);
              // m_a1 = b2Cross(d + rA, m_axis);
              this.m_a1 = b2Vec2.CrossVV(b2Vec2.AddVV(d, rA, b2Vec2.s_t0), this.m_axis);
              // m_a2 = b2Cross(rB, m_axis);
              this.m_a2 = b2Vec2.CrossVV(rB, this.m_axis);
              this.m_axialMass = mA + mB + iA * this.m_a1 * this.m_a1 + iB * this.m_a2 * this.m_a2;
              if (this.m_axialMass > 0) {
                  this.m_axialMass = 1 / this.m_axialMass;
              }
          }
          // Prismatic constraint.
          {
              // m_perp = b2Mul(qA, m_localYAxisA);
              b2Rot.MulRV(qA, this.m_localYAxisA, this.m_perp);
              // m_s1 = b2Cross(d + rA, m_perp);
              this.m_s1 = b2Vec2.CrossVV(b2Vec2.AddVV(d, rA, b2Vec2.s_t0), this.m_perp);
              // m_s2 = b2Cross(rB, m_perp);
              this.m_s2 = b2Vec2.CrossVV(rB, this.m_perp);
              // float32 k11 = mA + mB + iA * m_s1 * m_s1 + iB * m_s2 * m_s2;
              this.m_K.ex.x = mA + mB + iA * this.m_s1 * this.m_s1 + iB * this.m_s2 * this.m_s2;
              // float32 k12 = iA * m_s1 + iB * m_s2;
              this.m_K.ex.y = iA * this.m_s1 + iB * this.m_s2;
              this.m_K.ey.x = this.m_K.ex.y;
              // float32 k22 = iA + iB;
              this.m_K.ey.y = iA + iB;
              if (this.m_K.ey.y === 0) {
                  // For bodies with fixed rotation.
                  this.m_K.ey.y = 1;
              }
              // m_K.ex.Set(k11, k12);
              // m_K.ey.Set(k12, k22);
          }
          // Compute motor and limit terms.
          if (this.m_enableLimit) {
              this.m_translation = b2Vec2.DotVV(this.m_axis, d);
          }
          else {
              this.m_lowerImpulse = 0.0;
              this.m_upperImpulse = 0.0;
          }
          if (!this.m_enableMotor) {
              this.m_motorImpulse = 0;
          }
          if (data.step.warmStarting) {
              // Account for variable time step.
              // m_impulse *= data.step.dtRatio;
              this.m_impulse.SelfMul(data.step.dtRatio);
              this.m_motorImpulse *= data.step.dtRatio;
              this.m_lowerImpulse *= data.step.dtRatio;
              this.m_upperImpulse *= data.step.dtRatio;
              const axialImpulse = this.m_motorImpulse + this.m_lowerImpulse - this.m_upperImpulse;
              // b2Vec2 P = m_impulse.x * m_perp + axialImpulse * m_axis;
              const P = b2Vec2.AddVV(b2Vec2.MulSV(this.m_impulse.x, this.m_perp, b2Vec2.s_t0), b2Vec2.MulSV(axialImpulse, this.m_axis, b2Vec2.s_t1), b2PrismaticJoint.InitVelocityConstraints_s_P);
              // float LA = m_impulse.x * m_s1 + m_impulse.y + axialImpulse * m_a1;
              const LA = this.m_impulse.x * this.m_s1 + this.m_impulse.y + axialImpulse * this.m_a1;
              // float LB = m_impulse.x * m_s2 + m_impulse.y + axialImpulse * m_a2;
              const LB = this.m_impulse.x * this.m_s2 + this.m_impulse.y + axialImpulse * this.m_a2;
              // vA -= mA * P;
              vA.SelfMulSub(mA, P);
              wA -= iA * LA;
              // vB += mB * P;
              vB.SelfMulAdd(mB, P);
              wB += iB * LB;
          }
          else {
              this.m_impulse.SetZero();
              this.m_motorImpulse = 0.0;
              this.m_lowerImpulse = 0.0;
              this.m_upperImpulse = 0.0;
          }
          // data.velocities[this.m_indexA].v = vA;
          data.velocities[this.m_indexA].w = wA;
          // data.velocities[this.m_indexB].v = vB;
          data.velocities[this.m_indexB].w = wB;
      }
      SolveVelocityConstraints(data) {
          const vA = data.velocities[this.m_indexA].v;
          let wA = data.velocities[this.m_indexA].w;
          const vB = data.velocities[this.m_indexB].v;
          let wB = data.velocities[this.m_indexB].w;
          const mA = this.m_invMassA, mB = this.m_invMassB;
          const iA = this.m_invIA, iB = this.m_invIB;
          // Solve linear motor constraint.
          if (this.m_enableMotor) {
              // float32 Cdot = b2Dot(m_axis, vB - vA) + m_a2 * wB - m_a1 * wA;
              const Cdot = b2Vec2.DotVV(this.m_axis, b2Vec2.SubVV(vB, vA, b2Vec2.s_t0)) + this.m_a2 * wB - this.m_a1 * wA;
              let impulse = this.m_axialMass * (this.m_motorSpeed - Cdot);
              const oldImpulse = this.m_motorImpulse;
              const maxImpulse = data.step.dt * this.m_maxMotorForce;
              this.m_motorImpulse = b2Clamp(this.m_motorImpulse + impulse, (-maxImpulse), maxImpulse);
              impulse = this.m_motorImpulse - oldImpulse;
              // b2Vec2 P = impulse * m_axis;
              const P = b2Vec2.MulSV(impulse, this.m_axis, b2PrismaticJoint.SolveVelocityConstraints_s_P);
              const LA = impulse * this.m_a1;
              const LB = impulse * this.m_a2;
              // vA -= mA * P;
              vA.SelfMulSub(mA, P);
              wA -= iA * LA;
              // vB += mB * P;
              vB.SelfMulAdd(mB, P);
              wB += iB * LB;
          }
          if (this.m_enableLimit) {
              // Lower limit
              {
                  const C = this.m_translation - this.m_lowerTranslation;
                  const Cdot = b2Vec2.DotVV(this.m_axis, b2Vec2.SubVV(vB, vA, b2Vec2.s_t0)) + this.m_a2 * wB - this.m_a1 * wA;
                  let impulse = -this.m_axialMass * (Cdot + b2Max(C, 0.0) * data.step.inv_dt);
                  const oldImpulse = this.m_lowerImpulse;
                  this.m_lowerImpulse = b2Max(this.m_lowerImpulse + impulse, 0.0);
                  impulse = this.m_lowerImpulse - oldImpulse;
                  // b2Vec2 P = impulse * this.m_axis;
                  const P = b2Vec2.MulSV(impulse, this.m_axis, b2PrismaticJoint.SolveVelocityConstraints_s_P);
                  const LA = impulse * this.m_a1;
                  const LB = impulse * this.m_a2;
                  // vA -= mA * P;
                  vA.SelfMulSub(mA, P);
                  wA -= iA * LA;
                  // vB += mB * P;
                  vB.SelfMulAdd(mB, P);
                  wB += iB * LB;
              }
              // Upper limit
              // Note: signs are flipped to keep C positive when the constraint is satisfied.
              // This also keeps the impulse positive when the limit is active.
              {
                  const C = this.m_upperTranslation - this.m_translation;
                  const Cdot = b2Vec2.DotVV(this.m_axis, b2Vec2.SubVV(vA, vB, b2Vec2.s_t0)) + this.m_a1 * wA - this.m_a2 * wB;
                  let impulse = -this.m_axialMass * (Cdot + b2Max(C, 0.0) * data.step.inv_dt);
                  const oldImpulse = this.m_upperImpulse;
                  this.m_upperImpulse = b2Max(this.m_upperImpulse + impulse, 0.0);
                  impulse = this.m_upperImpulse - oldImpulse;
                  // b2Vec2 P = impulse * this.m_axis;
                  const P = b2Vec2.MulSV(impulse, this.m_axis, b2PrismaticJoint.SolveVelocityConstraints_s_P);
                  const LA = impulse * this.m_a1;
                  const LB = impulse * this.m_a2;
                  // vA += mA * P;
                  vA.SelfMulAdd(mA, P);
                  wA += iA * LA;
                  // vB -= mB * P;
                  vB.SelfMulSub(mB, P);
                  wB -= iB * LB;
              }
          }
          // Solve the prismatic constraint in block form.
          {
              // b2Vec2 Cdot;
              // Cdot.x = b2Dot(m_perp, vB - vA) + m_s2 * wB - m_s1 * wA;
              const Cdot_x = b2Vec2.DotVV(this.m_perp, b2Vec2.SubVV(vB, vA, b2Vec2.s_t0)) + this.m_s2 * wB - this.m_s1 * wA;
              // Cdot.y = wB - wA;
              const Cdot_y = wB - wA;
              // b2Vec2 df = m_K.Solve(-Cdot);
              const df = this.m_K.Solve(-Cdot_x, -Cdot_y, b2PrismaticJoint.SolveVelocityConstraints_s_df);
              // m_impulse += df;
              this.m_impulse.SelfAdd(df);
              // b2Vec2 P = df.x * m_perp;
              const P = b2Vec2.MulSV(df.x, this.m_perp, b2PrismaticJoint.SolveVelocityConstraints_s_P);
              // float32 LA = df.x * m_s1 + df.y;
              const LA = df.x * this.m_s1 + df.y;
              // float32 LB = df.x * m_s2 + df.y;
              const LB = df.x * this.m_s2 + df.y;
              // vA -= mA * P;
              vA.SelfMulSub(mA, P);
              wA -= iA * LA;
              // vB += mB * P;
              vB.SelfMulAdd(mB, P);
              wB += iB * LB;
          }
          // data.velocities[this.m_indexA].v = vA;
          data.velocities[this.m_indexA].w = wA;
          // data.velocities[this.m_indexB].v = vB;
          data.velocities[this.m_indexB].w = wB;
      }
      SolvePositionConstraints(data) {
          const cA = data.positions[this.m_indexA].c;
          let aA = data.positions[this.m_indexA].a;
          const cB = data.positions[this.m_indexB].c;
          let aB = data.positions[this.m_indexB].a;
          const qA = this.m_qA.SetAngle(aA), qB = this.m_qB.SetAngle(aB);
          const mA = this.m_invMassA, mB = this.m_invMassB;
          const iA = this.m_invIA, iB = this.m_invIB;
          // b2Vec2 rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
          const rA = b2Rot.MulRV(qA, this.m_lalcA, this.m_rA);
          // b2Vec2 rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
          const rB = b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);
          // b2Vec2 d = cB + rB - cA - rA;
          const d = b2Vec2.SubVV(b2Vec2.AddVV(cB, rB, b2Vec2.s_t0), b2Vec2.AddVV(cA, rA, b2Vec2.s_t1), b2PrismaticJoint.SolvePositionConstraints_s_d);
          // b2Vec2 axis = b2Mul(qA, m_localXAxisA);
          const axis = b2Rot.MulRV(qA, this.m_localXAxisA, this.m_axis);
          // float32 a1 = b2Cross(d + rA, axis);
          const a1 = b2Vec2.CrossVV(b2Vec2.AddVV(d, rA, b2Vec2.s_t0), axis);
          // float32 a2 = b2Cross(rB, axis);
          const a2 = b2Vec2.CrossVV(rB, axis);
          // b2Vec2 perp = b2Mul(qA, m_localYAxisA);
          const perp = b2Rot.MulRV(qA, this.m_localYAxisA, this.m_perp);
          // float32 s1 = b2Cross(d + rA, perp);
          const s1 = b2Vec2.CrossVV(b2Vec2.AddVV(d, rA, b2Vec2.s_t0), perp);
          // float32 s2 = b2Cross(rB, perp);
          const s2 = b2Vec2.CrossVV(rB, perp);
          // b2Vec3 impulse;
          let impulse = b2PrismaticJoint.SolvePositionConstraints_s_impulse;
          // b2Vec2 C1;
          // C1.x = b2Dot(perp, d);
          const C1_x = b2Vec2.DotVV(perp, d);
          // C1.y = aB - aA - m_referenceAngle;
          const C1_y = aB - aA - this.m_referenceAngle;
          let linearError = b2Abs(C1_x);
          const angularError = b2Abs(C1_y);
          let active = false;
          let C2 = 0;
          if (this.m_enableLimit) {
              // float32 translation = b2Dot(axis, d);
              const translation = b2Vec2.DotVV(axis, d);
              if (b2Abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * b2_linearSlop) {
                  C2 = translation;
                  linearError = b2Max(linearError, b2Abs(translation));
                  active = true;
              }
              else if (translation <= this.m_lowerTranslation) {
                  C2 = b2Min(translation - this.m_lowerTranslation, 0.0);
                  linearError = b2Max(linearError, this.m_lowerTranslation - translation);
                  active = true;
              }
              else if (translation >= this.m_upperTranslation) {
                  C2 = b2Max(translation - this.m_upperTranslation, 0.0);
                  linearError = b2Max(linearError, translation - this.m_upperTranslation);
                  active = true;
              }
          }
          if (active) {
              // float32 k11 = mA + mB + iA * s1 * s1 + iB * s2 * s2;
              const k11 = mA + mB + iA * s1 * s1 + iB * s2 * s2;
              // float32 k12 = iA * s1 + iB * s2;
              const k12 = iA * s1 + iB * s2;
              // float32 k13 = iA * s1 * a1 + iB * s2 * a2;
              const k13 = iA * s1 * a1 + iB * s2 * a2;
              // float32 k22 = iA + iB;
              let k22 = iA + iB;
              if (k22 === 0) {
                  // For fixed rotation
                  k22 = 1;
              }
              // float32 k23 = iA * a1 + iB * a2;
              const k23 = iA * a1 + iB * a2;
              // float32 k33 = mA + mB + iA * a1 * a1 + iB * a2 * a2;
              const k33 = mA + mB + iA * a1 * a1 + iB * a2 * a2;
              // b2Mat33 K;
              const K = this.m_K3;
              // K.ex.Set(k11, k12, k13);
              K.ex.SetXYZ(k11, k12, k13);
              // K.ey.Set(k12, k22, k23);
              K.ey.SetXYZ(k12, k22, k23);
              // K.ez.Set(k13, k23, k33);
              K.ez.SetXYZ(k13, k23, k33);
              // b2Vec3 C;
              // C.x = C1.x;
              // C.y = C1.y;
              // C.z = C2;
              // impulse = K.Solve33(-C);
              impulse = K.Solve33((-C1_x), (-C1_y), (-C2), impulse);
          }
          else {
              // float32 k11 = mA + mB + iA * s1 * s1 + iB * s2 * s2;
              const k11 = mA + mB + iA * s1 * s1 + iB * s2 * s2;
              // float32 k12 = iA * s1 + iB * s2;
              const k12 = iA * s1 + iB * s2;
              // float32 k22 = iA + iB;
              let k22 = iA + iB;
              if (k22 === 0) {
                  k22 = 1;
              }
              // b2Mat22 K;
              const K2 = this.m_K2;
              // K.ex.Set(k11, k12);
              K2.ex.Set(k11, k12);
              // K.ey.Set(k12, k22);
              K2.ey.Set(k12, k22);
              // b2Vec2 impulse1 = K.Solve(-C1);
              const impulse1 = K2.Solve((-C1_x), (-C1_y), b2PrismaticJoint.SolvePositionConstraints_s_impulse1);
              impulse.x = impulse1.x;
              impulse.y = impulse1.y;
              impulse.z = 0;
          }
          // b2Vec2 P = impulse.x * perp + impulse.z * axis;
          const P = b2Vec2.AddVV(b2Vec2.MulSV(impulse.x, perp, b2Vec2.s_t0), b2Vec2.MulSV(impulse.z, axis, b2Vec2.s_t1), b2PrismaticJoint.SolvePositionConstraints_s_P);
          // float32 LA = impulse.x * s1 + impulse.y + impulse.z * a1;
          const LA = impulse.x * s1 + impulse.y + impulse.z * a1;
          // float32 LB = impulse.x * s2 + impulse.y + impulse.z * a2;
          const LB = impulse.x * s2 + impulse.y + impulse.z * a2;
          // cA -= mA * P;
          cA.SelfMulSub(mA, P);
          aA -= iA * LA;
          // cB += mB * P;
          cB.SelfMulAdd(mB, P);
          aB += iB * LB;
          // data.positions[this.m_indexA].c = cA;
          data.positions[this.m_indexA].a = aA;
          // data.positions[this.m_indexB].c = cB;
          data.positions[this.m_indexB].a = aB;
          return linearError <= b2_linearSlop && angularError <= b2_angularSlop;
      }
      GetAnchorA(out) {
          return this.m_bodyA.GetWorldPoint(this.m_localAnchorA, out);
      }
      GetAnchorB(out) {
          return this.m_bodyB.GetWorldPoint(this.m_localAnchorB, out);
      }
      GetReactionForce(inv_dt, out) {
          out.x = inv_dt * (this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_lowerImpulse - this.m_upperImpulse) * this.m_axis.x);
          out.y = inv_dt * (this.m_impulse.y * this.m_perp.y + (this.m_motorImpulse + this.m_lowerImpulse - this.m_upperImpulse) * this.m_axis.y);
          return out;
      }
      GetReactionTorque(inv_dt) {
          return inv_dt * this.m_impulse.y;
      }
      GetLocalAnchorA() { return this.m_localAnchorA; }
      GetLocalAnchorB() { return this.m_localAnchorB; }
      GetLocalAxisA() { return this.m_localXAxisA; }
      GetReferenceAngle() { return this.m_referenceAngle; }
      GetJointTranslation() {
          // b2Vec2 pA = m_bodyA.GetWorldPoint(m_localAnchorA);
          const pA = this.m_bodyA.GetWorldPoint(this.m_localAnchorA, b2PrismaticJoint.GetJointTranslation_s_pA);
          // b2Vec2 pB = m_bodyB.GetWorldPoint(m_localAnchorB);
          const pB = this.m_bodyB.GetWorldPoint(this.m_localAnchorB, b2PrismaticJoint.GetJointTranslation_s_pB);
          // b2Vec2 d = pB - pA;
          const d = b2Vec2.SubVV(pB, pA, b2PrismaticJoint.GetJointTranslation_s_d);
          // b2Vec2 axis = m_bodyA.GetWorldVector(m_localXAxisA);
          const axis = this.m_bodyA.GetWorldVector(this.m_localXAxisA, b2PrismaticJoint.GetJointTranslation_s_axis);
          // float32 translation = b2Dot(d, axis);
          const translation = b2Vec2.DotVV(d, axis);
          return translation;
      }
      GetJointSpeed() {
          const bA = this.m_bodyA;
          const bB = this.m_bodyB;
          // b2Vec2 rA = b2Mul(bA->m_xf.q, m_localAnchorA - bA->m_sweep.localCenter);
          b2Vec2.SubVV(this.m_localAnchorA, bA.m_sweep.localCenter, this.m_lalcA);
          const rA = b2Rot.MulRV(bA.m_xf.q, this.m_lalcA, this.m_rA);
          // b2Vec2 rB = b2Mul(bB->m_xf.q, m_localAnchorB - bB->m_sweep.localCenter);
          b2Vec2.SubVV(this.m_localAnchorB, bB.m_sweep.localCenter, this.m_lalcB);
          const rB = b2Rot.MulRV(bB.m_xf.q, this.m_lalcB, this.m_rB);
          // b2Vec2 pA = bA->m_sweep.c + rA;
          const pA = b2Vec2.AddVV(bA.m_sweep.c, rA, b2Vec2.s_t0); // pA uses s_t0
          // b2Vec2 pB = bB->m_sweep.c + rB;
          const pB = b2Vec2.AddVV(bB.m_sweep.c, rB, b2Vec2.s_t1); // pB uses s_t1
          // b2Vec2 d = pB - pA;
          const d = b2Vec2.SubVV(pB, pA, b2Vec2.s_t2); // d uses s_t2
          // b2Vec2 axis = b2Mul(bA.m_xf.q, m_localXAxisA);
          const axis = bA.GetWorldVector(this.m_localXAxisA, this.m_axis);
          const vA = bA.m_linearVelocity;
          const vB = bB.m_linearVelocity;
          const wA = bA.m_angularVelocity;
          const wB = bB.m_angularVelocity;
          // float32 speed = b2Dot(d, b2Cross(wA, axis)) + b2Dot(axis, vB + b2Cross(wB, rB) - vA - b2Cross(wA, rA));
          const speed = b2Vec2.DotVV(d, b2Vec2.CrossSV(wA, axis, b2Vec2.s_t0)) +
              b2Vec2.DotVV(axis, b2Vec2.SubVV(b2Vec2.AddVCrossSV(vB, wB, rB, b2Vec2.s_t0), b2Vec2.AddVCrossSV(vA, wA, rA, b2Vec2.s_t1), b2Vec2.s_t0));
          return speed;
      }
      IsLimitEnabled() {
          return this.m_enableLimit;
      }
      EnableLimit(flag) {
          if (flag !== this.m_enableLimit) {
              this.m_bodyA.SetAwake(true);
              this.m_bodyB.SetAwake(true);
              this.m_enableLimit = flag;
              this.m_lowerImpulse = 0.0;
              this.m_upperImpulse = 0.0;
          }
      }
      GetLowerLimit() {
          return this.m_lowerTranslation;
      }
      GetUpperLimit() {
          return this.m_upperTranslation;
      }
      SetLimits(lower, upper) {
          if (lower !== this.m_lowerTranslation || upper !== this.m_upperTranslation) {
              this.m_bodyA.SetAwake(true);
              this.m_bodyB.SetAwake(true);
              this.m_lowerTranslation = lower;
              this.m_upperTranslation = upper;
              this.m_lowerImpulse = 0.0;
              this.m_upperImpulse = 0.0;
          }
      }
      IsMotorEnabled() {
          return this.m_enableMotor;
      }
      EnableMotor(flag) {
          if (flag !== this.m_enableMotor) {
              this.m_bodyA.SetAwake(true);
              this.m_bodyB.SetAwake(true);
              this.m_enableMotor = flag;
          }
      }
      SetMotorSpeed(speed) {
          if (speed !== this.m_motorSpeed) {
              this.m_bodyA.SetAwake(true);
              this.m_bodyB.SetAwake(true);
              this.m_motorSpeed = speed;
          }
      }
      GetMotorSpeed() {
          return this.m_motorSpeed;
      }
      SetMaxMotorForce(force) {
          if (force !== this.m_maxMotorForce) {
              this.m_bodyA.SetAwake(true);
              this.m_bodyB.SetAwake(true);
              this.m_maxMotorForce = force;
          }
      }
      GetMaxMotorForce() { return this.m_maxMotorForce; }
      GetMotorForce(inv_dt) {
          return inv_dt * this.m_motorImpulse;
      }
      Dump(log) {
          const indexA = this.m_bodyA.m_islandIndex;
          const indexB = this.m_bodyB.m_islandIndex;
          log("  const jd: b2PrismaticJointDef = new b2PrismaticJointDef();\n");
          log("  jd.bodyA = bodies[%d];\n", indexA);
          log("  jd.bodyB = bodies[%d];\n", indexB);
          log("  jd.collideConnected = %s;\n", (this.m_collideConnected) ? ("true") : ("false"));
          log("  jd.localAnchorA.Set(%.15f, %.15f);\n", this.m_localAnchorA.x, this.m_localAnchorA.y);
          log("  jd.localAnchorB.Set(%.15f, %.15f);\n", this.m_localAnchorB.x, this.m_localAnchorB.y);
          log("  jd.localAxisA.Set(%.15f, %.15f);\n", this.m_localXAxisA.x, this.m_localXAxisA.y);
          log("  jd.referenceAngle = %.15f;\n", this.m_referenceAngle);
          log("  jd.enableLimit = %s;\n", (this.m_enableLimit) ? ("true") : ("false"));
          log("  jd.lowerTranslation = %.15f;\n", this.m_lowerTranslation);
          log("  jd.upperTranslation = %.15f;\n", this.m_upperTranslation);
          log("  jd.enableMotor = %s;\n", (this.m_enableMotor) ? ("true") : ("false"));
          log("  jd.motorSpeed = %.15f;\n", this.m_motorSpeed);
          log("  jd.maxMotorForce = %.15f;\n", this.m_maxMotorForce);
          log("  joints[%d] = this.m_world.CreateJoint(jd);\n", this.m_index);
      }
      Draw(draw) {
          const xfA = this.m_bodyA.GetTransform();
          const xfB = this.m_bodyB.GetTransform();
          const pA = b2Transform.MulXV(xfA, this.m_localAnchorA, b2PrismaticJoint.Draw_s_pA);
          const pB = b2Transform.MulXV(xfB, this.m_localAnchorB, b2PrismaticJoint.Draw_s_pB);
          // b2Vec2 axis = b2Mul(xfA.q, m_localXAxisA);
          const axis = b2Rot.MulRV(xfA.q, this.m_localXAxisA, b2PrismaticJoint.Draw_s_axis);
          const c1 = b2PrismaticJoint.Draw_s_c1; // b2Color c1(0.7f, 0.7f, 0.7f);
          const c2 = b2PrismaticJoint.Draw_s_c2; // b2Color c2(0.3f, 0.9f, 0.3f);
          const c3 = b2PrismaticJoint.Draw_s_c3; // b2Color c3(0.9f, 0.3f, 0.3f);
          const c4 = b2PrismaticJoint.Draw_s_c4; // b2Color c4(0.3f, 0.3f, 0.9f);
          const c5 = b2PrismaticJoint.Draw_s_c5; // b2Color c5(0.4f, 0.4f, 0.4f);
          draw.DrawSegment(pA, pB, c5);
          if (this.m_enableLimit) {
              // b2Vec2 lower = pA + m_lowerTranslation * axis;
              const lower = b2Vec2.AddVMulSV(pA, this.m_lowerTranslation, axis, b2PrismaticJoint.Draw_s_lower);
              // b2Vec2 upper = pA + m_upperTranslation * axis;
              const upper = b2Vec2.AddVMulSV(pA, this.m_upperTranslation, axis, b2PrismaticJoint.Draw_s_upper);
              // b2Vec2 perp = b2Mul(xfA.q, m_localYAxisA);
              const perp = b2Rot.MulRV(xfA.q, this.m_localYAxisA, b2PrismaticJoint.Draw_s_perp);
              draw.DrawSegment(lower, upper, c1);
              // draw.DrawSegment(lower - 0.5 * perp, lower + 0.5 * perp, c2);
              draw.DrawSegment(b2Vec2.AddVMulSV(lower, -0.5, perp, b2Vec2.s_t0), b2Vec2.AddVMulSV(lower, 0.5, perp, b2Vec2.s_t1), c2);
              // draw.DrawSegment(upper - 0.5 * perp, upper + 0.5 * perp, c3);
              draw.DrawSegment(b2Vec2.AddVMulSV(upper, -0.5, perp, b2Vec2.s_t0), b2Vec2.AddVMulSV(upper, 0.5, perp, b2Vec2.s_t1), c3);
          }
          else {
              // draw.DrawSegment(pA - 1.0 * axis, pA + 1.0 * axis, c1);
              draw.DrawSegment(b2Vec2.AddVMulSV(pA, -1.0, axis, b2Vec2.s_t0), b2Vec2.AddVMulSV(pA, 1.0, axis, b2Vec2.s_t1), c1);
          }
          draw.DrawPoint(pA, 5.0, c1);
          draw.DrawPoint(pB, 5.0, c4);
      }
  }
  b2PrismaticJoint.InitVelocityConstraints_s_d = new b2Vec2();
  b2PrismaticJoint.InitVelocityConstraints_s_P = new b2Vec2();
  b2PrismaticJoint.SolveVelocityConstraints_s_P = new b2Vec2();
  // private static SolveVelocityConstraints_s_f2r = new b2Vec2();
  // private static SolveVelocityConstraints_s_f1 = new b2Vec3();
  // private static SolveVelocityConstraints_s_df3 = new b2Vec3();
  b2PrismaticJoint.SolveVelocityConstraints_s_df = new b2Vec2();
  // A velocity based solver computes reaction forces(impulses) using the velocity constraint solver.Under this context,
  // the position solver is not there to resolve forces.It is only there to cope with integration error.
  //
  // Therefore, the pseudo impulses in the position solver do not have any physical meaning.Thus it is okay if they suck.
  //
  // We could take the active state from the velocity solver.However, the joint might push past the limit when the velocity
  // solver indicates the limit is inactive.
  b2PrismaticJoint.SolvePositionConstraints_s_d = new b2Vec2();
  b2PrismaticJoint.SolvePositionConstraints_s_impulse = new b2Vec3();
  b2PrismaticJoint.SolvePositionConstraints_s_impulse1 = new b2Vec2();
  b2PrismaticJoint.SolvePositionConstraints_s_P = new b2Vec2();
  b2PrismaticJoint.GetJointTranslation_s_pA = new b2Vec2();
  b2PrismaticJoint.GetJointTranslation_s_pB = new b2Vec2();
  b2PrismaticJoint.GetJointTranslation_s_d = new b2Vec2();
  b2PrismaticJoint.GetJointTranslation_s_axis = new b2Vec2();
  b2PrismaticJoint.Draw_s_pA = new b2Vec2();
  b2PrismaticJoint.Draw_s_pB = new b2Vec2();
  b2PrismaticJoint.Draw_s_axis = new b2Vec2();
  b2PrismaticJoint.Draw_s_c1 = new b2Color(0.7, 0.7, 0.7);
  b2PrismaticJoint.Draw_s_c2 = new b2Color(0.3, 0.9, 0.3);
  b2PrismaticJoint.Draw_s_c3 = new b2Color(0.9, 0.3, 0.3);
  b2PrismaticJoint.Draw_s_c4 = new b2Color(0.3, 0.3, 0.9);
  b2PrismaticJoint.Draw_s_c5 = new b2Color(0.4, 0.4, 0.4);
  b2PrismaticJoint.Draw_s_lower = new b2Vec2();
  b2PrismaticJoint.Draw_s_upper = new b2Vec2();
  b2PrismaticJoint.Draw_s_perp = new b2Vec2();

  /*
  * Copyright (c) 2006-2011 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  const b2_minPulleyLength = 2;
  /// Pulley joint definition. This requires two ground anchors,
  /// two dynamic body anchor points, and a pulley ratio.
  class b2PulleyJointDef extends b2JointDef {
      constructor() {
          super(exports.b2JointType.e_pulleyJoint);
          this.groundAnchorA = new b2Vec2(-1, 1);
          this.groundAnchorB = new b2Vec2(1, 1);
          this.localAnchorA = new b2Vec2(-1, 0);
          this.localAnchorB = new b2Vec2(1, 0);
          this.lengthA = 0;
          this.lengthB = 0;
          this.ratio = 1;
          this.collideConnected = true;
      }
      Initialize(bA, bB, groundA, groundB, anchorA, anchorB, r) {
          this.bodyA = bA;
          this.bodyB = bB;
          this.groundAnchorA.Copy(groundA);
          this.groundAnchorB.Copy(groundB);
          this.bodyA.GetLocalPoint(anchorA, this.localAnchorA);
          this.bodyB.GetLocalPoint(anchorB, this.localAnchorB);
          this.lengthA = b2Vec2.DistanceVV(anchorA, groundA);
          this.lengthB = b2Vec2.DistanceVV(anchorB, groundB);
          this.ratio = r;
          // DEBUG: b2Assert(this.ratio > b2_epsilon);
      }
  }
  class b2PulleyJoint extends b2Joint {
      constructor(def) {
          super(def);
          this.m_groundAnchorA = new b2Vec2();
          this.m_groundAnchorB = new b2Vec2();
          this.m_lengthA = 0;
          this.m_lengthB = 0;
          // Solver shared
          this.m_localAnchorA = new b2Vec2();
          this.m_localAnchorB = new b2Vec2();
          this.m_constant = 0;
          this.m_ratio = 0;
          this.m_impulse = 0;
          // Solver temp
          this.m_indexA = 0;
          this.m_indexB = 0;
          this.m_uA = new b2Vec2();
          this.m_uB = new b2Vec2();
          this.m_rA = new b2Vec2();
          this.m_rB = new b2Vec2();
          this.m_localCenterA = new b2Vec2();
          this.m_localCenterB = new b2Vec2();
          this.m_invMassA = 0;
          this.m_invMassB = 0;
          this.m_invIA = 0;
          this.m_invIB = 0;
          this.m_mass = 0;
          this.m_qA = new b2Rot();
          this.m_qB = new b2Rot();
          this.m_lalcA = new b2Vec2();
          this.m_lalcB = new b2Vec2();
          this.m_groundAnchorA.Copy(b2Maybe(def.groundAnchorA, new b2Vec2(-1, 1)));
          this.m_groundAnchorB.Copy(b2Maybe(def.groundAnchorB, new b2Vec2(1, 0)));
          this.m_localAnchorA.Copy(b2Maybe(def.localAnchorA, new b2Vec2(-1, 0)));
          this.m_localAnchorB.Copy(b2Maybe(def.localAnchorB, new b2Vec2(1, 0)));
          this.m_lengthA = b2Maybe(def.lengthA, 0);
          this.m_lengthB = b2Maybe(def.lengthB, 0);
          // DEBUG: b2Assert(b2Maybe(def.ratio, 1) !== 0);
          this.m_ratio = b2Maybe(def.ratio, 1);
          this.m_constant = b2Maybe(def.lengthA, 0) + this.m_ratio * b2Maybe(def.lengthB, 0);
          this.m_impulse = 0;
      }
      InitVelocityConstraints(data) {
          this.m_indexA = this.m_bodyA.m_islandIndex;
          this.m_indexB = this.m_bodyB.m_islandIndex;
          this.m_localCenterA.Copy(this.m_bodyA.m_sweep.localCenter);
          this.m_localCenterB.Copy(this.m_bodyB.m_sweep.localCenter);
          this.m_invMassA = this.m_bodyA.m_invMass;
          this.m_invMassB = this.m_bodyB.m_invMass;
          this.m_invIA = this.m_bodyA.m_invI;
          this.m_invIB = this.m_bodyB.m_invI;
          const cA = data.positions[this.m_indexA].c;
          const aA = data.positions[this.m_indexA].a;
          const vA = data.velocities[this.m_indexA].v;
          let wA = data.velocities[this.m_indexA].w;
          const cB = data.positions[this.m_indexB].c;
          const aB = data.positions[this.m_indexB].a;
          const vB = data.velocities[this.m_indexB].v;
          let wB = data.velocities[this.m_indexB].w;
          // b2Rot qA(aA), qB(aB);
          const qA = this.m_qA.SetAngle(aA), qB = this.m_qB.SetAngle(aB);
          // m_rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
          b2Vec2.SubVV(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
          b2Rot.MulRV(qA, this.m_lalcA, this.m_rA);
          // m_rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
          b2Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
          b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);
          // Get the pulley axes.
          // m_uA = cA + m_rA - m_groundAnchorA;
          this.m_uA.Copy(cA).SelfAdd(this.m_rA).SelfSub(this.m_groundAnchorA);
          // m_uB = cB + m_rB - m_groundAnchorB;
          this.m_uB.Copy(cB).SelfAdd(this.m_rB).SelfSub(this.m_groundAnchorB);
          const lengthA = this.m_uA.Length();
          const lengthB = this.m_uB.Length();
          if (lengthA > 10 * b2_linearSlop) {
              this.m_uA.SelfMul(1 / lengthA);
          }
          else {
              this.m_uA.SetZero();
          }
          if (lengthB > 10 * b2_linearSlop) {
              this.m_uB.SelfMul(1 / lengthB);
          }
          else {
              this.m_uB.SetZero();
          }
          // Compute effective mass.
          const ruA = b2Vec2.CrossVV(this.m_rA, this.m_uA);
          const ruB = b2Vec2.CrossVV(this.m_rB, this.m_uB);
          const mA = this.m_invMassA + this.m_invIA * ruA * ruA;
          const mB = this.m_invMassB + this.m_invIB * ruB * ruB;
          this.m_mass = mA + this.m_ratio * this.m_ratio * mB;
          if (this.m_mass > 0) {
              this.m_mass = 1 / this.m_mass;
          }
          if (data.step.warmStarting) {
              // Scale impulses to support variable time steps.
              this.m_impulse *= data.step.dtRatio;
              // Warm starting.
              // b2Vec2 PA = -(m_impulse) * m_uA;
              const PA = b2Vec2.MulSV(-(this.m_impulse), this.m_uA, b2PulleyJoint.InitVelocityConstraints_s_PA);
              // b2Vec2 PB = (-m_ratio * m_impulse) * m_uB;
              const PB = b2Vec2.MulSV((-this.m_ratio * this.m_impulse), this.m_uB, b2PulleyJoint.InitVelocityConstraints_s_PB);
              // vA += m_invMassA * PA;
              vA.SelfMulAdd(this.m_invMassA, PA);
              wA += this.m_invIA * b2Vec2.CrossVV(this.m_rA, PA);
              // vB += m_invMassB * PB;
              vB.SelfMulAdd(this.m_invMassB, PB);
              wB += this.m_invIB * b2Vec2.CrossVV(this.m_rB, PB);
          }
          else {
              this.m_impulse = 0;
          }
          // data.velocities[this.m_indexA].v = vA;
          data.velocities[this.m_indexA].w = wA;
          // data.velocities[this.m_indexB].v = vB;
          data.velocities[this.m_indexB].w = wB;
      }
      SolveVelocityConstraints(data) {
          const vA = data.velocities[this.m_indexA].v;
          let wA = data.velocities[this.m_indexA].w;
          const vB = data.velocities[this.m_indexB].v;
          let wB = data.velocities[this.m_indexB].w;
          // b2Vec2 vpA = vA + b2Cross(wA, m_rA);
          const vpA = b2Vec2.AddVCrossSV(vA, wA, this.m_rA, b2PulleyJoint.SolveVelocityConstraints_s_vpA);
          // b2Vec2 vpB = vB + b2Cross(wB, m_rB);
          const vpB = b2Vec2.AddVCrossSV(vB, wB, this.m_rB, b2PulleyJoint.SolveVelocityConstraints_s_vpB);
          const Cdot = -b2Vec2.DotVV(this.m_uA, vpA) - this.m_ratio * b2Vec2.DotVV(this.m_uB, vpB);
          const impulse = -this.m_mass * Cdot;
          this.m_impulse += impulse;
          // b2Vec2 PA = -impulse * m_uA;
          const PA = b2Vec2.MulSV(-impulse, this.m_uA, b2PulleyJoint.SolveVelocityConstraints_s_PA);
          // b2Vec2 PB = -m_ratio * impulse * m_uB;
          const PB = b2Vec2.MulSV(-this.m_ratio * impulse, this.m_uB, b2PulleyJoint.SolveVelocityConstraints_s_PB);
          // vA += m_invMassA * PA;
          vA.SelfMulAdd(this.m_invMassA, PA);
          wA += this.m_invIA * b2Vec2.CrossVV(this.m_rA, PA);
          // vB += m_invMassB * PB;
          vB.SelfMulAdd(this.m_invMassB, PB);
          wB += this.m_invIB * b2Vec2.CrossVV(this.m_rB, PB);
          // data.velocities[this.m_indexA].v = vA;
          data.velocities[this.m_indexA].w = wA;
          // data.velocities[this.m_indexB].v = vB;
          data.velocities[this.m_indexB].w = wB;
      }
      SolvePositionConstraints(data) {
          const cA = data.positions[this.m_indexA].c;
          let aA = data.positions[this.m_indexA].a;
          const cB = data.positions[this.m_indexB].c;
          let aB = data.positions[this.m_indexB].a;
          // b2Rot qA(aA), qB(aB);
          const qA = this.m_qA.SetAngle(aA), qB = this.m_qB.SetAngle(aB);
          // b2Vec2 rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
          b2Vec2.SubVV(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
          const rA = b2Rot.MulRV(qA, this.m_lalcA, this.m_rA);
          // b2Vec2 rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
          b2Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
          const rB = b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);
          // Get the pulley axes.
          // b2Vec2 uA = cA + rA - m_groundAnchorA;
          const uA = this.m_uA.Copy(cA).SelfAdd(rA).SelfSub(this.m_groundAnchorA);
          // b2Vec2 uB = cB + rB - m_groundAnchorB;
          const uB = this.m_uB.Copy(cB).SelfAdd(rB).SelfSub(this.m_groundAnchorB);
          const lengthA = uA.Length();
          const lengthB = uB.Length();
          if (lengthA > 10 * b2_linearSlop) {
              uA.SelfMul(1 / lengthA);
          }
          else {
              uA.SetZero();
          }
          if (lengthB > 10 * b2_linearSlop) {
              uB.SelfMul(1 / lengthB);
          }
          else {
              uB.SetZero();
          }
          // Compute effective mass.
          const ruA = b2Vec2.CrossVV(rA, uA);
          const ruB = b2Vec2.CrossVV(rB, uB);
          const mA = this.m_invMassA + this.m_invIA * ruA * ruA;
          const mB = this.m_invMassB + this.m_invIB * ruB * ruB;
          let mass = mA + this.m_ratio * this.m_ratio * mB;
          if (mass > 0) {
              mass = 1 / mass;
          }
          const C = this.m_constant - lengthA - this.m_ratio * lengthB;
          const linearError = b2Abs(C);
          const impulse = -mass * C;
          // b2Vec2 PA = -impulse * uA;
          const PA = b2Vec2.MulSV(-impulse, uA, b2PulleyJoint.SolvePositionConstraints_s_PA);
          // b2Vec2 PB = -m_ratio * impulse * uB;
          const PB = b2Vec2.MulSV(-this.m_ratio * impulse, uB, b2PulleyJoint.SolvePositionConstraints_s_PB);
          // cA += m_invMassA * PA;
          cA.SelfMulAdd(this.m_invMassA, PA);
          aA += this.m_invIA * b2Vec2.CrossVV(rA, PA);
          // cB += m_invMassB * PB;
          cB.SelfMulAdd(this.m_invMassB, PB);
          aB += this.m_invIB * b2Vec2.CrossVV(rB, PB);
          // data.positions[this.m_indexA].c = cA;
          data.positions[this.m_indexA].a = aA;
          // data.positions[this.m_indexB].c = cB;
          data.positions[this.m_indexB].a = aB;
          return linearError < b2_linearSlop;
      }
      GetAnchorA(out) {
          return this.m_bodyA.GetWorldPoint(this.m_localAnchorA, out);
      }
      GetAnchorB(out) {
          return this.m_bodyB.GetWorldPoint(this.m_localAnchorB, out);
      }
      GetReactionForce(inv_dt, out) {
          // b2Vec2 P = m_impulse * m_uB;
          // return inv_dt * P;
          out.x = inv_dt * this.m_impulse * this.m_uB.x;
          out.y = inv_dt * this.m_impulse * this.m_uB.y;
          return out;
      }
      GetReactionTorque(inv_dt) {
          return 0;
      }
      GetGroundAnchorA() {
          return this.m_groundAnchorA;
      }
      GetGroundAnchorB() {
          return this.m_groundAnchorB;
      }
      GetLengthA() {
          return this.m_lengthA;
      }
      GetLengthB() {
          return this.m_lengthB;
      }
      GetRatio() {
          return this.m_ratio;
      }
      GetCurrentLengthA() {
          // b2Vec2 p = m_bodyA->GetWorldPoint(m_localAnchorA);
          // b2Vec2 s = m_groundAnchorA;
          // b2Vec2 d = p - s;
          // return d.Length();
          const p = this.m_bodyA.GetWorldPoint(this.m_localAnchorA, b2PulleyJoint.GetCurrentLengthA_s_p);
          const s = this.m_groundAnchorA;
          return b2Vec2.DistanceVV(p, s);
      }
      GetCurrentLengthB() {
          // b2Vec2 p = m_bodyB->GetWorldPoint(m_localAnchorB);
          // b2Vec2 s = m_groundAnchorB;
          // b2Vec2 d = p - s;
          // return d.Length();
          const p = this.m_bodyB.GetWorldPoint(this.m_localAnchorB, b2PulleyJoint.GetCurrentLengthB_s_p);
          const s = this.m_groundAnchorB;
          return b2Vec2.DistanceVV(p, s);
      }
      Dump(log) {
          const indexA = this.m_bodyA.m_islandIndex;
          const indexB = this.m_bodyB.m_islandIndex;
          log("  const jd: b2PulleyJointDef = new b2PulleyJointDef();\n");
          log("  jd.bodyA = bodies[%d];\n", indexA);
          log("  jd.bodyB = bodies[%d];\n", indexB);
          log("  jd.collideConnected = %s;\n", (this.m_collideConnected) ? ("true") : ("false"));
          log("  jd.groundAnchorA.Set(%.15f, %.15f);\n", this.m_groundAnchorA.x, this.m_groundAnchorA.y);
          log("  jd.groundAnchorB.Set(%.15f, %.15f);\n", this.m_groundAnchorB.x, this.m_groundAnchorB.y);
          log("  jd.localAnchorA.Set(%.15f, %.15f);\n", this.m_localAnchorA.x, this.m_localAnchorA.y);
          log("  jd.localAnchorB.Set(%.15f, %.15f);\n", this.m_localAnchorB.x, this.m_localAnchorB.y);
          log("  jd.lengthA = %.15f;\n", this.m_lengthA);
          log("  jd.lengthB = %.15f;\n", this.m_lengthB);
          log("  jd.ratio = %.15f;\n", this.m_ratio);
          log("  joints[%d] = this.m_world.CreateJoint(jd);\n", this.m_index);
      }
      ShiftOrigin(newOrigin) {
          this.m_groundAnchorA.SelfSub(newOrigin);
          this.m_groundAnchorB.SelfSub(newOrigin);
      }
  }
  b2PulleyJoint.InitVelocityConstraints_s_PA = new b2Vec2();
  b2PulleyJoint.InitVelocityConstraints_s_PB = new b2Vec2();
  b2PulleyJoint.SolveVelocityConstraints_s_vpA = new b2Vec2();
  b2PulleyJoint.SolveVelocityConstraints_s_vpB = new b2Vec2();
  b2PulleyJoint.SolveVelocityConstraints_s_PA = new b2Vec2();
  b2PulleyJoint.SolveVelocityConstraints_s_PB = new b2Vec2();
  b2PulleyJoint.SolvePositionConstraints_s_PA = new b2Vec2();
  b2PulleyJoint.SolvePositionConstraints_s_PB = new b2Vec2();
  b2PulleyJoint.GetCurrentLengthA_s_p = new b2Vec2();
  b2PulleyJoint.GetCurrentLengthB_s_p = new b2Vec2();

  /*
  * Copyright (c) 2006-2011 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  /// Revolute joint definition. This requires defining an anchor point where the
  /// bodies are joined. The definition uses local anchor points so that the
  /// initial configuration can violate the constraint slightly. You also need to
  /// specify the initial relative angle for joint limits. This helps when saving
  /// and loading a game.
  /// The local anchor points are measured from the body's origin
  /// rather than the center of mass because:
  /// 1. you might not know where the center of mass will be.
  /// 2. if you add/remove shapes from a body and recompute the mass,
  ///    the joints will be broken.
  class b2RevoluteJointDef extends b2JointDef {
      constructor() {
          super(exports.b2JointType.e_revoluteJoint);
          this.localAnchorA = new b2Vec2(0, 0);
          this.localAnchorB = new b2Vec2(0, 0);
          this.referenceAngle = 0;
          this.enableLimit = false;
          this.lowerAngle = 0;
          this.upperAngle = 0;
          this.enableMotor = false;
          this.motorSpeed = 0;
          this.maxMotorTorque = 0;
      }
      Initialize(bA, bB, anchor) {
          this.bodyA = bA;
          this.bodyB = bB;
          this.bodyA.GetLocalPoint(anchor, this.localAnchorA);
          this.bodyB.GetLocalPoint(anchor, this.localAnchorB);
          this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle();
      }
  }
  class b2RevoluteJoint extends b2Joint {
      constructor(def) {
          super(def);
          // Solver shared
          this.m_localAnchorA = new b2Vec2();
          this.m_localAnchorB = new b2Vec2();
          this.m_impulse = new b2Vec2();
          this.m_motorImpulse = 0;
          this.m_lowerImpulse = 0;
          this.m_upperImpulse = 0;
          this.m_enableMotor = false;
          this.m_maxMotorTorque = 0;
          this.m_motorSpeed = 0;
          this.m_enableLimit = false;
          this.m_referenceAngle = 0;
          this.m_lowerAngle = 0;
          this.m_upperAngle = 0;
          // Solver temp
          this.m_indexA = 0;
          this.m_indexB = 0;
          this.m_rA = new b2Vec2();
          this.m_rB = new b2Vec2();
          this.m_localCenterA = new b2Vec2();
          this.m_localCenterB = new b2Vec2();
          this.m_invMassA = 0;
          this.m_invMassB = 0;
          this.m_invIA = 0;
          this.m_invIB = 0;
          this.m_K = new b2Mat22();
          this.m_angle = 0;
          this.m_axialMass = 0;
          this.m_qA = new b2Rot();
          this.m_qB = new b2Rot();
          this.m_lalcA = new b2Vec2();
          this.m_lalcB = new b2Vec2();
          this.m_localAnchorA.Copy(b2Maybe(def.localAnchorA, b2Vec2.ZERO));
          this.m_localAnchorB.Copy(b2Maybe(def.localAnchorB, b2Vec2.ZERO));
          this.m_referenceAngle = b2Maybe(def.referenceAngle, 0);
          this.m_impulse.SetZero();
          this.m_motorImpulse = 0;
          this.m_lowerAngle = b2Maybe(def.lowerAngle, 0);
          this.m_upperAngle = b2Maybe(def.upperAngle, 0);
          this.m_maxMotorTorque = b2Maybe(def.maxMotorTorque, 0);
          this.m_motorSpeed = b2Maybe(def.motorSpeed, 0);
          this.m_enableLimit = b2Maybe(def.enableLimit, false);
          this.m_enableMotor = b2Maybe(def.enableMotor, false);
      }
      InitVelocityConstraints(data) {
          this.m_indexA = this.m_bodyA.m_islandIndex;
          this.m_indexB = this.m_bodyB.m_islandIndex;
          this.m_localCenterA.Copy(this.m_bodyA.m_sweep.localCenter);
          this.m_localCenterB.Copy(this.m_bodyB.m_sweep.localCenter);
          this.m_invMassA = this.m_bodyA.m_invMass;
          this.m_invMassB = this.m_bodyB.m_invMass;
          this.m_invIA = this.m_bodyA.m_invI;
          this.m_invIB = this.m_bodyB.m_invI;
          const aA = data.positions[this.m_indexA].a;
          const vA = data.velocities[this.m_indexA].v;
          let wA = data.velocities[this.m_indexA].w;
          const aB = data.positions[this.m_indexB].a;
          const vB = data.velocities[this.m_indexB].v;
          let wB = data.velocities[this.m_indexB].w;
          // b2Rot qA(aA), qB(aB);
          const qA = this.m_qA.SetAngle(aA), qB = this.m_qB.SetAngle(aB);
          // m_rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
          b2Vec2.SubVV(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
          b2Rot.MulRV(qA, this.m_lalcA, this.m_rA);
          // m_rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
          b2Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
          b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);
          // J = [-I -r1_skew I r2_skew]
          // r_skew = [-ry; rx]
          // Matlab
          // K = [ mA+r1y^2*iA+mB+r2y^2*iB,  -r1y*iA*r1x-r2y*iB*r2x]
          //     [  -r1y*iA*r1x-r2y*iB*r2x, mA+r1x^2*iA+mB+r2x^2*iB]
          const mA = this.m_invMassA, mB = this.m_invMassB;
          const iA = this.m_invIA, iB = this.m_invIB;
          this.m_K.ex.x = mA + mB + this.m_rA.y * this.m_rA.y * iA + this.m_rB.y * this.m_rB.y * iB;
          this.m_K.ey.x = -this.m_rA.y * this.m_rA.x * iA - this.m_rB.y * this.m_rB.x * iB;
          this.m_K.ex.y = this.m_K.ey.x;
          this.m_K.ey.y = mA + mB + this.m_rA.x * this.m_rA.x * iA + this.m_rB.x * this.m_rB.x * iB;
          this.m_axialMass = iA + iB;
          let fixedRotation;
          if (this.m_axialMass > 0.0) {
              this.m_axialMass = 1.0 / this.m_axialMass;
              fixedRotation = false;
          }
          else {
              fixedRotation = true;
          }
          this.m_angle = aB - aA - this.m_referenceAngle;
          if (this.m_enableLimit === false || fixedRotation) {
              this.m_lowerImpulse = 0.0;
              this.m_upperImpulse = 0.0;
          }
          if (this.m_enableMotor === false || fixedRotation) {
              this.m_motorImpulse = 0.0;
          }
          if (data.step.warmStarting) {
              // Scale impulses to support a variable time step.
              this.m_impulse.SelfMul(data.step.dtRatio);
              this.m_motorImpulse *= data.step.dtRatio;
              this.m_lowerImpulse *= data.step.dtRatio;
              this.m_upperImpulse *= data.step.dtRatio;
              const axialImpulse = this.m_motorImpulse + this.m_lowerImpulse - this.m_upperImpulse;
              // b2Vec2 P(m_impulse.x, m_impulse.y);
              const P = b2RevoluteJoint.InitVelocityConstraints_s_P.Set(this.m_impulse.x, this.m_impulse.y);
              // vA -= mA * P;
              vA.SelfMulSub(mA, P);
              wA -= iA * (b2Vec2.CrossVV(this.m_rA, P) + axialImpulse);
              // vB += mB * P;
              vB.SelfMulAdd(mB, P);
              wB += iB * (b2Vec2.CrossVV(this.m_rB, P) + axialImpulse);
          }
          else {
              this.m_impulse.SetZero();
              this.m_motorImpulse = 0;
              this.m_lowerImpulse = 0;
              this.m_upperImpulse = 0;
          }
          // data.velocities[this.m_indexA].v = vA;
          data.velocities[this.m_indexA].w = wA;
          // data.velocities[this.m_indexB].v = vB;
          data.velocities[this.m_indexB].w = wB;
      }
      SolveVelocityConstraints(data) {
          const vA = data.velocities[this.m_indexA].v;
          let wA = data.velocities[this.m_indexA].w;
          const vB = data.velocities[this.m_indexB].v;
          let wB = data.velocities[this.m_indexB].w;
          const mA = this.m_invMassA, mB = this.m_invMassB;
          const iA = this.m_invIA, iB = this.m_invIB;
          const fixedRotation = (iA + iB === 0);
          // Solve motor constraint.
          if (this.m_enableMotor && !fixedRotation) {
              const Cdot = wB - wA - this.m_motorSpeed;
              let impulse = -this.m_axialMass * Cdot;
              const oldImpulse = this.m_motorImpulse;
              const maxImpulse = data.step.dt * this.m_maxMotorTorque;
              this.m_motorImpulse = b2Clamp(this.m_motorImpulse + impulse, -maxImpulse, maxImpulse);
              impulse = this.m_motorImpulse - oldImpulse;
              wA -= iA * impulse;
              wB += iB * impulse;
          }
          // Solve limit constraint.
          if (this.m_enableLimit && !fixedRotation) {
              // Lower limit
              {
                  const C = this.m_angle - this.m_lowerAngle;
                  const Cdot = wB - wA;
                  let impulse = -this.m_axialMass * (Cdot + b2Max(C, 0.0) * data.step.inv_dt);
                  const oldImpulse = this.m_lowerImpulse;
                  this.m_lowerImpulse = b2Max(this.m_lowerImpulse + impulse, 0.0);
                  impulse = this.m_lowerImpulse - oldImpulse;
                  wA -= iA * impulse;
                  wB += iB * impulse;
              }
              // Upper limit
              // Note: signs are flipped to keep C positive when the constraint is satisfied.
              // This also keeps the impulse positive when the limit is active.
              {
                  const C = this.m_upperAngle - this.m_angle;
                  const Cdot = wA - wB;
                  let impulse = -this.m_axialMass * (Cdot + b2Max(C, 0.0) * data.step.inv_dt);
                  const oldImpulse = this.m_upperImpulse;
                  this.m_upperImpulse = b2Max(this.m_upperImpulse + impulse, 0.0);
                  impulse = this.m_upperImpulse - oldImpulse;
                  wA += iA * impulse;
                  wB -= iB * impulse;
              }
          }
          // Solve point-to-point constraint
          {
              // b2Vec2 Cdot = vB + b2Cross(wB, m_rB) - vA - b2Cross(wA, m_rA);
              const Cdot_v2 = b2Vec2.SubVV(b2Vec2.AddVCrossSV(vB, wB, this.m_rB, b2Vec2.s_t0), b2Vec2.AddVCrossSV(vA, wA, this.m_rA, b2Vec2.s_t1), b2RevoluteJoint.SolveVelocityConstraints_s_Cdot_v2);
              // b2Vec2 impulse = m_K.Solve(-Cdot);
              const impulse_v2 = this.m_K.Solve(-Cdot_v2.x, -Cdot_v2.y, b2RevoluteJoint.SolveVelocityConstraints_s_impulse_v2);
              this.m_impulse.x += impulse_v2.x;
              this.m_impulse.y += impulse_v2.y;
              // vA -= mA * impulse;
              vA.SelfMulSub(mA, impulse_v2);
              wA -= iA * b2Vec2.CrossVV(this.m_rA, impulse_v2);
              // vB += mB * impulse;
              vB.SelfMulAdd(mB, impulse_v2);
              wB += iB * b2Vec2.CrossVV(this.m_rB, impulse_v2);
          }
          // data.velocities[this.m_indexA].v = vA;
          data.velocities[this.m_indexA].w = wA;
          // data.velocities[this.m_indexB].v = vB;
          data.velocities[this.m_indexB].w = wB;
      }
      SolvePositionConstraints(data) {
          const cA = data.positions[this.m_indexA].c;
          let aA = data.positions[this.m_indexA].a;
          const cB = data.positions[this.m_indexB].c;
          let aB = data.positions[this.m_indexB].a;
          // b2Rot qA(aA), qB(aB);
          const qA = this.m_qA.SetAngle(aA), qB = this.m_qB.SetAngle(aB);
          let angularError = 0;
          let positionError = 0;
          const fixedRotation = (this.m_invIA + this.m_invIB === 0);
          // Solve angular limit constraint.
          if (this.m_enableLimit && !fixedRotation) {
              const angle = aB - aA - this.m_referenceAngle;
              let C = 0.0;
              if (b2Abs(this.m_upperAngle - this.m_lowerAngle) < 2.0 * b2_angularSlop) {
                  // Prevent large angular corrections
                  C = b2Clamp(angle - this.m_lowerAngle, -b2_maxAngularCorrection, b2_maxAngularCorrection);
              }
              else if (angle <= this.m_lowerAngle) {
                  // Prevent large angular corrections and allow some slop.
                  C = b2Clamp(angle - this.m_lowerAngle + b2_angularSlop, -b2_maxAngularCorrection, 0.0);
              }
              else if (angle >= this.m_upperAngle) {
                  // Prevent large angular corrections and allow some slop.
                  C = b2Clamp(angle - this.m_upperAngle - b2_angularSlop, 0.0, b2_maxAngularCorrection);
              }
              const limitImpulse = -this.m_axialMass * C;
              aA -= this.m_invIA * limitImpulse;
              aB += this.m_invIB * limitImpulse;
              angularError = b2Abs(C);
          }
          // Solve point-to-point constraint.
          {
              qA.SetAngle(aA);
              qB.SetAngle(aB);
              // b2Vec2 rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
              b2Vec2.SubVV(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
              const rA = b2Rot.MulRV(qA, this.m_lalcA, this.m_rA);
              // b2Vec2 rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
              b2Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
              const rB = b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);
              // b2Vec2 C = cB + rB - cA - rA;
              const C_v2 = b2Vec2.SubVV(b2Vec2.AddVV(cB, rB, b2Vec2.s_t0), b2Vec2.AddVV(cA, rA, b2Vec2.s_t1), b2RevoluteJoint.SolvePositionConstraints_s_C_v2);
              // positionError = C.Length();
              positionError = C_v2.Length();
              const mA = this.m_invMassA, mB = this.m_invMassB;
              const iA = this.m_invIA, iB = this.m_invIB;
              const K = this.m_K;
              K.ex.x = mA + mB + iA * rA.y * rA.y + iB * rB.y * rB.y;
              K.ex.y = -iA * rA.x * rA.y - iB * rB.x * rB.y;
              K.ey.x = K.ex.y;
              K.ey.y = mA + mB + iA * rA.x * rA.x + iB * rB.x * rB.x;
              // b2Vec2 impulse = -K.Solve(C);
              const impulse = K.Solve(C_v2.x, C_v2.y, b2RevoluteJoint.SolvePositionConstraints_s_impulse).SelfNeg();
              // cA -= mA * impulse;
              cA.SelfMulSub(mA, impulse);
              aA -= iA * b2Vec2.CrossVV(rA, impulse);
              // cB += mB * impulse;
              cB.SelfMulAdd(mB, impulse);
              aB += iB * b2Vec2.CrossVV(rB, impulse);
          }
          // data.positions[this.m_indexA].c = cA;
          data.positions[this.m_indexA].a = aA;
          // data.positions[this.m_indexB].c = cB;
          data.positions[this.m_indexB].a = aB;
          return positionError <= b2_linearSlop && angularError <= b2_angularSlop;
      }
      GetAnchorA(out) {
          return this.m_bodyA.GetWorldPoint(this.m_localAnchorA, out);
      }
      GetAnchorB(out) {
          return this.m_bodyB.GetWorldPoint(this.m_localAnchorB, out);
      }
      GetReactionForce(inv_dt, out) {
          // b2Vec2 P(this.m_impulse.x, this.m_impulse.y);
          // return inv_dt * P;
          out.x = inv_dt * this.m_impulse.x;
          out.y = inv_dt * this.m_impulse.y;
          return out;
      }
      GetReactionTorque(inv_dt) {
          return inv_dt * (this.m_lowerImpulse - this.m_upperImpulse);
      }
      GetLocalAnchorA() { return this.m_localAnchorA; }
      GetLocalAnchorB() { return this.m_localAnchorB; }
      GetReferenceAngle() { return this.m_referenceAngle; }
      GetJointAngle() {
          // b2Body* bA = this.m_bodyA;
          // b2Body* bB = this.m_bodyB;
          // return bB.this.m_sweep.a - bA.this.m_sweep.a - this.m_referenceAngle;
          return this.m_bodyB.m_sweep.a - this.m_bodyA.m_sweep.a - this.m_referenceAngle;
      }
      GetJointSpeed() {
          // b2Body* bA = this.m_bodyA;
          // b2Body* bB = this.m_bodyB;
          // return bB.this.m_angularVelocity - bA.this.m_angularVelocity;
          return this.m_bodyB.m_angularVelocity - this.m_bodyA.m_angularVelocity;
      }
      IsMotorEnabled() {
          return this.m_enableMotor;
      }
      EnableMotor(flag) {
          if (flag !== this.m_enableMotor) {
              this.m_bodyA.SetAwake(true);
              this.m_bodyB.SetAwake(true);
              this.m_enableMotor = flag;
          }
      }
      GetMotorTorque(inv_dt) {
          return inv_dt * this.m_motorImpulse;
      }
      GetMotorSpeed() {
          return this.m_motorSpeed;
      }
      SetMaxMotorTorque(torque) {
          if (torque !== this.m_maxMotorTorque) {
              this.m_bodyA.SetAwake(true);
              this.m_bodyB.SetAwake(true);
              this.m_maxMotorTorque = torque;
          }
      }
      GetMaxMotorTorque() { return this.m_maxMotorTorque; }
      IsLimitEnabled() {
          return this.m_enableLimit;
      }
      EnableLimit(flag) {
          if (flag !== this.m_enableLimit) {
              this.m_bodyA.SetAwake(true);
              this.m_bodyB.SetAwake(true);
              this.m_enableLimit = flag;
              this.m_lowerImpulse = 0.0;
              this.m_upperImpulse = 0.0;
          }
      }
      GetLowerLimit() {
          return this.m_lowerAngle;
      }
      GetUpperLimit() {
          return this.m_upperAngle;
      }
      SetLimits(lower, upper) {
          if (lower !== this.m_lowerAngle || upper !== this.m_upperAngle) {
              this.m_bodyA.SetAwake(true);
              this.m_bodyB.SetAwake(true);
              this.m_lowerImpulse = 0.0;
              this.m_upperImpulse = 0.0;
              this.m_lowerAngle = lower;
              this.m_upperAngle = upper;
          }
      }
      SetMotorSpeed(speed) {
          if (speed !== this.m_motorSpeed) {
              this.m_bodyA.SetAwake(true);
              this.m_bodyB.SetAwake(true);
              this.m_motorSpeed = speed;
          }
      }
      Dump(log) {
          const indexA = this.m_bodyA.m_islandIndex;
          const indexB = this.m_bodyB.m_islandIndex;
          log("  const jd: b2RevoluteJointDef = new b2RevoluteJointDef();\n");
          log("  jd.bodyA = bodies[%d];\n", indexA);
          log("  jd.bodyB = bodies[%d];\n", indexB);
          log("  jd.collideConnected = %s;\n", (this.m_collideConnected) ? ("true") : ("false"));
          log("  jd.localAnchorA.Set(%.15f, %.15f);\n", this.m_localAnchorA.x, this.m_localAnchorA.y);
          log("  jd.localAnchorB.Set(%.15f, %.15f);\n", this.m_localAnchorB.x, this.m_localAnchorB.y);
          log("  jd.referenceAngle = %.15f;\n", this.m_referenceAngle);
          log("  jd.enableLimit = %s;\n", (this.m_enableLimit) ? ("true") : ("false"));
          log("  jd.lowerAngle = %.15f;\n", this.m_lowerAngle);
          log("  jd.upperAngle = %.15f;\n", this.m_upperAngle);
          log("  jd.enableMotor = %s;\n", (this.m_enableMotor) ? ("true") : ("false"));
          log("  jd.motorSpeed = %.15f;\n", this.m_motorSpeed);
          log("  jd.maxMotorTorque = %.15f;\n", this.m_maxMotorTorque);
          log("  joints[%d] = this.m_world.CreateJoint(jd);\n", this.m_index);
      }
      Draw(draw) {
          const xfA = this.m_bodyA.GetTransform();
          const xfB = this.m_bodyB.GetTransform();
          const pA = b2Transform.MulXV(xfA, this.m_localAnchorA, b2RevoluteJoint.Draw_s_pA);
          const pB = b2Transform.MulXV(xfB, this.m_localAnchorB, b2RevoluteJoint.Draw_s_pB);
          const c1 = b2RevoluteJoint.Draw_s_c1; // b2Color c1(0.7f, 0.7f, 0.7f);
          const c2 = b2RevoluteJoint.Draw_s_c2; // b2Color c2(0.3f, 0.9f, 0.3f);
          const c3 = b2RevoluteJoint.Draw_s_c3; // b2Color c3(0.9f, 0.3f, 0.3f);
          const c4 = b2RevoluteJoint.Draw_s_c4; // b2Color c4(0.3f, 0.3f, 0.9f);
          const c5 = b2RevoluteJoint.Draw_s_c5; // b2Color c5(0.4f, 0.4f, 0.4f);
          draw.DrawPoint(pA, 5.0, c4);
          draw.DrawPoint(pB, 5.0, c5);
          const aA = this.m_bodyA.GetAngle();
          const aB = this.m_bodyB.GetAngle();
          const angle = aB - aA - this.m_referenceAngle;
          const L = 0.5;
          // b2Vec2 r = L * b2Vec2(Math.cos(angle), Math.sin(angle));
          const r = b2RevoluteJoint.Draw_s_r.Set(L * Math.cos(angle), L * Math.sin(angle));
          // draw.DrawSegment(pB, pB + r, c1);
          draw.DrawSegment(pB, b2Vec2.AddVV(pB, r, b2Vec2.s_t0), c1);
          draw.DrawCircle(pB, L, c1);
          if (this.m_enableLimit) {
              // b2Vec2 rlo = L * b2Vec2(Math.cos(m_lowerAngle), Math.sin(m_lowerAngle));
              const rlo = b2RevoluteJoint.Draw_s_rlo.Set(L * Math.cos(this.m_lowerAngle), L * Math.sin(this.m_lowerAngle));
              // b2Vec2 rhi = L * b2Vec2(Math.cos(m_upperAngle), Math.sin(m_upperAngle));
              const rhi = b2RevoluteJoint.Draw_s_rhi.Set(L * Math.cos(this.m_upperAngle), L * Math.sin(this.m_upperAngle));
              // draw.DrawSegment(pB, pB + rlo, c2);
              draw.DrawSegment(pB, b2Vec2.AddVV(pB, rlo, b2Vec2.s_t0), c2);
              // draw.DrawSegment(pB, pB + rhi, c3);
              draw.DrawSegment(pB, b2Vec2.AddVV(pB, rhi, b2Vec2.s_t0), c3);
          }
          const color = b2RevoluteJoint.Draw_s_color_; // b2Color color(0.5f, 0.8f, 0.8f);
          draw.DrawSegment(xfA.p, pA, color);
          draw.DrawSegment(pA, pB, color);
          draw.DrawSegment(xfB.p, pB, color);
      }
  }
  b2RevoluteJoint.InitVelocityConstraints_s_P = new b2Vec2();
  // private static SolveVelocityConstraints_s_P: b2Vec2 = new b2Vec2();
  b2RevoluteJoint.SolveVelocityConstraints_s_Cdot_v2 = new b2Vec2();
  // private static SolveVelocityConstraints_s_Cdot1: b2Vec2 = new b2Vec2();
  // private static SolveVelocityConstraints_s_impulse_v3: b2Vec3 = new b2Vec3();
  // private static SolveVelocityConstraints_s_reduced_v2: b2Vec2 = new b2Vec2();
  b2RevoluteJoint.SolveVelocityConstraints_s_impulse_v2 = new b2Vec2();
  b2RevoluteJoint.SolvePositionConstraints_s_C_v2 = new b2Vec2();
  b2RevoluteJoint.SolvePositionConstraints_s_impulse = new b2Vec2();
  b2RevoluteJoint.Draw_s_pA = new b2Vec2();
  b2RevoluteJoint.Draw_s_pB = new b2Vec2();
  b2RevoluteJoint.Draw_s_c1 = new b2Color(0.7, 0.7, 0.7);
  b2RevoluteJoint.Draw_s_c2 = new b2Color(0.3, 0.9, 0.3);
  b2RevoluteJoint.Draw_s_c3 = new b2Color(0.9, 0.3, 0.3);
  b2RevoluteJoint.Draw_s_c4 = new b2Color(0.3, 0.3, 0.9);
  b2RevoluteJoint.Draw_s_c5 = new b2Color(0.4, 0.4, 0.4);
  b2RevoluteJoint.Draw_s_color_ = new b2Color(0.5, 0.8, 0.8);
  b2RevoluteJoint.Draw_s_r = new b2Vec2();
  b2RevoluteJoint.Draw_s_rlo = new b2Vec2();
  b2RevoluteJoint.Draw_s_rhi = new b2Vec2();

  /*
  * Copyright (c) 2006-2011 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  /// Weld joint definition. You need to specify local anchor points
  /// where they are attached and the relative body angle. The position
  /// of the anchor points is important for computing the reaction torque.
  class b2WeldJointDef extends b2JointDef {
      constructor() {
          super(exports.b2JointType.e_weldJoint);
          this.localAnchorA = new b2Vec2();
          this.localAnchorB = new b2Vec2();
          this.referenceAngle = 0;
          this.stiffness = 0;
          this.damping = 0;
      }
      Initialize(bA, bB, anchor) {
          this.bodyA = bA;
          this.bodyB = bB;
          this.bodyA.GetLocalPoint(anchor, this.localAnchorA);
          this.bodyB.GetLocalPoint(anchor, this.localAnchorB);
          this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle();
      }
  }
  class b2WeldJoint extends b2Joint {
      constructor(def) {
          super(def);
          this.m_stiffness = 0;
          this.m_damping = 0;
          this.m_bias = 0;
          // Solver shared
          this.m_localAnchorA = new b2Vec2();
          this.m_localAnchorB = new b2Vec2();
          this.m_referenceAngle = 0;
          this.m_gamma = 0;
          this.m_impulse = new b2Vec3(0, 0, 0);
          // Solver temp
          this.m_indexA = 0;
          this.m_indexB = 0;
          this.m_rA = new b2Vec2();
          this.m_rB = new b2Vec2();
          this.m_localCenterA = new b2Vec2();
          this.m_localCenterB = new b2Vec2();
          this.m_invMassA = 0;
          this.m_invMassB = 0;
          this.m_invIA = 0;
          this.m_invIB = 0;
          this.m_mass = new b2Mat33();
          this.m_qA = new b2Rot();
          this.m_qB = new b2Rot();
          this.m_lalcA = new b2Vec2();
          this.m_lalcB = new b2Vec2();
          this.m_K = new b2Mat33();
          this.m_stiffness = b2Maybe(def.stiffness, 0);
          this.m_damping = b2Maybe(def.damping, 0);
          this.m_localAnchorA.Copy(b2Maybe(def.localAnchorA, b2Vec2.ZERO));
          this.m_localAnchorB.Copy(b2Maybe(def.localAnchorB, b2Vec2.ZERO));
          this.m_referenceAngle = b2Maybe(def.referenceAngle, 0);
          this.m_impulse.SetZero();
      }
      InitVelocityConstraints(data) {
          this.m_indexA = this.m_bodyA.m_islandIndex;
          this.m_indexB = this.m_bodyB.m_islandIndex;
          this.m_localCenterA.Copy(this.m_bodyA.m_sweep.localCenter);
          this.m_localCenterB.Copy(this.m_bodyB.m_sweep.localCenter);
          this.m_invMassA = this.m_bodyA.m_invMass;
          this.m_invMassB = this.m_bodyB.m_invMass;
          this.m_invIA = this.m_bodyA.m_invI;
          this.m_invIB = this.m_bodyB.m_invI;
          const aA = data.positions[this.m_indexA].a;
          const vA = data.velocities[this.m_indexA].v;
          let wA = data.velocities[this.m_indexA].w;
          const aB = data.positions[this.m_indexB].a;
          const vB = data.velocities[this.m_indexB].v;
          let wB = data.velocities[this.m_indexB].w;
          const qA = this.m_qA.SetAngle(aA), qB = this.m_qB.SetAngle(aB);
          // m_rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
          b2Vec2.SubVV(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
          b2Rot.MulRV(qA, this.m_lalcA, this.m_rA);
          // m_rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
          b2Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
          b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);
          // J = [-I -r1_skew I r2_skew]
          //     [ 0       -1 0       1]
          // r_skew = [-ry; rx]
          // Matlab
          // K = [ mA+r1y^2*iA+mB+r2y^2*iB,  -r1y*iA*r1x-r2y*iB*r2x,          -r1y*iA-r2y*iB]
          //     [  -r1y*iA*r1x-r2y*iB*r2x, mA+r1x^2*iA+mB+r2x^2*iB,           r1x*iA+r2x*iB]
          //     [          -r1y*iA-r2y*iB,           r1x*iA+r2x*iB,                   iA+iB]
          const mA = this.m_invMassA, mB = this.m_invMassB;
          const iA = this.m_invIA, iB = this.m_invIB;
          const K = this.m_K;
          K.ex.x = mA + mB + this.m_rA.y * this.m_rA.y * iA + this.m_rB.y * this.m_rB.y * iB;
          K.ey.x = -this.m_rA.y * this.m_rA.x * iA - this.m_rB.y * this.m_rB.x * iB;
          K.ez.x = -this.m_rA.y * iA - this.m_rB.y * iB;
          K.ex.y = K.ey.x;
          K.ey.y = mA + mB + this.m_rA.x * this.m_rA.x * iA + this.m_rB.x * this.m_rB.x * iB;
          K.ez.y = this.m_rA.x * iA + this.m_rB.x * iB;
          K.ex.z = K.ez.x;
          K.ey.z = K.ez.y;
          K.ez.z = iA + iB;
          if (this.m_stiffness > 0) {
              K.GetInverse22(this.m_mass);
              let invM = iA + iB;
              const C = aB - aA - this.m_referenceAngle;
              // Damping coefficient
              const d = this.m_damping;
              // Spring stiffness
              const k = this.m_stiffness;
              // magic formulas
              const h = data.step.dt;
              this.m_gamma = h * (d + h * k);
              this.m_gamma = this.m_gamma !== 0 ? 1 / this.m_gamma : 0;
              this.m_bias = C * h * k * this.m_gamma;
              invM += this.m_gamma;
              this.m_mass.ez.z = invM !== 0 ? 1 / invM : 0;
          }
          else {
              K.GetSymInverse33(this.m_mass);
              this.m_gamma = 0;
              this.m_bias = 0;
          }
          if (data.step.warmStarting) {
              // Scale impulses to support a variable time step.
              this.m_impulse.SelfMul(data.step.dtRatio);
              // b2Vec2 P(m_impulse.x, m_impulse.y);
              const P = b2WeldJoint.InitVelocityConstraints_s_P.Set(this.m_impulse.x, this.m_impulse.y);
              // vA -= mA * P;
              vA.SelfMulSub(mA, P);
              wA -= iA * (b2Vec2.CrossVV(this.m_rA, P) + this.m_impulse.z);
              // vB += mB * P;
              vB.SelfMulAdd(mB, P);
              wB += iB * (b2Vec2.CrossVV(this.m_rB, P) + this.m_impulse.z);
          }
          else {
              this.m_impulse.SetZero();
          }
          // data.velocities[this.m_indexA].v = vA;
          data.velocities[this.m_indexA].w = wA;
          // data.velocities[this.m_indexB].v = vB;
          data.velocities[this.m_indexB].w = wB;
      }
      SolveVelocityConstraints(data) {
          const vA = data.velocities[this.m_indexA].v;
          let wA = data.velocities[this.m_indexA].w;
          const vB = data.velocities[this.m_indexB].v;
          let wB = data.velocities[this.m_indexB].w;
          const mA = this.m_invMassA, mB = this.m_invMassB;
          const iA = this.m_invIA, iB = this.m_invIB;
          if (this.m_stiffness > 0) {
              const Cdot2 = wB - wA;
              const impulse2 = -this.m_mass.ez.z * (Cdot2 + this.m_bias + this.m_gamma * this.m_impulse.z);
              this.m_impulse.z += impulse2;
              wA -= iA * impulse2;
              wB += iB * impulse2;
              // b2Vec2 Cdot1 = vB + b2Vec2.CrossSV(wB, this.m_rB) - vA - b2Vec2.CrossSV(wA, this.m_rA);
              const Cdot1 = b2Vec2.SubVV(b2Vec2.AddVCrossSV(vB, wB, this.m_rB, b2Vec2.s_t0), b2Vec2.AddVCrossSV(vA, wA, this.m_rA, b2Vec2.s_t1), b2WeldJoint.SolveVelocityConstraints_s_Cdot1);
              // b2Vec2 impulse1 = -b2Mul22(m_mass, Cdot1);
              const impulse1 = b2Mat33.MulM33XY(this.m_mass, Cdot1.x, Cdot1.y, b2WeldJoint.SolveVelocityConstraints_s_impulse1).SelfNeg();
              this.m_impulse.x += impulse1.x;
              this.m_impulse.y += impulse1.y;
              // b2Vec2 P = impulse1;
              const P = impulse1;
              // vA -= mA * P;
              vA.SelfMulSub(mA, P);
              // wA -= iA * b2Cross(m_rA, P);
              wA -= iA * b2Vec2.CrossVV(this.m_rA, P);
              // vB += mB * P;
              vB.SelfMulAdd(mB, P);
              // wB += iB * b2Cross(m_rB, P);
              wB += iB * b2Vec2.CrossVV(this.m_rB, P);
          }
          else {
              // b2Vec2 Cdot1 = vB + b2Cross(wB, this.m_rB) - vA - b2Cross(wA, this.m_rA);
              const Cdot1 = b2Vec2.SubVV(b2Vec2.AddVCrossSV(vB, wB, this.m_rB, b2Vec2.s_t0), b2Vec2.AddVCrossSV(vA, wA, this.m_rA, b2Vec2.s_t1), b2WeldJoint.SolveVelocityConstraints_s_Cdot1);
              const Cdot2 = wB - wA;
              // b2Vec3 const Cdot(Cdot1.x, Cdot1.y, Cdot2);
              // b2Vec3 impulse = -b2Mul(m_mass, Cdot);
              const impulse = b2Mat33.MulM33XYZ(this.m_mass, Cdot1.x, Cdot1.y, Cdot2, b2WeldJoint.SolveVelocityConstraints_s_impulse).SelfNeg();
              this.m_impulse.SelfAdd(impulse);
              // b2Vec2 P(impulse.x, impulse.y);
              const P = b2WeldJoint.SolveVelocityConstraints_s_P.Set(impulse.x, impulse.y);
              // vA -= mA * P;
              vA.SelfMulSub(mA, P);
              wA -= iA * (b2Vec2.CrossVV(this.m_rA, P) + impulse.z);
              // vB += mB * P;
              vB.SelfMulAdd(mB, P);
              wB += iB * (b2Vec2.CrossVV(this.m_rB, P) + impulse.z);
          }
          // data.velocities[this.m_indexA].v = vA;
          data.velocities[this.m_indexA].w = wA;
          // data.velocities[this.m_indexB].v = vB;
          data.velocities[this.m_indexB].w = wB;
      }
      SolvePositionConstraints(data) {
          const cA = data.positions[this.m_indexA].c;
          let aA = data.positions[this.m_indexA].a;
          const cB = data.positions[this.m_indexB].c;
          let aB = data.positions[this.m_indexB].a;
          const qA = this.m_qA.SetAngle(aA), qB = this.m_qB.SetAngle(aB);
          const mA = this.m_invMassA, mB = this.m_invMassB;
          const iA = this.m_invIA, iB = this.m_invIB;
          // b2Vec2 rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
          b2Vec2.SubVV(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
          const rA = b2Rot.MulRV(qA, this.m_lalcA, this.m_rA);
          // b2Vec2 rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
          b2Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
          const rB = b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);
          let positionError, angularError;
          const K = this.m_K;
          K.ex.x = mA + mB + rA.y * rA.y * iA + rB.y * rB.y * iB;
          K.ey.x = -rA.y * rA.x * iA - rB.y * rB.x * iB;
          K.ez.x = -rA.y * iA - rB.y * iB;
          K.ex.y = K.ey.x;
          K.ey.y = mA + mB + rA.x * rA.x * iA + rB.x * rB.x * iB;
          K.ez.y = rA.x * iA + rB.x * iB;
          K.ex.z = K.ez.x;
          K.ey.z = K.ez.y;
          K.ez.z = iA + iB;
          if (this.m_stiffness > 0) {
              // b2Vec2 C1 =  cB + rB - cA - rA;
              const C1 = b2Vec2.SubVV(b2Vec2.AddVV(cB, rB, b2Vec2.s_t0), b2Vec2.AddVV(cA, rA, b2Vec2.s_t1), b2WeldJoint.SolvePositionConstraints_s_C1);
              positionError = C1.Length();
              angularError = 0;
              // b2Vec2 P = -K.Solve22(C1);
              const P = K.Solve22(C1.x, C1.y, b2WeldJoint.SolvePositionConstraints_s_P).SelfNeg();
              // cA -= mA * P;
              cA.SelfMulSub(mA, P);
              aA -= iA * b2Vec2.CrossVV(rA, P);
              // cB += mB * P;
              cB.SelfMulAdd(mB, P);
              aB += iB * b2Vec2.CrossVV(rB, P);
          }
          else {
              // b2Vec2 C1 =  cB + rB - cA - rA;
              const C1 = b2Vec2.SubVV(b2Vec2.AddVV(cB, rB, b2Vec2.s_t0), b2Vec2.AddVV(cA, rA, b2Vec2.s_t1), b2WeldJoint.SolvePositionConstraints_s_C1);
              const C2 = aB - aA - this.m_referenceAngle;
              positionError = C1.Length();
              angularError = b2Abs(C2);
              // b2Vec3 C(C1.x, C1.y, C2);
              // b2Vec3 impulse = -K.Solve33(C);
              const impulse = K.Solve33(C1.x, C1.y, C2, b2WeldJoint.SolvePositionConstraints_s_impulse).SelfNeg();
              // b2Vec2 P(impulse.x, impulse.y);
              const P = b2WeldJoint.SolvePositionConstraints_s_P.Set(impulse.x, impulse.y);
              // cA -= mA * P;
              cA.SelfMulSub(mA, P);
              aA -= iA * (b2Vec2.CrossVV(this.m_rA, P) + impulse.z);
              // cB += mB * P;
              cB.SelfMulAdd(mB, P);
              aB += iB * (b2Vec2.CrossVV(this.m_rB, P) + impulse.z);
          }
          // data.positions[this.m_indexA].c = cA;
          data.positions[this.m_indexA].a = aA;
          // data.positions[this.m_indexB].c = cB;
          data.positions[this.m_indexB].a = aB;
          return positionError <= b2_linearSlop && angularError <= b2_angularSlop;
      }
      GetAnchorA(out) {
          return this.m_bodyA.GetWorldPoint(this.m_localAnchorA, out);
      }
      GetAnchorB(out) {
          return this.m_bodyB.GetWorldPoint(this.m_localAnchorB, out);
      }
      GetReactionForce(inv_dt, out) {
          // b2Vec2 P(this.m_impulse.x, this.m_impulse.y);
          // return inv_dt * P;
          out.x = inv_dt * this.m_impulse.x;
          out.y = inv_dt * this.m_impulse.y;
          return out;
      }
      GetReactionTorque(inv_dt) {
          return inv_dt * this.m_impulse.z;
      }
      GetLocalAnchorA() { return this.m_localAnchorA; }
      GetLocalAnchorB() { return this.m_localAnchorB; }
      GetReferenceAngle() { return this.m_referenceAngle; }
      SetStiffness(stiffness) { this.m_stiffness = stiffness; }
      GetStiffness() { return this.m_stiffness; }
      SetDamping(damping) { this.m_damping = damping; }
      GetDamping() { return this.m_damping; }
      Dump(log) {
          const indexA = this.m_bodyA.m_islandIndex;
          const indexB = this.m_bodyB.m_islandIndex;
          log("  const jd: b2WeldJointDef = new b2WeldJointDef();\n");
          log("  jd.bodyA = bodies[%d];\n", indexA);
          log("  jd.bodyB = bodies[%d];\n", indexB);
          log("  jd.collideConnected = %s;\n", (this.m_collideConnected) ? ("true") : ("false"));
          log("  jd.localAnchorA.Set(%.15f, %.15f);\n", this.m_localAnchorA.x, this.m_localAnchorA.y);
          log("  jd.localAnchorB.Set(%.15f, %.15f);\n", this.m_localAnchorB.x, this.m_localAnchorB.y);
          log("  jd.referenceAngle = %.15f;\n", this.m_referenceAngle);
          log("  jd.stiffness = %.15f;\n", this.m_stiffness);
          log("  jd.damping = %.15f;\n", this.m_damping);
          log("  joints[%d] = this.m_world.CreateJoint(jd);\n", this.m_index);
      }
  }
  b2WeldJoint.InitVelocityConstraints_s_P = new b2Vec2();
  b2WeldJoint.SolveVelocityConstraints_s_Cdot1 = new b2Vec2();
  b2WeldJoint.SolveVelocityConstraints_s_impulse1 = new b2Vec2();
  b2WeldJoint.SolveVelocityConstraints_s_impulse = new b2Vec3();
  b2WeldJoint.SolveVelocityConstraints_s_P = new b2Vec2();
  b2WeldJoint.SolvePositionConstraints_s_C1 = new b2Vec2();
  b2WeldJoint.SolvePositionConstraints_s_P = new b2Vec2();
  b2WeldJoint.SolvePositionConstraints_s_impulse = new b2Vec3();

  /*
  * Copyright (c) 2006-2011 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  /// Wheel joint definition. This requires defining a line of
  /// motion using an axis and an anchor point. The definition uses local
  /// anchor points and a local axis so that the initial configuration
  /// can violate the constraint slightly. The joint translation is zero
  /// when the local anchor points coincide in world space. Using local
  /// anchors and a local axis helps when saving and loading a game.
  class b2WheelJointDef extends b2JointDef {
      constructor() {
          super(exports.b2JointType.e_wheelJoint);
          this.localAnchorA = new b2Vec2(0, 0);
          this.localAnchorB = new b2Vec2(0, 0);
          this.localAxisA = new b2Vec2(1, 0);
          this.enableLimit = false;
          this.lowerTranslation = 0;
          this.upperTranslation = 0;
          this.enableMotor = false;
          this.maxMotorTorque = 0;
          this.motorSpeed = 0;
          this.stiffness = 0;
          this.damping = 0;
      }
      Initialize(bA, bB, anchor, axis) {
          this.bodyA = bA;
          this.bodyB = bB;
          this.bodyA.GetLocalPoint(anchor, this.localAnchorA);
          this.bodyB.GetLocalPoint(anchor, this.localAnchorB);
          this.bodyA.GetLocalVector(axis, this.localAxisA);
      }
  }
  class b2WheelJoint extends b2Joint {
      constructor(def) {
          super(def);
          this.m_localAnchorA = new b2Vec2();
          this.m_localAnchorB = new b2Vec2();
          this.m_localXAxisA = new b2Vec2();
          this.m_localYAxisA = new b2Vec2();
          this.m_impulse = 0;
          this.m_motorImpulse = 0;
          this.m_springImpulse = 0;
          this.m_lowerImpulse = 0;
          this.m_upperImpulse = 0;
          this.m_translation = 0;
          this.m_lowerTranslation = 0;
          this.m_upperTranslation = 0;
          this.m_maxMotorTorque = 0;
          this.m_motorSpeed = 0;
          this.m_enableLimit = false;
          this.m_enableMotor = false;
          this.m_stiffness = 0;
          this.m_damping = 0;
          // Solver temp
          this.m_indexA = 0;
          this.m_indexB = 0;
          this.m_localCenterA = new b2Vec2();
          this.m_localCenterB = new b2Vec2();
          this.m_invMassA = 0;
          this.m_invMassB = 0;
          this.m_invIA = 0;
          this.m_invIB = 0;
          this.m_ax = new b2Vec2();
          this.m_ay = new b2Vec2();
          this.m_sAx = 0;
          this.m_sBx = 0;
          this.m_sAy = 0;
          this.m_sBy = 0;
          this.m_mass = 0;
          this.m_motorMass = 0;
          this.m_axialMass = 0;
          this.m_springMass = 0;
          this.m_bias = 0;
          this.m_gamma = 0;
          this.m_qA = new b2Rot();
          this.m_qB = new b2Rot();
          this.m_lalcA = new b2Vec2();
          this.m_lalcB = new b2Vec2();
          this.m_rA = new b2Vec2();
          this.m_rB = new b2Vec2();
          this.m_localAnchorA.Copy(b2Maybe(def.localAnchorA, b2Vec2.ZERO));
          this.m_localAnchorB.Copy(b2Maybe(def.localAnchorB, b2Vec2.ZERO));
          this.m_localXAxisA.Copy(b2Maybe(def.localAxisA, b2Vec2.UNITX));
          b2Vec2.CrossOneV(this.m_localXAxisA, this.m_localYAxisA);
          this.m_lowerTranslation = b2Maybe(def.lowerTranslation, 0);
          this.m_upperTranslation = b2Maybe(def.upperTranslation, 0);
          this.m_enableLimit = b2Maybe(def.enableLimit, false);
          this.m_maxMotorTorque = b2Maybe(def.maxMotorTorque, 0);
          this.m_motorSpeed = b2Maybe(def.motorSpeed, 0);
          this.m_enableMotor = b2Maybe(def.enableMotor, false);
          this.m_ax.SetZero();
          this.m_ay.SetZero();
          this.m_stiffness = b2Maybe(def.stiffness, 0);
          this.m_damping = b2Maybe(def.damping, 0);
      }
      GetMotorSpeed() {
          return this.m_motorSpeed;
      }
      GetMaxMotorTorque() {
          return this.m_maxMotorTorque;
      }
      SetStiffness(hz) {
          this.m_stiffness = hz;
      }
      GetStiffness() {
          return this.m_stiffness;
      }
      SetDamping(ratio) {
          this.m_damping = ratio;
      }
      GetDamping() {
          return this.m_damping;
      }
      InitVelocityConstraints(data) {
          this.m_indexA = this.m_bodyA.m_islandIndex;
          this.m_indexB = this.m_bodyB.m_islandIndex;
          this.m_localCenterA.Copy(this.m_bodyA.m_sweep.localCenter);
          this.m_localCenterB.Copy(this.m_bodyB.m_sweep.localCenter);
          this.m_invMassA = this.m_bodyA.m_invMass;
          this.m_invMassB = this.m_bodyB.m_invMass;
          this.m_invIA = this.m_bodyA.m_invI;
          this.m_invIB = this.m_bodyB.m_invI;
          const mA = this.m_invMassA, mB = this.m_invMassB;
          const iA = this.m_invIA, iB = this.m_invIB;
          const cA = data.positions[this.m_indexA].c;
          const aA = data.positions[this.m_indexA].a;
          const vA = data.velocities[this.m_indexA].v;
          let wA = data.velocities[this.m_indexA].w;
          const cB = data.positions[this.m_indexB].c;
          const aB = data.positions[this.m_indexB].a;
          const vB = data.velocities[this.m_indexB].v;
          let wB = data.velocities[this.m_indexB].w;
          const qA = this.m_qA.SetAngle(aA), qB = this.m_qB.SetAngle(aB);
          // Compute the effective masses.
          // b2Vec2 rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
          b2Vec2.SubVV(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
          const rA = b2Rot.MulRV(qA, this.m_lalcA, this.m_rA);
          // b2Vec2 rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
          b2Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
          const rB = b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);
          // b2Vec2 d = cB + rB - cA - rA;
          const d = b2Vec2.SubVV(b2Vec2.AddVV(cB, rB, b2Vec2.s_t0), b2Vec2.AddVV(cA, rA, b2Vec2.s_t1), b2WheelJoint.InitVelocityConstraints_s_d);
          // Point to line constraint
          {
              // m_ay = b2Mul(qA, m_localYAxisA);
              b2Rot.MulRV(qA, this.m_localYAxisA, this.m_ay);
              // m_sAy = b2Cross(d + rA, m_ay);
              this.m_sAy = b2Vec2.CrossVV(b2Vec2.AddVV(d, rA, b2Vec2.s_t0), this.m_ay);
              // m_sBy = b2Cross(rB, m_ay);
              this.m_sBy = b2Vec2.CrossVV(rB, this.m_ay);
              this.m_mass = mA + mB + iA * this.m_sAy * this.m_sAy + iB * this.m_sBy * this.m_sBy;
              if (this.m_mass > 0) {
                  this.m_mass = 1 / this.m_mass;
              }
          }
          // Spring constraint
          b2Rot.MulRV(qA, this.m_localXAxisA, this.m_ax); // m_ax = b2Mul(qA, m_localXAxisA);
          this.m_sAx = b2Vec2.CrossVV(b2Vec2.AddVV(d, rA, b2Vec2.s_t0), this.m_ax);
          this.m_sBx = b2Vec2.CrossVV(rB, this.m_ax);
          const invMass = mA + mB + iA * this.m_sAx * this.m_sAx + iB * this.m_sBx * this.m_sBx;
          if (invMass > 0.0) {
              this.m_axialMass = 1.0 / invMass;
          }
          else {
              this.m_axialMass = 0.0;
          }
          this.m_springMass = 0;
          this.m_bias = 0;
          this.m_gamma = 0;
          if (this.m_stiffness > 0.0 && invMass > 0.0) {
              this.m_springMass = 1.0 / invMass;
              const C = b2Vec2.DotVV(d, this.m_ax);
              // magic formulas
              const h = data.step.dt;
              this.m_gamma = h * (this.m_damping + h * this.m_stiffness);
              if (this.m_gamma > 0.0) {
                  this.m_gamma = 1.0 / this.m_gamma;
              }
              this.m_bias = C * h * this.m_stiffness * this.m_gamma;
              this.m_springMass = invMass + this.m_gamma;
              if (this.m_springMass > 0.0) {
                  this.m_springMass = 1.0 / this.m_springMass;
              }
          }
          else {
              this.m_springImpulse = 0.0;
          }
          if (this.m_enableLimit) {
              this.m_translation = b2Vec2.DotVV(this.m_ax, d);
          }
          else {
              this.m_lowerImpulse = 0.0;
              this.m_upperImpulse = 0.0;
          }
          if (this.m_enableMotor) {
              this.m_motorMass = iA + iB;
              if (this.m_motorMass > 0) {
                  this.m_motorMass = 1 / this.m_motorMass;
              }
          }
          else {
              this.m_motorMass = 0;
              this.m_motorImpulse = 0;
          }
          if (data.step.warmStarting) {
              // Account for variable time step.
              this.m_impulse *= data.step.dtRatio;
              this.m_springImpulse *= data.step.dtRatio;
              this.m_motorImpulse *= data.step.dtRatio;
              const axialImpulse = this.m_springImpulse + this.m_lowerImpulse - this.m_upperImpulse;
              // b2Vec2 P = m_impulse * m_ay + m_springImpulse * m_ax;
              const P = b2Vec2.AddVV(b2Vec2.MulSV(this.m_impulse, this.m_ay, b2Vec2.s_t0), b2Vec2.MulSV(axialImpulse, this.m_ax, b2Vec2.s_t1), b2WheelJoint.InitVelocityConstraints_s_P);
              // float32 LA = m_impulse * m_sAy + m_springImpulse * m_sAx + m_motorImpulse;
              const LA = this.m_impulse * this.m_sAy + axialImpulse * this.m_sAx + this.m_motorImpulse;
              // float32 LB = m_impulse * m_sBy + m_springImpulse * m_sBx + m_motorImpulse;
              const LB = this.m_impulse * this.m_sBy + axialImpulse * this.m_sBx + this.m_motorImpulse;
              // vA -= m_invMassA * P;
              vA.SelfMulSub(this.m_invMassA, P);
              wA -= this.m_invIA * LA;
              // vB += m_invMassB * P;
              vB.SelfMulAdd(this.m_invMassB, P);
              wB += this.m_invIB * LB;
          }
          else {
              this.m_impulse = 0;
              this.m_springImpulse = 0;
              this.m_motorImpulse = 0;
              this.m_lowerImpulse = 0;
              this.m_upperImpulse = 0;
          }
          // data.velocities[this.m_indexA].v = vA;
          data.velocities[this.m_indexA].w = wA;
          // data.velocities[this.m_indexB].v = vB;
          data.velocities[this.m_indexB].w = wB;
      }
      SolveVelocityConstraints(data) {
          const mA = this.m_invMassA, mB = this.m_invMassB;
          const iA = this.m_invIA, iB = this.m_invIB;
          const vA = data.velocities[this.m_indexA].v;
          let wA = data.velocities[this.m_indexA].w;
          const vB = data.velocities[this.m_indexB].v;
          let wB = data.velocities[this.m_indexB].w;
          // Solve spring constraint
          {
              const Cdot = b2Vec2.DotVV(this.m_ax, b2Vec2.SubVV(vB, vA, b2Vec2.s_t0)) + this.m_sBx * wB - this.m_sAx * wA;
              const impulse = -this.m_springMass * (Cdot + this.m_bias + this.m_gamma * this.m_springImpulse);
              this.m_springImpulse += impulse;
              // b2Vec2 P = impulse * m_ax;
              const P = b2Vec2.MulSV(impulse, this.m_ax, b2WheelJoint.SolveVelocityConstraints_s_P);
              const LA = impulse * this.m_sAx;
              const LB = impulse * this.m_sBx;
              // vA -= mA * P;
              vA.SelfMulSub(mA, P);
              wA -= iA * LA;
              // vB += mB * P;
              vB.SelfMulAdd(mB, P);
              wB += iB * LB;
          }
          // Solve rotational motor constraint
          {
              const Cdot = wB - wA - this.m_motorSpeed;
              let impulse = -this.m_motorMass * Cdot;
              const oldImpulse = this.m_motorImpulse;
              const maxImpulse = data.step.dt * this.m_maxMotorTorque;
              this.m_motorImpulse = b2Clamp(this.m_motorImpulse + impulse, -maxImpulse, maxImpulse);
              impulse = this.m_motorImpulse - oldImpulse;
              wA -= iA * impulse;
              wB += iB * impulse;
          }
          if (this.m_enableLimit) {
              // Lower limit
              {
                  const C = this.m_translation - this.m_lowerTranslation;
                  const Cdot = b2Vec2.DotVV(this.m_ax, b2Vec2.SubVV(vB, vA, b2Vec2.s_t0)) + this.m_sBx * wB - this.m_sAx * wA;
                  let impulse = -this.m_axialMass * (Cdot + b2Max(C, 0.0) * data.step.inv_dt);
                  const oldImpulse = this.m_lowerImpulse;
                  this.m_lowerImpulse = b2Max(this.m_lowerImpulse + impulse, 0.0);
                  impulse = this.m_lowerImpulse - oldImpulse;
                  // b2Vec2 P = impulse * this.m_ax;
                  const P = b2Vec2.MulSV(impulse, this.m_ax, b2WheelJoint.SolveVelocityConstraints_s_P);
                  const LA = impulse * this.m_sAx;
                  const LB = impulse * this.m_sBx;
                  // vA -= mA * P;
                  vA.SelfMulSub(mA, P);
                  wA -= iA * LA;
                  // vB += mB * P;
                  vB.SelfMulAdd(mB, P);
                  wB += iB * LB;
              }
              // Upper limit
              // Note: signs are flipped to keep C positive when the constraint is satisfied.
              // This also keeps the impulse positive when the limit is active.
              {
                  const C = this.m_upperTranslation - this.m_translation;
                  const Cdot = b2Vec2.DotVV(this.m_ax, b2Vec2.SubVV(vA, vB, b2Vec2.s_t0)) + this.m_sAx * wA - this.m_sBx * wB;
                  let impulse = -this.m_axialMass * (Cdot + b2Max(C, 0.0) * data.step.inv_dt);
                  const oldImpulse = this.m_upperImpulse;
                  this.m_upperImpulse = b2Max(this.m_upperImpulse + impulse, 0.0);
                  impulse = this.m_upperImpulse - oldImpulse;
                  // b2Vec2 P = impulse * this.m_ax;
                  const P = b2Vec2.MulSV(impulse, this.m_ax, b2WheelJoint.SolveVelocityConstraints_s_P);
                  const LA = impulse * this.m_sAx;
                  const LB = impulse * this.m_sBx;
                  // vA += mA * P;
                  vA.SelfMulAdd(mA, P);
                  wA += iA * LA;
                  // vB -= mB * P;
                  vB.SelfMulSub(mB, P);
                  wB -= iB * LB;
              }
          }
          // Solve point to line constraint
          {
              const Cdot = b2Vec2.DotVV(this.m_ay, b2Vec2.SubVV(vB, vA, b2Vec2.s_t0)) + this.m_sBy * wB - this.m_sAy * wA;
              const impulse = -this.m_mass * Cdot;
              this.m_impulse += impulse;
              // b2Vec2 P = impulse * m_ay;
              const P = b2Vec2.MulSV(impulse, this.m_ay, b2WheelJoint.SolveVelocityConstraints_s_P);
              const LA = impulse * this.m_sAy;
              const LB = impulse * this.m_sBy;
              // vA -= mA * P;
              vA.SelfMulSub(mA, P);
              wA -= iA * LA;
              // vB += mB * P;
              vB.SelfMulAdd(mB, P);
              wB += iB * LB;
          }
          // data.velocities[this.m_indexA].v = vA;
          data.velocities[this.m_indexA].w = wA;
          // data.velocities[this.m_indexB].v = vB;
          data.velocities[this.m_indexB].w = wB;
      }
      SolvePositionConstraints(data) {
          const cA = data.positions[this.m_indexA].c;
          let aA = data.positions[this.m_indexA].a;
          const cB = data.positions[this.m_indexB].c;
          let aB = data.positions[this.m_indexB].a;
          // const qA: b2Rot = this.m_qA.SetAngle(aA), qB: b2Rot = this.m_qB.SetAngle(aB);
          // // b2Vec2 rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
          // b2Vec2.SubVV(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
          // const rA: b2Vec2 = b2Rot.MulRV(qA, this.m_lalcA, this.m_rA);
          // // b2Vec2 rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
          // b2Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
          // const rB: b2Vec2 = b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);
          // // b2Vec2 d = (cB - cA) + rB - rA;
          // const d: b2Vec2 = b2Vec2.AddVV(
          //   b2Vec2.SubVV(cB, cA, b2Vec2.s_t0),
          //   b2Vec2.SubVV(rB, rA, b2Vec2.s_t1),
          //   b2WheelJoint.SolvePositionConstraints_s_d);
          // // b2Vec2 ay = b2Mul(qA, m_localYAxisA);
          // const ay: b2Vec2 = b2Rot.MulRV(qA, this.m_localYAxisA, this.m_ay);
          // // float32 sAy = b2Cross(d + rA, ay);
          // const sAy = b2Vec2.CrossVV(b2Vec2.AddVV(d, rA, b2Vec2.s_t0), ay);
          // // float32 sBy = b2Cross(rB, ay);
          // const sBy = b2Vec2.CrossVV(rB, ay);
          // // float32 C = b2Dot(d, ay);
          // const C: number = b2Vec2.DotVV(d, this.m_ay);
          // const k: number = this.m_invMassA + this.m_invMassB + this.m_invIA * this.m_sAy * this.m_sAy + this.m_invIB * this.m_sBy * this.m_sBy;
          // let impulse: number;
          // if (k !== 0) {
          //   impulse = - C / k;
          // } else {
          //   impulse = 0;
          // }
          // // b2Vec2 P = impulse * ay;
          // const P: b2Vec2 = b2Vec2.MulSV(impulse, ay, b2WheelJoint.SolvePositionConstraints_s_P);
          // const LA: number = impulse * sAy;
          // const LB: number = impulse * sBy;
          // // cA -= m_invMassA * P;
          // cA.SelfMulSub(this.m_invMassA, P);
          // aA -= this.m_invIA * LA;
          // // cB += m_invMassB * P;
          // cB.SelfMulAdd(this.m_invMassB, P);
          // aB += this.m_invIB * LB;
          let linearError = 0.0;
          if (this.m_enableLimit) {
              // b2Rot qA(aA), qB(aB);
              const qA = this.m_qA.SetAngle(aA), qB = this.m_qB.SetAngle(aB);
              // b2Vec2 rA = b2Mul(qA, this.m_localAnchorA - this.m_localCenterA);
              // b2Vec2 rB = b2Mul(qB, this.m_localAnchorB - this.m_localCenterB);
              // b2Vec2 d = (cB - cA) + rB - rA;
              // b2Vec2 rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
              b2Vec2.SubVV(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
              const rA = b2Rot.MulRV(qA, this.m_lalcA, this.m_rA);
              // b2Vec2 rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
              b2Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
              const rB = b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);
              // b2Vec2 d = (cB - cA) + rB - rA;
              const d = b2Vec2.AddVV(b2Vec2.SubVV(cB, cA, b2Vec2.s_t0), b2Vec2.SubVV(rB, rA, b2Vec2.s_t1), b2WheelJoint.SolvePositionConstraints_s_d);
              // b2Vec2 ax = b2Mul(qA, this.m_localXAxisA);
              const ax = b2Rot.MulRV(qA, this.m_localXAxisA, this.m_ax);
              // float sAx = b2Cross(d + rA, this.m_ax);
              const sAx = b2Vec2.CrossVV(b2Vec2.AddVV(d, rA, b2Vec2.s_t0), this.m_ax);
              // float sBx = b2Cross(rB, this.m_ax);
              const sBx = b2Vec2.CrossVV(rB, this.m_ax);
              let C = 0.0;
              const translation = b2Vec2.DotVV(ax, d);
              if (b2Abs(this.m_upperTranslation - this.m_lowerTranslation) < 2.0 * b2_linearSlop) {
                  C = translation;
              }
              else if (translation <= this.m_lowerTranslation) {
                  C = b2Min(translation - this.m_lowerTranslation, 0.0);
              }
              else if (translation >= this.m_upperTranslation) {
                  C = b2Max(translation - this.m_upperTranslation, 0.0);
              }
              if (C !== 0.0) {
                  const invMass = this.m_invMassA + this.m_invMassB + this.m_invIA * sAx * sAx + this.m_invIB * sBx * sBx;
                  let impulse = 0.0;
                  if (invMass !== 0.0) {
                      impulse = -C / invMass;
                  }
                  const P = b2Vec2.MulSV(impulse, ax, b2WheelJoint.SolvePositionConstraints_s_P);
                  const LA = impulse * sAx;
                  const LB = impulse * sBx;
                  // cA -= m_invMassA * P;
                  cA.SelfMulSub(this.m_invMassA, P);
                  aA -= this.m_invIA * LA;
                  // cB += m_invMassB * P;
                  cB.SelfMulAdd(this.m_invMassB, P);
                  // aB += m_invIB * LB;
                  aB += this.m_invIB * LB;
                  linearError = b2Abs(C);
              }
          }
          // Solve perpendicular constraint
          {
              // b2Rot qA(aA), qB(aB);
              const qA = this.m_qA.SetAngle(aA), qB = this.m_qB.SetAngle(aB);
              // b2Vec2 rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
              // b2Vec2 rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
              // b2Vec2 d = (cB - cA) + rB - rA;
              // b2Vec2 rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
              b2Vec2.SubVV(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
              const rA = b2Rot.MulRV(qA, this.m_lalcA, this.m_rA);
              // b2Vec2 rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
              b2Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
              const rB = b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);
              // b2Vec2 d = (cB - cA) + rB - rA;
              const d = b2Vec2.AddVV(b2Vec2.SubVV(cB, cA, b2Vec2.s_t0), b2Vec2.SubVV(rB, rA, b2Vec2.s_t1), b2WheelJoint.SolvePositionConstraints_s_d);
              // b2Vec2 ay = b2Mul(qA, m_localYAxisA);
              const ay = b2Rot.MulRV(qA, this.m_localYAxisA, this.m_ay);
              // float sAy = b2Cross(d + rA, ay);
              const sAy = b2Vec2.CrossVV(b2Vec2.AddVV(d, rA, b2Vec2.s_t0), ay);
              // float sBy = b2Cross(rB, ay);
              const sBy = b2Vec2.CrossVV(rB, ay);
              // float C = b2Dot(d, ay);
              const C = b2Vec2.DotVV(d, ay);
              const invMass = this.m_invMassA + this.m_invMassB + this.m_invIA * this.m_sAy * this.m_sAy + this.m_invIB * this.m_sBy * this.m_sBy;
              let impulse = 0.0;
              if (invMass !== 0.0) {
                  impulse = -C / invMass;
              }
              // b2Vec2 P = impulse * ay;
              // const LA: number = impulse * sAy;
              // const LB: number = impulse * sBy;
              const P = b2Vec2.MulSV(impulse, ay, b2WheelJoint.SolvePositionConstraints_s_P);
              const LA = impulse * sAy;
              const LB = impulse * sBy;
              // cA -= m_invMassA * P;
              cA.SelfMulSub(this.m_invMassA, P);
              aA -= this.m_invIA * LA;
              // cB += m_invMassB * P;
              cB.SelfMulAdd(this.m_invMassB, P);
              aB += this.m_invIB * LB;
              linearError = b2Max(linearError, b2Abs(C));
          }
          // data.positions[this.m_indexA].c = cA;
          data.positions[this.m_indexA].a = aA;
          // data.positions[this.m_indexB].c = cB;
          data.positions[this.m_indexB].a = aB;
          return linearError <= b2_linearSlop;
      }
      GetDefinition(def) {
          // DEBUG: b2Assert(false); // TODO
          return def;
      }
      GetAnchorA(out) {
          return this.m_bodyA.GetWorldPoint(this.m_localAnchorA, out);
      }
      GetAnchorB(out) {
          return this.m_bodyB.GetWorldPoint(this.m_localAnchorB, out);
      }
      GetReactionForce(inv_dt, out) {
          out.x = inv_dt * (this.m_impulse * this.m_ay.x + (this.m_springImpulse + this.m_lowerImpulse - this.m_upperImpulse) * this.m_ax.x);
          out.y = inv_dt * (this.m_impulse * this.m_ay.y + (this.m_springImpulse + this.m_lowerImpulse - this.m_upperImpulse) * this.m_ax.y);
          return out;
      }
      GetReactionTorque(inv_dt) {
          return inv_dt * this.m_motorImpulse;
      }
      GetLocalAnchorA() { return this.m_localAnchorA; }
      GetLocalAnchorB() { return this.m_localAnchorB; }
      GetLocalAxisA() { return this.m_localXAxisA; }
      GetJointTranslation() {
          return this.GetPrismaticJointTranslation();
      }
      GetJointLinearSpeed() {
          return this.GetPrismaticJointSpeed();
      }
      GetJointAngle() {
          return this.GetRevoluteJointAngle();
      }
      GetJointAngularSpeed() {
          return this.GetRevoluteJointSpeed();
      }
      GetPrismaticJointTranslation() {
          const bA = this.m_bodyA;
          const bB = this.m_bodyB;
          const pA = bA.GetWorldPoint(this.m_localAnchorA, new b2Vec2());
          const pB = bB.GetWorldPoint(this.m_localAnchorB, new b2Vec2());
          const d = b2Vec2.SubVV(pB, pA, new b2Vec2());
          const axis = bA.GetWorldVector(this.m_localXAxisA, new b2Vec2());
          const translation = b2Vec2.DotVV(d, axis);
          return translation;
      }
      GetPrismaticJointSpeed() {
          const bA = this.m_bodyA;
          const bB = this.m_bodyB;
          // b2Vec2 rA = b2Mul(bA.m_xf.q, m_localAnchorA - bA.m_sweep.localCenter);
          b2Vec2.SubVV(this.m_localAnchorA, bA.m_sweep.localCenter, this.m_lalcA);
          const rA = b2Rot.MulRV(bA.m_xf.q, this.m_lalcA, this.m_rA);
          // b2Vec2 rB = b2Mul(bB.m_xf.q, m_localAnchorB - bB.m_sweep.localCenter);
          b2Vec2.SubVV(this.m_localAnchorB, bB.m_sweep.localCenter, this.m_lalcB);
          const rB = b2Rot.MulRV(bB.m_xf.q, this.m_lalcB, this.m_rB);
          // b2Vec2 pA = bA.m_sweep.c + rA;
          const pA = b2Vec2.AddVV(bA.m_sweep.c, rA, b2Vec2.s_t0); // pA uses s_t0
          // b2Vec2 pB = bB.m_sweep.c + rB;
          const pB = b2Vec2.AddVV(bB.m_sweep.c, rB, b2Vec2.s_t1); // pB uses s_t1
          // b2Vec2 d = pB - pA;
          const d = b2Vec2.SubVV(pB, pA, b2Vec2.s_t2); // d uses s_t2
          // b2Vec2 axis = b2Mul(bA.m_xf.q, m_localXAxisA);
          const axis = bA.GetWorldVector(this.m_localXAxisA, new b2Vec2());
          const vA = bA.m_linearVelocity;
          const vB = bB.m_linearVelocity;
          const wA = bA.m_angularVelocity;
          const wB = bB.m_angularVelocity;
          // float32 speed = b2Dot(d, b2Cross(wA, axis)) + b2Dot(axis, vB + b2Cross(wB, rB) - vA - b2Cross(wA, rA));
          const speed = b2Vec2.DotVV(d, b2Vec2.CrossSV(wA, axis, b2Vec2.s_t0)) +
              b2Vec2.DotVV(axis, b2Vec2.SubVV(b2Vec2.AddVCrossSV(vB, wB, rB, b2Vec2.s_t0), b2Vec2.AddVCrossSV(vA, wA, rA, b2Vec2.s_t1), b2Vec2.s_t0));
          return speed;
      }
      GetRevoluteJointAngle() {
          // b2Body* bA = this.m_bodyA;
          // b2Body* bB = this.m_bodyB;
          // return bB.this.m_sweep.a - bA.this.m_sweep.a;
          return this.m_bodyB.m_sweep.a - this.m_bodyA.m_sweep.a;
      }
      GetRevoluteJointSpeed() {
          const wA = this.m_bodyA.m_angularVelocity;
          const wB = this.m_bodyB.m_angularVelocity;
          return wB - wA;
      }
      IsMotorEnabled() {
          return this.m_enableMotor;
      }
      EnableMotor(flag) {
          if (flag !== this.m_enableMotor) {
              this.m_bodyA.SetAwake(true);
              this.m_bodyB.SetAwake(true);
              this.m_enableMotor = flag;
          }
      }
      SetMotorSpeed(speed) {
          if (speed !== this.m_motorSpeed) {
              this.m_bodyA.SetAwake(true);
              this.m_bodyB.SetAwake(true);
              this.m_motorSpeed = speed;
          }
      }
      SetMaxMotorTorque(force) {
          if (force !== this.m_maxMotorTorque) {
              this.m_bodyA.SetAwake(true);
              this.m_bodyB.SetAwake(true);
              this.m_maxMotorTorque = force;
          }
      }
      GetMotorTorque(inv_dt) {
          return inv_dt * this.m_motorImpulse;
      }
      /// Is the joint limit enabled?
      IsLimitEnabled() {
          return this.m_enableLimit;
      }
      /// Enable/disable the joint translation limit.
      EnableLimit(flag) {
          if (flag !== this.m_enableLimit) {
              this.m_bodyA.SetAwake(true);
              this.m_bodyB.SetAwake(true);
              this.m_enableLimit = flag;
              this.m_lowerImpulse = 0.0;
              this.m_upperImpulse = 0.0;
          }
      }
      /// Get the lower joint translation limit, usually in meters.
      GetLowerLimit() {
          return this.m_lowerTranslation;
      }
      /// Get the upper joint translation limit, usually in meters.
      GetUpperLimit() {
          return this.m_upperTranslation;
      }
      /// Set the joint translation limits, usually in meters.
      SetLimits(lower, upper) {
          // b2Assert(lower <= upper);
          if (lower !== this.m_lowerTranslation || upper !== this.m_upperTranslation) {
              this.m_bodyA.SetAwake(true);
              this.m_bodyB.SetAwake(true);
              this.m_lowerTranslation = lower;
              this.m_upperTranslation = upper;
              this.m_lowerImpulse = 0.0;
              this.m_upperImpulse = 0.0;
          }
      }
      Dump(log) {
          const indexA = this.m_bodyA.m_islandIndex;
          const indexB = this.m_bodyB.m_islandIndex;
          log("  const jd: b2WheelJointDef = new b2WheelJointDef();\n");
          log("  jd.bodyA = bodies[%d];\n", indexA);
          log("  jd.bodyB = bodies[%d];\n", indexB);
          log("  jd.collideConnected = %s;\n", (this.m_collideConnected) ? ("true") : ("false"));
          log("  jd.localAnchorA.Set(%.15f, %.15f);\n", this.m_localAnchorA.x, this.m_localAnchorA.y);
          log("  jd.localAnchorB.Set(%.15f, %.15f);\n", this.m_localAnchorB.x, this.m_localAnchorB.y);
          log("  jd.localAxisA.Set(%.15f, %.15f);\n", this.m_localXAxisA.x, this.m_localXAxisA.y);
          log("  jd.enableMotor = %s;\n", (this.m_enableMotor) ? ("true") : ("false"));
          log("  jd.motorSpeed = %.15f;\n", this.m_motorSpeed);
          log("  jd.maxMotorTorque = %.15f;\n", this.m_maxMotorTorque);
          log("  jd.stiffness = %.15f;\n", this.m_stiffness);
          log("  jd.damping = %.15f;\n", this.m_damping);
          log("  joints[%d] = this.m_world.CreateJoint(jd);\n", this.m_index);
      }
      Draw(draw) {
          const xfA = this.m_bodyA.GetTransform();
          const xfB = this.m_bodyB.GetTransform();
          const pA = b2Transform.MulXV(xfA, this.m_localAnchorA, b2WheelJoint.Draw_s_pA);
          const pB = b2Transform.MulXV(xfB, this.m_localAnchorB, b2WheelJoint.Draw_s_pB);
          // b2Vec2 axis = b2Mul(xfA.q, m_localXAxisA);
          const axis = b2Rot.MulRV(xfA.q, this.m_localXAxisA, b2WheelJoint.Draw_s_axis);
          const c1 = b2WheelJoint.Draw_s_c1; // b2Color c1(0.7f, 0.7f, 0.7f);
          const c2 = b2WheelJoint.Draw_s_c2; // b2Color c2(0.3f, 0.9f, 0.3f);
          const c3 = b2WheelJoint.Draw_s_c3; // b2Color c3(0.9f, 0.3f, 0.3f);
          const c4 = b2WheelJoint.Draw_s_c4; // b2Color c4(0.3f, 0.3f, 0.9f);
          const c5 = b2WheelJoint.Draw_s_c5; // b2Color c5(0.4f, 0.4f, 0.4f);
          draw.DrawSegment(pA, pB, c5);
          if (this.m_enableLimit) {
              // b2Vec2 lower = pA + m_lowerTranslation * axis;
              const lower = b2Vec2.AddVMulSV(pA, this.m_lowerTranslation, axis, b2WheelJoint.Draw_s_lower);
              // b2Vec2 upper = pA + m_upperTranslation * axis;
              const upper = b2Vec2.AddVMulSV(pA, this.m_upperTranslation, axis, b2WheelJoint.Draw_s_upper);
              // b2Vec2 perp = b2Mul(xfA.q, m_localYAxisA);
              const perp = b2Rot.MulRV(xfA.q, this.m_localYAxisA, b2WheelJoint.Draw_s_perp);
              // draw.DrawSegment(lower, upper, c1);
              draw.DrawSegment(lower, upper, c1);
              // draw.DrawSegment(lower - 0.5f * perp, lower + 0.5f * perp, c2);
              draw.DrawSegment(b2Vec2.AddVMulSV(lower, -0.5, perp, b2Vec2.s_t0), b2Vec2.AddVMulSV(lower, 0.5, perp, b2Vec2.s_t1), c2);
              // draw.DrawSegment(upper - 0.5f * perp, upper + 0.5f * perp, c3);
              draw.DrawSegment(b2Vec2.AddVMulSV(upper, -0.5, perp, b2Vec2.s_t0), b2Vec2.AddVMulSV(upper, 0.5, perp, b2Vec2.s_t1), c3);
          }
          else {
              // draw.DrawSegment(pA - 1.0f * axis, pA + 1.0f * axis, c1);
              draw.DrawSegment(b2Vec2.AddVMulSV(pA, -1.0, axis, b2Vec2.s_t0), b2Vec2.AddVMulSV(pA, 1.0, axis, b2Vec2.s_t1), c1);
          }
          draw.DrawPoint(pA, 5.0, c1);
          draw.DrawPoint(pB, 5.0, c4);
      }
  }
  b2WheelJoint.InitVelocityConstraints_s_d = new b2Vec2();
  b2WheelJoint.InitVelocityConstraints_s_P = new b2Vec2();
  b2WheelJoint.SolveVelocityConstraints_s_P = new b2Vec2();
  b2WheelJoint.SolvePositionConstraints_s_d = new b2Vec2();
  b2WheelJoint.SolvePositionConstraints_s_P = new b2Vec2();
  ///
  b2WheelJoint.Draw_s_pA = new b2Vec2();
  b2WheelJoint.Draw_s_pB = new b2Vec2();
  b2WheelJoint.Draw_s_axis = new b2Vec2();
  b2WheelJoint.Draw_s_c1 = new b2Color(0.7, 0.7, 0.7);
  b2WheelJoint.Draw_s_c2 = new b2Color(0.3, 0.9, 0.3);
  b2WheelJoint.Draw_s_c3 = new b2Color(0.9, 0.3, 0.3);
  b2WheelJoint.Draw_s_c4 = new b2Color(0.3, 0.3, 0.9);
  b2WheelJoint.Draw_s_c5 = new b2Color(0.4, 0.4, 0.4);
  b2WheelJoint.Draw_s_lower = new b2Vec2();
  b2WheelJoint.Draw_s_upper = new b2Vec2();
  b2WheelJoint.Draw_s_perp = new b2Vec2();

  /*
  * Copyright (c) 2006-2011 Erin Catto http://www.box2d.org
  *
  * This software is provided 'as-is', without any express or implied
  * warranty.  In no event will the authors be held liable for any damages
  * arising from the use of this software.
  * Permission is granted to anyone to use this software for any purpose,
  * including commercial applications, and to alter it and redistribute it
  * freely, subject to the following restrictions:
  * 1. The origin of this software must not be misrepresented; you must not
  * claim that you wrote the original software. If you use this software
  * in a product, an acknowledgment in the product documentation would be
  * appreciated but is not required.
  * 2. Altered source versions must be plainly marked as such, and must not be
  * misrepresented as being the original software.
  * 3. This notice may not be removed or altered from any source distribution.
  */
  /// The world class manages all physics entities, dynamic simulation,
  /// and asynchronous queries. The world also contains efficient memory
  /// management facilities.
  class b2World {
      /// Construct a world object.
      /// @param gravity the world gravity vector.
      constructor(gravity) {
          this.m_contactManager = new b2ContactManager();
          this.m_bodyList = null;
          this.m_jointList = null;
          this.m_bodyCount = 0;
          this.m_jointCount = 0;
          this.m_gravity = new b2Vec2();
          this.m_allowSleep = true;
          this.m_destructionListener = null;
          this.m_debugDraw = null;
          // This is used to compute the time step ratio to
          // support a variable time step.
          this.m_inv_dt0 = 0;
          this.m_newContacts = false;
          this.m_locked = false;
          this.m_clearForces = true;
          // These are for debugging the solver.
          this.m_warmStarting = true;
          this.m_continuousPhysics = true;
          this.m_subStepping = false;
          this.m_stepComplete = true;
          this.m_profile = new b2Profile();
          this.m_island = new b2Island();
          this.s_stack = [];
          this.m_gravity.Copy(gravity);
      }
      /// Register a destruction listener. The listener is owned by you and must
      /// remain in scope.
      SetDestructionListener(listener) {
          this.m_destructionListener = listener;
      }
      /// Register a contact filter to provide specific control over collision.
      /// Otherwise the default filter is used (b2_defaultFilter). The listener is
      /// owned by you and must remain in scope.
      SetContactFilter(filter) {
          this.m_contactManager.m_contactFilter = filter;
      }
      /// Register a contact event listener. The listener is owned by you and must
      /// remain in scope.
      SetContactListener(listener) {
          this.m_contactManager.m_contactListener = listener;
      }
      /// Register a routine for debug drawing. The debug draw functions are called
      /// inside with b2World::DebugDraw method. The debug draw object is owned
      /// by you and must remain in scope.
      SetDebugDraw(debugDraw) {
          this.m_debugDraw = debugDraw;
      }
      /// Create a rigid body given a definition. No reference to the definition
      /// is retained.
      /// @warning This function is locked during callbacks.
      CreateBody(def = {}) {
          if (this.IsLocked()) {
              throw new Error();
          }
          const b = new b2Body(def, this);
          // Add to world doubly linked list.
          b.m_prev = null;
          b.m_next = this.m_bodyList;
          if (this.m_bodyList) {
              this.m_bodyList.m_prev = b;
          }
          this.m_bodyList = b;
          ++this.m_bodyCount;
          return b;
      }
      /// Destroy a rigid body given a definition. No reference to the definition
      /// is retained. This function is locked during callbacks.
      /// @warning This automatically deletes all associated shapes and joints.
      /// @warning This function is locked during callbacks.
      DestroyBody(b) {
          // DEBUG: b2Assert(this.m_bodyCount > 0);
          if (this.IsLocked()) {
              throw new Error();
          }
          // Delete the attached joints.
          let je = b.m_jointList;
          while (je) {
              const je0 = je;
              je = je.next;
              if (this.m_destructionListener) {
                  this.m_destructionListener.SayGoodbyeJoint(je0.joint);
              }
              this.DestroyJoint(je0.joint);
              b.m_jointList = je;
          }
          b.m_jointList = null;
          // Delete the attached contacts.
          let ce = b.m_contactList;
          while (ce) {
              const ce0 = ce;
              ce = ce.next;
              this.m_contactManager.Destroy(ce0.contact);
          }
          b.m_contactList = null;
          // Delete the attached fixtures. This destroys broad-phase proxies.
          let f = b.m_fixtureList;
          while (f) {
              const f0 = f;
              f = f.m_next;
              if (this.m_destructionListener) {
                  this.m_destructionListener.SayGoodbyeFixture(f0);
              }
              f0.DestroyProxies();
              f0.Reset();
              b.m_fixtureList = f;
              b.m_fixtureCount -= 1;
          }
          b.m_fixtureList = null;
          b.m_fixtureCount = 0;
          // Remove world body list.
          if (b.m_prev) {
              b.m_prev.m_next = b.m_next;
          }
          if (b.m_next) {
              b.m_next.m_prev = b.m_prev;
          }
          if (b === this.m_bodyList) {
              this.m_bodyList = b.m_next;
          }
          --this.m_bodyCount;
      }
      static _Joint_Create(def) {
          switch (def.type) {
              case exports.b2JointType.e_distanceJoint: return new b2DistanceJoint(def);
              case exports.b2JointType.e_mouseJoint: return new b2MouseJoint(def);
              case exports.b2JointType.e_prismaticJoint: return new b2PrismaticJoint(def);
              case exports.b2JointType.e_revoluteJoint: return new b2RevoluteJoint(def);
              case exports.b2JointType.e_pulleyJoint: return new b2PulleyJoint(def);
              case exports.b2JointType.e_gearJoint: return new b2GearJoint(def);
              case exports.b2JointType.e_wheelJoint: return new b2WheelJoint(def);
              case exports.b2JointType.e_weldJoint: return new b2WeldJoint(def);
              case exports.b2JointType.e_frictionJoint: return new b2FrictionJoint(def);
              case exports.b2JointType.e_motorJoint: return new b2MotorJoint(def);
              case exports.b2JointType.e_areaJoint: return new b2AreaJoint(def);
          }
          throw new Error();
      }
      static _Joint_Destroy(joint) {
      }
      CreateJoint(def) {
          if (this.IsLocked()) {
              throw new Error();
          }
          const j = b2World._Joint_Create(def);
          // Connect to the world list.
          j.m_prev = null;
          j.m_next = this.m_jointList;
          if (this.m_jointList) {
              this.m_jointList.m_prev = j;
          }
          this.m_jointList = j;
          ++this.m_jointCount;
          // Connect to the bodies' doubly linked lists.
          // j.m_edgeA.other = j.m_bodyB; // done in b2Joint constructor
          j.m_edgeA.prev = null;
          j.m_edgeA.next = j.m_bodyA.m_jointList;
          if (j.m_bodyA.m_jointList) {
              j.m_bodyA.m_jointList.prev = j.m_edgeA;
          }
          j.m_bodyA.m_jointList = j.m_edgeA;
          // j.m_edgeB.other = j.m_bodyA; // done in b2Joint constructor
          j.m_edgeB.prev = null;
          j.m_edgeB.next = j.m_bodyB.m_jointList;
          if (j.m_bodyB.m_jointList) {
              j.m_bodyB.m_jointList.prev = j.m_edgeB;
          }
          j.m_bodyB.m_jointList = j.m_edgeB;
          const bodyA = j.m_bodyA;
          const bodyB = j.m_bodyB;
          const collideConnected = j.m_collideConnected;
          // If the joint prevents collisions, then flag any contacts for filtering.
          if (!collideConnected) {
              let edge = bodyB.GetContactList();
              while (edge) {
                  if (edge.other === bodyA) {
                      // Flag the contact for filtering at the next time step (where either
                      // body is awake).
                      edge.contact.FlagForFiltering();
                  }
                  edge = edge.next;
              }
          }
          // Note: creating a joint doesn't wake the bodies.
          return j;
      }
      /// Destroy a joint. This may cause the connected bodies to begin colliding.
      /// @warning This function is locked during callbacks.
      DestroyJoint(j) {
          if (this.IsLocked()) {
              throw new Error();
          }
          // Remove from the doubly linked list.
          if (j.m_prev) {
              j.m_prev.m_next = j.m_next;
          }
          if (j.m_next) {
              j.m_next.m_prev = j.m_prev;
          }
          if (j === this.m_jointList) {
              this.m_jointList = j.m_next;
          }
          // Disconnect from island graph.
          const bodyA = j.m_bodyA;
          const bodyB = j.m_bodyB;
          const collideConnected = j.m_collideConnected;
          // Wake up connected bodies.
          bodyA.SetAwake(true);
          bodyB.SetAwake(true);
          // Remove from body 1.
          if (j.m_edgeA.prev) {
              j.m_edgeA.prev.next = j.m_edgeA.next;
          }
          if (j.m_edgeA.next) {
              j.m_edgeA.next.prev = j.m_edgeA.prev;
          }
          if (j.m_edgeA === bodyA.m_jointList) {
              bodyA.m_jointList = j.m_edgeA.next;
          }
          j.m_edgeA.Reset();
          // Remove from body 2
          if (j.m_edgeB.prev) {
              j.m_edgeB.prev.next = j.m_edgeB.next;
          }
          if (j.m_edgeB.next) {
              j.m_edgeB.next.prev = j.m_edgeB.prev;
          }
          if (j.m_edgeB === bodyB.m_jointList) {
              bodyB.m_jointList = j.m_edgeB.next;
          }
          j.m_edgeB.Reset();
          b2World._Joint_Destroy(j);
          // DEBUG: b2Assert(this.m_jointCount > 0);
          --this.m_jointCount;
          // If the joint prevents collisions, then flag any contacts for filtering.
          if (!collideConnected) {
              let edge = bodyB.GetContactList();
              while (edge) {
                  if (edge.other === bodyA) {
                      // Flag the contact for filtering at the next time step (where either
                      // body is awake).
                      edge.contact.FlagForFiltering();
                  }
                  edge = edge.next;
              }
          }
      }
      Step(dt, velocityIterations, positionIterations) {
          const stepTimer = b2World.Step_s_stepTimer.Reset();
          // If new fixtures were added, we need to find the new contacts.
          if (this.m_newContacts) {
              this.m_contactManager.FindNewContacts();
              this.m_newContacts = false;
          }
          this.m_locked = true;
          const step = b2World.Step_s_step;
          step.dt = dt;
          step.velocityIterations = velocityIterations;
          step.positionIterations = positionIterations;
          if (dt > 0) {
              step.inv_dt = 1 / dt;
          }
          else {
              step.inv_dt = 0;
          }
          step.dtRatio = this.m_inv_dt0 * dt;
          step.warmStarting = this.m_warmStarting;
          // Update contacts. This is where some contacts are destroyed.
          const timer = b2World.Step_s_timer.Reset();
          this.m_contactManager.Collide();
          this.m_profile.collide = timer.GetMilliseconds();
          // Integrate velocities, solve velocity constraints, and integrate positions.
          if (this.m_stepComplete && step.dt > 0) {
              const timer = b2World.Step_s_timer.Reset();
              this.Solve(step);
              this.m_profile.solve = timer.GetMilliseconds();
          }
          // Handle TOI events.
          if (this.m_continuousPhysics && step.dt > 0) {
              const timer = b2World.Step_s_timer.Reset();
              this.SolveTOI(step);
              this.m_profile.solveTOI = timer.GetMilliseconds();
          }
          if (step.dt > 0) {
              this.m_inv_dt0 = step.inv_dt;
          }
          if (this.m_clearForces) {
              this.ClearForces();
          }
          this.m_locked = false;
          this.m_profile.step = stepTimer.GetMilliseconds();
      }
      /// Manually clear the force buffer on all bodies. By default, forces are cleared automatically
      /// after each call to Step. The default behavior is modified by calling SetAutoClearForces.
      /// The purpose of this function is to support sub-stepping. Sub-stepping is often used to maintain
      /// a fixed sized time step under a variable frame-rate.
      /// When you perform sub-stepping you will disable auto clearing of forces and instead call
      /// ClearForces after all sub-steps are complete in one pass of your game loop.
      /// @see SetAutoClearForces
      ClearForces() {
          for (let body = this.m_bodyList; body; body = body.m_next) {
              body.m_force.SetZero();
              body.m_torque = 0;
          }
      }
      DebugDraw() {
          if (this.m_debugDraw === null) {
              return;
          }
          const flags = this.m_debugDraw.GetFlags();
          const color = b2World.DebugDraw_s_color.SetRGB(0, 0, 0);
          if (flags & exports.b2DrawFlags.e_shapeBit) {
              for (let b = this.m_bodyList; b; b = b.m_next) {
                  const xf = b.m_xf;
                  this.m_debugDraw.PushTransform(xf);
                  for (let f = b.GetFixtureList(); f; f = f.m_next) {
                      if (b.GetType() === exports.b2BodyType.b2_dynamicBody && b.m_mass === 0.0) {
                          // Bad body
                          this.DrawShape(f, new b2Color(1.0, 0.0, 0.0));
                      }
                      else if (!b.IsEnabled()) {
                          color.SetRGB(0.5, 0.5, 0.3);
                          this.DrawShape(f, color);
                      }
                      else if (b.GetType() === exports.b2BodyType.b2_staticBody) {
                          color.SetRGB(0.5, 0.9, 0.5);
                          this.DrawShape(f, color);
                      }
                      else if (b.GetType() === exports.b2BodyType.b2_kinematicBody) {
                          color.SetRGB(0.5, 0.5, 0.9);
                          this.DrawShape(f, color);
                      }
                      else if (!b.IsAwake()) {
                          color.SetRGB(0.6, 0.6, 0.6);
                          this.DrawShape(f, color);
                      }
                      else {
                          color.SetRGB(0.9, 0.7, 0.7);
                          this.DrawShape(f, color);
                      }
                  }
                  this.m_debugDraw.PopTransform(xf);
              }
          }
          if (flags & exports.b2DrawFlags.e_jointBit) {
              for (let j = this.m_jointList; j; j = j.m_next) {
                  j.Draw(this.m_debugDraw);
              }
          }
          if (flags & exports.b2DrawFlags.e_pairBit) {
              color.SetRGB(0.3, 0.9, 0.9);
              for (let contact = this.m_contactManager.m_contactList; contact; contact = contact.m_next) {
                  const fixtureA = contact.GetFixtureA();
                  const fixtureB = contact.GetFixtureB();
                  const indexA = contact.GetChildIndexA();
                  const indexB = contact.GetChildIndexB();
                  const cA = fixtureA.GetAABB(indexA).GetCenter();
                  const cB = fixtureB.GetAABB(indexB).GetCenter();
                  this.m_debugDraw.DrawSegment(cA, cB, color);
              }
          }
          if (flags & exports.b2DrawFlags.e_aabbBit) {
              color.SetRGB(0.9, 0.3, 0.9);
              const vs = b2World.DebugDraw_s_vs;
              for (let b = this.m_bodyList; b; b = b.m_next) {
                  if (!b.IsEnabled()) {
                      continue;
                  }
                  for (let f = b.GetFixtureList(); f; f = f.m_next) {
                      for (let i = 0; i < f.m_proxyCount; ++i) {
                          const proxy = f.m_proxies[i];
                          const aabb = proxy.treeNode.aabb;
                          vs[0].Set(aabb.lowerBound.x, aabb.lowerBound.y);
                          vs[1].Set(aabb.upperBound.x, aabb.lowerBound.y);
                          vs[2].Set(aabb.upperBound.x, aabb.upperBound.y);
                          vs[3].Set(aabb.lowerBound.x, aabb.upperBound.y);
                          this.m_debugDraw.DrawPolygon(vs, 4, color);
                      }
                  }
              }
          }
          if (flags & exports.b2DrawFlags.e_centerOfMassBit) {
              for (let b = this.m_bodyList; b; b = b.m_next) {
                  const xf = b2World.DebugDraw_s_xf;
                  xf.q.Copy(b.m_xf.q);
                  xf.p.Copy(b.GetWorldCenter());
                  this.m_debugDraw.DrawTransform(xf);
              }
          }
      }
      QueryAABB(...args) {
          if (args[0] instanceof b2QueryCallback) {
              this._QueryAABB(args[0], args[1]);
          }
          else {
              this._QueryAABB(null, args[0], args[1]);
          }
      }
      _QueryAABB(callback, aabb, fn) {
          this.m_contactManager.m_broadPhase.Query(aabb, (proxy) => {
              const fixture_proxy = proxy.userData;
              // DEBUG: b2Assert(fixture_proxy instanceof b2FixtureProxy);
              const fixture = fixture_proxy.fixture;
              if (callback) {
                  return callback.ReportFixture(fixture);
              }
              else if (fn) {
                  return fn(fixture);
              }
              return true;
          });
      }
      QueryAllAABB(aabb, out = []) {
          this.QueryAABB(aabb, (fixture) => { out.push(fixture); return true; });
          return out;
      }
      QueryPointAABB(...args) {
          if (args[0] instanceof b2QueryCallback) {
              this._QueryPointAABB(args[0], args[1]);
          }
          else {
              this._QueryPointAABB(null, args[0], args[1]);
          }
      }
      _QueryPointAABB(callback, point, fn) {
          this.m_contactManager.m_broadPhase.QueryPoint(point, (proxy) => {
              const fixture_proxy = proxy.userData;
              // DEBUG: b2Assert(fixture_proxy instanceof b2FixtureProxy);
              const fixture = fixture_proxy.fixture;
              if (callback) {
                  return callback.ReportFixture(fixture);
              }
              else if (fn) {
                  return fn(fixture);
              }
              return true;
          });
      }
      QueryAllPointAABB(point, out = []) {
          this.QueryPointAABB(point, (fixture) => { out.push(fixture); return true; });
          return out;
      }
      QueryFixtureShape(...args) {
          if (args[0] instanceof b2QueryCallback) {
              this._QueryFixtureShape(args[0], args[1], args[2], args[3]);
          }
          else {
              this._QueryFixtureShape(null, args[0], args[1], args[2], args[3]);
          }
      }
      _QueryFixtureShape(callback, shape, index, transform, fn) {
          const aabb = b2World.QueryFixtureShape_s_aabb;
          shape.ComputeAABB(aabb, transform, index);
          this.m_contactManager.m_broadPhase.Query(aabb, (proxy) => {
              const fixture_proxy = proxy.userData;
              // DEBUG: b2Assert(fixture_proxy instanceof b2FixtureProxy);
              const fixture = fixture_proxy.fixture;
              if (b2TestOverlapShape(shape, index, fixture.GetShape(), fixture_proxy.childIndex, transform, fixture.GetBody().GetTransform())) {
                  if (callback) {
                      return callback.ReportFixture(fixture);
                  }
                  else if (fn) {
                      return fn(fixture);
                  }
              }
              return true;
          });
      }
      QueryAllFixtureShape(shape, index, transform, out = []) {
          this.QueryFixtureShape(shape, index, transform, (fixture) => { out.push(fixture); return true; });
          return out;
      }
      QueryFixturePoint(...args) {
          if (args[0] instanceof b2QueryCallback) {
              this._QueryFixturePoint(args[0], args[1]);
          }
          else {
              this._QueryFixturePoint(null, args[0], args[1]);
          }
      }
      _QueryFixturePoint(callback, point, fn) {
          this.m_contactManager.m_broadPhase.QueryPoint(point, (proxy) => {
              const fixture_proxy = proxy.userData;
              // DEBUG: b2Assert(fixture_proxy instanceof b2FixtureProxy);
              const fixture = fixture_proxy.fixture;
              if (fixture.TestPoint(point)) {
                  if (callback) {
                      return callback.ReportFixture(fixture);
                  }
                  else if (fn) {
                      return fn(fixture);
                  }
              }
              return true;
          });
      }
      QueryAllFixturePoint(point, out = []) {
          this.QueryFixturePoint(point, (fixture) => { out.push(fixture); return true; });
          return out;
      }
      RayCast(...args) {
          if (args[0] instanceof b2RayCastCallback) {
              this._RayCast(args[0], args[1], args[2]);
          }
          else {
              this._RayCast(null, args[0], args[1], args[2]);
          }
      }
      _RayCast(callback, point1, point2, fn) {
          const input = b2World.RayCast_s_input;
          input.maxFraction = 1;
          input.p1.Copy(point1);
          input.p2.Copy(point2);
          this.m_contactManager.m_broadPhase.RayCast(input, (input, proxy) => {
              const fixture_proxy = proxy.userData;
              // DEBUG: b2Assert(fixture_proxy instanceof b2FixtureProxy);
              const fixture = fixture_proxy.fixture;
              const index = fixture_proxy.childIndex;
              const output = b2World.RayCast_s_output;
              const hit = fixture.RayCast(output, input, index);
              if (hit) {
                  const fraction = output.fraction;
                  const point = b2World.RayCast_s_point;
                  point.Set((1 - fraction) * point1.x + fraction * point2.x, (1 - fraction) * point1.y + fraction * point2.y);
                  if (callback) {
                      return callback.ReportFixture(fixture, point, output.normal, fraction);
                  }
                  else if (fn) {
                      return fn(fixture, point, output.normal, fraction);
                  }
              }
              return input.maxFraction;
          });
      }
      RayCastOne(point1, point2) {
          let result = null;
          let min_fraction = 1;
          this.RayCast(point1, point2, (fixture, point, normal, fraction) => {
              if (fraction < min_fraction) {
                  min_fraction = fraction;
                  result = fixture;
              }
              return min_fraction;
          });
          return result;
      }
      RayCastAll(point1, point2, out = []) {
          this.RayCast(point1, point2, (fixture, point, normal, fraction) => {
              out.push(fixture);
              return 1;
          });
          return out;
      }
      /// Get the world body list. With the returned body, use b2Body::GetNext to get
      /// the next body in the world list. A NULL body indicates the end of the list.
      /// @return the head of the world body list.
      GetBodyList() {
          return this.m_bodyList;
      }
      /// Get the world joint list. With the returned joint, use b2Joint::GetNext to get
      /// the next joint in the world list. A NULL joint indicates the end of the list.
      /// @return the head of the world joint list.
      GetJointList() {
          return this.m_jointList;
      }
      /// Get the world contact list. With the returned contact, use b2Contact::GetNext to get
      /// the next contact in the world list. A NULL contact indicates the end of the list.
      /// @return the head of the world contact list.
      /// @warning contacts are created and destroyed in the middle of a time step.
      /// Use b2ContactListener to avoid missing contacts.
      GetContactList() {
          return this.m_contactManager.m_contactList;
      }
      /// Enable/disable sleep.
      SetAllowSleeping(flag) {
          if (flag === this.m_allowSleep) {
              return;
          }
          this.m_allowSleep = flag;
          if (!this.m_allowSleep) {
              for (let b = this.m_bodyList; b; b = b.m_next) {
                  b.SetAwake(true);
              }
          }
      }
      GetAllowSleeping() {
          return this.m_allowSleep;
      }
      /// Enable/disable warm starting. For testing.
      SetWarmStarting(flag) {
          this.m_warmStarting = flag;
      }
      GetWarmStarting() {
          return this.m_warmStarting;
      }
      /// Enable/disable continuous physics. For testing.
      SetContinuousPhysics(flag) {
          this.m_continuousPhysics = flag;
      }
      GetContinuousPhysics() {
          return this.m_continuousPhysics;
      }
      /// Enable/disable single stepped continuous physics. For testing.
      SetSubStepping(flag) {
          this.m_subStepping = flag;
      }
      GetSubStepping() {
          return this.m_subStepping;
      }
      /// Get the number of broad-phase proxies.
      GetProxyCount() {
          return this.m_contactManager.m_broadPhase.GetProxyCount();
      }
      /// Get the number of bodies.
      GetBodyCount() {
          return this.m_bodyCount;
      }
      /// Get the number of joints.
      GetJointCount() {
          return this.m_jointCount;
      }
      /// Get the number of contacts (each may have 0 or more contact points).
      GetContactCount() {
          return this.m_contactManager.m_contactCount;
      }
      /// Get the height of the dynamic tree.
      GetTreeHeight() {
          return this.m_contactManager.m_broadPhase.GetTreeHeight();
      }
      /// Get the balance of the dynamic tree.
      GetTreeBalance() {
          return this.m_contactManager.m_broadPhase.GetTreeBalance();
      }
      /// Get the quality metric of the dynamic tree. The smaller the better.
      /// The minimum is 1.
      GetTreeQuality() {
          return this.m_contactManager.m_broadPhase.GetTreeQuality();
      }
      /// Change the global gravity vector.
      SetGravity(gravity, wake = true) {
          if (!b2Vec2.IsEqualToV(this.m_gravity, gravity)) {
              this.m_gravity.Copy(gravity);
              if (wake) {
                  for (let b = this.m_bodyList; b; b = b.m_next) {
                      b.SetAwake(true);
                  }
              }
          }
      }
      /// Get the global gravity vector.
      GetGravity() {
          return this.m_gravity;
      }
      /// Is the world locked (in the middle of a time step).
      IsLocked() {
          return this.m_locked;
      }
      /// Set flag to control automatic clearing of forces after each time step.
      SetAutoClearForces(flag) {
          this.m_clearForces = flag;
      }
      /// Get the flag that controls automatic clearing of forces after each time step.
      GetAutoClearForces() {
          return this.m_clearForces;
      }
      /// Shift the world origin. Useful for large worlds.
      /// The body shift formula is: position -= newOrigin
      /// @param newOrigin the new origin with respect to the old origin
      ShiftOrigin(newOrigin) {
          if (this.IsLocked()) {
              throw new Error();
          }
          for (let b = this.m_bodyList; b; b = b.m_next) {
              b.m_xf.p.SelfSub(newOrigin);
              b.m_sweep.c0.SelfSub(newOrigin);
              b.m_sweep.c.SelfSub(newOrigin);
          }
          for (let j = this.m_jointList; j; j = j.m_next) {
              j.ShiftOrigin(newOrigin);
          }
          this.m_contactManager.m_broadPhase.ShiftOrigin(newOrigin);
      }
      /// Get the contact manager for testing.
      GetContactManager() {
          return this.m_contactManager;
      }
      /// Get the current profile.
      GetProfile() {
          return this.m_profile;
      }
      /// Dump the world into the log file.
      /// @warning this should be called outside of a time step.
      Dump(log) {
          if (this.m_locked) {
              return;
          }
          // b2OpenDump("box2d_dump.inl");
          log("const g: b2Vec2 = new b2Vec2(%.15f, %.15f);\n", this.m_gravity.x, this.m_gravity.y);
          log("this.m_world.SetGravity(g);\n");
          log("const bodies: b2Body[] = [];\n");
          log("const joints: b2Joint[] = [];\n");
          let i = 0;
          for (let b = this.m_bodyList; b; b = b.m_next) {
              b.m_islandIndex = i;
              b.Dump(log);
              ++i;
          }
          i = 0;
          for (let j = this.m_jointList; j; j = j.m_next) {
              j.m_index = i;
              ++i;
          }
          // First pass on joints, skip gear joints.
          for (let j = this.m_jointList; j; j = j.m_next) {
              if (j.m_type === exports.b2JointType.e_gearJoint) {
                  continue;
              }
              log("{\n");
              j.Dump(log);
              log("}\n");
          }
          // Second pass on joints, only gear joints.
          for (let j = this.m_jointList; j; j = j.m_next) {
              if (j.m_type !== exports.b2JointType.e_gearJoint) {
                  continue;
              }
              log("{\n");
              j.Dump(log);
              log("}\n");
          }
          // b2CloseDump();
      }
      DrawShape(fixture, color) {
          if (this.m_debugDraw === null) {
              return;
          }
          const shape = fixture.GetShape();
          switch (shape.m_type) {
              case exports.b2ShapeType.e_circleShape: {
                  const circle = shape;
                  const center = circle.m_p;
                  const radius = circle.m_radius;
                  const axis = b2Vec2.UNITX;
                  this.m_debugDraw.DrawSolidCircle(center, radius, axis, color);
                  break;
              }
              case exports.b2ShapeType.e_edgeShape: {
                  const edge = shape;
                  const v1 = edge.m_vertex1;
                  const v2 = edge.m_vertex2;
                  this.m_debugDraw.DrawSegment(v1, v2, color);
                  if (edge.m_oneSided === false) {
                      this.m_debugDraw.DrawPoint(v1, 4.0, color);
                      this.m_debugDraw.DrawPoint(v2, 4.0, color);
                  }
                  break;
              }
              case exports.b2ShapeType.e_chainShape: {
                  const chain = shape;
                  const count = chain.m_count;
                  const vertices = chain.m_vertices;
                  let v1 = vertices[0];
                  for (let i = 1; i < count; ++i) {
                      const v2 = vertices[i];
                      this.m_debugDraw.DrawSegment(v1, v2, color);
                      v1 = v2;
                  }
                  break;
              }
              case exports.b2ShapeType.e_polygonShape: {
                  const poly = shape;
                  const vertexCount = poly.m_count;
                  const vertices = poly.m_vertices;
                  this.m_debugDraw.DrawSolidPolygon(vertices, vertexCount, color);
                  break;
              }
          }
      }
      Solve(step) {
          this.m_profile.solveInit = 0;
          this.m_profile.solveVelocity = 0;
          this.m_profile.solvePosition = 0;
          // Size the island for the worst case.
          const island = this.m_island;
          island.Initialize(this.m_bodyCount, this.m_contactManager.m_contactCount, this.m_jointCount, this.m_contactManager.m_contactListener);
          // Clear all the island flags.
          for (let b = this.m_bodyList; b; b = b.m_next) {
              b.m_islandFlag = false;
          }
          for (let c = this.m_contactManager.m_contactList; c; c = c.m_next) {
              c.m_islandFlag = false;
          }
          for (let j = this.m_jointList; j; j = j.m_next) {
              j.m_islandFlag = false;
          }
          // Build and simulate all awake islands.
          // DEBUG: const stackSize: number = this.m_bodyCount;
          const stack = this.s_stack;
          for (let seed = this.m_bodyList; seed; seed = seed.m_next) {
              if (seed.m_islandFlag) {
                  continue;
              }
              if (!seed.IsAwake() || !seed.IsEnabled()) {
                  continue;
              }
              // The seed can be dynamic or kinematic.
              if (seed.GetType() === exports.b2BodyType.b2_staticBody) {
                  continue;
              }
              // Reset island and stack.
              island.Clear();
              let stackCount = 0;
              stack[stackCount++] = seed;
              seed.m_islandFlag = true;
              // Perform a depth first search (DFS) on the constraint graph.
              while (stackCount > 0) {
                  // Grab the next body off the stack and add it to the island.
                  const b = stack[--stackCount];
                  if (!b) {
                      throw new Error();
                  }
                  // DEBUG: b2Assert(b.IsEnabled());
                  island.AddBody(b);
                  // To keep islands as small as possible, we don't
                  // propagate islands across static bodies.
                  if (b.GetType() === exports.b2BodyType.b2_staticBody) {
                      continue;
                  }
                  // Make sure the body is awake. (without resetting sleep timer).
                  b.m_awakeFlag = true;
                  // Search all contacts connected to this body.
                  for (let ce = b.m_contactList; ce; ce = ce.next) {
                      const contact = ce.contact;
                      // Has this contact already been added to an island?
                      if (contact.m_islandFlag) {
                          continue;
                      }
                      // Is this contact solid and touching?
                      if (!contact.IsEnabled() || !contact.IsTouching()) {
                          continue;
                      }
                      // Skip sensors.
                      const sensorA = contact.m_fixtureA.m_isSensor;
                      const sensorB = contact.m_fixtureB.m_isSensor;
                      if (sensorA || sensorB) {
                          continue;
                      }
                      island.AddContact(contact);
                      contact.m_islandFlag = true;
                      const other = ce.other;
                      // Was the other body already added to this island?
                      if (other.m_islandFlag) {
                          continue;
                      }
                      // DEBUG: b2Assert(stackCount < stackSize);
                      stack[stackCount++] = other;
                      other.m_islandFlag = true;
                  }
                  // Search all joints connect to this body.
                  for (let je = b.m_jointList; je; je = je.next) {
                      if (je.joint.m_islandFlag) {
                          continue;
                      }
                      const other = je.other;
                      // Don't simulate joints connected to disabled bodies.
                      if (!other.IsEnabled()) {
                          continue;
                      }
                      island.AddJoint(je.joint);
                      je.joint.m_islandFlag = true;
                      if (other.m_islandFlag) {
                          continue;
                      }
                      // DEBUG: b2Assert(stackCount < stackSize);
                      stack[stackCount++] = other;
                      other.m_islandFlag = true;
                  }
              }
              const profile = new b2Profile();
              island.Solve(profile, step, this.m_gravity, this.m_allowSleep);
              this.m_profile.solveInit += profile.solveInit;
              this.m_profile.solveVelocity += profile.solveVelocity;
              this.m_profile.solvePosition += profile.solvePosition;
              // Post solve cleanup.
              for (let i = 0; i < island.m_bodyCount; ++i) {
                  // Allow static bodies to participate in other islands.
                  const b = island.m_bodies[i];
                  if (b.GetType() === exports.b2BodyType.b2_staticBody) {
                      b.m_islandFlag = false;
                  }
              }
          }
          for (let i = 0; i < stack.length; ++i) {
              if (!stack[i]) {
                  break;
              }
              stack[i] = null;
          }
          const timer = new b2Timer();
          // Synchronize fixtures, check for out of range bodies.
          for (let b = this.m_bodyList; b; b = b.m_next) {
              // If a body was not in an island then it did not move.
              if (!b.m_islandFlag) {
                  continue;
              }
              if (b.GetType() === exports.b2BodyType.b2_staticBody) {
                  continue;
              }
              // Update fixtures (for broad-phase).
              b.SynchronizeFixtures();
          }
          // Look for new contacts.
          this.m_contactManager.FindNewContacts();
          this.m_profile.broadphase = timer.GetMilliseconds();
      }
      SolveTOI(step) {
          const island = this.m_island;
          island.Initialize(2 * b2_maxTOIContacts, b2_maxTOIContacts, 0, this.m_contactManager.m_contactListener);
          if (this.m_stepComplete) {
              for (let b = this.m_bodyList; b; b = b.m_next) {
                  b.m_islandFlag = false;
                  b.m_sweep.alpha0 = 0;
              }
              for (let c = this.m_contactManager.m_contactList; c; c = c.m_next) {
                  // Invalidate TOI
                  c.m_toiFlag = false;
                  c.m_islandFlag = false;
                  c.m_toiCount = 0;
                  c.m_toi = 1;
              }
          }
          // Find TOI events and solve them.
          for (;;) {
              // Find the first TOI.
              let minContact = null;
              let minAlpha = 1;
              for (let c = this.m_contactManager.m_contactList; c; c = c.m_next) {
                  // Is this contact disabled?
                  if (!c.IsEnabled()) {
                      continue;
                  }
                  // Prevent excessive sub-stepping.
                  if (c.m_toiCount > b2_maxSubSteps) {
                      continue;
                  }
                  let alpha = 1;
                  if (c.m_toiFlag) {
                      // This contact has a valid cached TOI.
                      alpha = c.m_toi;
                  }
                  else {
                      const fA = c.GetFixtureA();
                      const fB = c.GetFixtureB();
                      // Is there a sensor?
                      if (fA.IsSensor() || fB.IsSensor()) {
                          continue;
                      }
                      const bA = fA.GetBody();
                      const bB = fB.GetBody();
                      const typeA = bA.m_type;
                      const typeB = bB.m_type;
                      // DEBUG: b2Assert(typeA !== b2BodyType.b2_staticBody || typeB !== b2BodyType.b2_staticBody);
                      const activeA = bA.IsAwake() && typeA !== exports.b2BodyType.b2_staticBody;
                      const activeB = bB.IsAwake() && typeB !== exports.b2BodyType.b2_staticBody;
                      // Is at least one body active (awake and dynamic or kinematic)?
                      if (!activeA && !activeB) {
                          continue;
                      }
                      const collideA = bA.IsBullet() || typeA !== exports.b2BodyType.b2_dynamicBody;
                      const collideB = bB.IsBullet() || typeB !== exports.b2BodyType.b2_dynamicBody;
                      // Are these two non-bullet dynamic bodies?
                      if (!collideA && !collideB) {
                          continue;
                      }
                      // Compute the TOI for this contact.
                      // Put the sweeps onto the same time interval.
                      let alpha0 = bA.m_sweep.alpha0;
                      if (bA.m_sweep.alpha0 < bB.m_sweep.alpha0) {
                          alpha0 = bB.m_sweep.alpha0;
                          bA.m_sweep.Advance(alpha0);
                      }
                      else if (bB.m_sweep.alpha0 < bA.m_sweep.alpha0) {
                          alpha0 = bA.m_sweep.alpha0;
                          bB.m_sweep.Advance(alpha0);
                      }
                      // DEBUG: b2Assert(alpha0 < 1);
                      const indexA = c.GetChildIndexA();
                      const indexB = c.GetChildIndexB();
                      // Compute the time of impact in interval [0, minTOI]
                      const input = b2World.SolveTOI_s_toi_input;
                      input.proxyA.SetShape(fA.GetShape(), indexA);
                      input.proxyB.SetShape(fB.GetShape(), indexB);
                      input.sweepA.Copy(bA.m_sweep);
                      input.sweepB.Copy(bB.m_sweep);
                      input.tMax = 1;
                      const output = b2World.SolveTOI_s_toi_output;
                      b2TimeOfImpact(output, input);
                      // Beta is the fraction of the remaining portion of the .
                      const beta = output.t;
                      if (output.state === exports.b2TOIOutputState.e_touching) {
                          alpha = b2Min(alpha0 + (1 - alpha0) * beta, 1);
                      }
                      else {
                          alpha = 1;
                      }
                      c.m_toi = alpha;
                      c.m_toiFlag = true;
                  }
                  if (alpha < minAlpha) {
                      // This is the minimum TOI found so far.
                      minContact = c;
                      minAlpha = alpha;
                  }
              }
              if (minContact === null || 1 - 10 * b2_epsilon < minAlpha) {
                  // No more TOI events. Done!
                  this.m_stepComplete = true;
                  break;
              }
              // Advance the bodies to the TOI.
              const fA = minContact.GetFixtureA();
              const fB = minContact.GetFixtureB();
              const bA = fA.GetBody();
              const bB = fB.GetBody();
              const backup1 = b2World.SolveTOI_s_backup1.Copy(bA.m_sweep);
              const backup2 = b2World.SolveTOI_s_backup2.Copy(bB.m_sweep);
              bA.Advance(minAlpha);
              bB.Advance(minAlpha);
              // The TOI contact likely has some new contact points.
              minContact.Update(this.m_contactManager.m_contactListener);
              minContact.m_toiFlag = false;
              ++minContact.m_toiCount;
              // Is the contact solid?
              if (!minContact.IsEnabled() || !minContact.IsTouching()) {
                  // Restore the sweeps.
                  minContact.SetEnabled(false);
                  bA.m_sweep.Copy(backup1);
                  bB.m_sweep.Copy(backup2);
                  bA.SynchronizeTransform();
                  bB.SynchronizeTransform();
                  continue;
              }
              bA.SetAwake(true);
              bB.SetAwake(true);
              // Build the island
              island.Clear();
              island.AddBody(bA);
              island.AddBody(bB);
              island.AddContact(minContact);
              bA.m_islandFlag = true;
              bB.m_islandFlag = true;
              minContact.m_islandFlag = true;
              // Get contacts on bodyA and bodyB.
              // const bodies: b2Body[] = [bA, bB];
              for (let i = 0; i < 2; ++i) {
                  const body = (i === 0) ? (bA) : (bB); // bodies[i];
                  if (body.m_type === exports.b2BodyType.b2_dynamicBody) {
                      for (let ce = body.m_contactList; ce; ce = ce.next) {
                          if (island.m_bodyCount === island.m_bodyCapacity) {
                              break;
                          }
                          if (island.m_contactCount === island.m_contactCapacity) {
                              break;
                          }
                          const contact = ce.contact;
                          // Has this contact already been added to the island?
                          if (contact.m_islandFlag) {
                              continue;
                          }
                          // Only add static, kinematic, or bullet bodies.
                          const other = ce.other;
                          if (other.m_type === exports.b2BodyType.b2_dynamicBody &&
                              !body.IsBullet() && !other.IsBullet()) {
                              continue;
                          }
                          // Skip sensors.
                          const sensorA = contact.m_fixtureA.m_isSensor;
                          const sensorB = contact.m_fixtureB.m_isSensor;
                          if (sensorA || sensorB) {
                              continue;
                          }
                          // Tentatively advance the body to the TOI.
                          const backup = b2World.SolveTOI_s_backup.Copy(other.m_sweep);
                          if (!other.m_islandFlag) {
                              other.Advance(minAlpha);
                          }
                          // Update the contact points
                          contact.Update(this.m_contactManager.m_contactListener);
                          // Was the contact disabled by the user?
                          if (!contact.IsEnabled()) {
                              other.m_sweep.Copy(backup);
                              other.SynchronizeTransform();
                              continue;
                          }
                          // Are there contact points?
                          if (!contact.IsTouching()) {
                              other.m_sweep.Copy(backup);
                              other.SynchronizeTransform();
                              continue;
                          }
                          // Add the contact to the island
                          contact.m_islandFlag = true;
                          island.AddContact(contact);
                          // Has the other body already been added to the island?
                          if (other.m_islandFlag) {
                              continue;
                          }
                          // Add the other body to the island.
                          other.m_islandFlag = true;
                          if (other.m_type !== exports.b2BodyType.b2_staticBody) {
                              other.SetAwake(true);
                          }
                          island.AddBody(other);
                      }
                  }
              }
              const subStep = b2World.SolveTOI_s_subStep;
              subStep.dt = (1 - minAlpha) * step.dt;
              subStep.inv_dt = 1 / subStep.dt;
              subStep.dtRatio = 1;
              subStep.positionIterations = 20;
              subStep.velocityIterations = step.velocityIterations;
              subStep.warmStarting = false;
              island.SolveTOI(subStep, bA.m_islandIndex, bB.m_islandIndex);
              // Reset island flags and synchronize broad-phase proxies.
              for (let i = 0; i < island.m_bodyCount; ++i) {
                  const body = island.m_bodies[i];
                  body.m_islandFlag = false;
                  if (body.m_type !== exports.b2BodyType.b2_dynamicBody) {
                      continue;
                  }
                  body.SynchronizeFixtures();
                  // Invalidate all contact TOIs on this displaced body.
                  for (let ce = body.m_contactList; ce; ce = ce.next) {
                      ce.contact.m_toiFlag = false;
                      ce.contact.m_islandFlag = false;
                  }
              }
              // Commit fixture proxy movements to the broad-phase so that new contacts are created.
              // Also, some contacts can be destroyed.
              this.m_contactManager.FindNewContacts();
              if (this.m_subStepping) {
                  this.m_stepComplete = false;
                  break;
              }
          }
      }
  }
  /// Take a time step. This performs collision detection, integration,
  /// and constraint solution.
  /// @param timeStep the amount of time to simulate, this should not vary.
  /// @param velocityIterations for the velocity constraint solver.
  /// @param positionIterations for the position constraint solver.
  b2World.Step_s_step = new b2TimeStep();
  b2World.Step_s_stepTimer = new b2Timer();
  b2World.Step_s_timer = new b2Timer();
  /// Call this to draw shapes and other debug draw data.
  b2World.DebugDraw_s_color = new b2Color(0, 0, 0);
  b2World.DebugDraw_s_vs = b2Vec2.MakeArray(4);
  b2World.DebugDraw_s_xf = new b2Transform();
  b2World.QueryFixtureShape_s_aabb = new b2AABB();
  b2World.RayCast_s_input = new b2RayCastInput();
  b2World.RayCast_s_output = new b2RayCastOutput();
  b2World.RayCast_s_point = new b2Vec2();
  b2World.SolveTOI_s_subStep = new b2TimeStep();
  b2World.SolveTOI_s_backup = new b2Sweep();
  b2World.SolveTOI_s_backup1 = new b2Sweep();
  b2World.SolveTOI_s_backup2 = new b2Sweep();
  b2World.SolveTOI_s_toi_input = new b2TOIInput();
  b2World.SolveTOI_s_toi_output = new b2TOIOutput();

  // MIT License
  exports.b2StretchingModel = void 0;
  (function (b2StretchingModel) {
      b2StretchingModel[b2StretchingModel["b2_pbdStretchingModel"] = 0] = "b2_pbdStretchingModel";
      b2StretchingModel[b2StretchingModel["b2_xpbdStretchingModel"] = 1] = "b2_xpbdStretchingModel";
  })(exports.b2StretchingModel || (exports.b2StretchingModel = {}));
  exports.b2BendingModel = void 0;
  (function (b2BendingModel) {
      b2BendingModel[b2BendingModel["b2_springAngleBendingModel"] = 0] = "b2_springAngleBendingModel";
      b2BendingModel[b2BendingModel["b2_pbdAngleBendingModel"] = 1] = "b2_pbdAngleBendingModel";
      b2BendingModel[b2BendingModel["b2_xpbdAngleBendingModel"] = 2] = "b2_xpbdAngleBendingModel";
      b2BendingModel[b2BendingModel["b2_pbdDistanceBendingModel"] = 3] = "b2_pbdDistanceBendingModel";
      b2BendingModel[b2BendingModel["b2_pbdHeightBendingModel"] = 4] = "b2_pbdHeightBendingModel";
      b2BendingModel[b2BendingModel["b2_pbdTriangleBendingModel"] = 5] = "b2_pbdTriangleBendingModel";
  })(exports.b2BendingModel || (exports.b2BendingModel = {}));
  ///
  class b2RopeTuning {
      constructor() {
          this.stretchingModel = exports.b2StretchingModel.b2_pbdStretchingModel;
          this.bendingModel = exports.b2BendingModel.b2_pbdAngleBendingModel;
          this.damping = 0.0;
          this.stretchStiffness = 1.0;
          this.stretchHertz = 0.0;
          this.stretchDamping = 0.0;
          this.bendStiffness = 0.5;
          this.bendHertz = 1.0;
          this.bendDamping = 0.0;
          this.isometric = false;
          this.fixedEffectiveMass = false;
          this.warmStart = false;
      }
      Copy(other) {
          this.stretchingModel = other.stretchingModel;
          this.bendingModel = other.bendingModel;
          this.damping = other.damping;
          this.stretchStiffness = other.stretchStiffness;
          this.stretchHertz = other.stretchHertz;
          this.stretchDamping = other.stretchDamping;
          this.bendStiffness = other.bendStiffness;
          this.bendHertz = other.bendHertz;
          this.bendDamping = other.bendDamping;
          this.isometric = other.isometric;
          this.fixedEffectiveMass = other.fixedEffectiveMass;
          this.warmStart = other.warmStart;
          return this;
      }
  }
  ///
  class b2RopeDef {
      constructor() {
          this.position = new b2Vec2();
          // b2Vec2* vertices;
          this.vertices = [];
          // int32 count;
          this.count = 0;
          // float* masses;
          this.masses = [];
          // b2Vec2 gravity;
          this.gravity = new b2Vec2();
          // b2RopeTuning tuning;
          this.tuning = new b2RopeTuning();
      }
  }
  class b2RopeStretch {
      constructor() {
          this.i1 = 0;
          this.i2 = 0;
          this.invMass1 = 0.0;
          this.invMass2 = 0.0;
          this.L = 0.0;
          this.lambda = 0.0;
          this.spring = 0.0;
          this.damper = 0.0;
      }
  }
  class b2RopeBend {
      constructor() {
          this.i1 = 0;
          this.i2 = 0;
          this.i3 = 0;
          this.invMass1 = 0.0;
          this.invMass2 = 0.0;
          this.invMass3 = 0.0;
          this.invEffectiveMass = 0.0;
          this.lambda = 0.0;
          this.L1 = 0.0;
          this.L2 = 0.0;
          this.alpha1 = 0.0;
          this.alpha2 = 0.0;
          this.spring = 0.0;
          this.damper = 0.0;
      }
  }
  ///
  class b2Rope {
      constructor() {
          this.m_position = new b2Vec2();
          this.m_count = 0;
          this.m_stretchCount = 0;
          this.m_bendCount = 0;
          // b2RopeStretch* m_stretchConstraints;
          this.m_stretchConstraints = [];
          // b2RopeBend* m_bendConstraints;
          this.m_bendConstraints = [];
          // b2Vec2* m_bindPositions;
          this.m_bindPositions = [];
          // b2Vec2* m_ps;
          this.m_ps = [];
          // b2Vec2* m_p0s;
          this.m_p0s = [];
          // b2Vec2* m_vs;
          this.m_vs = [];
          // float* m_invMasses;
          this.m_invMasses = [];
          // b2Vec2 m_gravity;
          this.m_gravity = new b2Vec2();
          this.m_tuning = new b2RopeTuning();
      }
      Create(def) {
          // b2Assert(def.count >= 3);
          this.m_position.Copy(def.position);
          this.m_count = def.count;
          function make_array(array, count, make) {
              for (let index = 0; index < count; ++index) {
                  array[index] = make(index);
              }
          }
          // this.m_bindPositions = (b2Vec2*)b2Alloc(this.m_count * sizeof(b2Vec2));
          make_array(this.m_bindPositions, this.m_count, () => new b2Vec2());
          // this.m_ps = (b2Vec2*)b2Alloc(this.m_count * sizeof(b2Vec2));
          make_array(this.m_ps, this.m_count, () => new b2Vec2());
          // this.m_p0s = (b2Vec2*)b2Alloc(this.m_count * sizeof(b2Vec2));
          make_array(this.m_p0s, this.m_count, () => new b2Vec2());
          // this.m_vs = (b2Vec2*)b2Alloc(this.m_count * sizeof(b2Vec2));
          make_array(this.m_vs, this.m_count, () => new b2Vec2());
          // this.m_invMasses = (float*)b2Alloc(this.m_count * sizeof(float));
          make_array(this.m_invMasses, this.m_count, () => 0.0);
          for (let i = 0; i < this.m_count; ++i) {
              this.m_bindPositions[i].Copy(def.vertices[i]);
              // this.m_ps[i] = def.vertices[i] + this.m_position;
              this.m_ps[i].Copy(def.vertices[i]).SelfAdd(this.m_position);
              // this.m_p0s[i] = def.vertices[i] + this.m_position;
              this.m_p0s[i].Copy(def.vertices[i]).SelfAdd(this.m_position);
              this.m_vs[i].SetZero();
              const m = def.masses[i];
              if (m > 0.0) {
                  this.m_invMasses[i] = 1.0 / m;
              }
              else {
                  this.m_invMasses[i] = 0.0;
              }
          }
          this.m_stretchCount = this.m_count - 1;
          this.m_bendCount = this.m_count - 2;
          // this.m_stretchConstraints = (b2RopeStretch*)b2Alloc(this.m_stretchCount * sizeof(b2RopeStretch));
          make_array(this.m_stretchConstraints, this.m_stretchCount, () => new b2RopeStretch());
          // this.m_bendConstraints = (b2RopeBend*)b2Alloc(this.m_bendCount * sizeof(b2RopeBend));
          make_array(this.m_bendConstraints, this.m_bendCount, () => new b2RopeBend());
          for (let i = 0; i < this.m_stretchCount; ++i) {
              const c = this.m_stretchConstraints[i];
              const p1 = this.m_ps[i];
              const p2 = this.m_ps[i + 1];
              c.i1 = i;
              c.i2 = i + 1;
              c.L = b2Vec2.DistanceVV(p1, p2);
              c.invMass1 = this.m_invMasses[i];
              c.invMass2 = this.m_invMasses[i + 1];
              c.lambda = 0.0;
              c.damper = 0.0;
              c.spring = 0.0;
          }
          for (let i = 0; i < this.m_bendCount; ++i) {
              const c = this.m_bendConstraints[i];
              const p1 = this.m_ps[i];
              const p2 = this.m_ps[i + 1];
              const p3 = this.m_ps[i + 2];
              c.i1 = i;
              c.i2 = i + 1;
              c.i3 = i + 2;
              c.invMass1 = this.m_invMasses[i];
              c.invMass2 = this.m_invMasses[i + 1];
              c.invMass3 = this.m_invMasses[i + 2];
              c.invEffectiveMass = 0.0;
              c.L1 = b2Vec2.DistanceVV(p1, p2);
              c.L2 = b2Vec2.DistanceVV(p2, p3);
              c.lambda = 0.0;
              // Pre-compute effective mass (TODO use flattened config)
              const e1 = b2Vec2.SubVV(p2, p1, new b2Vec2());
              const e2 = b2Vec2.SubVV(p3, p2, new b2Vec2());
              const L1sqr = e1.LengthSquared();
              const L2sqr = e2.LengthSquared();
              if (L1sqr * L2sqr === 0.0) {
                  continue;
              }
              // b2Vec2 Jd1 = (-1.0 / L1sqr) * e1.Skew();
              const Jd1 = new b2Vec2().Copy(e1).SelfSkew().SelfMul(-1.0 / L1sqr);
              // b2Vec2 Jd2 = (1.0 / L2sqr) * e2.Skew();
              const Jd2 = new b2Vec2().Copy(e2).SelfSkew().SelfMul(1.0 / L2sqr);
              // b2Vec2 J1 = -Jd1;
              const J1 = Jd1.Clone().SelfNeg();
              // b2Vec2 J2 = Jd1 - Jd2;
              const J2 = Jd1.Clone().SelfSub(Jd2);
              // b2Vec2 J3 = Jd2;
              const J3 = Jd2.Clone();
              c.invEffectiveMass = c.invMass1 * b2Vec2.DotVV(J1, J1) + c.invMass2 * b2Vec2.DotVV(J2, J2) + c.invMass3 * b2Vec2.DotVV(J3, J3);
              // b2Vec2 r = p3 - p1;
              const r = b2Vec2.SubVV(p3, p1, new b2Vec2());
              const rr = r.LengthSquared();
              if (rr === 0.0) {
                  continue;
              }
              // a1 = h2 / (h1 + h2)
              // a2 = h1 / (h1 + h2)
              c.alpha1 = b2Vec2.DotVV(e2, r) / rr;
              c.alpha2 = b2Vec2.DotVV(e1, r) / rr;
          }
          this.m_gravity.Copy(def.gravity);
          this.SetTuning(def.tuning);
      }
      SetTuning(tuning) {
          this.m_tuning.Copy(tuning);
          // Pre-compute spring and damper values based on tuning
          const bendOmega = 2.0 * b2_pi * this.m_tuning.bendHertz;
          for (let i = 0; i < this.m_bendCount; ++i) {
              const c = this.m_bendConstraints[i];
              const L1sqr = c.L1 * c.L1;
              const L2sqr = c.L2 * c.L2;
              if (L1sqr * L2sqr === 0.0) {
                  c.spring = 0.0;
                  c.damper = 0.0;
                  continue;
              }
              // Flatten the triangle formed by the two edges
              const J2 = 1.0 / c.L1 + 1.0 / c.L2;
              const sum = c.invMass1 / L1sqr + c.invMass2 * J2 * J2 + c.invMass3 / L2sqr;
              if (sum === 0.0) {
                  c.spring = 0.0;
                  c.damper = 0.0;
                  continue;
              }
              const mass = 1.0 / sum;
              c.spring = mass * bendOmega * bendOmega;
              c.damper = 2.0 * mass * this.m_tuning.bendDamping * bendOmega;
          }
          const stretchOmega = 2.0 * b2_pi * this.m_tuning.stretchHertz;
          for (let i = 0; i < this.m_stretchCount; ++i) {
              const c = this.m_stretchConstraints[i];
              const sum = c.invMass1 + c.invMass2;
              if (sum === 0.0) {
                  continue;
              }
              const mass = 1.0 / sum;
              c.spring = mass * stretchOmega * stretchOmega;
              c.damper = 2.0 * mass * this.m_tuning.stretchDamping * stretchOmega;
          }
      }
      Step(dt, iterations, position) {
          if (dt === 0.0) {
              return;
          }
          const inv_dt = 1.0 / dt;
          const d = Math.exp(-dt * this.m_tuning.damping);
          // Apply gravity and damping
          for (let i = 0; i < this.m_count; ++i) {
              if (this.m_invMasses[i] > 0.0) {
                  // this.m_vs[i] *= d;
                  this.m_vs[i].x *= d;
                  this.m_vs[i].y *= d;
                  // this.m_vs[i] += dt * this.m_gravity;
                  this.m_vs[i].x += dt * this.m_gravity.x;
                  this.m_vs[i].y += dt * this.m_gravity.y;
              }
              else {
                  // this.m_vs[i] = inv_dt * (this.m_bindPositions[i] + position - this.m_p0s[i]);
                  this.m_vs[i].x = inv_dt * (this.m_bindPositions[i].x + position.x - this.m_p0s[i].x);
                  this.m_vs[i].y = inv_dt * (this.m_bindPositions[i].y + position.y - this.m_p0s[i].y);
              }
          }
          // Apply bending spring
          if (this.m_tuning.bendingModel === exports.b2BendingModel.b2_springAngleBendingModel) {
              this.ApplyBendForces(dt);
          }
          for (let i = 0; i < this.m_bendCount; ++i) {
              this.m_bendConstraints[i].lambda = 0.0;
          }
          for (let i = 0; i < this.m_stretchCount; ++i) {
              this.m_stretchConstraints[i].lambda = 0.0;
          }
          // Update position
          for (let i = 0; i < this.m_count; ++i) {
              // this.m_ps[i] += dt * this.m_vs[i];
              this.m_ps[i].x += dt * this.m_vs[i].x;
              this.m_ps[i].y += dt * this.m_vs[i].y;
          }
          // Solve constraints
          for (let i = 0; i < iterations; ++i) {
              if (this.m_tuning.bendingModel === exports.b2BendingModel.b2_pbdAngleBendingModel) {
                  this.SolveBend_PBD_Angle();
              }
              else if (this.m_tuning.bendingModel === exports.b2BendingModel.b2_xpbdAngleBendingModel) {
                  this.SolveBend_XPBD_Angle(dt);
              }
              else if (this.m_tuning.bendingModel === exports.b2BendingModel.b2_pbdDistanceBendingModel) {
                  this.SolveBend_PBD_Distance();
              }
              else if (this.m_tuning.bendingModel === exports.b2BendingModel.b2_pbdHeightBendingModel) {
                  this.SolveBend_PBD_Height();
              }
              else if (this.m_tuning.bendingModel === exports.b2BendingModel.b2_pbdTriangleBendingModel) {
                  this.SolveBend_PBD_Triangle();
              }
              if (this.m_tuning.stretchingModel === exports.b2StretchingModel.b2_pbdStretchingModel) {
                  this.SolveStretch_PBD();
              }
              else if (this.m_tuning.stretchingModel === exports.b2StretchingModel.b2_xpbdStretchingModel) {
                  this.SolveStretch_XPBD(dt);
              }
          }
          // Constrain velocity
          for (let i = 0; i < this.m_count; ++i) {
              // this.m_vs[i] = inv_dt * (this.m_ps[i] - this.m_p0s[i]);
              this.m_vs[i].x = inv_dt * (this.m_ps[i].x - this.m_p0s[i].x);
              this.m_vs[i].y = inv_dt * (this.m_ps[i].y - this.m_p0s[i].y);
              this.m_p0s[i].Copy(this.m_ps[i]);
          }
      }
      Reset(position) {
          this.m_position.Copy(position);
          for (let i = 0; i < this.m_count; ++i) {
              // this.m_ps[i] = this.m_bindPositions[i] + this.m_position;
              this.m_ps[i].x = this.m_bindPositions[i].x + this.m_position.x;
              this.m_ps[i].y = this.m_bindPositions[i].y + this.m_position.y;
              // this.m_p0s[i] = this.m_bindPositions[i] + this.m_position;
              this.m_p0s[i].x = this.m_bindPositions[i].x + this.m_position.x;
              this.m_p0s[i].y = this.m_bindPositions[i].y + this.m_position.y;
              this.m_vs[i].SetZero();
          }
          for (let i = 0; i < this.m_bendCount; ++i) {
              this.m_bendConstraints[i].lambda = 0.0;
          }
          for (let i = 0; i < this.m_stretchCount; ++i) {
              this.m_stretchConstraints[i].lambda = 0.0;
          }
      }
      Draw(draw) {
          const c = new b2Color(0.4, 0.5, 0.7);
          const pg = new b2Color(0.1, 0.8, 0.1);
          const pd = new b2Color(0.7, 0.2, 0.4);
          for (let i = 0; i < this.m_count - 1; ++i) {
              draw.DrawSegment(this.m_ps[i], this.m_ps[i + 1], c);
              const pc = this.m_invMasses[i] > 0.0 ? pd : pg;
              draw.DrawPoint(this.m_ps[i], 5.0, pc);
          }
          const pc = this.m_invMasses[this.m_count - 1] > 0.0 ? pd : pg;
          draw.DrawPoint(this.m_ps[this.m_count - 1], 5.0, pc);
      }
      SolveStretch_PBD() {
          const stiffness = this.m_tuning.stretchStiffness;
          for (let i = 0; i < this.m_stretchCount; ++i) {
              const c = this.m_stretchConstraints[i];
              const p1 = this.m_ps[c.i1].Clone();
              const p2 = this.m_ps[c.i2].Clone();
              // b2Vec2 d = p2 - p1;
              const d = p2.Clone().SelfSub(p1);
              const L = d.Normalize();
              const sum = c.invMass1 + c.invMass2;
              if (sum === 0.0) {
                  continue;
              }
              const s1 = c.invMass1 / sum;
              const s2 = c.invMass2 / sum;
              // p1 -= stiffness * s1 * (c.L - L) * d;
              p1.x -= stiffness * s1 * (c.L - L) * d.x;
              p1.y -= stiffness * s1 * (c.L - L) * d.y;
              // p2 += stiffness * s2 * (c.L - L) * d;
              p2.x += stiffness * s2 * (c.L - L) * d.x;
              p2.y += stiffness * s2 * (c.L - L) * d.y;
              this.m_ps[c.i1].Copy(p1);
              this.m_ps[c.i2].Copy(p2);
          }
      }
      SolveStretch_XPBD(dt) {
          // 	b2Assert(dt > 0.0);
          for (let i = 0; i < this.m_stretchCount; ++i) {
              const c = this.m_stretchConstraints[i];
              const p1 = this.m_ps[c.i1].Clone();
              const p2 = this.m_ps[c.i2].Clone();
              const dp1 = p1.Clone().SelfSub(this.m_p0s[c.i1]);
              const dp2 = p2.Clone().SelfSub(this.m_p0s[c.i2]);
              // b2Vec2 u = p2 - p1;
              const u = p2.Clone().SelfSub(p1);
              const L = u.Normalize();
              // b2Vec2 J1 = -u;
              const J1 = u.Clone().SelfNeg();
              // b2Vec2 J2 = u;
              const J2 = u;
              const sum = c.invMass1 + c.invMass2;
              if (sum === 0.0) {
                  continue;
              }
              const alpha = 1.0 / (c.spring * dt * dt); // 1 / kg
              const beta = dt * dt * c.damper; // kg * s
              const sigma = alpha * beta / dt; // non-dimensional
              const C = L - c.L;
              // This is using the initial velocities
              const Cdot = b2Vec2.DotVV(J1, dp1) + b2Vec2.DotVV(J2, dp2);
              const B = C + alpha * c.lambda + sigma * Cdot;
              const sum2 = (1.0 + sigma) * sum + alpha;
              const impulse = -B / sum2;
              // p1 += (c.invMass1 * impulse) * J1;
              p1.x += (c.invMass1 * impulse) * J1.x;
              p1.y += (c.invMass1 * impulse) * J1.y;
              // p2 += (c.invMass2 * impulse) * J2;
              p2.x += (c.invMass2 * impulse) * J2.x;
              p2.y += (c.invMass2 * impulse) * J2.y;
              this.m_ps[c.i1].Copy(p1);
              this.m_ps[c.i2].Copy(p2);
              c.lambda += impulse;
          }
      }
      SolveBend_PBD_Angle() {
          const stiffness = this.m_tuning.bendStiffness;
          for (let i = 0; i < this.m_bendCount; ++i) {
              const c = this.m_bendConstraints[i];
              const p1 = this.m_ps[c.i1];
              const p2 = this.m_ps[c.i2];
              const p3 = this.m_ps[c.i3];
              // b2Vec2 d1 = p2 - p1;
              const d1 = p2.Clone().SelfSub(p1);
              // b2Vec2 d2 = p3 - p2;
              const d2 = p3.Clone().SelfSub(p2);
              const a = b2Vec2.CrossVV(d1, d2);
              const b = b2Vec2.DotVV(d1, d2);
              const angle = b2Atan2(a, b);
              let L1sqr = 0.0, L2sqr = 0.0;
              if (this.m_tuning.isometric) {
                  L1sqr = c.L1 * c.L1;
                  L2sqr = c.L2 * c.L2;
              }
              else {
                  L1sqr = d1.LengthSquared();
                  L2sqr = d2.LengthSquared();
              }
              if (L1sqr * L2sqr === 0.0) {
                  continue;
              }
              // b2Vec2 Jd1 = (-1.0 / L1sqr) * d1.Skew();
              const Jd1 = new b2Vec2().Copy(d1).SelfSkew().SelfMul(-1.0 / L1sqr);
              // b2Vec2 Jd2 = (1.0 / L2sqr) * d2.Skew();
              const Jd2 = new b2Vec2().Copy(d2).SelfSkew().SelfMul(1.0 / L2sqr);
              // b2Vec2 J1 = -Jd1;
              const J1 = Jd1.Clone().SelfNeg();
              // b2Vec2 J2 = Jd1 - Jd2;
              const J2 = Jd1.Clone().SelfSub(Jd2);
              // b2Vec2 J3 = Jd2;
              const J3 = Jd2;
              let sum = 0.0;
              if (this.m_tuning.fixedEffectiveMass) {
                  sum = c.invEffectiveMass;
              }
              else {
                  sum = c.invMass1 * b2Vec2.DotVV(J1, J1) + c.invMass2 * b2Vec2.DotVV(J2, J2) + c.invMass3 * b2Vec2.DotVV(J3, J3);
              }
              if (sum === 0.0) {
                  sum = c.invEffectiveMass;
              }
              const impulse = -stiffness * angle / sum;
              // p1 += (c.invMass1 * impulse) * J1;
              p1.x += (c.invMass1 * impulse) * J1.x;
              p1.y += (c.invMass1 * impulse) * J1.y;
              // p2 += (c.invMass2 * impulse) * J2;
              p2.x += (c.invMass2 * impulse) * J2.x;
              p2.y += (c.invMass2 * impulse) * J2.y;
              // p3 += (c.invMass3 * impulse) * J3;
              p3.x += (c.invMass3 * impulse) * J3.x;
              p3.y += (c.invMass3 * impulse) * J3.y;
              this.m_ps[c.i1].Copy(p1);
              this.m_ps[c.i2].Copy(p2);
              this.m_ps[c.i3].Copy(p3);
          }
      }
      SolveBend_XPBD_Angle(dt) {
          // b2Assert(dt > 0.0);
          for (let i = 0; i < this.m_bendCount; ++i) {
              const c = this.m_bendConstraints[i];
              const p1 = this.m_ps[c.i1];
              const p2 = this.m_ps[c.i2];
              const p3 = this.m_ps[c.i3];
              const dp1 = p1.Clone().SelfSub(this.m_p0s[c.i1]);
              const dp2 = p2.Clone().SelfSub(this.m_p0s[c.i2]);
              const dp3 = p3.Clone().SelfSub(this.m_p0s[c.i3]);
              // b2Vec2 d1 = p2 - p1;
              const d1 = p2.Clone().SelfSub(p1);
              // b2Vec2 d2 = p3 - p2;
              const d2 = p3.Clone().SelfSub(p2);
              let L1sqr, L2sqr;
              if (this.m_tuning.isometric) {
                  L1sqr = c.L1 * c.L1;
                  L2sqr = c.L2 * c.L2;
              }
              else {
                  L1sqr = d1.LengthSquared();
                  L2sqr = d2.LengthSquared();
              }
              if (L1sqr * L2sqr === 0.0) {
                  continue;
              }
              const a = b2Vec2.CrossVV(d1, d2);
              const b = b2Vec2.DotVV(d1, d2);
              const angle = b2Atan2(a, b);
              // b2Vec2 Jd1 = (-1.0 / L1sqr) * d1.Skew();
              // b2Vec2 Jd2 = (1.0 / L2sqr) * d2.Skew();
              // b2Vec2 J1 = -Jd1;
              // b2Vec2 J2 = Jd1 - Jd2;
              // b2Vec2 J3 = Jd2;
              // b2Vec2 Jd1 = (-1.0 / L1sqr) * d1.Skew();
              const Jd1 = new b2Vec2().Copy(d1).SelfSkew().SelfMul(-1.0 / L1sqr);
              // b2Vec2 Jd2 = (1.0 / L2sqr) * d2.Skew();
              const Jd2 = new b2Vec2().Copy(d2).SelfSkew().SelfMul(1.0 / L2sqr);
              // b2Vec2 J1 = -Jd1;
              const J1 = Jd1.Clone().SelfNeg();
              // b2Vec2 J2 = Jd1 - Jd2;
              const J2 = Jd1.Clone().SelfSub(Jd2);
              // b2Vec2 J3 = Jd2;
              const J3 = Jd2;
              let sum;
              if (this.m_tuning.fixedEffectiveMass) {
                  sum = c.invEffectiveMass;
              }
              else {
                  sum = c.invMass1 * b2Vec2.DotVV(J1, J1) + c.invMass2 * b2Vec2.DotVV(J2, J2) + c.invMass3 * b2Vec2.DotVV(J3, J3);
              }
              if (sum === 0.0) {
                  continue;
              }
              const alpha = 1.0 / (c.spring * dt * dt);
              const beta = dt * dt * c.damper;
              const sigma = alpha * beta / dt;
              const C = angle;
              // This is using the initial velocities
              const Cdot = b2Vec2.DotVV(J1, dp1) + b2Vec2.DotVV(J2, dp2) + b2Vec2.DotVV(J3, dp3);
              const B = C + alpha * c.lambda + sigma * Cdot;
              const sum2 = (1.0 + sigma) * sum + alpha;
              const impulse = -B / sum2;
              // p1 += (c.invMass1 * impulse) * J1;
              p1.x += (c.invMass1 * impulse) * J1.x;
              p1.y += (c.invMass1 * impulse) * J1.y;
              // p2 += (c.invMass2 * impulse) * J2;
              p2.x += (c.invMass2 * impulse) * J2.x;
              p2.y += (c.invMass2 * impulse) * J2.y;
              // p3 += (c.invMass3 * impulse) * J3;
              p3.x += (c.invMass3 * impulse) * J3.x;
              p3.y += (c.invMass3 * impulse) * J3.y;
              this.m_ps[c.i1].Copy(p1);
              this.m_ps[c.i2].Copy(p2);
              this.m_ps[c.i3].Copy(p3);
              c.lambda += impulse;
          }
      }
      SolveBend_PBD_Distance() {
          const stiffness = this.m_tuning.bendStiffness;
          for (let i = 0; i < this.m_bendCount; ++i) {
              const c = this.m_bendConstraints[i];
              const i1 = c.i1;
              const i2 = c.i3;
              const p1 = this.m_ps[i1].Clone();
              const p2 = this.m_ps[i2].Clone();
              // b2Vec2 d = p2 - p1;
              const d = p2.Clone().SelfSub(p1);
              const L = d.Normalize();
              const sum = c.invMass1 + c.invMass3;
              if (sum === 0.0) {
                  continue;
              }
              const s1 = c.invMass1 / sum;
              const s2 = c.invMass3 / sum;
              // p1 -= stiffness * s1 * (c.L1 + c.L2 - L) * d;
              p1.x -= stiffness * s1 * (c.L1 + c.L2 - L) * d.x;
              p1.y -= stiffness * s1 * (c.L1 + c.L2 - L) * d.y;
              // p2 += stiffness * s2 * (c.L1 + c.L2 - L) * d;
              p2.x += stiffness * s2 * (c.L1 + c.L2 - L) * d.x;
              p2.y += stiffness * s2 * (c.L1 + c.L2 - L) * d.y;
              this.m_ps[i1].Copy(p1);
              this.m_ps[i2].Copy(p2);
          }
      }
      SolveBend_PBD_Height() {
          const stiffness = this.m_tuning.bendStiffness;
          for (let i = 0; i < this.m_bendCount; ++i) {
              const c = this.m_bendConstraints[i];
              const p1 = this.m_ps[c.i1].Clone();
              const p2 = this.m_ps[c.i2].Clone();
              const p3 = this.m_ps[c.i3].Clone();
              // Barycentric coordinates are held constant
              const d = new b2Vec2();
              // b2Vec2 d = c.alpha1 * p1 + c.alpha2 * p3 - p2;
              d.x = c.alpha1 * p1.x + c.alpha2 * p3.x - p2.x;
              d.y = c.alpha1 * p1.y + c.alpha2 * p3.y - p2.y;
              const dLen = d.Length();
              if (dLen === 0.0) {
                  continue;
              }
              // b2Vec2 dHat = (1.0 / dLen) * d;
              const dHat = d.Clone().SelfMul(1.0 / dLen);
              // b2Vec2 J1 = c.alpha1 * dHat;
              const J1 = dHat.Clone().SelfMul(c.alpha1);
              // b2Vec2 J2 = -dHat;
              const J2 = dHat.Clone().SelfNeg();
              // b2Vec2 J3 = c.alpha2 * dHat;
              const J3 = dHat.Clone().SelfMul(c.alpha2);
              const sum = c.invMass1 * c.alpha1 * c.alpha1 + c.invMass2 + c.invMass3 * c.alpha2 * c.alpha2;
              if (sum === 0.0) {
                  continue;
              }
              const C = dLen;
              const mass = 1.0 / sum;
              const impulse = -stiffness * mass * C;
              // p1 += (c.invMass1 * impulse) * J1;
              p1.x += (c.invMass1 * impulse) * J1.x;
              p1.y += (c.invMass1 * impulse) * J1.y;
              // p2 += (c.invMass2 * impulse) * J2;
              p2.x += (c.invMass2 * impulse) * J2.x;
              p2.y += (c.invMass2 * impulse) * J2.y;
              // p3 += (c.invMass3 * impulse) * J3;
              p3.x += (c.invMass3 * impulse) * J3.x;
              p3.y += (c.invMass3 * impulse) * J3.y;
              this.m_ps[c.i1].Copy(p1);
              this.m_ps[c.i2].Copy(p2);
              this.m_ps[c.i3].Copy(p3);
          }
      }
      // M. Kelager: A Triangle Bending Constraint Model for PBD
      SolveBend_PBD_Triangle() {
          const stiffness = this.m_tuning.bendStiffness;
          for (let i = 0; i < this.m_bendCount; ++i) {
              const c = this.m_bendConstraints[i];
              const b0 = this.m_ps[c.i1].Clone();
              const v = this.m_ps[c.i2].Clone();
              const b1 = this.m_ps[c.i3].Clone();
              const wb0 = c.invMass1;
              const wv = c.invMass2;
              const wb1 = c.invMass3;
              const W = wb0 + wb1 + 2.0 * wv;
              const invW = stiffness / W;
              const d = new b2Vec2();
              d.x = v.x - (1.0 / 3.0) * (b0.x + v.x + b1.x);
              d.y = v.y - (1.0 / 3.0) * (b0.y + v.y + b1.y);
              const db0 = new b2Vec2();
              db0.x = 2.0 * wb0 * invW * d.x;
              db0.y = 2.0 * wb0 * invW * d.y;
              const dv = new b2Vec2();
              dv.x = -4.0 * wv * invW * d.x;
              dv.y = -4.0 * wv * invW * d.y;
              const db1 = new b2Vec2();
              db1.x = 2.0 * wb1 * invW * d.x;
              db1.y = 2.0 * wb1 * invW * d.y;
              b0.SelfAdd(db0);
              v.SelfAdd(dv);
              b1.SelfAdd(db1);
              this.m_ps[c.i1].Copy(b0);
              this.m_ps[c.i2].Copy(v);
              this.m_ps[c.i3].Copy(b1);
          }
      }
      ApplyBendForces(dt) {
          // omega = 2 * pi * hz
          const omega = 2.0 * b2_pi * this.m_tuning.bendHertz;
          for (let i = 0; i < this.m_bendCount; ++i) {
              const c = this.m_bendConstraints[i];
              const p1 = this.m_ps[c.i1].Clone();
              const p2 = this.m_ps[c.i2].Clone();
              const p3 = this.m_ps[c.i3].Clone();
              const v1 = this.m_vs[c.i1];
              const v2 = this.m_vs[c.i2];
              const v3 = this.m_vs[c.i3];
              // b2Vec2 d1 = p2 - p1;
              const d1 = p1.Clone().SelfSub(p1);
              // b2Vec2 d2 = p3 - p2;
              const d2 = p3.Clone().SelfSub(p2);
              let L1sqr, L2sqr;
              if (this.m_tuning.isometric) {
                  L1sqr = c.L1 * c.L1;
                  L2sqr = c.L2 * c.L2;
              }
              else {
                  L1sqr = d1.LengthSquared();
                  L2sqr = d2.LengthSquared();
              }
              if (L1sqr * L2sqr === 0.0) {
                  continue;
              }
              const a = b2Vec2.CrossVV(d1, d2);
              const b = b2Vec2.DotVV(d1, d2);
              const angle = b2Atan2(a, b);
              // b2Vec2 Jd1 = (-1.0 / L1sqr) * d1.Skew();
              // b2Vec2 Jd2 = (1.0 / L2sqr) * d2.Skew();
              // b2Vec2 J1 = -Jd1;
              // b2Vec2 J2 = Jd1 - Jd2;
              // b2Vec2 J3 = Jd2;
              // b2Vec2 Jd1 = (-1.0 / L1sqr) * d1.Skew();
              const Jd1 = new b2Vec2().Copy(d1).SelfSkew().SelfMul(-1.0 / L1sqr);
              // b2Vec2 Jd2 = (1.0 / L2sqr) * d2.Skew();
              const Jd2 = new b2Vec2().Copy(d2).SelfSkew().SelfMul(1.0 / L2sqr);
              // b2Vec2 J1 = -Jd1;
              const J1 = Jd1.Clone().SelfNeg();
              // b2Vec2 J2 = Jd1 - Jd2;
              const J2 = Jd1.Clone().SelfSub(Jd2);
              // b2Vec2 J3 = Jd2;
              const J3 = Jd2;
              let sum = 0.0;
              if (this.m_tuning.fixedEffectiveMass) {
                  sum = c.invEffectiveMass;
              }
              else {
                  sum = c.invMass1 * b2Vec2.DotVV(J1, J1) + c.invMass2 * b2Vec2.DotVV(J2, J2) + c.invMass3 * b2Vec2.DotVV(J3, J3);
              }
              if (sum === 0.0) {
                  continue;
              }
              const mass = 1.0 / sum;
              const spring = mass * omega * omega;
              const damper = 2.0 * mass * this.m_tuning.bendDamping * omega;
              const C = angle;
              const Cdot = b2Vec2.DotVV(J1, v1) + b2Vec2.DotVV(J2, v2) + b2Vec2.DotVV(J3, v3);
              const impulse = -dt * (spring * C + damper * Cdot);
              // this.m_vs[c.i1] += (c.invMass1 * impulse) * J1;
              this.m_vs[c.i1].x += (c.invMass1 * impulse) * J1.x;
              this.m_vs[c.i1].y += (c.invMass1 * impulse) * J1.y;
              // this.m_vs[c.i2] += (c.invMass2 * impulse) * J2;
              this.m_vs[c.i2].x += (c.invMass2 * impulse) * J2.x;
              this.m_vs[c.i2].y += (c.invMass2 * impulse) * J2.y;
              // this.m_vs[c.i3] += (c.invMass3 * impulse) * J3;
              this.m_vs[c.i3].x += (c.invMass3 * impulse) * J3.x;
              this.m_vs[c.i3].y += (c.invMass3 * impulse) * J3.y;
          }
      }
  }

  const staticBody = exports.b2BodyType.b2_staticBody;
  const kinematicBody = exports.b2BodyType.b2_kinematicBody;
  const dynamicBody = exports.b2BodyType.b2_dynamicBody;
  const springAngleBendingModel = exports.b2BendingModel.b2_springAngleBendingModel;
  const pbdAngleBendingModel = exports.b2BendingModel.b2_pbdAngleBendingModel;
  const xpbdAngleBendingModel = exports.b2BendingModel.b2_xpbdAngleBendingModel;
  const pbdDistanceBendingModel = exports.b2BendingModel.b2_pbdDistanceBendingModel;
  const pbdHeightBendingModel = exports.b2BendingModel.b2_pbdHeightBendingModel;
  const pbdTriangleBendingModel = exports.b2BendingModel.b2_pbdTriangleBendingModel;
  const pbdStretchingModel = exports.b2StretchingModel.b2_pbdStretchingModel;
  const xpbdStretchingModel = exports.b2StretchingModel.b2_xpbdStretchingModel;

  exports.b2AABB = b2AABB;
  exports.b2Abs = b2Abs;
  exports.b2Acos = b2Acos;
  exports.b2Alloc = b2Alloc;
  exports.b2AngularStiffness = b2AngularStiffness;
  exports.b2AreaJoint = b2AreaJoint;
  exports.b2AreaJointDef = b2AreaJointDef;
  exports.b2Asin = b2Asin;
  exports.b2Assert = b2Assert;
  exports.b2Atan2 = b2Atan2;
  exports.b2BlockAllocator = b2BlockAllocator;
  exports.b2Body = b2Body;
  exports.b2BodyDef = b2BodyDef;
  exports.b2BroadPhase = b2BroadPhase;
  exports.b2ChainAndCircleContact = b2ChainAndCircleContact;
  exports.b2ChainAndPolygonContact = b2ChainAndPolygonContact;
  exports.b2ChainShape = b2ChainShape;
  exports.b2CircleContact = b2CircleContact;
  exports.b2CircleShape = b2CircleShape;
  exports.b2Clamp = b2Clamp;
  exports.b2ClipSegmentToLine = b2ClipSegmentToLine;
  exports.b2ClipVertex = b2ClipVertex;
  exports.b2CollideCircles = b2CollideCircles;
  exports.b2CollideEdgeAndCircle = b2CollideEdgeAndCircle;
  exports.b2CollideEdgeAndPolygon = b2CollideEdgeAndPolygon;
  exports.b2CollidePolygonAndCircle = b2CollidePolygonAndCircle;
  exports.b2CollidePolygons = b2CollidePolygons;
  exports.b2Color = b2Color;
  exports.b2Contact = b2Contact;
  exports.b2ContactEdge = b2ContactEdge;
  exports.b2ContactFactory = b2ContactFactory;
  exports.b2ContactFeature = b2ContactFeature;
  exports.b2ContactFilter = b2ContactFilter;
  exports.b2ContactID = b2ContactID;
  exports.b2ContactImpulse = b2ContactImpulse;
  exports.b2ContactListener = b2ContactListener;
  exports.b2ContactManager = b2ContactManager;
  exports.b2ContactPositionConstraint = b2ContactPositionConstraint;
  exports.b2ContactRegister = b2ContactRegister;
  exports.b2ContactSolver = b2ContactSolver;
  exports.b2ContactSolverDef = b2ContactSolverDef;
  exports.b2ContactVelocityConstraint = b2ContactVelocityConstraint;
  exports.b2Cos = b2Cos;
  exports.b2Counter = b2Counter;
  exports.b2DegToRad = b2DegToRad;
  exports.b2DestructionListener = b2DestructionListener;
  exports.b2Distance = b2Distance;
  exports.b2DistanceInput = b2DistanceInput;
  exports.b2DistanceJoint = b2DistanceJoint;
  exports.b2DistanceJointDef = b2DistanceJointDef;
  exports.b2DistanceOutput = b2DistanceOutput;
  exports.b2DistanceProxy = b2DistanceProxy;
  exports.b2Draw = b2Draw;
  exports.b2DynamicTree = b2DynamicTree;
  exports.b2EdgeAndCircleContact = b2EdgeAndCircleContact;
  exports.b2EdgeAndPolygonContact = b2EdgeAndPolygonContact;
  exports.b2EdgeShape = b2EdgeShape;
  exports.b2Filter = b2Filter;
  exports.b2Fixture = b2Fixture;
  exports.b2FixtureDef = b2FixtureDef;
  exports.b2FixtureProxy = b2FixtureProxy;
  exports.b2Free = b2Free;
  exports.b2FrictionJoint = b2FrictionJoint;
  exports.b2FrictionJointDef = b2FrictionJointDef;
  exports.b2GearJoint = b2GearJoint;
  exports.b2GearJointDef = b2GearJointDef;
  exports.b2GetPointStates = b2GetPointStates;
  exports.b2GrowableStack = b2GrowableStack;
  exports.b2InvSqrt = b2InvSqrt;
  exports.b2IsPowerOfTwo = b2IsPowerOfTwo;
  exports.b2IsValid = b2IsValid;
  exports.b2Island = b2Island;
  exports.b2Jacobian = b2Jacobian;
  exports.b2Joint = b2Joint;
  exports.b2JointDef = b2JointDef;
  exports.b2JointEdge = b2JointEdge;
  exports.b2LinearStiffness = b2LinearStiffness;
  exports.b2Log = b2Log;
  exports.b2MakeArray = b2MakeArray;
  exports.b2MakeNullArray = b2MakeNullArray;
  exports.b2MakeNumberArray = b2MakeNumberArray;
  exports.b2Manifold = b2Manifold;
  exports.b2ManifoldPoint = b2ManifoldPoint;
  exports.b2MassData = b2MassData;
  exports.b2Mat22 = b2Mat22;
  exports.b2Mat33 = b2Mat33;
  exports.b2Max = b2Max;
  exports.b2Maybe = b2Maybe;
  exports.b2Min = b2Min;
  exports.b2MixFriction = b2MixFriction;
  exports.b2MixRestitution = b2MixRestitution;
  exports.b2MixRestitutionThreshold = b2MixRestitutionThreshold;
  exports.b2MotorJoint = b2MotorJoint;
  exports.b2MotorJointDef = b2MotorJointDef;
  exports.b2MouseJoint = b2MouseJoint;
  exports.b2MouseJointDef = b2MouseJointDef;
  exports.b2NextPowerOfTwo = b2NextPowerOfTwo;
  exports.b2Pair = b2Pair;
  exports.b2ParseInt = b2ParseInt;
  exports.b2ParseUInt = b2ParseUInt;
  exports.b2PolygonAndCircleContact = b2PolygonAndCircleContact;
  exports.b2PolygonContact = b2PolygonContact;
  exports.b2PolygonShape = b2PolygonShape;
  exports.b2Position = b2Position;
  exports.b2PositionSolverManifold = b2PositionSolverManifold;
  exports.b2Pow = b2Pow;
  exports.b2PrismaticJoint = b2PrismaticJoint;
  exports.b2PrismaticJointDef = b2PrismaticJointDef;
  exports.b2Profile = b2Profile;
  exports.b2PulleyJoint = b2PulleyJoint;
  exports.b2PulleyJointDef = b2PulleyJointDef;
  exports.b2QueryCallback = b2QueryCallback;
  exports.b2RadToDeg = b2RadToDeg;
  exports.b2Random = b2Random;
  exports.b2RandomRange = b2RandomRange;
  exports.b2RayCastCallback = b2RayCastCallback;
  exports.b2RayCastInput = b2RayCastInput;
  exports.b2RayCastOutput = b2RayCastOutput;
  exports.b2RevoluteJoint = b2RevoluteJoint;
  exports.b2RevoluteJointDef = b2RevoluteJointDef;
  exports.b2Rope = b2Rope;
  exports.b2RopeDef = b2RopeDef;
  exports.b2RopeTuning = b2RopeTuning;
  exports.b2Rot = b2Rot;
  exports.b2SeparationFunction = b2SeparationFunction;
  exports.b2Shape = b2Shape;
  exports.b2ShapeCast = b2ShapeCast;
  exports.b2ShapeCastInput = b2ShapeCastInput;
  exports.b2ShapeCastOutput = b2ShapeCastOutput;
  exports.b2Simplex = b2Simplex;
  exports.b2SimplexCache = b2SimplexCache;
  exports.b2SimplexVertex = b2SimplexVertex;
  exports.b2Sin = b2Sin;
  exports.b2SolverData = b2SolverData;
  exports.b2Sq = b2Sq;
  exports.b2Sqrt = b2Sqrt;
  exports.b2StackAllocator = b2StackAllocator;
  exports.b2Swap = b2Swap;
  exports.b2Sweep = b2Sweep;
  exports.b2TOIInput = b2TOIInput;
  exports.b2TOIOutput = b2TOIOutput;
  exports.b2TestOverlapAABB = b2TestOverlapAABB;
  exports.b2TestOverlapShape = b2TestOverlapShape;
  exports.b2TimeOfImpact = b2TimeOfImpact;
  exports.b2TimeStep = b2TimeStep;
  exports.b2Timer = b2Timer;
  exports.b2Transform = b2Transform;
  exports.b2TreeNode = b2TreeNode;
  exports.b2Vec2 = b2Vec2;
  exports.b2Vec2_zero = b2Vec2_zero;
  exports.b2Vec3 = b2Vec3;
  exports.b2Velocity = b2Velocity;
  exports.b2VelocityConstraintPoint = b2VelocityConstraintPoint;
  exports.b2Version = b2Version;
  exports.b2WeldJoint = b2WeldJoint;
  exports.b2WeldJointDef = b2WeldJointDef;
  exports.b2WheelJoint = b2WheelJoint;
  exports.b2WheelJointDef = b2WheelJointDef;
  exports.b2World = b2World;
  exports.b2WorldManifold = b2WorldManifold;
  exports.b2_180_over_pi = b2_180_over_pi;
  exports.b2_aabbExtension = b2_aabbExtension;
  exports.b2_aabbMultiplier = b2_aabbMultiplier;
  exports.b2_angularSleepTolerance = b2_angularSleepTolerance;
  exports.b2_angularSlop = b2_angularSlop;
  exports.b2_baumgarte = b2_baumgarte;
  exports.b2_branch = b2_branch;
  exports.b2_commit = b2_commit;
  exports.b2_epsilon = b2_epsilon;
  exports.b2_epsilon_sq = b2_epsilon_sq;
  exports.b2_gjk_reset = b2_gjk_reset;
  exports.b2_lengthUnitsPerMeter = b2_lengthUnitsPerMeter;
  exports.b2_linearSleepTolerance = b2_linearSleepTolerance;
  exports.b2_linearSlop = b2_linearSlop;
  exports.b2_maxAngularCorrection = b2_maxAngularCorrection;
  exports.b2_maxFloat = b2_maxFloat;
  exports.b2_maxLinearCorrection = b2_maxLinearCorrection;
  exports.b2_maxManifoldPoints = b2_maxManifoldPoints;
  exports.b2_maxPolygonVertices = b2_maxPolygonVertices;
  exports.b2_maxRotation = b2_maxRotation;
  exports.b2_maxRotationSquared = b2_maxRotationSquared;
  exports.b2_maxSubSteps = b2_maxSubSteps;
  exports.b2_maxTOIContacts = b2_maxTOIContacts;
  exports.b2_maxTranslation = b2_maxTranslation;
  exports.b2_maxTranslationSquared = b2_maxTranslationSquared;
  exports.b2_minPulleyLength = b2_minPulleyLength;
  exports.b2_pi = b2_pi;
  exports.b2_pi_over_180 = b2_pi_over_180;
  exports.b2_polygonRadius = b2_polygonRadius;
  exports.b2_timeToSleep = b2_timeToSleep;
  exports.b2_toiBaumgarte = b2_toiBaumgarte;
  exports.b2_toi_reset = b2_toi_reset;
  exports.b2_two_pi = b2_two_pi;
  exports.b2_version = b2_version;
  exports.dynamicBody = dynamicBody;
  exports.get_g_blockSolve = get_g_blockSolve;
  exports.kinematicBody = kinematicBody;
  exports.pbdAngleBendingModel = pbdAngleBendingModel;
  exports.pbdDistanceBendingModel = pbdDistanceBendingModel;
  exports.pbdHeightBendingModel = pbdHeightBendingModel;
  exports.pbdStretchingModel = pbdStretchingModel;
  exports.pbdTriangleBendingModel = pbdTriangleBendingModel;
  exports.set_g_blockSolve = set_g_blockSolve;
  exports.springAngleBendingModel = springAngleBendingModel;
  exports.staticBody = staticBody;
  exports.xpbdAngleBendingModel = xpbdAngleBendingModel;
  exports.xpbdStretchingModel = xpbdStretchingModel;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

}({}));

(function (exports, Laya) {
    'use strict';

    class IPhysics {
    }
    IPhysics.RigidBody = null;
    IPhysics.Physics = null;

    class ColliderBase extends Laya.Component {
        constructor() {
            super(...arguments);
            this._isSensor = false;
            this._density = 10;
            this._friction = 0.2;
            this._restitution = 0;
        }
        getDef() {
            if (!this._def) {
                var def = new window.box2d.b2FixtureDef();
                def.density = this.density;
                def.friction = this.friction;
                def.isSensor = this.isSensor;
                def.restitution = this.restitution;
                def.shape = this._shape;
                this._def = def;
            }
            return this._def;
        }
        _onEnable() {
            if (this.rigidBody) {
                this.refresh();
            }
            else {
                Laya.Laya.systemTimer.callLater(this, this._checkRigidBody);
            }
        }
        _checkRigidBody() {
            if (!this.rigidBody) {
                var comp = this.owner.getComponent(IPhysics.RigidBody);
                if (comp) {
                    this.rigidBody = comp;
                    this.refresh();
                }
            }
        }
        _onDestroy() {
            if (this.rigidBody) {
                if (this.fixture) {
                    if (this.fixture.GetBody() == this.rigidBody._getOriBody()) {
                        this.rigidBody.body.DestroyFixture(this.fixture);
                    }
                    this.fixture = null;
                }
                this.rigidBody = null;
                this._shape = null;
                this._def = null;
            }
        }
        get isSensor() {
            return this._isSensor;
        }
        set isSensor(value) {
            this._isSensor = value;
            if (this._def) {
                this._def.isSensor = value;
                this.refresh();
            }
        }
        get density() {
            return this._density;
        }
        set density(value) {
            this._density = value;
            if (this._def) {
                this._def.density = value;
                this.refresh();
            }
        }
        get friction() {
            return this._friction;
        }
        set friction(value) {
            this._friction = value;
            if (this._def) {
                this._def.friction = value;
                this.refresh();
            }
        }
        get restitution() {
            return this._restitution;
        }
        set restitution(value) {
            this._restitution = value;
            if (this._def) {
                this._def.restitution = value;
                this.refresh();
            }
        }
        refresh() {
            if (this.enabled && this.rigidBody) {
                var body = this.rigidBody.body;
                if (this.fixture) {
                    if (this.fixture.GetBody() == this.rigidBody.body) {
                        this.rigidBody.body.DestroyFixture(this.fixture);
                    }
                    this.fixture.Destroy();
                    this.fixture = null;
                }
                var def = this.getDef();
                def.filter.groupIndex = this.rigidBody.group;
                def.filter.categoryBits = this.rigidBody.category;
                def.filter.maskBits = this.rigidBody.mask;
                this.fixture = body.CreateFixture(def);
                this.fixture.collider = this;
            }
        }
        resetShape(re = true) {
        }
        get isSingleton() {
            return false;
        }
    }
    Laya.ClassUtils.regClass("laya.physics.ColliderBase", ColliderBase);
    Laya.ClassUtils.regClass("Laya.ColliderBase", ColliderBase);

    class RigidBody extends Laya.Component {
        constructor() {
            super(...arguments);
            this._type = "dynamic";
            this._allowSleep = true;
            this._angularVelocity = 0;
            this._angularDamping = 0;
            this._linearVelocity = { x: 0, y: 0 };
            this._linearDamping = 0;
            this._bullet = false;
            this._allowRotation = true;
            this._gravityScale = 1;
            this.group = 0;
            this.category = 1;
            this.mask = -1;
            this.label = "RigidBody";
        }
        _createBody() {
            if (this._body || !this.owner)
                return;
            var sp = this.owner;
            var box2d = window.box2d;
            var def = new box2d.b2BodyDef();
            var point = sp.localToGlobal(Laya.Point.TEMP.setTo(0, 0), false, IPhysics.Physics.I.worldRoot);
            def.position.Set(point.x / IPhysics.Physics.PIXEL_RATIO, point.y / IPhysics.Physics.PIXEL_RATIO);
            def.angle = Laya.Utils.toRadian(sp.rotation);
            def.allowSleep = this._allowSleep;
            def.angularDamping = this._angularDamping;
            def.angularVelocity = this._angularVelocity;
            def.bullet = this._bullet;
            def.fixedRotation = !this._allowRotation;
            def.gravityScale = this._gravityScale;
            def.linearDamping = this._linearDamping;
            var obj = this._linearVelocity;
            if (obj && obj.x != 0 || obj.y != 0) {
                def.linearVelocity = new box2d.b2Vec2(obj.x, obj.y);
            }
            def.type = box2d.b2BodyType["b2_" + this._type + "Body"];
            this._body = IPhysics.Physics.I._createBody(def);
            this.resetCollider(false);
        }
        _onAwake() {
            this._createBody();
        }
        _onEnable() {
            var _$this = this;
            this._createBody();
            Laya.Laya.physicsTimer.frameLoop(1, this, this._sysPhysicToNode);
            var sp = this.owner;
            if (this.accessGetSetFunc(sp, "x", "set") && !sp._changeByRigidBody) {
                sp._changeByRigidBody = true;
                function setX(value) {
                    _$this.accessGetSetFunc(sp, "x", "set")(value);
                    _$this._sysPosToPhysic();
                }
                this._overSet(sp, "x", setX);
                function setY(value) {
                    _$this.accessGetSetFunc(sp, "y", "set")(value);
                    _$this._sysPosToPhysic();
                }
                this._overSet(sp, "y", setY);
                function setRotation(value) {
                    _$this.accessGetSetFunc(sp, "rotation", "set")(value);
                    _$this._sysNodeToPhysic();
                }
                this._overSet(sp, "rotation", setRotation);
                function setScaleX(value) {
                    _$this.accessGetSetFunc(sp, "scaleX", "set")(value);
                    _$this.resetCollider(true);
                }
                this._overSet(sp, "scaleX", setScaleX);
                function setScaleY(value) {
                    _$this.accessGetSetFunc(sp, "scaleY", "set")(value);
                    _$this.resetCollider(true);
                }
                this._overSet(sp, "scaleY", setScaleY);
            }
        }
        accessGetSetFunc(obj, prop, accessor) {
            if (["get", "set"].indexOf(accessor) === -1) {
                return;
            }
            let privateProp = `_$${accessor}_${prop}`;
            if (obj[privateProp]) {
                return obj[privateProp];
            }
            let ObjConstructor = obj.constructor;
            let des;
            while (ObjConstructor) {
                des = Object.getOwnPropertyDescriptor(ObjConstructor.prototype, prop);
                if (des && des[accessor]) {
                    obj[privateProp] = des[accessor].bind(obj);
                    break;
                }
                ObjConstructor = Object.getPrototypeOf(ObjConstructor);
            }
            return obj[privateProp];
        }
        resetCollider(resetShape) {
            var comps = this.owner.getComponents(ColliderBase);
            if (comps) {
                for (var i = 0, n = comps.length; i < n; i++) {
                    var collider = comps[i];
                    collider.rigidBody = this;
                    if (resetShape)
                        collider.resetShape();
                    else
                        collider.refresh();
                }
            }
        }
        _sysPhysicToNode() {
            if (this.type != "static" && this._body.IsAwake()) {
                var pos = this._body.GetPosition();
                var ang = this._body.GetAngle();
                var sp = this.owner;
                this.accessGetSetFunc(sp, "rotation", "set")(Laya.Utils.toAngle(ang) - sp.parent.globalRotation);
                var point = sp.globalToLocal(Laya.Point.TEMP.setTo(pos.x * IPhysics.Physics.PIXEL_RATIO, pos.y * IPhysics.Physics.PIXEL_RATIO), false, IPhysics.Physics.I.worldRoot);
                point.x += sp.pivotX;
                point.y += sp.pivotY;
                point = sp.toParentPoint(point);
                this.accessGetSetFunc(sp, "x", "set")(point.x);
                this.accessGetSetFunc(sp, "y", "set")(point.y);
            }
        }
        _sysNodeToPhysic() {
            var sp = this.owner;
            this._body.SetAngle(Laya.Utils.toRadian(sp.rotation));
            var p = sp.localToGlobal(Laya.Point.TEMP.setTo(0, 0), false, IPhysics.Physics.I.worldRoot);
            this._body.SetPositionXY(p.x / IPhysics.Physics.PIXEL_RATIO, p.y / IPhysics.Physics.PIXEL_RATIO);
        }
        _sysPosToPhysic() {
            var sp = this.owner;
            var p = sp.localToGlobal(Laya.Point.TEMP.setTo(0, 0), false, IPhysics.Physics.I.worldRoot);
            this._body.SetPositionXY(p.x / IPhysics.Physics.PIXEL_RATIO, p.y / IPhysics.Physics.PIXEL_RATIO);
        }
        _overSet(sp, prop, getfun) {
            Object.defineProperty(sp, prop, { get: this.accessGetSetFunc(sp, prop, "get"), set: getfun, enumerable: false, configurable: true });
        }
        _onDisable() {
            Laya.Laya.physicsTimer.clear(this, this._sysPhysicToNode);
            this._body && IPhysics.Physics.I._removeBody(this._body);
            this._body = null;
            var owner = this.owner;
            if (owner._changeByRigidBody) {
                this._overSet(owner, "x", this.accessGetSetFunc(owner, "x", "set"));
                this._overSet(owner, "y", this.accessGetSetFunc(owner, "y", "set"));
                this._overSet(owner, "rotation", this.accessGetSetFunc(owner, "rotation", "set"));
                this._overSet(owner, "scaleX", this.accessGetSetFunc(owner, "scaleX", "set"));
                this._overSet(owner, "scaleY", this.accessGetSetFunc(owner, "scaleY", "set"));
                owner._changeByRigidBody = false;
            }
        }
        getBody() {
            if (!this._body)
                this._onAwake();
            return this._body;
        }
        _getOriBody() {
            return this._body;
        }
        get body() {
            if (!this._body)
                this._onAwake();
            return this._body;
        }
        applyForce(position, force) {
            if (!this._body)
                this._onAwake();
            this._body.ApplyForce(force, position);
        }
        applyForceToCenter(force) {
            if (!this._body)
                this._onAwake();
            this._body.ApplyForceToCenter(force);
        }
        applyLinearImpulse(position, impulse) {
            if (!this._body)
                this._onAwake();
            this._body.ApplyLinearImpulse(impulse, position);
        }
        applyLinearImpulseToCenter(impulse) {
            if (!this._body)
                this._onAwake();
            this._body.ApplyLinearImpulseToCenter(impulse);
        }
        applyTorque(torque) {
            if (!this._body)
                this._onAwake();
            this._body.ApplyTorque(torque);
        }
        setVelocity(velocity) {
            if (!this._body)
                this._onAwake();
            this._body.SetLinearVelocity(velocity);
        }
        setAngle(value) {
            if (!this._body)
                this._onAwake();
            this._body.SetAngle(value);
            this._body.SetAwake(true);
        }
        getMass() {
            return this._body ? this._body.GetMass() : 0;
        }
        getCenter() {
            if (!this._body)
                this._onAwake();
            var p = this._body.GetLocalCenter();
            p.x = p.x * IPhysics.Physics.PIXEL_RATIO;
            p.y = p.y * IPhysics.Physics.PIXEL_RATIO;
            return p;
        }
        getWorldCenter() {
            if (!this._body)
                this._onAwake();
            var p = this._body.GetWorldCenter();
            p.x = p.x * IPhysics.Physics.PIXEL_RATIO;
            p.y = p.y * IPhysics.Physics.PIXEL_RATIO;
            return p;
        }
        get type() {
            return this._type;
        }
        set type(value) {
            this._type = value;
            if (this._body)
                this._body.SetType(window.box2d.b2BodyType["b2_" + this._type + "Body"]);
        }
        get gravityScale() {
            return this._gravityScale;
        }
        set gravityScale(value) {
            this._gravityScale = value;
            if (this._body)
                this._body.SetGravityScale(value);
        }
        get allowRotation() {
            return this._allowRotation;
        }
        set allowRotation(value) {
            this._allowRotation = value;
            if (this._body)
                this._body.SetFixedRotation(!value);
        }
        get allowSleep() {
            return this._allowSleep;
        }
        set allowSleep(value) {
            this._allowSleep = value;
            if (this._body)
                this._body.SetSleepingAllowed(value);
        }
        get angularDamping() {
            return this._angularDamping;
        }
        set angularDamping(value) {
            this._angularDamping = value;
            if (this._body)
                this._body.SetAngularDamping(value);
        }
        get angularVelocity() {
            if (this._body)
                return this._body.GetAngularVelocity();
            return this._angularVelocity;
        }
        set angularVelocity(value) {
            this._angularVelocity = value;
            if (this._body)
                this._body.SetAngularVelocity(value);
        }
        get linearDamping() {
            return this._linearDamping;
        }
        set linearDamping(value) {
            this._linearDamping = value;
            if (this._body)
                this._body.SetLinearDamping(value);
        }
        get linearVelocity() {
            if (this._body) {
                var vec = this._body.GetLinearVelocity();
                return { x: vec.x, y: vec.y };
            }
            return this._linearVelocity;
        }
        set linearVelocity(value) {
            if (!value)
                return;
            if (value instanceof Array) {
                value = { x: value[0], y: value[1] };
            }
            this._linearVelocity = value;
            if (this._body)
                this._body.SetLinearVelocity(new window.box2d.b2Vec2(value.x, value.y));
        }
        get bullet() {
            return this._bullet;
        }
        set bullet(value) {
            this._bullet = value;
            if (this._body)
                this._body.SetBullet(value);
        }
    }
    Laya.ClassUtils.regClass("laya.physics.RigidBody", RigidBody);
    Laya.ClassUtils.regClass("Laya.RigidBody", RigidBody);

    class DestructionListener {
        SayGoodbyeJoint(params) {
            params.m_userData && (params.m_userData.isDestroy = true);
        }
        SayGoodbyeFixture(params) {
        }
        SayGoodbyeParticleGroup(params) {
        }
        SayGoodbyeParticle(params) {
        }
    }

    class Physics extends Laya.EventDispatcher {
        constructor() {
            super();
            this.box2d = window.box2d;
            this.velocityIterations = 8;
            this.positionIterations = 3;
            this._eventList = [];
        }
        static get I() {
            return Physics._I || (Physics._I = new Physics());
        }
        static enable(options = null) {
            Physics.I.start(options);
            IPhysics.RigidBody = RigidBody;
            IPhysics.Physics = this;
        }
        start(options = null) {
            if (!this._enabled) {
                this._enabled = true;
                options || (options = {});
                var box2d = window.box2d;
                if (box2d == null) {
                    console.error("Can not find box2d libs, you should request box2d.js first.");
                    return;
                }
                var gravity = new box2d.b2Vec2(0, options.gravity || 500 / Physics.PIXEL_RATIO);
                this.world = new box2d.b2World(gravity);
                this.world.SetDestructionListener(new DestructionListener());
                this.world.SetContactListener(new ContactListener());
                this.allowSleeping = options.allowSleeping == null ? true : options.allowSleeping;
                if (!options.customUpdate)
                    Laya.Laya.physicsTimer.frameLoop(1, this, this._update);
                this._emptyBody = this._createBody(new window.box2d.b2BodyDef());
            }
        }
        _update() {
            var delta = Laya.Laya.timer.delta / 1000;
            if (delta > .033) {
                delta = .033;
            }
            this.world.Step(delta, this.velocityIterations, this.positionIterations, 3);
            var len = this._eventList.length;
            if (len > 0) {
                for (var i = 0; i < len; i += 2) {
                    this._sendEvent(this._eventList[i], this._eventList[i + 1]);
                }
                this._eventList.length = 0;
            }
        }
        _sendEvent(type, contact) {
            var colliderA = contact.GetFixtureA().collider;
            var colliderB = contact.GetFixtureB().collider;
            var ownerA = colliderA.owner;
            var ownerB = colliderB.owner;
            contact.getHitInfo = function () {
                var manifold = new this.box2d.b2WorldManifold();
                this.GetWorldManifold(manifold);
                var p = manifold.points[0];
                p.x *= Physics.PIXEL_RATIO;
                p.y *= Physics.PIXEL_RATIO;
                return manifold;
            };
            if (ownerA) {
                var args = [colliderB, colliderA, contact];
                if (type === 0) {
                    ownerA.event(Laya.Event.TRIGGER_ENTER, args);
                    if (!ownerA["_triggered"]) {
                        ownerA["_triggered"] = true;
                    }
                    else {
                        ownerA.event(Laya.Event.TRIGGER_STAY, args);
                    }
                }
                else {
                    ownerA["_triggered"] = false;
                    ownerA.event(Laya.Event.TRIGGER_EXIT, args);
                }
            }
            if (ownerB) {
                args = [colliderA, colliderB, contact];
                if (type === 0) {
                    ownerB.event(Laya.Event.TRIGGER_ENTER, args);
                    if (!ownerB["_triggered"]) {
                        ownerB["_triggered"] = true;
                    }
                    else {
                        ownerB.event(Laya.Event.TRIGGER_STAY, args);
                    }
                }
                else {
                    ownerB["_triggered"] = false;
                    ownerB.event(Laya.Event.TRIGGER_EXIT, args);
                }
            }
        }
        _createBody(def) {
            if (this.world) {
                return this.world.CreateBody(def);
            }
            else {
                console.error('The physical engine should be initialized first.use "Physics.enable()"');
                return null;
            }
        }
        _removeBody(body) {
            if (this.world) {
                this.world.DestroyBody(body);
            }
            else {
                console.error('The physical engine should be initialized first.use "Physics.enable()"');
            }
        }
        _createJoint(def) {
            if (this.world) {
                let joint = this.world.CreateJoint(def);
                joint.m_userData = {};
                joint.m_userData.isDestroy = false;
                return joint;
            }
            else {
                console.error('The physical engine should be initialized first.use "Physics.enable()"');
                return null;
            }
        }
        _removeJoint(joint) {
            if (this.world) {
                this.world.DestroyJoint(joint);
            }
            else {
                console.error('The physical engine should be initialized first.use "Physics.enable()"');
            }
        }
        stop() {
            Laya.Laya.physicsTimer.clear(this, this._update);
        }
        get allowSleeping() {
            return this.world.GetAllowSleeping();
        }
        set allowSleeping(value) {
            this.world.SetAllowSleeping(value);
        }
        get gravity() {
            return this.world.GetGravity();
        }
        set gravity(value) {
            this.world.SetGravity(value);
        }
        getBodyCount() {
            return this.world.GetBodyCount();
        }
        getContactCount() {
            return this.world.GetContactCount();
        }
        getJointCount() {
            return this.world.GetJointCount();
        }
        get worldRoot() {
            return this._worldRoot || Laya.Laya.stage;
        }
        set worldRoot(value) {
            this._worldRoot = value;
            if (value) {
                var p = value.localToGlobal(Laya.Point.TEMP.setTo(0, 0));
                this.world.ShiftOrigin({ x: -p.x / Physics.PIXEL_RATIO, y: -p.y / Physics.PIXEL_RATIO });
            }
        }
        updatePhysicsByWorldRoot() {
            if (!!this.worldRoot) {
                var p = this.worldRoot.localToGlobal(Laya.Point.TEMP.setTo(0, 0));
                this.world.ShiftOrigin({ x: -p.x / Physics.PIXEL_RATIO, y: -p.y / Physics.PIXEL_RATIO });
            }
        }
    }
    Physics.PIXEL_RATIO = 50;
    Laya.ClassUtils.regClass("laya.physics.Physics", Physics);
    Laya.ClassUtils.regClass("Laya.Physics", Physics);
    class ContactListener {
        BeginContact(contact) {
            Physics.I._eventList.push(0, contact);
        }
        EndContact(contact) {
            Physics.I._eventList.push(1, contact);
        }
        PreSolve(contact, oldManifold) {
        }
        PostSolve(contact, impulse) {
        }
    }

    class BoxCollider extends ColliderBase {
        constructor() {
            super(...arguments);
            this._x = 0;
            this._y = 0;
            this._width = 100;
            this._height = 100;
        }
        getDef() {
            if (!this._shape) {
                this._shape = new window.box2d.b2PolygonShape();
                this._setShape(false);
            }
            this.label = (this.label || "BoxCollider");
            return super.getDef();
        }
        _setShape(re = true) {
            var scaleX = (this.owner["scaleX"] || 1);
            var scaleY = (this.owner["scaleY"] || 1);
            this._shape.SetAsBox(this._width / 2 / Physics.PIXEL_RATIO * scaleX, this._height / 2 / Physics.PIXEL_RATIO * scaleY, new window.box2d.b2Vec2((this._width / 2 + this._x) / Physics.PIXEL_RATIO * scaleX, (this._height / 2 + this._y) / Physics.PIXEL_RATIO * scaleY));
            if (re)
                this.refresh();
        }
        get x() {
            return this._x;
        }
        set x(value) {
            this._x = value;
            if (this._shape)
                this._setShape();
        }
        get y() {
            return this._y;
        }
        set y(value) {
            this._y = value;
            if (this._shape)
                this._setShape();
        }
        get width() {
            return this._width;
        }
        set width(value) {
            if (value <= 0)
                throw "BoxCollider size cannot be less than 0";
            this._width = value;
            if (this._shape)
                this._setShape();
        }
        get height() {
            return this._height;
        }
        set height(value) {
            if (value <= 0)
                throw "BoxCollider size cannot be less than 0";
            this._height = value;
            if (this._shape)
                this._setShape();
        }
        resetShape(re = true) {
            this._setShape();
        }
    }
    Laya.ClassUtils.regClass("laya.physics.BoxCollider", BoxCollider);
    Laya.ClassUtils.regClass("Laya.BoxCollider", BoxCollider);

    class ChainCollider extends ColliderBase {
        constructor() {
            super(...arguments);
            this._x = 0;
            this._y = 0;
            this._points = "0,0,100,0";
            this._loop = false;
        }
        getDef() {
            if (!this._shape) {
                this._shape = new window.box2d.b2ChainShape();
                this._setShape(false);
            }
            this.label = (this.label || "ChainCollider");
            return super.getDef();
        }
        _setShape(re = true) {
            var arr = this._points.split(",");
            var len = arr.length;
            if (len % 2 == 1)
                throw "ChainCollider points lenth must a multiplier of 2";
            var ps = [];
            for (var i = 0, n = len; i < n; i += 2) {
                ps.push(new window.box2d.b2Vec2((this._x + parseInt(arr[i])) / Physics.PIXEL_RATIO, (this._y + parseInt(arr[i + 1])) / Physics.PIXEL_RATIO));
            }
            this._loop ? this._shape.CreateLoop(ps, len / 2) : this._shape.CreateChain(ps, len / 2, new window.box2d.b2Vec2(0, 0), new window.box2d.b2Vec2(0, 0));
            if (re)
                this.refresh();
        }
        get x() {
            return this._x;
        }
        set x(value) {
            this._x = value;
            if (this._shape)
                this._setShape();
        }
        get y() {
            return this._y;
        }
        set y(value) {
            this._y = value;
            if (this._shape)
                this._setShape();
        }
        get points() {
            return this._points;
        }
        set points(value) {
            if (!value)
                throw "ChainCollider points cannot be empty";
            this._points = value;
            if (this._shape)
                this._setShape();
        }
        get loop() {
            return this._loop;
        }
        set loop(value) {
            this._loop = value;
            if (this._shape)
                this._setShape();
        }
    }
    Laya.ClassUtils.regClass("laya.physics.ChainCollider", ChainCollider);
    Laya.ClassUtils.regClass("Laya.ChainCollider", ChainCollider);

    class CircleCollider extends ColliderBase {
        constructor() {
            super(...arguments);
            this._x = 0;
            this._y = 0;
            this._radius = 50;
        }
        getDef() {
            if (!this._shape) {
                this._shape = new window.box2d.b2CircleShape();
                this._setShape(false);
            }
            this.label = (this.label || "CircleCollider");
            return super.getDef();
        }
        _setShape(re = true) {
            var scale = this.owner["scaleX"] || 1;
            this._shape.m_radius = this._radius / Physics.PIXEL_RATIO * scale;
            this._shape.m_p.Set((this._radius + this._x) / Physics.PIXEL_RATIO * scale, (this._radius + this._y) / Physics.PIXEL_RATIO * scale);
            if (re)
                this.refresh();
        }
        get x() {
            return this._x;
        }
        set x(value) {
            this._x = value;
            if (this._shape)
                this._setShape();
        }
        get y() {
            return this._y;
        }
        set y(value) {
            this._y = value;
            if (this._shape)
                this._setShape();
        }
        get radius() {
            return this._radius;
        }
        set radius(value) {
            if (value <= 0)
                throw "CircleCollider radius cannot be less than 0";
            this._radius = value;
            if (this._shape)
                this._setShape();
        }
        resetShape(re = true) {
            this._setShape();
        }
    }
    Laya.ClassUtils.regClass("laya.physics.CircleCollider", CircleCollider);
    Laya.ClassUtils.regClass("Laya.CircleCollider", CircleCollider);

    class EdgeCollider extends ColliderBase {
        constructor() {
            super(...arguments);
            this._x = 0;
            this._y = 0;
            this._points = "0,0,100,0";
        }
        getDef() {
            if (!this._shape) {
                this._shape = new window.box2d.b2EdgeShape();
                this._setShape(false);
            }
            this.label = (this.label || "EdgeCollider");
            return super.getDef();
        }
        _setShape(re = true) {
            var arr = this._points.split(",");
            var len = arr.length;
            if (len % 2 == 1)
                throw "EdgeCollider points lenth must a multiplier of 2";
            var ps = [];
            for (var i = 0, n = len; i < n; i += 2) {
                ps.push(new window.box2d.b2Vec2((this._x + parseInt(arr[i])) / Physics.PIXEL_RATIO, (this._y + parseInt(arr[i + 1])) / Physics.PIXEL_RATIO));
            }
            this._shape.SetTwoSided(ps[0], ps[1]);
            if (re)
                this.refresh();
        }
        get x() {
            return this._x;
        }
        set x(value) {
            this._x = value;
            if (this._shape)
                this._setShape();
        }
        get y() {
            return this._y;
        }
        set y(value) {
            this._y = value;
            if (this._shape)
                this._setShape();
        }
        get points() {
            return this._points;
        }
        set points(value) {
            if (!value)
                throw "EdgeCollider points cannot be empty";
            this._points = value;
            if (this._shape)
                this._setShape();
        }
    }
    Laya.ClassUtils.regClass("laya.physics.EdgeCollider", EdgeCollider);
    Laya.ClassUtils.regClass("Laya.EdgeCollider", EdgeCollider);

    class PhysicsDebugDraw extends Laya.Sprite {
        constructor() {
            super();
            this.m_drawFlags = 99;
            if (!PhysicsDebugDraw._inited) {
                PhysicsDebugDraw._inited = true;
                PhysicsDebugDraw.init();
            }
            this._camera = {};
            this._camera.m_center = new PhysicsDebugDraw.box2d.b2Vec2(0, 0);
            this._camera.m_extent = 25;
            this._camera.m_zoom = 1;
            this._camera.m_width = 1280;
            this._camera.m_height = 800;
            this._mG = new Laya.Graphics();
            this.graphics = this._mG;
            this._textSp = new Laya.Sprite();
            this._textG = this._textSp.graphics;
            this.addChild(this._textSp);
        }
        static init() {
            PhysicsDebugDraw.box2d = Laya.Browser.window.box2d;
            PhysicsDebugDraw.DrawString_s_color = new PhysicsDebugDraw.box2d.b2Color(0.9, 0.6, 0.6);
            PhysicsDebugDraw.DrawStringWorld_s_p = new PhysicsDebugDraw.box2d.b2Vec2();
            PhysicsDebugDraw.DrawStringWorld_s_cc = new PhysicsDebugDraw.box2d.b2Vec2();
            PhysicsDebugDraw.DrawStringWorld_s_color = new PhysicsDebugDraw.box2d.b2Color(0.5, 0.9, 0.5);
        }
        render(ctx, x, y) {
            this._renderToGraphic();
            super.render(ctx, x, y);
        }
        _renderToGraphic() {
            if (this.world) {
                this._textG.clear();
                this._mG.clear();
                this._mG.save();
                this._mG.scale(Physics.PIXEL_RATIO, Physics.PIXEL_RATIO);
                this.lineWidth = 1 / Physics.PIXEL_RATIO;
                if (this.world.DebugDraw)
                    this.world.DebugDraw();
                else
                    this.world.DrawDebugData();
                this._mG.restore();
            }
        }
        SetFlags(flags) {
            this.m_drawFlags = flags;
        }
        GetFlags() {
            return this.m_drawFlags;
        }
        AppendFlags(flags) {
            this.m_drawFlags |= flags;
        }
        ClearFlags(flags) {
            this.m_drawFlags &= ~flags;
        }
        PushTransform(xf) {
            this._mG.save();
            this._mG.translate(xf.p.x, xf.p.y);
            this._mG.rotate(xf.q.GetAngle());
        }
        PopTransform(xf) {
            this._mG.restore();
        }
        DrawPolygon(vertices, vertexCount, color) {
            var i, len;
            len = vertices.length;
            var points;
            points = [];
            for (i = 0; i < vertexCount; i++) {
                points.push(vertices[i].x, vertices[i].y);
            }
            this._mG.drawPoly(0, 0, points, null, color.MakeStyleString(1), this.lineWidth);
        }
        DrawSolidPolygon(vertices, vertexCount, color) {
            var i, len;
            len = vertices.length;
            var points;
            points = [];
            for (i = 0; i < vertexCount; i++) {
                points.push(vertices[i].x, vertices[i].y);
            }
            this._mG.drawPoly(0, 0, points, color.MakeStyleString(0.5), color.MakeStyleString(1), this.lineWidth);
        }
        DrawCircle(center, radius, color) {
            this._mG.drawCircle(center.x, center.y, radius, null, color.MakeStyleString(1), this.lineWidth);
        }
        DrawSolidCircle(center, radius, axis, color) {
            var cx = center.x;
            var cy = center.y;
            this._mG.drawCircle(cx, cy, radius, color.MakeStyleString(0.5), color.MakeStyleString(1), this.lineWidth);
            this._mG.drawLine(cx, cy, (cx + axis.x * radius), (cy + axis.y * radius), color.MakeStyleString(1), this.lineWidth);
        }
        DrawParticles(centers, radius, colors, count) {
            if (colors !== null) {
                for (var i = 0; i < count; ++i) {
                    var center = centers[i];
                    var color = colors[i];
                    this._mG.drawCircle(center.x, center.y, radius, color.MakeStyleString(), null, this.lineWidth);
                }
            }
            else {
                for (i = 0; i < count; ++i) {
                    center = centers[i];
                    this._mG.drawCircle(center.x, center.y, radius, "#ffff00", null, this.lineWidth);
                }
            }
        }
        DrawSegment(p1, p2, color) {
            this._mG.drawLine(p1.x, p1.y, p2.x, p2.y, color.MakeStyleString(1), this.lineWidth);
        }
        DrawTransform(xf) {
            this.PushTransform(xf);
            this._mG.drawLine(0, 0, 1, 0, PhysicsDebugDraw.box2d.b2Color.RED.MakeStyleString(1), this.lineWidth);
            this._mG.drawLine(0, 0, 0, 1, PhysicsDebugDraw.box2d.b2Color.GREEN.MakeStyleString(1), this.lineWidth);
            this.PopTransform(xf);
        }
        DrawPoint(p, size, color) {
            size *= this._camera.m_zoom;
            size /= this._camera.m_extent;
            var hsize = size / 2;
            this._mG.drawRect(p.x - hsize, p.y - hsize, size, size, color.MakeStyleString(), null);
        }
        DrawString(x, y, message) {
            this._textG.fillText(message, x, y, "15px DroidSans", PhysicsDebugDraw.DrawString_s_color.MakeStyleString(), "left");
        }
        DrawStringWorld(x, y, message) {
            this.DrawString(x, y, message);
        }
        DrawAABB(aabb, color) {
            var x = aabb.lowerBound.x;
            var y = aabb.lowerBound.y;
            var w = aabb.upperBound.x - aabb.lowerBound.x;
            var h = aabb.upperBound.y - aabb.lowerBound.y;
            this._mG.drawRect(x, y, w, h, null, color.MakeStyleString(), this.lineWidth);
        }
        static enable(flags = 99) {
            if (!PhysicsDebugDraw.I) {
                var debug = new PhysicsDebugDraw();
                debug.world = Physics.I.world;
                debug.world.SetDebugDraw(debug);
                debug.zOrder = 1000;
                debug.m_drawFlags = flags;
                Laya.Laya.stage.addChild(debug);
                PhysicsDebugDraw.I = debug;
            }
            return debug;
        }
    }
    PhysicsDebugDraw._inited = false;
    Laya.ClassUtils.regClass("laya.physics.PhysicsDebugDraw", PhysicsDebugDraw);
    Laya.ClassUtils.regClass("Laya.PhysicsDebugDraw", PhysicsDebugDraw);

    class PolygonCollider extends ColliderBase {
        constructor() {
            super(...arguments);
            this._x = 0;
            this._y = 0;
            this._points = "50,0,100,100,0,100";
        }
        getDef() {
            if (!this._shape) {
                this._shape = new window.box2d.b2PolygonShape();
                this._setShape(false);
            }
            this.label = (this.label || "PolygonCollider");
            return super.getDef();
        }
        _setShape(re = true) {
            var arr = this._points.split(",");
            var len = arr.length;
            if (len < 6)
                throw "PolygonCollider points must be greater than 3";
            if (len % 2 == 1)
                throw "PolygonCollider points lenth must a multiplier of 2";
            var ps = [];
            for (var i = 0, n = len; i < n; i += 2) {
                ps.push(new window.box2d.b2Vec2((this._x + parseInt(arr[i])) / Physics.PIXEL_RATIO, (this._y + parseInt(arr[i + 1])) / Physics.PIXEL_RATIO));
            }
            this._shape.Set(ps, len / 2);
            if (re)
                this.refresh();
        }
        get x() {
            return this._x;
        }
        set x(value) {
            this._x = value;
            if (this._shape)
                this._setShape();
        }
        get y() {
            return this._y;
        }
        set y(value) {
            this._y = value;
            if (this._shape)
                this._setShape();
        }
        get points() {
            return this._points;
        }
        set points(value) {
            if (!value)
                throw "PolygonCollider points cannot be empty";
            this._points = value;
            if (this._shape)
                this._setShape();
        }
    }
    Laya.ClassUtils.regClass("laya.physics.PolygonCollider", PolygonCollider);
    Laya.ClassUtils.regClass("Laya.PolygonCollider", PolygonCollider);

    class JointBase extends Laya.Component {
        get joint() {
            if (!this._joint)
                this._createJoint();
            return this._joint;
        }
        _onEnable() {
            this._createJoint();
        }
        _onAwake() {
            this._createJoint();
        }
        _createJoint() {
        }
        _onDisable() {
            if (this._joint && this._joint.m_userData && !this._joint.m_userData.isDestroy) {
                Physics.I._removeJoint(this._joint);
            }
            this._joint = null;
        }
        get isSingleton() {
            return false;
        }
    }
    Laya.ClassUtils.regClass("laya.physics.joint.JointBase", JointBase);
    Laya.ClassUtils.regClass("Laya.JointBase", JointBase);

    class DistanceJoint extends JointBase {
        constructor() {
            super(...arguments);
            this.selfAnchor = [0, 0];
            this.otherAnchor = [0, 0];
            this.collideConnected = false;
            this._length = 0;
            this._maxLength = -1;
            this._minLength = -1;
            this._frequency = 1;
            this._dampingRatio = 0;
        }
        _createJoint() {
            if (!this._joint) {
                this.selfBody = this.selfBody || this.owner.getComponent(RigidBody);
                if (!this.selfBody)
                    throw "selfBody can not be empty";
                var box2d = window.box2d;
                var def = DistanceJoint._temp || (DistanceJoint._temp = new box2d.b2DistanceJointDef());
                def.bodyA = this.otherBody ? this.otherBody.getBody() : Physics.I._emptyBody;
                def.bodyB = this.selfBody.getBody();
                def.localAnchorA.Set(this.otherAnchor[0] / Physics.PIXEL_RATIO, this.otherAnchor[1] / Physics.PIXEL_RATIO);
                def.localAnchorB.Set(this.selfAnchor[0] / Physics.PIXEL_RATIO, this.selfAnchor[1] / Physics.PIXEL_RATIO);
                box2d.b2LinearStiffness(def, this._frequency, this._dampingRatio, def.bodyA, def.bodyB);
                def.collideConnected = this.collideConnected;
                var p1 = def.bodyA.GetWorldPoint(def.localAnchorA, new box2d.b2Vec2());
                var p2 = def.bodyB.GetWorldPoint(def.localAnchorB, new box2d.b2Vec2());
                def.length = this._length / Physics.PIXEL_RATIO || box2d.b2Vec2.SubVV(p2, p1, new box2d.b2Vec2()).Length();
                def.maxLength = box2d.b2_maxFloat;
                def.minLength = 0;
                if (this._maxLength >= 0)
                    def.maxLength = this._maxLength / Physics.PIXEL_RATIO;
                if (this._minLength >= 0)
                    def.minLength = this._minLength / Physics.PIXEL_RATIO;
                this._joint = Physics.I._createJoint(def);
            }
        }
        get length() {
            return this._length;
        }
        set length(value) {
            this._length = value;
            if (this._joint)
                this._joint.SetLength(value / Physics.PIXEL_RATIO);
        }
        get minLength() {
            return this._minLength;
        }
        set minLength(value) {
            this._minLength = value;
            if (this._joint)
                this._joint.SetMinLength(value / Physics.PIXEL_RATIO);
        }
        get maxLength() {
            return this._maxLength;
        }
        set maxLength(value) {
            this._maxLength = value;
            if (this._joint)
                this._joint.SetMaxLength(value / Physics.PIXEL_RATIO);
        }
        get frequency() {
            return this._frequency;
        }
        set frequency(value) {
            this._frequency = value;
            if (this._joint) {
                let out = {};
                let box2d = window.box2d;
                let bodyA = this.otherBody ? this.otherBody.getBody() : Physics.I._emptyBody;
                let bodyB = this.selfBody.getBody();
                box2d.b2LinearStiffness(out, this._frequency, this._dampingRatio, bodyA, bodyB);
                this._joint.SetStiffness(out.stiffness);
                this._joint.SetDamping(out.damping);
            }
        }
        get damping() {
            return this._dampingRatio;
        }
        set damping(value) {
            this._dampingRatio = value;
            if (this._joint) {
                let out = {};
                let box2d = window.box2d;
                let bodyA = this.otherBody ? this.otherBody.getBody() : Physics.I._emptyBody;
                let bodyB = this.selfBody.getBody();
                box2d.b2LinearStiffness(out, this._frequency, this._dampingRatio, bodyA, bodyB);
                this._joint.SetDamping(out.damping);
            }
        }
    }
    Laya.ClassUtils.regClass("laya.physics.joint.DistanceJoint", DistanceJoint);
    Laya.ClassUtils.regClass("Laya.DistanceJoint", DistanceJoint);

    class GearJoint extends JointBase {
        constructor() {
            super(...arguments);
            this.collideConnected = false;
            this._ratio = 1;
        }
        _createJoint() {
            if (!this._joint) {
                if (!this.joint1)
                    throw "Joint1 can not be empty";
                if (!this.joint2)
                    throw "Joint2 can not be empty";
                var box2d = window.box2d;
                var def = GearJoint._temp || (GearJoint._temp = new box2d.b2GearJointDef());
                def.bodyA = this.joint1.owner.getComponent(RigidBody).getBody();
                def.bodyB = this.joint2.owner.getComponent(RigidBody).getBody();
                def.joint1 = this.joint1.joint;
                def.joint2 = this.joint2.joint;
                def.ratio = this._ratio;
                def.collideConnected = this.collideConnected;
                this._joint = Physics.I._createJoint(def);
            }
        }
        get ratio() {
            return this._ratio;
        }
        set ratio(value) {
            this._ratio = value;
            if (this._joint)
                this._joint.SetRatio(value);
        }
    }
    Laya.ClassUtils.regClass("laya.physics.joint.GearJoint", GearJoint);
    Laya.ClassUtils.regClass("Laya.GearJoint", GearJoint);

    class MotorJoint extends JointBase {
        constructor() {
            super(...arguments);
            this.collideConnected = false;
            this._linearOffset = [0, 0];
            this._angularOffset = 0;
            this._maxForce = 1000;
            this._maxTorque = 1000;
            this._correctionFactor = 0.3;
        }
        _createJoint() {
            if (!this._joint) {
                if (!this.otherBody)
                    throw "otherBody can not be empty";
                this.selfBody = this.selfBody || this.owner.getComponent(RigidBody);
                if (!this.selfBody)
                    throw "selfBody can not be empty";
                var box2d = window.box2d;
                var def = MotorJoint._temp || (MotorJoint._temp = new box2d.b2MotorJointDef());
                def.Initialize(this.otherBody.getBody(), this.selfBody.getBody());
                def.linearOffset = new box2d.b2Vec2(this._linearOffset[0] / Physics.PIXEL_RATIO, this._linearOffset[1] / Physics.PIXEL_RATIO);
                def.angularOffset = this._angularOffset;
                def.maxForce = this._maxForce;
                def.maxTorque = this._maxTorque;
                def.correctionFactor = this._correctionFactor;
                def.collideConnected = this.collideConnected;
                this._joint = Physics.I._createJoint(def);
            }
        }
        get linearOffset() {
            return this._linearOffset;
        }
        set linearOffset(value) {
            this._linearOffset = value;
            if (this._joint)
                this._joint.SetLinearOffset(new window.box2d.b2Vec2(value[0] / Physics.PIXEL_RATIO, value[1] / Physics.PIXEL_RATIO));
        }
        get angularOffset() {
            return this._angularOffset;
        }
        set angularOffset(value) {
            this._angularOffset = value;
            if (this._joint)
                this._joint.SetAngularOffset(value);
        }
        get maxForce() {
            return this._maxForce;
        }
        set maxForce(value) {
            this._maxForce = value;
            if (this._joint)
                this._joint.SetMaxForce(value);
        }
        get maxTorque() {
            return this._maxTorque;
        }
        set maxTorque(value) {
            this._maxTorque = value;
            if (this._joint)
                this._joint.SetMaxTorque(value);
        }
        get correctionFactor() {
            return this._correctionFactor;
        }
        set correctionFactor(value) {
            this._correctionFactor = value;
            if (this._joint)
                this._joint.SetCorrectionFactor(value);
        }
    }
    Laya.ClassUtils.regClass("laya.physics.joint.MotorJoint", MotorJoint);
    Laya.ClassUtils.regClass("Laya.MotorJoint", MotorJoint);

    class MouseJoint extends JointBase {
        constructor() {
            super(...arguments);
            this._maxForce = 10000;
            this._frequency = 5;
            this._dampingRatio = 0.7;
        }
        _onEnable() {
            this.owner.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        }
        _onAwake() {
        }
        onMouseDown() {
            this._createJoint();
            Laya.Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            Laya.Laya.stage.once(Laya.Event.MOUSE_UP, this, this.onStageMouseUp);
            Laya.Laya.stage.once(Laya.Event.MOUSE_OUT, this, this.onStageMouseUp);
        }
        _createJoint() {
            if (!this._joint) {
                this.selfBody = this.selfBody || this.owner.getComponent(RigidBody);
                if (!this.selfBody)
                    throw "selfBody can not be empty";
                var box2d = window.box2d;
                var def = MouseJoint._temp || (MouseJoint._temp = new box2d.b2MouseJointDef());
                if (this.anchor) {
                    var anchorPos = this.selfBody.owner.localToGlobal(Laya.Point.TEMP.setTo(this.anchor[0], this.anchor[1]), false, Physics.I.worldRoot);
                }
                else {
                    anchorPos = Physics.I.worldRoot.globalToLocal(Laya.Point.TEMP.setTo(Laya.Laya.stage.mouseX, Laya.Laya.stage.mouseY));
                }
                var anchorVec = new box2d.b2Vec2(anchorPos.x / Physics.PIXEL_RATIO, anchorPos.y / Physics.PIXEL_RATIO);
                def.bodyA = Physics.I._emptyBody;
                def.bodyB = this.selfBody.getBody();
                def.target = anchorVec;
                box2d.b2LinearStiffness(def, this._frequency, this._dampingRatio, def.bodyA, def.bodyB);
                def.maxForce = this._maxForce;
                this._joint = Physics.I._createJoint(def);
            }
        }
        onStageMouseUp() {
            Laya.Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            Laya.Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onStageMouseUp);
            Laya.Laya.stage.off(Laya.Event.MOUSE_OUT, this, this.onStageMouseUp);
            super._onDisable();
        }
        onMouseMove() {
            this._joint.SetTarget(new window.box2d.b2Vec2(Physics.I.worldRoot.mouseX / Physics.PIXEL_RATIO, Physics.I.worldRoot.mouseY / Physics.PIXEL_RATIO));
        }
        _onDisable() {
            this.owner.off(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
            super._onDisable();
        }
        get maxForce() {
            return this._maxForce;
        }
        set maxForce(value) {
            this._maxForce = value;
            if (this._joint)
                this._joint.SetMaxForce(value);
        }
        get frequency() {
            return this._frequency;
        }
        set frequency(value) {
            this._frequency = value;
            if (this._joint) {
                let out = {};
                let box2d = window.box2d;
                let bodyA = Physics.I._emptyBody;
                let bodyB = this.selfBody.getBody();
                box2d.b2LinearStiffness(out, this._frequency, this._dampingRatio, bodyA, bodyB);
                this._joint.SetStiffness(out.stiffness);
                this._joint.SetDamping(out.damping);
            }
        }
        get damping() {
            return this._dampingRatio;
        }
        set damping(value) {
            this._dampingRatio = value;
            if (this._joint) {
                let out = {};
                let box2d = window.box2d;
                let bodyA = Physics.I._emptyBody;
                let bodyB = this.selfBody.getBody();
                box2d.b2LinearStiffness(out, this._frequency, this._dampingRatio, bodyA, bodyB);
                this._joint.SetDamping(out.damping);
            }
        }
    }
    Laya.ClassUtils.regClass("laya.physics.joint.MouseJoint", MouseJoint);
    Laya.ClassUtils.regClass("Laya.MouseJoint", MouseJoint);

    class PrismaticJoint extends JointBase {
        constructor() {
            super(...arguments);
            this.anchor = [0, 0];
            this.axis = [1, 0];
            this.collideConnected = false;
            this._enableMotor = false;
            this._motorSpeed = 0;
            this._maxMotorForce = 10000;
            this._enableLimit = false;
            this._lowerTranslation = 0;
            this._upperTranslation = 0;
        }
        _createJoint() {
            if (!this._joint) {
                this.selfBody = this.selfBody || this.owner.getComponent(RigidBody);
                if (!this.selfBody)
                    throw "selfBody can not be empty";
                var box2d = window.box2d;
                var def = PrismaticJoint._temp || (PrismaticJoint._temp = new box2d.b2PrismaticJointDef());
                var anchorPos = this.selfBody.owner.localToGlobal(Laya.Point.TEMP.setTo(this.anchor[0], this.anchor[1]), false, Physics.I.worldRoot);
                var anchorVec = new box2d.b2Vec2(anchorPos.x / Physics.PIXEL_RATIO, anchorPos.y / Physics.PIXEL_RATIO);
                def.Initialize(this.otherBody ? this.otherBody.getBody() : Physics.I._emptyBody, this.selfBody.getBody(), anchorVec, new box2d.b2Vec2(this.axis[0], this.axis[1]));
                def.enableMotor = this._enableMotor;
                def.motorSpeed = this._motorSpeed;
                def.maxMotorForce = this._maxMotorForce;
                def.enableLimit = this._enableLimit;
                def.lowerTranslation = this._lowerTranslation / Physics.PIXEL_RATIO;
                def.upperTranslation = this._upperTranslation / Physics.PIXEL_RATIO;
                def.collideConnected = this.collideConnected;
                this._joint = Physics.I._createJoint(def);
            }
        }
        get enableMotor() {
            return this._enableMotor;
        }
        set enableMotor(value) {
            this._enableMotor = value;
            if (this._joint)
                this._joint.EnableMotor(value);
        }
        get motorSpeed() {
            return this._motorSpeed;
        }
        set motorSpeed(value) {
            this._motorSpeed = value;
            if (this._joint)
                this._joint.SetMotorSpeed(value);
        }
        get maxMotorForce() {
            return this._maxMotorForce;
        }
        set maxMotorForce(value) {
            this._maxMotorForce = value;
            if (this._joint)
                this._joint.SetMaxMotorForce(value);
        }
        get enableLimit() {
            return this._enableLimit;
        }
        set enableLimit(value) {
            this._enableLimit = value;
            if (this._joint)
                this._joint.EnableLimit(value);
        }
        get lowerTranslation() {
            return this._lowerTranslation;
        }
        set lowerTranslation(value) {
            this._lowerTranslation = value;
            if (this._joint)
                this._joint.SetLimits(value, this._upperTranslation);
        }
        get upperTranslation() {
            return this._upperTranslation;
        }
        set upperTranslation(value) {
            this._upperTranslation = value;
            if (this._joint)
                this._joint.SetLimits(this._lowerTranslation, value);
        }
    }
    Laya.ClassUtils.regClass("laya.physics.joint.PrismaticJoint", PrismaticJoint);
    Laya.ClassUtils.regClass("Laya.PrismaticJoint", PrismaticJoint);

    class PulleyJoint extends JointBase {
        constructor() {
            super(...arguments);
            this.selfAnchor = [0, 0];
            this.otherAnchor = [0, 0];
            this.selfGroundPoint = [0, 0];
            this.otherGroundPoint = [0, 0];
            this.ratio = 1.5;
            this.collideConnected = false;
        }
        _createJoint() {
            if (!this._joint) {
                if (!this.otherBody)
                    throw "otherBody can not be empty";
                this.selfBody = this.selfBody || this.owner.getComponent(RigidBody);
                if (!this.selfBody)
                    throw "selfBody can not be empty";
                var box2d = window.box2d;
                var def = PulleyJoint._temp || (PulleyJoint._temp = new box2d.b2PulleyJointDef());
                var posA = this.otherBody.owner.localToGlobal(Laya.Point.TEMP.setTo(this.otherAnchor[0], this.otherAnchor[1]), false, Physics.I.worldRoot);
                var anchorVecA = new box2d.b2Vec2(posA.x / Physics.PIXEL_RATIO, posA.y / Physics.PIXEL_RATIO);
                var posB = this.selfBody.owner.localToGlobal(Laya.Point.TEMP.setTo(this.selfAnchor[0], this.selfAnchor[1]), false, Physics.I.worldRoot);
                var anchorVecB = new box2d.b2Vec2(posB.x / Physics.PIXEL_RATIO, posB.y / Physics.PIXEL_RATIO);
                var groundA = this.otherBody.owner.localToGlobal(Laya.Point.TEMP.setTo(this.otherGroundPoint[0], this.otherGroundPoint[1]), false, Physics.I.worldRoot);
                var groundVecA = new box2d.b2Vec2(groundA.x / Physics.PIXEL_RATIO, groundA.y / Physics.PIXEL_RATIO);
                var groundB = this.selfBody.owner.localToGlobal(Laya.Point.TEMP.setTo(this.selfGroundPoint[0], this.selfGroundPoint[1]), false, Physics.I.worldRoot);
                var groundVecB = new box2d.b2Vec2(groundB.x / Physics.PIXEL_RATIO, groundB.y / Physics.PIXEL_RATIO);
                def.Initialize(this.otherBody.getBody(), this.selfBody.getBody(), groundVecA, groundVecB, anchorVecA, anchorVecB, this.ratio);
                def.collideConnected = this.collideConnected;
                this._joint = Physics.I._createJoint(def);
            }
        }
    }
    Laya.ClassUtils.regClass("laya.physics.joint.PulleyJoint", PulleyJoint);
    Laya.ClassUtils.regClass("Laya.PulleyJoint", PulleyJoint);

    class RevoluteJoint extends JointBase {
        constructor() {
            super(...arguments);
            this.anchor = [0, 0];
            this.collideConnected = false;
            this._enableMotor = false;
            this._motorSpeed = 0;
            this._maxMotorTorque = 10000;
            this._enableLimit = false;
            this._lowerAngle = 0;
            this._upperAngle = 0;
        }
        _createJoint() {
            if (!this._joint) {
                this.selfBody = this.selfBody || this.owner.getComponent(RigidBody);
                if (!this.selfBody)
                    throw "selfBody can not be empty";
                var box2d = window.box2d;
                var def = RevoluteJoint._temp || (RevoluteJoint._temp = new box2d.b2RevoluteJointDef());
                var anchorPos = this.selfBody.owner.localToGlobal(Laya.Point.TEMP.setTo(this.anchor[0], this.anchor[1]), false, Physics.I.worldRoot);
                var anchorVec = new box2d.b2Vec2(anchorPos.x / Physics.PIXEL_RATIO, anchorPos.y / Physics.PIXEL_RATIO);
                def.Initialize(this.otherBody ? this.otherBody.getBody() : Physics.I._emptyBody, this.selfBody.getBody(), anchorVec);
                def.enableMotor = this._enableMotor;
                def.motorSpeed = this._motorSpeed;
                def.maxMotorTorque = this._maxMotorTorque;
                def.enableLimit = this._enableLimit;
                def.lowerAngle = this._lowerAngle;
                def.upperAngle = this._upperAngle;
                def.collideConnected = this.collideConnected;
                this._joint = Physics.I._createJoint(def);
            }
        }
        get enableMotor() {
            return this._enableMotor;
        }
        set enableMotor(value) {
            this._enableMotor = value;
            if (this._joint)
                this._joint.EnableMotor(value);
        }
        get motorSpeed() {
            return this._motorSpeed;
        }
        set motorSpeed(value) {
            this._motorSpeed = value;
            if (this._joint)
                this._joint.SetMotorSpeed(value);
        }
        get maxMotorTorque() {
            return this._maxMotorTorque;
        }
        set maxMotorTorque(value) {
            this._maxMotorTorque = value;
            if (this._joint)
                this._joint.SetMaxMotorTorque(value);
        }
        get enableLimit() {
            return this._enableLimit;
        }
        set enableLimit(value) {
            this._enableLimit = value;
            if (this._joint)
                this._joint.EnableLimit(value);
        }
        get lowerAngle() {
            return this._lowerAngle;
        }
        set lowerAngle(value) {
            this._lowerAngle = value;
            if (this._joint)
                this._joint.SetLimits(value, this._upperAngle);
        }
        get upperAngle() {
            return this._upperAngle;
        }
        set upperAngle(value) {
            this._upperAngle = value;
            if (this._joint)
                this._joint.SetLimits(this._lowerAngle, value);
        }
    }
    Laya.ClassUtils.regClass("laya.physics.joint.RevoluteJoint", RevoluteJoint);
    Laya.ClassUtils.regClass("Laya.RevoluteJoint", RevoluteJoint);

    class WeldJoint extends JointBase {
        constructor() {
            super(...arguments);
            this.anchor = [0, 0];
            this.collideConnected = false;
            this._frequency = 5;
            this._dampingRatio = 0.7;
        }
        _createJoint() {
            if (!this._joint) {
                if (!this.otherBody)
                    throw "otherBody can not be empty";
                this.selfBody = this.selfBody || this.owner.getComponent(RigidBody);
                if (!this.selfBody)
                    throw "selfBody can not be empty";
                var box2d = window.box2d;
                var def = WeldJoint._temp || (WeldJoint._temp = new box2d.b2WeldJointDef());
                var anchorPos = this.selfBody.owner.localToGlobal(Laya.Point.TEMP.setTo(this.anchor[0], this.anchor[1]), false, Physics.I.worldRoot);
                var anchorVec = new box2d.b2Vec2(anchorPos.x / Physics.PIXEL_RATIO, anchorPos.y / Physics.PIXEL_RATIO);
                def.Initialize(this.otherBody.getBody(), this.selfBody.getBody(), anchorVec);
                box2d.b2AngularStiffness(def, this._frequency, this._dampingRatio, def.bodyA, def.bodyB);
                def.collideConnected = this.collideConnected;
                this._joint = Physics.I._createJoint(def);
            }
        }
        get frequency() {
            return this._frequency;
        }
        set frequency(value) {
            this._frequency = value;
            if (this._joint) {
                let out = {};
                let box2d = window.box2d;
                let bodyA = this.otherBody ? this.otherBody.getBody() : Physics.I._emptyBody;
                let bodyB = this.selfBody.getBody();
                box2d.b2AngularStiffness(out, this._frequency, this._dampingRatio, bodyA, bodyB);
                this._joint.SetStiffness(out.stiffness);
                this._joint.SetDamping(out.damping);
            }
        }
        get damping() {
            return this._dampingRatio;
        }
        set damping(value) {
            this._dampingRatio = value;
            if (this._joint) {
                let out = {};
                let box2d = window.box2d;
                let bodyA = this.otherBody ? this.otherBody.getBody() : Physics.I._emptyBody;
                let bodyB = this.selfBody.getBody();
                box2d.b2AngularStiffness(out, this._frequency, this._dampingRatio, bodyA, bodyB);
                this._joint.SetDamping(out.damping);
            }
        }
    }
    Laya.ClassUtils.regClass("laya.physics.joint.WeldJoint", WeldJoint);
    Laya.ClassUtils.regClass("Laya.WeldJoint", WeldJoint);

    class WheelJoint extends JointBase {
        constructor() {
            super(...arguments);
            this.anchor = [0, 0];
            this.collideConnected = false;
            this.axis = [1, 0];
            this._frequency = 5;
            this._dampingRatio = 0.7;
            this._enableMotor = false;
            this._motorSpeed = 0;
            this._maxMotorTorque = 10000;
            this._enableLimit = true;
            this._lowerTranslation = 0;
            this._upperTranslation = 0;
        }
        _createJoint() {
            if (!this._joint) {
                if (!this.otherBody)
                    throw "otherBody can not be empty";
                this.selfBody = this.selfBody || this.owner.getComponent(RigidBody);
                if (!this.selfBody)
                    throw "selfBody can not be empty";
                var box2d = window.box2d;
                var def = WheelJoint._temp || (WheelJoint._temp = new box2d.b2WheelJointDef());
                var anchorPos = this.selfBody.owner.localToGlobal(Laya.Point.TEMP.setTo(this.anchor[0], this.anchor[1]), false, Physics.I.worldRoot);
                var anchorVec = new box2d.b2Vec2(anchorPos.x / Physics.PIXEL_RATIO, anchorPos.y / Physics.PIXEL_RATIO);
                def.Initialize(this.otherBody.getBody(), this.selfBody.getBody(), anchorVec, new box2d.b2Vec2(this.axis[0], this.axis[1]));
                def.enableMotor = this._enableMotor;
                def.motorSpeed = this._motorSpeed;
                def.maxMotorTorque = this._maxMotorTorque;
                box2d.b2LinearStiffness(def, this._frequency, this._dampingRatio, def.bodyA, def.bodyB);
                def.collideConnected = this.collideConnected;
                def.enableLimit = this._enableLimit;
                def.lowerTranslation = this._lowerTranslation / Physics.PIXEL_RATIO;
                def.upperTranslation = this._upperTranslation / Physics.PIXEL_RATIO;
                this._joint = Physics.I._createJoint(def);
            }
        }
        get frequency() {
            return this._frequency;
        }
        set frequency(value) {
            this._frequency = value;
            if (this._joint) {
                let out = {};
                let box2d = window.box2d;
                let bodyA = this.otherBody ? this.otherBody.getBody() : Physics.I._emptyBody;
                let bodyB = this.selfBody.getBody();
                box2d.b2LinearStiffness(out, this._frequency, this._dampingRatio, bodyA, bodyB);
                this._joint.SetStiffness(out.stiffness);
                this._joint.SetDamping(out.damping);
            }
        }
        get damping() {
            return this._dampingRatio;
        }
        set damping(value) {
            this._dampingRatio = value;
            if (this._joint) {
                let out = {};
                let box2d = window.box2d;
                let bodyA = this.otherBody ? this.otherBody.getBody() : Physics.I._emptyBody;
                let bodyB = this.selfBody.getBody();
                box2d.b2LinearStiffness(out, this._frequency, this._dampingRatio, bodyA, bodyB);
                this._joint.SetDamping(out.damping);
            }
        }
        get enableMotor() {
            return this._enableMotor;
        }
        set enableMotor(value) {
            this._enableMotor = value;
            if (this._joint)
                this._joint.EnableMotor(value);
        }
        get motorSpeed() {
            return this._motorSpeed;
        }
        set motorSpeed(value) {
            this._motorSpeed = value;
            if (this._joint)
                this._joint.SetMotorSpeed(value);
        }
        get maxMotorTorque() {
            return this._maxMotorTorque;
        }
        set maxMotorTorque(value) {
            this._maxMotorTorque = value;
            if (this._joint)
                this._joint.SetMaxMotorTorque(value);
        }
        get enableLimit() {
            return this._enableLimit;
        }
        set enableLimit(value) {
            this._enableLimit = value;
            if (this._joint)
                this._joint.EnableLimit(value);
        }
        get lowerTranslation() {
            return this._lowerTranslation;
        }
        set lowerTranslation(value) {
            this._lowerTranslation = value;
            if (this._joint)
                this._joint.SetLimits(value, this._upperTranslation);
        }
        get upperTranslation() {
            return this._upperTranslation;
        }
        set upperTranslation(value) {
            this._upperTranslation = value;
            if (this._joint)
                this._joint.SetLimits(this._lowerTranslation, value);
        }
    }
    Laya.ClassUtils.regClass("laya.physics.joint.WheelJoint", WheelJoint);
    Laya.ClassUtils.regClass("Laya.WheelJoint", WheelJoint);

    exports.BoxCollider = BoxCollider;
    exports.ChainCollider = ChainCollider;
    exports.CircleCollider = CircleCollider;
    exports.ColliderBase = ColliderBase;
    exports.DestructionListener = DestructionListener;
    exports.DistanceJoint = DistanceJoint;
    exports.EdgeCollider = EdgeCollider;
    exports.GearJoint = GearJoint;
    exports.IPhysics = IPhysics;
    exports.JointBase = JointBase;
    exports.MotorJoint = MotorJoint;
    exports.MouseJoint = MouseJoint;
    exports.Physics = Physics;
    exports.PhysicsDebugDraw = PhysicsDebugDraw;
    exports.PolygonCollider = PolygonCollider;
    exports.PrismaticJoint = PrismaticJoint;
    exports.PulleyJoint = PulleyJoint;
    exports.RevoluteJoint = RevoluteJoint;
    exports.RigidBody = RigidBody;
    exports.WeldJoint = WeldJoint;
    exports.WheelJoint = WheelJoint;

}(window.Laya = window.Laya || {}, Laya));
