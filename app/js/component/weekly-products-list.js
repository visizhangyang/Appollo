class WeeklyProductsCtrl {
  static get $inject() {
    return [
      '$log', '$scope',
      'ProductModel', 'UserLoginService',
      'RefresherFactory',
    ];
  }

  constructor(
    $log, $scope,
    ProductModel, UserLoginService, RefresherFactory
  ) {
    this.$log = $log;
    this.$scope = $scope;
    this.UserModel = UserLoginService.UserModel;
    this.UserLoginService = UserLoginService;
    this.ProductModel = ProductModel;


    this.refresher = new RefresherFactory(
      this.refreshFn.bind(this),
      $scope
    );

    this.setupUser();
    this.refresher.call();
  }

  refreshFn() {
    this.user.logged = this.UserModel.isLogged();

    const hotSalePromise = this.ProductModel.getHotSale();
    hotSalePromise
      .then((resp) => {
        const hotsaleId = resp.data.id;
        this.hotSaleTitle = resp.data.title;
        this.hotSaleContent = resp.data.content;
        const promise = this.ProductModel.getList({ hotsale: hotsaleId });
        promise.then((listResp) => {
          this.renderBody(listResp.data);
        });
        return promise;
      });
    return hotSalePromise;
  }

  renderBody(productList) {
    this.productList = productList;
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
}

const weeklyProductListCmp = {
  templateUrl: 'component/weekly-products-list.html',
  controller: WeeklyProductsCtrl,
};

export default weeklyProductListCmp;
