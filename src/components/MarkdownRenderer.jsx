import React from 'react';

export default function MarkdownRenderer({ text }) {
  if (!text) return null;

  // Split by major sections (---)
  const sections = text.split('---').map(section => section.trim()).filter(Boolean);

  const renderSection = (content) => {
    const lines = content.split('\n');
    const elements = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed) {
        i++;
        continue;
      }

      // Handle headings (###)
      if (trimmed.startsWith('###')) {
        const heading = trimmed.replace(/^#+\s/, '').replace(/\s+$/, '');
        elements.push(
          <h3 key={`heading-${i}`} className="text-lg font-bold text-brand-green mt-4 mb-3">
            {heading}
          </h3>
        );
      }
      // Handle bold text within lines
      else if (trimmed.startsWith('*')) {
        // This is a bullet point
        const bulletText = trimmed.replace(/^\*\s/, '');
        const formattedText = formatInlineBold(bulletText);
        elements.push(
          <li key={`bullet-${i}`} className="ml-6 text-gray-700 text-[15px] leading-relaxed mb-2">
            {formattedText}
          </li>
        );
      }
      // Handle numbered lists
      else if (/^\d+\./.test(trimmed)) {
        const numberText = trimmed.replace(/^\d+\.\s/, '');
        const formattedText = formatInlineBold(numberText);
        elements.push(
          <li key={`number-${i}`} className="ml-6 text-gray-700 text-[15px] leading-relaxed mb-2 list-decimal">
            {formattedText}
          </li>
        );
      }
      // Handle sub-headings (####)
      else if (trimmed.startsWith('####')) {
        const subheading = trimmed.replace(/^#+\s/, '').replace(/\s+$/, '');
        elements.push(
          <h4 key={`subheading-${i}`} className="text-base font-semibold text-gray-800 mt-3 mb-2 ml-4">
            {subheading}
          </h4>
        );
      }
      // Handle regular paragraphs
      else {
        const formattedText = formatInlineBold(trimmed);
        elements.push(
          <p key={`para-${i}`} className="text-gray-700 text-[15px] leading-relaxed mb-3">
            {formattedText}
          </p>
        );
      }

      i++;
    }

    return elements;
  };

  const formatInlineBold = (text) => {
    if (!text) return text;

    // Handle **bold text** pattern
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return (
          <strong key={idx} className="font-bold text-gray-800">
            {boldText}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="prose prose-sm max-w-none text-gray-800 space-y-3">
      {sections.map((section, idx) => (
        <div key={`section-${idx}`} className="space-y-2">
          {renderSection(section)}
        </div>
      ))}
    </div>
  );
}
