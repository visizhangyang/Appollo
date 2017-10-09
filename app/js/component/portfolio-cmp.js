/** copy from ./proposal-cmp */

const orderList = [
    'FIXED_INCOME', 'STOCK', 'ALTERNATIVE', 'CASH',
];

class PropsosalCmpCtrl {
    static get $inject() {
        return ['$scope'];
    }

    constructor($scope) {
        $scope.$watch(() => this.proposal, (newV) => {
            if (newV) {
                this.donutData = this.getDonutData(newV.asset_groups, newV.total_investment);
                this.totalInvestment = newV.total_investment;
            }
            this.groupsList = this.getOrderedKeys(newV.asset_groups);
        });
    }

    getOrderedKeys(obj) {
        return _.sortBy(_.keys(obj), (k) => orderList.indexOf(k));
    }

    getDonutData(asset_groups, total) {
        return _(this.getOrderedKeys(asset_groups))
            .map((k) => ({
                code: k.toUpperCase(),
                percentage: asset_groups[k].amount / total * 100,
                amount: asset_groups[k].amount,
            }))
            .filter((item) => item.percentage)
            .value();
    }
}

const proposalCmp = {
    templateUrl: 'component/portfolio-cmp.html',
    controller: PropsosalCmpCtrl,
    bindings: {
        proposal: '<',
        demo: '<',
        clientId: '@',
        portfolioId: '@'
    },
};

export default proposalCmp;
