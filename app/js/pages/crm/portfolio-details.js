/** copy from proposal */

const orderList = ["FIXED_INCOME", "STOCK", "ALTERNATIVE", "CASH"];

class Controller {
  static get $inject() {
    return [
      "$log",
      "$stateParams",
      "$scope",
      "ClientModel",
      "StateService",
      "UserModel",
      "PortfolioModel",
      "TranslateFactory"
    ];
  }

  constructor(
    $log,
    $stateParams,
    $scope,
    ClientModel,
    StateService,
    UserModel,
    PortfolioModel,
    TranslateFactory
  ) {
    this.clientId = $stateParams.clientId;
    this.portfolioId = $stateParams.portfolioId;
    this.$scope = $scope;
    this.ClientModel = ClientModel;
    this.StateService = StateService;
    this.UserModel = UserModel;
    this.PortfolioModel = PortfolioModel;
    this.hasNext = true;
    this.is_analysable = false;

    var translateFactory = new TranslateFactory();
    this.language = translateFactory.get$translate().preferredLanguage();

    this.setupHooks();
  }

  setupHooks() {
    this.$scope.$on("$ionicView.beforeEnter", () => {
      this.PortfolioModel
        .getPortfolioConfirm(this.clientId, this.portfolioId)
        .then(resp => {
          this.proposal = resp.data;
          this.report = resp.data.report;
          this.book_id = resp.data.proposal_book_id;
          this.is_analysable = resp.data.is_analysable;
          this.barData = transToBarData(
            this.report.asset_groups,
            this.report.planning_stats.amount,
          );
          this.totalInvestment = this.report.planning_stats.amount;
          this.groupsList = this.calcAssets(this.report.asset_groups);
          // console.log('this.groupsList', this.groupsList)
        });
    });
  }

  calcAssets(groups) {
    const getAmount = (item) => item.in_hand ? item.amount - item.in_hand.amount : item.amount
    return _(groups)
      .keys()
      .map(k => ({
        code: k,
        amount: getAmount(groups[k]),
        products: groups[k].products,
        open: false
      }))
      .sortBy(k => orderList.indexOf(k.code))
      .value();
  }

  onNext() {
    this.StateService.forward("portfolioBook", {
      clientId: this.clientId,
      bookId: this.book_id,
    });
  }
}

function transToBarData(asset_groups, total) {
  const getAmount = (item) => item.in_hand ? item.amount - item.in_hand.amount : item.amount
  return _(orderList).map(k => ({
    code: k.toUpperCase(),
    percentage: getAmount(asset_groups[k]) / total * 100,
    amount: getAmount(asset_groups[k]),
  }))
    .filter(item => item.percentage > -1)
    .sortBy(k => orderList.indexOf(k.code))
    .value();
}

// function getOrderedKeys(obj) {
//   return _.sortBy(_.keys(obj), (k) => orderList.indexOf(k));
// }

const options = {
  controller: Controller,
  templateUrl: "pages/crm/portfolio-details.html"
};

export default options;
