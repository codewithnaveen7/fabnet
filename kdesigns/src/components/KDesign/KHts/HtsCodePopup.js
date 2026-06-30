/*************************************************************************
 *
 * KLEARNOW CONFIDENTIAL
 * __________________
 *
 *  Copyright (c) 2018 - 2020 KLEARNOW Corporation.
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of KLEARNOW Corporation and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to KLEARNOW Corporation
 * and its suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from KLEARNOW Corporation.
 */

import React, { Component } from "react";
import { Button } from 'primereact/button';

import _ from "lodash";
import "./HTSWidget.scss";
export default class HTSCodePopup extends Component {
  constructor() {
    super();
    this.state = {
      root: "",
      codes: [],
      nextCodes: [],
      selectedNode: null,
      selectedCodes_pg: [],
      pickedforui_sendtoparent: null,
      toggle: false,
      selectedFirst: "",
      selectedLast: "",
      show: [],
      showLast: [],
      clickedIndex: "",
      htsEllipses: true,
    };
    this.getRoot = this.getRoot.bind(this);

    this.setWrapperRef = this.setWrapperRef.bind(this);
  }

  setWrapperRef(node) {
    this.wrapperRef = node;
  }
  lastnode_GB = null;

  componentDidMount() {
    if (this.props.country === "UK") {
      this.getRoot(this.props.code.split(".").join(""));
    }
  }

  componentWillReceiveProps(nextProps) {
    // if(nextProps.code && nextProps.code.length>8){
    //   return;

    // }
    if (nextProps.code !== this.state.root) {
      this.getRoot(nextProps.code);
      return;
    }
    let useCode = this.props.code;
    if (this.props.code !== this.props.mapCode) {
      useCode = this.props.mapCode.split(".");
      useCode = useCode[0].concat(useCode[1]);
      this.getRoot(useCode);
    }
  }

  uponeLevel = () => {
    let splitroot = this.state.root.split(".");
    if (splitroot.length > 1) {
      splitroot.pop();
      this.setState({ root: splitroot.join("") });
    }
    this.getCodes();
  };
  getCodes = async () => {
    const { country } = this.props;
    const response = await this.props.getHtsTree(
      this.state.root.split(".").join("").substr(0, 6) || "",
      country == "GB" ? "UK" : country,
      Date.now()
    );
    let htsCodeLen = this.state.root.length;
    let htsCode = this.state.root;
    let selected = [
      this.state.root.substring(0, 4),
      ...(htsCodeLen > 4 ? [htsCode.substring(0, 6)] : []),
      ...(htsCodeLen > 6 ? [htsCode.substring(0, 8)] : []),
      ...(htsCodeLen > 8 ? [htsCode.substring(0, 10)] : []),
    ];

    let treehts_lk = _.get(response, "data", {});
    this.setState({
      treehts_lk: treehts_lk,
      selectedNode: treehts_lk,
      selectedCodes_pg: selected,
    });
  };
  isLeafNode = (mynode) => {
    if (!mynode) return false;
    if (mynode.htsCode.length < 6) return false;
    if (
      this.props.country === "UK" &&
      this.props.declarationTypeValue === "EX" &&
      mynode.htsCode.replace(/\./g, "").length === 8
    )
      return true;
    return !mynode.htsNodes || mynode.htsNodes.length == 0;
  };
  isCompleteCode = (code) => {
    if (!code) return false;
    let codecleaned = code.split(".").join("").trim();
    if (this.props.country !== "UK" && codecleaned.length > 10) return true;
    let firsttwo = parseInt(codecleaned.substr(0, 2));
    if (firsttwo > 97 && firsttwo < 100) {
      if (codecleaned.length === 8) return true;
    }
    if (
      this.props.country === "UK" &&
      this.props.hasOwnProperty("declarationTypeValue") === true &&
      this.props.declarationTypeValue === "EX" &&
      codecleaned.replace(/\./g, "").length > 10
    )
      return true;
    if (
      this.props.country === "UK" &&
      this.props.hasOwnProperty("declarationTypeValue") === true &&
      this.props.declarationTypeValue === "IM" &&
      codecleaned.replace(/\./g, "").length > 10
    )
      return true;

    return false;
  };

