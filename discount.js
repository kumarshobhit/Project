#!/usr/bin/env node
const puppeteer = require('puppeteer') ;
const fs=require("fs") ;
let path=require('path') ;
let price= -1;
const product='apple iphone 13'
let url="" ;
const emailpassObj = require("./secrets");
const nodemailer = require('nodemailer');
const CronJob = require('cron').CronJob;
let page;

let input = process.argv.slice(2);
console.log(input) ;


async function fn() {
    let browser=await puppeteer.launch({
        headless:false,
        defaultViewport:null,
        args:['--start-maximized'],
    }) ;
    page=await browser.newPage() ;
    // get the link of the product from amazon.in
    await page.goto('https://www.amazon.in/');
    await page.type('input[aria-label="Search"]',product,{delay:50});
    await waitAndClick('#nav-search-submit-button',page) ;
    await page.waitFor(3000);
    let list = await page.$$(".a-link-normal.a-text-normal");
    let element=list[0] ;
    url = await page. evaluate(el => el.href, element)
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
    if(price == -1 ) price=currentPrice ;
    if (currentPrice <= price) {
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


  function waitAndClick(selector,cpage) {
        return new Promise(function (resolve, reject) {
        let waitPromise=cpage.waitForSelector(selector,{visible:true});
        waitPromise.then(function(){
        let clickPromise=page.click(selector,{delay:100});
        return clickPromise;
    }).then(function () {
        resolve() ;
    }).catch(function(err){
        reject(err);
    })
        })
    }
       
