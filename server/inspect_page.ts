
import puppeteer from 'puppeteer';
import fs from 'fs';

const inspect = async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    const productId = 'E422992-000';
    const apiUrl = `https://www.uniqlo.com/us/api/commerce/v5/en/products/${productId}/reviews?limit=5&offset=0&sort=submission_time&httpFailure=true`;
    
    console.log(`Navigating to API: ${apiUrl}...`);
    
    try {
        await page.goto(apiUrl, { waitUntil: 'networkidle2' });
        
        const content = await page.evaluate(() => document.body.innerText);
        fs.writeFileSync('review_sample.json', content);
        console.log('Saved review_sample.json');

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await browser.close();
    }
};

inspect();
