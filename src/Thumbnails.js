const gm = require('gm').subClass({imageMagick: true});
const NodeCache = require('node-cache');
const { iconCodeMapping } = require('./WeatherIcon');

const thumbnailCache = new NodeCache( { stdTTL: 6000, checkperiod: 0 } );
const fontPath = `${__dirname}/../font/NotoSansTC-Regular.otf`;

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

module.exports.createThumbnail = createThumbnail;