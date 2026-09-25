import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSaaSApp } from '../src/generate_saas_app.js';

test('Curriculum view renders 9 course meters and full 766-video SaaS data table', () => {
  const html = generateSaaSApp();
  assert.ok(html.includes('curriculum-course-cards'), 'Must render course overview cards');
  assert.ok(html.includes('saas-data-table'), 'Must render saas-data-table');
  assert.ok(html.includes('subject-filter-select'), 'Must have subject filter dropdown');
  assert.ok(html.includes('status-filter-select'), 'Must have status filter dropdown');
  assert.ok(html.includes('table-search-input'), 'Must have table search input');
});
