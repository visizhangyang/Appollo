const RATIO_MAP = {
    'risk-profile': 'riskRatio',
    'return-profile': 'returnRatio',
    'sharp-profile': 'sharpRatio',
}

class Controller {

    static get $inject() {
         return ['$scope', 'TranslateFactory','CommonService'];
    }

    constructor($scope,TranslateFactory,CommonService) {
        this.moneyUnit = CommonService.getMoneyUnit();
        const translateFactory = new TranslateFactory();
        this.$tanslate = translateFactory.get$translate();
        this.language = this.$tanslate.preferredLanguage();
    }

    $onInit() {
        this.line1Label = this.$tanslate.instant('comparison_before_adjustment');
        this.line2Label = this.$tanslate.instant('comparison_after_adjustment');
        this.chartData = null;
        this.buildBaseData();
        this.buildChartData();
        const MOCK_DATA = [{
            name: this.$tanslate.instant('comparison_historical_return'),
            line1: -0.1,
            line2: -0.14,
            line1Format: percentFormat,
            line2Format: percentFormat,
        }, {
            name: this.$tanslate.instant('comparison_volatility'),
            line1: 0.1,
            line2: 0.14,
            line1Format: percentFormat,
            line2Format: percentFormat,
        }, {
            name: this.$tanslate.instant('comparison_max_drawdown'),
            line1: 0.16,
            line2: 0.14,
            line1Format: percentFormat,
            line2Format: percentFormat,
        }, {
            name: this.$tanslate.instant('comparison_opt_sharpe_ratio'),
            line1: 1.12,
            line2: 1.33,
            line1Format: numberFormat,
            line2Format: numberFormat,
        }];
    }

    buildBaseData() {

    }


    $onChanges() {
        // console.log('$onChanges', props);
        this.buildBaseData();
        this.buildChartData();
    }

    buildChartData() {
        if (this.data == null) return;
        const {
            currentPortfolio,
            changedPortfolio,
        } = this.data;
        this.chartData = [{
            name: this.$tanslate.instant('comparison_historical_return'),
            line1: currentPortfolio.return_rate,
            line2: changedPortfolio.return_rate,
            line1Format: percentFormat,
            line2Format: percentFormat,
        }, {
            name: this.$tanslate.instant('comparison_volatility'),
            line1: currentPortfolio.volatility_rate,
            line2: changedPortfolio.volatility_rate,
            line1Format: percentFormat,
            line2Format: percentFormat,
        }, {
            name: this.$tanslate.instant('comparison_max_drawdown'),
            line1: currentPortfolio.draw_down_rate,
            line2: changedPortfolio.draw_down_rate,
            line1Format: percentFormat,
            line2Format: percentFormat,
        }, {
            name: this.$tanslate.instant('comparison_opt_sharpe_ratio'),
            line1: currentPortfolio.sharpe,
            line2: changedPortfolio.sharpe,
            line1Format: numberFormat,
            line2Format: numberFormat,
        }];
    }
}

function toFixed(number, digits) {
    return parseFloat(number.toFixed(digits));
}

function percentFormat(v) {
    return Math.round(v * 100) + '%';
}

function numberFormat(v) {
    return (+v).toFixed(2);
}


export default {
    templateUrl: 'component/charts/barchart-vertial-compare-component.html',
    controller: Controller,
    bindings: {
        data: '<data',
    },
};


// name: '福大环球005',
// percentage: 0.1,
// returnRatio: 0.3,
// riskRatio: 0.5,
// sharpRatio: 0.3,