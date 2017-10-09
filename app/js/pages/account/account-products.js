class AccountProductsCtrl {
  static get $inject() {
    return [
      '$log', '$scope',
      'UserModel', 'ProductModel', 'RefresherFactory',
    ];
  }

  constructor(
    $log, $scope,
    UserModel, ProductModel, RefresherFactory
  ) {
    this.$log = $log;
    this.$scope = $scope;
    this.UserModel = UserModel;
    this.ProductModel = ProductModel;

    this.productList = [];
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
    return this.UserModel.fetchProducts()
      .then((resp) => {
        this.renderBody(resp.data);
        return resp;
      });
  }

  renderBody(productList) {
    this.$log.log('account-products: rendering body');

    this.productList = _.forEach(productList, (product) => {
      // eslint-disable-next-line no-param-reassign
      product.maxB = this.ProductModel.getMaxBenchmark(product);
    });
  }

  pullRefresh() {
    const cb = () => this.$scope.$broadcast('scroll.refreshComplete');
    this.refresher.call(cb.bind(this));
  }

  loadMore() {
    if (!this.productList.next) {
      return;
    }
    const nextMatch = this.productList.next.match(/page=(\d+)/);
    if (!nextMatch || !nextMatch[1]) {
      return;
    }
    const nextPage = nextMatch[1];
    const payload = _.assign(
      {},
      { page: nextPage }
    );

    this.UserModel.fetchProducts(payload)
      .then((resp) => {
        const newProductList = _.forEach(resp.data, (product) => {
          // eslint-disable-next-line no-param-reassign
          product.maxB = this.ProductModel.getMaxBenchmark(product);
        });
        this.productList = this.productList.concat(newProductList);
        this.productList.next = resp.data.next;
        this.$scope.$broadcast('scroll.infiniteScrollComplete');
      });
  }
}

const state = {
  name: 'accountProducts',
  options: {
    url: '/account/products',
    controller: AccountProductsCtrl,
    controllerAs: 'vm',
    templateUrl: 'pages/account/account-products.html',
  },
};

export default state;
