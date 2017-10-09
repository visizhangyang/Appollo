
class MoneyTextController {
  static get $inject() {
    return ['$scope'];
  }
  constructor($scope) {
    this.checked = false;
    $scope.$watch(() => this.money,
      (newV, oldV) => {
        if ((newV !== oldV) || !this.checked) {
          this.renderDecimal(newV);
        }
      }
    );
  }

  renderDecimal(money) {
    this.checked = true;
    const num = parseFloat(money);
    if (isNaN(num)) {
      this.decimalPart = '';
    } else {
      this.decimalPart = num.toFixed(2).substr(-2, 2);
    }
  }
}

const moneyTextCmp = {
  template: `
    <div class="money-text">
      <span ng-bind="$ctrl.money | number : 0" 
            class="money-int"></span><!--
   --><span class="money-dot" ng-if="$ctrl.decimalPart">.</span><!--    
   --><span class="money-decimal" 
            ng-bind="$ctrl.decimalPart"></span>
    </div>
  `,
  controller: MoneyTextController,
  bindings: {
    money: '=',
  },
};

export default moneyTextCmp;
