// Shared map of jobId → { writeStdin, closeStdin } for active Docker processes.
// Only valid for the lifetime of a running job; entries are deleted on completion.
const activeJobs = new Map();

module.exports = activeJobs;
