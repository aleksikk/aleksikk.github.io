import React, { Component } from 'react'
import './CaseOverview.css'
import ItemCard from '../../components/ItemCard/ItemCard'
import utils from '../../libs/utils'
import { sortBy, sumBy, map, maxBy, clone } from 'lodash'
import CountUp from 'react-countup'
import { Button, Intent, Classes } from '@blueprintjs/core'
import OpenCase from '../../components/OpenCaseModal'
import LazyComponent from 'react-component-lazy'
import ClassNames from 'classnames'

class CaseOverview extends Component {
  constructor(props) {
    super()

    const currentCase = props.boxes.find(box => {
      return box.id == parseInt(props.match.params.boxid)
    })

    var box = clone(currentCase)
    box.items = sortBy(box.items, 'suggested_price').reverse()
    var stats = props.stats.allTime.cases[box.id] || {
      opened: 0,
      totalValue: 0,
    }
    stats.bestUnboxed = stats.items ? maxBy(stats.items.name, 'totalValue') : 0
    this.state = {
      isOpen: false,
      selectedBox: {},
      stats: stats,
      box,
    }
  }

  openDialog() {
    this.setState({ isOpen: true })
  }

  closeDialog() {
    this.setState({ isOpen: false })
  }

  sendKeyRequest(caseid, amount) {
    return this.props
      .callAction('createCaseOpenOffer', {
        caseid,
        amount,
      })
      .then(offer => {
        if (!offer) return
        this.props.AppToaster.show({
          action: {
            href: offer.url,
            target: '_blank',
            text: <strong>View Offer</strong>,
          },
          intent: 'success',
          message: `Successfully created offer!`,
          timeout: 30 * 1000,
        })
        this.props.history.push(`/pending`)
        this.closeDialog()
      })
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.state !== nextState
  }

  render() {
    return (
      <div className="CaseOverview-wrapper">
        <div className="CaseOverview-header">
          <div className="CaseOverview-header-content">
            <span className="CaseOverview-details-caseName">
              {this.state.box.name}
            </span>
            <div className="CaseOverview-seperator" />
            <div className="CaseOverview-summary">
              <div className="CaseOverview-caseImage">
                <img
                  src={this.state.box.image['300px']}
                  alt={this.state.box.name}
                />
                <div className="CaseOverview-buy">
                  <OpenCase
                    isOpen={this.state.isOpen}
                    handleClose={this.closeDialog.bind(this)}
                    box={this.state.box}
                    buyCases={this.sendKeyRequest.bind(this)}
                  />
                  <Button
                    disabled={this.state.box.remaining_opens === 0}
                    className="CaseOverview-buyButton"
                    large={true}
                    intent={Intent.PRIMARY}
                    text="PURCHASE THIS CASE"
                    icon="bank-account"
                    onClick={e => {
                      this.openDialog()
                    }}
                  />
                </div>
              </div>

              <div className="CaseOverview-details">
                <div
                  className={ClassNames(Classes.CARD, 'CaseOverview-details')}
                  style={{ color: 'white', background: '#182026' }}
                >
                  <span className="CaseOverview-details-caseValue">
                    <b>Best Item:</b> {this.state.box.bestItem.name}
                  </span>
                  <span className="CaseOverview-details-caseValue">
                    <b>Worst Item:</b> {this.state.box.worstItem.name}
                  </span>
                  <span className="CaseOverview-details-caseValue">
                    <b>Times Opened:</b>{' '}
                    {this.state.stats.opened.toLocaleString()} /{' '}
                    {this.state.box.max_opens.toLocaleString()}
                  </span>
                  <span className="CaseOverview-details-caseValue">
                    <b>Total Rewarded:</b>{' '}
                    <CountUp
                      prefix="$"
                      separator=","
                      decimals={2}
                      end={this.state.stats.totalValue}
                    />
                  </span>
                  <span className="CaseOverview-details-caseValue">
                    <b>Average ROI:</b>{' '}
                    <CountUp
                      prefix="$"
                      separator=","
                      decimals={2}
                      end={
                        this.state.stats.totalValue / this.state.stats.opened
                      }
                    />
                  </span>
                  <div className="CaseOverview-details-itemstats">
                    <div className="CaseOverview-details-itemstat">
                      <h4>Odds of Item Type</h4>
                      {this.state.stats.items
                        ? map(this.state.stats.items.type, (stat, key) => {
                            return (
                              <div key={key}>
                                <b> {key}: </b>
                                <CountUp
                                  decimals={2}
                                  end={
                                    (stat.opened / this.state.stats.opened) *
                                    100
                                  }
                                />
                                %
                              </div>
                            )
                          })
                        : null}
                    </div>
                    <div className="CaseOverview-details-itemstat">
                      <h4>Odds of Item Rarity</h4>
                      {this.state.stats.items
                        ? map(this.state.stats.items.rarity, (stat, key) => {
                            return (
                              <div key={key}>
                                <b> {key}: </b>
                                <CountUp
                                  decimals={2}
                                  end={
                                    (stat.opened / this.state.stats.opened) *
                                    100
                                  }
                                />
                                %
                              </div>
                            )
                          })
                        : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="CaseOverview-seperator" />
          </div>
        </div>
        <div className="CaseOverview-body">
          <div className="CaseOverview-body-title">
            This case contains {this.state.box.items.length} items valued at{' '}
            <CountUp
              prefix="$"
              separator=","
              decimals={2}
              end={sumBy(this.state.box.items, 'suggested_price') / 100}
            />
          </div>
          <div className="CaseOverview-body-caseItems">
            {this.state.box.items.map((item, key) => {
              item = utils.processItem(item)
              if (item.condition) {
                if (item.condition !== 'Factory New') return
                delete item.condition
              }

              return (
                <LazyComponent key={item.id}>
                  <ItemCard {...item} />
                </LazyComponent>
              )
            })}
          </div>
        </div>
      </div>
    )
  }
}

export default CaseOverview
