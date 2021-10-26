import { all } from 'redux-saga/effects';
import storeOrderSaga from './order/saga';

export default function* rootSaga(getState) {
  yield all([
    storeOrderSaga(),
  ]);
}
