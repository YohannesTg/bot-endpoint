const fetch = require('node-fetch');

// Function to make the web request and return the data
async function fetchData() {
  try {
    const response = await fetch('"https://api.telegram.org/bot7004677225:AAEvp1tFSgiIXkQqkCp5mkB6tRScWhcdnAs/setWebhook?url=https://telegame.vercel.app"');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}

// Call the fetchData function and log the returned data
fetchData()
  .then((data) => {
    console.log('Data:', data);
  })
  .catch((error) => {
    console.error('Error:', error);
