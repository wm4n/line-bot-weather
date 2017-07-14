const gm = require('gm').subClass({imageMagick: true});
const NodeCache = require('node-cache');
const { iconCodeMapping } = require('./WeatherIcon');
const unsplashJs = require('unsplash-js');
const Unsplash = unsplashJs.default;
const toJson = unsplashJs.toJson;
const axios = require('axios');
require('es6-promise').polyfill();
require('isomorphic-fetch');

const fs = require('fs');

const thumbnailCache = new NodeCache( { stdTTL: 3600 } );
const fontPath = `${__dirname}/../font/NotoSansTC-Regular.otf`;

const unsplash = new Unsplash({
  applicationId: process.env.Unsplash_applicationId,
  secret: process.env.Unsplash_secret,
  callbackUrl: process.env.Unsplash_callbackUrl
});

const imageMapCache = new NodeCache( { stdTTL: 3600 } );

function getImageMap() {
  try {
    return imageMapCache.get('data', true);
  } catch(err) {
    console.log('imageMapCache - key not found');
  }
}

function createImageMap() {
  return new Promise((resolve, reject) => {
    try{
      resolve(imageMapCache.get('data', true));
    } catch(err) {
      // key not found
      // use unsplash to get a random photo for background
      unsplash.photos.getRandomPhoto({width:1040, height:1040})
        .then(toJson)
        .then(json => {
          const url = json.urls.custom;
          const name = json.user.name;
          const htmlLink = json.user.links.html;
          // download the image
          axios.get(url, { responseType: 'stream' })
              .then(res => {
                gm(res.data)
                  //.resize(1040, 1040) // probably not require if unsplash guarantee to return fixed image dimension
                  .modulate(50)
                  .font(fontPath, 40)
                  .stroke('#DDDDDD', 1)
                  .fill('#DDDDDD')
                  .drawText(90, 90, '使用說明:')
                  .drawText(90, 250, '輸入 > "丞丞 [地點]"')
                  .drawText(90, 450, '輸入 > "丞丞 單位"')
                  .fontSize(28)
                  .drawText(90, 300, '可以輸入最多三個 [地點] (請點我試試)')
                  .drawText(90, 500, '切換英制或公制 (請點我試試)')
                  .drawText(90, 950, `Photo by ${name} from Unsplash`)
                  .drawText(90, 1000, `${htmlLink}`)
                  .stroke('#DDDDDD', 3)
                  .drawLine(50, 170, 1000, 170)
                  .drawLine(50, 365, 1000, 365)
                  .drawLine(50, 575, 1000, 575)
                  /// For testing, output to a file a see the result directly
                  // .write(`${__dirname}/../random2_mod.png`, err => {
                  //   if(err) console.log(err);
                  //   else console.log('okay');
                  // });
                  .toBuffer('PNG', function (err, buffer) {
                    if (err) reject(err);
                    imageMapCache.set('data', {buffer, htmlLink});
                    resolve({buffer, htmlLink});
                  });
              });
        })
        .catch(err => reject(err));
    }
  });
}

// For testing
//createImageMap();

function createThumbnail(iconCode, bgColor, location, temp, humidity, desc, unit) {
  return new Promise((resolve, reject) => {
      const fixtemp = Math.round(temp);
      const key = `${iconCode}_${location}_${fixtemp}_${humidity}_${desc}`;
      thumbnailCache.get(key, (err, value) => {
          if( err ) {
              reject(value);
          }
          else {
              if(value == undefined) {
                const unitText = 'metric' === unit ? 'ºC' : 'ºF';
                  gm(384, 256)
                      .in('gradient:#56ccf2-#2f80ed')
                      .font(fontPath, 24)
                      .fill('#333333')
                      .stroke('#111111', 1)
                      .drawText(110, 90, `${location}`)
                      .stroke('#333333', 0.5)
                      .drawText(110, 130, `現在溫度${fixtemp}${unitText}，濕度${humidity}%`)
                      .drawText(110, 160, `室外天氣是${desc}`)
                      .toBuffer('PNG', function (err, buffer) {
                          if (err) { console.log(err); reject(err); }
                          gm(buffer)
                              .composite(iconCodeMapping[iconCode])
                              .geometry('+20+80')
                              .toBuffer('PNG', function (err, buffer) {
                                  if(err) reject(err);
                                  resolve(buffer);
                              });
                              // .write('public/img/gradient_new.png', err => {
                              //     if(err) console.log(err);
                              //     else console.log('okay');
                              // });
                      });
              }
              else {
                  console.log(key, 'cache found');
                  resolve(value);
              }
          }
      });
  });
}

// For test
//createThumbnail("01d", '#5e99f3', 'Melbourne', 22, 90, '小雨');

module.exports.createImageMap = createImageMap;
module.exports.createThumbnail = createThumbnail;
module.exports.getImageMap = getImageMap;