class ProductNewFormCtrl {
  static get $inject() {
    return [
      '$log', '$scope', '$stateParams', '$ionicListDelegate',
      'StateService', 'ProductModel', 'NewBenchmarkService', 'isRelease',
      'FormFactory',
    ];
  }
  constructor(
    $log, $scope, $stateParams, $ionicListDelegate,
    StateService, ProductModel, NewBenchmarkService, isRelease,
    FormFactory
  ) {
    this.$log = $log;
    this.$scope = $scope;
    this.$ionicListDelegate = $ionicListDelegate;
    this.StateService = StateService;
    this.ProductModel = ProductModel;
    this.NewBenchmarkService = NewBenchmarkService;
    this.nextState = $stateParams.next;

    this.payment_options = [
      {
        name: '成立现结',
        value: 'ESTABLISHMENT',
      },
      {
        name: '打款现结',
        value: 'DEPOSIT',
      },
    ];

    this.productType = ProductModel.findProductType($stateParams.product_type);
    this.hasRate = this.productType.value !== 'PRIVATE_FUND_FLOAT';

    const data = {
      product_type: this.productType.value,
      benchmark_yield_list: [],
      attachments: [],
      payment_date: this.payment_options[0].value,
    };
    if (!isRelease) {
      data.benchmark_yield_list.push({
        investment_amount: 1,
        investment_amount_max: 1,
        commision_rate: 1,
        expected_annual_return: 1,
      });
      data.product_name = 'demo-product-name';
      data.initial_deposit = 1;
    }
    this.formUtil = new FormFactory(data);
    this.productForm = this.formUtil.data;

    this.setWatcher();
  }

  setWatcher() {
    this.$scope.$on('$ionicView.beforeLeave', () => {
      this.formUtil.resetForm();
      this.productForm = this.formUtil.data;
    });
  }

  ready() {
    return this.productForm.benchmark_yield_list.length > 0;
  }

  newBenchmarkForm() {
    this.NewBenchmarkService.newForm({}, this.hasRate)
      .then((benchmark) => {
        benchmark.promise.then((data) => {
          this.productForm.benchmark_yield_list.push(data);
        });
      });
  }

  editBenchmark(index) {
    const editItem = this.productForm.benchmark_yield_list[index];
    this.NewBenchmarkService.newForm(
      _.assign({}, editItem),
      this.hasRate
    )
      .then((benchmark) => {
        benchmark.promise.then((data) => {
          this.$ionicListDelegate.closeOptionButtons();
          this.productForm.benchmark_yield_list[index] = data;
        });
      });
  }

  deleteBenchmark(index) {
    this.$ionicListDelegate.closeOptionButtons();
    this.productForm.benchmark_yield_list.splice(index, 1);
  }

  addFile(file) {
    this.productForm.attachments.push(file);
  }

  deleteFile(index) {
    this.$ionicListDelegate.closeOptionButtons();
    this.productForm.attachments.splice(index, 1);
  }

  next() {
    const promise = this.ProductModel.uploadProduct(this.productForm);
    promise
      .then(() => {
        this.StateService.replace('ProductNewDone', { next: this.nextState });
      }, (error) => {
        this.formUtil.submitError = error.getDisplayError();
      });
    return promise;
  }
}

const state = {
  name: 'ProductNewForm',
  options: {
    url: '/new/product/form/:product_type/:next?',
    controller: ProductNewFormCtrl,
    controllerAs: 'vm',
    templateUrl: 'pages/products/product-new-form.html',
  },
};

export default state;