  debouncehts = null;
  getRoot = (rootCode, iconClick) => {
    let code = rootCode.replace(/[.]/g, "");
    if (!iconClick && this.isCompleteCode(code)) {
      return this.setState(
        {
          toggle: false,
        },
        this.props.hidehtspopup()
      );
    }
    clearTimeout(this.debouncehts);
    this.debouncehts = setTimeout(() => {
      if (code !== undefined) {
        //console.log('rootcode', res)
        this.setState(
          {
            root: code.trim(),
            // nextCodes: [],
            // selectedFirst: '',
            // selectedLast: '',
            // show: [],
            // showLast: [],
            // clickedIndex: '',
          },
          () => this.getCodes()
        );
      }
    }, 500);
  };
  closePane = () => {
    this.setState({ treehts_lk: null }, this.props.hidehtspopup());

    this.props.country === "UK" &&
      this.props.nextFieldTOFocus != "" &&
      document.getElementById(this.props.nextFieldTOFocus).focus();
  };

  handleHTSNodeSelectAndPossiblyClose = (e, node_xz) => {
    e.preventDefault()
    this.setState({ selectedNode: node_xz });
    setTimeout(() => {
      if (this.isLeafNode(node_xz)) {
        this.handleHTSNodeSelect({ keyCode: "13" }, node_xz);
      } else {
        if ([6, 8, 10].includes(node_xz.htsCode.replace(/\./g, "").length)) {
          // in case of non leaf node if length is 6,8,10 then instead of expand we will select and close the popup
          this.handleHTSNodeSelect({ keyCode: "13" }, node_xz);
          this.closePane();
        } else this.handleHTSNodeSelect(e, node_xz);
      }
    }, 10);
  };

  handleHTSNodeSelect = (e, node_xz) => {
    //console.log('kethrhtr: ', e.keyCode  );
    if (
      e.keyCode == "38" ||
      e.keyCode == "39" ||
      e.keyCode == "40" ||
      e.keyCode == "37" ||
      e.keyCode == "13" ||
      e.keyCode == "32" ||
      e.keyCode == "8"
    ) {
      this.handleHTSNodeKeydown(e, node_xz);
      return;
    }
    if (e.keyCode == "27") {
      //esc
      this.closePane();
    }
    if (!e.keyCode) {
      ///Onclick
      this.setState({ selectedNode: node_xz });
      if (node_xz.htsNodes) {
        if (this.state.selectedCodes_pg.indexOf(node_xz.htsCode) == -1) {
          this.setState({
            selectedCodes_pg: this.state.selectedCodes_pg.concat(
              node_xz.htsCode
            ),
          });
        } else {
          this.setState({
            selectedCode_pg: this.state.selectedCodes_pg.splice(
              this.state.selectedCodes_pg.indexOf(node_xz.htsCode),
              1
            ),
          });
        }
      }
      if (this.isLeafNode(node_xz) || node_xz.htsCode.length == 4) {
        this.props.callbackwhenChanged(node_xz.htsCode);
      }
    }
  };

  openNode_kl = (e, node_xz) => {
    var nodeindex = this.state.selectedCodes_pg.indexOf(node_xz.htsCode);

    if (nodeindex >= 0) {
      this.setState({
        selectedCode_pg: this.state.selectedCodes_pg.splice(nodeindex, 1),
      });
    } else {
      if (node_xz.htsNodes) {
        this.setState({
          selectedCodes_pg: this.state.selectedCodes_pg.concat(node_xz.htsCode),
        });
      }
    }
  };

