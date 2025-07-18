// Create and style the report issue button
const reportButton = document.createElement('div');
reportButton.id = 'report-issue-button';
reportButton.innerHTML = '<i class="fas fa-pen-square"></i>';
reportButton.title = 'Spotted an error or a missing doc? Open a GitHub issue';

// Style the button
reportButton.style.cssText = `
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 124, 186, 0.3);
  transition: all 0.3s ease;
  z-index: 9999;
  font-size: 20px;
`;


// Add click functionality
reportButton.addEventListener('click', function () {
  const currentUrl = window.location.href;
  const githubIssueUrl = "https://github.com/zkoss/zkdoc/issues/new";
  const issueTemplate = "template=document-issue.md";
  const titleText = `Issue at ${currentUrl}`;
  const titleParam = `title=${encodeURIComponent(titleText)}`;
  const url = `${githubIssueUrl}?${issueTemplate}&${titleParam}`;
  window.open(url, '_blank');
});

// Add button to page when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    document.body.appendChild(reportButton);
  });
} else {
  document.body.appendChild(reportButton);
}