const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000; // Default to 3000 if PORT is not set

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define the PDF generation function
async function exportWebsiteAsPdf(url) {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'], // Required for running Puppeteer in restricted environments like Render
    });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2' });

    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
    });

    await browser.close();
    return pdfBuffer;
}

// Test route
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Define the POST route for PDF generation
app.post('/pdf', async (req, res) => {
    console.log(req.body);

    const { url } = req.body;
    console.log('url', url);

    if (!url) {
        return res.status(400).send('URL is required');
    }

    try {
        const PDF = await exportWebsiteAsPdf(url);
        console.log('PDF generated successfully');

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="generated.pdf"',
        });
        res.send(PDF);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating PDF');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
