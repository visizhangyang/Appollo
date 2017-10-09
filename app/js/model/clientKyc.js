const ASSET_KEYS = [
  'deposit',
  'money_market_fund',
  'investment_real_estate_valuation',
  'bond',
  'bond_fund',
  'p2p',
  'trust',
  'stock',
  'equity_fund',
  'equity_linked_structured_product',
  'commodity_future',
  'commodity_linked_structured_product',
  'noble_metal',
  'hedge_fund',
  'vc_pe',
  'reit',
  'other_alternative',
  // 'personal_use_real_estate_valuation',

  'cash_asset',
  'fixed_income',
  'stock_asset',
  'alternative_asset',
];

const DEFAULT = {
  risk_planning_invest: 1000,
  planning_invest: 1000,
  risk_investment_age: 'ONE_YEAR',
  risk_level: 1,
  retirement_age: 30,
}

export default class ClientKycModel {
  static get $inject() {
    return [
      'ClientModel', '$q'
    ];
  }

  constructor(ClientModel, $q) {
    this.ClientModel = ClientModel;
    this.$q = $q;
    this.data = null;
    this.client_id = null;
  }

  initData(id) {
    this.data = null;
    let risk_level = null;
    this.client_id = id;
    return this.ClientModel.get(id).then(resp => resp.data.risk_level).then(this.initAsset.bind(this))
  }

  initAsset(risk_level) {
    return this.ClientModel.fetchAsset(this.client_id)
      .then((resp) => {
        const asset = resp.data;
        this.data = _.omit(
          asset,
          ['risk_level', 'report']
        );
        if (risk_level) {
          this.data.risk_level = risk_level;
        }
        return this.data;
      }).catch(() => {
        this.data = _.assign({}, DEFAULT);
        if (risk_level) {
          this.data.risk_level = risk_level;
        }
        return this.data;
      });
  }

  getData(id) {
    if (this.client_id == id && this.data) {
      return this.$q.resolve(this.data);
    } else {
      return this.initData(id);
    }
  }

  setData(id, data) {
    _.assign(this.data, data);
  }

  save(id, data) {
    this.setData(id, data);
    const asset = _.omitBy(_.assign({ client_id: id }, this.data), _.isNil);
    asset.risk_planning_invest = asset.planning_invest;
    if (asset.client_risk_level) {
      asset.risk_level = asset.client_risk_level;
    }
    return this.ClientModel.postAsset(asset);
  }

  getAssetValues(asset) {
    const data = _.omitBy(asset, _.isNil);
    return _.keys(data).reduce((prev, currentKey) => {
      let value = prev;
      if (ASSET_KEYS.indexOf(currentKey) > -1) {
        value += data[currentKey];
      }
      return value;
    }, 0);
  }
}
