export default class Portfolio {
  static get $inject() {
    return ["ApiService", "UserModel"];
  }

  constructor(ApiService, UserModel) {
    this.UserModel = UserModel;
    this.analysisApi = ApiService.authApi.all("v1/aa/user");
    this.kycApi = ApiService.authApi.all("user");
  }

  getAnalysisData(client_id, portfolio_id, startDate) {
    return this.UserModel
      .onSetupReady()
      .then(() =>
        this.analysisApi
          .one("clients", client_id)
          .all("attribute_analysis")
          .customGET(portfolio_id, { start_date: startDate })
      );
  }

  getUserPortfolioList(client_id) {
    return this.UserModel
      .onSetupReady()
      .then(() =>
        this.analysisApi
          .one("clients", client_id)
          .all("attribute_analysis")
          .customGET()
      );
  }

  getIndexList() {
    return this.UserModel
      .onSetupReady()
      .then(() =>
        this.analysisApi.all("historical_pricing_indices").customGET()
      );
  }

  getIndexHistoryData(index, startDate) {
    return this.UserModel
      .onSetupReady()
      .then(() =>
        this.analysisApi
          .all("historical_pricing")
          .customGET(null, { indices: index, start_date: startDate })
      );
  }

  savePortfolio(client_id, item_list, start_date, end_date, planningInvestment = 1000000) {
    return this.UserModel.onSetupReady().then(() =>
      this.analysisApi
        .one("clients", client_id)
        .all("attribute_analysis")
        .post({
          item_list,
          planning_invest: 1000000,
          start_date,
          end_date
        })
    );
  }

  getPortfolio(client_id, portfolio_id) {
    return this.UserModel
      .onSetupReady()
      .then(() =>
        this.kycApi
          .one("clients", client_id)
          .all("portfolio_proposals")
          .customGET(portfolio_id)
      );
  }

  postPortfolio(client_id, portfolio_id, item_list) {
    return this.UserModel
      .onSetupReady()
      .then(() =>
        this.kycApi
          .one("clients", client_id)
          .one("portfolio_proposals", portfolio_id)
          .customPOST(item_list)
      );
  }

  postBook(clientId, portfolioId) {
    return this.UserModel
      .onSetupReady()
      .then(() =>
        this.kycApi
          .one("clients", clientId)
          .all("all_proposal_books")
          .customPOST({ portfolio_id: portfolioId })
      );
  }

  getPortfolioList(clientId) {
    return this.UserModel
      .onSetupReady()
      .then(() =>
        this.kycApi
          .one("clients", clientId)
          .all("portfolioconfirms")
          .customGET()
      );
  }

  getPortfolioConfirm(clientId, portfolioId) {
    return this.UserModel
      .onSetupReady()
      .then(() =>
        this.kycApi
          .one("clients", clientId)
          .all("portfolioconfirms")
          .customGET(portfolioId)
      );
  }
}
