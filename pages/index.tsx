import type { NextPage } from 'next';
import Head from 'next/head';
import { useRef, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { ulid } from 'ulid';
import Footer from '../components/Footer';
import Header from '../components/Header';
import LoadingDots from '../components/LoadingDots';
import ResizablePanel from '../components/ResizablePanel';
import MarkdownRenderer from '../components/MarkdownRenderer';

const Home: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [userQuestion, setUserQuestion] = useState('');
  const [answer, setAanswer] = useState<String>('');

  const answerRef = useRef<null | HTMLDivElement>(null);

  const scrollToAnswer = () => {
    if (answerRef.current !== null) {
      answerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const generateAnswer = async (e: KeyboardEvent) => {
    e.preventDefault();
    if (loading) {
      return;
    }
    setAanswer('');
    setLoading(true);

    // API logic
    const response = await fetch('/api/answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: userQuestion,
      }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setAanswer((prev) => prev + chunkValue);
    }

    scrollToAnswer();
    setLoading(false);
  };

  return (
    <div className="flex max-w-5xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Head>
        <title>Chargebee AI Assistant</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4">
        <h1 className="sm:text-4xl text-2xl max-w-[708px] font-bold text-slate-900">Ask me anything about Chargebee 🙂</h1>
        <div className="max-w-xl w-full">
          <form method="post" onSubmit={(e: any) => generateAnswer(e)}>
            <div className="relative mt-10">
              <input
                placeholder="What is Chargebee and what does Subscription Billing mean?"
                type="text"
                className=" block box-border w-full rounded-md shadow-sm transition-all text-scale-1200 border focus:shadow-md outline-none focus:ring-2 focus:ring-black focus:border-black focus:border-scale-900 focus:ring-scale-400 placeholder-scale-800   bg-scaleA-200 border-scale-700  pl-10 text-base px-6 py-3"
                value={userQuestion}
                onChange={(e) => setUserQuestion(e.target.value)}
              />
              <div className=" absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-scale-1100 ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="sbui-icon "
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
            </div>
            {!loading && (
              <button className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full" type="submit">
                Ask &rarr;
              </button>
            )}
          </form>
          {loading && (
            <button className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full" disabled>
              Thinking <LoadingDots color="white" style="large" />
            </button>
          )}
          <ResizablePanel>
            <AnimatePresence mode="wait">
              <motion.div className="my-10 space-y-10">
                {answer && (
                  <>
                    <div>
                      <h2 className="mx-auto text-3xl font-bold sm:text-4xl" ref={answerRef}>
                        Here is your answer:{' '}
                      </h2>
                    </div>
                    {answer.split('SOURCES:').map((splitanswer, index) => {
                      return (
                        <div
                          className={`p-4 transition bg-neutral border border-neutral-focus shadow-md rounded-xl overflow-x-auto max-w-xl ${
                            index === 0 ? 'hover:border-accent-focus cursor-copy text-left' : ''
                          }`}
                          onClick={() => {
                            if (index === 0) {
                              navigator.clipboard.writeText(splitanswer);
                              toast('Copied to clipboard!', {
                                icon: '✂️',
                              });
                            }
                          }}
                          key={index}
                        >
                          {index === 0 ? (
                            <MarkdownRenderer content={splitanswer.trim()} />
                          ) : (
                            <>
                              <p>SOURCES:</p>
                              <ul>
                                {splitanswer
                                  .trim()
                                  .split('\n')
                                  .filter((url) => url.trim().length > 0)
                                  .map((url) =>
                                    url.includes('http') ? (
                                      <li key={ulid()}>
                                        <a
                                          className="underline text-accent"
                                          target="_blank"
                                          href={url.replace(/^-+/g, '')} // Remove leading hyphens
                                        >
                                          {url.replace(/^-+/g, '')}
                                        </a>
                                      </li>
                                    ) : (
                                      <li key={ulid()}>{url}</li>
                                    )
                                  )}
                              </ul>
                            </>
                          )}
                          <style>
                            {`
                              p {
                                margin-bottom: 20px;
                              }
                            `}
                          </style>
                        </div>
                      );
                    })}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </ResizablePanel>
        </div>
        <Toaster position="top-center" reverseOrder={false} toastOptions={{ duration: 2000 }} />
        <hr className="h-px bg-gray-700 border-1 dark:bg-gray-700" />
        <div className="space-y-10 my-10"></div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
