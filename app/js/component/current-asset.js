const orderDict = [
  'FIXED_INCOME',
  'STOCK',
  'ALTERNATIVE',
  'CASH',
];
class CurrentAssetCtrl {
  constructor($scope) {
    $scope.$watch(() => this.report.class_distribution, () => {
      this.getDonutData();
    });

    this.healthy_status = this.report.healthy_status;
  }

  getDonutData() {
    const distribution = this.report.class_distribution;
    this.data = transToBarData(this.report.analysis.current_status);
    this.donutData = _(distribution).keys()
      .map((k) => ({
        code: k.toUpperCase(),
        percentage: distribution[k][1] * 100,
        amount: distribution[k][0],
      }))
      .filter((item) => item.percentage)
      .sortBy((k) => orderDict.indexOf(k.code))
      .value();
  }
}
CurrentAssetCtrl.$inject = ['$scope'];

function transToBarData(allocation) {
  return _(allocation).keys()
    .map((k) => ({
      code: k.toUpperCase(),
      percentage: allocation[k][0] / allocation.total * 100,
      amount: allocation[k][0],
    }))
    .filter((item) => item.percentage > -1)
    .sortBy((k) => orderDict.indexOf(k.code))
    .value();
}

const currentAssetCmp = {
  templateUrl: 'component/current-asset.html',
  controller: CurrentAssetCtrl,
  bindings: {
    report: '<',
  },
};

export default currentAssetCmp;
