import AWS from 'aws-sdk';

const credentials = {
    accessKeyId: process.env.S3_ACCESS_KEY ?? "",
    secretAccessKey : process.env.S3_SECRET_KEY ?? "",
    sessionToken: process.env.S3_SESSION_TOKEN ?? ""
};

class AWSService {
    private static instance: AWSService;
    private readonly URL_TIMEOUT = 3600; // seconds
    private readonly PROFILE_PICTURES_BUCKET = "new-sportsmatch-user-pictures-2025";
    private s3: AWS.S3;
    private static tmp = "tmp";

    constructor() {
        console.log("Initializing AWS Service...");
        console.log("Credentials:", credentials);
        AWS.config.update({credentials: credentials, region: 'us-east-1'});
        this.s3 = new AWS.S3({
            region: 'us-east-1',
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_KEY,
            sessionToken: process.env.S3_SESSION_TOKEN
        });
    }

    static getInstance() {
        if (!AWSService.instance) AWSService.instance = new AWSService();
        return AWSService.instance;
    }

    getPresignedGetUrl(filename: string) {
        const presignedGETURL = this.s3.getSignedUrl('getObject', {
            Bucket: this.PROFILE_PICTURES_BUCKET,
            Key: filename,
            Expires: this.URL_TIMEOUT
        });
        return presignedGETURL;
    }

    getPresignedPostUrl(filename: string, contentType: string) {
        const params = {
            Bucket: this.PROFILE_PICTURES_BUCKET,
            Key: filename,
            Expires: this.URL_TIMEOUT,
            ContentType: contentType
        }
        return this.s3.getSignedUrl('putObject', params);
    }

}

export default AWSService;