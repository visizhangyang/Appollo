export default function TranslateFactory($translate) {

  return () => {
    return {
      translate:function(key) {
        return $translate.onReady().then(() => {
          if(key){
            return $translate.instant(key)
          }
          return key;
        })
      },

      get$translate: function () {
        return $translate;
      }
    };
  };

}

TranslateFactory.$inject = ['$translate'];
