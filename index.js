const puppeteer = require('puppeteer') ;
const fs=require("fs") ;
const path=require('path') ;
const url='https://www.amazon.in/Apple-iPhone-13-Mini-256GB/dp/B09G99CW2C/' ;
const emailpassObj = require("./secrets");
const nodemailer = require('nodemailer');
const CronJob = require('cron').CronJob;
let page;


async function fn() {
    let browser=await puppeteer.launch({
        headless:false,
        defaultViewport:null,
        args:['--start-maximized'],
    }) ;
    page=await browser.newPage() ;
    await page.goto(url);
}
    
async function startTracking() {
     await fn();
    let job = new CronJob('* */5 * * * *', function() { //runs every 30 minutes in this config
      checkPrice(page);
    }, null, true, null, null, true);
    job.start();
}

startTracking();

async function checkPrice(page) {
    await page.reload();
    let element= await page. waitForSelector('#priceblock_ourprice'); 
    let dollarPrice = await page. evaluate(el => el.textContent, element) ;
    let currentPrice = Number(dollarPrice.replace(/[^0-9.-]+/g,""));
    if (currentPrice <= 80000) {
            console.log("BUY!!!! " + currentPrice);
            sendNotification(currentPrice);
    }
}


async function sendNotification(price) {

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailpassObj.email,
        pass: emailpassObj.password
      }
    });
  
    let textToSend = 'Price dropped to ' + price;
    let htmlText = `<a href=\"${url}\">Link</a>`;
  
    let info = await transporter.sendMail({
    //   from: '"Price Tracker" <*****@gmail.com>',
      from: `"Price Tracker" ${emailpassObj.email}`,
      to: emailpassObj.clientEmail,
      subject: 'Price dropped to ' + price, 
      text: textToSend,
      html: htmlText
    });
  
    console.log("Message sent: %s", info.messageId);
  }
