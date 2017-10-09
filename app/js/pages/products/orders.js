class OrdersCtrl {
  static get $inject() {
    return [
      '$log', '$scope', '$stateParams',
      'ProductModel',
    ];
  }
  constructor(
    $log, $scope, $stateParams,
    ProductModel
  ) {
    this.$log = $log;
    this.$scope = $scope;
    this.ProductModel = ProductModel;

    this.productId = $stateParams.productId;
    this.setupHooks();
  }

  setupHooks() {
    this.$scope.$on('$ionicView.beforeEnter', () => {
      this.doRefresh();
    });
  }

  doRefresh() {
    this.ProductModel.fetchOrders(this.productId)
      .then((resp) => {
        this.renderBody(resp.data);
      });

    this.ProductModel.getDetail(this.productId)
      .then((resp) => {
        this.product = resp.data;
      });
  }

  renderBody(orders) {
    this.orders = orders;
  }
}

const state = {
  name: 'productOrders',
  options: {
    url: '/product/orders/:productId',
    controller: OrdersCtrl,
    controllerAs: 'vm',
    templateUrl: 'pages/products/orders.html',
  },
};

export default state;
