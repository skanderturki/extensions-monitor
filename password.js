const WEB_API_URL = "https://script.google.com/macros/s/AKfycbylUb2H5SI7lv359iX4YdFJ2jytOaCW_6c5YN6xMzf9Up0HoJShETFZarqs2gVHwiJP/exec";

const vscode = require('vscode');

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


module.exports = { checkCredentials };