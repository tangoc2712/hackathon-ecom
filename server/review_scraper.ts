
import { PrismaClient } from '@prisma/client';
import puppeteer from 'puppeteer';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const scrapeReviews = async () => {
    try {
        console.log("Connecting to DB...");
        
        // Fetch products with Uniqlo URLs
        const products = await prisma.product.findMany({
            where: {
                product_url: {
                    contains: 'uniqlo.com'
                }
            },
            select: {
                product_id: true,
                product_url: true,
                name: true
            }
        });

        console.log(`Found ${products.length} products to check for reviews.`);

        // Fetch valid user IDs to assign to reviews
        const users = await prisma.user.findMany({
            select: { user_id: true }
        });

        if (users.length === 0) {
            console.error("No users found in database. Cannot assign reviews.");
            return;
        }

        const browser = await puppeteer.launch({ headless: false }); // Headless false to see progress/debug
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        for (const product of products) {
            if (!product.product_url) continue;

            // Extract Uniqlo Product ID (e.g., E422992-000)
            // URL format: https://www.uniqlo.com/us/en/products/E422992-000/00...
            const match = product.product_url.match(/products\/([A-Z0-9-]+)/);
            
            if (!match) {
                console.log(`Could not extract ID from URL: ${product.product_url}`);
                continue;
            }

            const uniqloId = match[1];
            console.log(`Processing ${product.name} (ID: ${uniqloId})...`);

            const apiUrl = `https://www.uniqlo.com/us/api/commerce/v5/en/products/${uniqloId}/reviews?limit=10&offset=0&sort=submission_time&httpFailure=true`;

            try {
                await page.goto(apiUrl, { waitUntil: 'networkidle2' });
                
                // Get JSON content
                const content = await page.evaluate(() => document.body.innerText);
                let json;
                try {
                    json = JSON.parse(content);
                } catch (e) {
                    console.error("Failed to parse JSON response");
                    continue;
                }

                if (json.status === 'ok' && json.result && json.result.reviews) {
                    const reviews = json.result.reviews;
                    console.log(`Found ${reviews.length} reviews.`);

                    // Delete existing reviews for this product to avoid duplicates (optional, but cleaner for this task)
                    await prisma.productReview.deleteMany({
                        where: { product_id: product.product_id }
                    });

                    for (const review of reviews) {
                        // Assign a random user
                        const randomUser = users[Math.floor(Math.random() * users.length)];
                        
                        // Convert timestamp to Date (seconds * 1000)
                        const createdAt = new Date(review.createDate * 1000);

                        await prisma.productReview.create({
                            data: {
                                product_id: product.product_id,
                                user_id: randomUser.user_id,
                                rating: review.rate,
                                comment: review.comment || review.title || "No comment",
                                created_at: createdAt,
                                updated_at: createdAt
                            }
                        });
                    }
                    console.log(`Saved ${reviews.length} reviews for ${product.name}.`);
                } else {
                    console.log("No reviews found or invalid response.");
                }

                // Random delay to be polite
                await new Promise(r => setTimeout(r, 1000 + Math.random() * 2000));

            } catch (e) {
                console.error(`Error processing ${product.name}:`, e);
            }
        }

        await browser.close();
        console.log("Review scraping completed.");

    } catch (error) {
        console.error("Script failed:", error);
    } finally {
        await prisma.$disconnect();
    }
};

scrapeReviews();
