import React, { Component } from "react";
import "./Cases.css";
import CaseCardUser from "../../components/CaseCard/UserCaseCard";

import { groupBy, map, clone, keys } from "lodash";
import { Spinner } from "@blueprintjs/core";

var intervalLoop = null;

const CaseList = ({ cases, history }) => {
  return map(cases, box => {
    return (
      <CaseCardUser
        onClick={e => history.push(`/opening/${box.id}/${box.offerid}`)}
        box={box}
      />
    );
  });
};

class PendingCases extends Component {
  constructor(props) {
    super();

    this.state = {
      loading: true,
      offerCases: []
    };

    intervalLoop = setInterval(this.getPendingCases.bind(this), 10000);
  }

  componentDidMount() {
    this.getPendingCases.bind(this)();
  }

  componentWillUnmount() {
    // cancel set interval
    clearInterval(intervalLoop);
  }

  getPendingCases() {
    if (!this.props.user) return;
    this.setState({ loading: true });
    this.props.callAction("getMyPendingCases").then(boxes => {
      var offerCases = groupBy(boxes, "case_site_trade_offer_id");

      offerCases = map(offerCases, (cases, key) => {
        var firstCase = cases[0];
        const currentCase = this.props.cases.find(box => {
          return box.id == parseInt(firstCase.case_id)
        })
        var box = clone(currentCase)
        box.offerid = key;
        box.name = `Order #${key}`;
        box.cases = cases;
        return box;
      });

      this.setState({
        loading: false,
        offerCases: offerCases
      });
    });
  }

  render() {
    var { history } = this.props;
    return (
      <div className="Cases-wrapper">
        <div className="Cases-header-loading">
          {this.state.loading ? (
            <Spinner className="Cases-loading" />
          ) : (
            <h1>
              You have {keys(this.state.offerCases).length} pending{" "}
              {keys(this.state.offerCases).length > 1 ? 'openings' : 'opening'}!
            </h1>
          )}
        </div>
        <div className="Cases-body">
          <CaseList cases={this.state.offerCases} history={history} />
        </div>
      </div>
    );
  }
}

export default PendingCases;
