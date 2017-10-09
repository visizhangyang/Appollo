class ProductNewCtrl {
  static get $inject() {
    return ['$log', '$stateParams', 'ProductModel', 'StateService'];
  }
  constructor($log, $stateParams, ProductModel, StateService) {
    this.logger = $log;

    this.next = $stateParams.next;
    this.StateService = StateService;
    this.productTypeList = ProductModel.productTypeList;
  }

  selectProduct(type) {
    this.StateService.replace('ProductNewForm',
      {
        product_type: type,
        next: this.next,
      }
    );
  }
}

const state = {
  name: 'productNew',
  options: {
    url: '/new/product/:next?',
    controller: ProductNewCtrl,
    controllerAs: 'vm',
    templateUrl: 'pages/products/product-new.html',
  },
};

export default state;
