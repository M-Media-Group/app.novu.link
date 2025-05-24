interface Dimensional {
    x: number;
    y: number;
}

interface ConfettoType {
    randomModifier: number;
    color: { front: string; back: string };
    dimensions: Dimensional;
    position: Dimensional;
    rotation: number;
    scale: Dimensional;
    velocity: Dimensional;
    update: () => void;
}

export const confetti: ConfettoType[] = [];

const colors = [
    { front: "oklch(63.25% 0.28 24.75)", back: "oklch(56.91% 0.26 28.12)" }, // Purple
    { front: "oklch(53.23% 0.2 252.37)", back: "oklch(45.48% 0.17 252.22)" }, // Light Blue
    { front: "#fff", back: "#f3f3f3" }, // White
];

const confettiCount = 200;
const gravity = 0.2;
const drag = 0.075;
const terminalVelocity = 8;

const randomRange = (min: number, max: number): number =>
    Math.random() * (max - min) + min;

const initConfettoVelocity = (xRange: number[], yRange: number[]): Dimensional => {
    const x = randomRange(xRange[0], xRange[1]);
    const range = yRange[1] - yRange[0] + 1;
    let y = yRange[1] - Math.abs(randomRange(0, range) + randomRange(0, range) - range);
    if (y >= yRange[1] - 1) {
        y += Math.random() < 0.25 ? randomRange(1, 3) : 0;
    }
    return { x, y: -y };
};

class Confetto implements ConfettoType {
    randomModifier: number;
    color: { front: string; back: string };
    dimensions: Dimensional;
    position: Dimensional;
    rotation: number;
    scale: Dimensional;
    velocity: Dimensional;

    constructor(canvas: HTMLCanvasElement) {
        this.randomModifier = randomRange(0, 99);
        this.color = colors[Math.floor(randomRange(0, colors.length))];
        this.dimensions = { x: randomRange(5, 9), y: randomRange(8, 15) };
        this.rotation = randomRange(0, 2 * Math.PI);
        this.scale = { x: 1, y: 1 };
        this.velocity = initConfettoVelocity([-9, 9], [6, 11]);

        this.position = {
            x: randomRange(
                canvas.width / 2 - canvas.offsetWidth / 4,
                canvas.width / 2 + canvas.offsetWidth / 4
            ),
            y: randomRange(canvas.height, 0),
        };
    }

    update(): void {
        this.velocity.x -= this.velocity.x * drag;
        this.velocity.y = Math.min(this.velocity.y + gravity, terminalVelocity);
        this.velocity.x += Math.random() > 0.5 ? Math.random() : -Math.random();

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        this.scale.y = Math.cos((this.position.y + this.randomModifier) * 0.09);
    }
}

let animationFrameId = 0;

/**
 * Initializes the confetti burst effect on a given canvas element.
 *
 * @param canvas - The canvas element to render the confetti on. If not provided, it will not initialize.
 */
export const initBurst = (canvas?: HTMLCanvasElement): void => {
    if (!canvas) return;
    // If we don't have an animation frame, start one
    if (!animationFrameId) {
        renderConfetti(canvas);
    }
    for (let i = 0; i < confettiCount; i++) {
        confetti.push(new Confetto(canvas));
    }
};

const updateConfetti = (): void => {
    for (const confetto of confetti) {
        confetto.update();
    }
};

const drawConfetti = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const confetto of confetti) {
        const { x: posX, y: posY } = confetto.position;
        const { x: width, y: height } = confetto.dimensions;
        const scaledWidth = width * confetto.scale.x;
        const scaledHeight = height * confetto.scale.y;

        ctx.save();
        ctx.translate(posX, posY);
        ctx.rotate(confetto.rotation);
        ctx.fillStyle = confetto.scale.y > 0 ? confetto.color.front : confetto.color.back;
        ctx.fillRect(-scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
        ctx.restore();
    }
};

const cleanupOffscreenConfetti = (canvas: HTMLCanvasElement): void => {
    for (let i = confetti.length - 1; i >= 0; i--) {
        if (confetti[i].position.y >= canvas.height) {
            confetti.splice(i, 1);
        }
    }
};

/**
 * Renders the confetti animation on a given canvas element.
 *
 * This function will continuously update and draw the confetti until there are no more confetti pieces left.
 *
 * You should use `initBurst` to start the confetti effect instead.
 *
 * @param canvas
 */
export const renderConfetti = (canvas?: HTMLCanvasElement): void => {
    if (!canvas || !(canvas instanceof HTMLCanvasElement)) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    updateConfetti();
    drawConfetti(ctx, canvas);
    cleanupOffscreenConfetti(canvas);

    // If the length of confetti is less than 1, stop the animation
    if (confetti.length < 1 && animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = 0;
        return;
    }

    animationFrameId = requestAnimationFrame(() => renderConfetti(canvas));
};
