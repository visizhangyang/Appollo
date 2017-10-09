class InsuranceCtrl {
  constructor() {
    this.insurance = this.report.insurance;
    this.cover = this.report.cover;
  }
}

const insurancetCmp = {
  templateUrl: 'component/insurance.html',
  controller: InsuranceCtrl,
  bindings: {
    report: '<',
  },
};

export default insurancetCmp;
