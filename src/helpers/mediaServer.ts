import * as AWS from 'aws-sdk';

export class MediaServer {
  public static async upload(file: any, folderName: string) {
    //res: any,req: any

    return new Promise(async (resolve, reject) => {
      try {
        const fileDetails = {
          name: file.name,
          type: file.mimetype,
        };
        const uploadFile = await this.uploadOns3(file.data, folderName, file.name);
        if (uploadFile) {
          resolve(fileDetails);
        } else {
          reject(false);
        }
      } catch (err) {
        reject(false);
      }
    });
  }

  public static async uploadOns3(buffer: any, folderName: any, filePath: any) {
    try {
      AWS.config.update({
        credentials: {
          accessKeyId: process.env.AWS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ID!,
        },
      });
      const s3 = new AWS.S3({
        region: process.env.BUCKET_REGION,
      });

      return s3
        .upload({
          Bucket: process.env.AWS_PUBLIC_BUCKET_NAME!,
          Body: buffer,
          Key: `${folderName}/${filePath}`,
        })
        .promise();
    } catch (err) {
      return false;
    }
  }
}

export default MediaServer;
