# TODO

## AI Analytics on Surveys

- [x] Generate AI-powered insights (summary, key findings, recommendations) for expired surveys using Gemini/OpenRouter
- [x] Populate `aiInsight.stats`, `summary`, `keyFindings`, `recommendations` on expiry
- [x] Surface insights on the survey results page (already handled by existing results route)

## Credit Cut on Publish

- [x] Deduct credits from surveyor wallet when publishing a survey
- [x] Deduct credits from surveyor wallet when publishing a blog
- [x] Block publish if balance is insufficient
- [x] Admin approve flow deducts credits on pending_review → published/active
- [x] Atomic balance check + deduction via `findOneAndUpdate` with `$gte` guard
- [x] 402 response includes `balance` and `required` fields for frontend

## Survey Expiry + Stats Pipeline (BullMQ + Redis)

- [x] Queue a job when a survey is created/published, scheduled at its `deadline`
- [x] On job completion: set survey status to `expired`, aggregate responses into `aiInsight.stats`
- [x] Handle edge cases: extended deadlines (reschedule), deleted surveys (remove job), restored surveys (re-schedule)
- [x] Re-schedule all published surveys on server boot
- [x] Graceful Redis — server starts even if Redis unavailable, worker disables itself
- [x] Disable restore button for published surveys in recycle bin
