/* eslint-disable no-param-reassign */

/**
 * Decimal adjustment of a number.
 *
 * @param {String}  type  The type of adjustment.
 * @param {Number}  value The number.
 * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
 * @returns {Number} The adjusted value.
 */
function decimalAdjust(type, value, exp) {
  // If the exp is undefined or zero...
  if (typeof exp === 'undefined' || +exp === 0) {
    return Math[type](value);
  }
  value = +value;
  exp = +exp;
  // If the value is not a number or the exp is not an integer...
  if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
    return NaN;
  }
  // Shift
  value = value.toString().split('e');
  value = Math[type](+(`${value[0]}e${(value[1] ? (+value[1] - exp) : -exp)}`));
  // Shift back
  value = value.toString().split('e');
  return +(`${value[0]}e${(value[1] ? (+value[1] + exp) : exp)}`);
}

function round10(value, exp) {
  return decimalAdjust('round', value, exp);
}

class MoneySlideCtrl {
  static get $inject() {
    return ['TranslateFactory'];
  }

  constructor(TranslateFactory) {
    let tenK = 10 * 1000;

    this.offsetWidth = null;

    this.isAgeType = this.slideType === 'age';

    if (!this.max) {
      this.max = 20000 * tenK;
    }

    if (!this.min) {
      this.min = 0;
    }

    if (!this.step) {
      this.step = 1;
    }

    let tempUnit = 1;
    for(let i = 0; i < 10; i++) {
      if (tempUnit >= this.step) {
        this.stepLog = i;
        break;
      }

      tempUnit *= 10;
    }

    this.rangeToScale = this.rangeToScale.bind(this);

    this.scaleBoundaries = [0, 500 * tenK, 1000 * tenK, 5000 * tenK, 10000 * tenK, 20000 * tenK];
    this.scaleUnits = [10 * tenK, 50 * tenK, 100 * tenK, 500 * tenK, 1000 * tenK];
    this.scaleAmounts = [];

    const maxIndex = this.findRegionIndex(this.scaleBoundaries, this.max);
    for(let index = 0; index < maxIndex + 1; index++) {
      if (index === 0) {
        this.scaleAmounts.push(0);
      }
      else {
        let diffAmount = this.scaleBoundaries[index] - this.scaleBoundaries[index - 1];
        let count = diffAmount / this.scaleUnits[index - 1];
        let baseAmount = this.scaleAmounts[this.scaleAmounts.length - 1];
        for(let countIndex = 1; countIndex <= count; countIndex++) {
          this.scaleAmounts.push(baseAmount + this.scaleUnits[index - 1] * countIndex);
        }
      }
    }

    var translateFactory = new TranslateFactory();
    this.language = translateFactory.get$translate().preferredLanguage();
  };

  rangeToScale(range) {
    if (this.isLinear) {
      this.linearScale(range);
      return;
    }

    let amount = 0;
    if (this.scaleAmounts.length > 1) {
      amount = this.scaleAmounts[Math.round(range * (this.scaleAmounts.length - 1) / 100)];
    }

    if (this.onChange) {
      this.onChange({ value: amount });
    }
  }

  linearScale(range) {
    if (this.min === undefined) {
      this.min = 0;
    }

    const age = this.min + (this.max - this.min) * range / 100;
    if (this.onChange) {
      this.onChange({ value: round10(age, this.stepLog) });
    }
  }

  scaleToRange() {
    if (this.isLinear) {
      return this.linearRange();
    }

    const amount = this.value;
    let result = 0;

    if (amount >= this.max) {
      result = 100;
    }
    else {
      const index = this.findRegionIndex(this.scaleAmounts, amount);
      if (index > 0) {
        const gap = this.scaleAmounts[index] - this.scaleAmounts[index - 1];
        const diff = this.scaleAmounts[index] - amount;
        const resultIndex = diff * 2 <= gap ? index : index - 1;
        result = resultIndex / (this.scaleAmounts.length - 1) * 100;
      }
    }

    return result;
  }

  linearRange() {
    if (this.min === undefined) {
      this.min = 0;
    }

    return (this.value - this.min) / (this.max - this.min) * 100;
  }

  findRegionIndex(target, value) {
    let index = target.length - 1;
    while(index > 0) {
      if (value > target[index - 1]) {
        break;
      }
      index--
    }

    return index;
  }

}

const moneySlideCmp = {
  templateUrl: 'component/moneySlide.html',
  controller: MoneySlideCtrl,
  bindings: {
    min: '<',
    max: '<',
    label: '<',
    labelClass: '@',
    step: '<',
    assetNote: '<',
    onChange: '&',
    value: '<',
    slideType: '<',
    isLinear: '<',
    isRequired: '<',
  },
};

export default moneySlideCmp;
