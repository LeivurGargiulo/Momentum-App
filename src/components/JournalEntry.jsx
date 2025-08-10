import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Save, Edit3, Trash2, Check } from 'lucide-react';

const JournalEntry = ({ 
  journalText, 
  onSave, 
  onClear, 
  isEditing = false, 
  onToggleEdit,
  disabled = false 
}) => {
  const { t } = useTranslation();
  const [text, setText] = useState(journalText || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  const MAX_CHARACTERS = 500;
  const characterCount = text.length;
  const isOverLimit = characterCount > MAX_CHARACTERS;
  const hasContent = text.trim().length > 0;

  // Update local state when prop changes
  useEffect(() => {
    setText(journalText || '');
  }, [journalText]);

  const handleSave = async () => {
    if (!hasContent || isOverLimit) return;
    
    setIsSaving(true);
    try {
      await onSave(text.trim());
    } catch (error) {
      console.error('Error saving journal entry:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    setText('');
    onClear();
    setShowClearConfirm(false);
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    if (newText.length <= MAX_CHARACTERS) {
      setText(newText);
    }
  };

  const getCharacterCountColor = () => {
    if (isOverLimit) return 'text-red-500';
    if (characterCount > MAX_CHARACTERS * 0.9) return 'text-orange-500';
    return 'text-gray-500 dark:text-gray-400';
  };

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('journal.dailyReflection')}
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Edit Toggle Button */}
          {hasContent && !isEditing && (
            <button
              onClick={onToggleEdit}
              disabled={disabled}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title={t('journal.edit')}
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
          
          {/* Save Button */}
          {isEditing && (
            <button
              onClick={handleSave}
              disabled={!hasContent || isOverLimit || isSaving || disabled}
              className="btn-primary px-3 py-1 text-sm flex items-center gap-1"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {t('journal.saving')}
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {t('journal.save')}
                </>
              )}
            </button>
          )}
          
          {/* Clear Button */}
          {hasContent && !isEditing && (
            <button
              onClick={() => setShowClearConfirm(true)}
              disabled={disabled}
              className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              title={t('journal.clear')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Journal Text Area */}
      <div className="space-y-3">
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder={t('journal.placeholder')}
          disabled={!isEditing || disabled}
          className={`
            input-field min-h-[120px] resize-none transition-all duration-200
            ${isEditing ? 'border-blue-300 dark:border-blue-600' : 'border-gray-200 dark:border-gray-600'}
            ${isOverLimit ? 'border-red-300 dark:border-red-600' : ''}
            ${!isEditing ? 'bg-gray-50 dark:bg-gray-800 cursor-default' : ''}
          `}
          rows={5}
          maxLength={MAX_CHARACTERS}
        />
        
        {/* Character Counter */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className={`${getCharacterCountColor()}`}>
              {characterCount}/{MAX_CHARACTERS} {t('journal.characters')}
            </span>
            {isOverLimit && (
              <span className="text-red-500 text-xs">
                {t('journal.overLimit')}
              </span>
            )}
          </div>
          
          {/* Word Count */}
          <span className="text-gray-500 dark:text-gray-400">
            {text.trim().split(/\s+/).filter(word => word.length > 0).length} {t('journal.words')}
          </span>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('journal.clearConfirmTitle')}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {t('journal.clearConfirmMessage')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 btn-secondary"
              >
                {t('journal.cancel')}
              </button>
              <button
                onClick={handleClear}
                className="flex-1 btn-danger"
              >
                {t('journal.clear')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      {!hasContent && !isEditing && (
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            {t('journal.helpText')}
          </p>
        </div>
      )}
    </div>
  );
};

export default JournalEntry;