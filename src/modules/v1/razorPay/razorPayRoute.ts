import { Router } from 'express';
import RazorPayController from './razorPayController';
import { AuthMiddleware } from '../auth/authMiddleware';

const router: Router = Router();
const authMiddleware = new AuthMiddleware();
const razorPayController = new RazorPayController();

router.post('/payment/:id', authMiddleware.verifyToken, razorPayController.payment);

router.post('/verify_payment', authMiddleware.verifyToken, razorPayController.verify);

router.post('/invoice/paymentLink', authMiddleware.verifyToken, razorPayController.paymentLink);

router.post('/quotation/paymentLink', authMiddleware.verifyToken, razorPayController.paymentLinkQuotation);

router.post('/NotifyBy', authMiddleware.verifyToken, razorPayController.paymentNotifyBy);

router.put('/fetch', authMiddleware.verifyToken, razorPayController.fetchPaymentLink);

router.get('/razorPay_plans', authMiddleware.verifyToken, razorPayController.razorpayPlans);

router.post('/quotation/subscriptionsLink', authMiddleware.verifyToken, razorPayController.subscriptionsLinkQuotation);

router.post('/invoice/subscriptionsLink', authMiddleware.verifyToken, razorPayController.subscriptionsLinkInvoice);

router.post('/webhook', razorPayController.webhookRazorpay);

export const razorPayRoute: Router = router;
