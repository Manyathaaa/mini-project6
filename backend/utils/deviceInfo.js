const UAParser = require('ua-parser-js');

const getDeviceInfo = (userAgent) => {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  
  return {
    browser: `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`.trim(),
    os: `${result.os.name || 'Unknown'} ${result.os.version || ''}`.trim(),
    device: result.device.type || 'desktop'
  };
};

const getClientInfo = (req) => {
  const ipAddress = req.ip || 
                   req.headers['x-forwarded-for'] || 
                   req.headers['x-real-ip'] || 
                   req.connection.remoteAddress || 
                   'unknown';
  
  const userAgent = req.headers['user-agent'] || 'unknown';
  const deviceInfo = getDeviceInfo(userAgent);
  
  return {
    ipAddress: ipAddress.replace('::ffff:', ''), // Clean IPv6 notation
    userAgent,
    deviceInfo
  };
};

module.exports = { getDeviceInfo, getClientInfo };
