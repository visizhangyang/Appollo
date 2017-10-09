/**
 * data structure
 * [{
 *      name:
 *      value:{
 *                   
 *      }
 * }]
 */
import * as d3 from 'd3';

export const COLORS = ['#00A1FF', '#7D7D7D', '#C9C9C9'];

class Chart {

    constructor(container, options) {
        options = options || {};
        this.container = d3.select(container);
        this.init(container, options);
    }

    init(container, options) {
        //this.width = container.clientWidth;

    }

    renderDOMStructure(products) {
        this.container.select('*').remove();
        const positiveBox = this.container.append('positive-box');
        const negativeBox = this.container.append('negative-box');
        const labelBox = this.container.append('label-box');

        // render label
        products.map(p => {
            labelBox.append('div').text(p.name);
        });

        this.productLinesList = [];

        const positiveMaxHeight = 80; //unit px
        const NegativeMaxHeight = 25; //unit px

        let hasNegative = false;

        products.map(p => {

            const positveMaxValue = Math.max(p.line1, p.line2);
            const negativeMinValue = Math.min(p.line1, p.line2);

            if (negativeMinValue < 0) hasNegative = true;

            let line1PositiveHeight = 0;
            if (p.line1 >= 0) {
                line1PositiveHeight = p.line1 > 0 ? p.line1 / positveMaxValue * positiveMaxHeight + 'px' : '1px';
            }
            let line2PositiveHeight = 0;
            if (p.line2 >= 0) {
                line2PositiveHeight = p.line2 > 0 ? p.line2 / positveMaxValue * positiveMaxHeight + 'px' : '1px';
            }
            const line1NegativeHeight = p.line1 < 0 ? p.line1 / negativeMinValue * NegativeMaxHeight + 'px' : 0;
            const line2NegativeHeight = p.line2 < 0 ? p.line2 / negativeMinValue * NegativeMaxHeight + 'px' : 0;

            const positiveLinesBox = positiveBox.append('div').attr('class', 'lines-box');
            const line1PositiveBox = positiveLinesBox.append('div').attr('class', 'line-box');
            const line2PositiveBox = positiveLinesBox.append('div').attr('class', 'line-box');
            const line1PositiveValue = line1PositiveBox.append('div').attr('class', 'line-value').text(p.line1Format(p.line1));
            const line1Positive = line1PositiveBox.append('div').attr('class', 'line1').style('height', line1PositiveHeight);
            const line2PositiveValue = line2PositiveBox.append('div').attr('class', 'line-value').text(p.line2Format(p.line2));
            const line2Positive = line2PositiveBox.append('div').attr('class', 'line2').style('height', line2PositiveHeight);

            const negativeLinesBox = negativeBox.append('div').attr('class', 'lines-box');
            const line1NegativeBox = negativeLinesBox.append('div').attr('class', 'line-box');
            const line2NegativeBox = negativeLinesBox.append('div').attr('class', 'line-box');
            const line1Negative = line1NegativeBox.append('div').attr('class', 'line1').style('height', line1NegativeHeight);
            const line2Negative = line2NegativeBox.append('div').attr('class', 'line2').style('height', line2NegativeHeight);

            // this.productLinesList.push({ line1Left, line1Positive, line1Value, line2Left, line2Positive, line2Value });
        });

        if (!hasNegative) {
            negativeBox.style('display', 'none');
        }

    }

    updateData(products) {

    }
}


export default function directive() {
    return {
        restrict: 'E',
        template: '<div class="barchart-vertial-compare"></div>',
        scope: { data: '<', },
        link: function ($scope, $el) {
            const options = {};
            const chart = new Chart($el.children()[0], options);
            chart.renderDOMStructure($scope.data);
            chart.updateData($scope.data);

            $scope.$watch('data', function (newData, oldData) {
                if (newData != oldData) {
                    chart.updateData(newData);
                }
            });
        }
    };
}


// const MOCK_DATA = [{
//     name: '福大环球001',
//     line1: -0.2,
//     line2: 0.1,
// }, {
//     name: '福大环球002',
//     line1: 0.3,
//     line2: 0.4,
// }, {
//     name: '福大环球003',
//     line1: 0.1,
//     line2: -1,
// }, {
//     name: '福大环球004',
//     line1: 0.4,
//     line2: 0.1,
// }, {
//     name: '福大环球005',
//     line1: 0.1,
//     line2: 0.2,
// }];

directive.$inject = ['$log'];