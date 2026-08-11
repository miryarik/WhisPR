export function formatReviewAsMarkdown(review) {
  let md = `### 🤖 WhisPR Review\n\n${review.summary}\n\n`;

  if (review.issues.length === 0) {
    md += `✅ No issues found.`;
  } else {
    md += `**Issues found:**\n\n`;
    for (const issue of review.issues) {
      const emoji =
        issue.severity === "high"
          ? "🔴"
          : issue.severity === "medium"
            ? "🟡"
            : "🟢";
      md += `- ${emoji} **${issue.severity}**: ${issue.description}\n`;
    }
  }

  return md;
}
