import { call, fork, put, take, takeLatest} from "redux-saga/effects";
import { STORE_ORDER,TICKER_RESPONSE } from '../actions';
import { eventChannel, END } from 'redux-saga';
import {
  OrderResponse
} from "../actions";
import _ from "lodash";
import CRC from "crc-32";
const conf = {
  wshost: 'ws://api.bitfinex.com/ws/2'
}
const BOOK = {}
let connected = false
let connecting = false
let cli;




function connectSocket(payload) {
  return eventChannel(emitter => { 
    let seq = null
    let channels = {}
    let BOOK = {};

    const { connectionStatus, callback } = payload;
    if (!connecting && !connected) cli = new WebSocket(conf.wshost, "protocolOne");
    if (!connectionStatus) {
      cli.close();
       emitter(END)
    }
    if (connecting || connected) {
       emitter(END)
    }

    connecting = true
    cli.onopen = function open() {
      connecting = false
      connected = true;
      BOOK.bids = {}
      BOOK.asks = {}
      BOOK.psnap = {}
      BOOK.mcnt = 0
      cli.send(JSON.stringify({ event: 'conf', flags: 65536 + 131072 }))
      cli.send(JSON.stringify({ event: 'subscribe', channel: 'book', symbol: 'tBTCUSD', prec: "P0", len: 25, freq: 'F0' }))
      cli.send(JSON.stringify({ event: 'subscribe', channel: 'ticker', symbol: 'tBTCUSD' }))
      return emitter({ type: TICKER_RESPONSE, payload: { connectionStatus: true } })
    }
    cli.onclose = function open() {
      seq = null
      connecting = false
      connected = false
     emitter({ type: TICKER_RESPONSE, payload: { connectionStatus: false } })
    }

    cli.onmessage = function (message_event) {
      var msg = message_event.data;
      console.log(msg);
      msg = JSON.parse(msg)
      if (msg.event === "subscribed") {
        channels[msg.channel] = msg.chanId;
      }

      if (msg.event) {
        emitter({ type: TICKER_RESPONSE, payload: {} })
        return
      }

      if (msg[0] === channels["trades"] && (Array.isArray(msg[1]) || (msg[1] === 'te' && Array.isArray(msg[2])))) {
        callback({ trades: msg })
        return  emitter({ type: TICKER_RESPONSE, payload: { trades: msg } })
      }

      if (msg[0] === channels["ticker"] && Array.isArray(msg[1])) {
        callback({ ticker: msg })
        return emitter({ type: TICKER_RESPONSE, payload: { ticker: msg } })
      }

      if (msg[0] === channels["book"]) {
        if (msg[1] === 'hb') {
          seq = +msg[2]
         return
        } else if (msg[1] === 'cs') {
          seq = +msg[3]
          let checksum = msg[2]
          let csdata = []
          let bids_keys = BOOK.psnap['bids']
          let asks_keys = BOOK.psnap['asks']
          for (let i = 0; i < 25; i++) {
            if (bids_keys[i]) {
              let price = bids_keys[i]
              let pp = BOOK.bids[price]
              csdata.push(pp.price, pp.amount)
            }
            if (asks_keys[i]) {
              let price = asks_keys[i]
              let pp = BOOK.asks[price]
              csdata.push(pp.price, -pp.amount)
            }
          }
          let cs_str = csdata.join(':')
          let cs_calc = CRC.str(cs_str)
         return
        }

        if (BOOK.mcnt === 0) {
          _.each(msg[1], function (pp) {
            pp = { price: pp[0], cnt: pp[1], amount: pp[2] }
            let side = pp.amount >= 0 ? 'bids' : 'asks'
            pp.amount = Math.abs(pp.amount)
            if (BOOK[side][pp.price]) {
            }
            BOOK[side][pp.price] = pp
          })
        } else {
          let cseq = +msg[2]
          msg = msg[1]
          if (!seq) {
            seq = cseq - 1
          }
          seq = cseq
          let pp = { price: msg[0], cnt: msg[1], amount: msg[2] }
          if (!pp.cnt) {
            let found = true
            if (pp.amount > 0) {
              if (BOOK['bids'][pp.price]) {
                delete BOOK['bids'][pp.price]
              } else {
                found = false
              }
            } else if (pp.amount < 0) {
              if (BOOK['asks'][pp.price]) {
                delete BOOK['asks'][pp.price]
              } else {
                found = false
              }
            }
            if (!found) {
            }
          } else {
            let side = pp.amount >= 0 ? 'bids' : 'asks'
            pp.amount = Math.abs(pp.amount)
            BOOK[side][pp.price] = pp
          }
        }

        _.each(['bids', 'asks'], function (side) {
          let sbook = BOOK[side]
          let bprices = Object.keys(sbook)
          let prices = bprices.sort(function (a, b) {
            if (side === 'bids') {
              return +a >= +b ? -1 : 1
            } else {
              return +a <= +b ? -1 : 1
            }
          })
          BOOK.psnap[side] = prices
        })

        BOOK.mcnt++
        callback({ order: BOOK })
      }
    }
  })
}


function* initializeSocket({ payload }) {
  try {
    const response = yield call(connectSocket, payload);
    console.log("response", response)
    while (true) {
      let action = yield take(response);
      console.log("action returned", action)
      yield put(action);
    }
  }
  catch (e) {
    console.log("error", e)
    yield put(OrderResponse({}))
  }
}


export function* watchInitializeSocket() {
  yield takeLatest(STORE_ORDER, initializeSocket);
}

export default function* rootSaga() {
  yield fork(watchInitializeSocket);
}