const orderList = [
    'FIXED_INCOME', 'STOCK', 'ALTERNATIVE', 'CASH',
];

class Controller {
    static get $inject() {
        return [
            '$log', '$stateParams', '$scope',
            'ClientModel', 'StateService', 'UserModel', 'PortfolioModel',
        ];
    }

    constructor(
        $log, $stateParams, $scope,
        ClientModel, StateService, UserModel, PortfolioModel
    ) {
        this.clientId = $stateParams.clientId;
        this.portfolioId = $stateParams.portfolioId;
        this.$scope = $scope;
        this.ClientModel = ClientModel;
        this.StateService = StateService;
        this.UserModel = UserModel;
        this.PortfolioModel = PortfolioModel;
        this.hasNext = true;

        this.setupHooks();
    }

    setupHooks() {
        this.$scope.$on('$ionicView.beforeEnter', () => {
            this.PortfolioModel.getPortfolio(this.clientId, this.portfolioId)
                .then((resp) => {
                    this.proposal = resp.data;
                    this.report = this.proposal.report;

                    this.barData = transToBarData(this.report.asset_groups, this.report.total_investment);
                    this.totalInvestment = this.report.total_investment;
                    this.groupsList = this.calcAssets(this.report.asset_groups, this.report.total_investment);
                    // console.log('this.groupsList', this.groupsList)
                });
        });
    }

    calcAssets(groups, suggest, total) {
        // console.log(groups, target, suggest, total);
        return _(groups).keys()
            .map((k) => ({
                code: k,
                amount: groups[k].amount,
                products: groups[k].products,
                open: false,
            }))
            .sortBy((k) => orderList.indexOf(k.code))
            .value();
    }

    onNext() {
        return this.ClientModel.postBook({
            clientId: this.clientId,
            portfolio_id: this.portfolioId,
        }).then((res) => {
            const { id } = res.data;
            //this.StateService.forward('portfolioBook', { clientId: this.clientId, bookId: id });
            //this.StateService.forward('portfolioBook', {});
             //this.StateService.replace('tab.crm');
             this.StateService.forward('tab.crm', {});
        });
    }

}

function transToBarData(groups, total) {
    return _(groups).keys()
        .map((k) => ({
            code: k.toUpperCase(),
            percentage: groups[k].amount / total * 10,
            amount: groups[k].amount,
        }))
        .filter((item) => item.percentage > -1)
        .sortBy((k) => orderList.indexOf(k.code))
        .value();
}

// function getOrderedKeys(obj) {
//   return _.sortBy(_.keys(obj), (k) => orderList.indexOf(k));
// }

const options = {
    controller: Controller,
    templateUrl: 'pages/crm/portfolio-preview.html',
};

export default options;
