
async function test() {
    const buffer = Buffer.from('test pdf content');

    console.log('--- TEST 4: Class Usage ---');
    try {
        const pdfLib = require('pdf-parse');
        // Handle both CommonJS and ESM interop
        const PDFParse = pdfLib.PDFParse || pdfLib.default?.PDFParse;

        if (typeof PDFParse === 'function') {
            console.log('Found PDFParse class/constructor.');
            try {
                // Note: The buffer needs to be a valid PDF for actual parsing, 
                // but here we just want to see if the constructor works and method exists.
                // We might get a format error, which is fine for this test.
                const parser = new PDFParse({ data: buffer });
                console.log('Parser instance created.');

                if (typeof parser.getText === 'function') {
                    console.log('parser.getText method exists.');
                    // Don't await result as it will fail on invalid PDF data
                    console.log('Class usage verified.');
                } else {
                    console.log('parser.getText method MISSING.');
                    console.log('Parser keys:', Object.keys(parser));
                }

            } catch (e: any) {
                console.log('Constructor failed:', e.message);
            }
        } else {
            console.log('PDFParse not found on require result.');
            console.log('Keys:', Object.keys(pdfLib));
        }

    } catch (e: any) {
        console.log('Require failed:', e.message);
    }
}

test();
