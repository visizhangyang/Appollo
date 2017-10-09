class AttachmentsCtrl {
  static get $inject() {
    return [
      '$log', '$scope', '$stateParams',
      '$window',
      'ProductModel',
    ];
  }
  constructor(
    $log, $scope, $stateParams,
    $window,
    ProductModel
  ) {
    this.$log = $log;
    this.$scope = $scope;
    this.$window = $window;
    this.ProductModel = ProductModel;

    this.productId = $stateParams.productId;
    this.attachments = [];
    this.setupHooks();
  }

  setupHooks() {
    this.$scope.$on('$ionicView.beforeEnter', () => {
      this.doRefresh();
    });
  }

  doRefresh() {
    this.ProductModel.getDetail(this.productId)
      .then((resp) => {
        this.renderBody(resp.data);
      });
  }

  renderBody(product) {
    this.attachments = product.attachments;
  }

  openExternal(url) {
    this.$window.open(url, '_system');
  }
}

const state = {
  name: 'attachmentsPage',
  options: {
    url: '/product/attachment/:productId',
    controller: AttachmentsCtrl,
    controllerAs: 'vm',
    templateUrl: 'pages/products/attachments.html',
  },
};

export default state;
