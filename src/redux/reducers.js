import { combineReducers } from 'redux';
import storeOrder from './order/reducer';


const reducers = combineReducers({
  storeOrder,
});

export default reducers;