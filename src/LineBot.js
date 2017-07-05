const linebot = require('linebot');
const queryString = require('query-string');
const { currentGeoWeather, currentGeoWeatherForLatLon } = require('./GeoWeather');
const MessageParser = require('./MessageParser');
const { serverDomain } = require('./ServerSettings');

function replyMessage(event, message) {
  event.reply(message);
}

function replyConfirmCard(event, confirmText) {
  // altText for 電腦版 line
  event.reply({
    type: 'template',
    altText: confirmText,
    template: {
      type: 'confirm',
      text: confirmText,
      actions: [
        {
          type: 'message',
          label: 'Yes',
          text: 'yes'
        }, {
          type: 'message',
          label: 'No',
          text: 'no'
        }
      ]
    }
  });
}

function getCardTemplate(data) {
  const location = data.location.addr;
  const { temp, humidity } = data;
  const { icon, desc } = data;
  const replyMsg = `現在溫度${temp}，濕度${humidity}，天氣${desc}`;
  const queryParams = {
    lat: data.location.lat,
    lon: data.location.lon,
    location,
    dt: data.dt,
    desc,
    icon,
    temp,
    humidity,
    clouds: data.clouds,
    wind: data.wind };
  // lat=25.03&lon=121.57&location=TAIPEI&dt=1498746600&desc=clearsky&icon=02n&temp=26&humidity=66&clouds=20&wind=1
  return {
    thumbnailImageUrl: `${serverDomain}/img/${icon}?location=${location}&temp=${temp}&humidity=${humidity}&desc=${desc}`,
    title: location,
    text: replyMsg,
    actions: [
      {
        type: 'uri',
        label: '5日預報',
        uri: `${serverDomain}/Next5?${queryString.stringify(queryParams)}`
      }, {
        type: 'postback',
        label: '給糖糖',
        data: `addr=${location}&days=5`
      }
    ]
  };
}

// Reply carousel
function replyLocationWeatherCard(event, geoWeatherData) {
  if (geoWeatherData.length === 1) {
    // 1 location, use card to reply
    const location = geoWeatherData[0].location.addr;
    const {temp, humidity} = geoWeatherData[0];
    const {icon, desc} = geoWeatherData[0];
    const replyMsg = `現在溫度${temp}，濕度${humidity}，天氣${desc}`;
    let cardData = getCardTemplate(geoWeatherData[0]);
    cardData.type = 'buttons';
    event.reply({
      type: 'template',
      altText: location + ": " + replyMsg,
      template: cardData
    });
  } else {
    // Multiple locations, use carousel to reply
    const aggregateData = geoWeatherData.map(data => {
      const location = data.location.addr;
      const {temp, humidity} = data;
      const {icon, desc} = data;
      const replyMsg = `${location}現在溫度${temp}，濕度${humidity}，天氣${desc}`;

      return {replyMsg, carousel: getCardTemplate(data)};
    });

    const final = aggregateData.reduce((prev, current) => {
      prev.replyMsg += prev.replyMsg.length > 0 ? `\n${current.replyMsg}` : current.replyMsg;
      prev.carousel.push(current.carousel)
      return prev;
    }, {
      replyMsg: "",
      carousel: []
    });

    event.reply({
      type: 'template',
      altText: final.replyMsg,
      template: {
        type: 'carousel',
        columns: final.carousel
      }
    });
  }
}

const bot = linebot({channelId: process.env.channelId, channelSecret: process.env.channelSecret, channelAccessToken: process.env.channelAccessToken});

bot.on('message', function (event) {
  //console.log(event);
  if ('text' === event.message.type) {
    const msg = event.message.text;
    const parsed = MessageParser(msg);
    if ('now' === parsed.type) {
      const weatherResults = parsed
        .parsedText
        .slice(0, 3)
        .map(text => new Promise((resolve, reject) => currentGeoWeather(text, (err, res) => {
          if (res) 
            resolve(res);
          else 
            resolve(null);
          }
        )));
      Promise
        .all(weatherResults.filter(r => r != null))
        .then(results => replyLocationWeatherCard(event, results))
        .catch(err => {
          if ('ZERO_RESULTS' === err.message) {
            event.reply({type: 'text', text: '找不到這個地點，真的存在嗎？'});
          } else {
            console.log(err);
          }
        });
    } else if ('daddy' === parsed.type) {
      replyMessage(event, '丞丞的爸爸帥帥～' + String.fromCodePoint(0x100006));
    } else if ('husband of aunt' === parsed.type) {
      replyMessage(event, '芷媃的爸爸也不錯帥帥～' + String.fromCodePoint(0x100007));
    } else if ('aunt' === parsed.type) {
      replyMessage(event, '姑姑要出國去玩 討厭～' + String.fromCodePoint(0x10001D));
    }
  } else if ('location' === event.message.type) {
    const {latitude, longitude} = event.message;
    currentGeoWeatherForLatLon(latitude, longitude, (err, res) => {
      if (res) {
        console.log(res);
        replyLocationWeatherCard(event, res);
      } else {
        if ('ZERO_RESULTS' === err.message) {
          event.reply({type: 'text', text: '找不到這個地點，真的存在嗎？'});
        } else {
          console.log(err);
        }
      }
    });
  }
});

module.exports = bot.parser();
