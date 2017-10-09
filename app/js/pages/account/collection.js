class AccountCollectionCtrl {
  static get $inject() {
    return [
      '$log', '$scope',
      'RefresherFactory',
      'UserModel',
    ];
  }

  constructor(
    $log, $scope,
    RefresherFactory,
    UserModel
  ) {
    this.$log = $log;
    this.$scope = $scope;

    this.UserModel = UserModel;

    UserModel.onSetupReady()
      .then(() => {
        this.user = {
          logged: this.UserModel.isLogged(),
        };
      });
    this.refresher = new RefresherFactory(
      this.refreshFn.bind(this),
      $scope
    );
    this.setHooks();
  }

  setHooks() {
    this.$scope.$on('$ionicView.beforeEnter', () => {
      this.refresher.call();
    });
  }

  refreshFn() {
    return this.UserModel.fetchCollection()
      .then((resp) => {
        this.renderBody(resp.data);
        return resp;
      });
  }

  renderBody(collectionList) {
    this.collectionList = collectionList;
  }
}


const state = {
  name: 'accountCollection',
  options: {
    url: '/account/collection',
    controller: AccountCollectionCtrl,
    controllerAs: 'vm',
    templateUrl: 'pages/account/collection.html',
  },
};

export default state;
