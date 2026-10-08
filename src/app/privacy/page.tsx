export const metadata = { title: "Privacy" };
export default function Page() {
  return (
    <article className="prose">
      <p className="eyebrow">Your learning stays yours</p>
      <h1>Privacy</h1>
      <p>
        This application has no accounts, analytics, advertising, tracking
        scripts or application cookies. Learning data is stored locally in your
        browser under gcse-chemistry.progress.v1. Per-tab recovery drafts are
        kept in session storage under gcse-chemistry.pending.v1 and
        gcse-chemistry.conflict.v1.
      </p>
      <h2>What is saved</h2>
      <p>
        Course preferences, model settings, draft answers, responses, dates and
        question exposure are saved on this device. They are not sent to an
        application database. Opening a page makes ordinary requests to the
        server; the hosting provider may keep operational request logs.
      </p>
      <h2>Your controls</h2>
      <p>
        Preferences includes a download of your saved record and an explicit
        delete control. Deletion touches only this Chemistry app’s record.
        Clearing site data also removes it. Work does not synchronise between
        browsers or devices.
      </p>
      <h2>Limits</h2>
      <p>
        Other people using the same browser profile can access its saved
        learning. Downloads may contain your answers; store them privately. No
        personal details are needed to use the course.
      </p>
      <p>
        This notice describes the current implementation. The site operator
        should review it before public launch and update it before adding data
        collection.
      </p>
    </article>
  );
}
