import { onMounted, ref } from "vue";

/*
* Composable for managing a countdown timer.
*
* @param timerLength - The initial length of the timer in seconds.
* @returns An object containing the timer value and a function to start the timer.
*/
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