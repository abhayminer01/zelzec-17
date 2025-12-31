const BugReport = require('../models/bug.model');
const User = require('../models/user.model');
const { sendEmail } = require('../services/email.service');

const createBugReport = async (req, res) => {
    try {
        const { description } = req.body;
        const userId = req.user._id;

        if (!description) {
            return res.status(400).json({ message: "Description is required" });
        }

        const bugReport = new BugReport({
            reporter: userId,
            description
        });

        await bugReport.save();

        // Get user details for email
        const user = await User.findById(userId);

        // Send confirmation email
        if (user && user.email) {
            const subject = "Bug Report Received - Zelzec";
            const text = `Hi ${user.full_name},\n\nThank you for reporting a bug. We appreciate your feedback and will look into it shortly.\n\nDescription: ${description}\n\nBest,\nThe Zelzec Team`;
            const html = `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2>Thank you for your report!</h2>
                    <p>Hi ${user.full_name},</p>
                    <p>We have received your bug report. We appreciate your help in making Zelzec better.</p>
                    <p><strong>Bug Description:</strong></p>
                    <blockquote style="background: #f9f9f9; padding: 10px; border-left: 5px solid #ccc;">
                        ${description}
                    </blockquote>
                    <br>
                    <p>Best Regards,<br>The Zelzec Team</p>
                </div>
            `;

            // Send email asynchronously without blocking response
            sendEmail(user.email, subject, text, html).catch(err => console.error("Failed to send bug report email:", err));
        }

        res.status(201).json({ message: "Bug report submitted successfully", bugReport });
    } catch (error) {
        console.error("Error creating bug report:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getAllBugReports = async (req, res) => {
    try {
        const bugReports = await BugReport.find()
            .populate('reporter', 'full_name email')
            .sort({ createdAt: -1 });
        res.status(200).json(bugReports);
    } catch (error) {
        console.error("Error fetching bug reports:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const updateBugStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['Pending', 'Fixed'].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const bugReport = await BugReport.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!bugReport) {
            return res.status(404).json({ message: "Bug report not found" });
        }

        res.status(200).json({ message: "Bug report status updated", bugReport });
    } catch (error) {
        console.error("Error updating bug report status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const deleteBugReport = async (req, res) => {
    try {
        const { id } = req.params;
        const bugReport = await BugReport.findByIdAndDelete(id);

        if (!bugReport) {
            return res.status(404).json({ message: "Bug report not found" });
        }

        res.status(200).json({ message: "Bug report dismissed successfully" });
    } catch (error) {
        console.error("Error deleting bug report:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    createBugReport,
    getAllBugReports,
    updateBugStatus,
    deleteBugReport
};
