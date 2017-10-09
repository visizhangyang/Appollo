import moment from 'moment';
import { Map, List } from 'immutable';
import IonicPage from '../ionic-page';

class Page extends IonicPage {

    static get $inject() {
        return ['$scope', '$q', '$stateParams', '$ionicBackdrop', '$ionicPopover', 'ClientModel', 'PortfolioModel', 'StateService' ,'TranslateFactory', 'CommonService'];
    }

    constructor($scope, $q, $stateParams, $ionicBackdrop, $ionicPopover, ClientModel, PortfolioModel, StateService, TranslateFactory, CommonService) {
        super($scope);
        this.$q = $q;
        this.$ionicBackdrop = $ionicBackdrop;
        this.$ionicPopover = $ionicPopover;
        this.ClientModel = ClientModel;
        this.clientId = $stateParams.clientId;
        this.sourcePortfolioId = $stateParams.portfolioId;
        this.PortfolioModel = PortfolioModel;
        this.StateService = StateService;
        this.CommonService = CommonService;
        this.moneyUnit = CommonService.getMoneyUnit();
        const translateFactory = new TranslateFactory();
        this.$tanslate = translateFactory.get$translate();
        this.language = this.$tanslate.preferredLanguage();

        this.periodList = [
            { label: this.$tanslate.instant('performance_month_unit',{curMonth:6}), dateType: 'months', value: 6 },
            { label: this.$tanslate.instant('performance_year_unit',{curYear:1}), dateType: 'years', value: 1 },
            { label: this.$tanslate.instant('performance_year_unit',{curYear:3}), dateType: 'years', value: 3 },
        ];
        this.portfolioHistoryData = Map();

        this.pageCompareState = null;
        this.showProfileOverlay = false;

        this.portfolioList = null;
        this.portfolioCurrent = null;

        this.loadUserPortfolioList().then(this.loadPlanningInvestment.bind(this));
        this.compareIndexList = null;
        this.compareIndexCurrent = null;
        this.loadIndexList();

        this.selectPeriod(2);

        this.profileOptionList = [{
            id: 'risk-profile',
            name: this.$tanslate.instant('performance_risk_attribution'),
        }, {
            id: 'return-profile',
            name: this.$tanslate.instant('performance_return_attribution'),
        }, {
            id: 'sharp-profile',
            name: this.$tanslate.instant('performance_sharp_ratio'),
        }];
        this.profileOptionCurrent = this.profileOptionList[0];
        // portfolio products current state if adjustment
        this.portfolioCurrentState = null;

    }

    willEnter() {

    }

    didEnter() {

    }


    loadUserPortfolioList() {

        return this.PortfolioModel.getUserPortfolioList(this.clientId).then(result => {
            this.portfolioList = result.data.results.map(p => {
                return { id: p.id, name: p.portfolioconfirm_name };
            });
            // this.compareIndexCurrent = this.compareIndexList[0];
            const selected = this.portfolioList.findIndex(item => item.id == +this.sourcePortfolioId);
            this.choosePortfolioByIndex(Math.max(selected, 0));
            // console.log('this.compareIndexList', this.compareIndexList);
        });
    }

    loadPlanningInvestment() {
        if (this.sourcePortfolioId > 0) {
            this.PortfolioModel
                .getPortfolioConfirm(this.clientId, this.sourcePortfolioId)
                .then(resp => {
                    let planningInvestment = resp.data.report.planning_investment;
                    if (planningInvestment) {
                        this.planningInvestment = resp.data.report.planning_investment;
                    }
                });
        }
    }


    loadIndexList() {
        this.PortfolioModel.getIndexList().then(result => {
            this.compareIndexList = result.data.available_indices.map(p => {
                return { id: p, name: p };
            });
            this.chooseCompareIndexByIndex(0);
        });
    }

    loadPortfolioData() {
        if (this.portfolioCurrent == null) return this.$q.resolve();
        return this.PortfolioModel.getAnalysisData(this.clientId, this.portfolioCurrent.id, this.startDate).then((result) => {
            this.analysisData = result.data;
            this.portfolioHistoryData = this.portfolioHistoryData.set('date', result.data.date);
            this.updateProfileChartData();
        });
    }

    loadIndexHistoryData() {
        if (this.compareIndexCurrent == null) return this.$q.resolve();
        return this.PortfolioModel.getIndexHistoryData(this.compareIndexCurrent.id, this.startDate).then((result) => {
            //  console.log('result', result);
            const data = result.data.historical_pricing[this.compareIndexCurrent.id];
            this.portfolioHistoryData = this.portfolioHistoryData.set('index', { name: this.compareIndexCurrent.name, data });
        });
    }

