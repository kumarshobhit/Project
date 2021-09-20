const product='apple iphone 13'
const puppeteer = require('puppeteer')
let page;
(async function fn() {
    let browser=await puppeteer.launch({
        headless:false,
        defaultViewport:null,
        args:['--start-maximized'],
    })
    page=await browser.newPage() ;
    await page.goto('https://www.amazon.in/');
    await page.type('input[aria-label="Search"]',product,{delay:50});
    await waitAndClick('#nav-search-submit-button',page) ;
    await page.waitFor(3000);
    let list = await page.$$(".a-link-normal.a-text-normal");
    let element=list[0] ;
     let value = await page. evaluate(el => el.href, element)
    // console.log(value) ;
    return value ;

})() ;





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
       