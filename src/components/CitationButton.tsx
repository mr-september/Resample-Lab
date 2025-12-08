import React, { useState } from 'react';
import { Quote, Check, Copy, Download } from 'lucide-react';
import { CITATIONS } from '../data/citations';
import { formatCitation, getFileExtension, CitationFormat, FORMAT_LABELS } from '../logic/citationFormatting';

export const CitationButton = () => {
    const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
    const citation = CITATIONS.resampleLab2025;

    // Guard against missing citation (though it should be in types)
    if (!citation) return null;

    const handleCopy = async (format: CitationFormat) => {
        const content = formatCitation(citation, format);
        await navigator.clipboard.writeText(content);
        setCopiedFormat(format);
        setTimeout(() => setCopiedFormat(null), 2000);
    };

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
    };

    return (
        <div className="relative group flex items-center">
            <button
                className="text-zinc-500 hover:text-indigo-400 transition-colors flex items-center justify-center h-full"
                aria-label="Cite this Lab"
            >
                <Quote className="w-5 h-5" />
            </button>

            <div className="absolute top-full right-0 mt-4 w-96 p-4 bg-[#09090b] border border-zinc-800 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top translate-y-2 group-hover:translate-y-0 z-50">
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-3">
                    Cite Resample Lab
                </div>

                <div className="space-y-4">
                    {/* BibTeX */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-zinc-400">BibTeX</span>
                            <button
                                onClick={() => handleCopy('bibtex')}
                                className="flex items-center gap-1.5 text-[10px] text-zinc-500 hover:text-indigo-400 transition-colors"
                                aria-label="Copy BibTeX"
                            >
                                {copiedFormat === 'bibtex' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                {copiedFormat === 'bibtex' ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                        <pre className="text-[10px] leading-relaxed p-2 bg-zinc-900/50 rounded-lg border border-zinc-800 text-zinc-400 overflow-x-auto text-left scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                            {formatCitation(citation, 'bibtex')}
                        </pre>
                    </div>

                    {/* APA */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-zinc-400">APA</span>
                            <button
                                onClick={() => handleCopy('apa')}
                                className="flex items-center gap-1.5 text-[10px] text-zinc-500 hover:text-indigo-400 transition-colors"
                                aria-label="Copy APA"
                            >
                                {copiedFormat === 'apa' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                {copiedFormat === 'apa' ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                        <div className="text-[10px] leading-relaxed p-2 bg-zinc-900/50 rounded-lg border border-zinc-800 text-zinc-400 text-left">
                            {formatCitation(citation, 'apa')}
                        </div>
                    </div>

                    {/* Download Options */}
                    <div className="pt-3 border-t border-zinc-800">
                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">
                            Download Citation
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {(['bibtex', 'ris', 'endnote'] as CitationFormat[]).map(format => (
                                <button
                                    key={format}
                                    onClick={() => handleDownload(format)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-emerald-400 transition-colors text-[10px] text-left"
                                >
                                    <Download className="w-3 h-3" />
                                    {FORMAT_LABELS[format]} (.{getFileExtension(format)})
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
