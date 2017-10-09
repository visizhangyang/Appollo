
class ProposalFormController {
  static get $inject() {
    return [
      '$log', '$q', '$timeout', '$stateParams', '$scope', 'LoadingService',
      'ClientModel', 'ProductModel', '$ionicScrollDelegate',
      'FormFactory', 'StateService', 'PortfolioModel', '$ionicHistory', 'TranslateFactory', 'CommonService'
    ];
  }

  constructor(
    $log, $q, $timeout, $stateParams, $scope, LoadingService,
    ClientModel, ProductModel, $ionicScrollDelegate,
    FormFactory, StateService, PortfolioModel, $ionicHistory, TranslateFactory, CommonService
  ) {
    this.moneyUnit = CommonService.getMoneyUnit();
    var translateFactory = new TranslateFactory();
    this.$tanslate = translateFactory.get$translate();
    this.language = this.$tanslate.preferredLanguage();

    this.clientId = $stateParams.id;
    this.portfolioId = $stateParams.portfolioId;
    this.$q = $q;
    this.$log = $log;
    this.$scope = $scope;
    this.$timeout = $timeout;
    this.$ionicScrollDelegate = $ionicScrollDelegate;
    this.LoadingService = LoadingService;
    this.ClientModel = ClientModel;
    this.ProductModel = ProductModel;
    this.PortfolioModel = PortfolioModel;
    this.StateService = StateService;
    this.$ionicHistory = $ionicHistory;
    this.CommonService = CommonService;
    this.client = null;
    this.risk_level = null;
    this.pickedCount = 0;
    this.proposalLoaded = false;
    this.productLoaded = false;
    this.tabs = [
      { key: 'FIXED_INCOME', text: this.$tanslate.instant('common_fixed_income'), amount: 0 },
      { key: 'STOCK', text: this.$tanslate.instant('common_equity'), amount: 0 },
      { key: 'ALTERNATIVE', text: this.$tanslate.instant('common_alternatives'), amount: 0 },
      { key: 'CASH', text: this.$tanslate.instant('common_cash'), amount: 0 },
    ];
    this.selectedTab = this.tabs[0].key;
    this.formUtil = new FormFactory({
      items: {},
    });
    this.isSubmitting = false;
    this.setupHooks();
  }

  getProductsMap() {
    let products = _.orderBy(this.productList, ['selected']);
    _.forEach(products, (p) => {
      p.amount = this.CommonService.roundMoney(p.amount / this.moneyUnit);
    });
    return _.groupBy(products, (i) => i.asset_class);
  }

  setupHooks() {
    this.$scope.$on('$ionicView.beforeEnter', () => {
      let request = this.ClientModel.get(this.clientId).then(res => {
        this.client = res.data;
      });
      if (this.portfolioId) {
        request = request.then(() => PortfolioModel.getPortfolio(this.clientId, this.portfolioId));
      }
      else {
        request = request.then(() => this.ClientModel.fetchProposal(this.clientId));
      }
      request = request.then(this.processProposalData.bind(this)).then(this.getList.bind(this));

      this.LoadingService.requesting(() => request);
    });
  }

  processProposalData(resp) {
    this.proposal = resp.data;
    this.risk_level = this.proposal.report.risk_level;
    this.total_investment = this.proposal.report.total_investment;
    this.dispalyPlanningTotalInvestment = Math.round(this.proposal.report.planning_stats.amount) / this.moneyUnit;

    const itemList = resp.data.item_list;
    const items = {};
    _.values(itemList).forEach((p) => {
      items[p.product] = {
        amount: p.amount
      };
    });
    this.formUtil.data.items = items;
    this.proposalLoaded = true;
    // this.setupProposalItems();
    this.computeCounts();
  }

  setupProposalItems() {
    if (this.proposalLoaded && this.productLoaded) {
      this.productList.forEach((p) => {
        if (this.formUtil.data.items[p.id]) {
          p.selected = true;
          p.amount = Math.round(this.formUtil.data.items[p.id].amount);
        }
      });
    }
  }

  getList() {
    // const params = {
    //   asset_class: _.map(this.tabs, (i) => i.key).join(','),
    // };
    return this.ProductModel.getList()
      .then((resp) => {
        this.productList = resp.data;
        this.productLoaded = true;
        this.setupProposalItems();
        this.productsMap = this.getProductsMap();
        this.computeCounts();
      });
  }

