
export default class HomeCtrl {
  static get $inject() {
    return [
      '$log', '$scope', '$rootScope', '$timeout',
      'ProductModel', 'UserLoginService',
      'StateService', 'ArticlesModel', 'RefresherFactory',
    ];
  }
  constructor(
    $log, $scope, $rootScope, $timeout,
    ProductModel, UserLoginService,
    StateService, ArticlesModel, RefresherFactory
  ) {
    this.productModel = ProductModel;
    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.$timeout = $timeout;
    this.UserModel = UserLoginService.UserModel;
    this.UserLoginService = UserLoginService;
    this.StateService = StateService;
    this.ArticlesModel = ArticlesModel;

    this.refresher = new RefresherFactory(
      this.refreshFn.bind(this),
      $scope
    );

    this.initSliders();
    this.setupUser();
    this.setupHooks();
  }

  setupHooks() {
    this.$scope.$on('$ionicView.beforeEnter', () => {
      this.StateService.selectTab('tab.home');
      this.refresher.call();
    });
  }

  setupUser() {
    const self = this;
    this.user = {
      login($event) {
        $event.stopPropagation();
        self.UserLoginService.show(self.loginCb.bind(self));
      },
    };
  }

  loginCb() {
    this.refresher.call()
      .then(() => {
        this.user.logged = true;
      });
  }

  initSliders() {
    this.sliders = this.ArticlesModel.getBanners();
  }

  renderBody(productList) {
    this.productList = productList;
  }

  refreshFn() {
    this.user.logged = this.UserModel.isLogged();
    const promise = this.productModel.getList({ recommend: true });
    promise
      .then((resp) => {
        this.renderBody(resp.data);
      });
    return promise;
  }

  pullRefresh() {
    const cb = () => this.$scope.$broadcast('scroll.refreshComplete');
    this.refresher.call(cb.bind(this));
  }

  clickFeatureProducts(categoryName) {
    this.StateService.forward('tab.products')
      .then(() => {
        // In case the first time of entering, the controller not
        //   setup the hooks yet;
        this.$timeout(() => {
          this.$rootScope.$emit('filterCategory', categoryName);
        }, 0);
      });
  }
}
