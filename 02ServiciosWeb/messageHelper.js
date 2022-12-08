var axios = require('axios');

function sendMessage(data) {
    var config = {
    method: 'post',
    url: `https://graph.facebook.com/${process.env.VERSION}/${process.env.PHONE_NUMBER_ID}/messages`,
    headers: {
      'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    data: data
  };
  console.log("yes")
  return axios(config)
}

function getTextMessageInput(recipient, text) {
  return JSON.stringify({
    "messaging_product": "whatsapp",
    "to": recipient,
    "type": "text",
    "text": {
      "body": text
    }
  });
}

module.exports = {
  sendMessage: sendMessage,
  getTextMessageInput: getTextMessageInput
};