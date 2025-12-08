import React, { useState } from 'react';
import { Download, ChevronDown, Copy, Check } from 'lucide-react';
import { Citation } from '../types';
import { formatCitation, getFileExtension, FORMAT_LABELS, CitationFormat } from '../logic/citationFormatting';

// --- Individual Citation Download Component ---

export const CitationDownloadButtons: React.FC<{ citation: Citation; menuDirection?: 'down' | 'up' }> = ({ citation, menuDirection = 'down' }) => {
    const [showMenu, setShowMenu] = useState(false);

    const handleDownload = (format: CitationFormat) => {
        const content = formatCitation(citation, format);
        const ext = getFileExtension(format);
        const key = `${citation.authors.split(',')[0].split(' ').pop()?.toLowerCase()}${citation.year}`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${key}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setShowMenu(false);
    };

    const handleCopy = async (format: CitationFormat) => {
        const content = formatCitation(citation, format);
        await navigator.clipboard.writeText(content);
        setShowMenu(false);
    };

    const menuPositionClasses = menuDirection === 'up'
        ? 'bottom-full mb-1'
        : 'top-full mt-1';

    return (
        <div className="relative">
            <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-medium bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded border border-zinc-700 hover:border-zinc-600 transition-colors"
            >
                <Download className="w-2.5 h-2.5" />
                Export
                <ChevronDown className={`w-2.5 h-2.5 transition-transform ${showMenu && menuDirection === 'up' ? 'rotate-180' : ''}`} />
            </button>

            {showMenu && (
                <>
                    <div className="fixed inset-0 z-[100]" onClick={() => setShowMenu(false)} />
                    <div className={`absolute right-0 ${menuPositionClasses} z-[101] bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl min-w-[140px] overflow-hidden`}>
                        <div className="text-[8px] text-zinc-500 uppercase tracking-wider px-2 py-1 border-b border-zinc-800">
                            Copy to Clipboard
                        </div>
                        {(['apa', 'mla', 'chicago', 'vancouver', 'bibtex'] as CitationFormat[]).map(format => (
                            <button
                                key={`copy-${format}`}
                                onClick={() => handleCopy(format)}
                                className="w-full text-left px-2 py-1.5 text-[10px] text-zinc-300 hover:bg-zinc-800 flex items-center gap-2"
                            >
                                <Copy className="w-2.5 h-2.5 text-zinc-500" />
                                {FORMAT_LABELS[format]}
                            </button>
                        ))}
                        <div className="text-[8px] text-zinc-500 uppercase tracking-wider px-2 py-1 border-t border-zinc-800">
                            Download File
                        </div>
                        {(['bibtex', 'ris', 'endnote'] as CitationFormat[]).map(format => (
                            <button
                                key={`dl-${format}`}
                                onClick={() => handleDownload(format)}
                                className="w-full text-left px-2 py-1.5 text-[10px] text-zinc-300 hover:bg-zinc-800 flex items-center gap-2"
                            >
                                <Download className="w-2.5 h-2.5 text-emerald-500" />
                                {FORMAT_LABELS[format]} (.{getFileExtension(format)})
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

// --- Bulk Export Dropdown Components ---

export const BulkCopyDropdown: React.FC<{ citations: Citation[] }> = ({ citations }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);

    const handleCopy = async (format: CitationFormat) => {
        const content = citations.map(c => formatCitation(c, format)).join('\n\n');
        await navigator.clipboard.writeText(content);
        setCopied(format);
        setTimeout(() => setCopied(null), 1500);
        setTimeout(() => setShowMenu(false), 800);
    };

    return (
        <div className="relative">
            <button
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 hover:text-white rounded border border-zinc-700 hover:border-zinc-600 transition-colors"
            >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy All'}
                <ChevronDown className="w-3 h-3" />
            </button>

            {showMenu && (
                <>
                    <div className="fixed inset-0 z-[100]" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 top-full mt-1 z-[101] bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl min-w-[120px] overflow-hidden">
                        {(['apa', 'mla', 'chicago', 'vancouver', 'bibtex'] as CitationFormat[]).map(format => (
                            <button
                                key={format}
                                onClick={() => handleCopy(format)}
                                className="w-full text-left px-3 py-1.5 text-[10px] text-zinc-300 hover:bg-zinc-800 flex items-center gap-2"
                            >
                                {copied === format ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-500" />}
                                {FORMAT_LABELS[format]}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export const BulkDownloadDropdown: React.FC<{ citations: Citation[] }> = ({ citations }) => {
    const [showMenu, setShowMenu] = useState(false);

    const handleDownload = (format: CitationFormat) => {
        const content = citations.map(c => formatCitation(c, format)).join('\n\n');
        const ext = getFileExtension(format);
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resample-lab-citations.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setShowMenu(false);
    };

    return (
        <div className="relative">
            <button
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 rounded border border-emerald-500/30 transition-colors"
            >
                <Download className="w-3 h-3" />
                Download All
                <ChevronDown className="w-3 h-3" />
            </button>

            {showMenu && (
                <>
                    <div className="fixed inset-0 z-[100]" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 top-full mt-1 z-[101] bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl min-w-[140px] overflow-hidden">
                        {(['bibtex', 'ris', 'endnote', 'apa', 'mla', 'chicago', 'vancouver'] as CitationFormat[]).map(format => (
                            <button
                                key={format}
                                onClick={() => handleDownload(format)}
                                className="w-full text-left px-3 py-1.5 text-[10px] text-zinc-300 hover:bg-zinc-800 flex items-center gap-2"
                            >
                                <Download className="w-3 h-3 text-emerald-500" />
                                {FORMAT_LABELS[format]} (.{getFileExtension(format)})
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
