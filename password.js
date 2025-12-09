const WEB_API_URL = "https://script.google.com/macros/s/AKfycbyRrx42FbepIjER0FXUtX6S7fwat7YUBzY-mOST_upOVkNWqGWsFlPIY0ornUL7oM64/exec";

const vscode = require('vscode');

// Check if the extension is remotely activated (from Google Sheet)
const checkActivationStatus = () => {
  return new Promise((resolve, reject) => {
    fetch(WEB_API_URL, {
      method: 'GET',
      redirect: 'follow',
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Activation status:', data);
        resolve(data.isActive === true);
      })
      .catch((error) => {
        console.error('Activation check error:', error);
        // Default to active if network fails (fail-safe for exams)
        resolve(true);
      });
  });
}

const checkCredentials = (email, password) => {
  return new Promise((resolve, reject) => {
    if (!email || !password) {
      reject("Missing credentials!");
      return;
    }
    const data = {
      email: email,
      password: password
    };

    fetch(WEB_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify(data),
      redirect: 'follow',
    })
      .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Auth response:', data);
        resolve(data);
      })
      .catch((error) => {
        console.error('Auth error:', error);
        reject(error);
      });
  });
}


module.exports = { checkCredentials, checkActivationStatus };