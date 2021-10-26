import {
  STORE_ORDER,
  TICKER_RESPONSE
} from "../actions";

const INIT_STATE = {
  connectionStatus: true,
  storeOrder: {
    bids: {}
    , asks: {}
    , psnap: {}
    , mcnt: 0
  },
  ticker: [],
  // trades: []
}

export default (state = INIT_STATE, action) => {
  switch (action.type) {
    case STORE_ORDER:
      {
        // console.log("check action", action);
        return { ...state,connectionStatus: action.payload.connectionStatus}
      }
      case TICKER_RESPONSE:
        {
          console.log("reducer response =>  ", action.payload)
          return { ...state, ...action.payload }
        }
    default: return { ...state };
  }
}