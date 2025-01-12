const express = require('express');
const { WebClient } = require('@slack/web-api');
const bodyParser = require('body-parser');
require('dotenv').config();
const app = express();

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

// Channel ID to post the poll to
const CHANNEL_ID = 'all-sport'; // Replace with your target channel ID

const webClient = new WebClient(SLACK_BOT_TOKEN);

let pollResults = {
  option1: 0,
  option2: 0,
  option3: 0,
};

// Middleware to parse incoming Slack requests
app.use(bodyParser.json());

// Function to post the poll message
async function postPoll() {
  try {
    const result = await webClient.chat.postMessage({
      channel: CHANNEL_ID,
      text: 'Please vote for your favorite option!',
      attachments: [
        {
          text: 'Choose an option:',
          fallback: 'You are unable to vote',
          callback_id: 'poll_vote',
          color: '#3AA3E3',
          attachment_type: 'default',
          actions: [
            {
              name: 'option1',
              text: 'Option 1',
              type: 'button',
              value: 'option1',
            },
            {
              name: 'option2',
              text: 'Option 2',
              type: 'button',
              value: 'option2',
            },
            {
              name: 'option3',
              text: 'Option 3',
              type: 'button',
              value: 'option3',
            },
          ],
        },
      ],
    });
    console.log('Poll message posted: ', result.ts);
  } catch (error) {
    console.error('Error posting poll message: ', error);
  }
}

// Handling interactive actions (button clicks)
app.post('/slack/actions', async (req, res) => {
  const { payload } = req.body;
  console.log('any chance its working')
  const action = JSON.parse(payload).actions[0];
  const selectedOption = action.value;

  if (pollResults[selectedOption] !== undefined) {
    pollResults[selectedOption]++;
  }

  res.status(200).send(); // Respond to acknowledge button click
});

// Route to get poll results
app.get('/poll-results', (req, res) => {
  res.json(pollResults);
});

// Endpoint to start the poll
app.get('/start-poll', async (req, res) => {
  await postPoll();
  res.status(200).send('Poll posted!');
});

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
