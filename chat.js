const _ = require("lodash");
const axios = require("axios");
const weatherCode = require("./code.json");

const HEWEATHER_KEY = process.env.heweather_key;

const REPLY_AGE = ["1歲2個月～(◡‿◡)", "1歲快3個月了～ (◕‿◕) "];
const REPLY_UNKNOWN = ["巴拔？", "麻媽？", "爸爸帥帥" ];
const FL_REPLY = [ { max: 100, min: 30, reply: "好熱好熱.."},
                   { max: 29, min: 26, reply: "暖暖地～"},
                   { max: 25, min: 20, reply: "舒舒服服的溫度～"},
                   { max: 19, min: 15, reply: "涼涼喔"},
                   { max: 14, min: 8, reply: "冷冷地喔～"},
                   { max: 7, min: 1, reply: "太冷了不要出門喔～"},
                   { max: 0, min: -100, reply: "zzzZZZ (丞丞躲在被窩中)"}];
const DEFAULT_CITY = "台北";

function getTemperature(city) {
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
                    const tmp = resultList[0].now.tmp;
                    const fl = resultList[0].now.fl;
                    resolve(`${city} 現在 ${tmp} 度，體感溫度 ${fl} 度～`);
                }
                else if(resultList.length > 1) {
                    resolve(resultList.reduce((acc, value) => {
                        const country = value.basic.cnty;
                        const tmp = value.now.tmp;
                        const fl = value.now.fl;
                        if(acc.length > 0) {
                            return `${acc}\n${city}(${country}) 現在 ${tmp} 度，體感溫度 ${fl} 度 ~`
                        }
                        else {
                            return `${city}(${country}) 現在 ${tmp} 度，體感溫度 ${fl} 度 ~`;
                        }
                    }, ""));
                }
            })
            .catch(err => {
                console.log(err);
                resolve("丞丞..不懂...地方 (◕〝◕) ");
            })
    });
}

function getWeather(city) {
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
                    const tmp = resultList[0].now.tmp;
                    const fl = resultList[0].now.fl;
                    const hum = resultList[0].now.hum;
                    const code = resultList[0].now.cond.code;
                    //resolve(`${city} 現在 ${tmp} 度，體感溫度 ${fl} 度，濕度 ${hum}%～\n天氣是 ${weatherCode[code].zhtw}`);
                    const feel = FL_REPLY.find(item => fl <= item.max && fl >= item.min).reply;
                    const weather = weatherCode[code].reply === undefined ? `天氣是 ${weatherCode[code].zhtw}` : weatherCode[code].reply;
                    resolve(`拔拔～${city} 現在 ${tmp} 度，${feel}，濕度 ${hum}%～\n${weather}`);
                }
                else if(resultList.length > 1) {
                    resolve(resultList.reduce((acc, value) => {
                        const country = value.basic.cnty;
                        const tmp = value.now.tmp;
                        const fl = value.now.fl;
                        const hum = value.now.hum;
                        const code = value.now.cond.code;
                        const feel = FL_REPLY.find(item => fl <= item.max && fl >= item.min).reply;
                        const weather = weatherCode[code].reply === undefined ? `天氣是 ${weatherCode[code].zhtw}` : weatherCode[code].reply;
                        if(acc.length > 0) {
                            return `${acc}\n${city}(${country}) 現在 ${tmp} 度，${feel}，濕度 ${hum}%～\n${weather}`
                        }
                        else {
                            return `${city}(${country}) 現在 ${tmp} 度，${feel}，濕度 ${hum}%～\n${weather}`;
                        }
                    }, ""));
                }
            })
            .catch(err => {
                console.log(err);
                resolve("丞丞..不懂...地方 (◕〝◕) ");
            })
    });
}

const PARSER = [
    {
        reg: /(丞丞.*歲|^幾歲|丞丞.*年紀|^年紀)/im,
        reply: new Promise(resolve => resolve(_.sample(REPLY_AGE))),
        expectIndex: null
    },
    {
        // https://regex101.com/r/UbspfJ/2
        reg: /(.*?){1}(的|現在|現在的|今天)?(溫度|幾度){1,}?/im,
        reply: getTemperature,
        expectIndex: 1
    },
    {
        // https://regex101.com/r/RIkKmM/2
        reg: /(.*?){1}(的|現在|現在的|今天)?(天氣|氣象|氣候){1,}?/im,
        reply: getWeather,
        expectIndex: 1
    }
];

function resolve(message) {
    for(let i = 0; i < PARSER.length; i ++) {
        const result = PARSER[i].reg.exec(message);
        console.log(result);
        if(null !== result) {
            // We have a match here
            if(null === PARSER[i].expectIndex) {
                // Match the whole string will do
                return PARSER[i].reply;
            }
            else {
                if("function" === typeof(PARSER[i].reply) ) {
                    // we want a specified portion of the string
                    // (using regexp and expect index value)
                    if( '' === result[PARSER[i].expectIndex] ||
                        null === result[PARSER[i].expectIndex]) {
                        // the expected field is empty, use default city
                        return PARSER[i].reply(DEFAULT_CITY);
                    }
                    else {
                        // use the parsed city
                        return PARSER[i].reply(result[PARSER[i].expectIndex]);
                    }
                }
                else {
                    return PARSER[i].reply;
                }
            }
        }
    }
    return null;
}

module.exports.resolve = resolve;
