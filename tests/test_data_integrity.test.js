import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('playlists_data_tr.json contains all 9 verified subjects and 766 total videos', () => {
  const data = JSON.parse(fs.readFileSync('playlists_data_tr.json', 'utf8'));
  const subjects = Object.keys(data);
  assert.equal(subjects.length, 9);
  
  const expectedInstructors = {
    "TYT Türkçe": "Aker Kartal",
    "TYT-AYT Tarih": "Mehmet Celal Özyıldız",
    "TYT Coğrafya": "Yunus Hoca (Coğrafyanın Kodları)",
    "AYT Coğrafya": "Yunus Hoca (Coğrafyanın Kodları)",
    "TYT Matematik": "Selim Yüksel (Bıyıklı Matematik)",
    "TYT Biyoloji": "Semih Hoca (Biosem)",
    "TYT Fizik": "Altuğ Güneş (Fizikfinito)",
    "TYT Kimya": "Mesut Hoca (Meschemy Kimya)",
    "AYT Edebiyat": "Deniz Hoca"
  };

  const expectedCounts = {
    "TYT Türkçe": 71,
    "TYT-AYT Tarih": 166,
    "TYT Coğrafya": 60,
    "AYT Coğrafya": 54,
    "TYT Matematik": 118,
    "TYT Biyoloji": 80,
    "TYT Fizik": 76,
    "TYT Kimya": 79,
    "AYT Edebiyat": 62
  };

  let totalVideos = 0;
  for (const [subj, info] of Object.entries(data)) {
    assert.equal(info.metadata.instructor, expectedInstructors[subj]);
    assert.equal(info.videos.length, expectedCounts[subj]);
    totalVideos += info.videos.length;
    for (const v of info.videos) {
      assert.ok(v.title, `Video missing title in ${subj}`);
      assert.ok(v.duration_min >= 0, `Video missing duration in ${subj}`);
      assert.ok(v.url.startsWith('https://www.youtube.com/watch?v='), `Invalid URL in ${subj}`);
    }
  }
  assert.equal(totalVideos, 766);
});
