
class QuestionnaireCtrl {
  static get $inject() {
    return [
      '$log', '$stateParams', '$scope', 'StateService',
      'FormFactory', 'UserModel', 'ClientModel',
    ];
  }

  constructor(
    $log, $stateParams, $scope, StateService,
    FormFactory, UserModel, ClientModel
  ) {
    this.$log = $log;
    this.clientId = $stateParams.id;
    if (!this.clientId) {
      StateService.back('tab.crm');
      return;
    }
    this.$scope = $scope;
    this.StateService = StateService;
    this.ClientModel = ClientModel;
    this.questionList = [];

    UserModel.fetchQuestionnaire()
      .then((result) => {
        const questions = result.data.questions;
        this.questionList = _(questions).keys().map((k) => (
          _.assign({ label: k }, questions[k])
        )).orderBy(q => q.order)
          .value();
      });
    this.UserModel = UserModel;

    this.formUtil = new FormFactory({});
    this.setupHooks();
  }


  setupHooks() {
    this.$scope.$on('$ionicView.beforeEnter', () => {
      this.ClientModel.get(this.clientId)
        .then((resp) => {
          const client = resp.data;
          if (client.questionnaire) {
            this.formUtil.data = _.pick(
              client.questionnaire,
              ['income', 'income_trend', 'age', 'value', 'risk', 'goal']
            );
          }
        });
    });
  }

  onSubmit($event, isValid) {
    if (!isValid) {
      this.formUtil.submitError = '请认真填写问卷调查';
      return null;
    }
    return this.UserModel.postQuestionnaire(
      _.assign({ client: this.clientId }, this.formUtil.data)
    )
      .then(() => {
        this.StateService.replace('risklevel', { id: this.clientId })
          .then(() => {
            this.formUtil.setInitData(this.formUtil.data);
          });
      });
  }
}

const options = {
  controller: QuestionnaireCtrl,
  templateUrl: 'pages/crm/questionnaire.html',
};

export default options;
