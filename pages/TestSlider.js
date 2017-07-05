import '../node_modules/rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import Head from 'next/head';
import React from 'react';
import ReactDOM from 'react-dom';
import Tooltip from 'rc-tooltip';
import Slider from 'rc-slider';

const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Range = createSliderWithTooltip(Slider.Range);
const Handle = Slider.Handle;

const handle = (props) => {
  const { value, dragging, index, ...restProps } = props;
  return (
    <Tooltip
      prefixCls="rc-slider-tooltip"
      overlay={value}
      visible={dragging}
      placement="top"
      key={index}
    >
      <Handle value={value} {...restProps} />
    </Tooltip>
  );
};

const wrapperStyle = { width: 400, margin: 50 };
export default () => {
  //console.log(JSON.stringify(stylesheetSlider, null, 2));

  return (
  <div>

    <div style={wrapperStyle}>
      <p>Slider with custom handle</p>
      <Slider min={0} max={20} defaultValue={3} handle={handle} />
    </div>
    <div style={wrapperStyle}>
      <p>Range with custom handle</p>
      <Range min={0} max={20} defaultValue={[3, 10]} tipFormatter={value => `${value}%`} />
    </div>
  </div>
  );
}