import React from 'react'

export default function ChangePassword() {
  return (
    <div>
      <div className="">
        <h1 className="text-2xl  mb-4">How to Change Your Password</h1>

        <div>
          <h2 className="text-2xl mb-4">
            Follow these steps to change your password:
          </h2>

          <p className=" mb-4">
            Changing your password regularly is an important step in securing
            your account. Here's how you can update your password:
          </p>

          <ol className="list-decimal list-inside mb-6">
            <li>Log in to your account.</li>
            <li>
              Navigate to your <strong>Account Settings</strong>.
            </li>
            <li>
              Select the <strong>"Change Password"</strong> option.
            </li>
            <li>Enter your current password.</li>
            <li>
              Choose a new password, ensuring it is strong and secure (mix of
              uppercase, lowercase, numbers, and special characters).
            </li>
            <li>Confirm the new password by entering it again.</li>
            <li>
              Click the <strong>"Save"</strong> or <strong>"Update"</strong>{" "}
              button to finalize the change.
            </li>
            <li>
              For added security, log out and log back in using your new
              password.
            </li>
          </ol>
          <h3 className="text-xl font-semibold  mt-6 mb-4">
            Tips for a Strong Password:
          </h3>
          <p className=" mb-6">
            If you encounter any issues, feel free to contact our support team
            for assistance.
            <a
              href="mailto:support@alle-ai.com"
              className="text-blue-600 font-medium underline ml-1 hover:text-blue-800 transition-colors duration-300"
            >
              support@alle-ai.com
            </a>
          </p>

          <ul className="list-disc list-inside ">
            <li>
              Avoid using easily guessable information like your name or
              birthdate.
            </li>
            <li>
              Use a mix of uppercase, lowercase, numbers, and special
              characters.
            </li>
            <li>
              Consider using a password manager to securely store your
              passwords.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
