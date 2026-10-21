# Directional shadow receiver culling

Run from the repository root after installing its existing development dependencies:

```sh
node tests/directional-shadow-culling/test.cjs
```

The runner uses the repository's `esbuild` dependency to transpile the actual `FrustumCulling`, `ShadowCullInfo`, `RenderCullUtil`, and `WebDirCascadeShadowRP` TypeScript modules in memory. It executes their production methods. Device allocation, unrelated rendering dependencies, and cascade-volume construction have minimal stubs; no culling method is copied, extracted, or replaced. It needs neither a browser nor a built engine.

Coverage includes upstream off-camera casters, downstream and lateral rejection, tangent contact verified with `Math.hypot`, large AABBs, non-unit and reversed light directions, safety margins, invalid-data fallback, known geometric intersections and an independent closest-point oracle. Hot-path checks count zero `Math.sqrt` calls per candidate and exactly one original min/max bounds read each. Queue tests retain shadow-caster, plane, distance, and material filtering while checking that camera and spotlight paths stay unchanged. The real cascade setup runs through `1 -> 2 -> 4 -> 1`, checks cache reset and batch-agent propagation, bias-sign symmetry, and conservative margin growth for wider PCF filters and larger world-space texels.

Optionally replay an externally supplied handoff snapshot without adding private scene data to this repository:

```sh
node tests/directional-shadow-culling/test.cjs --snapshot "path/to/grass-source-audit.json"
node tests/directional-shadow-culling/test.cjs --snapshot "path/to/grass-source-audit.json" --margin 0.2
```

The original 43-group snapshot with zero additional margin should reproduce `1,524,300 -> 1,290,900` submitted grass triangles. Nonzero margins print the resulting conservative candidate counts. These are saved-geometry counterfactuals, not rendered scene or image-correctness tests.

An optional CPU microbenchmark reports median and P95 cost per candidate for the real directional queue with and without receiver filtering. It covers entirely retained, sphere-overlap, entirely rejected, and partly rejected candidate sets with six broad culling planes:

```sh
node tests/directional-shadow-culling/test.cjs --benchmark
```

To compare three complete production versions, supply two directories containing their unchanged `FrustumCulling.ts` and `RenderCullUtil.ts` source files. Capture the original plane-only version from the desired Git revision, and save the previous implementation before replacing it:

```sh
node tests/directional-shadow-culling/test.cjs --benchmark --baseline-dir "path/to/original-sources" --previous-dir "path/to/previous-sources"
```

The runner transpiles each source pair and calls its real queue, sharing the same candidate data and dependency stubs. It first checks that receiver implementations retain identical candidate IDs, warms each version, then rotates and reverses execution order across 21 rounds of 250,000 candidates. It never reconstructs an older culling algorithm in the test. Without supplied source directories, the two-way comparison uses the current queue with receiver culling disabled/enabled; it is labeled accordingly. Run in an otherwise quiet process and repeat the command when assessing small timing differences.

This benchmark uses Node.js and synthetic bounds. It makes no GPU, browser, or frame-rate performance claim. Visual A/B testing, moving-camera and maximum-wind validation, and representative browser CPU/GPU measurements still require the full scene.
