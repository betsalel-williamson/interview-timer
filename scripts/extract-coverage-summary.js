#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  // Read the coverage output log
  const logPath = path.join(__dirname, '..', 'coverage-output.log');

  if (!fs.existsSync(logPath)) {
    console.error('Coverage output log not found');
    process.exit(1);
  }

  const logContent = fs.readFileSync(logPath, 'utf8');

  // Extract both the detailed coverage report and summary
  const lines = logContent.split('\n');

  // Find the detailed coverage report section
  const reportStartIndex = lines.findIndex((line) =>
    line.includes('% Coverage report from v8')
  );
  const summaryStartIndex = lines.findIndex((line) =>
    line.includes('Coverage summary')
  );

  if (reportStartIndex === -1 || summaryStartIndex === -1) {
    console.error('Coverage report or summary not found in output');
    process.exit(1);
  }

  // Extract the detailed coverage report table
  const reportLines = [];
  let i = reportStartIndex;

  // Include the header line
  reportLines.push(lines[i]);
  i++;

  // Include the separator line
  if (i < lines.length) {
    reportLines.push(lines[i]);
    i++;
  }

  // Include all the file coverage lines until we hit the summary
  while (i < lines.length && i < summaryStartIndex) {
    if (lines[i].trim() !== '') {
      reportLines.push(lines[i]);
    }
    i++;
  }

  // Extract the summary lines (from "Coverage summary" to the end of the summary)
  const summaryLines = [];
  i = summaryStartIndex;

  while (
    i < lines.length &&
    !lines[i].includes(
      '================================================================================'
    )
  ) {
    summaryLines.push(lines[i]);
    i++;
  }

  // Add the final line with the equals signs
  if (i < lines.length) {
    summaryLines.push(lines[i]);
  }

  // Combine both sections
  const fullReport = [...reportLines, '', ...summaryLines].join('\n');

  // Write the summary to a file
  const summaryPath = path.join(
    __dirname,
    '..',
    'coverage',
    'coverage-summary.txt'
  );

  // Ensure coverage directory exists
  const coverageDir = path.dirname(summaryPath);
  if (!fs.existsSync(coverageDir)) {
    fs.mkdirSync(coverageDir, { recursive: true });
  }

  fs.writeFileSync(summaryPath, fullReport);

  console.log('Coverage report extracted successfully');
  console.log(fullReport);
} catch (error) {
  console.error('Error extracting coverage summary:', error.message);
  process.exit(1);
}
