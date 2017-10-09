export default function onRequest(
  $parse, $timeout, $ionicGesture, LoadingService
) {
  const eventType = 'click';
  return ($scope, $el, $attr) => {
    const fn = $parse($attr.onRequest);

    const listener = (event) => {
      const promiseCall = () => fn($scope, { $event: event });
      $timeout(() => {
        LoadingService.requesting(promiseCall);
      }, 0);
    };

    const gesture = $ionicGesture.on(eventType, listener, $el);

    $scope.$on('$destroy', () => {
      $ionicGesture.off(gesture, eventType, listener);
    });
  };
}

onRequest.$inject = [
  '$parse', '$timeout', '$ionicGesture', 'LoadingService',
];
