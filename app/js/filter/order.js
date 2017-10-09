
const moduleName = 'unicorn.filter.order';

export default moduleName;

function orderStatus() {
  const translation = {
    AUDITING: '已预约',
    APPROVED: '额度已分配',
    SEND_CONTRACT: '发送合同',
    UPLOADED_DEPOSIT_SKIP: '已上传打款证明',
    FUNDS_ARRIVAL: '资金到账',
    PRODUCTS_FOUNDED: '产品成立',
    PAID: '佣金发放',
    PRODUCTS_NOT_FOUNDED: '产品不成立',
    REFUNDED: '已退款',
    REJECTED: '审核未通过',
    CANCELED: '订单取消',
  };

  return (status) => translation[status] || status;
}

function couldCancel() {
  return (status) => status === 'AUDITING';
}

angular.module(moduleName, [])
  .filter('couldCancel', couldCancel)
  .filter('orderStatus', orderStatus);

