import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, MessageCircle, FileText, Book, Mail, ExternalLink } from 'lucide-react';

const HelpSupport: React.FC = () => {
  const faqItems = [
    {
      question: 'How do I upload files for quiz generation?',
      answer: 'Go to the Upload Files page, select your PDF or DOCX file, and click upload. Our AI will then generate questions based on your content.'
    },
    {
      question: 'What file formats are supported?',
      answer: 'We currently support PDF and Microsoft Word documents (.docx). Files up to 50MB are supported.'
    },
    {
      question: 'How can I track my quiz progress?',
      answer: 'Visit the Dashboard page where you can see your recent attempts, average scores, and performance analytics.'
    },
    {
      question: 'Can I edit or delete created quizzes?',
      answer: 'Currently, you can view all your quizzes on the My Quizzes page. Editing and deletion features are coming soon.'
    }
  ];

  const supportOptions = [
    {
      icon: MessageCircle,
      title: 'Live Chat Support',
      description: 'Get instant help from our support team',
      action: 'Chat Now',
      link: '#'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us an email and we\'ll get back to you within 24 hours',
      action: 'Send Email',
      link: 'mailto:support@smartlearn.ai'
    },
    {
      icon: FileText,
      title: 'Documentation',
      description: 'Find step-by-step guides and tutorials',
      action: 'View Docs',
      link: '#'
    },
    {
      icon: Book,
      title: 'FAQ',
      description: 'Check common questions and answers',
      action: 'View FAQ',
      link: '#faq'
    }
  ];

  return (
    <div className="min-h-screen py-8 bg-bg-primary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Help & Support</h1>
          <p className="text-text-secondary">We're here to help you get the most out of SmartLearn AI</p>
        </motion.div>

        {/* Support Options */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {supportOptions.map((option, index) => (
            <div
              key={index}
              className="bg-bg-secondary rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 group"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                  <option.icon className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-text-primary group-hover:text-primary-600 transition-colors">
                    {option.title}
                  </h3>
                  <p className="text-text-secondary text-sm mb-3">{option.description}</p>
                  <a
                    href={option.link}
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    {option.action}
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          className="bg-bg-secondary rounded-xl shadow-lg p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center mb-6">
            <Book className="w-6 h-6 text-primary-600 mr-3" />
            <h2 className="text-xl font-bold text-text-primary">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <details
                key={index}
                className="border-b border-border-primary pb-4 group"
              >
                <summary className="flex items-center justify-between cursor-pointer py-2">
                  <h3 className="font-semibold text-text-primary group-hover:text-primary-600 transition-colors pr-4">
                    {item.question}
                  </h3>
                  <svg
                    className="w-5 h-5 text-text-tertiary group-hover:text-primary-500 transition-transform group-open:rotate-90"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </summary>
                <p className="text-text-secondary mt-2 pl-4 border-l-2 border-primary-200">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          className="mt-8 bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-xl font-bold text-text-primary mb-4">Still Need Help?</h3>
          <p className="text-text-secondary mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold">
              Contact Support
            </button>
            <a
              href="mailto:support@smartlearn.ai"
              className="px-6 py-3 bg-bg-secondary text-text-primary rounded-lg hover:bg-bg-tertiary transition-colors font-semibold inline-block text-center"
            >
              Email Us
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HelpSupport;
