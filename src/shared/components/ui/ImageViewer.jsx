import React, { useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion, useMotionValue, animate } from "framer-motion";
import { FaTimes } from "react-icons/fa";

/**
 * ImageViewer
 *
 * Full-screen, WhatsApp/Instagram-style image preview with pinch-to-zoom,
 * pan, double-tap-to-zoom, mouse-wheel zoom and drag-down-to-dismiss.
 *
 * Built on framer-motion (already a project dependency) — no extra lightbox
 * library. Gestures use Pointer Events so touch + mouse share one code path;
 * `touch-action: none` on the surface suppresses the browser's native
 * pinch/scroll so ours takes over.
 *
 * Props:
 *  - isOpen  : controls visibility
 *  - onClose : called when the viewer should close
 *  - src     : fully-resolved image URL (use getImageUrl() to build it)
 *  - alt     : accessible image description
 */

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const DOUBLE_TAP_SCALE = 2.5;
const TAP_SLOP = 6; // px of movement still counts as a tap
const DOUBLE_TAP_MS = 280;
const DISMISS_DISTANCE = 110; // px drag-down before we close

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
const spring = { type: "spring", stiffness: 320, damping: 32 };

export default function ImageViewer({ isOpen, onClose, src, alt = "" }) {
    const scale = useMotionValue(1);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const containerRef = useRef(null);
    const imgRef = useRef(null);

    // Mutable gesture bookkeeping — kept in a ref so the handlers never need
    // to re-bind and we don't trigger re-renders on every pointer move.
    const g = useRef({
        pointers: new Map(),
        pinchStartDist: 1,
        pinchStartScale: 1,
        prevMid: { x: 0, y: 0 },
        pointerStart: { x: 0, y: 0 },
        panTransform: { x: 0, y: 0 },
        dismissing: false,
        moved: false,
        lastTap: 0,
    });

    // Max pan (in screen px) so the image can't be dragged fully off-view.
    const bounds = useCallback((nextScale) => {
        const container = containerRef.current;
        const img = imgRef.current;
        if (!container || !img) return { maxX: 0, maxY: 0 };
        const rect = container.getBoundingClientRect();
        const scaledW = img.clientWidth * nextScale;
        const scaledH = img.clientHeight * nextScale;
        return {
            maxX: Math.max(0, (scaledW - rect.width) / 2),
            maxY: Math.max(0, (scaledH - rect.height) / 2),
        };
    }, []);

    const reset = useCallback((animated = true) => {
        if (animated) {
            animate(scale, 1, spring);
            animate(x, 0, spring);
            animate(y, 0, spring);
        } else {
            scale.set(1);
            x.set(0);
            y.set(0);
        }
    }, [scale, x, y]);

    // Zoom toward a focal screen point, keeping the content under it anchored.
    const applyZoom = useCallback((target, focalX, focalY, animated) => {
        const container = containerRef.current;
        if (!container) return;
        const s0 = scale.get();
        const s1 = clamp(target, MIN_SCALE, MAX_SCALE);
        const rect = container.getBoundingClientRect();
        const fx = focalX - (rect.left + rect.width / 2);
        const fy = focalY - (rect.top + rect.height / 2);
        const ratio = s1 / s0;
        let nx = fx - (fx - x.get()) * ratio;
        let ny = fy - (fy - y.get()) * ratio;
        if (s1 <= 1.01) { nx = 0; ny = 0; }
        const { maxX, maxY } = bounds(s1);
        nx = clamp(nx, -maxX, maxX);
        ny = clamp(ny, -maxY, maxY);
        if (animated) {
            animate(scale, s1, spring);
            animate(x, nx, spring);
            animate(y, ny, spring);
        } else {
            scale.set(s1);
            x.set(nx);
            y.set(ny);
        }
    }, [scale, x, y, bounds]);

    const onPointerDown = (e) => {
        const state = g.current;
        state.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* unsupported */ }
        state.moved = false;

        if (state.pointers.size === 2) {
            const pts = [...state.pointers.values()];
            state.pinchStartDist = dist(pts[0], pts[1]) || 1;
            state.pinchStartScale = scale.get();
            state.prevMid = mid(pts[0], pts[1]);
        } else {
            state.pointerStart = { x: e.clientX, y: e.clientY };
            state.panTransform = { x: x.get(), y: y.get() };
            state.dismissing = scale.get() <= 1.01;
        }
    };

    const onPointerMove = (e) => {
        const state = g.current;
        if (!state.pointers.has(e.pointerId)) return;
        state.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        const pts = [...state.pointers.values()];

        if (pts.length >= 2) {
            const container = containerRef.current;
            if (!container) return;
            const d = dist(pts[0], pts[1]);
            const m = mid(pts[0], pts[1]);
            const s0 = scale.get();
            const s1 = clamp((state.pinchStartScale * d) / state.pinchStartDist, MIN_SCALE, MAX_SCALE);
            const ratio = s1 / s0;
            const rect = container.getBoundingClientRect();
            const fx = m.x - (rect.left + rect.width / 2);
            const fy = m.y - (rect.top + rect.height / 2);
            // Focal-point zoom + follow the moving pinch midpoint.
            const nx = fx - (fx - x.get()) * ratio + (m.x - state.prevMid.x);
            const ny = fy - (fy - y.get()) * ratio + (m.y - state.prevMid.y);
            const { maxX, maxY } = bounds(s1);
            scale.set(s1);
            x.set(clamp(nx, -maxX, maxX));
            y.set(clamp(ny, -maxY, maxY));
            state.prevMid = m;
            state.moved = true;
            return;
        }

        const dx = e.clientX - state.pointerStart.x;
        const dy = e.clientY - state.pointerStart.y;
        if (Math.hypot(dx, dy) > TAP_SLOP) state.moved = true;

        if (state.dismissing) {
            // Not zoomed: a downward drag dismisses; track the finger loosely.
            y.set(state.panTransform.y + dy);
            x.set(state.panTransform.x + dx * 0.5);
        } else {
            const { maxX, maxY } = bounds(scale.get());
            x.set(clamp(state.panTransform.x + dx, -maxX, maxX));
            y.set(clamp(state.panTransform.y + dy, -maxY, maxY));
        }
    };

    const onPointerUp = (e) => {
        const state = g.current;
        const wasDismissing = state.dismissing && state.pointers.size === 1;
        state.pointers.delete(e.pointerId);
        try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* not captured */ }

        // Double-tap toggles between fit and zoomed-in.
        if (!state.moved && state.pointers.size === 0) {
            const now = Date.now();
            if (now - state.lastTap < DOUBLE_TAP_MS) {
                state.lastTap = 0;
                applyZoom(scale.get() > 1.01 ? 1 : DOUBLE_TAP_SCALE, e.clientX, e.clientY, true);
                return;
            }
            state.lastTap = now;
        }

        if (state.pointers.size === 0) {
            if (wasDismissing) {
                if (Math.abs(y.get()) > DISMISS_DISTANCE) { onClose?.(); return; }
                reset(true);
            } else if (scale.get() <= 1.01) {
                reset(true);
            } else {
                // Settle pan back inside bounds.
                const { maxX, maxY } = bounds(scale.get());
                animate(x, clamp(x.get(), -maxX, maxX), spring);
                animate(y, clamp(y.get(), -maxY, maxY), spring);
            }
        } else if (state.pointers.size === 1) {
            // Pinch released to a single finger — re-seat the pan origin.
            const [pt] = [...state.pointers.values()];
            state.pointerStart = { x: pt.x, y: pt.y };
            state.panTransform = { x: x.get(), y: y.get() };
            state.dismissing = scale.get() <= 1.01;
        }
    };

    // Reset transform on open + lock body scroll + wire non-passive wheel-zoom.
    useEffect(() => {
        if (!isOpen) return;
        scale.set(1);
        x.set(0);
        y.set(0);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const el = containerRef.current;
        const onWheel = (ev) => {
            ev.preventDefault();
            applyZoom(scale.get() * Math.exp(-ev.deltaY * 0.0015), ev.clientX, ev.clientY, false);
        };
        el?.addEventListener("wheel", onWheel, { passive: false });
        return () => {
            document.body.style.overflow = prevOverflow;
            el?.removeEventListener("wheel", onWheel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // Close on Escape.
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 select-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    role="dialog"
                    aria-modal="true"
                    aria-label={alt || "Image preview"}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close image preview"
                        className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                    >
                        <FaTimes className="w-5 h-5" />
                    </button>

                    {/* Gesture surface — tapping empty space (not the image) closes. */}
                    <div
                        ref={containerRef}
                        className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-zoom-out"
                        style={{ touchAction: "none" }}
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        onPointerCancel={onPointerUp}
                        onClick={() => { if (!g.current.moved) onClose?.(); }}
                    >
                        <motion.div
                            initial={{ scale: 0.92, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.92, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 260, damping: 28 }}
                            className="flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <motion.img
                                ref={imgRef}
                                src={src}
                                alt={alt}
                                draggable={false}
                                style={{ scale, x, y }}
                                className="max-w-[95vw] max-h-[90dvh] object-contain will-change-transform cursor-grab active:cursor-grabbing"
                            />
                        </motion.div>
                    </div>

                    <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/50 text-xs pointer-events-none">
                        Pinch or double-tap to zoom
                    </p>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
