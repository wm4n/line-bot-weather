import React from 'react';
import moment from 'moment';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Slider from 'rc-slider';
import Tooltip from 'rc-tooltip';
import ForecastBanner from './ForecastBanner';

const Handle = Slider.Handle;

class ForecastBannerTab extends React.Component {
  
  constructor(props) {
    super(props);
    const { locationText, forecast } = props;
    this.state = { locationText, forecast, tabIndex: 0 };
  }

  renderTabPanel(item) {
    return (
      <TabPanel key={`tp${item.dt}`}>
        <ForecastBanner data={item} />
      </TabPanel>
    );
  };

  renderTab(item) {
    return (
      <Tab key={`t${item.dt}`}>{moment.unix(item.dt).locale('zh-tw').format('a h:mm')}</Tab>
    );
  }

  handle(props) {
    const { value, dragging, index, ...restProps } = props;
    return (
      <Tooltip
        prefixCls="rc-slider-tooltip"
        overlay={value}
        visible={dragging}
        placement="top"
        key={index}>
        <Handle value={value} {...restProps} />
      </Tooltip>
    );
  }

  onSlided(e) {
    this.setState({tabIndex: e});
  }

  componentWillReceiveProps(nextProps) {
    const { locationText, forecast } = nextProps;
    this.setState({ locationText, forecast, tabIndex: 0 });
  }

  render() {
    const { locationText, forecast, tabIndex } = this.state;
    return (
      <div className="root">
        <h3>{locationText}</h3>
        <Tabs selectedIndex={tabIndex}
          onSelect={false}>
          {forecast.map(item => this.renderTabPanel(item))}
          <TabList style={{display: "none"}}>
            {forecast.map(item => this.renderTab(item))}
          </TabList>
        </Tabs>
        <div className="slider">
          <Slider min={0} max={forecast.length-1} value={tabIndex} handle={this.handle} onChange={e => this.onSlided(e)}/>
        </div>
        <style jsx>{`
          .root {
            display: flex;
            flex-direction: column;
            justify-content: space-around;
          }
          .slider {
            margin: 0.5rem 1rem;
          }
        `}
        </style>
      </div>
    );
  }
}
export default ForecastBannerTab;