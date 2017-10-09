import productFilter from './product';
import orderFilter from './order';
import translate from './translate';


const moduleName = 'unicorn.filter';

angular.module(moduleName, [productFilter, orderFilter, translate]);

export default moduleName;
