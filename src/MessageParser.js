const triggerKeyword = "丞丞 ";
const triggerRegex = /^丞丞[ ,　，]/;
const specialExcludeChars = /[ .\?　。？]/gi;

/**
 * process the message and categorize into types that can be processed further
 */
module.exports = message => {
  if(/^丞丞.*(單位|unit).*/gi.test(message)) {
    return { type: 'unit' };
  }
  else if(/ºF/gi.test(message)) {
    return { type: "set-unit", to: 'imperial'};
  }
  else if(/ºC/gi.test(message)) {
    return { type: "set-unit", to: 'metric'};
  }
  else if(/^丞丞.*(使用|help).*/gi.test(message)) {
    return { type: 'help' };
  }
  else if(triggerRegex.test(message)) {
      let lookupAddrs = message.slice(triggerKeyword.length).split(/[, ，　]/g);
      lookupAddrs = lookupAddrs
          .filter(addr => addr.length >= 2)
          .map(addr => addr.replace(specialExcludeChars, ''));
      return {
          type: 'now',
          parsedText: lookupAddrs
      };
  }
  
  return { type: 'unknown' };
};
