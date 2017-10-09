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
        const leftBox = this.container.append('div').attr('class', 'left-box');
        const rightBox = this.container.append('div').attr('class', 'right-box');

        // render product names
        products.map(p => {
            leftBox.append('div').attr('class', 'product-name').append('div').attr('class', 'text').text(p.name);
        });


        // render right structure

        const negativeBox = this.negativeBox = rightBox.append('div').attr('class', 'negative-box');
        const positiveBox = rightBox.append('div').attr('class', 'positive-box');
        this.positiveBoxWidth = positiveBox.node().offsetWidth;

        // render positive data line

        this.productLinesList = [];

        products.map(p => {
            const leftLinesBox = negativeBox.append('div').attr('class', 'lines-box');
            const rightLinesBox = positiveBox.append('div').attr('class', 'lines-box');
            const line1LeftBox = leftLinesBox.append('div').attr('class', 'line-box');
            const line1RightBox = rightLinesBox.append('div').attr('class', 'line-box');
            const line2LeftBox = leftLinesBox.append('div').attr('class', 'line-box');
            const line2RightBox = rightLinesBox.append('div').attr('class', 'line-box');
            const line1Left = line1LeftBox.append('div').attr('class', 'line1-left');
            const line1Right = line1RightBox.append('div').attr('class', 'line1-right');
            const line1Value = line1RightBox.append('div').attr('class', 'line-value');
            const line2Left = line2LeftBox.append('div').attr('class', 'line2-left');
            const line2Right = line2RightBox.append('div').attr('class', 'line2-right');
            const line2Value = line2RightBox.append('div').attr('class', 'line-value');
            this.productLinesList.push({ line1Left, line1Right, line1Value, line2Left, line2Right, line2Value });
        });

    }

    updateData(products) {
        const line1RightMaxValue = Math.max(d3.max(products, p => p.line1), 0);
        const line2RightMaxValue = Math.max(d3.max(products, p => p.line2), 0);
        const rightMaxValue = Math.max(line1RightMaxValue, line2RightMaxValue);

        products.map((product, index) => {
            const { line1Left, line1Right, line1Value, line2Left, line2Right, line2Value } = this.productLinesList[index];
            const line1LeftWidth = product.line1 < 0 ? product.line1 * (-100) + '%' : 0;
            const line1RightWidth = product.line1 === 0 ? '1px' : product.line1 > 0 ? product.line1 / rightMaxValue * 100 + '%' : 0;
            const line2LeftWidth = product.line2 < 0 ? product.line2 * (-100) + '%' : 0;
            const line2RightWidth = product.line2 === 0 ? '1px' : product.line2 > 0 ? product.line2 / rightMaxValue * 100 + '%' : 0;
            line1Left.style('width', line1LeftWidth);
            line1Right.style('width', line1RightWidth);
            line1Value.text(products.line1Format(product.line1));
            line2Left.style('width', line2LeftWidth);
            line2Right.style('width', line2RightWidth);
            line2Value.text(Math.round(product.line2 * 100) + '%');
        });
    }

    updateUI(negative) {
        this.negativeBox.style('flex', negative ? 1 : 0);
    }
}


export default function directive() {
    return {
        restrict: 'E',
        template: '<div class="risk-adjustment-chart"></div>',
        scope: { data: '<', negative: '<' },
        link: function($scope, $el) {
            const options = {};
            const chart = new Chart($el.children()[0], options);
            chart.renderDOMStructure($scope.data);
            chart.updateUI($scope.negative);
            chart.updateData($scope.data);

            $scope.$watch('data', function(newData, oldData) {
                if (newData != oldData) {
                    chart.updateData(newData);
                }
            });

            $scope.$watch('negative', function(newData, oldData) {
                if (newData != oldData) {
                    chart.updateUI(newData);
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