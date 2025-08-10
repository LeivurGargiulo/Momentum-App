import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Search, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es as esLocale } from 'date-fns/locale';

const JournalTimeline = ({ entries, onDateClick }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEntries, setFilteredEntries] = useState(entries);

  // Filter entries based on search term
  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredEntries(entries);
    } else {
      const filtered = entries.filter(entry => 
        entry.text.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredEntries(filtered);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const currentLanguage = localStorage.getItem('momentum-language') || 'en';
    const locale = currentLanguage === 'es' ? esLocale : undefined;
    return format(date, t('dateNavigation.dateFormat'), { locale });
  };

  const getEntryPreview = (text) => {
    if (text.length <= 150) return text;
    return text.substring(0, 150) + '...';
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('journal.timeline')}
          </h3>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('journal.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="text-center py-8">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? t('journal.noSearchResults') : t('journal.noEntries')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry, index) => (
            <div
              key={entry.date}
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              onClick={() => onDateClick && onDateClick(entry.date)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(entry.date)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{entry.text.length} {t('journal.characters')}</span>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {getEntryPreview(entry.text)}
              </p>
              
              {entry.text.length > 150 && (
                <div className="mt-2">
                  <span className="text-xs text-purple-600 dark:text-purple-400">
                    {t('journal.clickToView')}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Search Results Summary */}
      {searchTerm && filteredEntries.length > 0 && (
        <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <p className="text-sm text-purple-800 dark:text-purple-200">
            {t('journal.searchResults', { count: filteredEntries.length, total: entries.length })}
          </p>
        </div>
      )}
    </div>
  );
};

export default JournalTimeline;