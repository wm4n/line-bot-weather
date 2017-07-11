require('dotenv').config();
const { googleKey, weatherKey } = require('./ServerSettings');
const axios = require("axios");

function findLocationDesc(lookupResult) {
    const { address_components } = lookupResult;
    const filteredComponents = address_components.filter(
        obj => /admin.*level_(1|2|3)|country|colloquial_area/i.test(obj.types[0]));
    if(filteredComponents.length === 0) {
        return lookupResult.formatted_address;
    }
    else {
        const res = filteredComponents.reduce((prev, current, currentIdx, array) => {
            let currentLevel;
            if(current.types[0] === 'country') {
                currentLevel = 0;
            } else if(current.types[0] === 'colloquial_area') {
                currentLevel = 99;
            } else {
                currentLevel = current.types[0].slice(-1).valueOf();
            }
            if( ! prev.level) {
                return { level: currentLevel, location: current.long_name };
            }
            else {
                if(prev.level > currentLevel) {
                    return prev;
                }
                else {
                    return { level: currentLevel, location: current.long_name };
                }
            }
        }, { level: undefined, location: ''});
        return res.location;
    }
}

function uriForLatLon(lat, lon, language) {
    const key = googleKey;
    const lang = language || 'zh_TW';
    const uri = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${key}&language=${lang}`;
    return uri;
}

function uriForSearch(searchText, language) {
    const addr = encodeURIComponent(searchText);
    const key = googleKey;
    const lang = language || 'zh_TW';
    const uri = `https://maps.googleapis.com/maps/api/geocode/json?address=${addr}&key=${key}&language=${lang}`;
    return uri;
}

function geoCode(uri, callback, language) {
    //console.log(uri);
    axios.get(uri)
        .then(res => {
            if('OK' !== res.data.status) {
                throw new Error(res.data.status);
            }
            if(1 === res.data.results.length) {
                // found 1
                const location = res.data.results[0];
                const arr = [ 
                        {   addr: findLocationDesc(location),
                            lat: location.geometry.location.lat,
                            lon: location.geometry.location.lng
                        } ];
                callback(undefined, arr);
            }
            else if(1 < res.data.results.length) {
                // found many
                const arr = res.data.results.map( location => {
                    return {
                        addr: findLocationDesc(location),
                        lat: location.geometry.location.lat,
                        lon: location.geometry.location.lng
                    }
                });
                // console.log(`GeoCode ${arr.length}: `, JSON.stringify(arr, null, 2));
                callback(undefined, arr);
            }
        })
        .catch(err => {
            callback(err, undefined);
        });
}

function forecastWeather(location, unit = 'metric', callback, language) {
  const params = {
    lat: location.lat,
    lon: location.lon,
    units: unit,
    appid: weatherKey,
    lang: language || 'zh_tw'
  };
  axios
    .get('http://api.openweathermap.org/data/2.5/forecast', {params})
    .then(res => {
      // console.log("res: " + res);
      const { list } = res.data;
      const sorted = list.map(item => {
        return {
          dt: item.dt,
          temp: Math.round(item.main.temp),
          temp_min: Math.round(item.main.temp_min),
          temp_max: Math.round(item.main.temp_max),
          desc: item.weather[0].description,
          icon: item.weather[0].icon,
          clouds: item.clouds.all,
          humidity: item.main.humidity,
          wind: item.wind.speed,
          unit
        }
      });
      
      callback(undefined, sorted);
    })
    .catch(err => {
      console.log(err);
      callback(err, undefined);
    });
}

function currentWeather(location, unit = 'metric', callback, language) {
    const params = {
        lat: location.lat,
        lon: location.lon,
        units: unit,
        appid: weatherKey,
        lang: language || 'zh_tw'
    };
    axios.get('http://api.openweathermap.org/data/2.5/weather', {params})
        .then(res => {
            // const resultList = res.data["HeWeather5"];
            // if (resultList.length == 1) {
            //     resolve(template(resultList[0], city));
            // }
            const { dt, weather, main, wind, clouds } = res.data;
            const result = {
              dt,
              temp: main.temp,
              temp_min: main.temp_min,
              temp_max: main.temp_max,
              desc: weather[0].description,
              icon: weather[0].icon,
              clouds: clouds.all,
              humidity: main.humidity,
              wind: wind.speed,
              unit
            };
            // console.log(JSON.stringify(result, null, 2));
            callback(undefined, result);
        })
        .catch(err => {
            callback(err, undefined);
        });
}

function currentGeoWeatherForLatLon(lat, lon, unit, callback, language) {
    currentGeoWeatherUri(uriForLatLon(lat, lon, language), unit, callback);
}

function currentGeoWeather(searchText, unit, callback, language) {
    currentGeoWeatherUri(uriForSearch(searchText, language), unit, callback);
}

function currentGeoWeatherUri(uri, unit, callback) {
    geoCode(uri, (errLoc, loc) => {
        if(loc) {
            currentWeather(loc[0], unit, (errWeather, weather) => {
                if(weather) {
                    weather.location = loc[0];
                    callback(undefined, weather);
                }  
                else {
                    callback(errWeather, undefined);
                }
            });
        }
        else {
            callback(errLoc, undefined);
        }
    });
}

// currentGeoWeather("116 taiwan", (err, res) => {
//     if(res) {
//         console.log(JSON.stringify(res, null, 2));
//     }
//     else {
//         console.log(err);
//     }
// });

module.exports.geoCode = geoCode;
module.exports.forecastWeather = forecastWeather;
module.exports.currentWeather = currentWeather;
module.exports.currentGeoWeather = currentGeoWeather;
module.exports.currentGeoWeatherForLatLon = currentGeoWeatherForLatLon;