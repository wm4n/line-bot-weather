const triggerKeyword = "丞丞 ";
const triggerRegex = /^丞丞[ ,　，]/;
const specialExcludeChars = /[ .\?　。？]/gi;

/**
 * process the message and categorize into types that can be processed further
 */
module.exports = message => {
    if(triggerRegex.test(message)) {
        let lookupAddrs = message.slice(triggerKeyword.length).split(/[, ，　]/g);
        lookupAddrs = lookupAddrs
            .filter(addr => addr.length >= 2)
            .map(addr => addr.replace(specialExcludeChars, ''));
        return {
            type: 'now',
            parsedText: lookupAddrs
        };
    }
    else if(/^丞丞.*(爸爸|拔拔).*/gi.test(message)) {
        return { type: 'daddy' };
    }
    else if(/^芷媃.*(爸爸|拔拔).*/gi.test(message)) {
        return { type: 'husband of aunt'};
    }
    else if(/^芷媃.*(媽媽|麻麻).*/gi.test(message)) {
        return { type: 'aunt'};
    }
    return { type: 'unknown' };
};
