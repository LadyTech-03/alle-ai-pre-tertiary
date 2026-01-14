export default function ApiUsageDocs() {
  return (
    <main className="flex gap-2">
      {/* main content */}
      <div className="lg:w-3/4 w-full">
        {/* ..........................section one : Rate limits and usage ............................. */}
        <section data-section="rate-limits"></section>
        <hr className="border-t-1 dark:border-zinc-700 border-gray-200 my-10 " />
        {/* ............... section two : changelogs ................... */}
        <section data-section="changelogs"></section>
        <hr className="border-t-1 dark:border-zinc-700 border-gray-200 my-10 " />
        {/* ............... section three : faq ................... */}
        <section data-section="faq"></section>
      </div>

      {/* table of contents */}
      <aside className="hidden lg:block w-1/4 sticky"></aside>
    </main>
  );
}
