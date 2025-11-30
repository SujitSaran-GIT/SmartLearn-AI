import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import { SubscriptionService } from '../services/subscription.service.js';

// Export quiz results to PDF for Pro+ users
export const exportQuizResultsToPDF = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const userId = req.userId;
    const subscription = req.subscription;

    // Check if user has PDF export capability
    const limits = subscription.limits || {};
    if (!limits.canExportPDF) {
      return res.status(403).json({
        success: false,
        error: 'PDF export requires Pro plan or higher',
        code: 'PDF_EXPORT_NOT_ALLOWED',
        data: {
          currentPlan: subscription.planType,
          requiredPlan: 'pro'
        }
      });
    }

    // Get quiz details
    const quizResult = await pool.query(
      `SELECT q.*, f.filename as file_filename
       FROM quizzes q
       LEFT JOIN files f ON q.file_id = f.id
       WHERE q.id = $1 AND q.user_id = $2`,
      [quizId, userId]
    );

    if (!quizResult.rows.length) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found',
        code: 'QUIZ_NOT_FOUND'
      });
    }

    const quiz = quizResult.rows[0];

    // Get all attempts with detailed answers
    const attemptsResult = await pool.query(
      `SELECT
         qa.*,
         json_agg(
           json_build_object(
             'question_text', q.question_text,
             'options', q.options,
             'selected_index', a.selected_index,
             'is_correct', a.is_correct,
             'correct_index', q.correct_index,
             'explanation', q.explanation
           )
         ) as answers
       FROM quiz_attempts qa
       LEFT JOIN answers a ON qa.id = a.attempt_id
       LEFT JOIN questions q ON a.question_id = q.id
       WHERE qa.quiz_id = $1 AND qa.user_id = $2
       GROUP BY qa.id
       ORDER BY qa.submitted_at DESC`,
      [quizId, userId]
    );

    const attempts = attemptsResult.rows;

    // Generate PDF content (basic HTML to PDF conversion)
    const pdfContent = generatePDFContent(quiz, attempts);

    // Set response headers for PDF download
    const filename = `quiz_results_${quiz.title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfContent.length);

    res.send(pdfContent);
  } catch (error) {
    console.error('Error exporting quiz results:', error);
    next(error);
  }
};

// Generate PDF content (HTML format that can be converted to PDF)
const generatePDFContent = (quiz, attempts) => {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Quiz Results - ${quiz.title}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #4a90e2;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .title {
            color: #2c3e50;
            font-size: 28px;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #7f8c8d;
            font-size: 16px;
        }
        .summary {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }
        .summary-item {
            text-align: center;
        }
        .summary-value {
            font-size: 24px;
            font-weight: bold;
            color: #4a90e2;
        }
        .summary-label {
            font-size: 14px;
            color: #666;
        }
        .attempt {
            border: 1px solid #ddd;
            border-radius: 8px;
            margin-bottom: 20px;
            padding: 20px;
            background-color: white;
        }
        .attempt-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
        }
        .attempt-score {
            font-size: 18px;
            font-weight: bold;
        }
        .score-excellent { color: #27ae60; }
        .score-good { color: #f39c12; }
        .score-poor { color: #e74c3c; }
        .question {
            margin-bottom: 20px;
            padding: 15px;
            border-left: 4px solid #ddd;
        }
        .question.correct {
            border-left-color: #27ae60;
            background-color: #d4edda;
        }
        .question.incorrect {
            border-left-color: #e74c3c;
            background-color: #f8d7da;
        }
        .question-text {
            font-weight: bold;
            margin-bottom: 10px;
        }
        .options {
            margin-bottom: 10px;
        }
        .option {
            margin: 5px 0;
            padding: 5px 0;
        }
        .selected {
            font-weight: bold;
            background-color: #fff3cd;
            padding: 3px 8px;
            border-radius: 3px;
        }
        .correct {
            color: #27ae60;
        }
        .incorrect {
            color: #e74c3c;
        }
        .explanation {
            margin-top: 10px;
            padding: 10px;
            background-color: #e9ecef;
            border-radius: 4px;
            font-style: italic;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
        @media print {
            body { margin: 10px; }
            .attempt { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">Quiz Results Report</h1>
        <div class="subtitle">${quiz.title}</div>
        <div class="subtitle">Generated on ${new Date().toLocaleDateString()}</div>
    </div>

    <div class="summary">
        <h2>Performance Summary</h2>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-value">${attempts.length}</div>
                <div class="summary-label">Total Attempts</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">${attempts.length > 0 ? Math.round(attempts.reduce((sum, a) => sum + parseFloat(a.score), 0) / attempts.length) : 0}%</div>
                <div class="summary-label">Average Score</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">${attempts.length > 0 ? Math.max(...attempts.map(a => parseFloat(a.score))) : 0}%</div>
                <div class="summary-label">Best Score</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">${attempts.length > 0 ? attempts.filter(a => parseFloat(a.score) >= 70).length : 0}</div>
                <div class="summary-label">Passing Attempts (70%+)</div>
            </div>
        </div>
    </div>

    ${attempts.map((attempt, index) => {
      const score = parseFloat(attempt.score);
      const scoreClass = score >= 80 ? 'score-excellent' : score >= 60 ? 'score-good' : 'score-poor';

      return `
        <div class="attempt">
            <div class="attempt-header">
                <div>
                    <strong>Attempt #${attempts.length - index}</strong>
                    <div style="font-size: 14px; color: #666;">
                        ${new Date(attempt.submitted_at).toLocaleString()}
                    </div>
                </div>
                <div class="attempt-score ${scoreClass}">
                    ${score}% (${attempt.correct_count}/${attempt.total_count} correct)
                </div>
            </div>

            ${attempt.answers && attempt.answers[0] ? attempt.answers.map((answer, qIndex) => `
                <div class="question ${answer.is_correct ? 'correct' : 'incorrect'}">
                    <div class="question-text">Question ${qIndex + 1}: ${answer.question_text}</div>
                    <div class="options">
                        ${answer.options.map((option, optIndex) => `
                            <div class="option ${optIndex === answer.selected_index ? 'selected' : ''} ${optIndex === answer.correct_index ? 'correct' : optIndex === answer.selected_index && !answer.is_correct ? 'incorrect' : ''}">
                                ${String.fromCharCode(65 + optIndex)}. ${option}
                                ${optIndex === answer.correct_index ? ' ✓' : ''}
                                ${optIndex === answer.selected_index ? ' ← Your answer' : ''}
                            </div>
                        `).join('')}
                    </div>
                    ${answer.explanation ? `
                        <div class="explanation">
                            <strong>Explanation:</strong> ${answer.explanation}
                        </div>
                    ` : ''}
                </div>
            `).join('') : '<div>No detailed answers available for this attempt.</div>'}
        </div>
      `;
    }).join('')}

    <div class="footer">
        <p>This report was generated by SmartLearn AI Quiz Platform</p>
        <p>For questions or support, please contact support@smartlearn.com</p>
    </div>
</body>
</html>`;

  // Return the HTML content
  // In a real implementation, you would use a library like Puppeteer or jsPDF to convert this to actual PDF
  // For now, returning HTML that browsers can render as PDF
  return Buffer.from(html, 'utf8');
};

export default {
  exportQuizResultsToPDF
};