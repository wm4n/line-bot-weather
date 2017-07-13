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
  applicationId: "c769ed155e1518f71dfb51902e8f9a933a9a885aa824c44acc2ad2ca859f37c9",
  secret: "d5ef96c93119f9e03c70d05498b31bd4829f0c33cf245d8e8a829a3aa1e3842c",
  callbackUrl: "urn:ietf:wg:oauth:2.0:oob"
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
    // gm(256, 384)
    //     .in("gradient:#b6fbff-#83a4d4")
    //     .font("/System/Library/Fonts/Arial Unicode.ttf", 30)
    //     .fill('#333333')
    //     .drawText(50, 150, text)
    //     .toBuffer('PNG', function (err, buffer) {
    //         if (err) {
    //             console.log(err);
    //             return;
    //         }
    //         gm(buffer)
    //             .composite('public/img/09d.png')
    //             .geometry('+50+50')
    //             .write('public/img/gradient_new.png', err => {
    //                 if(err) console.log(err);
    //                 else console.log('okay');
    //             });
    //     });

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
                                  //console.log('ok');
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
      // === For Test ===
      // gm(384, 256)
      //     .in('gradient:#56ccf2-#2f80ed')
      //     .font(fontPath, 24)
      //     .fill('#333333')
      //     .stroke('#111111', 1)
      //     .drawText(110, 90, `${location}`)
      //     .stroke('#333333', 0)
      //     .drawText(110, 130, `現在溫度${temp}℃，濕度${humidity}%`)
      //     .drawText(110, 160, `室外天氣是${desc}`)
      //     .toBuffer('PNG', function (err, buffer) {
      //         if (err) {
      //             console.log(err);
      //             return;
      //         }
      //         gm(buffer)
      //             .composite('assets/weather_icon_set/mostlysunny.png')
      //             .geometry('+20+80')
      //             // .write('public/img/gradient_new.png', err => {
      //             //     if(err) {
      //             //         console.log(err);
      //             //         reject(err);
      //             //     }
      //             //     else {
      //             //         console.log('okay');
      //             //         resolve();
      //             //     }
      //             // });
      //             .toBuffer('PNG', function (err, buffer) {
      //                 if(err) reject(err);
      //                 resolve(buffer);
      //             });
      //     });
      
  });
}

//createThumbnail("01d", '#5e99f3', 'Melbourne', 22, 90, '小雨');
module.exports.createImageMap = createImageMap;
module.exports.createThumbnail = createThumbnail;
module.exports.getImageMap = getImageMap;