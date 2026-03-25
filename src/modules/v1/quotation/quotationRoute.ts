import { Router } from 'express';
import { Validator } from '../../../validate';
import quotationController from './quotationController';
import { CreateModel, UpdateModel } from './quotationModel';
import { AuthMiddleware } from '../auth/authMiddleware';
const authMiddleware = new AuthMiddleware();

const router: Router = Router();
const v = new Validator();

const QuotationController = new quotationController();

router.post('/create', v.validate(CreateModel), authMiddleware.verifyToken, QuotationController.create);

router.get('/getAll', authMiddleware.verifyToken, QuotationController.getAll);

router.get('/findById/:id', authMiddleware.verifyToken, QuotationController.findById);

router.put('/update/:id', v.validate(UpdateModel), authMiddleware.verifyToken, QuotationController.Update);

router.delete('/delete/:id', authMiddleware.verifyToken, QuotationController.Delete);

router.post('/quotationToinvoice/:id', authMiddleware.verifyToken, QuotationController.InvoiceGenerate);

router.get('/getAllHistory', authMiddleware.verifyToken, QuotationController.getAllHistory);

router.get('/history/findById/:id', authMiddleware.verifyToken, QuotationController.quotationHistoryfindById);

router.get('/PDF/:id', authMiddleware.verifyToken, QuotationController.convertPDF);

router.get('/send_pdf/:id', authMiddleware.verifyToken, QuotationController.pdfSendEmail);

export const quotationRoute: Router = router;
