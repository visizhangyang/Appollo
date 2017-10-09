const ErrorDict = {
  serializer_validation_error: "提交的数据有误",
  duplicated_client: "这个电话的客户已经创建过了"
};

export default class ClientModel {
  static get $inject() {
    return ["$log", "$q", "$filter", "ApiService", "FormFactory", "UserModel", "$translate"];
  }

  constructor($log, $q, $filter, ApiService, FormFactory, UserModel, $translate) {
    this.dateParser = $filter("date");
    this.$log = $log;
    this.$q = $q;
    this.UserModel = UserModel;
    this.$translate = $translate;
    this.ApiService = ApiService;
    this.clientApi = ApiService.authApi.all("user").all("clients");
    this.errorCb = ApiService.errorMsgInterceptor(ErrorDict);

    this.clientData = {};
    this.customerFormUtil = new FormFactory({
      important: false
      // birthday:new Date(1978,0,1),
    });
    this.additionFormUtil = new FormFactory({
      status: "PRELIMINARY_COMMUNICATION",
      source: "FROM_OTHERS"
    });

    this.filters = [];
  }

  setFilters(result) {
    this.filters = result;
  }

  ready(fn) {
    return this.UserModel.onSetupReady().then(() => fn(this.clientApi));
  }

  setForm(data) {
    this.clientData = data;
  }

  setAddition(data) {
    _.assign(this.clientData, data);
  }

  fetchList(query) {
    const fn = api =>
      api.getList(query).then(resp => {
        const data = resp.data;
        return data.map(item => {
          const result = _.clone(item);
          result.status = this.transStatus(item.status);
          result.source = this.transStatus(item.transSource);
          return result;
        });
      });

    return this.ready(fn);
  }

  create(additionData) {
    this.setAddition(additionData);
    const params = this.normalizeData(this.clientData);
    const fn = api =>
      api
        .customPOST(params)
        .then(resp => {
          this.clientData = {};
          this.customerFormUtil.resetForm();
          this.additionFormUtil.resetForm();
          return resp;
        })
        .catch(this.errorCb);
    return this.ready(fn);
  }

  normalizeData(obj) {
    const data = _(obj).omit("birthday", "important").value();
    data.client_level = obj.important ? "IMPORTANT" : "COMMON";
    if (obj.birthday) {
      data.birthday = this.dateParser(obj.birthday, "yyyy-MM-dd");
    }
    return data;
  }

  get(id) {
    const fn = api => api.one(id).get();

    return this.ready(fn);
  }

  update(id, param) {
    const data = this.normalizeData(param);
    const fn = api => api.one(id).customPUT(data).catch(this.errorCb);
    return this.ready(fn);
  }

  fetchBirthdays() {
    const fn = api => api.all("birthday").getList();
    return this.ready(fn);
  }

  transStatus(status) {
    if (!status) {
      return status;
    }
    const item = _.find(this.statusOptions, opt => opt.value === status);
    if (item) {
      return this.$translate.instant(item.name);
    }
    return status;
  }

  transSource(source) {
    if (!source) {
      return source;
    }
    const item = _.find(this.sourceOptions, opt => opt.value === source);
    if (item) {
      return this.$translate.instant(item.name);
    }
    return source;
  }

  postRiskLevel(params) {
    const fn = api =>
      api.one(params.client_id).all("risk_level").customPUT(params);
    return this.ready(fn);
  }

  postAsset(params) {
    const fn = api =>
      api.one(params.client_id).all("asset_allocation").customPOST(params);
    return this.ready(fn);
  }

  fetchAsset(clientId) {
    const fn = api => api.one(clientId).all("asset_allocation").customGET();
    return this.ready(fn);
  }

  fetchProposal(clientId) {
    const fn = api => api.one(clientId).all("portfolio_proposal").customGET();
    return this.ready(fn);
  }

  postProposal(clientId, params) {
    const fn = api =>
      api.one(clientId).all("portfolio_proposal").customPOST(params);

    return this.ready(fn);
  }

  fetchBookList(clientId) {
    const api = this.ApiService.authApi.all("user").all("clients");
    const fn = () => api.one(clientId).all("all_proposal_books").customGET();
    return this.ready(fn);
  }

  postBook(params) {
    const api = this.ApiService.authApi.all("user").all("clients");
    const fn = () =>
      api.one(params.clientId).all("all_proposal_books").customPOST(params);
    return this.ready(fn);
  }

  getReportShareLink(bookId) {
    const api = this.ApiService.authApi.all("user");
    return this.UserModel
      .onSetupReady()
      .then(() => api.all("portfolio_report_share_links").one(bookId).post());
  }

  emailBook(proposal_book_id, email) {
    const api = this.ApiService.authApi.all('user/email/proposal_book/');
    const fn = () => api.customPOST({ proposal_book_id, email });
    return this.ready(fn);
  }

  get statusOptions() {
    return [
      {
        name: "common_client_status_preliminary_communication",
        value: "PRELIMINARY_COMMUNICATION"
      },
      {
        name: "common_client_status_visit",
        value: "VISIT"
      },
      {
        name: "common_client_status_definite_intention",
        value: "DEFINITE INTENTION"
      },
      {
        name: "common_client_status_sign_up",
        value: "SIGN_UP"
      }
    ];
  }

  get sourceOptions() {
    return [
      {
        name: "common_client_source_from_others",
        value: "FROM_OTHERS"
      },
      {
        name: "common_client_source_stranger_visitor",
        value: "STRANGER_VISITOR"
      },
      {
        name: "common_client_source_company",
        value: "COMPANY"
      },
      {
        name: "common_client_source_personal",
        value: "PERSONAL"
      },
      {
        name: "common_client_source_phone",
        value: "PHONE"
      },
      {
        name: "common_client_source_email",
        value: "EMAIL"
      }
    ];
  }
}
