
class ProductItemCtrl {
  static get $inject() {
    return ['ProductModel', 'TranslateFactory'];
  }
  constructor(ProductModel, TranslateFactory) {
    this.ProductModel = ProductModel;

    var translateFactory = new TranslateFactory();
    this.$translate = translateFactory.get$translate();

    this.prepareData();

    this.slot = null;
    if (this.product.product_status === 'SELLING') {
      this.slot = {
        className: 'selling',
        text: this.$translate.instant('product_item_selling')
      };
    } else {
      this.slot = {
        className: 'halt-selling',
        text: this.$translate.instant('product_item_stop_selling')
      };
    }
  }

  prepareData() {
    const benchmark = this.ProductModel.getMaxBenchmark(this.product);
    const benchmarkCommision = this.ProductModel.getMaxCommissionBenchmark(this.product);
    if (benchmark) {
      this.maximum_expect_rate = benchmark.expected_annual_return;
      this.commission_rate = benchmarkCommision.commision_rate;
    } else {
      this.maximum_expect_rate = this.product.return_rate;
    }
  }
}

const productItemCmp = {
  templateUrl: 'component/product-item.html',
  controller: ProductItemCtrl,
  bindings: {
    recommend: '<',
    product: '<',
    user: '<',
    hideCollection: '<',
  },
};

export default productItemCmp;
