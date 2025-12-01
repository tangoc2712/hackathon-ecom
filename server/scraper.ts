
import { PrismaClient } from '@prisma/client';
import puppeteer from 'puppeteer';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const scrapeUniqlo = async () => {
    try {
        console.log("Connecting to DB...");
        // Clear existing products to avoid duplicates/bad data
        await prisma.product.deleteMany({});
        console.log("Cleared existing products.");

        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        const categoryUrls = [
            { url: 'https://www.uniqlo.com/us/en/men/tops/t-shirts', category: 'MEN' },
            { url: 'https://www.uniqlo.com/us/en/women/tops/t-shirts', category: 'WOMEN' },
            { url: 'https://www.uniqlo.com/us/en/kids/tops/t-shirts', category: 'KIDS' },
            { url: 'https://www.uniqlo.com/us/en/baby/tops', category: 'BABY' },
        ];

        for (const { url, category } of categoryUrls) {
            console.log(`Navigating to ${category} category: ${url}...`);
            await page.goto(url, { waitUntil: 'networkidle2' });
            await autoScroll(page);

            const productLinks = await page.evaluate(() => {
                const links = Array.from(document.querySelectorAll('a[href*="/products/"]'));
                return links.map(link => link.getAttribute('href')).filter((href): href is string => href !== null && href.includes('/products/'));
            });

            const uniqueLinks = [...new Set(productLinks)];
            console.log(`Found ${uniqueLinks.length} products in category.`);
            let featuredCount = 0;
            
            // Limit to 5 products per category for speed, user can increase later
            for (const link of uniqueLinks.slice(0, 5)) { 
                const fullLink = link.startsWith('http') ? link : `https://www.uniqlo.com${link}`;
                console.log(`Scraping ${fullLink}...`);
                
                try {
                    await page.goto(fullLink, { waitUntil: 'networkidle2' });
                    
                    const productData = await page.evaluate(() => {
                        // Title
                        let title = document.querySelector('h1.pdp-title')?.textContent?.trim() || 
                                    document.querySelector('[data-test="product-name"]')?.textContent?.trim();
                        
                        if (!title) {
                            const docTitle = document.title;
                            title = docTitle.split('|')[0].trim();
                        }

                        // Price
                        const priceText = document.querySelector('.price')?.textContent || 
                                          document.querySelector('[data-test="product-price"]')?.textContent || 
                                          "29.90";
                        const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));

                        // Description
                        let description = document.querySelector('[data-test="product-description"]')?.innerHTML || 
                                          document.querySelector('.pdp-description')?.innerHTML;
                        if (!description) {
                             description = document.querySelector('meta[name="description"]')?.getAttribute('content') || "";
                        }
                        
                        // Images
                        const mainImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
                        let photos = Array.from(document.querySelectorAll('.image-gallery-slide img')).map(img => img.getAttribute('src'));
                        
                        if (photos.length === 0) {
                             photos = Array.from(document.querySelectorAll('img')).filter(img => {
                                const src = img.getAttribute('src') || "";
                                return src.includes('1000') || src.includes('huge'); 
                            }).map(img => img.getAttribute('src'));
                        }
                        photos = photos.filter(src => src !== null) as string[];
                        
                        if (mainImage && !photos.includes(mainImage)) {
                            photos.unshift(mainImage);
                        }

                        // Colors (Basic extraction)
                        const colors = Array.from(document.querySelectorAll('input[name="product-color-picker"]')).map(input => {
                             return {
                                 name: input.getAttribute('aria-label') || "Unknown",
                                 hex: input.nextElementSibling?.querySelector('span')?.style.backgroundColor || "#ccc"
                             }
                        });


                        return {
                            name: title || "Unknown Product",
                            price,
                            description,
                            photos: photos.slice(0, 5),
                            colors: colors.length > 0 ? colors : [],
                        };
                    });

                    if (productData.name !== "Unknown Product" && !productData.name.includes("Cookie Consent")) {
                        const isFeatured = featuredCount < 2;
                        
                        await prisma.product.create({
                            data: {
                                name: productData.name,
                                price: productData.price * 100, // Store in cents if needed, or check schema. Schema says Decimal. Let's store as is or *100? 
                                // Schema: price Decimal? @db.Decimal
                                // Controller uses Number(price).
                                // Let's store as is for now, but usually e-com uses cents. 
                                // Wait, the controller getAllProducts does not divide by 100.
                                // But ProductCard divides by 100: ${(product.price / 100).toFixed(2)}
                                // So I should store * 100.
                                
                                description: productData.description,
                                stock: 100,
                                category_name: category.toLowerCase(),
                                photos: productData.photos,
                                photo_public_id: "scraped_" + Date.now(),
                                featured: isFeatured,
                                colors: productData.colors,
                                sizes: ['S', 'M', 'L', 'XL'],
                            }
                        });

                        if (isFeatured) featuredCount++;
                        console.log(`Saved: ${productData.name}`);
                    } else {
                        console.log(`Skipped (Invalid Name): ${productData.name}`);
                    }

                } catch (e) {
                    console.error(`Failed to scrape ${fullLink}:`, e);
                }
            }
        }

        await browser.close();
        console.log("Scraping completed.");
        process.exit(0);

    } catch (error) {
        console.error("Scraping failed:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
};

async function autoScroll(page: any) {
    await page.evaluate(async () => {
        await new Promise<void>((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight - window.innerHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

scrapeUniqlo();
