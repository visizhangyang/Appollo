const moduleName = 'unicorn.factory.permission';

class PermissionService {
  static get $inject() {
    return [
      '$ionicPlatform', 'UserModel'
    ];
  }
  constructor($ionicPlatform, UserModel) {
    this.$ionicPlatform = $ionicPlatform;
    this.UserModel = UserModel;
    this.isCordova = ionic.Platform.isWebView();
  }

  bindEvents() {
    if (!this.isCordova) {
      return;
    }
    // on launch
    this.UserModel.initFeatures();
    // on resume
    this.$ionicPlatform.on('resume', () => {
      this.UserModel.initFeatures();
    });
  }

}

angular.module(moduleName, ['ionic'])
  .service('PermissionService', PermissionService)
  .run(['$ionicPlatform', 'PermissionService',
    ($ionicPlatform, PermissionService) => {
      $ionicPlatform.ready(() => {
        PermissionService.bindEvents();
      });
    }
  ]);

export default moduleName;


