import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Share2, Copy, Check, X } from 'lucide-react';
import useStore from '../store/useStore';

const ShareStats = ({ timeRange }) => {
  const { t } = useTranslation();
  const { getShareStatsData } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Get statistics data for sharing
  const statsData = getShareStatsData(timeRange);

  // Generate share text based on statistics
  const generateShareText = () => {
    if (!statsData.hasData) {
      return t('statistics.noData');
    }

    const { completionRate, mostCompleted, leastCompleted, currentStreak } = statsData;

    // Get time range translation
    let timeRangeText = '';
    switch (timeRange) {
      case 'daily':
        timeRangeText = t('share.timeRangeDaily');
        break;
      case 'weekly':
        timeRangeText = t('share.timeRangeWeekly');
        break;
      case 'monthly':
        timeRangeText = t('share.timeRangeMonthly');
        break;
      default:
        timeRangeText = t('share.timeRangeDaily');
    }

    // Generate streak text
    let streakText = '';
    if (currentStreak > 0) {
      if (currentStreak === 1) {
        streakText = t('share.streakTextOne', { streak: currentStreak });
      } else {
        streakText = t('share.streakText', { streak: currentStreak });
      }
    }

    // Use appropriate template based on whether there's a streak
    if (streakText) {
      return t('share.statsSummary', {
        timeRange: timeRangeText,
        completionRate,
        mostCompleted,
        leastCompleted,
        streakText
      });
    } else {
      return t('share.statsSummaryNoStreak', {
        timeRange: timeRangeText,
        completionRate,
        mostCompleted,
        leastCompleted
      });
    }
  };

  const shareText = generateShareText();

  // Handle Web Share API
  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Momentum - My Activity Progress',
          text: shareText
        });
        showToast(t('statistics.shareSuccess'));
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          showToast(t('statistics.shareError'));
        }
      }
    } else {
      // Fallback to modal
      setShowModal(true);
    }
  };

  // Handle clipboard copy
  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopySuccess(true);
      showToast(t('statistics.statsCopied'));
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      showToast(t('statistics.shareError'));
    }
  };

  // Show toast notification
  const showToast = (message) => {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.classList.remove('translate-x-full');
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
      toast.classList.add('translate-x-full');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  };

  return (
    <>
      {/* Share Button */}
      <button
        onClick={handleWebShare}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        <Share2 className="w-4 h-4" />
        {t('statistics.shareStats')}
      </button>

      {/* Share Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('statistics.shareStatsTitle')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t('statistics.shareStatsDescription')}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <p className="text-gray-900 dark:text-white text-sm leading-relaxed">
                  {shareText}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleCopyToClipboard}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {copySuccess ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copySuccess ? t('statistics.copied') : t('statistics.copyToClipboard')}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('onboarding.cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareStats;