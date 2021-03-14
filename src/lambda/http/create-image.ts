require('source-map-support').install();

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS  from 'aws-sdk';
import * as uuid from 'uuid';

const docClient = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3({
    signatureVersion: 'v4'
});

const groupsTable = process.env.GROUPS_TABLE;
const imagesTable = process.env.IMAGES_TABLE;
const bucketName = process.env.IMAGES_S3_BUCKET;
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    console.log('Processing event', event);

    const { groupId } = event.pathParameters;
    const isValidGroupId = await groupExists(groupId)

    if (!isValidGroupId) {
        return {
            statusCode: 404,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'Group does not exist'
            })
        }
    }

    const imageId = uuid.v4();

    const parsedBody = JSON.parse(event.body);

    const newItem = {
        imageId,
        groupId,
        timestamp: new Date().toISOString(),
        ...parsedBody,
        imageUrl: `https://${bucketName}.s3.amazonaws.com/${imageId}`
    }

    await docClient.put({
        TableName: imagesTable,
        Item: newItem
    }).promise();

    const url = getUploadUrl(imageId);

    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            newItem,
            uploadUrl: url
        })
    }
};

const getUploadUrl = (imageId: string) => {

    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: imageId,
        Expires: Number(urlExpiration)
    });
}

const groupExists = async (groupId: string) => {

    const result = await docClient.get({
        TableName: groupsTable,
        Key: {
            id: groupId
        }
    }).promise()

    console.log('Get group: ', result);
    return !!result.Item;
}
