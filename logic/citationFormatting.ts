import { Citation } from '../types';

export type CitationFormat = 'bibtex' | 'apa' | 'mla' | 'chicago' | 'vancouver' | 'ris' | 'endnote';

export const FORMAT_LABELS: Record<CitationFormat, string> = {
    bibtex: 'BibTeX',
    apa: 'APA',
    mla: 'MLA',
    chicago: 'Chicago',
    vancouver: 'Vancouver',
    ris: 'RIS',
    endnote: 'EndNote'
};

const formatBibtex = (citation: Citation): string => {
    const type = citation.journal.toLowerCase().includes('proceedings') ? 'inproceedings' :
        citation.journal.toLowerCase().includes('arxiv') ? 'misc' : 'article';
    // Use first author's last name + year as key
    const key = `${citation.authors.split(',')[0].split(' ').pop()?.toLowerCase()}${citation.year}`;

    if (type === 'inproceedings') {
        return `@inproceedings{${key},
  author = {${citation.authors}},
  title = {${citation.title}},
  booktitle = {${citation.journal}},
  year = {${citation.year}}
}`;
    } else if (type === 'misc') {
        return `@misc{${key},
  author = {${citation.authors}},
  title = {${citation.title}},
  howpublished = {${citation.journal}},
  year = {${citation.year}}
}`;
    }
    return `@article{${key},
  author = {${citation.authors}},
  title = {${citation.title}},
  journal = {${citation.journal}},
  year = {${citation.year}}
}`;
};

const formatAPA = (citation: Citation): string => {
    return `${citation.authors} (${citation.year}). ${citation.title}. ${citation.journal}.`;
};

const formatMLA = (citation: Citation): string => {
    // MLA format: Authors. "Title." Journal, Year.
    return `${citation.authors}. "${citation.title}." ${citation.journal}, ${citation.year}.`;
};

const formatChicago = (citation: Citation): string => {
    // Chicago format: Authors. "Title." Journal (Year).
    return `${citation.authors}. "${citation.title}." ${citation.journal} (${citation.year}).`;
};

const formatVancouver = (citation: Citation): string => {
    // Vancouver format: Authors. Title. Journal. Year.
    return `${citation.authors}. ${citation.title}. ${citation.journal}. ${citation.year}.`;
};

const formatRIS = (citation: Citation): string => {
    const type = citation.journal.toLowerCase().includes('proceedings') ? 'CONF' :
        citation.journal.toLowerCase().includes('arxiv') ? 'UNPB' : 'JOUR';
    return `TY  - ${type}
AU  - ${citation.authors.split(', ').join('\nAU  - ')}
TI  - ${citation.title}
JO  - ${citation.journal}
PY  - ${citation.year}
ER  - `;
};

const formatEndNote = (citation: Citation): string => {
    // EndNote export format (similar to RIS)
    const type = citation.journal.toLowerCase().includes('proceedings') ? 'Conference Proceedings' :
        citation.journal.toLowerCase().includes('arxiv') ? 'Preprint' : 'Journal Article';
    return `%0 ${type}
%A ${citation.authors.split(', ').join('\n%A ')}
%T ${citation.title}
%J ${citation.journal}
%D ${citation.year}`;
};

export const formatCitation = (citation: Citation, format: CitationFormat): string => {
    switch (format) {
        case 'bibtex': return formatBibtex(citation);
        case 'apa': return formatAPA(citation);
        case 'mla': return formatMLA(citation);
        case 'chicago': return formatChicago(citation);
        case 'vancouver': return formatVancouver(citation);
        case 'ris': return formatRIS(citation);
        case 'endnote': return formatEndNote(citation);
    }
};

export const getFileExtension = (format: CitationFormat): string => {
    switch (format) {
        case 'bibtex': return 'bib';
        case 'ris': return 'ris';
        case 'endnote': return 'enw';
        default: return 'txt';
    }
};
