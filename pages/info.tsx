import Head from 'next/head';
import Footer from '../components/Footer';
import { supabase } from '../utils/Supabase';
import Header from '../components/Header';

export default function InfoPage({ urls, error }: { urls: any[]; error: any }) {
  if (error) {
    return (
      <>
        <div>Sorry Something went wrong</div>
      </>
    );
  }
  return (
    <div className="flex max-w-5xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Head>
        <title>Chargebee AI Assistant</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <main className="flex flex-1 w-full flex-col items-center justify-center px-4">
        <h1 className="text-2xl max-w-[708px] font-bold text-slate-900">Bot has been currently context on these docs.</h1>
        <div className="w-full mt-4">
          {urls.map((url) => (
            <li key={url}>
              <a target="_blank" href={url}>
                {url}
              </a>
            </li>
          ))}
        </div>
        <hr className="h-px bg-gray-700 border-1 dark:bg-gray-700" />
        <div className="space-y-10 my-10"></div>
      </main>
      <Footer />
    </div>
  );
}

export async function getStaticProps() {
  const { data: urls, error } = await supabase.from('distinct_documents').select();

  return { props: { urls: urls?.map(({ url }) => url), error }, revalidate: 3600 };
}
