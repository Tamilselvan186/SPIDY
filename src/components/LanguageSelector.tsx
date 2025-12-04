interface LanguageSelectorProps {
  selectedLanguage: 'en-US' | 'ta-IN' | 'th-TH';
  onChange: (language: 'en-US' | 'ta-IN' | 'th-TH') => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selectedLanguage, onChange }) => {
  const languages = [
    { code: 'en-US' as const, name: 'English', flag: '🇺🇸' },
    { code: 'ta-IN' as const, name: 'Tamil', flag: '🇮🇳' },
    { code: 'th-TH' as const, name: 'Thanglish', flag: '🇹🇭' },
  ];

  return (
    <div className="flex gap-2">
      {languages.map(lang => (
        <button
          key={lang.code}
          onClick={() => onChange(lang.code)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            selectedLanguage === lang.code
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
          }`}
        >
          <span className="mr-1">{lang.flag}</span>
          {lang.name}
        </button>
      ))}
    </div>
  );
};
