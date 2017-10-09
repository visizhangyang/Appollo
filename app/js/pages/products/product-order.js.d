class ProductOrderCtrl {
  static get $inject() {
    return [
      '$log', '$stateParams', '$scope',
      'ProductModel', 'StateService', 'OrderModel', 'isRelease',
      'RefresherFactory', 'FormFactory',
    ];
  }
  constructor(
    $log, $stateParams, $scope,
    ProductModel, StateService, OrderModel, isRelease,
    RefresherFactory, FormFactory
  ) {
    $log.log('ProductOrder: enter');
    this.$scope = $scope;
    this.StateService = StateService;
    this.OrderModel = OrderModel;
    this.ProductModel = ProductModel;
    this.productId = $stateParams.productId;

    this.product = null;
    this.benchmark = null;

    this.minAmount = 0;
    this.maxAmount = null;

    let order;
    if (isRelease) {
      order = {
        product: this.productId,
      };
    } else {
      order = {
        amount: 10,
        note: 'simple note',
        product: this.productId,
      };
    }
    this.formUtil = new FormFactory(order);
    this.ProductModel.orderForm = this.formUtil;
    this.order = this.formUtil.data;

    this.refresher = new RefresherFactory(
      this.refreshFn.bind(this),
      $scope
    );

    this.setupHooks();
    this.goBack = StateService.backFactory('tab.crm');
  }

  onBack() {
    this.formUtil.resetForm();
    this.goBack();
  }

  setupHooks() {
    this.$scope.$on('$ionicView.beforeEnter', () => {
      this.refresher.call();
    });
  }

  refreshFn() {
    return this.ProductModel.getDetail(this.productId)
      .then((resp) => {
        this.renderBody(resp.data);
      });
  }

  renderBody(product) {
    this.product = product;
    this.productType = this.ProductModel.getProductType(product);
    this.benchmark = this.ProductModel.getMaxBenchmark(product);

    const maxAmountBenchmark = this.ProductModel.getMaxAmountBenchmark(product);
    this.maxAmount = maxAmountBenchmark && maxAmountBenchmark.investment_amount_max;
    this.minAmount = product.initial_deposit;
    if (this.maxAmount) {
      this.amountRangeText = `${this.minAmount}万 ~ ${this.maxAmount}万`;
    } else {
      this.amountRangeText = `至少${this.minAmount}万`;
    }
  }

  onNext() {
    if (!this.isValid()) {
      return null;
    }
    const data = _.omit(this.order, 'client');
    data.client = this.order.client.id;
    const promise = this.OrderModel.post(data);
    promise
      .then(() => {
        this.formUtil.resetForm();
        this.order = this.formUtil.data;
        this.StateService.doneTo('accountOrders');
      });
    return promise;
  }

  isAmountValid() {
    return this.minAmount <= this.order.amount
      && this.order.amount <= (this.maxAmount || Infinity);
  }

  isValid() {
    return this.order.client && this.isAmountValid();
  }
}


const state = {
  name: 'productOrder',
  options: {
    url: '/product/:productId/order',
    controller: ProductOrderCtrl,
    controllerAs: 'vm',
    templateUrl: 'pages/products/product-order.html',
  },
};

export default state;
