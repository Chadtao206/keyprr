import { useState } from "preact/hooks";
import toast, { Toaster } from "react-hot-toast";
import ToggleAction from "./components/toggle";
import "./app.css";

const baseURL =
  process.env.NODE_ENV === "production"
    ? "https://ljgvrb40q2.execute-api.us-west-2.amazonaws.com/dev/"
    : "http://localhost:3001/dev/";

const storeKey = async (key: string) => {
  const res = await fetch(`${baseURL}keyprr/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      secret: key,
    }),
  });
  if (!res.ok) throw new Error("Failed to store key");
  const { data } = await res.json();
  return data;
};

const getKey = async (id: string) => {
  const res = await fetch(`${baseURL}keyprr/${id}`);
  if (!res.ok) throw new Error("Failed to get key");
  return await res.json();
};

export default function App() {
  const [input, setInput] = useState<string>("");
  const [storedSecrets, setStoredSecrets] = useState<string[]>([]);
  const [isDownload, setIsDownload] = useState(false);
  const handleToggle = (val: boolean) => {
    setIsDownload(val);
    setInput("");
  };
  const handleSave = async (e: Event) => {
    e.preventDefault();
    if (isDownload) {
      const { data, success } = await getKey(input);
      if (success) {
        navigator.clipboard.writeText(data);
        toast.success("Retrieved, your secret is copied to clipboard!");
        setInput("");
      } else {
        toast.error("Failed to retrieve secret");
      }
    } else {
      toast.promise(
        storeKey(input),
        {
          loading: "Storing your secret...",
          success: (data: any) => {
            setStoredSecrets((prev) => [...prev, data]);
            setInput("");
            return `Secret stored! Your lookup key ${data} is copied to clipboard!`;
          },
          error: "Failed to store secret 💩",
        },
        {
          duration: 3000,
        }
      );
    }
  };
  const handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setInput(target.value);
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="bg-white py-16 sm:py-24 w-full h-full">
      <a
        href="https://github.com/Chadtao206/keyprr"
        target="_blank"
        rel="noreferrer"
      >
        <button className="fixed top-5 left-3 flex items-center rounded-md border border-transparent bg-indigo-500 text-base font-medium text-white shadow-lg hover:bg-indigo-700 py-2 px-4 transition-colors">
          <svg
            stroke="currentColor"
            fill="currentColor"
            stroke-width="0"
            viewBox="0 0 24 24"
            className="w-8 h-8"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm3.163 21.783h-.093a.513.513 0 0 1-.382-.14.513.513 0 0 1-.14-.372v-1.406c.006-.467.01-.94.01-1.416a3.693 3.693 0 0 0-.151-1.028 1.832 1.832 0 0 0-.542-.875 8.014 8.014 0 0 0 2.038-.471 4.051 4.051 0 0 0 1.466-.964c.407-.427.71-.943.885-1.506a6.77 6.77 0 0 0 .3-2.13 4.138 4.138 0 0 0-.26-1.476 3.892 3.892 0 0 0-.795-1.284 2.81 2.81 0 0 0 .162-.582c.033-.2.05-.402.05-.604 0-.26-.03-.52-.09-.773a5.309 5.309 0 0 0-.221-.763.293.293 0 0 0-.111-.02h-.11c-.23.002-.456.04-.674.111a5.34 5.34 0 0 0-.703.26 6.503 6.503 0 0 0-.661.343c-.215.127-.405.249-.573.362a9.578 9.578 0 0 0-5.143 0 13.507 13.507 0 0 0-.572-.362 6.022 6.022 0 0 0-.672-.342 4.516 4.516 0 0 0-.705-.261 2.203 2.203 0 0 0-.662-.111h-.11a.29.29 0 0 0-.11.02 5.844 5.844 0 0 0-.23.763c-.054.254-.08.513-.081.773 0 .202.017.404.051.604.033.199.086.394.16.582A3.888 3.888 0 0 0 5.702 10a4.142 4.142 0 0 0-.263 1.476 6.871 6.871 0 0 0 .292 2.12c.181.563.483 1.08.884 1.516.415.422.915.75 1.466.964.653.25 1.337.41 2.033.476a1.828 1.828 0 0 0-.452.633 2.99 2.99 0 0 0-.2.744 2.754 2.754 0 0 1-1.175.27 1.788 1.788 0 0 1-1.065-.3 2.904 2.904 0 0 1-.752-.824 3.1 3.1 0 0 0-.292-.382 2.693 2.693 0 0 0-.372-.343 1.841 1.841 0 0 0-.432-.24 1.2 1.2 0 0 0-.481-.101c-.04.001-.08.005-.12.01a.649.649 0 0 0-.162.02.408.408 0 0 0-.13.06.116.116 0 0 0-.06.1.33.33 0 0 0 .14.242c.093.074.17.131.232.171l.03.021c.133.103.261.214.382.333.112.098.213.209.3.33.09.119.168.246.231.381.073.134.15.288.231.463.188.474.522.875.954 1.145.453.243.961.364 1.476.351.174 0 .349-.01.522-.03.172-.028.343-.057.515-.091v1.743a.5.5 0 0 1-.533.521h-.062a10.286 10.286 0 1 1 6.324 0v.005z"></path>
          </svg>
          <span className="ml-2">DOCS</span>
        </button>
      </a>
      <Toaster />
      <div className="relative sm:py-16">
        <div aria-hidden="true" className="hidden sm:block">
          <div className="absolute inset-y-0 left-0 w-1/2 rounded-r-3xl  bg-gray-100" />
          <svg
            className="absolute top-8 left-1/2 -ml-3"
            width={404}
            height={392}
            fill="none"
            viewBox="0 0 404 392"
          >
            <defs>
              <pattern
                id="8228f071-bcee-4ec8-905a-2a059a2cc4fb"
                x={0}
                y={0}
                width={25}
                height={25}
                patternUnits="userSpaceOnUse"
              >
                <rect
                  x={0}
                  y={0}
                  width={4}
                  height={4}
                  className="text-gray-200"
                  fill="currentColor"
                />
              </pattern>
            </defs>
            <rect
              width={404}
              height={392}
              fill="url(#8228f071-bcee-4ec8-905a-2a059a2cc4fb)"
            />
          </svg>
        </div>
        <div className="mx-auto max-w-md px-4 sm:max-w-3xl sm:px-6 lg:max-w-7xl lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-indigo-600 px-6 py-10 shadow-xl sm:px-12 sm:py-20">
            <div
              aria-hidden="true"
              className="absolute inset-0 -mt-72 sm:-mt-32 md:mt-0"
            >
              <svg
                className="absolute inset-0 h-full w-full"
                preserveAspectRatio="xMidYMid slice"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 1463 360"
              >
                <path
                  className="text-indigo-500 text-opacity-40"
                  fill="currentColor"
                  d="M-82.673 72l1761.849 472.086-134.327 501.315-1761.85-472.086z"
                />
                <path
                  className="text-indigo-700 text-opacity-40"
                  fill="currentColor"
                  d="M-217.088 544.086L1544.761 72l134.327 501.316-1761.849 472.086z"
                />
              </svg>
            </div>
            <div className="relative">
              <div className="sm:text-center">
                <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  <span className="text-violet-200 font-bold">Keyprr</span> -
                  Store and retrieve your sensitive data
                </h2>
                <p className="mx-auto mt-6 max-w-2xl text-lg text-indigo-200">
                  One of the common issues students face on project 1 is not
                  being able to hide sensitive information such as API keys or
                  secrets to access a paid resource. The secrets are usually
                  hardcoded into the code itself and is exposed to the internet
                  due to the repositories being public. There are automated
                  processes which scan public repos for these secrets to
                  exploit. This is a simple solution to that problem. (Thanks to
                  <span className="text-white font-semibold"> Rudy</span> for
                  the inspiration)
                </p>
              </div>
              {/* toggle */}
              <div className="sm:mx-auto sm:flex sm:max-w-lg my-2">
                <ToggleAction
                  isDownload={isDownload}
                  setIsDownload={handleToggle}
                />
                <div className="px-2 font-semibold text-gray-50">
                  {isDownload ? "Retrieving" : "Storing"} your secret
                </div>
              </div>
              {/* toggle */}
              <form
                onSubmit={handleSave}
                action="#"
                className="mt-6 sm:mx-auto sm:flex sm:max-w-lg"
              >
                <div className="min-w-0 flex-1">
                  <label htmlFor="cta-secret" className="sr-only">
                    Secret
                  </label>
                  <input
                    onChange={handleInput}
                    value={input}
                    id="cta-secret"
                    type="text"
                    className="block w-full rounded-md border border-transparent px-5 py-3 text-base text-gray-900 placeholder-gray-500 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
                    placeholder={`Enter your ${isDownload ? "hash" : "secret"}`}
                  />
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-3">
                  <button
                    disabled={input.length === 0}
                    type="submit"
                    className="flex rounded-md border border-transparent bg-indigo-500 px-5 py-3 text-base font-medium text-white shadow hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 sm:px-10"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                      />
                    </svg>
                    <span className="mx-2">
                      {isDownload ? "Retrieve" : "Store"}
                    </span>
                  </button>
                </div>
              </form>
              {isDownload ? (
                ""
              ) : (
                <div className="sm:mx-auto sm:max-w-lg">
                  {storedSecrets.map((secret) => (
                    <div
                      key={secret}
                      className="flex items-center justify-between px-3 py-2 mt-2 bg-white font-semibold rounded-md shadow-sm"
                    >
                      {secret}
                      <button
                        type="button"
                        onClick={() => handleCopyHash(secret)}
                        className="bg-slate-50 text-gray-600 p-1 rounded-lg hover:bg-slate-200 hover:text-gray-900 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-6 h-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
