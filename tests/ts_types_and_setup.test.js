import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execSync } from 'node:child_process';

test('tsconfig.json exists and enforces strict TypeScript configuration', () => {
  assert.ok(fs.existsSync('tsconfig.json'), 'tsconfig.json must exist');
  const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));

  assert.ok(tsconfig.compilerOptions, 'compilerOptions must be defined');
  assert.equal(tsconfig.compilerOptions.strict, true, 'strict mode must be true');
  assert.equal(tsconfig.compilerOptions.target, 'ES2022', 'target must be ES2022');
  assert.equal(tsconfig.compilerOptions.module, 'ESNext', 'module must be ESNext');
  assert.equal(tsconfig.compilerOptions.moduleResolution, 'bundler', 'moduleResolution must be bundler');
  assert.equal(tsconfig.compilerOptions.noImplicitAny, true, 'noImplicitAny must be true');
  assert.equal(tsconfig.compilerOptions.strictNullChecks, true, 'strictNullChecks must be true');
  assert.equal(tsconfig.compilerOptions.skipLibCheck, true, 'skipLibCheck must be true');
  assert.equal(tsconfig.compilerOptions.outDir, './dist', 'outDir must be ./dist');
  assert.equal(tsconfig.compilerOptions.rootDir, './src', 'rootDir must be ./src');
  assert.equal(tsconfig.compilerOptions.declaration, true, 'declaration must be true');

  assert.ok(Array.isArray(tsconfig.include), 'include must be an array');
  assert.ok(tsconfig.include.includes('src/**/*'), 'include must contain src/**/*');

  assert.ok(Array.isArray(tsconfig.exclude), 'exclude must be an array');
  assert.ok(tsconfig.exclude.includes('node_modules'), 'exclude must contain node_modules');
  assert.ok(tsconfig.exclude.includes('dist'), 'exclude must contain dist');
  assert.ok(tsconfig.exclude.includes('android'), 'exclude must contain android');
  assert.ok(tsconfig.exclude.includes('www'), 'exclude must contain www');
});

test('package.json contains TypeScript devDependency and typecheck script', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  assert.ok(pkg.devDependencies, 'devDependencies must exist');
  assert.ok(pkg.devDependencies.typescript, 'typescript must be in devDependencies');
  assert.ok(pkg.scripts, 'scripts must exist');
  assert.equal(pkg.scripts.typecheck, 'tsc --noEmit', 'typecheck script must run tsc --noEmit');
});

test('src/web/types.ts exists and exports all required domain contracts', () => {
  assert.ok(fs.existsSync('src/web/types.ts'), 'src/web/types.ts must exist');
  const content = fs.readFileSync('src/web/types.ts', 'utf8');

  // Verify all required exported contracts exist
  const requiredContracts = [
    'export interface Video',
    'export interface PlaylistInfo',
    'export type PlaylistsData',
    'export interface StudyBlock',
    'export interface DaySchedule',
    'export interface WeekSchedule',
    'export interface BackupPayload',
    'export interface TimerState',
    'export interface CourseProgress',
  ];

  for (const contract of requiredContracts) {
    assert.ok(
      content.includes(contract),
      `src/web/types.ts must export contract: ${contract}`
    );
  }

  // Verify specific fields on core interfaces
  assert.match(content, /duration_min:\s*number;/, 'Video must include duration_min: number');
  assert.match(content, /duration_sec:\s*number;/, 'Video must include duration_sec: number');
  assert.match(content, /isRestDay\?:\s*boolean;/, 'DaySchedule must include optional isRestDay');
  assert.match(content, /blocks\?:\s*StudyBlock\[\];/, 'DaySchedule must include optional blocks');
  assert.match(content, /completedVideos:\s*Record<string,\s*boolean>;/, 'BackupPayload must include completedVideos map');
  assert.match(content, /targetEndTime:\s*number;/, 'TimerState must include targetEndTime');
});

test('npx tsc --noEmit typecheck runs cleanly with 0 errors', () => {
  let output = '';
  try {
    output = execSync('npx tsc --noEmit', { encoding: 'utf8', stdio: 'pipe' });
  } catch (err) {
    assert.fail(`tsc --noEmit failed with error: ${err.message}\nOutput: ${err.stdout || ''}\n${err.stderr || ''}`);
  }
  assert.equal(output.trim(), '', 'Clean typecheck should produce empty output');
});

