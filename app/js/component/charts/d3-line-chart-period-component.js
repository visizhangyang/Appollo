import moment from 'moment';

const PERIOD_LIST = [
    { label: '六个月', dateType: 'months', value: 6 },
    { label: '近一年', dateType: 'years', value: 1 },
    { label: '近三年', dateType: 'years', value: 3 },
    { label: '近五年', dateType: 'years', value: 5 },
];

class Controller {

    $onInit() {
        this.periodList = PERIOD_LIST;
        this.currentPeriod = null;
        this.legend = null;
        this.buildChartData();
    }

    $onChanges() {
        this.buildChartData();
    }

    buildChartData() {
        const { date, portfolio, index } = this.originData.toJS();
        if (date == null || portfolio == null || index == null) return;

        const products = [{
            name: portfolio.name,
            data: portfolio.data,
            color: '#00A1FF',
        }, {
            name: index.name,
            data: index.data,
            color: '#7D7D7D',
        }];

        this.data = {
            date,
            products,
        };
    }

    selectPeriod(index) {
        this.currentPeriod = this.periodList[index];
        const today = moment();
        const fromDate = today.subtract(this.currentPeriod.value, this.currentPeriod.dateType);
        this.updateData(fromDate.valueOf());
    }

    updateData(from) {
        const index = _.findIndex(this.originData.date, d => d >= from);

        function getNewProductData({ name, data }) {
            return {
                name,
                data: data.slice(index),
            };
        }

        this.data = {
            date: this.originData.date.slice(index),
            products: this.originData.products.map(getNewProductData),
        };

        // console.log('newData', newData);
    }


}

export default {
    templateUrl: 'component/charts/d3-line-chart-period-component.html',
    controller: Controller,
    bindings: {
        originData: '<data',
    },
};