import { Chart } from "primereact/chart";
import React from "react";
import PropTypes from "prop-types";

const KChart = (props) => {
  const {
    chartType,
    chartData,
    chartOptions,
  } = props;
  return (
    <Chart type={chartType} data={chartData} options={chartOptions} />
  );
};

KChart.propTypes = {
    chartType: PropTypes.string,
    chartData: PropTypes.array,
    chartOptions: PropTypes.array,
};
export default KChart;
