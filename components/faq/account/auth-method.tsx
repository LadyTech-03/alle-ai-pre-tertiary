import React from "react";

export default function AuthMethod() {
  return (
    <div>
      <section>
        <h2 className="text-2xl font-semibold mb-4">
          Can I change how I log in?
        </h2>
        <p className="text-md">
          {`   No, you cannot change your authentication method for now. Here's everything you
          need to know about managing your authentication options:`}
        </p>
      </section>
      {/* Available Methods Section */}
      <section>
        <h2 className="text-xl font-semibold mb-3">
          Available Authentication Methods
        </h2>
        <p className=" mb-2">
          We currently support the following authentication methods:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Email and password</li>
          <li>Oauth Authentication (Google )</li>
        </ul>
      </section>
    </div>
  );
}
