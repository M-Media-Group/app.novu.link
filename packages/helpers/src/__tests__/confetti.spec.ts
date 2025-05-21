import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { confetti, initBurst, renderConfetti } from '../confetti.js';

describe('confetti helpers', () => {
    let originalRequestAnimationFrame: typeof window.requestAnimationFrame;

    beforeEach(() => {
        // Mock requestAnimationFrame
        originalRequestAnimationFrame = window.requestAnimationFrame;
        window.requestAnimationFrame = vi.fn((cb) => {
            // Call the callback immediately for testing
            setTimeout(cb, 0);
            return 1;
        });
    });

    afterEach(() => {
        window.requestAnimationFrame = originalRequestAnimationFrame;
        vi.restoreAllMocks();
    });

    it('should initialize confetti burst with correct count', () => {

        confetti.length = 0; // clear confetti
        initBurst();

        expect(confetti.length).toBeGreaterThan(0);

        expect(confetti.length).toBeLessThanOrEqual(200);

    });

    it('should not throw if renderConfetti is called without canvas', () => {
        expect(() => renderConfetti()).not.toThrow();
    });

    it('should not throw if renderConfetti is called with non-canvas', () => {
        // @ts-expect-error purposely passing wrong type
        expect(() => renderConfetti({})).not.toThrow();
    });

    it('should render confetti on a canvas', async () => {
        // Setup a fake canvas
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 150;
        Object.defineProperty(canvas, 'offsetWidth', { value: 300 });
        Object.defineProperty(canvas, 'offsetHeight', { value: 150 });

        confetti.length = 0;
        initBurst();
        expect(() => renderConfetti(canvas)).not.toThrow();
    });
});