  handleHTSNodeHighlight = (e, node_xz) => {
    this.setState({ selectedNode: node_xz });
  };
  handleHTSNodeKeydown = (e) => {
    const node_xz = this.state.selectedNode;
    if (!node_xz) node_xz = this.state.treehts_lk;
    //console.log('e,node_xz: ', e,node_xz);
    //console.log('ethrhtr: ', e.keyCode  );
    if (e.keyCode == "38") {
      //up
      this.setState({ selectedNode: node_xz.prev || node_xz });
      //   document.getElementById((node_xz.prev || node_xz)+"HTSBYID")&&document.getElementById((node_xz.prev || node_xz)+"HTSBYID").focus()
    } else if (e.keyCode == "40") {
      //down
      this.setState({ selectedNode: node_xz.next || node_xz });
      //  document.getElementById((node_xz.next || node_xz)+"HTSBYID")&&document.getElementById((node_xz.next || node_xz)+"HTSBYID").focus()
    } else if (e.keyCode == "37") {
      //left
      var nodeindex = this.state.selectedCodes_pg.indexOf(node_xz.htsCode);
      if (nodeindex >= 0) {
        if (nodeindex > 0) {
          this.setState({
            selectedCode_pg: this.state.selectedCodes_pg.splice(nodeindex, 1),
          });
        }
      } else {
        this.setState({ selectedNode: node_xz.parentnode || node_xz });
      }
    } else if (e.keyCode == "8") {
      //backspace
      this.uponeLevel();
    } else if (e.keyCode == "39") {
      //right
      var nodeindex = this.state.selectedCodes_pg.indexOf(node_xz.htsCode);
      if (nodeindex < 0 && node_xz.htsNodes) {
        this.setState({
          selectedCodes_pg: this.state.selectedCodes_pg.concat(node_xz.htsCode),
        });
      } else {
        if (node_xz.htsNodes) {
          this.setState({ selectedNode: node_xz.htsNodes[0] });
          //   document.getElementById(node_xz.htsNodes[0].htsCode+"HTSBYID")&& document.getElementById(node_xz.htsNodes[0].htsCode+"HTSBYID").focus();
        }
      }
    } else if (e.keyCode == "13" || e.keyCode == "32") {
      this.props.callbackwhenChanged(node_xz.htsCode);
      this.setState({ pickedforui_sendtoparent: node_xz });
      if (this.props.country !== "UK" && !node_xz.htsNodes) {
        // no children? You've come to a leaf. close the pane
        this.closePane();
      } else if (
        this.props.country === "UK" &&
        this.props.declarationTypeValue === "EX" &&
        node_xz.htsCode.replace(/\./g, "").length === 8
      ) {
        this.closePane();
      } else if (
        this.props.country === "UK" &&
        this.props.declarationTypeValue === "IM" &&
        node_xz.htsCode.replace(/\./g, "").length === 10
      ) {
        this.closePane();
      }
    }
    e.preventDefault && e.preventDefault();
  };

  HTSCodeWithDots = (htsCode) => {
    if (htsCode)
      return (
        htsCode.substr(0, 4) +
        (htsCode.substr(4, 2) && "." + htsCode.substr(4, 2)) +
        (htsCode.substr(6, 2) && "." + htsCode.substr(6, 2)) +
        (htsCode.substr(8, 2) && "." + htsCode.substr(8, 2))
      );
    return "";
  };

