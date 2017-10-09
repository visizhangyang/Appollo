/** copy from ./proposal-cmp */

const orderList = [
    'FIXED_INCOME', 'STOCK', 'ALTERNATIVE', 'CASH',
];

const MODE = {
    'money': 'money',
    'percentage': 'percentage',
}

class Controller {


    static get $inject() {
        return ['$scope', 'TranslateFactory'];
    }

    constructor($scope, TranslateFactory) {
        this.type = 'default';
        this.data = null;
        this.mode = MODE.money;
        var translateFactory = new TranslateFactory();
        this.language = translateFactory.get$translate().preferredLanguage();
    }

    $onInit() {
    }

    $onChanges(changesObj) {
        if (changesObj.data && changesObj.data.currentValue) {
            this.data = changesObj.data.currentValue;
        }
    }

    changeMode(v, $event) {
        if (this.mode != v) {
            this.mode = v;
        }
        $event.stopPropagation();
    }
}

const BarChartCmp = {
    templateUrl: 'component/barchart-cmp.html',
    controller: Controller,
    bindings: {
        data: '<',
        type: '@'
    },
};

export default BarChartCmp;
