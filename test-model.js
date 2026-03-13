/* eslint-disable @typescript-eslint/no-require-imports */
const { generateText } = require('ai');
const { google } = require('@ai-sdk/google');
const fs = require('fs');
require('dotenv').config({path: '.env.local'});
const audioBase64 = fs.readFileSync('test_meeting.m4a', { encoding: 'base64' });

(async () => {
  try {
    console.log('API Key exists:', !!process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    const response = await generateText({
      model: google('gemini-1.5-flash'),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Hello, what is this audio about?' },
            { type: 'file', data: audioBase64, mimeType: 'audio/mp4' }
          ]
        }
      ]
    });
    console.log('Result:', response.text);
  } catch(e) {
    console.error('ERROR TRACE:', e);
  }
})();
