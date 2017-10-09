const orderDict = [
  'FIXED_INCOME',
  'STOCK',
  'ALTERNATIVE',
  'CASH',
];

class SuggestAssetCtrl {
  constructor() {
    this.getAllocation();
    this.analysisKeys = ['fixed_income', 'stock', 'alternative', 'cash'];
  }

  getAllocation() {
    const allocation = this.analysis.target_status;
    this.allocation = _(allocation).keys()
      .map((k) => ({
        code: k.toUpperCase(),
        percentage: allocation[k][1] * 100,
        amount: allocation[k][0],
      }))
      .filter((item) => item.percentage >= 0)
      .sortBy((k) => orderDict.indexOf(k.code))
      .value();
    console.log(this.allocation)
  }
}

const suggestAssetCmp = {
  templateUrl: 'component/suggest-asset.html',
  controller: SuggestAssetCtrl,
  bindings: {
    analysis: '<',
  },
};

export default suggestAssetCmp;
