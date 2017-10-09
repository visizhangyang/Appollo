const moduleName = 'unicorn.filter.translate';

export default moduleName;

angular.module(moduleName, [])
  .filter('translate', ['$translate', '$timeout', function($translate, $timeout) {
    doTranslate.$stateful = true;
    function doTranslate(key) {
        if(key){
            if ($translate.isReady()) {
              return $translate.instant(key);
            }
            else {
              $timeout(function() {}, 2000);
              return ''
            }
        }
    };

    return doTranslate;
}])

