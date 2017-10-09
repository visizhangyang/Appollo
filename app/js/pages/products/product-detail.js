class ProductDetailCtrl {
  static get $inject() {
    return [
      '$log', '$scope', '$stateParams',
      'StateService', 'ProductModel', 'UserLoginService',
      'RefresherFactory', 'LoadingService', 'TranslateFactory'
    ];
  }
  constructor(
    $log, $scope, $stateParams,
    StateService, ProductModel, UserLoginService,
    RefresherFactory, LoadingService, TranslateFactory
  ) {
    this.$log = $log;
    this.$scope = $scope;
    this.ProductModel = ProductModel;
    this.UserModel = UserLoginService.UserModel;
    this.UserLoginService = UserLoginService;
    this.StateService = StateService;
    this.LoadingService = LoadingService;

    var translateFactory = new TranslateFactory();
    this.$tanslate = translateFactory.get$translate();

    this.productId = $stateParams.productId;
    this.refresher = new RefresherFactory(
      this.refreshFn.bind(this),
      $scope
    );

    this.setupHooks();
    this.setupUser();
  }

  setupHooks() {
    this.$scope.$on('$ionicView.beforeEnter', () => {
      this.refresher.call();
    });
  }

  refreshFn() {
    this.user.logged = this.UserModel.isLogged();
    const promise = this.ProductModel.getDetail(this.productId);
    promise.then((resp) => {
      this.renderBody(resp.data);
    });
    return promise;
  }

  renderBody(product) {
    this.product = product;
    this.productInfoTemplate = product.product_type === 'PRIVATE_FUND_FLOAT' ?
                               'pages/products/_private-float-info.html' :
                               'pages/products/_basic-info.html';
    this.couldOrder = this.ProductModel.couldOrder(product);
    this.title = product.product_name;
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

  onClickCollect() {
    if (this.user.logged) {
      const isCollected = this.product.collection_id > 0;
      const toastMsg = this.$tanslate.instant(isCollected ? 'product_detail_unfollowing' : 'product_detail_following');
      this.LoadingService.requesting(this.collectProduct.bind(this))
        .finally(() => {
          this.LoadingService.showFailedLoading(toastMsg);
        });
    } else {
      // option:
      // - make the hook that call refresher also to collect
      //   product immediately
      this.UserLoginService.show(() => {
        this.refresher.call();
      });
    }
  }

  collectProduct() {
    let promise = null;
    const isCollected = this.product.collection_id > 0;
    if (isCollected) {
      promise = this.UserModel.deleteCollect(this.product.collection_id);
    } else {
      promise = this.UserModel.postCollect({
        product: this.product.id,
      });
    }
    promise.then(() => {
      this.refresher.call();
    });
    return promise;
  }
}

const state = {
  name: 'productDetail',
  options: {
    url: '/product/detail/:productId',
    controller: ProductDetailCtrl,
    controllerAs: 'vm',
    templateUrl: 'pages/products/product-detail.html',
  },
};

export default state;
