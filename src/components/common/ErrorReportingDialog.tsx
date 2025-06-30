import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { X, Send, Bug } from 'lucide-react';
import { captureMessage } from '../../services/errorService';

interface ErrorReportingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  prefillDescription?: string;
  errorId?: string;
}

export const ErrorReportingDialog: React.FC<ErrorReportingDialogProps> = ({
  isOpen,
  onClose,
  prefillDescription = '',
  errorId,
}) => {
  const [description, setDescription] = useState(prefillDescription);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) return;

    setIsSubmitting(true);
    
    try {
      const reportId = captureMessage(
        `User reported issue: ${description}`,
        'info',
        {
          type: 'user_report',
          userEmail: email,
          originalErrorId: errorId,
          userAgent: navigator.userAgent,
          url: window.location.href,
          reportType: 'user_feedback',
          hasContact: !!email,
        }
      );

      console.log('User report submitted:', reportId);
      setSubmitted(true);
      
      // Close after a delay
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setDescription('');
        setEmail('');
      }, 2000);
    } catch (error) {
      console.error('Failed to submit user report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 bg-slate-800 border-slate-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bug className="w-5 h-5 text-orange-400" />
              <h3 className="text-lg font-semibold text-white">Report an Issue</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <Send className="w-8 h-8 text-green-400" />
              </div>
              <h4 className="text-lg font-medium text-white mb-2">Report Sent!</h4>
              <p className="text-gray-300">Thank you for helping us improve ReadRise.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  What went wrong? *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={4}
                  placeholder="Describe the issue you encountered..."
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="your@email.com"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Optional. We'll only use this to follow up if needed.
                </p>
              </div>

              {errorId && (
                <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
                  <p className="text-xs text-gray-400">
                    Error ID: <code className="text-gray-300">{errorId}</code>
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!description.trim() || isSubmitting}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Report
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
};
