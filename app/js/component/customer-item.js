
class CustomerItemCtrl {
  static get $inject() {
    return [];
  }

  getOrderStatus() {
    if (this.client.dealt_orders_count > 1) {
      return '多次成交';
    } else if (this.client.dealt_orders_count === 1) {
      return '已成交';
    }
    return '未成交';
  }
}

const customerItemCmp = {
  templateUrl: 'component/customer-item.html',
  controller: CustomerItemCtrl,
  bindings: {
    client: '<',
    preview: '<',
  },
};

export default customerItemCmp;
