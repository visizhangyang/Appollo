const productErrorDict = {
  serializer_validation_error: '提交的数据有误',
};


export default class ProductModel {
  static get $inject() {
    return ['$q', '$timeout', 'ApiService', 'UserModel'];
  }
  constructor($q, $timeout, ApiService, UserModel) {
    this.q = $q;
    this.timeout = $timeout;
    this.ApiService = ApiService;
    this.UserModel = UserModel;
    this.authProduct = ApiService.authApi.all('user').all('products');
    this.product = ApiService.authApi.all('products');
    this.baseProduct = ApiService.baseApi.all('products');

    this.productTypeList = [
      {
        name: '信托产品',
        value: 'TRUST',
      },
      {
        name: '资管计划',
        value: 'ASSET_MANAGEMENT',
      },
      {
        name: '阳光私募 - 固定收益',
        value: 'PRIVATE_FUND',
      },
      {
        name: '阳光私募 - 浮动收益',
        value: 'PRIVATE_FUND_FLOAT',
      },
      {
        name: '其他',
        value: 'OTHER',
      },
    ];

    this.errorCb = ApiService.errorMsgInterceptor(productErrorDict);

    this.orderForm = null;
  }

  get filterList() {
    return [
      {
        name: '所有产品',
        value: null,
      },
      {
        name: '信托',
        value: 'TRUST',
      },
      {
        name: '资管',
        value: 'ASSET_MANAGEMENT',
      },
      {
        name: '私募基金',
        value: 'PRIVATE_FUND,PRIVATE_FUND_FLOAT',
      },
      {
        name: '其他',
        value: 'OTHER,ADVICE',
      },
    ];
  }

  get queryOrderingList() {
    return [
      {
        name: '默认排序',
        value: null,
      },
      {
        name: '佣金从高到低',
        value: '-commision_rate',
      },
      {
        name: '收益从高到低',
        value: '-return_rate',
      },
    ];
  }

  couldOrder(product) {
    const isApproved = product.status === 'APPROVED';
    const isAvailable = product.product_status === 'PREPARATION' ||
                        product.product_status === 'SELLING';
    return isApproved && isAvailable;
  }

  getHomeProducts() {
    return this.q((resolve) => {
      this.timeout(() => {
        resolve();
      }, 2000);
    });
  }

  getList(params) {
    return this.UserModel.onSetupReady()
      .then(() => this.baseProduct.getList(params));
  }

  getDetail(productId) {
    return this.baseProduct.one(productId).get();
  }

  getHotSale() {
    return this.ApiService.baseApi.all('hotsale').customGET();
  }

  findProductType(productType) {
    return _.find(this.productTypeList, (typeObj) => typeObj.value === productType);
  }

  fetchOrders(productId) {
    return this.UserModel.onSetupReady()
      .then(() => this.product.one(productId).all('orders').getList());
  }

  uploadProduct(product) {
    const formData = new FormData();
    Object.keys(product).forEach((key) => {
      if (key === 'benchmark_yield_list') {
        product[key].forEach((item) => {
          formData.append(`${key}`, JSON.stringify(item));
        });
      } else if (key === 'attachments') {
        product[key].forEach((item) => {
          formData.append(`${key}`, item);
        });
      } else {
        formData.append(key, product[key]);
      }
    });
    return this.authProduct.customPOST(formData, undefined, undefined,
      { 'Content-Type': undefined }
    )
      .catch(this.errorCb);
  }

  // noinspection JSMethodCanBeStatic
  getMaxBenchmark(product) {
    let benchmark = _.maxBy(
      product.benchmark_yield_list,
      'expected_annual_return'
    );
    if (!benchmark) {
      benchmark = product.benchmark_yield_list[0];
    }
    return benchmark;
  }

  // noinspection JSMethodCanBeStatic
  getMaxAmountBenchmark(product) {
    const isInfinit = product.benchmark_yield_list
      .some((ben) => !ben.investment_amount_max);
    if (isInfinit) {
      return null;
    }
    const benchmark = _.maxBy(
      product.benchmark_yield_list,
      'investment_amount_max'
    );
    if (!benchmark) {
      return null;
    }
    return benchmark;
  }

  // noinspection JSMethodCanBeStatic
  getMaxCommissionBenchmark(product) {
    let benchmark = _.maxBy(
      product.benchmark_yield_list,
      'commision_rate'
    );
    if (!benchmark) {
      benchmark = product.benchmark_yield_list[0];
    }
    return benchmark;
  }

  // noinspection JSMethodCanBeStatic
  getMixBenchmark(product) {
    let benchmark = _.minBy(
      product.benchmark_yield_list,
      'expected_annual_return'
    );
    if (!benchmark) {
      benchmark = product.benchmark_yield_list[0];
    }
    return benchmark;
  }

  // noinspection JSMethodCanBeStatic
  getProductType(product) {
    const item = _.find(this.productTypeList,
      (productType) => productType.value === product.product_type
    );
    return item && item.name;
  }
}
