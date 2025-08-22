'use client';

import { useState } from 'react';

export default function Home() {
  const [jobDescription, setJobDescription] = useState('');
  const [resume, setResume] = useState('');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<{
    tailoredResume: string;
    coverLetter: string;
    interviewPrep: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'tailoredResume' | 'coverLetter' | 'interviewPrep'>('tailoredResume');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!jobDescription.trim() || !resume.trim()) {
      alert('Please paste both a job description and your resume.');
      return;
    }

    setLoading(true);
    setOutput(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription, resume }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Generation failed');
      }

      const data = await res.json();

      // Split plain text into sections based on headings
      const text = data.result as string;
      const tailoredMatch = text.match(/Tailored Resume[:\n]*(.*?)(?=Cover Letter[:\n])/s);
      const coverLetterMatch = text.match(/Cover Letter[:\n]*(.*?)(?=Interview Preparation[:\n])/s);
      const interviewMatch = text.match(/Interview Preparation[:\n]*(.*)$/s);

      setOutput({
        tailoredResume: tailoredMatch?.[1].trim() || '(No tailored resume generated)',
        coverLetter: coverLetterMatch?.[1].trim() || '(No cover letter generated)',
        interviewPrep: interviewMatch?.[1].trim() || '(No interview prep generated)',
      });

      setActiveTab('tailoredResume');
    } catch (err: any) {
      alert(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  function downloadText(text = '', filename = 'output.txt') {
    if (!text.trim()) {
      alert('Nothing to download. Generate the content first.');
      return;
    }
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-white shadow-md z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-indigo-700 select-none">AI Job Assistant</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow max-w-6xl mx-auto px-6 py-10 w-full">
        {/* Input Section */}
        <section id="input" className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Enter Job Description & Resume</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-1 font-medium text-gray-700">Job Description</label>
              <textarea
                className="w-full rounded-md border border-gray-300 p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                rows={6}
                placeholder="Paste the full job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700">Your Resume (plain text)</label>
              <textarea
                className="w-full rounded-md border border-gray-300 p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                rows={6}
                placeholder="Paste your resume here..."
                value={resume}
                onChange={(e) => setResume(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-md font-semibold shadow disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Application'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setJobDescription('');
                  setResume('');
                  setOutput(null);
                }}
                className="text-gray-600 hover:underline"
              >
                Clear
              </button>
            </div>
          </form>
        </section>

        {/* Results Section */}
        <section id="results" className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Results</h2>
          {!output && <p className="text-gray-500 italic">No results yet — generate to see tailored output here.</p>}
          {output && (
            <>
              <nav className="flex border-b border-gray-200 mb-4 space-x-4">
                {['tailoredResume', 'coverLetter', 'interviewPrep'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`pb-2 font-medium border-b-2 ${
                      activeTab === tab
                        ? 'border-indigo-600 text-indigo-700'
                        : 'border-transparent text-gray-500 hover:text-indigo-600'
                    }`}
                  >
                    {tab === 'tailoredResume'
                      ? 'Tailored Resume'
                      : tab === 'coverLetter'
                      ? 'Cover Letter'
                      : 'Interview Prep'}
                  </button>
                ))}
              </nav>

              <div className="min-h-[180px] whitespace-pre-wrap text-gray-800 bg-indigo-50 rounded-md p-4 border border-indigo-200 text-sm">
                {activeTab === 'tailoredResume' && output.tailoredResume}
                {activeTab === 'coverLetter' && output.coverLetter}
                {activeTab === 'interviewPrep' && output.interviewPrep}
              </div>

              {/* Download Buttons */}
              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => downloadText(output.tailoredResume, 'tailored-resume.txt')}
                  className="px-4 py-2 rounded bg-indigo-100 text-indigo-700 font-semibold hover:bg-indigo-200"
                >
                  Download Resume
                </button>
                <button
                  onClick={() => downloadText(output.coverLetter, 'cover-letter.txt')}
                  className="px-4 py-2 rounded bg-indigo-100 text-indigo-700 font-semibold hover:bg-indigo-200"
                >
                  Download Cover Letter
                </button>
                <button
                  onClick={() => downloadText(output.interviewPrep, 'interview-prep.txt')}
                  className="px-4 py-2 rounded bg-indigo-100 text-indigo-700 font-semibold hover:bg-indigo-200"
                >
                  Download Interview Prep
                </button>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
