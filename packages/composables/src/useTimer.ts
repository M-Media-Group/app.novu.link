import { onMounted, ref } from "vue";

export const useTimer = (timerLength: number) => {
    const timer = ref(timerLength);

    const startTimer = () => {
        const interval = setInterval(() => {
            timer.value -= 1;
            if (timer.value <= 0) {
                clearInterval(interval);
            }
        }, 1000);
    };

    onMounted(() => {
        startTimer();
    });

    return {
        timer,
        startTimer,
    };
}