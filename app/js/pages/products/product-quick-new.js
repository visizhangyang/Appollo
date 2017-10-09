
class ProductQuickNew {
  static get $inject() {
    return [
      'FormFactory', 'StateService',
      'ProductModel',
    ];
  }

  constructor(
    FormFactory, StateService,
    ProductModel
  ) {
    this.StateService = StateService;
    this.ProductModel = ProductModel;

    this.cat_options = [
      { key: 'GLOBAL_STOCK', text: '欧美全球股票' },
      { key: 'EMERGING_MARKET_EQUITY', text: '亚洲新兴市场股票' },
      { key: 'CHINA_STOCK', text: '中国股票' },
      { key: 'GLOBAL_BOND', text: '全球债券' },
      { key: 'EMERGING_MARKET_BOND', text: '新兴市场债券' },
      { key: 'P2P', text: '个人债' },
      { key: 'CASH', text: '现金与现金等价物' },
      { key: 'ALTERNATIVE', text: '另类投资' },
    ];

    this.risk_options = [
      { key: 'HIGH', text: '高' },
      { key: 'MIDDLE', text: '中' },
      { key: 'LOW', text: '低' },
    ];

    this.formUtil = new FormFactory({
      portfolio_class: this.cat_options[0].key,
      risk_level: this.risk_options[0].key,
      product_type: 'OTHER',
    });
  }

  next() {
    this.ProductModel.uploadProduct(this.formUtil.data)
      .then(() => {
        this.StateService.back();
      }, (error) => {
        this.formUtil.submitError = error.getDisplayError();
      });
  }
}

const state = {
  name: 'productQuickNew',
  options: {
    url: '/product/quick-new',
    controller: ProductQuickNew,
    controllerAs: 'vm',
    templateUrl: 'pages/products/product-quick-new.html',
  },
};

export default state;
