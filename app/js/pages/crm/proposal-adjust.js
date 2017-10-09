const orderList = [
  'FIXED_INCOME', 'STOCK', 'ALTERNATIVE', 'CASH',
];

class ProposalAdjustController {
  static get $inject() {
    return [
      '$stateParams', '$scope', 'ClientModel', 'StateService', '$ionicScrollDelegate', 'PortfolioModel'
    ];
  }

  constructor(
    $stateParams, $scope, ClientModel, StateService, $ionicScrollDelegate, PortfolioModel
  ) {
    this.clientId = $stateParams.clientId;
    this.portfolioId = $stateParams.portfolioId;
    this.$scope = $scope;
    this.ClientModel = ClientModel;
    this.PortfolioModel = PortfolioModel;
    this.StateService = StateService;
    this.$ionicScrollDelegate = $ionicScrollDelegate;
    this.itemList = [];
    this.pickedCount = 0;

    this.setupHooks();
    $scope.$watch(() => this.proposal, (newV) => {
      if (newV) {
        this.groupsList = this.getOrderedKeys(newV.asset_groups)
          .map((groupName, index) => ({
            name: groupName,
            products: [],
            collapsed: index > 0
          }));
        this.groupsList.forEach((group) => {
          this.itemList.forEach((item) => {
            if (item.asset_class === group.name) {
              item.selected = true;
              group.products.push(item);
            }
          });
        });

        this.pickedCount = this.itemList.length;
      }
    });
  }

  setupHooks() {
    this.$scope.$on('$ionicView.beforeEnter', () => {
      if (this.portfolioId) {
        this.PortfolioModel.getPortfolio(this.clientId, this.portfolioId).then((resp) => this.processProposalData(resp));
      }
      else {
        this.ClientModel.fetchProposal(this.clientId).then((resp) => this.processProposalData(resp));
      }
    });
  }

  processProposalData(resp) {
    this.proposal = resp.data.report;
    this.itemList = resp.data.item_list;
  }

  getOrderedKeys(obj) {
    return _.sortBy(_.keys(obj), (k) => orderList.indexOf(k));
  }

  confirmAdjust() {
    if (this.portfolioId) {
      return this.PortfolioModel.postPortfolio(this.clientId, this.portfolioId, {
        item_list: this.getItemList(),
      })
        .then(() => {
          this.StateService.forward('portfolioPreview', { clientId: this.clientId, portfolioId: this.portfolioId });
        }, (resp) => {
          console.log(resp.data);
        });
    }
    else {
      return this.ClientModel.postProposal(this.clientId, {
        item_list: this.getItemList(),
      })
        .then(() => {
          this.StateService.forward('proposal', { id: this.clientId });
        }, (resp) => {
          console.log(resp.data);
        });
    }
  }

  onGroupSelectChange() {
    this.pickedCount = this.getItemList().length;
  }

  getItemList() {
    var itemList = [];
    if (this.groupsList) {
      this.groupsList.forEach(function (group, index) {
        group.products.forEach(function (product, index) {
          if (product.selected) {
            itemList.push({
              product: product.product,
              percentage: product.percentage
            })
          }
        });
      });
    }

    return itemList;
  }

  toggleGroup(group) {
    group.collapsed = !group.collapsed
    if (!group.collapsed) {
      this.$ionicScrollDelegate.resize();
    }
  }
}

const options = {
  controller: ProposalAdjustController,
  templateUrl: 'pages/crm/proposal-adjust.html',
};

export default options;