  adjustAmount(product, isAdd) {
    if (isAdd) {
      if (!product.amount) {
        product.amount = 0.01
      }
      else {
        product.amount += 0.01;
      }
    }
    else {
      product.amount = Math.max(product.min_investment / this.moneyUnit, product.amount - 0.01);
    }

    product.amount = parseFloat(product.amount.toFixed(2));

    this.setProductSelected(product);
    this.calculate();
  }

  changeAmount(product) {
    if (product.amount < 0) {
      product.amount = 0;
    }
    else if (product.amount > this.total_investment) {
      product.amount = this.total_investment;
    }

    this.setProductSelected(product);
    this.calculate();
  }

  setProductSelected(product) {
    product.selected = !!product.amount;
    this.computeTab(null, this.selectedTab);
  }

  computeCounts() {
    if (!this.productsMap) {
      return;
    }

    this.tabs.forEach((tab) => {
      this.computeTab(tab);
    });
  }

  computeTab(tabObj, key) {
    const tab = tabObj || _.find(this.tabs, (item) => item.key === key);
    if (tab) {
      tab.validCounts = _.filter(
        this.productsMap[tab.key],
        (product) => product.selected
      ).length;
      tab.totalCounts = (this.productsMap[tab.key] || []).length;
    }
    this.pickedCount = this.getItemList().length;
    this.calculate();
  }

  calculate() {
    var tabs = {};
    for (var tab of this.tabs) {
      tab.amount = 0;
      tabs[tab.key] = tab;
    }
    const products = [];
    for (var product of this.productList) {
      if (product.selected) {
        products.push(product);
        tabs[product.asset_class].amount += product.amount;
      }
    }

    this.dispalyPlanningTotalInvestment = _.sumBy(products, function (o) { return o.amount; }).toFixed(2);
  }

  getAmountPercent(amount) {
    amount = amount || 0;
    if (this.dispalyPlanningTotalInvestment > 0) {
      return amount / this.dispalyPlanningTotalInvestment * 100;
    } else {
      return 0;
    }
  }

  getProductPercent(product) {
    let { selected, amount } = product;
    if (selected) {
      return this.getAmountPercent(amount);
    } else {
      return 0;
    }
  }

  onSubmit($event, isValid) {
    if (!isValid) {
      this.formUtil.submitError = '请认真填写资产信息';
      return null;
    }

    if (this.isSubmitting) {
      return;
    }

    if (!this.checkInvestments()) {
      return;
    }

    this.isSubmitting = true;
    this.$ionicHistory.removeBackView();

    return this.ClientModel.postAsset({
      client_id: this.clientId,
      planning_invest: this.dispalyPlanningTotalInvestment * this.moneyUnit,
    }).then(postPortfolio.bind(this));

    function postPortfolio() {
      if (this.portfolioId) {
        return this.PortfolioModel.postPortfolio(this.clientId, this.portfolioId, {
          item_list: this.getItemList(),
        })
          .then(() => {
            this.StateService.forward('portfolioPreview', { clientId: this.clientId, portfolioId: this.portfolioId });
          }, (resp) => this.processSubmitError(resp))
          .finally(() => this.isSubmitting = false);
      }
      else {
        return this.ClientModel.postProposal(this.clientId, {
          item_list: this.getItemList(),
        }).then(() => {
          this.StateService.forward('proposal', { id: this.clientId });
        }, (resp) => this.processSubmitError(resp))
          .finally(() => this.isSubmitting = false);
      }
    }


  }


  checkInvestments() {
    const products = this.productList.filter((product) => product.selected);
    const invalidProducts = products.filter(product => product.amount * this.moneyUnit < product.min_investment);

    if (invalidProducts.length > 0) {
      const first = invalidProducts[0];
      let message = this.$tanslate.instant('proposal_form_min_invest_error', { productName: first.product_name, minInvestment: first.min_investment / this.moneyUnit});
      this.LoadingService.showFailedLoading(message, 2500);
      return false;
    }
    return true;
  }

  processSubmitError(resp) {
    const data = resp.data;

    if (data.error_code === 'portfolio_total_percentage_overflow') {
      data.error_msg = '当前选择的配比大于100%';
    }
    this.formUtil.submitError = data.error_msg;

    if (this.formUtil.submitError) {
      this.$ionicScrollDelegate.scrollBottom();
    }
  }

  getItemList() {
    return this.productList.filter((product) => product.selected)
      .map((product) => ({
        product: product.id,
        amount: product.amount * this.moneyUnit,
        percentage: product.amount / this.dispalyPlanningTotalInvestment
      }));
  }

  switchTab(tab) {
    this.selectedTab = tab.key;
  }
}

const options = {
  controller: ProposalFormController,
  templateUrl: 'pages/crm/proposal-form.html',
};

export default options;
