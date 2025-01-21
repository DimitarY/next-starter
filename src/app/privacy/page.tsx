import CookieConsentManagePreferences from "@/components/cookie-consent-manage-preferences";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

const cookiesData = [
  {
    name: "session_id",
    type: "Strictly Necessary",
    droppedWhen: "On login",
    duration: "Session",
    purpose: "Maintains user session",
    policyLink: "/privacy",
  },
  {
    name: "analytics_cookie",
    type: "Analytics",
    droppedWhen: "On first visit",
    duration: "3 year",
    purpose: "Tracks user interactions",
    policyLink: "/privacy",
  },
  {
    name: "marketing_pref",
    type: "Marketing",
    droppedWhen: "On preference update",
    duration: "6 months",
    purpose: "Stores marketing preferences",
    policyLink: "/privacy",
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="w-full bg-gray-100 py-12 dark:bg-gray-900">
      <div className="container mx-auto px-4 md:px-6">
        <article className="prose prose-lg prose-gray dark:prose-invert max-w-none space-y-4">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
            Privacy Policy
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            <em>Last updated: [Insert Date]</em>
            <br />
            This Privacy Policy explains how we collect, use, disclose, and
            protect your information when you use our Service. Please read this
            policy carefully to understand our practices regarding your data.
          </p>

          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
            1. Information We Collect
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            We collect various types of information to provide and improve our
            Service. This includes:
          </p>
          <ul className="list-inside list-disc space-y-2 text-gray-600 dark:text-gray-300">
            <li>
              <strong>Personal Data</strong>: Information such as your name,
              email address, and other identifiers.
            </li>
            <li>
              <strong>Usage Data</strong>: Details of your interactions with our
              Service, such as pages visited and time spent.
            </li>
            <li>
              <strong>Cookies</strong>: Small files stored on your device to
              enhance your experience on our site.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
            2. How We Use Your Information
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            The information we collect is used to:
          </p>
          <ul className="list-inside list-disc space-y-2 text-gray-600 dark:text-gray-300">
            <li>Provide, operate, and maintain our Service.</li>
            <li>Improve and personalize your experience on our site.</li>
            <li>Analyze usage to enhance the Service.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
            3. Data Sharing and Disclosure
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            We may share your information with third-party service providers for
            various purposes, including analytics, payment processing, and
            customer support.
          </p>

          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
            4. Data Security
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            We implement reasonable measures to protect your data from
            unauthorized access and disclosure. However, please remember that no
            method of transmission over the internet is 100% secure.
          </p>

          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
            5. Cookies and Similar Technologies
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            We use cookies to enhance your experience on our Service. The
            following table lists the types of cookies we use, their purpose,
            and retention periods:
          </p>

          {/* Cookies Table */}
          <Table className="w-full border border-gray-300 dark:border-gray-700">
            <TableHeader>
              <TableRow className="bg-gray-100 dark:bg-gray-800">
                <TableHead>Cookie</TableHead>
                <TableHead>Type of Cookie</TableHead>
                <TableHead>When is it Dropped?</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Privacy Policy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cookiesData.map((cookie, index) => (
                <TableRow key={index}>
                  <TableCell>{cookie.name}</TableCell>
                  <TableCell>{cookie.type}</TableCell>
                  <TableCell>{cookie.droppedWhen}</TableCell>
                  <TableCell>{cookie.duration}</TableCell>
                  <TableCell>{cookie.purpose}</TableCell>
                  <TableCell>
                    <Link
                      href={cookie.policyLink}
                      className="text-blue-500 underline dark:text-blue-400"
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <p className="mt-6 text-gray-600 dark:text-gray-300">
            Cookies are pieces of code that we transfer to your computer&#39;s
            hard disk for record-keeping purposes. The cookies listed as
            strictly necessary are required for the operation of the Service,
            such as cookies that enable you to log in to secure areas of the
            Service.
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            We use Analytics cookies to collect information to assess how our
            Service is used. We will only do so, however, only if you give us
            your consent to do so. <CookieConsentManagePreferences />
          </p>

          <p className="text-gray-600 dark:text-gray-300">
            Most browsers also allow you to change your cookie settings to block
            certain cookies. Depending on your mobile device and operating
            system, you may not be able to delete or block all cookies. Please
            note that if you choose to refuse all cookies you may not be able to
            use the full functionality of our Service.
          </p>

          <ul className="list-inside list-disc space-y-2 text-gray-600 dark:text-gray-300">
            <li>
              <Link
                href="https://support.microsoft.com/en-gb/help/278835/how-to-delete-cookie-files-in-internet-explorer"
                className="text-blue-500 underline dark:text-blue-400"
              >
                Cookie settings in Internet Explorer
              </Link>
            </li>
            <li>
              <Link
                href="https://support.mozilla.org/en-US/kb/cookies"
                className="text-blue-500 underline dark:text-blue-400"
              >
                Cookie settings in Firefox
              </Link>
            </li>
            <li>
              <Link
                href="https://support.google.com/chrome/answer/95647?hl=en"
                className="text-blue-500 underline dark:text-blue-400"
              >
                Cookie settings in Chrome
              </Link>
            </li>
            <li>
              <Link
                href="https://support.apple.com/en-gb/guide/safari/manage-cookies-and-website-data-sfri11471/mac"
                className="text-blue-500 underline dark:text-blue-400"
              >
                Cookie settings in Safari web
              </Link>
              {" and "}
              <Link
                href="https://support.apple.com/en-gb/HT201265"
                className="text-blue-500 underline dark:text-blue-400"
              >
                iOS
              </Link>
            </li>
          </ul>

          <p className="text-gray-600 dark:text-gray-300">
            If you would like to find out more about cookies and other similar
            technologies, please visit{" "}
            <Link
              href="https://allaboutcookies.org"
              className="text-blue-500 underline dark:text-blue-400"
            >
              allaboutcookies.org
            </Link>
            .
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            Please note that deleting or blocking cookies may not be effective
            for all types of tracking technologies, such as Local Storage
            Objects (LSOs) like HTML5.
          </p>
        </article>
      </div>
    </div>
  );
}
