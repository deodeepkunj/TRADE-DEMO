
import React, { useEffect, useState, Fragment } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import numberWithCommas from "../contexts/custom"

// reactstrap components
import {
  Button,
  ButtonGroup,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Row,
  Col,
} from "reactstrap";
import styled from "styled-components"
import { storeOrder, OrderResponse } from "../redux/order/action"

function Dashboard(props) {
  const [scale, setScale] = useState(1.0)
  const dispatch = useDispatch();
  const { connectionStatus, order, ticker } = useSelector(state => {
    return state.storeOrder;
  })
  let bids = order ? order.bids : '';
  let asks = order ? order.asks : '';
  console.log("bids", bids)
  const newTicker = [0, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]
  const [CHANNEL_ID, [BID, BID_SIZE, ASK, ASK_SIZE, DAILY_CHANGE, DAILY_CHANGE_PERC, LAST_PRICE, VOLUME, HIGH, LOW]] = Array.isArray(ticker) && ticker.length ? ticker : newTicker
  const [connectionStatuss, setConnectionStatus] = useState(true)
  const connectSocket = () => !connectionStatus && dispatch(storeOrder({ connectionStatus: true, callback }));
  const disconnectSocket = () => connectionStatus && dispatch(storeOrder({ connectionStatus: false, callback }));
  const callback = (data) => {
    dispatch(OrderResponse({ ...data }))
  }
  useEffect(() => {
    dispatch(storeOrder({ connectionStatus, callback }))
  }, [connectionStatus])
  const _bids = bids && Object.keys(bids).slice(0, 21).reduce((acc, k, i) => {
    const total = Object.keys(bids).slice(0, i + 1).reduce((t, i) => {
      t = t + bids[i].amount
      return t
    }, 0)
    const item = bids[k]
    acc[k] = { ...item, total }
    return acc
  }, {})
  const maxBidsTotal = Object.keys(_bids).reduce((t, i) => {
    if (t < _bids[i].total) {
      return _bids[i].total
    }
    else {
      return t
    }
  }, 0)
  const _asks = asks && Object.keys(asks).slice(0, 21).reduce((acc, k, i) => {
    const total = Object.keys(asks).slice(0, i + 1).reduce((t, i) => {
      t = t + asks[i].amount
      return t
    }, 0)
    const item = asks[k]
    acc[k] = { ...item, total }
    return acc
  }, {})
  const maxAsksTotal = Object.keys(_asks).reduce((t, i) => {
    if (t < _asks[i].total) {
      return _asks[i].total
    }
    else {
      return t
    }
  }, 0)

  return (
    <>

      <div className="content">
        <Row>
          <Col lg="8" md="8">
            <Card>
              <CardHeader>
                <Row>
                  <Col className="text-left" sm="6">
                    <CardTitle tag="h4"><strong>ORDER BOOK</strong></CardTitle>
                  </Col>
                  <Col sm="6">
                    {!connectionStatus &&
                      <Button
                        tag="label"
                        className="btn-simple"
                        color="info"
                        id="0"
                        size="sm"
                        onClick={connectSocket}
                        style={{ float: "right" }}
                      >
                        <span className="d-sm-block d-md-block d-lg-block d-xl-block">
                          Connect
                        </span>
                        {/* <span className="d-block d-sm-none">
                          <i className="tim-icons icon-single-02" />
                        </span> */}
                      </Button>
                    }
                    {connectionStatus &&
                      <Button
                        tag="label"
                        className="btn-simple"
                        color="info"
                        id="0"
                        size="sm"
                        onClick={disconnectSocket}
                        style={{ float: "right" }}
                      >
                        <span className="d-sm-block d-md-block d-lg-block d-xl-block">
                          Disconnect
                        </span>
                        {/* <span className="d-block d-sm-none">
                          <i className="tim-icons icon-single-02" />
                        </span> */}
                      </Button>
                    }
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <TableContainer style={{
                  overflow: "overlay"
                }}>
                  <Side>
                    <thead className="text-primary">
                      <tr className="text-center text-success">
                        <th>COUNT</th>
                        <th>AMOUNT</th>
                        <th>TOTAL</th>
                        <th>PRICE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {_bids && Object.keys(_bids).map((k, i) => {
                        const item = _bids[k]
                        const { cnt, amount, price, total } = item
                        const percentage = ((total * 100) / (maxBidsTotal * scale))
                        return (
                          <tr className="text-center" style={{
                            backgroundImage: `linear-gradient(to left, #314432 ${percentage}%, #27293d 0%)`
                          }}>
                            <td>{cnt}</td>
                            <td>{amount.toFixed(2)}</td>
                            <td>{total.toFixed(2)}</td>
                            <td>{numberWithCommas(price)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </Side>
                  <Side>
                    <thead className="text-success">
                      <tr className="text-center">
                        <th>PRICE</th>
                        <th>TOTAL</th>
                        <th>AMOUNT</th>
                        <th>COUNT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {_asks && Object.keys(_asks).map((k, i) => {
                        const item = _asks[k]
                        const { cnt, amount, price, total } = item
                        const percentage = (total * 100) / (maxAsksTotal * scale)
                        return (
                          <tr className="text-center" style={{
                            backgroundImage: `linear-gradient(to right, #402c33 ${percentage}%, #27293d 0%)`
                          }}>
                            <td>{numberWithCommas(price)}</td>
                            <td>{total.toFixed(2)}</td>
                            <td>{amount.toFixed(2)}</td>
                            <td>{cnt}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </Side>
                </TableContainer>
              </CardBody>
            </Card>
          </Col>
          <Col md="4">
            <Card>
              <CardBody>
                <div className="d-flex">
                  <h3 style={{ width: "50%"}} className="mb-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="25" fill="currentColor" class="bi bi-currency-bitcoin" viewBox="0 0 16 16">
                      <path d="M5.5 13v1.25c0 .138.112.25.25.25h1a.25.25 0 0 0 .25-.25V13h.5v1.25c0 .138.112.25.25.25h1a.25.25 0 0 0 .25-.25V13h.084c1.992 0 3.416-1.033 3.416-2.82 0-1.502-1.007-2.323-2.186-2.44v-.088c.97-.242 1.683-.974 1.683-2.19C11.997 3.93 10.847 3 9.092 3H9V1.75a.25.25 0 0 0-.25-.25h-1a.25.25 0 0 0-.25.25V3h-.573V1.75a.25.25 0 0 0-.25-.25H5.75a.25.25 0 0 0-.25.25V3l-1.998.011a.25.25 0 0 0-.25.25v.989c0 .137.11.25.248.25l.755-.005a.75.75 0 0 1 .745.75v5.505a.75.75 0 0 1-.75.75l-.748.011a.25.25 0 0 0-.25.25v1c0 .138.112.25.25.25L5.5 13zm1.427-8.513h1.719c.906 0 1.438.498 1.438 1.312 0 .871-.575 1.362-1.877 1.362h-1.28V4.487zm0 4.051h1.84c1.137 0 1.756.58 1.756 1.524 0 .953-.626 1.45-2.158 1.45H6.927V8.539z" />
                    </svg>
                    <u>
                      BTC/USD
                    </u>
                  </h3>
                  <div style={{ width: "50%", float: "right"}} className="mb-0">
                  {Array.isArray(ticker) && ticker.length &&
                    <h4>{LAST_PRICE && numberWithCommas(LAST_PRICE.toFixed(1))}</h4>
                  }
                  </div>
                </div>
                <div className="d-flex">
                  {Array.isArray(ticker) && ticker.length &&
                    <Fragment>
                      <div style={{width: "50%"}}>
                        <p>VOL {VOLUME && numberWithCommas(VOLUME.toFixed(2))} USD</p>
                        <p>Low {LOW && numberWithCommas(LOW.toFixed(1))}</p>
                      </div>
                      <div style={{width: "50%"}}>
                        <p style={{
                          color: DAILY_CHANGE_PERC < 0 ? `red` : 'green'
                        }}>
                          {DAILY_CHANGE && numberWithCommas(DAILY_CHANGE.toFixed(2))}
                          {DAILY_CHANGE_PERC < 0 ?
                            <svg  className="ml-1 mr-1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-up-fill" viewBox="0 0 16 16">
                              <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z" />
                            </svg>
                            :
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-down-fill" viewBox="0 0 16 16">
                              <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                            </svg>
                          }
                           ({DAILY_CHANGE_PERC}%)
                        </p>
                        <p>High {HIGH && numberWithCommas(HIGH.toFixed(1))}</p>
                      </div>
                    </Fragment>
                  }
                </div>
              </CardBody>

            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export const TableContainer = styled.div`
  display:flex;
  flex-basis:100%;
  flex-flow:row nowrap;
`;
export const Side = styled.table`
border-spacing:0px;
flex-basis:50%;
width:calc(50% - 2px);
box-sizing:border-box;
margin:0px 1px;
thead {
  td {
    text-transform:uppercase;
    font-size:12px;
    color:#aaa!important;
  }
}
`;

export default Dashboard;
