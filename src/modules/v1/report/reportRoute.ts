import { Router } from 'express';
import { Validator } from '../../../validate';
import reportController from './reportController';
import { AuthMiddleware } from '../auth/authMiddleware';
const authMiddleware = new AuthMiddleware();

const router: Router = Router();
const v = new Validator();

const ReportController = new reportController();

router.post('/details', authMiddleware.verifyToken, ReportController.detailsSummary);

router.post('/lost_client', authMiddleware.verifyToken, ReportController.lostClientDetails);

router.post('/dates', authMiddleware.verifyToken, ReportController.betweenDatesSummary);

router.post('/summary', authMiddleware.verifyToken, ReportController.Summary);

router.post('/summary_lost_client', authMiddleware.verifyToken, ReportController.lostClientSummary);

export const reportRoute: Router = router;
