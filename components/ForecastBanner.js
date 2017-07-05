const moment = require('moment');
const { iconCodeMapping } = require('../src/WeatherIcon');

export default ({ data }) => {
  return (
    <div>
      <h5>{`${moment.unix(data.dt).locale('zh-tw').format('dddd a h:mm')}, ${data.desc}`}</h5>
      <div className="banner-container">
        <img src={iconCodeMapping[data.icon]}></img>
        <div className="degree">{data.temp}</div>
        <div className="unit">ºC</div>
        <div style={{"flex": "1"}} />
        <div className="detail-container">
          <div className="info-text">雲量: <b>{data.clouds}%</b></div>
          <div className="info-text">濕度: <b>{data.humidity}%</b></div>
          <div className="info-text">風速: <b>{data.wind}m/s</b></div>
        </div>
      </div>
      <style jsx>{`
        .banner-container {
          display: flex;
          flex-direction: row;
        }
        .detail-container {
          display: flex;
          flex-direction: column;
        }
        .info-text {
          text-align: right;
        }
        img {
          width: 5rem;
          height: 5rem;
        }
        .degree {
          font-size: 3rem;
          margin-left: 0.5rem;
          font-weight: bold;
        }
        .unit {
          font-size: 1rem;
          margin-top: 0.7rem;
        }
      `}</style>
    </div>
  );
}