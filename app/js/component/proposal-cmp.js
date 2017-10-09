
const orderList = [
  'FIXED_INCOME', 'STOCK', 'ALTERNATIVE', 'CASH',
];

class PropsosalCmpCtrl {
  static get $inject() {
    return ['$scope', 'UserModel'];
  }

  constructor($scope, UserModel) {
    $scope.$watch(() => this.proposal, (newV) => {
      if (newV) {
        this.barData = transToBarData(newV.allocation_analysis, newV.asset_groups, newV.total_investment);
        this.totalInvestment = newV.total_investment;
        this.groupsList = this.getOrderedKeys(newV.asset_groups);
        this.UserModel = UserModel;
      }
    });
  }

  getOrderedKeys(obj) {
    return _.sortBy(_.keys(obj), (k) => orderList.indexOf(k));
  }

  // getDonutData(groups, total) {
  //   return _(this.getOrderedKeys(groups))
  //     .map((k) => ({
  //       code: k.toUpperCase(),
  //       percentage: groups[k].amount / total * 100,
  //       amount: groups[k].amount,
  //     }))
  //     .filter((item) => item.amount)
  //     .value();
  // }
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

const proposalCmp = {
  templateUrl: 'component/proposal-cmp.html',
  controller: PropsosalCmpCtrl,
  bindings: {
    proposal: '<',
    demo: '<',
    clientId: '@'
  },
};

export default proposalCmp;
