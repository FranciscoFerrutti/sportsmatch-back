import AWS from 'aws-sdk';

const credentials = {
    accessKeyId: process.env.S3_ACCESS_KEY ?? "",
    secretAccessKey : process.env.S3_SECRET_KEY ?? ""
};

class AWSService {
    private static instance: AWSService;
    private readonly URL_TIMEOUT = 3600; // seconds
    private readonly PROFILE_PICTURES_BUCKET = "new-sportsmatch-user-pictures";
    private s3: AWS.S3;
    private static tmp = "tmp";

    constructor() {
        AWS.config.update({credentials: credentials, region: 'us-east-1'});
        this.s3 = new AWS.S3();
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

    getPresignedPostUrl(filename: string) {
        const presignedPUTURL = this.s3.getSignedUrl('putObject', {
            Bucket: this.PROFILE_PICTURES_BUCKET,
            Key: filename,
            Expires: this.URL_TIMEOUT
        });
        return presignedPUTURL;
    }

    async uploadFileToS3(filename: string, fileBuffer: Buffer, contentType: string) {
        try {
            const params = {
                Bucket: this.PROFILE_PICTURES_BUCKET,
                Key: filename,
                Body: fileBuffer,
                ContentType: contentType,
                ACL: 'private', // Puedes cambiarlo a 'public-read' si quieres acceso público
            };

            await this.s3.upload(params).promise();
            console.log(`✅ Archivo subido a S3: ${filename}`);
        } catch (error) {
            console.error("❌ Error subiendo archivo a S3:", error);
            throw error;
        }
    }

}

export default AWSService;