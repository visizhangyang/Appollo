import CordovaAppLoader from '../utils/cordova-app-loader';

const moduleName = 'unicorn.factory.autoupdate';

class AutoUpdateService {
  static get $inject() {
    return [
      '$window', '$q', '$log',
      '$ionicPlatform', '$ionicPopup',
      'SettingsService', 'FileStorageService',
    ];
  }
  constructor(
    $window, $q, $log,
    $ionicPlatform, $ionicPopup,
    SettingsService, FileStorageService
  ) {
    this.$window = $window;
    this.$q = $q;
    this.$log = $log;

    this.$ionicPlatform = $ionicPlatform;
    this.$ionicPopup = $ionicPopup;
    this.isCordova = ionic.Platform.isWebView();
    this.serverRoot = SettingsService.API_BASE_URL;
    this.fs = FileStorageService.fs;

    if (this.isCordova) {
      this.loader = this.createLoader();
    }
  }

  createLoader() {
    const window = this.$window;
    // Get serverRoot from script tag.
    const script = window.document.querySelector('script[server]');
    if (script) {
      this.serverRoot = script.getAttribute('server');
    }
    if (!this.serverRoot) {
      throw new Error('Add a "server" attribute to the bootstrap.js script!');
    }

    // Initialize loader
    return new CordovaAppLoader({
      fs: this.fs,
      localRoot: 'app',
      serverRoot: this.serverRoot,
      mode: 'mirror',
      cacheBuster: true,
    });
  }

  bindEvents() {
    if (!this.isCordova) {
      return;
    }
    // on launch
    this.checkToUpdate();
    // on resume
    this.$ionicPlatform.on('resume', () => {
      this.checkToUpdate();
    });
  }

  checkToUpdate() {
    this.loader.check()
      .then((hasNew) => {
        if (!hasNew) {
          return;
        }

        // Automatically update the app js source code
        // this.update();
        // showing an confirm popup to allow user download ...
        // TODO: have an mask of blocking user to do anything others
        // - like splash screen or something..
        this.$ionicPopup.confirm({
          template: '有新的更新, 点击确定更新',
          buttons: [
            // { text: '取消' },
            {
              text: '确定',
              type: 'button-positive',
              onTap: () => {
                this.update();
              },
            },
          ],
        });
      });
  }

  hideSplash() {
    const window = this.$window;
    if (this.isCordova && window.navigator.splashscreen) {
      window.navigator.splashscreen.hide();
    }
  }

  showSplash() {
    const window = this.$window;
    if (this.isCordova && window.navigator.splashscreen) {
      window.navigator.splashscreen.show();
    }
  }

  update() {
    this.showSplash();
    this.loader.download()
      .then(() => {
        this.loader.update()
          .then(() => {
            this.hideSplash();
          }, () => {
            this.hideSplash();
          });
      }, (err) => {
        this.hideSplash();
        this.$log.error('Auto-update error', err);
      });
  }
}

angular.module(moduleName, ['ionic'])
  .service('AutoUpdateService', AutoUpdateService)
  .run([
    '$window', '$ionicPlatform', 'AutoUpdateService',
    ($window, $ionicPlatform, AutoUpdateService) => {  // eslint-disable-line
      $window.BOOTSTRAP_OK = true; // eslint-disable-line

      $ionicPlatform.ready(() => {
        AutoUpdateService.bindEvents();
        AutoUpdateService.hideSplash();
      });
    },
  ]);

export default moduleName;
