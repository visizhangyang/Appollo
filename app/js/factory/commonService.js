export default class CommonService {

  constructor() {
  }

  getMoneyUnit() {
    return 1000 * 1000;
  }

  roundMoney(value) {
    let result = value;
    if (result && /\d+\.\d{3,}/.test(result)) {
      result = parseFloat(result.toFixed(2));
    }
    return result;
  }

}

CommonService.$inject = [];

