const orderList = [
  'FIXED_INCOME', 'STOCK', 'ALTERNATIVE', 'CASH',
];

class ProposalController {
  static get $inject() {
    return [
      '$log', '$stateParams', '$scope',
      'ClientModel', 'StateService', 'UserModel', '$ionicHistory', 'TranslateFactory'
    ];
  }

  constructor(
    $log, $stateParams, $scope,
    ClientModel, StateService, UserModel, $ionicHistory, TranslateFactory
  ) {
    this.clientId = $stateParams.id;
    this.$scope = $scope;
    this.ClientModel = ClientModel;
    this.StateService = StateService;
    this.UserModel = UserModel;
    this.$ionicHistory = $ionicHistory;
    this.hasNext = true;

    var translateFactory = new TranslateFactory();
    this.language = translateFactory.get$translate().preferredLanguage();

    this.setupHooks();
  }

  setupHooks() {
    this.$scope.$on('$ionicView.beforeEnter', () => {
      while (true) {
        const backView = this.$ionicHistory.backView();
        if (backView && ['proposal', 'proposalForm'].includes(backView.stateName)) {
          // console.log('remove view', this.$ionicHistory.backView());
          this.$ionicHistory.removeBackView();
        } else {
          break;
        }
      }
      this.ClientModel.fetchProposal(this.clientId)
        .then((resp) => {
          this.proposal = resp.data;
          this.report = this.proposal.report;

          this.barData = transToBarData(this.report.allocation_analysis, this.report.asset_groups, this.report.total_investment);
          this.totalInvestment = this.report.total_investment;
          this.groupsList = this.calcAssets(this.report.asset_groups, this.report.asset_target, this.report.allocation_analysis.suggest, this.report.allocation_analysis.in_hand, this.report.total_investment);
          //console.log(this.groupsList)
        });
    });
  }

  calcAssets(groups, target, suggest, in_hand, total) {
    // console.log(groups, target, suggest, total);
    const getAdjustPercent = (k) => {
      const suggestPercent = suggest.total > 0 ? suggest[k] / suggest.total : 0;
      const inHandPercent = in_hand.total > 0 ? in_hand[k] / in_hand.total : 0;
      return inHandPercent > 0 ? suggestPercent - inHandPercent : suggestPercent;
    }
    return _(groups).keys()
      .map((k) => ({
        code: k,
        adjustPercent: getAdjustPercent(k) * 100,
        amount: groups[k].amount - groups[k].in_hand.amount,
        totalAmount: groups[k].amount,
        products: groups[k].products,
        open: false,
      }))
      .sortBy((k) => orderList.indexOf(k.code))
      .value();
  }

  onNext() {
    return this.ClientModel.postBook({
      clientId: this.clientId,
    }).then((res) => {
      const { id } = res.data;
      // this.StateService.forward('portfolioBook', { clientId: this.clientId, bookId: id });
      this.StateService.forward('tab.crm');
    });
  }

  onSaveAsPdf() {
    this.StateService.forward('portfolioBook', { clientId: this.clientId});
  }

}

function transToBarData(allocationAnalysis, groups, total) {
  return _(groups).keys()
    .map((k) => ({
      code: k.toUpperCase(),
      percentage: allocationAnalysis.in_hand.total == 0 ? 0 : allocationAnalysis.in_hand[k] / allocationAnalysis.in_hand.total * 100,
      amount: allocationAnalysis.in_hand[k],
      totalPercentage: groups[k].amount / total * 100,
      totalAmount: groups[k].amount,
    }))
    .filter((item) => item.percentage > -1)
    .sortBy((k) => orderList.indexOf(k.code))
    .value();
}

// function getOrderedKeys(obj) {
//   return _.sortBy(_.keys(obj), (k) => orderList.indexOf(k));
// }

const options = {
  controller: ProposalController,
  templateUrl: 'pages/crm/proposal.html',
};

export default options;
