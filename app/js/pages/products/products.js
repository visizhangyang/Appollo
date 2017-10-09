import productDetailState from './product-detail';
// import productOrderState from './product-order';
import productNewState from './product-new';
import productNewDoneState from './product-new-done';
import productNewFormState from './product-new-form';
// import attachmentsState from './attachments';
import ordersState from './orders';
import quickNewState from './product-quick-new';
import selectClientState from './select-client';

import productModule from './product-search';

function productsConfig($stateProvider) {
  $stateProvider
    .state(productNewState.name, productNewState.options)
    .state(ordersState.name, ordersState.options)
    // .state(attachmentsState.name, attachmentsState.options)
    .state(productDetailState.name, productDetailState.options)
    // .state(productOrderState.name, productOrderState.options)
    .state(productNewFormState.name, productNewFormState.options)
    .state(selectClientState.name, selectClientState.options)
    .state(quickNewState.name, quickNewState.options)
    .state(productNewDoneState.name, productNewDoneState.options);
}
productsConfig.$inject = ['$stateProvider'];

const moduleName = 'unicorn.products';
angular.module(moduleName, [productModule])
  .config(productsConfig);

export default moduleName;
