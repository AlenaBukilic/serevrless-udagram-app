require('source-map-support').install();
import { SNSEvent, SNSHandler, S3EventRecord } from 'aws-lambda';
import * as AWS  from 'aws-sdk';
import Jimp from 'jimp/es';

const s3 = new AWS.S3();

const imagesBucketName = process.env.IMAGES_S3_BUCKET;
const thumbnailsBucketName = process.env.THUMBNAILS_S3_BUCKET;

export const handler: SNSHandler = async (event: SNSEvent) => {
    console.log('Processing SNS event ', JSON.stringify(event));

    for (const snsRecord of event.Records) {
        const s3EventStr = snsRecord.Sns.Message;
        console.log('Processing s3 event: ', s3EventStr);
        const s3Event = JSON.parse(s3EventStr);

        for (const record of s3Event.Records) {
            await processImage(record);
        }
    }
}

const processImage = async (record: S3EventRecord) => {

    const key = record.s3.object.key;
    console.log('Processing s3 item with key: ', key);

    const response = await s3.getObject({
        Bucket: imagesBucketName,
        Key: key
    }).promise();

    const body = response.Body;

    console.log('Resizing image');
    const image = await Jimp.read(body);
    image.resize(150, Jimp.AUTO);

    console.log(`Writing resized image back to S3: ${thumbnailsBucketName}`);
    const convertedBuffer = await image.getBufferAsync(Jimp.AUTO);

    await s3.putObject({
        Bucket: thumbnailsBucketName,
        Key: `${key}.jpeg`,
        Body: convertedBuffer
    }).promise();
}
