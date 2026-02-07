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

const getLocationFromIP = async (ipAddress) => {
  try {
    // Skip localhost/private IPs
    if (!ipAddress || 
        ipAddress === 'unknown' || 
        ipAddress === '::1' || 
        ipAddress.startsWith('127.') ||
        ipAddress.startsWith('192.168.') ||
        ipAddress.startsWith('10.') ||
        ipAddress.startsWith('172.')) {
      return {
        country: 'Local Network',
        state: null,
        city: 'localhost',
        street: null,
        houseNumber: null,
        postalCode: null,
        latitude: null,
        longitude: null
      };
    }

    // Using ip-api.com (free, no key required, 45 requests/minute)
    const response = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,country,regionName,city,zip,lat,lon,district,query`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return {
        country: data.country || null,
        state: data.regionName || null,
        city: data.city || null,
        street: data.district || null, // District/neighborhood is closest to street
        houseNumber: null, // Not available from IP lookup
        postalCode: data.zip || null,
        latitude: data.lat || null,
        longitude: data.lon || null
      };
    }
    
    return {};
  } catch (error) {
    console.error('Error fetching location:', error.message);
    return {};
  }
};

const getClientInfo = async (req) => {
  const ipAddress = req.ip || 
                   req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                   req.headers['x-real-ip'] || 
                   req.connection.remoteAddress || 
                   'unknown';
  
  const cleanIP = ipAddress.replace('::ffff:', ''); // Clean IPv6 notation
  const userAgent = req.headers['user-agent'] || 'unknown';
  const deviceInfo = getDeviceInfo(userAgent);
  
  // Get location data from IP
  const location = await getLocationFromIP(cleanIP);
  
  return {
    ipAddress: cleanIP,
    userAgent,
    deviceInfo,
    location
  };
};

module.exports = { getDeviceInfo, getClientInfo, getLocationFromIP };
