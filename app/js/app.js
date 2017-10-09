require('./build/templates');
require('./build/preprocess');
require('angular-translate')
require("angular-translate-loader-static-files")
import componentModule from './component/component';
import modelModule from './model/model';
import pagesModule from './pages/pages';
import filterModule from './filter/filter';

import factoryModuleName from './factory/factory';

angular.module('unicorn', [
  'ionic',
  'unicorn.templates', 'unicorn.preprocess',
  'ngStorage', 'restangular','pascalprecht.translate',
  factoryModuleName,
  componentModule, pagesModule, modelModule, filterModule,
])

  .config([
    '$compileProvider', '$stateProvider', '$urlRouterProvider', '$ionicConfigProvider','$translateProvider',
    'isRelease',
    ($compileProvider, $stateProvider, $urlRouterProvider, $ionicConfigProvider,$translateProvider,
      isRelease) => {
      $compileProvider.debugInfoEnabled(!isRelease);

      // if none of the above states are matched, use this as the fallback
      $urlRouterProvider.otherwise('/landing');

      $ionicConfigProvider.backButton.text('');
      $ionicConfigProvider.backButton.previousTitleText(false);

      $ionicConfigProvider.spinner.icon('dots');
      $ionicConfigProvider.form.toggle('large');

      $ionicConfigProvider.platform.android
        .scrolling.jsScrolling(true);
      $ionicConfigProvider.platform.android
        .tabs.style('standard').position('bottom');
      $ionicConfigProvider.platform.android
        .navBar.alignTitle('center').positionPrimaryButtons('left');

      /* Translate */
      var lang = window.localStorage.lang||'en';
      // $translateProvider.useSanitizeValueStrategy('sanitize');
      $translateProvider.useSanitizeValueStrategy('escaped');
      $translateProvider.preferredLanguage(lang);
      console.log(lang)
      $translateProvider.useStaticFilesLoader({
          prefix: '/public/i18n/',
          suffix: '.json'
      });

    },
  ])
  .run(['UserModel', 'LoadingService', (UserModel, LoadingService) => {
    // FIXME: we might need call this inside config part...
    UserModel.checkLogged();
    UserModel.listenLogout();

    LoadingService.setupHook();
  }])
  /*
  .controller('LanguageSwitchingCtrl', ['$scope', '$translate', function (scope, $translate) {
    scope.switching = function(lang){
        $translate.use(lang);
        window.localStorage.lang = lang;
        window.location.reload();
    };
    scope.cur_lang = $translate.use();
  }]);*/

if (location.port !== '8100') {
  console.log = console.error = console.info = console.debug = console.warn = () => { }
}
