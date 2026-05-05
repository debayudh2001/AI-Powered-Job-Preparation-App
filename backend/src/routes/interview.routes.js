const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/auth')
const upload = require('../middlewares/file')
const { getInterviewReport, fetchInterviewReports, fetchInterviewReportById, getResumePdf } = require('../controllers/interview.controller')

router.use(authMiddleware)

router.post('/generate-report', upload.single('resume'), getInterviewReport)
router.get('/reports', fetchInterviewReports)
router.get('/report/:id', fetchInterviewReportById)
router.get('/resume/pdf/:id', getResumePdf)

module.exports = router

