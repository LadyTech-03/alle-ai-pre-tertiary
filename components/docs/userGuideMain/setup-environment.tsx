"use client";
import Link from "next/link";
import RenderCode from "@/components/RenderCode";
import ArticleFeedback from "../articleFeedback";
import DocsFooter from "../simpleFooterDocs";
// components
export default function SetupEnvironment() {
  return (
    <main>
      {/* intro section for developers */}
      <section id="sdk-introduction" className="max-w-3xl mb-10 ">
        <h2 className="font-bold text-2xl mb-2 text-muted-foreground">
          Get familiar with the AlleAI API and our server-side SDKs.
        </h2>
        <p className="text-muted-foreground mb-7 ">
          AlleAI's REST API lets you access multiple AI models like ChatGPT,
          Claude AI, Grok and many more models available for chat, image, audio
          and video generation through a single request. Use it for chat, audio,
          image, or video tasks without juggling separate APIs. Send one call
          and get responses from the best models for your needs.
        </p>
        <h2 className="font-bold mb-3 ">Use Our SDKs</h2>
        <p className="text-muted-foreground mb-4 ">
          Avoid writing boilerplate code with our Node.js and Python SDKs.
          Choose a language and follow a quickstart guide to start sending
          requests from your environment.
        </p>
        <div className=" ">
          <ul className="list-disc list-inside font-semibold space-y-2">
            <li className="text-muted-foreground font-sm ">
              <span className="font-bold">Node.js:&nbsp;</span>
              Built for web apps and real-time use cases.
            </li>
            <li className="text-muted-foreground font-sm ">
              <span className="font-bold">Python:&nbsp;</span>
              Made for scripting, prototyping, and data tasks.
            </li>
          </ul>
        </div>~
      </section>
      <hr className="border-t-1 dark:border-zinc-700 border-gray-200 " />
      {/* installations */}
      <section id="api-key-setup" className="mt-8 mb-10">
        <div className="">
          <h1 className="mb-2 font-semibold ">Get Your API Key</h1>
          {/* <p className="text-muted-foreground ">
            To start making requests, you'll need an API key. Follow these
            steps:
          </p> */}
          <ol className="list-decimal  text-muted-foreground mb-6">
            <li>
              Click&nbsp;
              <Link target="_blank" href="https://your-api-dashboard-link.com">
                <span className=" italic text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold">
                  here &nbsp;
                </span>
              </Link>
              to get access to the API dashboard.
            </li>
            <li>In the dashboard, create a new API key.</li>
            <li>
              Copy your API key this will be used for authenticating your
              requests.
            </li>
          </ol>
        </div>
      </section>
      {/* packages installations */}
      <section id="package-installation" className="max-w-3xl mb-8 ">
        <h2 className="font-semibold mb-4">Installing Dependencies</h2>
        <p className="text-muted-foreground mb-4">
          To use the API, install the &nbsp;
          <span className="font-semibold bg-gray-100 px-2 py-0.5   dark:bg-gray-700 rounded">
            alleai-sdk
          </span>
          &nbsp; for your runtime (Python 3.8+ or Node.js v16+). No other
          dependencies are needed.
        </p>
        {/* python */}
        <div className="max-w-2xl">
          <RenderCode
            language="python"
            code="pip install alleai-sdk"
            showLanguage={true}
          />
          <p className="mt-4 mb-5 text-muted-foreground gap-2">
            Installs the &nbsp;
            <span className="font-semibold   bg-gray-100 px-2 py-0.5   dark:bg-gray-700 rounded">
              alleai-sdk
            </span>
            . Optional: use virtual env &nbsp;
            <span className="bg-gray-100 px-2 py-0.5   dark:bg-gray-700 rounded">
              python -m venv venv
            </span>
            &nbsp; and &nbsp;
            <span className="py-1.5">
              <span className="bg-gray-100 px-2 py-0.5   dark:bg-gray-700 rounded">
                source venv/bin/activate
              </span>
            </span>
          </p>
          {/* nodejs */}
          <RenderCode
            language="javascript"
            code="npm install alleai-sdk"
            showLanguage={true}
          />
          <p className="mt-4 mb-5 text-muted-foreground"></p>
        </div>
      </section>
      <hr className="border-t-1 dark:border-zinc-700 border-gray-200 " />
      {/* snippets section */}
      <section id="environment-setup" className="max-w-2xl mb-6">
        <div className="max-w-2xl mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Setting Up Environment Variables
          </h2>
          <p className="mb-5 text-muted-foreground">
            You'll need an API_KEY to authenticate with the API. Get it from
            your API dashboard. While the API doesn't require environment
            variables, it's best practice to store the key securely in a .env
            file.
          </p>

          <p className="mb-2 text-muted-foreground">
            Create a .env file in the project root:
          </p>
          <RenderCode language="bash" code="touch .env" showLanguage={true} />

          <p className="mt-4 mb-2 text-muted-foreground">Add your API key:</p>
          <RenderCode
            language="env"
            code="ALLEAI_API_KEY=your_secret_key  # From API dashboard"
            showLanguage={true}
          />

          <p className="mt-4 mb-2 font-semibold">Why Use It:</p>
          <p className="mb-5 text-muted-foreground">
            <span className="font-semibold bg-gray-100 px-2 py-0.5 dark:bg-gray-700 rounded">
              API_KEY
            </span>
            : Your unique key for API access. Keep it secret and avoid
            hardcoding it in your source files.
          </p>

          <p className="mb-2 font-semibold">Load the Key (Optional):</p>
          <p className="mb-2 text-muted-foreground">
            Node.js: Use the key directly or via .env:
          </p>
          <RenderCode
            language="javascript"
            code={`const alleai = require('alleai-sdk');
const client = new alleai.Client({ apiKey: process.env.ALLEAI_API_KEY || 'your_secret_key' });`}
            showLanguage={true}
          />

          <p className="mt-4 mb-2 text-muted-foreground">
            Python: Use it directly or via .env:
          </p>
          <RenderCode
            language="python"
            code={`from alleai.core import AlleAIClient
import os
client = AlleAIClient(api_key=os.getenv("ALLEAI_API_KEY", "your_secret_key"))`}
            showLanguage={true}
          />

          <p className="mt-4 text-muted-foreground">
            Best Practice: Storing{" "}
            <span className="font-semibold bg-gray-100 px-2 py-0.4 dark:bg-gray-700 rounded">
              API_KEY
            </span>{" "}
            in .env and loading it keeps your code secure and portable. Add{" "}
            <span className="font-semibold bg-gray-100 px-2 py-0.4 dark:bg-gray-700 rounded">
              .env
            </span>{" "}
            to{" "}
            <span className="font-semibold bg-gray-100 px-2 py-0.4 dark:bg-gray-700 rounded">
              .gitignore
            </span>{" "}
            to avoid sharing it.
          </p>
        </div>
        <div className="">
          <div className="max-w-2xl mt-6">
            <p className="mb-4 text-muted-foreground">
              You've finished setting up your development environment. &nbsp;
              <span>
                <Link
                  href={"/docs/user-guides/first-request"}
                  className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-transform transform hover:scale-105"
                >
                  Proceed to First Request →
                </Link>
              </span>
            </p>
          </div>
        </div>
      </section>
      {/* feedbacks */}
      <section>
        <div className="mb-4">
          <ArticleFeedback />
        </div>
        <div>
          <DocsFooter />
        </div>
      </section>
    </main>
  );
}