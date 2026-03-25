import axios from 'axios';

export class AxiosUtils {
  public static getRequestedData(config: any) {
    console.log(JSON.stringify(config));

    return new Promise((resolve, _reject) => {
      axios
        .request(config)
        .then((response: any) => {
          console.log(`CRM >>> HTTP status code: ${response.status}`);
          resolve(response.data);
        })
        .catch((error) => {
          console.log(`CRM >>> HTTP error code: ${error.status}`, error);

          const message = error?.response?.data?.error_description
            ? error?.response?.data
            : {
                errorMessage: error.response?.data?.errorMessage,
              };
          resolve({
            error: true,
            code: error.response?.status,
            message: message?.error_description || message?.errorMessage || error.response?.data?.message,
          });
        });
    });
  }
}
