const _ = require("lodash");
const axios = require("axios");
const WeatherCode = require("./WeatherCode.json");

const HEWEATHER_KEY = process.env.heweather_key;

const DEFAULT_CITY = "台北";

// function getTemperature(city) {
//     return new Promise((resolve, reject) => {
//         axios.get("https://free-api.heweather.com/v5/now", {
//                 params: {
//                     city: city,
//                     key: HEWEATHER_KEY 
//                 }
//             })
//             .then(res => {
//                 const resultList = res.data["HeWeather5"];
//                 if(resultList.length == 1) {
//                     const tmp = resultList[0].now.tmp;
//                     const fl = resultList[0].now.fl;
//                     resolve(`${city} 現在 ${tmp} 度，體感溫度 ${fl} 度～`);
//                 }
//                 else if(resultList.length > 1) {
//                     resolve(resultList.reduce((acc, value) => {
//                         const country = value.basic.cnty;
//                         const tmp = value.now.tmp;
//                         const fl = value.now.fl;
//                         if(acc.length > 0) {
//                             return `${acc}\n${city}(${country}) 現在 ${tmp} 度，體感溫度 ${fl} 度 ~`
//                         }
//                         else {
//                             return `${city}(${country}) 現在 ${tmp} 度，體感溫度 ${fl} 度 ~`;
//                         }
//                     }, ""));
//                 }
//             })
//             .catch(err => {
//                 console.log(err);
//                 resolve("丞丞..不懂...地方 (◕〝◕) ");
//             })
//     });
// }

// function getWeather(city) {
//     return new Promise((resolve, reject) => {
//         axios.get("https://free-api.heweather.com/v5/now", {
//                 params: {
//                     city: city,
//                     key: HEWEATHER_KEY 
//                 }
//             })
//             .then(res => {
//                 const resultList = res.data["HeWeather5"];
//                 if(resultList.length == 1) {
//                     const tmp = resultList[0].now.tmp;
//                     const fl = resultList[0].now.fl;
//                     const hum = resultList[0].now.hum;
//                     const code = resultList[0].now.cond.code;
//                     //resolve(`${city} 現在 ${tmp} 度，體感溫度 ${fl} 度，濕度 ${hum}%～\n天氣是 ${weatherCode[code].zhtw}`);
//                     const feel = FL_REPLY.find(item => fl <= item.max && fl >= item.min).reply;
//                     const weather = weatherCode[code].reply === undefined ? `天氣是 ${weatherCode[code].zhtw}` : weatherCode[code].reply;
//                     resolve(`拔拔～${city} 現在 ${tmp} 度，${feel}，濕度 ${hum}%～\n${weather}`);
//                 }
//                 else if(resultList.length > 1) {
//                     resolve(resultList.reduce((acc, value) => {
//                         const country = value.basic.cnty;
//                         const tmp = value.now.tmp;
//                         const fl = value.now.fl;
//                         const hum = value.now.hum;
//                         const code = value.now.cond.code;
//                         const feel = FL_REPLY.find(item => fl <= item.max && fl >= item.min).reply;
//                         const weather = weatherCode[code].reply === undefined ? `天氣是 ${weatherCode[code].zhtw}` : weatherCode[code].reply;
//                         if(acc.length > 0) {
//                             return `${acc}\n${city}(${country}) 現在 ${tmp} 度，${feel}，濕度 ${hum}%～\n${weather}`
//                         }
//                         else {
//                             return `${city}(${country}) 現在 ${tmp} 度，${feel}，濕度 ${hum}%～\n${weather}`;
//                         }
//                     }, ""));
//                 }
//             })
//             .catch(err => {
//                 console.log(err);
//                 resolve("丞丞..不懂...地方 (◕〝◕) ");
//             })
//     });
// }

function now(city, template) {
    return new Promise((resolve, reject) => {
        axios.get("https://free-api.heweather.com/v5/now", {
                params: {
                    city: city,
                    key: HEWEATHER_KEY 
                }
            })
            .then(res => {
                const resultList = res.data["HeWeather5"];
                if(resultList.length == 1) {
                    // const tmp = resultList[0].now.tmp;
                    // const fl = resultList[0].now.fl;
                    // const hum = resultList[0].now.hum;
                    // const code = resultList[0].now.cond.code;
                    resolve(template(resultList[0], city));
                }
                else if(resultList.length > 1) {
                    resolve(resultList.reduce((acc, value) => {
                        // const country = value.basic.cnty;
                        // const tmp = value.now.tmp;
                        // const fl = value.now.fl;
                        // const hum = value.now.hum;
                        // const code = value.now.cond.code;
                        if(acc.length > 0) {
                            return `${acc}\n${template(value, city, value.basic.cnty)}`;
                        }
                        else {
                            return template(value, city, value.basic.cnty);
                        }
                    }, ""));
                }
            })
            .catch(err => {
                console.log(err);
                resolve("找不到這個城市");
            })
    });
}

const PARSER = [
    {
        // Just asking for weather, reply the default city
        // https://regex101.com/r/NvHCRP/2
        reg: /^(天氣|氣象|氣候|Weather){1,}/im,
        reply: now,
        city: DEFAULT_CITY,
        template: (r, city, country) =>
            `${city}${undefined === country ? "" : `(${country}`} 現在 ${r.now.tmp} 度，體感溫度 ${r.now.fl} 度，濕度 ${r.now.hum}%～\n天氣是 ${WeatherCode[r.now.cond.code].zhtw}`
    },
    // {
    //     // https://regex101.com/r/UbspfJ/2
    //     reg: /(.*?){1}(的|現在|現在的|今天)?(溫度|幾度){1,}?/im,
    //     reply: getTemperature,
    //     expectIndex: 1
    // },
    // {
    //     // https://regex101.com/r/RIkKmM/2
    //     reg: /(.*?){1}(的|現在|現在的|今天)?(天氣|氣象|氣候){1,}?/im,
    //     reply: getWeather,
    //     expectIndex: 1
    // }
];

function resolve(message) {
    for(let i = 0; i < PARSER.length; i ++) {
        const result = PARSER[i].reg.exec(message);
        console.log(result);
        if(null !== result) {
            // We have a match here
            PARSER[i].reply(PARSER[i].city, PARSER[i].template);
            // if(null === PARSER[i].expectIndex) {
            //     // Match the whole string will do
            //     return PARSER[i].reply;
            // }
            // else {
            //     if("function" === typeof(PARSER[i].reply) ) {
            //         // we want a specified portion of the string
            //         // (using regexp and expect index value)
            //         if( '' === result[PARSER[i].expectIndex] ||
            //             null === result[PARSER[i].expectIndex]) {
            //             // the expected field is empty, use default city
            //             return PARSER[i].reply(DEFAULT_CITY);
            //         }
            //         else {
            //             // use the parsed city
            //             return PARSER[i].reply(result[PARSER[i].expectIndex]);
            //         }
            //     }
            //     else {
            //         return PARSER[i].reply;
            //     }
            // }
        }
    }
    return null;
}

module.exports.resolve = resolve;
