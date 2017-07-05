import Head from 'next/head';
import React from 'react';
import axios from 'axios';
import ForecastBannerTab from '../components/ForecastBannerTab';
import MiniForecastCard from '../components/MiniForecastCard';
import {forecastWeather} from '../src/GeoWeather';

import {stylesheet, classNames} from './test.css'

class Next5 extends React.Component {

  constructor(props) {
    super(props);
    if(props.forecast) {
      const total = props.forecast.length, perDay = 8;
      let i, j;
      let forecastList = [];
      for (i = 0; i < total; i += perDay) {
          forecastList.push(props.forecast.slice(i, i + perDay));
      }
      this.state = { forecastIdx: 0, forecastList };
    }
    else {
      this.state = {};
    }
  }

  renderEmpty() {
    return (
      <div>
        <h3>No forecast!? Why not try again~</h3>
      </div>
    );
  }

  render() {
    const { query, forecast } = this.props;
    if(!forecast) {
      return this.renderEmpty();
    }
    const forecastList = this.state.forecastList;
    return (
      <div className="root-container">
        <Head>
          <title>{query.location}
            5日預報</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width"/>
          <style dangerouslySetInnerHTML={{__html: stylesheet}} />
        </Head>
        <div className="content-container">
          <ForecastBannerTab className=""
            locationText={query.location}
            forecast={forecastList[this.state.forecastIdx]}/>
          <div className="next5-container">
            <MiniForecastCard
              onClick={() => this.setState({forecastIdx: 0})}
              forecastList={forecastList[0]}
              isSelected={0 === this.state.forecastIdx}/>
            <MiniForecastCard
              onClick={() => this.setState({forecastIdx: 1})}
              forecastList={forecastList[1]}
              isSelected={1 === this.state.forecastIdx}/>
            <MiniForecastCard
              onClick={() => this.setState({forecastIdx: 2})}
              forecastList={forecastList[2]}
              isSelected={2 === this.state.forecastIdx}/>
            <MiniForecastCard
              onClick={() => this.setState({forecastIdx: 3})}
              forecastList={forecastList[3]}
              isSelected={3 === this.state.forecastIdx}/>
            <MiniForecastCard
              onClick={() => this.setState({forecastIdx: 4})}
              forecastList={forecastList[4]}
              isSelected={4 === this.state.forecastIdx}/>
          </div>
        </div>
        <style jsx>{`
          .root-container {
            display: flex;
            flex-direction: column;
            width: 100vw;
            height: 100vh;
          }
          .content-container {
            display: inline-block;
            margin: auto auto;
            text-align: left;
            width: 90vw;
            border: 1px solid #DDDDDD;
            box-shadow: 3px 3px 3px #AAAAAA;
            padding: 1rem 1rem;
          }
          .next5-container {
            display: flex;
            flex-direction: row;
            margin-top: 1rem;
            justify-content: space-around;
          }
          `}
        </style>
      </div>
    );
  }
}

Next5.getInitialProps = async({query}) => {
  const res = await new Promise((resolve, reject) => {
    forecastWeather({
      lat: query.lat,
      lon: query.lon
    }, (err, res) => {
      if (res) {
        resolve(res);
      }
      reject(err);
    });
  });
  if (res) {
    return {query, forecast: res};
  } else {
    return {query};
  }
}

export default Next5;
