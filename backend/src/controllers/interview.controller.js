const pdfParse = require('pdf-parse')
const { prisma } = require('../config/prisma.client')
const { generateInterviewReport, generateResumePdf } = require('../services/ai.service')

async function getInterviewReport(req, res){
    try{
        const { jobDescription, selfDescription } = req.body

        if(!jobDescription || !selfDescription){
            return res.status(400).json({ success: false, message: 'Job description and self description are required' })
        }

        if(!req.file){
            return res.status(400).json({ success: false, message: 'Resume is required' })
        }

        const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
     
        const report = await generateInterviewReport(resumeContent.text, jobDescription, selfDescription)

        const interviewReport = await prisma.interviewReport.create({
            data: {
                userId: req.user.id,
                title:  `IR-${Date.now()}`,
                resume: resumeContent.text,
                jobDescription,
                selfDescription,
                matchScore: report.matchScore,
                technicalQuestions: { create: report.technicalQuestions },
                behavioralQuestions: { create: report.behavioralQuestions },
                skillGaps: { create: report.skillGaps },
                preparationPlans: { create: report.preparationPlans },
                createdAt: new Date()
            },
            include: {
                technicalQuestions: true,
                behavioralQuestions: true,
                skillGaps: true,
                preparationPlans: true
            }
        })

        res.status(200).json({ success: true, interviewReport } )

    }catch(err){
        console.error(`Error generating interview report: ${err}`)
        res.status(500).json({ success: false, message: 'Failed to generate interview report' })
    }
}

async function fetchInterviewReports(req, res){
    try{
        const reports = await prisma.interviewReport.findMany({
            where: {
                userId: req.user.id
            }
        })

        res.status(200).json({ success: true, reports })
    }catch(err){
        console.error(`Error fetching interview reports: ${err}`)
        res.status(500).json({ success: false, message: 'Failed to fetch interview reports' })
    }
}

async function fetchInterviewReportById(req, res){
    try{
        const { id } = req.params

        const report = await prisma.interviewReport.findUnique({
            where: {
                id
            },
            include: {
                technicalQuestions: true,
                behavioralQuestions: true,
                skillGaps: true,
                preparationPlans: true
            }
        })

        res.status(200).json({ success: true, report })
    }catch(err){
        console.error(`Error fetching interview report: ${err}`)
        res.status(500).json({ success: false, message: 'Failed to fetch interview report' })
    }
}

async function getResumePdf(req, res){
    try{
        const { id } = req.params

        const report = await prisma.interviewReport.findUnique({
            where: {
                id
            }
        })

        if(!report){
            return res.status(404).json({ success: false, message: 'Interview report not found' })
        }

        const pdfBuffer = await generateResumePdf({
            resume: report.resume,
            selfDescription: report.selfDescription,
            jobDescription: report.jobDescription
        })

        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename="resume-${report.title}.pdf"`)
        res.send(pdfBuffer)

    }catch(err){
        console.error(`Error generating resume pdf: ${err}`)
        res.status(500).json({ success: false, message: 'Failed to generate resume pdf' })
    }

}

module.exports = {
    getInterviewReport,
    fetchInterviewReports,
    fetchInterviewReportById,
    getResumePdf
}


