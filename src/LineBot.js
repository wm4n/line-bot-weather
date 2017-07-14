const linebot = require('linebot');
const queryString = require('query-string');
const { currentGeoWeather, currentGeoWeatherForLatLon } = require('./GeoWeather');
const MessageParser = require('./MessageParser');
const { serverDomain } = require('./ServerSettings');
const UserConfig = require('./database/UserConfig');
const { createImageMap } = require('./Thumbnails');

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

function replyCustomConfirmCard(event, customOptions) {
  // altText for 電腦版 line
  event.reply({
    type: 'template',
    altText: customOptions.confirmText,
    template: {
      type: 'confirm',
      text: customOptions.confirmText,
      actions: [
        {
          type: 'message',
          label: customOptions.label1,
          text: customOptions.text1
        }, {
          type: 'message',
          label: customOptions.label2,
          text: customOptions.text2
        }
      ]
    }
  });
}

function getCardTemplate(data) {
  const location = data.location.addr;
  const { temp, humidity } = data;
  const { icon, desc, unit } = data;
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
    wind: data.wind,
    unit };
  // lat=25.03&lon=121.57&location=TAIPEI&dt=1498746600&desc=clearsky&icon=02n&temp=26&humidity=66&clouds=20&wind=1
  const thumbnailParam = { 
    location,
    temp,
    humidity,
    desc,
    unit
  };
  return {
    thumbnailImageUrl: `${serverDomain}/img/${icon}?${queryString.stringify(thumbnailParam)}` ,
    title: location,
    text: replyMsg,
    actions: [
      {
        type: 'uri',
        label: '5日預報',
        uri: `${serverDomain}/Next5?${queryString.stringify(queryParams)}`
      }
    ]
  };
}

// Reply carousel
function replyLocationWeatherCard(event, geoWeatherData, unit) {
  const unitText = 'metric' === unit ? 'ºC' : 'ºF';
  if (geoWeatherData.length === 1) {
    // 1 location, use card to reply
    const location = geoWeatherData[0].location.addr;
    const {temp, humidity} = geoWeatherData[0];
    const {icon, desc} = geoWeatherData[0];
    const replyMsg = `現在溫度${temp}${unitText}，濕度${humidity}%，天氣${desc}`;
    let cardData = getCardTemplate(geoWeatherData[0]);
    cardData.type = 'buttons';
    console.log(cardData);
    event.reply({
      type: 'template',
      altText: location + ": " + replyMsg,
      template: cardData
    });
  } else {
    // Multiple locations, use carousel to reply
    console.log('geoWeatherMap: ' + JSON.stringify(geoWeatherData));
    const aggregateData = geoWeatherData.map(data => {
      const location = data.location.addr;
      const {temp, humidity} = data;
      const {icon, desc} = data;
      const replyMsg = `${location}現在溫度${temp}${unitText}，濕度${humidity}%，天氣${desc}`;

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

function replyImageMap(event) {
  createImageMap()
    .then(res => {
      console.log(res.htmlLink);
      event.reply({
        type: 'imagemap',
        baseUrl: `${serverDomain}/guide/${Date.now()}`,
        altText: '使用說明:\n輸入 > "丞丞 [地點]"\n輸入 > "丞丞 單位"',
        baseSize: {
          height: 1040,
          width: 1040
        },
        actions: [
          {
            type: 'message',
            text: '丞丞 台北市',
            area: {
              x: 0,
              y: 170,
              width: 1040,
              height: 195
            }
          },
          {
            type: 'message',
            text: '丞丞 單位',
            area: {
              x: 0,
              y: 365,
              width: 1040,
              height: 195
            }
          },
          {
            type: 'uri',
            linkUri: `${res.htmlLink}`,
            area: {
              x: 0,
              y: 950,
              width: 1040,
              height: 90
            }
          }
        ]
      });
    })
    .catch(err => console.log(err));
}

const bot = linebot({channelId: process.env.channelId, channelSecret: process.env.channelSecret, channelAccessToken: process.env.channelAccessToken});

bot.on('message', function (event) {
  //console.log(event);
  if ('text' === event.message.type) {
    const msg = event.message.text;
    const parsed = MessageParser(msg);
    if ('now' === parsed.type) {
      event.source.profile().then(profile => {
        UserConfig.findById(profile.userId,
          (err, res) => {
            if(err) throw err;
            let tempUnitPref;
            if(res) tempUnitPref = res.tempUnitPref;
            const weatherResults = parsed
              .parsedText
              .slice(0, 3)
              .map(text => new Promise((resolve, reject) => currentGeoWeather(text, tempUnitPref, (err, res) => {
                if (res) 
                  resolve(res);
                else 
                  resolve(null);
                }
              )));
            Promise
              .all(weatherResults.filter(r => r != null))
              .then(results => replyLocationWeatherCard(event, results, tempUnitPref))
              .catch(err => {
                if ('ZERO_RESULTS' === err.message) {
                  event.reply({type: 'text', text: '找不到這個地點，真的存在嗎？'});
                } else {
                  console.log(err);
                }
              });    
          });
      });
    }
    else if('unit' === parsed.type) {
      replyCustomConfirmCard(event, {
        confirmText: '要設定溫度單位嗎？\n請選擇：',
        label1: '公制(ºC)',
        text1: '公制(ºC)',
        label2: '英制(ºF)',
        text2: '英制(ºF)'
      });
    }
    else if('set-unit' === parsed.type) {
      event.source.profile().then(profile => {
        replyMessage(event, `${profile.displayName} 已將你的單位設為 ${msg} 了喔～` + String.fromCodePoint(0x100090));
        UserConfig.findByIdAndUpdate(profile.userId,
          { $set: {tempUnitPref: parsed.to} },
          { upsert: true },
          (err, res) => {
            if(err) throw err;
            else console.log(`Update tempUnitPref to ${parsed.to} for ${profile.displayName}`);
          });
      }).catch(err => {
          console.log('Getting profile for changing unit failed! ', err);
      });
    }
    else if('help' === parsed.type) {
      replyImageMap(event);
    }
  } else if ('location' === event.message.type) {
    event.source.profile().then(profile => {
        UserConfig.findById(profile.userId,
          (err, res) =>{
            if(err) throw err;
            let tempUnitPref;
            if(res) tempUnitPref = res.tempUnitPref;
            const {latitude, longitude} = event.message;
            currentGeoWeatherForLatLon(latitude, longitude, tempUnitPref, (err, res) => {
              if (res) {
                console.log([res]);
                replyLocationWeatherCard(event, [ res ], tempUnitPref);
              } else {
                if ('ZERO_RESULTS' === err.message) {
                  event.reply({type: 'text', text: '找不到這個地點，真的存在嗎？'});
                } else {
                  console.log(err);
                }
              }
            });
          });
    });
  }
});

module.exports = bot.parser();
