# Invoice creation

---
## Requirements

For development, you will only need Node.js and a node global package, installed in your environement.

### Node
- #### Node installation on Windows

  Just go on [official Node.js website](https://nodejs.org/) and download the installer.
Also, be sure to have `git` available in your PATH, `npm` might need it (You can find git [here](https://git-scm.com/)).

- #### Node installation on Ubuntu

  You can install nodejs and npm easily with apt install, just run the following commands.

      $ sudo apt install nodejs
      $ sudo apt install npm

- #### Other Operating Systems
  You can find more information about the installation on the [official Node.js website](https://nodejs.org/) and the [official NPM website](https://npmjs.org/).

If the installation was successful, you should be able to run the following command.

    $ node --version
    v16.16.0

    $ npm --version
    8.11.0

If you need to update `npm`, you can make it using `npm`! Cool right? After running the following command, just open again the command line and be happy.

    $ npm install npm -g

###
### Sequelize installation
  After installing node, this project will need yarn too, so just run the following command.

      $ npm i -g sequelize
      $ npm i -g sequelize-cli
      $ npm i -g mysql

## Install

    $ https://bitbucket.org/solutionanalystspvtltd/invoice-creation-nodejs/src/master/
    $ cd nodejs
    $ nvm use 16.16.0
    $ npm install
    $ npm i -g sequelize
    $ npm i -g sequelize-cli
    $ npm i -g mysql
    $ npm i typescript -g

# Requirements
    $ npm = 8.11.0
    $ node = 16.16.0
    $ sequelize = 6.25.5
    
# Feature understanding

- Add transaction in taskopad through invoice-system

`/src/modules/v1/paymentRecord/paymentRecordUtils.ts`
```
- Transactions are of the manual payment

taskopadPayload = {
            user_id: userId?.taskopad_user_id,
            plan_id: subcriptionPlanId,
            referral_code: '',
            total_employee: user,
            paid_amount: insertData.payment_received,
            currency_name: 'INR',
            symbol: '₹',
            subscription_type: this.getSubsscriptionType(subcription_type),
            total_price: insertData.bill_amount,
            pdfLink,
            fromAdmin: true,
          };
transaction = await Utils.addPaymentTransactionInTOP(taskopadPayload);
``` 

- Add payment-record of the taskopad-transactions

`/src/modules/v1/paymentRecord/paymentRecordUtils.ts`

```
- If user do payment through taskopad, then razorpay will call webhook of Subscription MS
- In that webhook call, invoice-webhook will be called for payment.authorized event of razorpay
- This is the manual setup to call invoice webhook dynamically through each call of Subscription webhook

const data = {
            customer_name: `${webhookData?.first_name} ${webhookData?.last_name}`,
            bill_no: Constants.PAYMENT_TYPE.DIRECT,
            bill_amount: 0,
            payment_received: insertData?.amount / 100,
            payment_date: webhookData?.updatedAt,
            payment_gateway: 'razorPay',
            status:
              insertData.status === Constants.PAYMENT_RECORD.AUTHORISED
                ? Constants.PAYMENT_RECORD.PAYMENT_STATUS
                : Constants.PAYMENT_RECORD.PAYMENT_STATUS_UNPAID,
            razorpay_payment_id: insertData?.id,
            razorpay_order_id: insertData?.order_id,
            subcription_startDate: webhookData?.createdAt,
            subcription_endDate: webhookData?.updatedAt,
          };
return paymentRecord.create(data);
```


## Code Quality
- we've achieved good code-quality for this project
- [sonar scanner report](https://sonarqube.sa-labs.info/dashboard?id=invoice-creation-nodejs)

![sonar report](./public/sonar-report.png)

## LICENSE
ISC

##### AUTHOR: [ Manish Malviya ]
##### MAINTAINER: [ Manish Malviya  ]
# invoice-creation
