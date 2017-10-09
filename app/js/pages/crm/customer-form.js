
class CustomerFormCtrl {
  static get $inject() {
    return [
      '$q', '$log',
      'ClientModel',
      'StateService',
    ];
  }

  constructor(
    $q, $log,
    ClientModel,
    StateService
  ) {
    this.$q = $q;
    this.$log = $log;
    this.ClientModel = ClientModel;

    this.formUtil = ClientModel.customerFormUtil;
    this.StateService = StateService;
  }

  setDefaultBirthday() {
    if (this.formUtil.data.birthday == null) {
      this.formUtil.data.birthday = new Date(1978, 0, 1);
    }
  }

  goNext($event, isValid) {
    if (!isValid) {
      this.formUtil.submitError = '请填好表单';
      return this.$q.resolve();
    }
    this.ClientModel.setForm(this.formUtil.data);
    return this.ClientModel.create({})
      // .then((resp) => this.StateService.replace('questionnaire', { id: resp.data.id }));
      .then((resp) => this.StateService.replace('kyc', { clientId: resp.data.id }));
  }
}

const options = {
  controller: CustomerFormCtrl,
  templateUrl: 'pages/crm/customer-form.html',
};
export default options;