test('Sample mock and curriculum data conforms to domain type contracts', () => {
  // Mock Video
  const mockVideo = {
    id: 'test_vid_01',
    title: 'TYT Matematik Giriş',
    duration_min: 35,
    duration_sec: 2100,
    url: 'https://www.youtube.com/watch?v=test_vid_01',
    index: 0,
    order: 1
  };
  assert.equal(typeof mockVideo.id, 'string');
  assert.equal(typeof mockVideo.title, 'string');
  assert.equal(typeof mockVideo.duration_min, 'number');
  assert.equal(typeof mockVideo.duration_sec, 'number');
  assert.equal(typeof mockVideo.url, 'string');

  // Mock StudyBlock
  const mockBlock = {
    blockNum: 1,
    subject: 'TYT Matematik',
    instructor: 'Mert Hoca',
    video: mockVideo
  };
  assert.equal(typeof mockBlock.blockNum, 'number');
  assert.equal(typeof mockBlock.subject, 'string');
  assert.equal(mockBlock.video.id, 'test_vid_01');

  // Mock DaySchedule & WeekSchedule
  const mockDay = {
    dayName: 'Pazartesi',
    isRestDay: false,
    blocks: [mockBlock]
  };
  const mockSunday = {
    dayName: 'Pazar',
    isRestDay: true,
    blocks: []
  };
  const mockWeek = {
    weekNum: 1,
    days: [mockDay, mockSunday]
  };
  assert.equal(mockWeek.weekNum, 1);
  assert.equal(mockWeek.days.length, 2);
  assert.equal(mockWeek.days[1].isRestDay, true);

  // Mock BackupPayload
  const mockBackup = {
    appName: 'YKS 2027 Koçu',
    version: '1.0.0',
    exportedAt: '2026-09-24T12:00:00.000Z',
    completedCount: 1,
    completedVideos: { 'test_vid_01': true },
    activeWeek: 1,
    activeDay: 0
  };
  assert.equal(mockBackup.appName, 'YKS 2027 Koçu');
  assert.equal(mockBackup.completedVideos['test_vid_01'], true);

  // Mock TimerState
  const mockTimer = {
    duration: 1200,
    remaining: 1200,
    running: false,
    targetEndTime: 0
  };
  assert.equal(mockTimer.duration, 1200);
  assert.equal(mockTimer.running, false);

  // Mock CourseProgress
  const mockProgress = {
    subject: 'TYT Matematik',
    totalVideos: 100,
    completedVideos: 25,
    progressPct: 25
  };
  assert.equal(mockProgress.progressPct, 25);

  // Mock PlaylistsData and PlaylistInfo
  const mockPlaylists = {
    'TYT Türkçe': {
      title: 'TYT Türkçe',
      instructor: 'Aker Kartal',
      channel: 'Retro Yayıncılık',
      url: 'https://www.youtube.com/playlist?list=PL5w_hbb3voMkxc2sU0JxNY88-kZ8bVmxq',
      count: 1,
      duration_hours: 0.6,
      videos: [mockVideo]
    }
  };
  assert.equal(typeof mockPlaylists['TYT Türkçe'].title, 'string');
  assert.equal(mockPlaylists['TYT Türkçe'].videos.length, 1);

  // Real curriculum data validation against Video schema
  assert.ok(fs.existsSync('playlists_data_tr.json'), 'playlists_data_tr.json must exist');
  const playlists = JSON.parse(fs.readFileSync('playlists_data_tr.json', 'utf8'));

  let totalVideosCount = 0;
  const mappedPlaylists = {};

  for (const [subjectKey, raw] of Object.entries(playlists)) {
    assert.ok(Array.isArray(raw.videos), `${subjectKey} videos must be array`);
    const totalSec = raw.videos.reduce((sum, v) => sum + (v.duration_sec || 0), 0);

    mappedPlaylists[subjectKey] = {
      title: raw.metadata?.subject || subjectKey,
      instructor: raw.metadata?.instructor || (raw.videos[0]?.instructor ?? ''),
      channel: raw.metadata?.channel || (raw.videos[0]?.channel ?? ''),
      url: raw.metadata?.url || (raw.videos[0]?.url ?? ''),
      count: raw.videos.length,
      duration_hours: Number((totalSec / 3600).toFixed(1)),
      videos: raw.videos
    };

    for (const v of raw.videos) {
      assert.equal(typeof v.id, 'string', `video id must be string`);
      assert.equal(typeof v.title, 'string', `video title must be string`);
      assert.equal(typeof v.duration_min, 'number', `video duration_min must be number`);
      assert.equal(typeof v.duration_sec, 'number', `video duration_sec must be number`);
      assert.equal(typeof v.url, 'string', `video url must be string`);
      totalVideosCount++;
    }
  }

  assert.equal(totalVideosCount, 766, 'All 766 videos must conform to Video type');
  assert.equal(Object.keys(mappedPlaylists).length, 9, 'All 9 subjects conform to PlaylistsData');
});
