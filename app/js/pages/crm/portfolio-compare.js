import moment from 'moment';
import { Map, List } from 'immutable';
import IonicPage from '../ionic-page';

class Page extends IonicPage {

    static get $inject() {
        return ['$scope', '$q', '$stateParams', 'ClientModel', 'PortfolioModel', 'StateService'];
    }

    constructor($scope, $q, $stateParams, ClientModel, PortfolioModel, StateService) {
        super($scope);
        this.$q = $q;
        this.ClientModel = ClientModel;
        this.clientId = $stateParams.clientId;

        this.PortfolioModel = PortfolioModel;
        this.StateService = StateService;

        const portfolioState = $stateParams.portfolioState;
        this.planningInvestment = $stateParams.planningInvestment;
        this.products = portfolioState.products;
        this.startDate = portfolioState.startDate;
        this.barchartData = {
            currentPortfolio: portfolioState.defaultState,
            changedPortfolio: portfolioState.currentState,
        }
    }

    willEnter() {

    }

    didEnter() {

    }


    save() {
        if (this.products == null) return;

        let products = [];
        let sum = 0;
        for(let i = 0; i < this.products.length; i++) {
          let p = this.products[i];
          let amount ;

          if (i < this.products.length - 1) {
            amount = Math.round(p.percentage * this.planningInvestment / 10000) * 10000;
          }
          else {
            amount = this.planningInvestment - sum;
          }

          sum += amount;

          products.push({
            product: p.id,
            percentage: p.percentage,
            amount: amount
          });
        }

        const today = moment().format('YYYY-M-D');
        return this.PortfolioModel.savePortfolio(this.clientId, products, this.startDate, today, this.planningInvestment).then((resp) => {
            this.gotoPreviewPage(resp.data.id);
        }).catch(() => {

        });
    }

    gotoPreviewPage(portfolio_id) {
        this.StateService.forward('portfolioPreview', { clientId: this.clientId, portfolioId: portfolio_id });
    }
}

export default {
    templateUrl: 'pages/crm/portfolio-compare.html',
    controller: Page,
    params: {
        portfolioState: null,
        planningInvestment: 1000 * 10000

    }
}
