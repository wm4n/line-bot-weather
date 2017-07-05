const moment = require('moment');
const { iconCodeMapping } = require('../src/WeatherIcon');

export default ({ onClick, forecastList, isSelected }) => {
  if(forecastList !== undefined && forecastList.length > 0) {
    const first = forecastList[0];
    const maxAndMin = forecastList.reduce((acc, current) => {
      if(current.temp_max > acc.max) {
        acc.max = current.temp_max;
      }
      if(current.temp_min < acc.min) {
        acc.min = current.temp_min;
      }
      return acc;
    }, {max: Number.MIN_VALUE, min: Number.MAX_VALUE});
    return (
      <div onClick={onClick} className={isSelected ? "selected" : ""}>
        <p>{moment.unix(first.dt).locale('zh-tw').format('dddd')}</p>
        <img src={iconCodeMapping[first.icon]}/>
        <p>{maxAndMin.max}&deg;C</p>
        <p>{maxAndMin.min}&deg;C</p>
        <style jsx>{`
          div {
            display: flex;
            flex-direction: column;
            cursor: pointer;
            padding: 0.5rem 0.5rem;
          }
          .selected {
            border: 1px solid #DDDDDD;
            background: #F9F9F9;
          }
          p, img {
            text-align: center;
            line-height: normal;
          }
          img {
            width: 3rem;
            height: 3rem;
          }
        `}</style>
      </div>
    );
  }
  return <div></div>;
}