    selectPeriod(index) {
        if (this.currentPeriod === this.periodList[index]) return this.$q.resolve();
        this.currentPeriod = this.periodList[index];
        const today = moment();
        const startDate = today.subtract(this.currentPeriod.value, this.currentPeriod.dateType);
        this.startDate = startDate.format('YYYY-M-D');
        this.portfolioHistoryData = this.portfolioHistoryData.set('portfolio', null).set('index', null);
        return this.$q.all([this.loadPortfolioData(), this.loadIndexHistoryData()]);
    }

    updateProfileChartData() {
        this.profileChartData = {
            profileOption: this.profileOptionCurrent.id,
        };
        if (this.profileOptionCurrent.id === 'risk-profile') {
            this.profileChartData.data = this.analysisData.risk_bar;
        } else if (this.profileOptionCurrent.id === 'return-profile') {
            this.profileChartData.data = this.analysisData.annual_return_bar;
        } else if (this.profileOptionCurrent.id === 'sharp-profile') {
            this.profileChartData.data = this.analysisData.sharpe_tab;
        } else {
            this.profileChartData = null;
        }
        // console.log('this.profileChartData',this.profileChartData);
    }

    /** pageCompareState start */
    choosePortfolio() {
        const state = 'choose-portfolio';
        this.pageCompareState = this.pageCompareState === state ? null : state;
        this.hideProfileOverlay();
    }

    choosePortfolioByIndex(index) {
        this.hideCompareOverlay();
        if (this.portfolioCurrent === this.portfolioList[index]) return;
        this.portfolioCurrent = this.portfolioList[index];
        return this.loadPortfolioData();
    }

    chooseCompareIndex() {
        const state = 'choose-compare-index';
        this.pageCompareState = this.pageCompareState === state ? null : state;
        this.hideProfileOverlay();
    }

    chooseCompareIndexByIndex(index) {
        this.hideCompareOverlay();
        if (this.compareIndexCurrent === this.compareIndexList[index]) return;
        this.compareIndexCurrent = this.compareIndexList[index];
        return this.loadIndexHistoryData();
    }


    isPageCompareStateChoosePortfolio() {
        return this.pageCompareState === 'choose-portfolio';
    }

    isPageCompareStateChooseCompareIndex() {
        return this.pageCompareState === 'choose-compare-index';
    }

    hideCompareOverlay() {
        this.pageCompareState = null;
    }

    /** pageCompareState end */
    /** showProfileOverlay start */

    chooseProfileOption(index) {
        this.hideProfileOverlay();
        if (this.profileOptionCurrent === this.profileOptionList[index]) return;
        this.profileOptionCurrent = this.profileOptionList[index];
        this.updateProfileChartData();
    }

    hideProfileOverlay() {
        this.showProfileOverlay = false;
    }
    toggleProfileOptions() {
        this.showProfileOverlay = !this.showProfileOverlay;
    }

    /** showProfileOverlay end */

    handleRiskAdjustmentChanged(changed, portfolio_history, defaultState, currentState) {
        if (portfolio_history) {
            this.portfolioHistoryData = this.portfolioHistoryData.set('portfolio', { name: this.portfolioCurrent.name, data: portfolio_history });
        }

        if (changed) {
            this.portfolioCurrentState = {
                products: currentState.products,
                startDate: this.startDate,
                defaultState: {
                    return_rate: defaultState.return_rate,
                    sharpe: defaultState.sharpe,
                    annual_rt: defaultState.annual_rt,
                    draw_down_rate: defaultState.draw_down_rate,
                    volatility_rate: defaultState.volatility_rate,
                },
                currentState: {
                    return_rate: currentState.return_rate,
                    sharpe: currentState.sharpe,
                    annual_rt: currentState.annual_rt,
                    draw_down_rate: currentState.draw_down_rate,
                    volatility_rate: currentState.volatility_rate,
                }
            };
        } else {
            this.portfolioCurrentState = null;
        }
        // console.log('state', this.portfolioCurrentState);
    }

    gotoCompareView() {
        this.StateService.forward('portfolioCompare', { clientId: this.clientId, portfolioState: this.portfolioCurrentState, planningInvestment: this.planningInvestment });
    }
}

export default {
    templateUrl: 'pages/crm/portfolio-analysis.html',
    controller: Page,
}