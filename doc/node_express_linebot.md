## Node, Express and LINE bot

Minimal setup for a Node server, Express and LINE bot...

### Branch
```line-bot```

### How to Run Locally
LINE requires the webhook to be a HTTPS with a trusted CA so we will focus on running on Heroku.


### How to Run on Heroku
1. Setup your LINE bot by following instructions on this link

    [Messaging API - Getting Started](https://developers.line.me/messaging-api/getting-started)
    
2. Write down <strong>Channel ID</strong>, <strong>Channel Secret</strong> and <strong>Channel Access Token</strong> of your LINE bot while registering.

3. Setup your [Heroku account and Toolbelt](https://devcenter.heroku.com/articles/getting-started-with-nodejs#set-up)

4. Under the root folder and run
`
heroku create
`

5. Push to Heroku
`
git push heroku line-bot:master
`

6. Add environment variables to Heroku

    ```
heroku config:set channelId="Your Channel ID"
heroku config:set channelSecret="Your Channel Secret"
heroku config:set channelAccessToken="Your Channel Access Token"
```

7. Now, add this bot as friend in your LINE and send him/her some message