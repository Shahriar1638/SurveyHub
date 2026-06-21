import ReportModal from "../UI/ReportModal";

export default function SurveyReport({ surveyId }) {
  return (
    <ReportModal url={`/api/surveys/${surveyId}/report`} title="Report Survey">
      <button className="btn btn-secondary btn-sm text-[--color-error] hover:bg-[--color-error-light] border-[--color-error]/20">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
        Report
      </button>
    </ReportModal>
  );
}
