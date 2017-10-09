
const orderList = [
  'GLOBAL_STOCK', 'EMERGING_MARKET_EQUITY', 'CHINA_STOCK', 'GLOBAL_BOND',
  'EMERGING_MARKET_BOND', 'ALTERNATIVE', 'P2P', 'CASH',
];

class ProposalPerfController {
  static get $inject() {
    return [
      '$log', '$stateParams', '$scope', '$filter',
      'ClientModel', 'StateService', 'LoadingService', 'TranslateFactory'
    ];
  }

  constructor(
    $log, $stateParams, $scope, $filter,
    ClientModel, StateService, LoadingService, TranslateFactory
  ) {
    this.clientId = $stateParams.clientId;
    this.proposal = $stateParams.proposal;
    this.$scope = $scope;
    this.$filter = $filter;
    this.ClientModel = ClientModel;
    this.StateService = StateService;
    this.LoadingService = LoadingService;
    // console.log('$stateParams', $stateParams)

    var translateFactory = new TranslateFactory();
    this.$tanslate = translateFactory.get$translate();

    this.setData(this.proposal);

  }

  setData(proposal) {

    const groups = this.groups = [];
    const formatMoney = this.$filter('formatMoney');

    if (proposal.report.planning_stats) {
      const stats = proposal.report.planning_stats;
      const addedAssetsLabel = this.$tanslate.instant('proposal_perf_customized_portfolio_added_assets', { amount: this.$tanslate.instant('common_eur_symbol') + formatMoney(stats.amount) });
      groups.push({
        title: addedAssetsLabel,
        stats,
      });
    }

    if (!proposal.report.has_one_stats) {
      if (proposal.report.stats) {
        const stats = proposal.report.stats;
        const totalAssetsLabel = this.$tanslate.instant('proposal_perf_customized_portfolio_total_assets', { amount: formatMoney(stats.amount) });
        groups.push({
          title: totalAssetsLabel,
          stats,
        });
      }
    }


  }

  getOrderedKeys(obj) {
    return _.sortBy(_.keys(obj), (k) => orderList.indexOf(k));
  }

}

const options = {
  controller: ProposalPerfController,
  templateUrl: 'pages/crm/proposal-perf.html',
  params: {
    proposal: null,
  }
};

export default options;
