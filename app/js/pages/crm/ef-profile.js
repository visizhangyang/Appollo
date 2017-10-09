class Controller {
    static get $inject() {
        return [
            '$q', '$stateParams', '$scope',
            'ClientModel', 'ProductModel', 'StateService', 'EFModel', 'LoadingService'
        ];
    }

    constructor(
        $q, $stateParams, $scope,
        ClientModel, ProductModel, StateService, EFModel, LoadingService
    ) {
        this.$scope = $scope;
        this.$q = $q;
        this.ClientModel = ClientModel;
        this.ProductModel = ProductModel;
        this.EFModel = EFModel;
        this.StateService = StateService;
        this.LoadingService = LoadingService;

        this.strategies = [{
            id: 'MIN_RISK',
            label: '最小风险',
        }, {
            id: 'BEST_SHARPE',
            label: '最优夏普率',
        }];

        this.clientId = $stateParams.clientId;
        this.investment = null;
        this.productCount = null;
        this.returnTarget = null;
        this.productCountMaxValue = 0;
        // returnTargetRange = [min,max]
        this.returnTargetRange = null;
        this.strategy = null;
        this.isSlectStrategy = false;
        this.validProducts = null;
        this.products = null;
        this.isDirtyData = true;
        this.isLoading = false;
        this.isProposalEFProfile = StateService.state.current.name === 'proposalEFProfile';
        this.setupHooks();
    }

    setupHooks() {

        if (this.isProposalEFProfile) {
            this.ClientModel.fetchProposal(this.clientId)
                .then((resp) => {
                    this.proposal = resp.data;
                    this.investment = Math.round(resp.data.report.planning_investment);
                });
        }

        this.ProductModel.getList({ 'self_company': 'True' })
            .then((resp) => {
                this.validProducts = resp.data;
            });

        this.$scope.$on('$ionicView.beforeEnter', () => {



        });

        const that = this;

        this.$scope.$watchGroup(['vm.investment', 'vm.validProducts', 'vm.productCount', 'vm.returnTargetRange', 'vm.returnTarget'], function () {
            that.adjustData();
        });

        this.$scope.$watchGroup(['vm.investment', 'vm.strategy', 'vm.returnTarget', 'vm.productCount'], function (newValues) {
            that.isDirtyData = true;
        });

        this.$scope.$watch('vm.productCount', function (newValue) {
            if (newValue > 0) {
                that.setReturnRateRange();
            }
        });
    }


    get canGenerate() {
        return this.investment >= 100 && this.productCount > 0 && this.returnTarget > 0 && this.strategy;
    }

    adjustData() {
        if (this.validProducts && this.validProducts.length > 0) {
            if (this.investment >= 100) {
                this.productCountMaxValue = Math.floor(this.investment / 100);
                this.productCountMaxValue = Math.min(this.productCountMaxValue, this.validProducts.length);

                if (this.productCount > 0) {
                    this.productCount = Math.abs(Math.floor(this.productCount));
                    if (this.productCount > this.productCountMaxValue) {
                        this.productCount = this.productCountMaxValue;
                    }
                } else {
                    this.productCount = null;
                }
                if (isNaN(this.returnTarget)) {
                    this.returnTarget = null;
                } else if (this.returnTargetRange && this.returnTarget != null) {
                    if (this.returnTarget < this.returnTargetRange[0])
                        this.returnTarget = this.returnTargetRange[0];
                    if (this.returnTarget > this.returnTargetRange[1])
                        this.returnTarget = this.returnTargetRange[1];
                } else {
                    this.returnTarget = null;
                }

            } else {
                if (isNaN(this.investment)) {
                    this.investment = null;
                }

                this.productCountMaxValue = null;
                this.productCount = null;
                this.returnTarget = null;


            }
        }
    }

    changeInvestment(isIncrease) {
        const increase = isIncrease ? 100 : -100;
        const value = +this.investment + increase;
        if (value >= 100) this.investment = value;
        else if (!isIncrease && this.investment > 100) this.investment = 100;
    }

    changeProductCount(isIncrease) {
        const increase = isIncrease ? 1 : -1;
        const value = +this.productCount + increase;
        if (value > 0 && value <= this.productCountMaxValue) this.productCount = value;
    }

    changeReturnTarget(isIncrease) {
        const increase = isIncrease ? 1 : -1;
        let value = +this.returnTarget + increase;
        value = +value.toFixed(1);

        if (this.returnTargetRange) {
            this.returnTarget = value;
        }
    }

    toggleStrategyMode() {
        this.isSlectStrategy = !this.isSlectStrategy;
    }

    selectStrategy(index) {
        this.strategy = this.strategies[index];
        this.toggleStrategyMode();
    }

    getValidProductIdList() {
        if (this.validProducts == null) return null;
        const list = this.validProducts.map(p => p.id);
        return list;
    }

    setReturnRateRange() {
        const product_id_arr = this.getValidProductIdList();
        if (product_id_arr == null || product_id_arr.length === 0 || this.investment < 100)
            return this.$q.reject();

        return this.EFModel.getReturnRateRange({
            planning_invest: this.investment,
            product_count: this.productCount,
            product_pool: product_id_arr
        }).then(res => {
            this.returnTargetRange = [Math.floor(res.data.min_return_rate * 100), Math.floor(res.data.max_return_rate * 100)];
        }).catch(() => {
            this.returnTargetRange = null;
            this.returnTarget = null;
        });
    }


    generate() {

        const product_id_arr = this.getValidProductIdList();
        if (product_id_arr == null || product_id_arr.length === 0)
            return this.$q.reject();

        this.isDirtyData = true;
        this.isLoading = true;
        return this.EFModel.getEfficientFrontier(this.clientId, {
            planning_invest: this.investment,
            product_count: this.productCount,
            expected_return_rate: this.returnTarget / 100,
            product_pool: product_id_arr
        }).then(res => {
            this.setResult(res.data);
            this.isDirtyData = false;
        }).finally(() => {
            this.isLoading = false;
        });
    }

    setResult(result) {
        this.products = null;
        let products = null;
        if (this.strategy.id == 'MIN_RISK') {
            products = result.min_risk;
        } else if (this.strategy.id == 'BEST_SHARPE') {
            products = result.best_sharpe;
        }
        if (products == null) return;
        this.products = [];
        for (var p1 of products) {
            const p3 = _.filter(this.validProducts, p2 => p2.id == p1.product)[0];
            this.products.push({
                id: p1.product,
                name: p3.product_name,
                return_rate: p3.return_rate,
                percentage: p1.percentage,
                investment: Math.round(this.investment * p1.percentage),
            });
        }
    }

    get canCreate() {
        return this.canGenerate && !this.isDirtyData;
    }

    create() {
        const product_id_arr = this.getValidProductIdList();
        if (product_id_arr == null || product_id_arr.length === 0)
            return this.$q.reject();

        let postData = null;
        if (this.isProposalEFProfile) {
            const item_list = this.products.map(p => { return { product: p.id, percentage: p.percentage, amount: p.investment } });
            postData = this.ClientModel.postProposal(this.clientId, {
                item_list,
            });
        } else {
            postData = this.EFModel.createEfficientFrontier(this.clientId, {
                planning_invest: this.investment,
                product_count: this.productCount,
                expected_return_rate: this.returnTarget / 100,
                product_pool: product_id_arr,
                investment_strategy: this.strategy.id,
            });
        }

        return postData.then(res => {

            if (this.isProposalEFProfile) {
                this.StateService.go('proposal', { id: this.clientId });
            } else {
                const portfolio = res.data;
                this.StateService.forward('portfolioPreview', { clientId: this.clientId, portfolioId: portfolio.id });
            }
        }).catch(() => {

        });
    }
}

const options = {
    controller: Controller,
    templateUrl: 'pages/crm/ef-profile.html',
};

export default options;
