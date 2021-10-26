import { STORE_ORDER,TICKER_RESPONSE } from "../actions";

export const storeOrder = (payload) => ({
  type: STORE_ORDER,
  payload
})
export const OrderResponse = (payload) => ({ 
  type: TICKER_RESPONSE, payload 
})