  renderOneNode = (node_xz, parentnode, depthvv) => {
    if (!node_xz || !node_xz.htsCode) return <div></div>;

    node_xz.prev = this.lastnode_GB;
    if (node_xz.prev) {
      node_xz.prev.next = node_xz;
    }
    this.lastnode_GB = node_xz;
    node_xz.parentnode = parentnode;

    return (
      <li className={"lihtslength" + node_xz.htsCode.length}>
        <a
          style={{ paddingLeft: depthvv * 16 + "px", cursor: 'pointer' }}
          id={node_xz.htsCode + "HTSBYID"}
          className={
            "htsnode " +
            (this.state.selectedNode == node_xz ? " selected " : " ") +
            (node_xz.htsNodes ? " haschildren " : " nochildren ") +
            (this.state.selectedCodes_pg.indexOf(node_xz.htsCode) >= 0
              ? " highlightedrow "
              : " ") +
            ("htslength" + node_xz.htsCode.replace(/[.]/g, "").length)
          }
          onKeyDown={(e) => {
            this.handleHTSNodeSelect(e, node_xz);
          }}

        // onDoubleClick={(e) => {

        // }}
        >
          <span>
            <span
              className={
                "htsicon pi pi-chevron-right" +
                (this.state.selectedCodes_pg.indexOf(node_xz.htsCode) >= 0
                  ? " rotated "
                  : " ")
              }
              style={{ visibility: node_xz.htsNodes ? "visible" : "hidden" }}
              onClick={(e) => {
                e.preventDefault()
                this.handleHTSNodeSelect(e, node_xz);
              }}
            />
            <Button
              className={"htsicon greencheck"}
              icon="check"
              style={{
                display:
                  node_xz == this.state.pickedforui_sendtoparent
                    ? "inline"
                    : "none",
              }}
            />
            <span
              onClick={(e) => {
                node_xz?.htsNodes ? this.handleHTSNodeSelect(e, node_xz) : this.handleHTSNodeSelectAndPossiblyClose(e, node_xz);
              }}
            >
              {node_xz.htsCode.substr(0, 4)}
              <b>{node_xz.htsCode.substr(4)}</b>
              &nbsp;&nbsp;
              {(node_xz.htsScheduleDescription &&
                node_xz.htsScheduleDescription.substring(0, 60)) ||
                ""}
            </span>
            &nbsp;&nbsp;
            {parentnode && parentnode.tariff && parentnode.tariff.usTariff && (
              <span
                onClick={(e) => {
                  this.handleHTSNodeHighlight(e, node_xz);
                }}
                style={{ color: "blue" }}
              >
                {this.state.selectedNode &&
                  this.state.selectedNode.htsCode &&
                  this.state.selectedNode.htsCode == node_xz.htsCode
                  ? "( - )"
                  : "( + )"}
              </span>
            )}
          </span>
          {this.state.selectedNode &&
            this.state.selectedNode.htsCode &&
            this.state.selectedNode.htsCode == node_xz.htsCode &&
            parentnode &&
            parentnode.tariff &&
            parentnode.tariff.usTariff && (
              <ul>
                <li className="showtariffs">
                  General Tax Rate:{" "}
                  {parentnode.tariff &&
                    parentnode.tariff.usTariff &&
                    parentnode.tariff.usTariff.generalTaxRate}
                  <br />
                  Other Tax Rate:{" "}
                  {parentnode.tariff &&
                    parentnode.tariff.usTariff &&
                    parentnode.tariff.usTariff.otherTaxRate}
                  <br />
                  Special Tax Rate:{" "}
                  {parentnode.tariff &&
                    parentnode.tariff.usTariff &&
                    parentnode.tariff.usTariff.specialTaxRate}
                  <br />
                </li>
              </ul>
            )}
        </a>
        {node_xz.htsNodes &&
          this.state.selectedCodes_pg.indexOf(node_xz.htsCode) >= 0 &&
          node_xz.htsNodes.map((onenode, iiiibi) => {
            return (
              <ul key={iiiibi}>
                {this.renderOneNode(onenode, node_xz, depthvv + 1)}
              </ul>
            );
          })}
      </li>
    );
  };
  render() {
    //console.log('this.state.treehts_lk: ', this.state.treehts_lk);
    if (!this.state.treehts_lk) return null;
    if (this.props.disabled) return null;
    return (
      <div
        tabIndex="0"
        className={"hts-popup-container-es"}
        ref={this.setWrapperRef}
      >
        <div style={{ marginBottom: "15px" }}>
          {" "}
          <b>
            {" "}
            HTS Selector codes for {this.state.root.substr(0, 4)}
            {this.state.root.substr(4, 2) && "." + this.state.root.substr(4, 2)}
            {this.state.root.substr(6, 2) && "." + this.state.root.substr(6, 2)}
            {this.state.root.substr(8, 2) &&
              "." + this.state.root.substr(8, 2)}{" "}
          </b>
          <span
            className={"htsiconclose pi pi-times-circle"}
            onClick={() => this.closePane()}
          />
          <span className="legendholder">
            ?
            <div>
              Keys:
              <br />
              <b>Left:</b> Close HTS/Go to higher HTSes
              <br />
              <b>Right:</b> Open HTS/Go to lower HTSes
              <br />
              <b>Up:</b> Navigate Upward
              <br />
              <b>Down:</b> Navigate Downward
              <br />
              <b>Enter/Spacebar:</b> Select HTS
              <br />
              <b>Esc:</b> Close pane
              <br />
              <b>Backspace:</b> Search on a more general HTS
              <br />
              <b>Single-click:</b> Focus an HTS
              <br />
              <b>Double-click:</b> Select and close
              <br />
            </div>
          </span>
        </div>
        <div className={"hts-popup-list"}>
          {this.state.root.split(".").length > 1 && (
            <span
              style={{ cursor: "pointer" }}
              title="Hotkey: backspace"
              onClick={() => this.uponeLevel()}
            >
              ..[Up one level]
            </span>
          )}
          <ul>{this.renderOneNode(this.state.treehts_lk, null, 0)}</ul>
        </div>
      </div>
    );
  }
}
