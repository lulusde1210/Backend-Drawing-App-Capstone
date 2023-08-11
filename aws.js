const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const bucketName = process.env.BUCKET_NAME
const bucketRegion = process.env.BUCKET_REGION
const accessKeyId = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_ACCESS_KEY

const s3Client = new S3Client({
    credentials: {
        accessKeyId,
        secretAccessKey
    },
    region: bucketRegion

})

const uploadFile = (fileBuffer, fileName, mimetype) => {
    const uploadParams = {
        Bucket: bucketName,
        Body: fileBuffer,
        Key: fileName,
        ContentType: mimetype
    }

    return s3Client.send(new PutObjectCommand(uploadParams));
}

const deleteFile = (fileName) => {
    const deleteParams = {
        Bucket: bucketName,
        Key: fileName,
    }

    return s3Client.send(new DeleteObjectCommand(deleteParams));
}


exports.uploadFile = uploadFile
exports.deleteFile = deleteFile