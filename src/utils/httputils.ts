import { Curl } from "node-libcurl";

export function testPing() {
    try {
        const curl = new Curl();

        curl.setOpt('URL', 'www.google.com');
        curl.setOpt('FOLLOWLOCATION', true);

        curl.on('end', function (statusCode, data, headers) {
            console.info(statusCode);
            console.info('---');
            console.info(data.length);
            console.info('---');
            console.info(this.getInfo( 'TOTAL_TIME'));

            this.close();
        });

        curl.on('error', curl.close.bind(curl));
        curl.perform();
    }
    catch (e) {
        console.log("TESTPING ERROR", e);
    }
}