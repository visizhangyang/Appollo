export default function codeCounterFactory(
  $interval
) {
  return () => {
    const data = {
      timer: 60,
      couldRequest: true,
      requested: false,
    };
    let interval = null;

    const clearInterval = () => {
      if (interval) {
        $interval.cancel(interval);
      }
    };

    const resetCount = () => {
      clearInterval();
      data.timer = 60;
      data.couldRequest = true;
    };

    const setCount = () => {
      clearInterval();
      data.timer = 60;
      data.couldRequest = false;
      interval = $interval(() => {
        data.timer -= 1;
        if (data.timer <= 0) {
          resetCount();
        }
      }, 1000);
    };

    return {
      data,
      setCount,
      resetCount,
    };
  };
}

codeCounterFactory.$inject = ['$interval'];
